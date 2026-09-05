import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'edge_cdp_' + Date.now());

async function capture() {
  console.log('Launching Edge on port 9222...');
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
    await send('Network.enable');

    await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Desktop 1440x900 Top View
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await new Promise((r) => setTimeout(r, 400));

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'pulse_dashboard_desktop_1440.png'), Buffer.from(shot1.result.data, 'base64'));
    fs.writeFileSync('C:\\Users\\SHREE\\.gemini\\antigravity-ide\\brain\\12c45e98-3554-41bb-bba7-29a6697fea41\\pulse_dashboard_desktop_1440.png', Buffer.from(shot1.result.data, 'base64'));

    // 2. Desktop Scrolled to Middle (Contributions & Activity)
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 680)' });
    await new Promise((r) => setTimeout(r, 400));
    const shotScrolled = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'pulse_dashboard_desktop_scrolled.png'), Buffer.from(shotScrolled.result.data, 'base64'));
    fs.writeFileSync('C:\\Users\\SHREE\\.gemini\\antigravity-ide\\brain\\12c45e98-3554-41bb-bba7-29a6697fea41\\pulse_dashboard_desktop_scrolled.png', Buffer.from(shotScrolled.result.data, 'base64'));

    // 3. Desktop Scrolled to Opportunities & Milestones
    await send('Runtime.evaluate', { expression: 'document.getElementById("opportunities")?.scrollIntoView()' });
    await new Promise((r) => setTimeout(r, 400));
    const shotOpp = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'pulse_dashboard_desktop_opportunities.png'), Buffer.from(shotOpp.result.data, 'base64'));
    fs.writeFileSync('C:\\Users\\SHREE\\.gemini\\antigravity-ide\\brain\\12c45e98-3554-41bb-bba7-29a6697fea41\\pulse_dashboard_desktop_opportunities.png', Buffer.from(shotOpp.result.data, 'base64'));

    // 4. Mobile 390x844
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 400));
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.cwd(), 'pulse_dashboard_mobile_390.png'), Buffer.from(shot2.result.data, 'base64'));
    fs.writeFileSync('C:\\Users\\SHREE\\.gemini\\antigravity-ide\\brain\\12c45e98-3554-41bb-bba7-29a6697fea41\\pulse_dashboard_mobile_390.png', Buffer.from(shot2.result.data, 'base64'));

    console.log('All 4 screenshot views captured successfully!');
    ws.close();
  } finally {
    edge.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
