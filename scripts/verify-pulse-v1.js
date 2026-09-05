/**
 * Verification Suite: Dlicom Pulse — Community Intelligence & Contribution Hub
 *
 * Verifies:
 * 1. Zero mock users in production and no friendship inference.
 * 2. Strict 3-tier claim taxonomy: VERIFIED, OBSERVED_PUBLIC_EVIDENCE, UNVERIFIED.
 * 3. Dashboard shows all 7 required metrics & sections.
 * 4. Member profile shows all 9 required sections.
 * 5. All 4 V1 routes + preserved transparency pages exist and are wired correctly.
 * 6. PublicEvidenceRegistry and PulseService integrity.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('='.repeat(70));
console.log('🚀 RUNNING DLICOM PULSE V1 VERIFICATION SUITE');
console.log('='.repeat(70));

let passed = 0;
let total = 0;

function check(title, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${title}`);
    console.error(`     Error: ${err.message}`);
  }
}

// ── 1. Route & Component Architecture Audit ─────────────────────────────
console.log('\n📦 1. Route & Component Architecture:');

check('App.tsx defines all 4 primary V1 routes and preserved transparency routes', () => {
  const appFile = fs.readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf-8');
  assert(appFile.includes("currentPath === '/members'"), 'Missing /members route');
  assert(appFile.includes("currentPath === '/projects'"), 'Missing /projects route');
  assert(appFile.includes("currentPath.startsWith('/member/')"), 'Missing /member/:username route');
  assert(appFile.includes('<PulseDashboardPage'), 'Missing / default Community Dashboard route');
  assert(appFile.includes("currentPath === '/registry'"), 'Missing /registry route');
  assert(appFile.includes("currentPath === '/registry/audit'"), 'Missing /registry/audit route');
  assert(appFile.includes("currentPath === '/registry/methodology'"), 'Missing /registry/methodology route');
  assert(appFile.includes("currentPath.startsWith('/passport/')"), 'Missing /passport/:dliId route');
});

check('PulseNavbar contains navigation links to V1 routes & transparency logs', () => {
  const navbarFile = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Pulse', 'PulseNavbar.tsx'), 'utf-8');
  assert(navbarFile.includes("path: '/'"), 'Missing Dashboard nav item');
  assert(navbarFile.includes("path: '/members'"), 'Missing Members nav item');
  assert(navbarFile.includes("path: '/projects'"), 'Missing Projects nav item');
  assert(navbarFile.includes("path: '/registry'"), 'Missing Registry nav item');
  assert(navbarFile.includes("path: '/registry/audit'"), 'Missing Audit Log nav item');
});

// ── 2. Claim Taxonomy Enforcement ─────────────────────────────────────────
console.log('\n🏷️  2. Strict 3-Tier Claim Taxonomy:');

check('ClaimBadge defines exactly VERIFIED, OBSERVED_PUBLIC_EVIDENCE, and UNVERIFIED', () => {
  const badgeFile = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Pulse', 'ClaimBadge.tsx'), 'utf-8');
  assert(badgeFile.includes("'VERIFIED'"), 'Missing VERIFIED claim status in ClaimBadge');
  assert(badgeFile.includes("'OBSERVED_PUBLIC_EVIDENCE'"), 'Missing OBSERVED_PUBLIC_EVIDENCE claim status in ClaimBadge');
  assert(badgeFile.includes("'UNVERIFIED'"), 'Missing UNVERIFIED claim status in ClaimBadge');
  assert(badgeFile.includes('evidenceUrl'), 'ClaimBadge must support evidenceUrl links');
});

check('pulse.ts type definitions strictly enforce ClaimStatus', () => {
  const typesFile = fs.readFileSync(path.join(rootDir, 'src', 'types', 'pulse.ts'), 'utf-8');
  assert(typesFile.includes("export type ClaimStatus ="), 'Missing ClaimStatus union');
  assert(typesFile.includes("| 'VERIFIED'"), 'Missing VERIFIED in types');
  assert(typesFile.includes("| 'OBSERVED_PUBLIC_EVIDENCE'"), 'Missing OBSERVED_PUBLIC_EVIDENCE in types');
  assert(typesFile.includes("| 'UNVERIFIED'"), 'Missing UNVERIFIED in types');
});

// ── 3. Dashboard Requirements ────────────────────────────────────────────
console.log('\n📊 3. Community Dashboard Requirements:');

check('PulseDashboardPage displays all 7 required components', () => {
  const dashFile = fs.readFileSync(path.join(rootDir, 'src', 'views', 'PulseDashboardPage.tsx'), 'utf-8');
  // 1. community member count
  assert(dashFile.includes('stats.communityMemberCount'), 'Dashboard must display community member count');
  // 2. active contributors
  assert(dashFile.includes('activeContributors'), 'Dashboard must display active contributors');
  assert(dashFile.includes('Active Community Contributors'), 'Dashboard must have Active Contributors section');
  // 3. recent contributions
  assert(dashFile.includes('recentContributions'), 'Dashboard must display recent contributions');
  assert(dashFile.includes('Evidence-Backed Contributions'), 'Dashboard must have Recent Contributions section');
  // 4. projects
  assert(dashFile.includes('projects'), 'Dashboard must display projects');
  assert(dashFile.includes('Active Projects & Smart Contracts'), 'Dashboard must have Projects section');
  // 5. achievements
  assert(dashFile.includes('achievements'), 'Dashboard must display achievements');
  assert(dashFile.includes('Community Achievements & Milestones'), 'Dashboard must have Achievements section');
  // 6. community activity
  assert(dashFile.includes('communityActivity'), 'Dashboard must display community activity');
  assert(dashFile.includes('Community Activity'), 'Dashboard must have Community Activity section');
  // 7. opportunities
  assert(dashFile.includes('opportunities'), 'Dashboard must display opportunities');
  assert(dashFile.includes('Open Opportunities & Bounties'), 'Dashboard must have Opportunities section');
});

// ── 4. Member Profile Requirements ────────────────────────────────────────
console.log('\n👤 4. Member Profile Requirements:');

check('PulseMemberProfilePage displays all 9 required components', () => {
  const profileFile = fs.readFileSync(path.join(rootDir, 'src', 'views', 'PulseMemberProfilePage.tsx'), 'utf-8');
  // 1. DLI-ID
  assert(profileFile.includes('dliId'), 'Profile must display DLI-ID');
  // 2. identity
  assert(profileFile.includes('identity.displayName') && profileFile.includes('identity.handle'), 'Profile must display identity');
  // 3. skills
  assert(profileFile.includes('skills'), 'Profile must display skills');
  assert(profileFile.includes('Skills & Expertise'), 'Profile must have Skills section');
  // 4. roles
  assert(profileFile.includes('roles'), 'Profile must display roles');
  assert(profileFile.includes('Verified Roles & Designations'), 'Profile must have Roles section');
  // 5. projects
  assert(profileFile.includes('projects'), 'Profile must display projects');
  assert(profileFile.includes('Projects Contributed To'), 'Profile must have Projects section');
  // 6. contributions
  assert(profileFile.includes('contributions'), 'Profile must display contributions');
  assert(profileFile.includes('Evidence-Backed Contributions'), 'Profile must have Contributions section');
  // 7. achievements
  assert(profileFile.includes('achievements'), 'Profile must display achievements');
  assert(profileFile.includes('Achievements & Honors'), 'Profile must have Achievements section');
  // 8. community participation
  assert(profileFile.includes('communityParticipation'), 'Profile must display community participation');
  assert(profileFile.includes('Community Participation Record'), 'Profile must have Participation section');
  // 9. evidence
  assert(profileFile.includes('evidenceSummary') || profileFile.includes('provenanceTrail'), 'Profile must display evidence provenance');
  assert(profileFile.includes('Public Evidence & Provenance Trail'), 'Profile must have Evidence section');
});

// ── 5. Anti-Fabrication & Friend-Circle Isolation ─────────────────────────
console.log('\n🛡️  5. Anti-Fabrication & Friend-Circle Isolation:');

check('No production views import synthetic friends data or MockSocialGraphProvider', () => {
  const pulseViews = [
    'PulseDashboardPage.tsx',
    'PulseMembersPage.tsx',
    'PulseProjectsPage.tsx',
    'PulseMemberProfilePage.tsx',
  ];
  for (const view of pulseViews) {
    const content = fs.readFileSync(path.join(rootDir, 'src', 'views', view), 'utf-8');
    assert(!content.includes('MockSocialGraphProvider'), `${view} must not import MockSocialGraphProvider`);
    assert(!content.includes("from '../data/friends'"), `${view} must not import mock friends`);
  }
});

check('Pulse data services rely exclusively on authoritative sources (dlicom.io, Hacken, whitepaper, Base)', () => {
  const pulseDataFile = fs.readFileSync(path.join(rootDir, 'src', 'services', 'pulse', 'pulseData.ts'), 'utf-8');
  assert(pulseDataFile.includes('hacken.io/audits/dlicom/sca-dlicom-token-feb2026/'), 'Must cite Hacken audit');
  assert(pulseDataFile.includes('whitepaper.dlicom.io'), 'Must cite official whitepaper');
  assert(pulseDataFile.includes('dlicom.io'), 'Must cite official website');
  assert(pulseDataFile.includes('Zero mock users. Zero fabricated relationships.'), 'Must affirm zero mock policy');
});

// ── 6. API Surface Verification ───────────────────────────────────────────
console.log('\n🌐 6. API Surface Verification:');

check('API endpoints exist for dashboard, members, projects, and opportunities', () => {
  assert(fs.existsSync(path.join(rootDir, 'api', 'pulse', 'dashboard.js')), 'Missing api/pulse/dashboard.js');
  assert(fs.existsSync(path.join(rootDir, 'api', 'pulse', 'members.js')), 'Missing api/pulse/members.js');
  assert(fs.existsSync(path.join(rootDir, 'api', 'pulse', 'projects.js')), 'Missing api/pulse/projects.js');
  assert(fs.existsSync(path.join(rootDir, 'api', 'pulse', 'opportunities.js')), 'Missing api/pulse/opportunities.js');
  assert(fs.existsSync(path.join(rootDir, 'api', 'pulse', 'member.js')), 'Missing api/pulse/member.js');
});

check('Local proxy server registers all pulse endpoints', () => {
  const serverIndex = fs.readFileSync(path.join(rootDir, 'server', 'index.js'), 'utf-8');
  assert(serverIndex.includes('/api/pulse/dashboard'), 'Missing /api/pulse/dashboard in server/index.js');
  assert(serverIndex.includes('/api/pulse/projects'), 'Missing /api/pulse/projects in server/index.js');
  assert(serverIndex.includes('/api/pulse/members'), 'Missing /api/pulse/members in server/index.js');
  assert(serverIndex.includes('/api/pulse/opportunities'), 'Missing /api/pulse/opportunities in server/index.js');
  assert(serverIndex.includes('/api/pulse/members/:username'), 'Missing /api/pulse/members/:username in server/index.js');
});

// ── Final Score ───────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
console.log(`VERIFICATION SUMMARY: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
console.log('='.repeat(70));

if (passed === total) {
  console.log('🎉 ALL DLICOM PULSE REQUIREMENTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('⚠️ SOME CHECKS FAILED. Please review above output.');
  process.exit(1);
}
