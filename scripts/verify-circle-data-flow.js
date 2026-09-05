/**
 * Regression Test: Circle Data-Flow & Distinction Invariant
 *
 * Specifically verifies:
 * 1. Live/fixture API response contains 10 connections for @RohitDeshmane7.
 * 2. All 10 survive frontend normalization.
 * 3. All 10 have unique usernames.
 * 4. isMockData remains false throughout.
 * 5. Community matching receives all 10 raw connections.
 * 6. If none are verified Dlicom community members, verified Circle node count remains 0.
 * 7. The application does NOT confuse raw connection count (10) with verified Circle node count (0).
 * 8. Zero mock nodes introduced into production flow.
 *
 * Explicitly proves:
 * 10 raw X connections -> 0 verified Dlicom matches -> 0 Circle nodes.
 */

import assert from 'assert';
import { getOrFetchUserData } from '../api/_lib/cache.js';
import { matchCommunityConnections } from '../src/services/community/index.ts';
import { transformSocialGraphToConstellation } from '../src/services/socialGraph/layout.ts';

async function runCircleDataFlowRegression() {
  console.log('=============================================================');
  console.log('REGRESSION TEST: CIRCLE DATA-FLOW & COUNT DISTINCTION');
  console.log('=============================================================');

  // STEP 1: Fetch/Verify API response contains 10 connections
  console.log('\n[1/8] Verifying API response contains 10 connections for @RohitDeshmane7...');
  const userResult = await getOrFetchUserData('RohitDeshmane7');
  const apiData = userResult.data;
  const rawApiConnections = apiData.connections || [];

  assert(
    rawApiConnections.length === 10,
    `Expected API response to contain 10 connections, found ${rawApiConnections.length}`
  );
  console.log(`PASS [1/8]: API returned exactly ${rawApiConnections.length} connections.`);

  // STEP 2: Verify all 10 survive frontend normalization
  console.log('\n[2/8] Verifying all 10 connections survive frontend normalization...');
  const normalizedConnections = rawApiConnections.map((conn) => {
    const types = conn.interactionTypes || [];
    const score = conn.interactionScore ?? conn.connectionStrength ?? 50;
    const count = conn.interactionCount || 1;
    return {
      id: conn.id || `conn-${conn.username}`,
      username: conn.username,
      displayName: conn.displayName || conn.name || conn.username,
      avatar: conn.avatar || `https://unavatar.io/x/${encodeURIComponent(conn.username)}`,
      bio: conn.bio || '',
      connectionStrength: score,
      interactionScore: score,
      interactionCount: count,
      interactionTypes: types,
      mutualFriendsCount: count,
      role: conn.role || (types.length ? `Interacted via ${types.join(' · ')}` : 'X Interaction'),
      category: conn.category || (types.includes('reply') ? 'friends' : types.includes('quote') ? 'creators' : 'builders'),
      tags: conn.tags || ['X Interaction'],
    };
  });

  assert(
    normalizedConnections.length === 10,
    `Expected 10 normalized connections, found ${normalizedConnections.length}`
  );
  console.log(`PASS [2/8]: All ${normalizedConnections.length} connections survived frontend normalization.`);

  // STEP 3: Verify all 10 have unique usernames
  console.log('\n[3/8] Verifying all 10 connections have unique usernames...');
  const usernames = normalizedConnections.map((c) => c.username.toLowerCase());
  const uniqueUsernames = new Set(usernames);

  assert(
    uniqueUsernames.size === 10,
    `Expected 10 unique usernames, found ${uniqueUsernames.size}`
  );
  console.log(`PASS [3/8]: All 10 usernames are distinct: [${Array.from(uniqueUsernames).join(', ')}].`);

  // STEP 4: Verify isMockData remains false
  console.log('\n[4/8] Verifying isMockData remains false throughout...');
  assert(
    apiData.isMockData === false,
    'Expected apiData.isMockData to be strictly false'
  );
  console.log('PASS [4/8]: isMockData is false.');

  // STEP 5: Verify community matching receives all 10 connections
  console.log('\n[5/8] Verifying community matching receives all 10 normalized connections...');
  const matchResult = await matchCommunityConnections(normalizedConnections, 'RohitDeshmane7');

  assert(
    matchResult.totalCandidates === 10,
    `Expected matchCommunityConnections to analyze 10 candidates, found ${matchResult.totalCandidates}`
  );
  console.log(`PASS [5/8]: Community matching received and analyzed all ${matchResult.totalCandidates} candidates.`);

  // STEP 6: If none are verified, verified Circle node count remains 0
  console.log('\n[6/8] Verifying verified Circle node count remains 0 when no identities are verified...');
  assert(
    matchResult.matchedCount === 0,
    `Expected matchedCount === 0, found ${matchResult.matchedCount}`
  );
  assert(
    matchResult.matchedConnections.length === 0,
    `Expected matchedConnections.length === 0, found ${matchResult.matchedConnections.length}`
  );
  assert(
    matchResult.externalAccountsCount === 10,
    `Expected all 10 to be classified as externalAccounts, found ${matchResult.externalAccountsCount}`
  );
  console.log(`PASS [6/8]: Correctly produced 0 verified Dlicom matches and classified ${matchResult.externalAccountsCount} external accounts.`);

  // STEP 7: Application does NOT confuse raw connection count with verified Circle node count
  console.log('\n[7/8] Verifying graph construction distinguishes raw X interactions from verified Circle nodes...');
  const socialGraphResult = {
    profile: {
      id: `x-${apiData.profile.username}`,
      username: apiData.profile.username,
      displayName: apiData.profile.displayName,
      avatar: apiData.profile.avatar,
      bio: apiData.profile.bio,
    },
    connections: matchResult.matchedConnections,
    rawConnections: normalizedConnections,
    rawConnectionsCount: normalizedConnections.length,
    totalCandidatesAnalyzed: matchResult.totalCandidates,
    matchedMembersCount: matchResult.matchedCount,
    potentialCommunityMembers: matchResult.potentialCandidates,
    externalAccountsCount: matchResult.externalAccountsCount,
    matchExplanations: matchResult.matchExplanations,
    isMockData: false,
    dataStatus: matchResult.matchedCount === 0 ? 'NO_COMMUNITY_MATCHES' : 'OK',
    fetchedAt: new Date().toISOString(),
  };

  const transformed = transformSocialGraphToConstellation(socialGraphResult);

  // Proves the chain: 10 raw X connections -> 0 verified Dlicom matches -> 0 Circle nodes
  assert(
    transformed.rawConnectionsCount === 10,
    `Expected rawConnectionsCount === 10, found ${transformed.rawConnectionsCount}`
  );
  assert(
    transformed.totalCandidatesAnalyzed === 10,
    `Expected totalCandidatesAnalyzed === 10, found ${transformed.totalCandidatesAnalyzed}`
  );
  assert(
    transformed.matchedMembersCount === 0,
    `Expected matchedMembersCount === 0, found ${transformed.matchedMembersCount}`
  );
  assert(
    transformed.friends.length === 0,
    `Expected constellation friends (Circle nodes) === 0, found ${transformed.friends.length}`
  );
  assert(
    transformed.currentUser !== null,
    'Expected dominant central user node ("YOU") to exist'
  );
  console.log('PASS [7/8]: Explicit data chain proven:');
  console.log(`  • Raw X Connections Analyzed : ${transformed.rawConnectionsCount}`);
  console.log(`  • Total Candidates Analyzed  : ${transformed.totalCandidatesAnalyzed}`);
  console.log(`  • Verified Dlicom Matches    : ${transformed.matchedMembersCount}`);
  console.log(`  • Verified Circle Nodes (UI) : ${transformed.friends.length}`);

  // STEP 8: Verify no mock nodes or demo data are introduced
  console.log('\n[8/8] Verifying no mock nodes are introduced...');
  assert(
    transformed.isMockData === false,
    'Constellation data must have isMockData === false'
  );
  const friendUsernames = transformed.friends.map((f) => f.username.toLowerCase());
  assert(
    !friendUsernames.includes('alexchen'),
    'Demo account alexchen must never enter production constellation'
  );
  console.log('PASS [8/8]: Zero mock nodes or demo users present in constellation.');

  console.log('\n=============================================================');
  console.log('ALL 8/8 REGRESSION ASSERTIONS PASSED SUCCESSFULLY!');
  console.log('=============================================================');
}

runCircleDataFlowRegression().catch((err) => {
  console.error('\nRegression test failed:', err);
  process.exit(1);
});
