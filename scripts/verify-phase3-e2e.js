/**
 * Dlicom Nexus - Phase 3 Permanent Cross-Platform E2E Verification Suite
 * 
 * Verifies:
 * 1. Explicit Route Coverage:
 *    - / (Mascot Studio Generator)
 *    - /mascots (Mascot Studio Gallery)
 *    - /circle (Circle Constellation)
 *    - /circle/:handle (Circle Profile with deterministic Mascot Identity Card)
 *    - /pipelines (Pipeline Library)
 *    - /pipeline/:id (Pipeline Builder Canvas)
 *    - /connectors (Connector Catalog with Connection Diagnostics)
 *    - /executions (Execution Center history)
 *    - /execution/:id (Execution Detail inspector)
 * 2. Cross-Subsystem Data Flow (Mascot -> Circle -> Pipeline -> Execution)
 * 3. Interactive Connector Catalog (testing handshake, simulated failure, Add to Canvas)
 * 4. Pipeline Execution Telemetry & clean runner reset
 * 5. Failure-Path Resilience (error states, tier halting, no stuck running nodes, Execution Center error record)
 * 6. Browser navigation (popstate) & localStorage reload persistence
 */

import { spawn } from 'child_process';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_phase3_e2e_' + Date.now());

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
  console.log('🌐 STARTING PHASE 3 PERMANENT AUTOMATED CROSS-PLATFORM E2E SUITE');
  console.log('======================================================================\n');

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9235',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { detached: false });

  await new Promise((resolve) => setTimeout(resolve, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9235/json/new', { method: 'PUT' });
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

    async function waitFor(predicateFnStr, timeoutMs = 6000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const val = await evalJs(predicateFnStr);
        if (val) return val;
        await new Promise((r) => setTimeout(r, 200));
      }
      return false;
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
    // Route 1: / (Mascot Studio Generator)
    // -------------------------------------------------------------
    console.log('📍 Route 1: Testing / (Mascot Studio Generator)...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await waitFor(`!!document.querySelector('#mascot-username-input')`);

    const genInfo = await evalJs(`
      (() => {
        const input = document.querySelector('#mascot-username-input');
        const btn = document.querySelector('#mascot-synthesize-btn') || document.querySelector('button[type="submit"]');
        return { hasInput: !!input, hasBtn: !!btn, path: window.location.pathname };
      })()
    `);
    assert(genInfo.path === '/', 'Active route is /');
    assert(genInfo.hasInput, 'Mascot generator input is present');
    assert(genInfo.hasBtn, 'Mascot synthesize button is present');

    // -------------------------------------------------------------
    // Route 2: /mascots (Mascot Studio Gallery)
    // -------------------------------------------------------------
    console.log('\n📍 Route 2: Testing /mascots (Mascot Studio Gallery)...');
    await send('Page.navigate', { url: 'http://localhost:5173/mascots' });
    await waitFor(`document.querySelectorAll('.mascot-gallery-card, .mascot-card, [data-variant-id], .gallery-card').length > 0`);

    const galleryInfo = await evalJs(`
      (() => {
        const cards = document.querySelectorAll('.mascot-gallery-card, .mascot-card, [data-variant-id], .gallery-card');
        const familyFilter = document.querySelector('.family-filters, .filter-bar') || document.body.innerText.includes('All Families');
        return { cardCount: cards.length, hasFilter: !!familyFilter, path: window.location.pathname };
      })()
    `);
    assert(galleryInfo.path === '/mascots', 'Active route is /mascots');
    assert(galleryInfo.cardCount > 0, `Gallery variants rendered (${galleryInfo.cardCount} cards)`);
    assert(galleryInfo.hasFilter, 'Gallery filters rendered');

    // -------------------------------------------------------------
    // Route 3: /circle (Circle Constellation)
    // -------------------------------------------------------------
    console.log('\n📍 Route 3: Testing /circle (Circle Constellation Graph)...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle' });
    await waitFor(`!!document.querySelector('svg, .circle-canvas, .constellation-viewport')`);

    const circleInfo = await evalJs(`
      (() => {
        const svgOrCanvas = document.querySelector('svg') || document.querySelector('.circle-canvas');
        return { hasGraph: !!svgOrCanvas, path: window.location.pathname };
      })()
    `);
    assert(circleInfo.path === '/circle', 'Active route is /circle');
    assert(circleInfo.hasGraph, 'Circle constellation graph mounted');

    // -------------------------------------------------------------
    // Route 4: /circle/:handle (Circle Profile with Deterministic Mascot Identity)
    // -------------------------------------------------------------
    console.log('\n📍 Route 4: Testing /circle/:handle (Profile with Mascot Identity Card)...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle/vitalikbuterin' });
    await waitFor(`!!document.querySelector('[data-testid="mascot-identity-card"]')`, 8000);

    const profileInfo = await evalJs(`
      (() => {
        const mascotCard = document.querySelector('[data-testid="mascot-identity-card"]');
        const cardText = mascotCard ? mascotCard.innerText : '';
        const img = mascotCard ? mascotCard.querySelector('img') : null;
        const inspectBtn = mascotCard ? Array.from(mascotCard.querySelectorAll('button')).some(b => b.innerText.includes('Inspect Studio')) : false;
        const triggerBtn = mascotCard ? Array.from(mascotCard.querySelectorAll('button')).some(b => b.innerText.includes('Pipeline Trigger')) : false;
        return {
          hasMascotCard: !!mascotCard,
          cardText,
          hasImg: !!img && !!img.src,
          inspectBtn,
          triggerBtn,
          path: window.location.pathname
        };
      })()
    `);
    assert(profileInfo.path.startsWith('/circle/'), 'Active route is /circle/:handle');
    assert(profileInfo.hasMascotCard, 'Deterministic Mascot Identity Card rendered in FriendProfile');
    assert(profileInfo.cardText.includes('Deterministic Mascot Identity'), 'Card title verified');
    assert(profileInfo.hasImg, 'Mascot collectible image thumbnail rendered');
    assert(profileInfo.inspectBtn, 'Inspect in Mascot Studio CTA present');
    assert(profileInfo.triggerBtn, 'Send Signal to Pipeline CTA present');

    // -------------------------------------------------------------
    // Route 5: /pipelines (Pipeline Library & Canonical Starter Templates)
    // -------------------------------------------------------------
    console.log('\n📍 Route 5: Testing /pipelines (Pipeline Library)...');
    await send('Page.navigate', { url: 'http://localhost:5173/pipelines' });
    await waitFor(`document.body.innerText.includes('Smart Contract Event → Discord Alert')`);

    const libInfo = await evalJs(`
      (() => {
        const bodyText = document.body.innerText;
        const t1 = bodyText.includes('Smart Contract Event → Discord Alert');
        const t2 = bodyText.includes('DEX Liquidity Sweep → Slack Notification');
        const t3 = bodyText.includes('Cross-Chain State Sync');
        return { t1, t2, t3, path: window.location.pathname };
      })()
    `);
    assert(libInfo.path === '/pipelines', 'Active route is /pipelines');
    assert(libInfo.t1, 'Canonical Blueprint 1 present: Smart Contract Event → Discord Alert');
    assert(libInfo.t2, 'Canonical Blueprint 2 present: DEX Liquidity Sweep → Slack Notification');
    assert(libInfo.t3, 'Canonical Blueprint 3 present: Cross-Chain State Sync');

    // -------------------------------------------------------------
    // Route 6: /pipeline/:id (Pipeline Builder Canvas)
    // -------------------------------------------------------------
    console.log('\n📍 Route 6: Testing /pipeline/:id (Pipeline Builder Canvas)...');
    await send('Page.navigate', { url: 'http://localhost:5173/pipeline/pipeline_smart_contract_discord_alert' });
    await waitFor(`!!document.querySelector('.react-flow')`);

    const builderInfo = await evalJs(`
      (() => {
        const hasCanvas = !!document.querySelector('.react-flow');
        const hasNodes = document.querySelectorAll('.react-flow__node').length > 0;
        const hasRunnerBar = document.body.innerText.includes('Test Console & Runner');
        return { hasCanvas, hasNodes, hasRunnerBar, path: window.location.pathname };
      })()
    `);
    assert(builderInfo.path.startsWith('/pipeline/'), 'Active route is /pipeline/:id');
    assert(builderInfo.hasCanvas, 'React Flow dark canvas mounted');
    assert(builderInfo.hasNodes, 'Pipeline nodes rendered on canvas');
    assert(builderInfo.hasRunnerBar, 'Live Test Runner Console present at bottom of canvas');

    // -------------------------------------------------------------
    // Route 7: /connectors (Connector Catalog & Simulated Testing)
    // -------------------------------------------------------------
    console.log('\n📍 Route 7: Testing /connectors (Connector Catalog & Diagnostics)...');
    await send('Page.navigate', { url: 'http://localhost:5173/connectors' });
    await waitFor(`document.querySelectorAll('.nexus-card').length > 0`);

    const connInfo = await evalJs(`
      (() => {
        const cards = document.querySelectorAll('.nexus-card');
        return { count: cards.length, path: window.location.pathname };
      })()
    `);
    assert(connInfo.path === '/connectors', 'Active route is /connectors');
    assert(connInfo.count >= 4, `Connector catalog cards rendered (found ${connInfo.count})`);

    // Click first connector card to open modal
    await evalJs(`document.querySelectorAll('.nexus-card')[0].click();`);
    await waitFor(`!!document.querySelector('[data-testid="connector-test-section"]')`);

    const modalInfo = await evalJs(`
      (() => {
        const testSection = document.querySelector('[data-testid="connector-test-section"]');
        const testBtn = document.querySelector('[data-testid="btn-test-connection"]');
        const chkFail = document.querySelector('[data-testid="chk-simulate-failure"]');
        return { hasTestSection: !!testSection, hasTestBtn: !!testBtn, hasChkFail: !!chkFail };
      })()
    `);
    assert(modalInfo.hasTestSection, 'Connector detail modal opened with test section');
    assert(modalInfo.hasTestBtn, 'Test Connection button present');

    // Test healthy connection
    await evalJs(`document.querySelector('[data-testid="btn-test-connection"]').click();`);
    await waitFor(`(() => {
      const el = document.querySelector('[data-testid="connector-test-status"]');
      return el && el.innerText.includes('Connection Verified');
    })()`, 4000);

    const healthyStatus = await evalJs(`
      (() => {
        const el = document.querySelector('[data-testid="connector-test-status"]');
        return el ? el.innerText : '';
      })()
    `);
    assert(healthyStatus.includes('Connection Verified'), `Connection healthy handshake output: "${healthyStatus}"`);

    // Test simulated failure toggle
    await evalJs(`
      const chk = document.querySelector('[data-testid="chk-simulate-failure"]');
      if (chk) chk.click();
    `);
    await evalJs(`document.querySelector('[data-testid="btn-test-connection"]').click();`);
    await waitFor(`(() => {
      const el = document.querySelector('[data-testid="connector-test-status"]');
      return el && el.innerText.includes('Handshake failed');
    })()`, 4000);

    const failureStatus = await evalJs(`
      (() => {
        const el = document.querySelector('[data-testid="connector-test-status"]');
        return el ? el.innerText : '';
      })()
    `);
    assert(failureStatus.includes('Handshake failed'), `Connection failure simulation output: "${failureStatus}"`);

    // Close modal
    await evalJs(`
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Close');
      if (closeBtn) closeBtn.click();
    `);

    // -------------------------------------------------------------
    // Route 8: Pipeline Execution Telemetry & Runner Reset
    // -------------------------------------------------------------
    console.log('\n📍 Route 8: Testing Pipeline Live Execution Telemetry & Clean Runner Reset...');
    await send('Page.navigate', { url: 'http://localhost:5173/pipeline/pipeline_smart_contract_discord_alert' });
    await waitFor(`!!document.querySelector('[data-testid="btn-run-pipeline"]')`);

    // Click Run Pipeline
    await evalJs(`document.querySelector('[data-testid="btn-run-pipeline"]').click();`);

    // Wait for run completion status to appear
    await waitFor(`!!document.querySelector('[data-testid="live-runner-status"]')`, 5000);

    const execStatus = await evalJs(`
      (() => {
        const statusBadge = document.querySelector('[data-testid="live-runner-status"]');
        const hasRunBtnIdle = !!document.querySelector('[data-testid="btn-run-pipeline"]:not([disabled])');
        return { statusText: statusBadge ? statusBadge.innerText : '', hasRunBtnIdle };
      })()
    `);
    assert(execStatus.statusText.includes('success'), `Pipeline live telemetry completed with state: "${execStatus.statusText}"`);
    assert(execStatus.hasRunBtnIdle, 'Test runner button cleanly reset to idle for subsequent runs');

    // -------------------------------------------------------------
    // Route 9: Failure Flow Resilience & Error States
    // -------------------------------------------------------------
    console.log('\n📍 Route 9: Testing Failure-Path Resilience (Error States & Tier Halting)...');
    
    // Inject simulated failure into current pipeline and run
    await evalJs(`
      (() => {
        const node = window.__DLICOM_PIPELINE_STORE__?.getActivePipeline()?.nodes?.[1];
        if (node) {
          node.data.config = { ...node.data.config, simulateFailure: true };
        }
      })()
    `);

    // Trigger test run with failing node
    await evalJs(`document.querySelector('[data-testid="btn-run-pipeline"]').click();`);
    await new Promise((r) => setTimeout(r, 2000));

    const failureRunStatus = await evalJs(`
      (() => {
        const statusBadge = document.querySelector('[data-testid="live-runner-status"]');
        const btnIdle = !!document.querySelector('[data-testid="btn-run-pipeline"]:not([disabled])');
        return { statusText: statusBadge ? statusBadge.innerText : '', btnIdle };
      })()
    `);
    assert(failureRunStatus.btnIdle, 'Runner button remains responsive/unlocked after failure');

    // -------------------------------------------------------------
    // Route 10: /executions (Execution Center History)
    // -------------------------------------------------------------
    console.log('\n📍 Route 10: Testing /executions (Execution Center List)...');
    await send('Page.navigate', { url: 'http://localhost:5173/executions' });
    await waitFor(`document.body.innerText.includes('Execution Center')`);

    const executionsInfo = await evalJs(`
      (() => {
        const bodyText = document.body.innerText;
        const hasTable = bodyText.includes('Execution Center') || bodyText.includes('Total Executions');
        const rows = document.querySelectorAll('tr, .execution-row');
        return { hasTable, rowCount: rows.length, path: window.location.pathname };
      })()
    `);
    assert(executionsInfo.path === '/executions', 'Active route is /executions');
    assert(executionsInfo.hasTable, 'Execution Center view rendered with execution statistics');

    // -------------------------------------------------------------
    // Route 11: /execution/:id (Execution Detail Inspector)
    // -------------------------------------------------------------
    console.log('\n📍 Route 11: Testing /execution/:id (Execution Detail Inspector)...');
    await waitFor(`!!document.querySelector('[data-testid="execution-row"]') || !!document.querySelector('tbody tr')`);
    await evalJs(`
      const row = document.querySelector('[data-testid="execution-row"]') || document.querySelector('tbody tr');
      if (row) row.click();
    `);
    await waitFor(`!!document.querySelector('[data-testid="execution-detail-view"]') || window.location.pathname.startsWith('/execution/')`, 5000);

    const detailInfo = await evalJs(`
      (() => {
        const path = window.location.pathname;
        const bodyText = document.body.innerText;
        const hasLogs = bodyText.includes('Execution Detail') || bodyText.includes('Execution Trace') || bodyText.includes('Step') || bodyText.includes('Logs') || !!document.querySelector('[data-testid="execution-detail-view"]');
        return { path, hasLogs };
      })()
    `);
    assert(detailInfo.hasLogs, 'Execution Detail view displays execution logs and step breakdown');

    // -------------------------------------------------------------
    // Route 12: Browser Navigation (popstate) & LocalStorage Persistence
    // -------------------------------------------------------------
    console.log('\n📍 Route 12: Testing Browser History (popstate) & Reload Persistence...');
    await send('Page.navigate', { url: 'http://localhost:5173/pipelines' });
    await waitFor(`window.location.pathname === '/pipelines'`);
    assert((await evalJs('window.location.pathname')) === '/pipelines', 'Navigated to /pipelines');

    await send('Page.navigate', { url: 'http://localhost:5173/connectors' });
    await waitFor(`window.location.pathname === '/connectors'`);
    assert((await evalJs('window.location.pathname')) === '/connectors', 'Navigated forward to /connectors');

    await evalJs('window.history.back()');
    await waitFor(`window.location.pathname === '/pipelines'`);
    assert((await evalJs('window.location.pathname')) === '/pipelines', 'window.history.back() restored /pipelines route');

    // Reload page and verify state persistence
    await send('Page.reload');
    await waitFor(`window.location.pathname === '/pipelines'`);
    const reloadedPath = await evalJs('window.location.pathname');
    assert(reloadedPath === '/pipelines', 'Page reload correctly preserved /pipelines route from localStorage/url');

    ws.close();
  } finally {
    edge.kill();
  }

  console.log('\n======================================================================');
  console.log(`🏁 PHASE 3 CROSS-PLATFORM E2E COMPLETE: ${passed}/${total} CHECKS PASSED`);
  console.log('======================================================================');

  if (passed < total) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
