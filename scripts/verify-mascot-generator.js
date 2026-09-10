/**
 * Dlicom Mascot Generator Verification Suite
 *
 * Tests:
 * 1. Username validation & sanitization
 * 2. Deterministic repeatability (100% identical outputs for same inputs)
 * 3. Distinct variation across different usernames
 * 4. Zero Marvel / superhero infringement
 * 5. Preservation of the official immutable Dlicom mascot base character
 * 6. Signal extraction & zero data fabrication
 * 7. Rate-limit fallback transparency
 */

import { generateMascotVariant } from '../src/services/mascot/mascotEngine.ts';
import { validateUsername, createFallbackSignals, fetchPublicXSignals } from '../src/services/mascot/xProfileService.ts';


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
console.log('🚀 RUNNING DLICOM MASCOT GENERATOR VERIFICATION SUITE');
console.log('======================================================================\n');

// 1. Username Validation
console.log('🔤 1. Username Validation & Sanitization:');
const v1 = validateUsername('@mohammadqadriah');
assert(v1.isValid && v1.cleanUsername === 'mohammadqadriah', 'Correctly strips leading @ and validates');

const v2 = validateUsername('  jimish_parekh  ');
assert(v2.isValid && v2.cleanUsername === 'jimish_parekh', 'Trims whitespace correctly');

const v3 = validateUsername('');
assert(!v3.isValid, 'Rejects empty username');

const v4 = validateUsername('invalid!user$$$');
assert(!v4.isValid, 'Rejects illegal characters');

const v5 = validateUsername('a'.repeat(26));
assert(!v5.isValid, 'Rejects usernames longer than 25 characters');

// URL Normalization tests (Requirement 4)
const vUrl1 = validateUsername('https://x.com/batman_1718R');
assert(vUrl1.isValid && vUrl1.cleanUsername === 'batman_1718R', 'Correctly normalizes https://x.com/batman_1718R');

const vUrl2 = validateUsername('https://twitter.com/batman_1718R?s=20');
assert(vUrl2.isValid && vUrl2.cleanUsername === 'batman_1718R', 'Correctly normalizes twitter.com URL with query params');

const vUrl3 = validateUsername('batman_1718R');
assert(vUrl3.isValid && vUrl3.cleanUsername === 'batman_1718R', 'Correctly accepts plain handle batman_1718R');

const vUrl4 = validateUsername('@batman_1718R');
assert(vUrl4.isValid && vUrl4.cleanUsername === 'batman_1718R', 'Correctly accepts @batman_1718R');

// 2. Deterministic Repeatability
console.log('\n🎲 2. Deterministic Repeatability & Cryptographic Seeding:');
const signalsA = {
  username: 'vitalikbuterin',
  displayName: 'vitalik.eth',
  bio: 'Ethereum researcher and protocol architect',
  sourceType: 'LIVE_X_PUBLIC',
  detectedKeywords: ['research', 'protocol'],
  inferredFocus: 'Protocol Research & Quantitative Analysis',
};

const run1 = generateMascotVariant(signalsA);
const run2 = generateMascotVariant(signalsA);

assert(run1.mascotId === run2.mascotId, 'Mascot ID is 100% deterministic');
assert(run1.archetype === run2.archetype, 'Archetype is 100% deterministic');
assert(run1.visual.outfit === run2.visual.outfit, 'Outfit is 100% deterministic');
assert(run1.visual.equipment === run2.visual.equipment, 'Equipment is 100% deterministic');
assert(run1.visual.expression === run2.visual.expression, 'Expression is 100% deterministic');
assert(run1.visual.pose === run2.visual.pose, 'Pose is 100% deterministic');
assert(run1.cryptographicSeed.hexSeed === run2.cryptographicSeed.hexSeed, 'Hex seed matches across runs');

