#!/usr/bin/env node

/**
 * Dlicom Hero Sharing Verification Suite
 *
 * Verifies:
 * 1. HeroShareCard component structure & export
 * 2. heroCardExport utilities (URL building, filename sanitization, X intent encoding)
 * 3. Hero data consumption (Title, Pillar, Mascot ID, Handle, Traits)
 * 4. Deterministic FNV-1a output consistency with sharing layer
 * 5. Complete absence of deprecated subsystems (Circle, Pipeline, Supabase, Blockchain)
 * 6. Accessibility & ARIA labeling on sharing actions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMascotVariant } from '../src/services/mascot/mascotEngine.ts';
import { createFallbackSignals } from '../src/services/mascot/xProfileService.ts';
import {
  getHeroShareUrl,
  getHeroCardFilename,
  getHeroXShareIntentUrl,
} from '../src/services/mascot/heroCardExport.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

console.log('======================================================================');
console.log('🚀 RUNNING DLICOM HERO SHARE CARD & EXPORT VERIFICATION SUITE');
console.log('======================================================================\n');

// 1. File existence & exports
console.log('📦 1. Component & Export Verification:');
const shareCardPath = path.resolve(__dirname, '../src/components/Mascot/HeroShareCard.tsx');
assert(fs.existsSync(shareCardPath), 'HeroShareCard.tsx exists in src/components/Mascot/');

const exportUtilPath = path.resolve(__dirname, '../src/services/mascot/heroCardExport.ts');
assert(fs.existsSync(exportUtilPath), 'heroCardExport.ts exists in src/services/mascot/');

const indexTsPath = path.resolve(__dirname, '../src/components/Mascot/index.ts');
const indexTs = fs.readFileSync(indexTsPath, 'utf-8');
assert(indexTs.includes("export * from './HeroShareCard'"), 'HeroShareCard exported in Mascot/index.ts');
assert(indexTs.includes('heroCardExport'), 'heroCardExport utilities exported in Mascot/index.ts');

// 2. Canonical URL and Filename Generation
console.log('\n🔗 2. Canonical URL & Filename Sanitization:');
const shareUrl1 = getHeroShareUrl('@batman_1718R');
assert(shareUrl1.includes('/mascot/batman_1718R'), 'getHeroShareUrl correctly strips @ and formats /mascot/batman_1718R');

const shareUrl2 = getHeroShareUrl('vitalikbuterin');
assert(shareUrl2.includes('/mascot/vitalikbuterin'), 'getHeroShareUrl formats plain handle /mascot/vitalikbuterin');

const filename1 = getHeroCardFilename('batman_1718R', 'DLI-MASCOT-F5379C');
assert(
  filename1 === 'dlicom-hero-batman_1718r-dli-mascot-f5379c.png',
  `Filename correctly formatted: ${filename1}`
);

const filename2 = getHeroCardFilename('user!@#$_99', 'DLI-MASCOT-1234AB');
assert(
  filename2 === 'dlicom-hero-user_99-dli-mascot-1234ab.png',
  `Illegal characters sanitized in filename: ${filename2}`
);

// 3. X (Twitter) Web Intent URL Verification
console.log('\n🐦 3. X (Twitter) Web Intent URL & Prefilled Text:');
const testSignals = createFallbackSignals('batman_1718R');
const testMascot = generateMascotVariant(testSignals);

const tweetUrl = getHeroXShareIntentUrl(testMascot);
assert(tweetUrl.startsWith('https://twitter.com/intent/tweet?text='), 'X intent URL uses canonical endpoint');

const encodedText = tweetUrl.replace('https://twitter.com/intent/tweet?text=', '');
const decodedText = decodeURIComponent(encodedText);

assert(decodedText.includes('I just discovered my Dlicom Hero.'), 'Prefilled text contains opening statement');
assert(decodedText.includes(testMascot.heroTitle), `Prefilled text contains Hero Title (${testMascot.heroTitle})`);
assert(decodedText.includes(testMascot.mascotId), `Prefilled text contains Mascot ID (${testMascot.mascotId})`);
assert(decodedText.includes(`/mascot/${testMascot.username}`), `Prefilled text contains public hero URL (/mascot/${testMascot.username})`);
assert(decodedText.includes('#Dlicom') && decodedText.includes('#DlicomNexus'), 'Prefilled text contains #Dlicom and #DlicomNexus hashtags');

// 4. HeroShareCard Component Structure & Accessibility
console.log('\n🃏 4. HeroShareCard DOM & Accessibility Audit:');
const cardContent = fs.readFileSync(shareCardPath, 'utf-8');

assert(cardContent.includes('id="hero-share-card"'), 'HeroShareCard has id="hero-share-card"');
assert(cardContent.includes('data-testid="hero-share-card"'), 'HeroShareCard has data-testid="hero-share-card"');
assert(cardContent.includes('id="share-card-hero-title"'), 'Contains id="share-card-hero-title"');
assert(cardContent.includes('id="share-card-mascot-id"'), 'Contains id="share-card-mascot-id"');
assert(cardContent.includes('id="share-card-handle"'), 'Contains id="share-card-handle"');
assert(cardContent.includes('id="share-card-hero-pillar"'), 'Contains id="share-card-hero-pillar"');
assert(cardContent.includes('id="action-download-hero"'), 'Contains id="action-download-hero"');
assert(cardContent.includes('id="action-share-hero-x"'), 'Contains id="action-share-hero-x"');
assert(cardContent.includes('id="action-copy-hero-link"'), 'Contains id="action-copy-hero-link"');
assert(cardContent.includes('aria-label='), 'Action buttons include accessible aria-label attributes');
assert(cardContent.includes('focus:ring-2'), 'Interactive controls include visible focus states');
assert(cardContent.includes('DLICOM'), 'Visually communicates DLICOM branding');
assert(cardContent.includes('Dlicom Hero'), 'Visually communicates Dlicom Hero badge');

// 5. MascotGeneratorPage Integration Check
console.log('\n📱 5. MascotGeneratorPage Integration & Flow:');
const pageContent = fs.readFileSync(path.resolve(__dirname, '../src/views/MascotGeneratorPage.tsx'), 'utf-8');
assert(pageContent.includes('<HeroShareCard'), 'MascotGeneratorPage renders HeroShareCard');
assert(pageContent.includes('exportHeroShareCardAsPng') || pageContent.includes('HeroShareCard'), 'MascotGeneratorPage integrated with HeroShareCard');

// 6. Regression Check: Zero Reintroduced Subsystems
console.log('\n🛡️  6. Regression Check: Zero Deprecated Subsystems:');
const forbiddenPatterns = [
  { name: 'Supabase client in Hero card', file: cardContent, pattern: /supabase/i },
  { name: 'React Flow in Hero card', file: cardContent, pattern: /reactflow|xyflow/i },
  { name: 'Blockchain/Wallet in Hero card', file: cardContent, pattern: /wagmi|ethers|web3/i },
  { name: 'Circle feature reintroduction', file: cardContent, pattern: /circleonboarding|friendmap/i },
];

for (const { name, file, pattern } of forbiddenPatterns) {
  assert(!pattern.test(file), `Strict zero check: ${name}`);
}

// 7. Determinism Preserved Across Test Superhero Profiles
console.log('\n🎯 7. Deterministic Hero Identity Unchanged:');
const checkProfiles = [
  { handle: 'batman_1718R', expectedTitle: 'Astro DLI', expectedId: 'DLI-MASCOT-F5379C' },
  { handle: 'vitalikbuterin', expectedTitle: 'Mystic DLI', expectedId: 'DLI-MASCOT-6EA5DB' },
  { handle: 'Uniswap', expectedTitle: 'Flame DLI', expectedId: 'DLI-MASCOT-8CC2AA' },
  { handle: 'ethereum', expectedTitle: 'Chronos DLI', expectedId: 'DLI-MASCOT-B16BD7' },
];

for (const p of checkProfiles) {
  const sig = createFallbackSignals(p.handle);
  const m = generateMascotVariant(sig);
  assert(m.heroTitle === p.expectedTitle, `@${p.handle} hero title is strictly preserved: ${m.heroTitle}`);
  assert(m.mascotId === p.expectedId, `@${p.handle} mascot ID is strictly preserved: ${m.mascotId}`);
}

console.log('\n======================================================================');
console.log(`VERIFICATION SUMMARY: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
console.log('======================================================================');

if (passed === total) {
  console.log('🎉 ALL DLICOM HERO SHARING REQUIREMENTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('🚨 ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
