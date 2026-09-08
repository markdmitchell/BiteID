import { test, expect } from '@playwright/test';

test.describe('BiteID Multimodal Triage End-to-End Suite', () => {
  test('Scenario A: Red-Flag Emergency Interception Modal blocks completion', async ({ page }) => {
    await page.goto('/intake');

    // Step 1: Photos -> Continue
    await page.click('button:has-text("Use Sample Lesion Photo")');
    await page.click('button:has-text("Continue to Context")');

    // Step 2: Context -> Continue
    await page.selectOption('select', 'US-VA');
    await page.click('button:has-text("Tall Grass / Woods")');
    await page.click('button:has-text("Continue to Safety Screening")');

    // Step 3: Toggle Emergency Symptom "Difficulty breathing"
    const redFlagCheckbox = page.locator('label:has-text("Difficulty breathing") input[type="checkbox"]');
    await redFlagCheckbox.check();

    // Verify Emergency Modal launches automatically
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Red-Flag Emergency Interception');
    await expect(modal).toContainText('Difficulty breathing or wheezing');

    // Verify Emergency Quick-Dial links are present
    const call911Link = page.locator('a[href="tel:911"]');
    await expect(call911Link).toBeVisible();

    const poisonControlLink = page.locator('a[href="tel:18002221222"]');
    await expect(poisonControlLink).toBeVisible();
  });

  test('Scenario B: Happy Path Triage -> Navigates to /results with matched factors', async ({ page }) => {
    await page.goto('/intake');

    // Step 1: Attach Sample Lesion
    await page.click('button:has-text("Use Sample Lesion Photo")');
    await page.click('button:has-text("Continue to Context")');

    // Step 2: Set Context (US-VA, Tall Grass, June)
    await page.selectOption('select', 'US-VA');
    await page.click('button:has-text("Tall Grass / Woods")');
    await page.click('button:has-text("Continue to Safety Screening")');

    // Step 3: Select Sensation ("Painless / Unnoticed") and submit without red flags
    await page.click('button:has-text("Painless / Unnoticed")');
    await page.click('button:has-text("Run BiteID Triage")');

    // Verify Navigation to /results
    await expect(page).toHaveURL(/\/results/);

    // Verify Top Candidate Card and Matched Factors
    await expect(page.locator('h1')).toContainText('Tick');
    await expect(page.locator('text=Vector Suspect Leaderboard')).toBeVisible();
    await expect(page.locator('text=Contextual Match Factor Grid')).toBeVisible();
    await expect(page.locator('text=Clinical Summary Card')).toBeVisible();
  });

  test('Scenario C: Visual Reference Comparison Modal opens & switches skin tone filters', async ({ page }) => {
    await page.goto('/intake');
    await page.click('button:has-text("Use Sample Lesion Photo")');
    await page.click('button:has-text("Continue to Context")');
    await page.click('button:has-text("Continue to Safety Screening")');
    await page.click('button:has-text("Run BiteID Triage")');
    await page.waitForURL(/\/results/);

    // Click "Compare Visual References" button
    await page.click('button:has-text("Compare Visual References")');

    // Verify Reference Comparison Modal displays
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Visual Reference Comparison');
    await expect(modal).toContainText('Non-Diagnostic Educational Guardrail');

    // Switch Fitzpatrick skin tone filter to Types V - VI
    await page.click('button:has-text("Types V - VI")');
    await expect(modal).toContainText('Deep / Dark');
  });
});