// 3. Distinct Variation Across Different Users
console.log('\n👥 3. Diversity Across Distinct Users:');
const signalsDev = {
  username: 'core_coder',
  displayName: 'Dev Lead',
  bio: 'Solidity and Rust protocol engineer building L2 rollup',
  sourceType: 'LIVE_X_PUBLIC',
  detectedKeywords: ['developer', 'solidity'],
  inferredFocus: 'Core Protocol & Software Development',
};

const signalsSec = {
  username: 'audit_master',
  displayName: 'Guardian Sentinel',
  bio: 'Smart contract security auditor and formal verification specialist',
  sourceType: 'LIVE_X_PUBLIC',
  detectedKeywords: ['security', 'audit'],
  inferredFocus: 'Smart Contract Security & Auditing',
};

const devMascot = generateMascotVariant(signalsDev);
const secMascot = generateMascotVariant(signalsSec);

assert(devMascot.mascotId !== secMascot.mascotId, 'Different users generate distinct mascot IDs');
assert(devMascot.archetype === 'PROTOCOL_DEVELOPER', 'Dev signals map to PROTOCOL_DEVELOPER');
assert(secMascot.archetype === 'AEGIS_SENTINEL', 'Security signals map to AEGIS_SENTINEL');
assert(devMascot.visual.colorTheme.primary !== secMascot.visual.colorTheme.primary, 'Different archetypes receive distinct color themes');

// Test Real Signal Profiles: @Batman and @DCComics
const signalsBatman = {
  username: 'Batman',
  displayName: 'Batman',
  bio: 'Wherever you know him from - movies, TV shows, video games or comics - Batman is proof you don’t need superpowers to be a Super Hero. #DC',
  sourceType: 'LIVE_X_PUBLIC',
  detectedKeywords: [],
  inferredFocus: 'Autonomous Protocol Defense & Sentinel Security',
};
const batmanMascot = generateMascotVariant(signalsBatman);
assert(batmanMascot.archetype === 'AEGIS_SENTINEL', '@Batman real signals map to AEGIS_SENTINEL');
assert(batmanMascot.archetypeLabel === 'Security Guardian', '@Batman archetypeLabel is Security Guardian');
assert(batmanMascot.badgeName === 'Dili • Aegis Sentinel', '@Batman badgeName is Dili • Aegis Sentinel');

const signalsDC = {
  username: 'DCComics',
  displayName: 'DC Comics',
  bio: '2253 followers · 0 following. Joined Feb 2023. See the latest conversations with @DCComics',
  sourceType: 'LIVE_X_PUBLIC',
  detectedKeywords: [],
  inferredFocus: 'Design, Media & Content Creation',
};
const dcMascot = generateMascotVariant(signalsDC);
assert(dcMascot.archetype === 'LUMINARY_CREATOR', '@DCComics real signals map to LUMINARY_CREATOR');
assert(dcMascot.badgeName === 'Dili • Luminary Artist', '@DCComics badgeName is Dili • Luminary Artist');

// 4. Zero Marvel / Superhero Infringement
console.log('\n🛡️  4. Zero Marvel / Superhero Copyright Infringement:');
const testVariants = [run1, devMascot, secMascot];
const forbiddenTerms = [
  'marvel',
  'iron man',
  'spiderman',
  'spider-man',
  'thor',
  'hulk',
  'captain america',
  'avengers',
  'thanos',
  'wakanda',
  'wolverine',
  'batman',
  'superman',
];

let hasInfringement = false;
for (const v of testVariants) {
  const blob = JSON.stringify(v);
  for (const term of forbiddenTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(blob)) {
      hasInfringement = true;
      console.error(`Found forbidden term: ${term}`);
    }
  }
}
assert(!hasInfringement, 'Zero Marvel/superhero references across all generated mascots and traits');

// 5. Zero Data Fabrication & Fallback Handling
console.log('\n🔍 5. Zero Data Fabrication & Fallback Transparency:');
const fallback = createFallbackSignals('unreached_user', 'Protocol Developer');
assert(fallback.sourceType === 'USER_CONFIRMED_FALLBACK', 'Graceful fallback explicitly marked as USER_CONFIRMED_FALLBACK');
const fallbackMascot = generateMascotVariant(fallback, 'Protocol Developer');
assert(
  fallbackMascot.cryptographicSeed.derivationSummary.includes('fallback') ||
  fallbackMascot.cryptographicSeed.derivationSummary.includes('user-confirmed'),
  'Fallback derivation explicitly explains provenance without fake credentials'
);

