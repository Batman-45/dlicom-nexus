import https from 'https';

function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ url, status: res.statusCode, data }));
    }).on('error', (e) => resolve({ url, status: 500, error: e.message, data: '' }))
      .on('timeout', () => resolve({ url, status: 408, error: 'timeout', data: '' }));
  });
}

async function discover() {
  console.log('=== DISCOVERING DLICOM PUBLIC SOURCES ===');

  // 1. dlicom.me
  const dlicomMe = await fetchPage('https://dlicom.me/');
  console.log('dlicom.me status:', dlicomMe.status, 'len:', dlicomMe.data.length);
  const xMe = dlicomMe.data.match(/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+/gi) || [];
  console.log('X links on dlicom.me:', [...new Set(xMe)]);

  const titleMatch = dlicomMe.data.match(/<title>([^<]+)<\/title>/i);
  console.log('Title on dlicom.me:', titleMatch ? titleMatch[1] : 'none');

  const links = dlicomMe.data.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  console.log('All links on dlicom.me:', [...new Set(links)]);

  // 2. whitepaper.dlicom.io
  const wp = await fetchPage('https://whitepaper.dlicom.io/');
  console.log('\nwhitepaper.dlicom.io status:', wp.status, 'len:', wp.data.length);
  const xWp = wp.data.match(/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+/gi) || [];
  console.log('X links in whitepaper:', [...new Set(xWp)]);

  // Check for team or people mentions in whitepaper
  const wpNames = ['Mohammad', 'Qadriah', 'George', 'Chahine', 'Jimish', 'Parekh', 'Belal', 'Alex', 'Oleksandr', 'Hacken', 'Zeeve'];
  for (const name of wpNames) {
    const idx = wp.data.indexOf(name);
    if (idx !== -1) {
      console.log(`[WP] Found "${name}":`, wp.data.substring(Math.max(0, idx - 30), Math.min(wp.data.length, idx + 80)));
    }
  }

  // 3. dlicom.io bundle
  const dlicomBundle = await fetchPage('https://dlicom.io/assets/index-ZYgqT_w6.js');
  console.log('\ndlicom.io bundle status:', dlicomBundle.status, 'len:', dlicomBundle.data.length);

  // Extract all team entries
  const teamRegex = /\{image:[^,]+,emoji:[^,]*,name:"([^"]+)",designation:"([^"]+)"\}/g;
  let m;
  const teamFound = [];
  while ((m = teamRegex.exec(dlicomBundle.data)) !== null) {
    teamFound.push({ name: m[1], designation: m[2] });
  }
  console.log('Team array from dlicom.io:', teamFound);

  // Check for other structured entities
  const advisorsRegex = /\{image:[^,]+,emoji:[^,]*,name:"([^"]+)",role:"([^"]+)"\}/g;
  while ((m = advisorsRegex.exec(dlicomBundle.data)) !== null) {
    console.log('Advisor found:', m[1], m[2]);
  }
}

discover();
