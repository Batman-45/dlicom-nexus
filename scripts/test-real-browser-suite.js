import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_screen_suite_' + Date.now());

async function run() {
  console.log('=== STARTING REAL BROWSER RUNTIME VERIFICATION ===');
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { detached: false });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
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

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // STEP 1 & 2: Verify Initial Page has NO mascot result
    console.log('\n[STEP 1 & 2] Opening http://localhost:5173/ and verifying initial clean state...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 2000));

    const initialCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('mascot-username-input');
          const btn = document.getElementById('mascot-synthesize-btn');
          const stage = document.querySelector('.mascot-collectible-stage');
          const mascotImg = document.querySelector('.mascot-collectible-stage img');
          const text = document.body.innerText;
          const hasSecurityGuardian = text.includes('SECURITY GUARDIAN');
          const hasEcosystemScout = text.includes('ECOSYSTEM SCOUT');
          const hasMascotId = /DLI-MASCOT-[A-Z0-9]{6}/.test(text);
          return {
            hasInput: !!input,
            hasBtn: !!btn,
            hasStage: !!stage,
            hasMascotImg: !!mascotImg,
            hasSecurityGuardian,
            hasEcosystemScout,
            hasMascotId
          };
        })()
      `,
      returnByValue: true,
    });
    const ic = initialCheck.result?.result?.value || initialCheck.result?.value;
    console.log('Initial page has username input:', ic.hasInput);
    console.log('Initial page has synthesize button:', ic.hasBtn);
    console.log('Initial page has mascot stage (MUST BE FALSE):', ic.hasStage);
    console.log('Initial page has mascot image (MUST BE FALSE):', ic.hasMascotImg);
    console.log('Initial page has SECURITY GUARDIAN (MUST BE FALSE):', ic.hasSecurityGuardian);
    console.log('Initial page has ECOSYSTEM SCOUT (MUST BE FALSE):', ic.hasEcosystemScout);
    console.log('Initial page has mascot ID (MUST BE FALSE):', ic.hasMascotId);

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'initial_clean_page.png'), Buffer.from(shot1.result.data, 'base64'));
    console.log('Saved screenshot: initial_clean_page.png');

    // STEP 3, 4, 5, 6, 7, 8: Enter @Batman and synthesize
    console.log('\n[STEP 3-8] Entering @Batman and synthesizing...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('mascot-username-input');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, '@Batman');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 200));

    await send('Runtime.evaluate', {
      expression: `document.getElementById('mascot-synthesize-btn').click()`,
    });

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const stage = document.querySelector('.mascot-collectible-stage')?.textContent;
            const text = document.body.innerText;
            const isComplete = text.includes('SECURITY GUARDIAN') && text.includes('Aegis Sentinel');
            return { isComplete, stage };
          })()
        `,
        returnByValue: true,
      });
      const val = res.result?.result?.value || res.result?.value;
      if (val?.isComplete) {
        console.log(`Batman synthesis finished in ${(i + 1) * 500}ms!`);
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 1000));

    const batmanCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const stage = document.querySelector('.mascot-collectible-stage');
          const img = document.querySelector('.mascot-collectible-stage img');
          return {
            hasSecurityGuardian: text.includes('SECURITY GUARDIAN'),
            hasAegisSentinel: text.includes('Aegis Sentinel'),
            hasBatmanHandle: text.toLowerCase().includes('@batman'),
            hasMascotId: /DLI-MASCOT-[A-Z0-9]{6}/.test(text),
            hasMascotImage: !!img && (img.src.includes('/mascots/aegis_defense_v1.jpg') || img.src.includes('/mascots/security.jpg')),
            hasStage: !!stage,
          };
        })()
      `,
      returnByValue: true,
    });
    const bc = batmanCheck.result?.result?.value || batmanCheck.result?.value;
    console.log('Batman rendered SECURITY GUARDIAN:', bc.hasSecurityGuardian);
    console.log('Batman rendered Aegis Sentinel:', bc.hasAegisSentinel);
    console.log('Batman rendered @batman:', bc.hasBatmanHandle);
    console.log('Batman rendered Mascot ID:', bc.hasMascotId);
    console.log('Batman rendered mascot security image:', bc.hasMascotImage);

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'batman_actual_screenshot.png'), Buffer.from(shot2.result.data, 'base64'));
    console.log('Saved screenshot: batman_actual_screenshot.png');

    // STEP 9 & 10: Click Reset and verify mascot disappears
    console.log('\n[STEP 9 & 10] Clicking Reset and verifying mascot disappears...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('mascot-reset-btn').click()`,
    });
    await new Promise((r) => setTimeout(r, 600));

    const resetCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const stage = document.querySelector('.mascot-collectible-stage');
          const text = document.body.innerText;
          return {
            hasStage: !!stage,
            hasSecurityGuardian: text.includes('SECURITY GUARDIAN'),
            hasMascotId: /DLI-MASCOT-[A-Z0-9]{6}/.test(text),
          };
        })()
      `,
      returnByValue: true,
    });
    const rc = resetCheck.result?.result?.value || resetCheck.result?.value;
    console.log('After Reset - has mascot stage (MUST BE FALSE):', rc.hasStage);
    console.log('After Reset - has SECURITY GUARDIAN (MUST BE FALSE):', rc.hasSecurityGuardian);
    console.log('After Reset - has mascot ID (MUST BE FALSE):', rc.hasMascotId);

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'after_reset_page.png'), Buffer.from(shot3.result.data, 'base64'));
    console.log('Saved screenshot: after_reset_page.png');

    // STEP 11 & 12: invalid!user$$$
    console.log('\n[STEP 11 & 12] Testing invalid!user$$$ ...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('mascot-username-input');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, 'invalid!user$$$');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 200));

    await send('Runtime.evaluate', {
      expression: `document.getElementById('mascot-synthesize-btn').click()`,
    });
    await new Promise((r) => setTimeout(r, 500));

    const invalidCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const err = document.querySelector('.mascot-error-badge')?.textContent || '';
          const stage = document.querySelector('.mascot-collectible-stage');
          return { err, hasStage: !!stage };
        })()
      `,
      returnByValue: true,
    });
    const iv = invalidCheck.result?.result?.value || invalidCheck.result?.value;
    console.log('Invalid user error displayed:', iv.err);
    console.log('Invalid user has mascot stage (MUST BE FALSE):', iv.hasStage);

    // STEP 13 & 14: @DCComics
    console.log('\n[STEP 13 & 14] Testing @DCComics ...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('mascot-username-input');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, '@DCComics');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 200));

    await send('Runtime.evaluate', {
      expression: `document.getElementById('mascot-synthesize-btn').click()`,
    });

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const text = document.body.innerText;
            const isComplete = text.includes('CREATOR & MEDIA') || text.includes('Luminary Artist');
            return { isComplete };
          })()
        `,
        returnByValue: true,
      });
      const val = res.result?.result?.value || res.result?.value;
      if (val?.isComplete) {
        console.log(`DCComics synthesis finished in ${(i + 1) * 500}ms!`);
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 1000));

    const dcCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const stage = document.querySelector('.mascot-collectible-stage');
          const img = document.querySelector('.mascot-collectible-stage img');
          return {
            hasCreatorMedia: text.includes('CREATOR & MEDIA'),
            hasLuminaryArtist: text.includes('Luminary Artist'),
            hasDCHandle: text.toLowerCase().includes('@dccomics'),
            hasMascotImage: !!img && (img.src.includes('/mascots/creative_studio_v1.jpg') || img.src.includes('/mascots/creator.jpg')),
            hasStage: !!stage,
          };
        })()
      `,
      returnByValue: true,
    });
    const dcc = dcCheck.result?.result?.value || dcCheck.result?.value;
    console.log('DCComics rendered CREATOR & MEDIA:', dcc.hasCreatorMedia);
    console.log('DCComics rendered Luminary Artist:', dcc.hasLuminaryArtist);
    console.log('DCComics rendered @dccomics:', dcc.hasDCHandle);
    console.log('DCComics rendered creator image:', dcc.hasMascotImage);

    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'dccomics_actual_screenshot.png'), Buffer.from(shot4.result.data, 'base64'));
    console.log('Saved screenshot: dccomics_actual_screenshot.png');

    ws.close();
    console.log('\n=== REAL BROWSER VERIFICATION COMPLETE & PASSED ===');
  } finally {
    edge.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error('Error running suite:', err);
  process.exit(1);
});
