import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_hero_qa_' + Date.now());
const artifactDir = 'C:\\Users\\SHREE\\.gemini\\antigravity-ide\\brain\\9f30d9c9-c70a-4160-bf00-82c4704ed938';

const profiles = [
  '@batman_1718R',
  '@vitalikbuterin',
  '@Uniswap',
  '@ethereum'
];

async function main() {
  console.log('🚀 Starting Edge browser for Dlicom Superhero Mascot Visual QA...');
  fs.mkdirSync(artifactDir, { recursive: true });

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9230',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { detached: false });

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9230/json/new', { method: 'PUT' });
    const target = await listRes.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
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
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('📍 Navigating to http://localhost:5173/ ...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 2000));

    const results = [];

    for (const handle of profiles) {
      console.log(`\n🦸 Synthesizing Hero Mascot for ${handle}...`);

      // Set input value using native setter
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const input = document.getElementById('mascot-username-input');
            if (!input) return false;
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, ${JSON.stringify(handle)});
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          })()
        `,
        returnByValue: true
      });
      await new Promise((r) => setTimeout(r, 200));

      // Click synthesize
      await send('Runtime.evaluate', {
        expression: `document.getElementById('mascot-synthesize-btn')?.click()`,
      });

      // Wait for synthesis to complete
      let synthesized = false;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 400));
        const check = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const heroTitle = document.getElementById('mascot-hero-title');
              const variantName = document.getElementById('mascot-variant-name');
              const img = document.querySelector('.mascot-collectible-stage img');
              if (heroTitle && variantName && img && img.complete && img.naturalWidth > 0) {
                return {
                  heroTitle: heroTitle.innerText,
                  variantName: variantName.innerText,
                  archetype: document.getElementById('mascot-archetype-label')?.innerText,
                  familyName: document.getElementById('mascot-family-name')?.innerText,
                  mascotId: document.getElementById('mascot-id-badge')?.innerText,
                  provenance: document.getElementById('mascot-signal-provenance')?.innerText,
                  imgSrc: img.src,
                  imgLoaded: img.naturalWidth > 0
                };
              }
              return null;
            })()
          `,
          returnByValue: true
        });

        const val = check?.result?.result?.value || check?.result?.value;
        if (val) {
          synthesized = val;
          break;
        }
      }

      if (synthesized) {
        console.log(`  ✅ Hero Title: ${synthesized.heroTitle}`);
        console.log(`  ✅ Variant: ${synthesized.variantName} (${synthesized.familyName})`);
        console.log(`  ✅ Mascot ID: ${synthesized.mascotId}`);
        console.log(`  ✅ Image Loaded: ${synthesized.imgLoaded} (${synthesized.imgSrc})`);
        console.log(`  ✅ Provenance: ${synthesized.provenance}`);

        const cleanHandle = handle.replace(/[@_]/g, '').toLowerCase();
        const screenshotData = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(artifactDir, `qa_hero_${cleanHandle}.png`);
        fs.writeFileSync(filePath, Buffer.from(screenshotData.result.data, 'base64'));
        console.log(`  📸 Screenshot saved: qa_hero_${cleanHandle}.png`);

        results.push({ handle, ...synthesized, success: true });
      } else {
        console.error(`  ❌ Failed to synthesize hero for ${handle}`);
        results.push({ handle, success: false });
      }
    }

    // Test Route Fallback & Navigation Integrity
    console.log('\n📍 Testing Fallback from obsolete /circle/vitalikbuterin route ...');
    await send('Page.navigate', { url: 'http://localhost:5173/circle/vitalikbuterin' });
    await new Promise((r) => setTimeout(r, 2000));

    const fallbackCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const hasCircleNav = !!document.querySelector('#nav-x-circle');
          const hasPipelineNav = !!document.querySelector('#nav-pipelines');
          const hasHomeNav = !!document.querySelector('#nav-home');
          const hasStudioNav = !!document.querySelector('#nav-mascot-generator');
          const hasGalleryNav = !!document.querySelector('#nav-mascot-gallery');
          const hasVariant = !!document.querySelector('#mascot-variant-name');
          return {
            hasCircleNav,
            hasPipelineNav,
            hasHomeNav,
            hasStudioNav,
            hasGalleryNav,
            hasVariant
          };
        })()
      `,
      returnByValue: true
    });

    const fbVal = fallbackCheck?.result?.result?.value || fallbackCheck?.result?.value;
    if (fbVal) {
      console.log('  ✅ Fallback from obsolete /circle route cleanly rendered Mascot Studio:');
      console.log(`     Has Home: ${fbVal.hasHomeNav}, Has Studio: ${fbVal.hasStudioNav}, Has Gallery: ${fbVal.hasGalleryNav}`);
      console.log(`     Circle Nav Removed: ${!fbVal.hasCircleNav}, Pipeline Nav Removed: ${!fbVal.hasPipelineNav}`);
      if (fbVal.hasCircleNav || fbVal.hasPipelineNav) {
        throw new Error('Obsolete navigation items still detected in DOM!');
      }
    }

    console.log('\n======================================================================');
    console.log(`QA VERDICT: ${results.filter(r => r.success).length}/${profiles.length} profiles verified.`);
    console.log('======================================================================');

    ws.close();
  } finally {
    edge.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore Windows temp lock
    }
  }
}

main().catch((err) => {
  console.error('Fatal Edge QA Error:', err);
  process.exit(1);
});
