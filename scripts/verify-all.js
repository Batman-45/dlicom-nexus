#!/usr/bin/env node

/**
 * Dlicom Nexus — Unified Master Verification Suite
 * Executes all 8 verification gates sequentially and reports a consolidated release verdict.
 */

import { spawn, spawnSync } from 'child_process';
import http from 'http';

function checkDevServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function runStep(name, command, args) {
  console.log(`\n======================================================================`);
  console.log(`🚀 RUNNING GATE: ${name}`);
  console.log(`Command: ${command} ${args.join(' ')}`);
  console.log(`======================================================================`);

  const startTime = Date.now();
  const res = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });

  const durationMs = Date.now() - startTime;
  if (res.status !== 0) {
    console.error(`\n❌ [GATE FAILED] ${name} (exited with code ${res.status}, duration: ${durationMs}ms)`);
    return { name, passed: false, durationMs };
  }

  console.log(`\n✅ [GATE PASSED] ${name} (${durationMs}ms)`);
  return { name, passed: true, durationMs };
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║       DLICOM NEXUS — MASTER RELEASE VERIFICATION RUNNER            ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  let devServerProcess = null;
  const isServerRunning = await checkDevServer();

  if (!isServerRunning) {
    console.log('\n[verify-all] Starting local Vite dev server for browser suites...');
    devServerProcess = spawn('npx', ['vite'], {
      shell: true,
      stdio: 'pipe'
    });

    // Wait for server to become responsive
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await checkDevServer()) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      console.error('[verify-all] Failed to launch local Vite dev server.');
      process.exit(1);
    }
    console.log('[verify-all] Vite dev server ready at http://localhost:5173');
  } else {
    console.log('[verify-all] Using existing running dev server at http://localhost:5173');
  }

  const results = [];

  try {
    // 1. Phase 1 Mascot Generator Suite
    results.push(runStep('Phase 1: Mascot Generator Determinism & Anti-Infringement', 'npm', ['run', 'verify:mascot-generator']));

    // 2. Phase 1 Mascot UI Audit
    results.push(runStep('Phase 1: Mascot Generator UI & Theme Contrast Audit', 'node', ['scripts/verify-mascot-ui.js']));

    // 3. Phase 2 Dlicom Hero Share Card, Export & Social Sharing Suite
    results.push(runStep('Phase 2: Dlicom Hero Share Card, Export & Social Sharing Suite', 'npm', ['run', 'verify:hero-sharing']));

    // 4. Official Superhero Mascot Visual QA Suite
    results.push(runStep('Superhero Profiles Visual QA & Navigation Suite', 'node', ['scripts/qa-superhero-profiles.js']));

    // 4. Strict TypeScript Compilation Check
    results.push(runStep('TypeScript: Strict Type Check (tsc --noEmit)', 'npx', ['tsc', '--noEmit']));

    // 5. Production Vite Bundle Build
    results.push(runStep('Production: Vite Packaging & Optimization (npm run build)', 'npm', ['run', 'build']));

  } finally {
    if (devServerProcess) {
      console.log('\n[verify-all] Shutting down background Vite dev server...');
      devServerProcess.kill();
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                     MASTER VERIFICATION SUMMARY                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  let allPassed = true;
  for (const r of results) {
    const mark = r.passed ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`  ${mark} ${r.name.padEnd(60)} (${r.durationMs}ms)`);
    if (!r.passed) allPassed = false;
  }

  console.log('══════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log(`🎉 ALL ${results.length}/${results.length} VERIFICATION GATES PASSED! SYSTEM READY FOR RELEASE.`);
    process.exit(0);
  } else {
    console.error(`🚨 VERIFICATION FAILED: One or more gates did not pass.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal master verification error:', err);
  process.exit(1);
});
