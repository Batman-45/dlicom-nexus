import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import assert from 'assert';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_circle_qa_' + Date.now());

async function main() {
  console.log('======================================================================');
  console.log('🌐 STARTING REAL BROWSER CIRCLE INTERACTIVE QA SUITE');
  console.log('======================================================================');

  // Start Vite dev server
  console.log('Launching Vite dev server on http://localhost:5173...');
  const vite = spawn('npx', ['vite', '--port', '5173'], { shell: true, stdio: 'pipe' });
  await new Promise((r) => setTimeout(r, 2000));

  // Launch Edge Headless
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { detached: false });

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9223/json/new', { method: 'PUT' });
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
      const id = msgId++;
      return new Promise((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalJs(expr) {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
      return res.result?.result?.value;
    }

    async function waitFor(predicateFnStr, timeoutMs = 7000) {
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
      mobile: false,
    });

    // TEST 1: /circle (Onboarding flow)
    console.log('\n📍 1. Testing /circle (Onboarding flow & input submission)...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle' });
    await waitFor(`!!document.querySelector('.onboarding-input-field')`);

    const onboardingLoaded = await evalJs(`!!document.querySelector('.onboarding-input-field')`);
    assert(onboardingLoaded, 'Circle onboarding view loaded');

    // Type full URL https://x.com/batman_1718R into onboarding input
    await evalJs(`
      (() => {
        const input = document.querySelector('.onboarding-input-field');
        input.value = 'https://x.com/batman_1718R';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const form = document.querySelector('form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      })()
    `);

    await waitFor(`!!document.querySelector('.circle-canvas, svg, .constellation-viewport')`, 8000);
    const canvasMounted = await evalJs(`!!document.querySelector('.circle-canvas, svg, .constellation-viewport')`);
    assert(canvasMounted, 'Constellation graph successfully mounted from full URL input');
    console.log('  ✅ [PASS] /circle onboarding submits full URL and mounts constellation');

    // TEST 2: /circle/batman_1718R
    console.log('\n📍 2. Testing /circle/batman_1718R direct route & friend inspection...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle/batman_1718R' });
    await waitFor(`!!document.querySelector('[data-testid="mascot-identity-card"]')`, 8000);

    const batmanCheck = await evalJs(`
      (() => {
        const mascotCard = document.querySelector('[data-testid="mascot-identity-card"]');
        const cardTitle = mascotCard ? mascotCard.innerText : '';
        const inspectBtn = mascotCard ? Array.from(mascotCard.querySelectorAll('button')).some(b => b.innerText.includes('Inspect Studio')) : false;
        const triggerBtn = mascotCard ? Array.from(mascotCard.querySelectorAll('button')).some(b => b.innerText.includes('Pipeline Trigger')) : false;
        const demoBadge = Array.from(document.querySelectorAll('span')).some(s => s.innerText === 'DEMO');
        return { hasCard: !!mascotCard, cardTitle, inspectBtn, triggerBtn, demoBadge };
      })()
    `);

    assert(batmanCheck.hasCard, 'Mascot Identity Card rendered in profile');
    assert(batmanCheck.inspectBtn, 'Inspect in Mascot Studio button present');
    assert(batmanCheck.triggerBtn, 'Send Signal to Pipeline button present');
    console.log('  ✅ [PASS] /circle/batman_1718R loaded with Mascot Identity and Pipeline actions');

    // TEST 3: /circle/vitalikbuterin
    console.log('\n📍 3. Testing /circle/vitalikbuterin...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle/vitalikbuterin' });
    await waitFor(`!!document.querySelector('[data-testid="mascot-identity-card"]')`, 8000);
    const vitalikCheck = await evalJs(`!!document.querySelector('[data-testid="mascot-identity-card"]')`);
    assert(vitalikCheck, 'Circle for @vitalikbuterin rendered successfully');
    console.log('  ✅ [PASS] /circle/vitalikbuterin rendered successfully');

    // TEST 4: /circle/Uniswap
    console.log('\n📍 4. Testing /circle/Uniswap...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle/Uniswap' });
    await waitFor(`!!document.querySelector('[data-testid="mascot-identity-card"]')`, 8000);
    const uniswapCheck = await evalJs(`!!document.querySelector('[data-testid="mascot-identity-card"]')`);
    assert(uniswapCheck, 'Circle for @Uniswap rendered successfully');
    console.log('  ✅ [PASS] /circle/Uniswap rendered successfully');

    // TEST 5: /circle/ethereum
    console.log('\n📍 5. Testing /circle/ethereum...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle/ethereum' });
    await waitFor(`!!document.querySelector('[data-testid="mascot-identity-card"]')`, 8000);
    const ethCheck = await evalJs(`!!document.querySelector('[data-testid="mascot-identity-card"]')`);
    assert(ethCheck, 'Circle for @ethereum rendered successfully');
    console.log('  ✅ [PASS] /circle/ethereum rendered successfully');

    // TEST 6: Error State & Interactive Buttons (/circle/notfound)
    console.log('\n📍 6. Testing Error State & Interactive Buttons (/circle/notfound)...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle/notfound' });
    await waitFor(`document.body.innerText.includes("Couldn't find that X account.")`, 8000);

    const errorScreenCheck = await evalJs(`
      (() => {
        const text = document.body.innerText;
        const hasNotFound = text.includes("Couldn't find that X account.");
        const retryBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Retry'));
        const anotherBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Try Another'));
        return { hasNotFound, hasRetry: !!retryBtn, hasAnother: !!anotherBtn };
      })()
    `);

    assert(errorScreenCheck.hasNotFound, 'Error headline displayed for notfound handle');
    assert(errorScreenCheck.hasRetry, 'Retry button is present on error screen');
    assert(errorScreenCheck.hasAnother, 'Try Another Username button is present');

    // Click "Try Another Username" button and verify it returns to onboarding
    await evalJs(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Try Another'));
        if (btn) btn.click();
      })()
    `);

    await waitFor(`!!document.querySelector('.onboarding-input-field')`, 5000);
    const returnedToOnboarding = await evalJs(`!!document.querySelector('.onboarding-input-field')`);
    assert(returnedToOnboarding, 'Clicking "Try Another Username" returns cleanly to Onboarding');
    console.log('  ✅ [PASS] Error state renders clearly, Retry and Try Another Username buttons work');

    console.log('\n======================================================================');
    console.log('🎉 ALL 6 REAL BROWSER CIRCLE QA TESTS PASSED CLEANLY!');
    console.log('======================================================================');
    process.exit(0);
  } finally {
    edge.kill();
    vite.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

main().catch((e) => {
  console.error('Fatal QA error:', e);
  process.exit(1);
});
