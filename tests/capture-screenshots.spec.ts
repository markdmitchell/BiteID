import { test } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\MarkD\\.gemini\\antigravity\\brain\\f0c1e343-7cb8-4050-8691-c8dd70fd7614';

test.describe('Capture Visual Screenshots', () => {
  test('Capture Desktop and Mobile Results Screenshots', async ({ page }) => {
    // 1. Desktop Screenshot
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/intake');
    await page.click('button:has-text("Use Sample Lesion Photo")');
    await page.click('button:has-text("Continue to Context")');
    await page.selectOption('select', 'US-VA');
    await page.click('button:has-text("Tall Grass / Woods")');
    await page.click('button:has-text("Continue to Safety Screening")');
    await page.click('button:has-text("Painless / Unnoticed")');
    await page.click('button:has-text("Run BiteID Triage")');
    await page.waitForURL(/\/results/);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'results_desktop.png'),
      fullPage: true,
    });

    // 2. Mobile Screenshot
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'results_mobile.png'),
      fullPage: true,
    });
  });
});
