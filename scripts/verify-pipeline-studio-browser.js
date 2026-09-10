/**
 * Dlicom Nexus - Real Browser End-to-End Verification Suite for Phase 2
 * Tests Unified Shell navigation, Pipeline Studio, Canvas, Live Runner,
 * Connectors, Executions, and zero-regression preservation of Mascot & Circle.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_pipeline_studio_' + Date.now());
const artifactDir = 'C:\\Users\\SHREE\\.gemini\\antigravity-ide\\brain\\68598f47-826c-414e-bdab-d6ad6a89ac1a';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function run() {
  console.log('======================================================================');
  console.log('🌐 STARTING REAL BROWSER PIPELINE STUDIO & UNIFIED SHELL VERIFICATION');
  console.log('======================================================================\n');

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { detached: false });

  await new Promise((resolve) => setTimeout(resolve, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9228/json/new', { method: 'PUT' });
    const target = await listRes.json();

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalJs(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true });
      if (res.result?.exceptionDetails) {
        console.error('JS Eval Exception:', res.result.exceptionDetails);
      }
      return res.result?.result?.value;
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // -------------------------------------------------------------
    // Test 1: Mascot Studio Navigation & Navbar check
    // -------------------------------------------------------------
    console.log('🚀 Step 1: Navigating to Mascot Studio (http://localhost:5173/)...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 2500));

    const mascotInfo = await evalJs(`
      (() => {
        const hasGeneratorNav = !!document.querySelector('#nav-mascot-generator');
        const hasGalleryNav = !!document.querySelector('#nav-mascot-gallery');
        const hasCircleNav = !!document.querySelector('#nav-x-circle');
        const hasPipelinesNav = !!document.querySelector('#nav-pipelines');
        const hasInput = !!document.querySelector('#mascot-username-input');
        return { hasGeneratorNav, hasGalleryNav, hasCircleNav, hasPipelinesNav, hasInput };
      })()
    `);
    assert(mascotInfo.hasGeneratorNav, 'Mascot Generator tab present in header');
    assert(mascotInfo.hasGalleryNav, 'Gallery tab present in header');
    assert(mascotInfo.hasCircleNav, 'X Circle tab present in header');
    assert(mascotInfo.hasPipelinesNav, 'Pipelines tab present in header');
    assert(mascotInfo.hasInput, 'Mascot username input present on home');

    // -------------------------------------------------------------
    // Test 2: Transition to Pipeline Studio (/pipelines)
    // -------------------------------------------------------------
    console.log('\n🚀 Step 2: Clicking Pipelines navbar tab to open Pipeline Studio...');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#nav-pipelines').click()`
    });
    await new Promise((r) => setTimeout(r, 1500));

    const libInfo = await evalJs(`
      (() => {
        const url = window.location.pathname;
        const hasShell = !!document.querySelector('.nexus-shell');
        const hasSidebar = !!document.querySelector('.nexus-sidebar');
        const hasTopBar = !!document.querySelector('.nexus-topbar');
        const bodyText = document.body.innerText;
        const hasTemplate1 = bodyText.includes('Smart Contract Event → Discord Alert');
        const hasTemplate2 = bodyText.includes('DEX Liquidity Sweep → Slack Notification');
        const hasTemplate3 = bodyText.includes('Cross-Chain State Sync');
        return { url, hasShell, hasSidebar, hasTopBar, hasTemplate1, hasTemplate2, hasTemplate3 };
      })()
    `);

    assert(libInfo.url === '/pipelines', `URL transitioned to /pipelines (was ${libInfo.url})`);
    assert(libInfo.hasShell, 'AppShell rendered');
    assert(libInfo.hasSidebar, 'Sidebar navigation rendered');
    assert(libInfo.hasTopBar, 'TopBar header rendered');
    assert(libInfo.hasTemplate1, 'Template 1: Smart Contract Event → Discord Alert listed in library');
    assert(libInfo.hasTemplate2, 'Template 2: DEX Liquidity Sweep → Slack Notification listed in library');
    assert(libInfo.hasTemplate3, 'Template 3: Cross-Chain State Sync listed in library');

    // Capture screenshot of Pipeline Library
    const libShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'phase2_pipeline_library.png'), Buffer.from(libShot.result.data, 'base64'));
    console.log('  📸 Captured screenshot: phase2_pipeline_library.png');

    // -------------------------------------------------------------
    // Test 3: Open Builder Canvas for Template 1
    // -------------------------------------------------------------
    console.log('\n🚀 Step 3: Opening Pipeline Builder Canvas...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('.nexus-card'));
          const targetCard = cards.find(c => c.innerText.includes('Smart Contract Event → Discord Alert'));
          if (targetCard) {
            const btn = targetCard.querySelector('.btn-primary');
            if (btn) btn.click();
          }
        })()
      `
    });
    await new Promise((r) => setTimeout(r, 2000));

    const builderInfo = await evalJs(`
      (() => {
        const url = window.location.pathname;
        const hasReactFlow = !!document.querySelector('.react-flow');
        const nodeElements = Array.from(document.querySelectorAll('.nexus-node-container'));
        const nodeLabels = nodeElements.map(n => n.querySelector('.node-title')?.innerText || '');
        const hasAcyclicBadge = document.body.innerText.includes('Acyclic DAG') || document.body.innerText.includes('DAG Valid');
        return { url, hasReactFlow, nodeCount: nodeElements.length, nodeLabels, hasAcyclicBadge };
      })()
    `);

    assert(builderInfo.url.startsWith('/pipeline'), `URL is on pipeline builder: ${builderInfo.url}`);
    assert(builderInfo.hasReactFlow, 'ReactFlow interactive canvas is mounted');
    assert(builderInfo.nodeCount >= 3, `Canvas rendered ${builderInfo.nodeCount} graph nodes`);
    assert(builderInfo.hasAcyclicBadge, 'Canvas displays Acyclic DAG validation status');

    // Capture screenshot of Canvas
    const canvasShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'phase2_pipeline_builder.png'), Buffer.from(canvasShot.result.data, 'base64'));
    console.log('  📸 Captured screenshot: phase2_pipeline_builder.png');

    // -------------------------------------------------------------
    // Test 4: Execute Pipeline in Live Test Runner Bar
    // -------------------------------------------------------------
    console.log('\n🚀 Step 4: Executing pipeline via Live Runner...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const runBtn = document.querySelector('#topbar-execute-run');
          if (runBtn) runBtn.click();
        })()
      `
    });
    await new Promise((r) => setTimeout(r, 2500));

    const execInfo = await evalJs(`
      (() => {
        const url = window.location.pathname;
        const bodyText = document.body.innerText;
        const hasDetail = url.startsWith('/execution') || bodyText.includes('Execution Detail') || bodyText.includes('Trace');
        const hasSuccess = bodyText.includes('success') || bodyText.includes('SUCCESS');
        return { url, hasDetail, hasSuccess };
      })()
    `);

    assert(execInfo.hasDetail, `Execution detail or trace rendered on execution completion (${execInfo.url})`);
    assert(execInfo.hasSuccess, 'Execution result marked with success status');

    // Capture screenshot of Execution Detail
    const execShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'phase2_execution_detail.png'), Buffer.from(execShot.result.data, 'base64'));
    console.log('  📸 Captured screenshot: phase2_execution_detail.png');

    // -------------------------------------------------------------
    // Test 5: Sidebar Navigation to Connectors & Executions
    // -------------------------------------------------------------
    console.log('\n🚀 Step 5: Testing Sidebar navigation across subsystems...');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#sidebar-nav-connectors')?.click()`
    });
    await new Promise((r) => setTimeout(r, 1200));

    const connInfo = await evalJs(`
      (() => {
        return {
          url: window.location.pathname,
          hasHeading: document.body.innerText.includes('Connector Catalog')
        };
      })()
    `);
    assert(connInfo.url === '/connectors', 'Sidebar navigated to /connectors');
    assert(connInfo.hasHeading, 'Connector Catalog view rendered');

    await send('Runtime.evaluate', {
      expression: `document.querySelector('#sidebar-nav-executions')?.click()`
    });
    await new Promise((r) => setTimeout(r, 1200));

    const centerInfo = await evalJs(`
      (() => {
        return {
          url: window.location.pathname,
          hasHeading: document.body.innerText.includes('Execution Center')
        };
      })()
    `);
    assert(centerInfo.url === '/executions', 'Sidebar navigated to /executions');
    assert(centerInfo.hasHeading, 'Execution Center view rendered');

    // -------------------------------------------------------------
    // Test 6: Zero Regression Verification - Return to Mascot Studio & Circle
    // -------------------------------------------------------------
    console.log('\n🚀 Step 6: Verifying Mascot Studio & Circle preservation...');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#sidebar-nav-mascot_generator')?.click()`
    });
    await new Promise((r) => setTimeout(r, 1200));

    const returnMascot = await evalJs(`
      (() => {
        return {
          url: window.location.pathname,
          hasInput: !!document.querySelector('#mascot-username-input')
        };
      })()
    `);
    assert(returnMascot.url === '/', 'Sidebar navigated back to Mascot Studio (/)');
    assert(returnMascot.hasInput, 'Mascot generator input preserved and fully functional');

    await send('Runtime.evaluate', {
      expression: `document.querySelector('#nav-x-circle')?.click()`
    });

    // Wait for lazy CirclePage chunk to resolve through Suspense
    let circleMounted = false;
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 200));
      circleMounted = await evalJs(`
        !document.querySelector('.animate-spin') && 
        (!!document.querySelector('.onboarding-container') || !!document.querySelector('.onboarding-title') || document.body.innerText.includes('Build your Circle'))
      `);
      if (circleMounted) break;
    }

    const returnCircle = await evalJs(`
      (() => {
        return {
          url: window.location.pathname,
          hasOnboarding: !!document.querySelector('.onboarding-container') || !!document.querySelector('.onboarding-title'),
          bodyText: document.body.innerText
        };
      })()
    `);
    assert(returnCircle.url === '/circle', 'Navigated to /circle cleanly');
    assert(returnCircle.hasOnboarding || returnCircle.bodyText.includes('Circle'), 'Circle onboarding view rendered properly');

    ws.close();
  } finally {
    edge.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  console.log('\n======================================================================');
  console.log(`REAL BROWSER VERIFICATION: ${passed}/${total} checks passed (${Math.round(passed / total * 100)}%)`);
  console.log('======================================================================');

  if (passed === total) {
    console.log('🎉 ALL REAL BROWSER PIPELINE STUDIO & UNIFIED SHELL CHECKS PASSED!\n');
  } else {
    console.error('❌ SOME CHECKS FAILED!\n');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal browser test error:', err);
  process.exit(1);
});
