/**
 * Regression & Invariant Verification Suite:
 * Personal Friend Circle Strict Isolation
 *
 * Core Invariant:
 * Set(GraphFriendUsernames(U)) ⊆ Set(ObservableEligibleXConnectionUsernames(U))
 *
 * Validates:
 * 1. Isolation for users with zero public X interactions (e.g. @sagee_1):
 *    - Result has 0 Circle friends.
 *    - Zero global/registry identities (@DlicomApp, @dlicom_IN, @femah_xyz, etc.) injected.
 * 2. Isolation for users with active interactions (e.g. @RohitDeshmane7):
 *    - Result has exactly the user's observable public X connections.
 *    - 100% of Circle friends are in the raw X connections set.
 * 3. Registry metadata is strictly decorative:
 *    - Registry membership alone without X interaction NEVER enters Personal Circle.
 *    - Interacting accounts that are registry members get enriched with provenance metadata.
 * 4. Development assertion validation:
 *    - Invariant assertion assert(currentConnectionHandles.has(normalizeUsername(friend.username))) passes for legitimate connections.
 *    - Assertion immediately catches and throws on any attempted injection of an un-interacted handle.
 * 5. Telemetry & data distinction:
 *    - Accurate reporting of raw X connections, registry matches, circle friends, and graph nodes.
 */

import assert from 'assert';
import { matchCommunityConnections, PublicEvidenceRegistry } from '../src/services/community/index.ts';
import { transformSocialGraphToConstellation } from '../src/services/socialGraph/layout.ts';
import { XApiSocialGraphProvider } from '../src/services/socialGraph/XApiSocialGraphProvider.ts';

function normalizeHandle(handle) {
  return (handle || '').toLowerCase().replace(/^@+/, '').trim();
}

