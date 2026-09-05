/**
 * Central test runner — executes all test modules and reports results.
 * Exit code 0 = all passed; non-zero = at least one failure.
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dir = path.dirname(fileURLToPath(import.meta.url));

const suites = [
  "test_amortization.mjs",
  "test_tax.mjs",
  "test_affordability.mjs",
  "test_pillar3a.mjs",
  "test_scorecard.mjs",
];

let failed = 0;
for (const suite of suites) {
  const file = path.join(__dir, suite);
  if (!existsSync(file)) {
    process.stdout.write(`\nSKIPPED ${suite} (file not found — not yet implemented)\n`);
    continue;
  }
  process.stdout.write(`\nRunning ${suite}...\n`);
  const result = spawnSync(process.execPath, [file], { stdio: "inherit" });
  if (result.status !== 0) {
    process.stderr.write(`FAILED: ${suite}\n`);
    failed++;
  }
}

if (failed === 0) {
  console.log("\nAll test suites passed.");
} else {
  console.error(`\n${failed} test suite(s) failed.`);
  process.exit(1);
}