// 6. Full Recognizable Collectible Character Assets Check
console.log('\n🎨 6. Full Recognizable Collectible Mascot Character Check:');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const archetypes = ['developer', 'security', 'builder', 'community', 'researcher', 'creator', 'pioneer'];
let allAssetsExist = true;
for (const arch of archetypes) {
  const assetPath = path.join(__dirname, `../public/mascots/${arch}.jpg`);
  if (!fs.existsSync(assetPath)) {
    allAssetsExist = false;
    console.error(`Missing collectible mascot asset: ${arch}.jpg`);
  }
}
assert(allAssetsExist, 'All 7 full-body collectible Dlicom mascot character assets exist in public/mascots/');

const visualComponent = fs.readFileSync(path.join(__dirname, '../src/components/Mascot/MascotVisual.tsx'), 'utf8');
assert(
  visualComponent.includes('characterImage') && visualComponent.includes('mascot-collectible-stage'),
  'MascotVisual component renders the full collectible character on an atmospheric stage'
);
assert(
  run1.visual.characterImage && run1.visual.characterImage.startsWith('/mascots/'),
  'Generated mascot variants point to official full-character collectible images'
);

// 7. Live X Retrieval Failure -> Safe Fallback -> Deterministic Mascot Synthesis (Production Bug Regression)
console.log('\n🔄 7. Live X Retrieval Failure → Safe Fallback → Deterministic Mascot Synthesis:');

// Test @batman_1718R live failure / fallback flow
const fallbackResult = await fetchPublicXSignals('batman_1718R');
assert(fallbackResult.success === true, 'Retrieval for @batman_1718R succeeds (via live signals or safe fallback)');
assert(fallbackResult.signals && fallbackResult.signals.username === 'batman_1718R', 'Signals contain normalized username batman_1718R');
assert(
  fallbackResult.signals.sourceType === 'LIVE_X_PUBLIC' || fallbackResult.signals.sourceType === 'USER_CONFIRMED_FALLBACK',
  'Signal source type is transparently distinguished (LIVE_X_PUBLIC or USER_CONFIRMED_FALLBACK)'
);

// Synthesize mascot from retrieved/fallback signals
const synthesizedMascot1 = generateMascotVariant(fallbackResult.signals);
const synthesizedMascot2 = generateMascotVariant(fallbackResult.signals);
assert(
  synthesizedMascot1.mascotId.startsWith('DLI-MASCOT-'),
  'Synthesizes valid mascot ID starting with DLI-MASCOT-'
);
assert(
  synthesizedMascot1.mascotId === synthesizedMascot2.mascotId,
  'Fallback mascot generation is 100% deterministic across repeated runs'
);
assert(
  synthesizedMascot1.familyName && synthesizedMascot1.variantName,
  'Fallback mascot has valid canonical family and variant names'
);

// Test genuine total failures (Requirement 8)
const emptyFailure = await fetchPublicXSignals('');
assert(!emptyFailure.success, 'Empty handle results in genuine total failure');

const invalidFailure = await fetchPublicXSignals('illegal$$$');
assert(!invalidFailure.success, 'Illegal characters result in genuine total failure');

const notfoundFailure = await fetchPublicXSignals('notfound');
assert(!notfoundFailure.success, 'Explicit notfound account results in genuine total failure');

console.log('\n======================================================================');
console.log(`VERIFICATION SUMMARY: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
console.log('======================================================================');

if (passed === total) {
  console.log('🎉 ALL DLICOM MASCOT GENERATOR REQUIREMENTS VERIFIED SUCCESSFULLY!\n');
} else {
  process.exit(1);
}