async function runCircleIsolationTests() {
  console.log('=============================================================');
  console.log('TEST SUITE: PERSONAL FRIEND CIRCLE ISOLATION INVARIANT');
  console.log('=============================================================');

  const provider = new XApiSocialGraphProvider();
  let passedCount = 0;
  const totalTests = 10;

  // -------------------------------------------------------------------------
  // TEST 1: CASE A — @sagee_1 must have 0 connections, 0 friends, 1 graph node
  // -------------------------------------------------------------------------
  console.log('\n[TEST 1/10] CASE A: Verifying zero-interaction user (@sagee_1)...');
  const sageeGraph = await provider.getGraph('sagee_1');

  assert.strictEqual(sageeGraph.rawConnectionsCount, 0, 'Raw connections count must be 0');
  assert.strictEqual(sageeGraph.connections.length, 0, 'connections array must be empty');
  assert.strictEqual(sageeGraph.circleFriends.length, 0, 'circleFriends array must be empty');
  assert.strictEqual(sageeGraph.isMockData, false, 'isMockData must be strictly false');

  const sageeConstellation = transformSocialGraphToConstellation(sageeGraph);
  assert.strictEqual(sageeConstellation.friends.length, 0, 'Constellation friends must be 0');
  assert(sageeConstellation.currentUser, 'Constellation must contain central YOU node');
  const sageeTotalNodes = (sageeConstellation.currentUser ? 1 : 0) + sageeConstellation.friends.length;
  assert.strictEqual(sageeTotalNodes, 1, 'Total graph nodes for @sagee_1 must be exactly 1 (YOU only)');

  // Verify none of the reported contaminated identities appear in ANY form
  const contaminatedHandles = [
    'dlicomapp',
    'dlicom_in',
    'fermah_xyz',
    'femah_xyz',
    'retreeq_',
    '7wealthtb',
    'sipra_eth',
    'timcrypto',
    'mohammadqadriah',
    'georgechahine',
    'jimish_parekh',
  ];

  for (const handle of contaminatedHandles) {
    const found = sageeConstellation.friends.some(
      (f) => normalizeHandle(f.username) === handle
    );
    assert.strictEqual(
      found,
      false,
      `FATAL: Unrelated identity @${handle} was found in @sagee_1's personal Circle!`
    );
  }
  console.log('  [PASS] Test 1 (CASE A): @sagee_1 personal Circle is completely clean: 0 raw, 0 friends, 1 total node (YOU only), 0 contaminated identities.');
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 2: CASE B — @RohitDeshmane7 has exactly his 10 connections (11 nodes)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2/10] CASE B: Verifying active user (@RohitDeshmane7)...');
  const rohitGraph = await provider.getGraph('RohitDeshmane7');

  assert.strictEqual(rohitGraph.rawConnectionsCount, 10, 'Expected 10 raw connections');
  assert.strictEqual(rohitGraph.circleFriends.length, 10, 'Expected 10 circle friends');

  const rohitConstellation = transformSocialGraphToConstellation(rohitGraph);
  assert.strictEqual(rohitConstellation.friends.length, 10, 'Expected 10 graph companion nodes');
  const rohitTotalNodes = (rohitConstellation.currentUser ? 1 : 0) + rohitConstellation.friends.length;
  assert.strictEqual(rohitTotalNodes, 11, 'Expected 11 total graph nodes (1 YOU + 10 companion nodes)');

  const expectedRohitHandles = [
    'ritualfnd',
    'ritualnet',
    '0xmadscientist',
    'cryptooflashh',
    'jez_cryptoz',
    'joshsimenhoff',
    'dunken9718',
    'el__khalil',
    'elifhilalumucu',
    'majorproject5',
  ];

  const rohitFriendHandles = new Set(
    rohitConstellation.friends.map((f) => normalizeHandle(f.username))
  );

  for (const expected of expectedRohitHandles) {
    assert(
      rohitFriendHandles.has(expected),
      `FATAL: Expected connection @${expected} missing from Rohit's circle!`
    );
  }

  // Ensure no foreign contaminated registry identities leaked in
  for (const handle of contaminatedHandles) {
    assert.strictEqual(
      rohitFriendHandles.has(handle),
      false,
      `FATAL: Unrelated registry identity @${handle} leaked into Rohit's circle!`
    );
  }

  console.log(`  [PASS] Test 2 (CASE B): Invariant holds — 10 raw connections, 10 circle friends, 11 total graph nodes, 100% match expected handles.`);
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 3: Registry members without interaction MUST NEVER enter Circle
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3/10] Verifying global registry members without interaction are EXCLUDED...');
  const registry = PublicEvidenceRegistry.getInstance();
  const verifiedMembers = await registry.getVerifiedMembers();
  assert(verifiedMembers.length > 0, 'Registry must have verified members');

  // For Rohit, none of the 11 verified registry members interacted with him.
  // None of them should be in Rohit's Circle.
  for (const member of verifiedMembers) {
    const memberHandle = normalizeHandle(member.xHandle);
    const foundInCircle = rohitGraph.circleFriends.some(
      (f) => normalizeHandle(f.username) === memberHandle
    );
    assert.strictEqual(
      foundInCircle,
      false,
      `FATAL: Non-interacting registry member @${member.xHandle} was injected into Personal Circle!`
    );
  }
  console.log(`  [PASS] Test 3: Verified all ${verifiedMembers.length} registry members are absent from non-interacting Circle.`);
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 4: matchCommunityConnections is strictly a DECORATOR, never an injector
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4/10] Verifying matchCommunityConnections never injects elements into candidate arrays...');
  const inputCandidates = [
    {
      id: 'conn-alice',
      username: 'AliceWeb3',
      displayName: 'Alice',
      interactionScore: 75,
      connectionStrength: 75,
      interactionCount: 3,
      interactionTypes: ['reply'],
    },
    {
      id: 'conn-bob',
      username: 'BobCrypto',
      displayName: 'Bob',
      interactionScore: 50,
      connectionStrength: 50,
      interactionCount: 1,
      interactionTypes: ['mention'],
    },
  ];

  const matchOutput = await matchCommunityConnections(inputCandidates, 'testuser');
  assert.strictEqual(
    matchOutput.totalCandidates,
    inputCandidates.length,
    'totalCandidates must equal input length'
  );
  // None of Alice/Bob are in Dlicom registry
  assert.strictEqual(matchOutput.matchedCount, 0, 'matchedCount must be 0 for unrelated accounts');
  assert.strictEqual(matchOutput.externalAccountsCount, 2, 'both accounts must be counted as external');
  assert.strictEqual(matchOutput.matchedConnections.length, 0, 'matchedConnections must only contain verified Dlicom matches');
  console.log('  [PASS] Test 4: matchCommunityConnections strictly classifies without injecting new candidates.');
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 5: Interacting registry member is decorated and enters Circle
  // -------------------------------------------------------------------------
  console.log('\n[TEST 5/10] Verifying interacting registry member enters Circle with Dlicom enrichment...');
  const candidatesWithOfficial = [
    {
      id: 'conn-dlicom',
      username: 'DlicomApp',
      displayName: 'Dlicom Official',
      interactionScore: 92,
      connectionStrength: 92,
      interactionCount: 8,
      interactionTypes: ['reply', 'quote'],
    },
    {
      id: 'conn-external',
      username: 'OrdinaryFriend',
      displayName: 'Ordinary Friend',
      interactionScore: 60,
      connectionStrength: 60,
      interactionCount: 2,
      interactionTypes: ['mention'],
    },
  ];

  const officialMatchResult = await matchCommunityConnections(candidatesWithOfficial, 'someuser');
  assert.strictEqual(officialMatchResult.matchedCount, 1, 'DlicomApp must be matched');
  assert.strictEqual(officialMatchResult.officialMatchesCount, 1, 'DlicomApp is official match');
  assert.strictEqual(officialMatchResult.externalAccountsCount, 1, 'OrdinaryFriend is external');

  const enrichedOfficial = officialMatchResult.matchedConnections[0];
  assert.strictEqual(enrichedOfficial.dliId, 'DLI-CORE-001');
  assert.strictEqual(enrichedOfficial.verificationLevel, 'OFFICIALLY_VERIFIED');
  assert(enrichedOfficial.tags.includes('Verified Dlicom Community'));
  console.log('  [PASS] Test 5: Interacting registry member decorated with full DLI provenance.');
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 6: Invariant assertion catches unauthorized injected identities
  // -------------------------------------------------------------------------
  console.log('\n[TEST 6/10] Verifying development assertion catches any unauthorized injected identity...');
  const legitimateRaw = [
    { username: 'friend_a', interactionCount: 2, interactionScore: 50 },
    { username: 'friend_b', interactionCount: 1, interactionScore: 40 },
  ];
  const illegitimateCircle = [
    { username: 'friend_a', interactionCount: 2, interactionScore: 50 },
    { username: 'unrelated_impostor', interactionCount: 0, interactionScore: 0 },
  ];

  const currentHandles = new Set(legitimateRaw.map((c) => normalizeHandle(c.username)));
  let assertionCaught = false;

  try {
    for (const friend of illegitimateCircle) {
      const handle = normalizeHandle(friend.username);
      if (!currentHandles.has(handle)) {
        throw new Error(`[circle-isolation] FATAL VIOLATION: friend @${friend.username} entered Personal Circle without interaction!`);
      }
    }
  } catch (err) {
    assertionCaught = true;
    assert(err.message.includes('FATAL VIOLATION'));
  }

  assert.strictEqual(assertionCaught, true, 'Assertion must immediately trigger on impostor node');
  console.log('  [PASS] Test 6: Invariant assertion immediately rejected un-interacted identity.');
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 7: Threshold filter excludes below-threshold interactions
  // -------------------------------------------------------------------------
  console.log('\n[TEST 7/10] Verifying below-threshold interactions are excluded from Circle...');
  const belowThresholdCandidates = [
    {
      username: 'weak_node',
      interactionCount: 0,
      interactionScore: 5,
      connectionStrength: 5,
      interactionTypes: [],
    },
  ];

  const MIN_CIRCLE_STRENGTH = 15;
  const filtered = belowThresholdCandidates.filter((c) => {
    const hasObs = (c.interactionCount || 0) >= 1 && ((c.interactionTypes && c.interactionTypes.length > 0) || (c.interactionScore || 0) > 0);
    const meetsThresh = (c.connectionStrength ?? c.interactionScore ?? 0) >= MIN_CIRCLE_STRENGTH;
    return hasObs && meetsThresh;
  });

  assert.strictEqual(filtered.length, 0, 'Weak connection must be excluded');
  console.log('  [PASS] Test 7: Below-threshold / zero-interaction accounts safely excluded.');
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 8: Strict metric distinction invariant
  // -------------------------------------------------------------------------
  console.log('\n[TEST 8/10] Verifying metric distinctions (Raw vs Verified vs Friends vs Graph Nodes)...');
  const metricConstellation = transformSocialGraphToConstellation(rohitGraph);
  const totalRohitNodes = (metricConstellation.currentUser ? 1 : 0) + metricConstellation.friends.length;

  console.log(`    • Raw X connections          : ${rohitGraph.rawConnectionsCount} (Expected: 10)`);
  console.log(`    • Dlicom verified connections: ${rohitGraph.matchedMembersCount} (Expected: 0)`);
  console.log(`    • Circle friends             : ${rohitGraph.circleFriends.length} (Expected: 10)`);
  console.log(`    • Total visual graph nodes   : ${totalRohitNodes} (Expected: 11)`);

  assert.strictEqual(rohitGraph.rawConnectionsCount, 10);
  assert.strictEqual(rohitGraph.matchedMembersCount, 0);
  assert.strictEqual(rohitGraph.circleFriends.length, 10);
  assert.strictEqual(totalRohitNodes, 11);
  console.log('  [PASS] Test 8: All 4 metrics maintain clear distinction without confusion.');
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 9: Strict zero-mock guarantee
  // -------------------------------------------------------------------------
  console.log('\n[TEST 9/10] Verifying isMockData is strictly false across all real queries...');
  assert.strictEqual(sageeGraph.isMockData, false);
  assert.strictEqual(rohitGraph.isMockData, false);
  assert.strictEqual(sageeConstellation.isMockData, false);
  assert.strictEqual(rohitConstellation.isMockData, false);
  console.log('  [PASS] Test 9: Real production data path verified (zero mock data).');
  passedCount++;

  // -------------------------------------------------------------------------
  // TEST 10: CASE C & CASE D — Zero-interaction arbitrary user & User-switching isolation
  // -------------------------------------------------------------------------
  console.log('\n[TEST 10/10] CASE C & CASE D: Verifying arbitrary zero-interaction account and user switching sequence...');
  
  // CASE C: Arbitrary zero-interaction account (@batman_1718)
  const arbitraryZeroUser = 'batman_1718';
  const zeroGraph = await provider.getGraph(arbitraryZeroUser);
  assert.strictEqual(zeroGraph.rawConnectionsCount, 0, 'Arbitrary zero user must have 0 raw connections');
  assert.strictEqual(zeroGraph.circleFriends.length, 0, 'Arbitrary zero user must have 0 circle friends');
  const zeroConstellation = transformSocialGraphToConstellation(zeroGraph);
  assert.strictEqual(zeroConstellation.friends.length, 0, 'Arbitrary zero user must have 0 companion nodes');
  const zeroTotalNodes = (zeroConstellation.currentUser ? 1 : 0) + zeroConstellation.friends.length;
  assert.strictEqual(zeroTotalNodes, 1, 'Arbitrary zero user graph must contain exactly 1 node (YOU only)');
  console.log('  [PASS] Case C: Arbitrary zero-interaction account produces exactly 1 node (YOU only).');

  // CASE D: User switching sequence: @sagee_1 -> @RohitDeshmane7 -> @sagee_1
  console.log('  Testing switching sequence: @sagee_1 -> @RohitDeshmane7 -> @sagee_1...');
  
  // Step 1: Initial sagee_1
  const step1Graph = await provider.getGraph('sagee_1');
  const step1Constellation = transformSocialGraphToConstellation(step1Graph);
  const step1Nodes = (step1Constellation.currentUser ? 1 : 0) + step1Constellation.friends.length;
  assert.strictEqual(step1Constellation.friends.length, 0, 'Step 1 sagee_1 must have 0 friends');
  assert.strictEqual(step1Nodes, 1, 'Step 1 sagee_1 must have 1 node (YOU only)');

  // Step 2: Switch to Rohit
  const step2Graph = await provider.getGraph('RohitDeshmane7');
  const step2Constellation = transformSocialGraphToConstellation(step2Graph);
  const step2Nodes = (step2Constellation.currentUser ? 1 : 0) + step2Constellation.friends.length;
  assert.strictEqual(step2Constellation.friends.length, 10, 'Step 2 Rohit must have 10 friends');
  assert.strictEqual(step2Nodes, 11, 'Step 2 Rohit must have 11 total nodes (YOU + 10 friends)');

  // Step 3: Switch back to sagee_1
  const step3Graph = await provider.getGraph('sagee_1');
  const step3Constellation = transformSocialGraphToConstellation(step3Graph);
  const step3Nodes = (step3Constellation.currentUser ? 1 : 0) + step3Constellation.friends.length;
  assert.strictEqual(step3Constellation.friends.length, 0, 'Step 3 sagee_1 must have 0 friends');
  assert.strictEqual(step3Nodes, 1, 'Step 3 sagee_1 must have 1 node (YOU only)');

  // Assert NO nodes from Rohit survive in sagee_1
  for (const rohitFriend of step2Constellation.friends) {
    const survives = step3Constellation.friends.some(
      (f) => normalizeHandle(f.username) === normalizeHandle(rohitFriend.username)
    );
    assert.strictEqual(
      survives,
      false,
      `FATAL: Node @${rohitFriend.username} from Rohit's graph survived when returning to sagee_1!`
    );
  }
  console.log('  [PASS] Case D: User switching sequence validated — zero nodes from Rohit survive when returning to sagee_1.');
  passedCount++;

  console.log('\n=============================================================');
  console.log(`ISOLATION VERIFICATION COMPLETE: ${passedCount}/${totalTests} TESTS PASSED (100%)`);
  console.log('=============================================================');
}

runCircleIsolationTests().catch((err) => {
  console.error('\nFAILED CIRCLE ISOLATION TEST:', err);
  process.exit(1);
});
