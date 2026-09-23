#!/usr/bin/env node

/**
 * Regression Test Suite: Critter & Bite Pattern Image Completeness
 *
 * Verifies that:
 * 1. Every vector in VECTOR_DATABASE (src/lib/geo-pest.server.ts) has an associated creature image in CREATURE_REFERENCES (src/lib/creature-images.ts).
 * 2. Every creature image exists on disk, is readable, and is non-empty (>1KB).
 * 3. Every vector has reaction pattern images across all 3 Fitzpatrick tone tiers (I/II, III/IV, V/VI) in BITE_PATTERNS (src/lib/bite-pattern-images.ts).
 * 4. All temporal evolution stages (early, peak, late) defined for vectors have valid, existing images across all 3 tones.
 * 5. General fallback reaction images exist on disk.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const GEO_PEST_PATH = path.join(ROOT, "src", "lib", "geo-pest.server.ts");
const CREATURE_IMAGES_PATH = path.join(ROOT, "src", "lib", "creature-images.ts");
const BITE_PATTERNS_PATH = path.join(ROOT, "src", "lib", "bite-pattern-images.ts");

console.log("\n=======================================================");
console.log("  BiteID Critter & Reaction Image Regression Test Suite ");
console.log("=======================================================\n");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName} - ${details}`);
    failures.push({ testName, details });
  }
}

function resolveAssetPath(importString) {
  // Converts "@/assets/..." or "../assets/..." to absolute filesystem path
  const cleaned = importString.replace(/^@\//, "src/").replace(/['";]/g, "").trim();
  return path.join(ROOT, cleaned);
}

// 1. Parse VECTOR_DATABASE to find all vector IDs
const geoPestContent = fs.readFileSync(GEO_PEST_PATH, "utf-8");
const vectorIdRegex = /^\s*([a-z0-9_]+):\s*{\s*\n\s*id:\s*["']([a-z0-9_]+)["']/gm;
const vectorIds = [];
let match;
while ((match = vectorIdRegex.exec(geoPestContent)) !== null) {
  const [, key, id] = match;
  if (id === key) {
    vectorIds.push(id);
  }
}

console.log(
  `Found \x1b[36m${vectorIds.length}\x1b[0m registered species vectors in VECTOR_DATABASE.\n`,
);
assert(
  vectorIds.length === 37,
  "Vector count in database equals 37 expected species",
  `Found ${vectorIds.length}`,
);

// 2. Parse CREATURE_REFERENCES and imports from creature-images.ts
const creatureContent = fs.readFileSync(CREATURE_IMAGES_PATH, "utf-8");
const creatureImportRegex = /import\s+([a-zA-Z0-9_]+)\s+from\s+["']([^"']+)["']/g;
const creatureImports = {};
while ((match = creatureImportRegex.exec(creatureContent)) !== null) {
  const [, varName, assetPath] = match;
  creatureImports[varName] = assetPath;
}

// Parse the CREATURE_REFERENCES map
const creatureMapRegex = /([a-z0-9_]+):\s*{\s*src:\s*([a-zA-Z0-9_]+)/g;
const creatureMap = {};
while ((match = creatureMapRegex.exec(creatureContent)) !== null) {
  const [, vectorId, varName] = match;
  creatureMap[vectorId] = varName;
}

console.log("\n--- Category 1: Specimen / Critter Reference Photos ---");
for (const vectorId of vectorIds) {
  const varName = creatureMap[vectorId];
  const hasEntry = Boolean(varName);
  assert(
    hasEntry,
    `[Creature Registry] Entry exists for vector: ${vectorId}`,
    `Missing mapping in CREATURE_REFERENCES`,
  );

  if (hasEntry) {
    const assetPath = creatureImports[varName];
    assert(
      Boolean(assetPath),
      `[Creature Import] Import exists for variable: ${varName}`,
      `Missing import`,
    );

    if (assetPath) {
      const fullPath = resolveAssetPath(assetPath);
      const exists = fs.existsSync(fullPath);
      let sizeOk = false;
      let sizeKb = 0;
      if (exists) {
        const stats = fs.statSync(fullPath);
        sizeKb = Math.round(stats.size / 1024);
        sizeOk = stats.size > 1024; // At least 1KB
      }
      assert(
        exists && sizeOk,
        `[Creature File] Image file exists & valid for ${vectorId} (${path.basename(fullPath)}, ${sizeKb}KB)`,
        `Path: ${fullPath}, exists: ${exists}, sizeOk: ${sizeOk}`,
      );
    }
  }
}

// 3. Parse BITE_PATTERNS from bite-pattern-images.ts
const bitePatternContent = fs.readFileSync(BITE_PATTERNS_PATH, "utf-8");
const biteImportRegex = /import\s+([a-zA-Z0-9_]+)\s+from\s+["']([^"']+)["']/g;
const biteImports = {};
while ((match = biteImportRegex.exec(bitePatternContent)) !== null) {
  const [, varName, assetPath] = match;
  biteImports[varName] = assetPath;
}

console.log("\n--- Category 2: General Reaction Tone Fallbacks ---");
const fallbackVars = ["generalIii", "generalIiiIv", "generalVvi"];
for (const fv of fallbackVars) {
  const assetPath = biteImports[fv];
  assert(Boolean(assetPath), `[Fallback Import] Import exists for: ${fv}`);
  if (assetPath) {
    const fullPath = resolveAssetPath(assetPath);
    const exists = fs.existsSync(fullPath);
    const stats = exists ? fs.statSync(fullPath) : null;
    const sizeKb = stats ? Math.round(stats.size / 1024) : 0;
    assert(
      exists && stats.size > 1024,
      `[Fallback File] Exists & valid: ${path.basename(fullPath)} (${sizeKb}KB)`,
    );
  }
}

console.log("\n--- Category 3: Fitzpatrick Tone-Specific Bite Pattern Images ---");
// Check that each vectorId has pattern entry and images for "i-ii", "iii-iv", "v-vi"
for (const vectorId of vectorIds) {
  // Regex to match the vector block in BITE_PATTERNS
  const vectorBlockRegex = new RegExp(`${vectorId}:\\s*{[\\s\\S]*?images:\\s*{([\\s\\S]*?)}`, "m");
  const blockMatch = vectorBlockRegex.exec(bitePatternContent);

  assert(Boolean(blockMatch), `[Bite Pattern Registry] Entry exists for vector: ${vectorId}`);

  if (blockMatch) {
    const imagesBlock = blockMatch[1];
    const tones = [
      { key: "i-ii", label: "Fitzpatrick I–II (Fair / Mild erythema)" },
      { key: "iii-iv", label: "Fitzpatrick III–IV (Medium / Tan / Olive)" },
      { key: "v-vi", label: "Fitzpatrick V–VI (Deep / Melanin-rich / Post-inflammatory)" },
    ];

    for (const tone of tones) {
      const toneRegex = new RegExp(`["']?${tone.key}["']?:\\s*([a-zA-Z0-9_]+)`);
      const toneMatch = toneRegex.exec(imagesBlock);
      assert(Boolean(toneMatch), `[Tone Entry ${tone.key}] Configured for ${vectorId}`);

      if (toneMatch) {
        const varName = toneMatch[1];
        const assetPath = biteImports[varName];
        assert(
          Boolean(assetPath),
          `[Tone Import] Variable ${varName} imported for ${vectorId} [${tone.key}]`,
        );

        if (assetPath) {
          const fullPath = resolveAssetPath(assetPath);
          const exists = fs.existsSync(fullPath);
          let sizeOk = false;
          let sizeKb = 0;
          if (exists) {
            const stats = fs.statSync(fullPath);
            sizeKb = Math.round(stats.size / 1024);
            sizeOk = stats.size > 1024;
          }
          assert(
            exists && sizeOk,
            `[Tone File ${tone.key}] Image valid for ${vectorId} (${path.basename(fullPath)}, ${sizeKb}KB)`,
            `File: ${fullPath}`,
          );
        }
      }
    }
  }
}

console.log("\n--- Category 4: Temporal Progression Timeline Images ---");
const temporalSpecies = ["brown_recluse", "erythema_migrans", "fire_ant", "pit_viper", "jellyfish"];
for (const species of temporalSpecies) {
  const speciesIdx = bitePatternContent.indexOf(`${species}: {`);
  assert(speciesIdx !== -1, `[Temporal Registry] Vector block found for ${species}`);

  if (speciesIdx !== -1) {
    const afterSpecies = bitePatternContent.slice(speciesIdx);
    const tempIdx = afterSpecies.indexOf("temporalStages: {");
    assert(tempIdx !== -1, `[Temporal Progression] Stages defined for ${species}`);

    if (tempIdx !== -1) {
      // Find the slice of temporal stages up to next vector
      const stagesSlice = afterSpecies.slice(tempIdx, tempIdx + 2500);
      const stages = ["early", "peak", "late"];
      for (const stage of stages) {
        const stageIdx = stagesSlice.indexOf(`${stage}: {`);
        assert(stageIdx !== -1, `[Temporal Stage ${stage}] Configured for ${species}`);

        if (stageIdx !== -1) {
          const stageChunk = stagesSlice.slice(stageIdx, stageIdx + 700);
          for (const toneKey of ["i-ii", "iii-iv", "v-vi"]) {
            const tRegex = new RegExp(`["']?${toneKey}["']?:\\s*([a-zA-Z0-9_]+)`);
            const tMatch = tRegex.exec(stageChunk);
            assert(
              Boolean(tMatch),
              `[Temporal ${species} ${stage} ${toneKey}] Image mapped in stage chunk`,
            );

            if (tMatch) {
              const varName = tMatch[1];
              const assetPath = biteImports[varName];
              assert(Boolean(assetPath), `[Temporal Import] Variable ${varName} imported`);

              if (assetPath) {
                const fullPath = resolveAssetPath(assetPath);
                const exists = fs.existsSync(fullPath);
                let sizeOk = false;
                let sizeKb = 0;
                if (exists) {
                  const stats = fs.statSync(fullPath);
                  sizeKb = Math.round(stats.size / 1024);
                  sizeOk = stats.size > 1024;
                }
                assert(
                  exists && sizeOk,
                  `[Temporal File ${species} ${stage} ${toneKey}] Valid: ${path.basename(fullPath)} (${sizeKb}KB)`,
                  `Path: ${fullPath}`,
                );
              }
            }
          }
        }
      }
    }
  }
}

console.log("\n=======================================================");
console.log(
  `  Results: ${passedTests} passed, ${failedTests} failed out of ${totalTests} assertions.`,
);
console.log("=======================================================\n");

if (failedTests > 0) {
  console.error(`\x1b[31mCRITICAL REGRESSION FAILURE: ${failedTests} test(s) failed!\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(
    "\x1b[32mALL REGRESSION TESTS PASSED! 100% of species vectors and reaction tones have verified images.\x1b[0m\n",
  );
  process.exit(0);
}
