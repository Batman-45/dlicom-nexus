import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_diversity_suite_' + Date.now());
const artifactDir = 'C:\\Users\\SHREE\\.gemini\\antigravity-ide\\brain\\fc5ee08e-5598-4a0b-8ef1-2630581ac8d9';

const testHandles = [
  '@Batman',
  '@DCComics',
  '@vitalikbuterin',
  '@satoshilabs',
  '@Uniswap',
  '@ethereum',
  '@arbitrum',
  '@optimism',
  '@chainlink',
  '@opensea',
];

async function run() {
  console.log('======================================================================');
  console.log('🌐 STARTING REAL BROWSER MASCOT DIVERSITY VERIFICATION SUITE');
  console.log('======================================================================\n');

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { detached: false });

  await new Promise((resolve) => setTimeout(resolve, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9226/json/new', { method: 'PUT' });
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

    console.log('Navigating to http://localhost:5173/ ...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise((r) => setTimeout(r, 2000));

    const results = [];

    for (let idx = 0; idx < testHandles.length; idx++) {
      const handle = testHandles[idx];
      console.log(`\n----------------------------------------------------------------------`);
      console.log(`[User ${idx + 1}/${testHandles.length}] Synthesizing Mascot for: ${handle}`);

      // 1. Enter username
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const input = document.getElementById('mascot-username-input');
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, ${JSON.stringify(handle)});
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          })()
        `,
      });
      await new Promise((r) => setTimeout(r, 200));

      // 2. Click Synthesize
      await send('Runtime.evaluate', {
        expression: `document.getElementById('mascot-synthesize-btn').click()`,
      });

      // 3. Poll until synthesis complete
      let completed = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((r) => setTimeout(r, 500));
        const check = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const text = document.body.innerText;
              const img = document.querySelector('.mascot-collectible-stage img');
              const idMatch = text.match(/DLI-MASCOT-[A-Z0-9]{6}/);
              const isSynthesizing = text.includes('Synthesizing...');
              return {
                hasId: !!idMatch,
                id: idMatch ? idMatch[0] : null,
                hasImage: !!img && !!img.src,
                imageSrc: img ? img.src : null,
                isSynthesizing,
              };
            })()
          `,
          returnByValue: true,
        });
        const v = check.result?.result?.value || check.result?.value;
        if (v?.hasId && v?.hasImage && !v?.isSynthesizing) {
          completed = true;
          break;
        }
      }

      if (!completed) {
        throw new Error(`Synthesis timed out for ${handle}`);
      }

      // Small settle pause
      await new Promise((r) => setTimeout(r, 600));

      // 4. Extract rendered mascot metadata from DOM
      const extracted = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const text = document.body.innerText;
            const idMatch = text.match(/DLI-MASCOT-[A-Z0-9]{6}/);
            const img = document.querySelector('.mascot-collectible-stage img');
            const badgeEl = document.querySelector('h2');
            const handleEl = document.querySelector('.text-purple-300');
            
            // Subtitle element with family and variant:
            const subtitleEl = document.getElementById('mascot-family-variant');
            const subtitleText = subtitleEl ? subtitleEl.innerText : '';

            // Archetype tag:
            const archEl = document.querySelector('.tracking-wider.uppercase');
            const archetypeText = archEl ? archEl.innerText.trim() : '';

            return {
              mascotId: idMatch ? idMatch[0] : 'UNKNOWN',
              archetype: archetypeText,
              badgeName: badgeEl ? badgeEl.innerText.trim() : '',
              imageSrc: img ? img.src : '',
              subtitle: subtitleText,
              fullText: text,
            };
          })()
        `,
        returnByValue: true,
      });

      const data = extracted.result?.result?.value || extracted.result?.value;
      
      // Parse family and variant from subtitle
      const parts = data.subtitle.split('•').map((s) => s.trim());
      const familyName = parts[0] || 'Unknown';
      const variantName = parts[1] || 'Unknown';

      // Parse relative image path
      const imgUrl = new URL(data.imageSrc);
      const relativeImage = imgUrl.pathname;

      console.log(`  ✅ Mascot ID:    ${data.mascotId}`);
      console.log(`  ✅ Archetype:    ${data.archetype}`);
      console.log(`  ✅ Family:       ${familyName}`);
      console.log(`  ✅ Variant:      ${variantName}`);
      console.log(`  ✅ Image Asset:  ${relativeImage}`);

      results.push({
        handle,
        mascotId: data.mascotId,
        archetype: data.archetype,
        familyName,
        variantName,
        imageAsset: relativeImage,
        badgeName: data.badgeName,
      });

      // Save screenshot for prominent handles
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const cleanHandle = handle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const shotPath = path.join(artifactDir, `diversity_${cleanHandle}.png`);
      fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
    }

    // 5. Deterministic Repeatability Check
    console.log(`\n======================================================================`);
    console.log(`🔁 VERIFYING DETERMINISTIC REPEATABILITY ON @Uniswap`);
    console.log(`======================================================================`);
    
    // Re-synthesize @Uniswap
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('mascot-username-input');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, '@Uniswap');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 200));
    await send('Runtime.evaluate', {
      expression: `document.getElementById('mascot-synthesize-btn').click()`,
    });

    let repeatCompleted = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((r) => setTimeout(r, 500));
      const check = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const text = document.body.innerText;
            const img = document.querySelector('.mascot-collectible-stage img');
            const idMatch = text.match(/DLI-MASCOT-[A-Z0-9]{6}/);
            const isSynthesizing = text.includes('Synthesizing...');
            return {
              hasId: !!idMatch,
              id: idMatch ? idMatch[0] : null,
              hasImage: !!img && !!img.src,
              imageSrc: img ? img.src : null,
              isSynthesizing,
            };
          })()
        `,
        returnByValue: true,
      });
      const v = check.result?.result?.value || check.result?.value;
      if (v?.hasId && v?.hasImage && !v?.isSynthesizing) {
        repeatCompleted = true;
        break;
      }
    }

    if (!repeatCompleted) {
      throw new Error('Repeat synthesis for @Uniswap timed out');
    }

    await new Promise((r) => setTimeout(r, 600));

    const repeatCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const idMatch = text.match(/DLI-MASCOT-[A-Z0-9]{6}/);
          const img = document.querySelector('.mascot-collectible-stage img');
          const subtitleEl = document.getElementById('mascot-family-variant');
          return {
            id: idMatch ? idMatch[0] : null,
            img: img ? img.src : null,
            sub: subtitleEl ? subtitleEl.innerText : '',
          };
        })()
      `,
      returnByValue: true,
    });
    const rep = repeatCheck.result?.result?.value || repeatCheck.result?.value;
    const uniswapOriginal = results.find((r) => r.handle === '@Uniswap');
    
    const idMatches = rep.id === uniswapOriginal.mascotId;
    const imgMatches = rep.img && rep.img.includes(uniswapOriginal.imageAsset);
    console.log(`Repeat Mascot ID Match:    ${idMatches} (${rep.id} vs ${uniswapOriginal.mascotId})`);
    console.log(`Repeat Image Asset Match:  ${imgMatches}`);

    if (!idMatches || !imgMatches) {
      throw new Error('Deterministic repeatability check failed!');
    }

    // 6. Diversity Summary & Assertions
    console.log(`\n========================================================================================================================`);
    console.log(`📊 MASCOT DIVERSITY VERIFICATION SUMMARY (10 PROFILES)`);
    console.log(`========================================================================================================================`);
    console.log(`| Username | Archetype | Family | Variant | Asset URL | Mascot ID |`);
    console.log(`| --- | --- | --- | --- | --- | --- |`);
    for (const r of results) {
      console.log(`| ${r.handle} | ${r.archetype} | ${r.familyName} | ${r.variantName} | \`${r.imageAsset}\` | ${r.mascotId} |`);
    }

    const uniqueFamilies = new Set(results.map((r) => r.familyName));
    const uniqueVariants = new Set(results.map((r) => r.variantName));
    const uniqueImages = new Set(results.map((r) => r.imageAsset));
    const uniqueMascotIds = new Set(results.map((r) => r.mascotId));

    console.log(`\nDistinct Families Generated: ${uniqueFamilies.size} / 10`);
    console.log(`Distinct Variants Generated: ${uniqueVariants.size} / 10`);
    console.log(`Distinct Images Generated:   ${uniqueImages.size} / 10`);
    console.log(`Distinct Mascot IDs:         ${uniqueMascotIds.size} / 10`);

    if (uniqueFamilies.size < 4) {
      throw new Error(`Insufficient family diversity: only ${uniqueFamilies.size} families generated`);
    }
    if (uniqueVariants.size < 4) {
      throw new Error(`Insufficient variant diversity: only ${uniqueVariants.size} variants generated`);
    }
    if (uniqueImages.size < 4) {
      throw new Error(`Insufficient image asset diversity: only ${uniqueImages.size} images generated`);
    }
    if (uniqueMascotIds.size !== 10) {
      throw new Error(`Mascot ID collision detected: only ${uniqueMascotIds.size} unique IDs`);
    }

    console.log('\n🎉 ALL REAL BROWSER DIVERSITY CHECKS PASSED WITH ZERO FLAKINESS!');
    ws.close();
  } finally {
    edge.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error('Diversity suite failed:', err);
  process.exit(1);
});
