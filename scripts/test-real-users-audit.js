/**
 * Adversarial User Testing Script
 * Tests:
 * 1. Verified Dlicom Member (mohammadqadriah, jimish_parekh)
 * 2. Community Participant / Lead (mohamedbelal)
 * 3. Candidate (0xzeeve, dlicom_ambassador)
 * 4. Completely External Person (vitalikbuterin)
 * 5. Username with little/no public data (unknownuser_9988)
 * 6. Invalid username ($$$invalid@@@)
 */

import assert from 'node:assert';
import { PulseService } from '../src/services/pulse/pulseService.ts';

async function runTests() {
  console.log('='.repeat(70));
  console.log('🧪 ADVERSARIAL USER AUDIT (Phase 10)');
  console.log('='.repeat(70));

  const pulse = PulseService.getInstance();

  // Test 1: Verified Dlicom Member
  console.log('\n[Case 1] Verified Dlicom Member: mohammadqadriah');
  const user1 = await pulse.getMemberProfile('mohammadqadriah');
  assert(user1 !== null, 'mohammadqadriah should exist');
  assert.strictEqual(user1.dliId, 'DLI-CORE-002');
  assert.strictEqual(user1.roles[0].claimStatus, 'VERIFIED');
  assert(user1.evidenceSummary.whyVerified.includes('Chairman & Co-Founder'));
  console.log('  ✅ DLI-ID:', user1.dliId, '| Status:', user1.roles[0].claimStatus, '| Score:', user1.evidenceSummary.confidenceScore);

  // Test 1b: Verified CTO
  console.log('\n[Case 1b] Verified Dlicom Member: jimish_parekh');
  const user1b = await pulse.getMemberProfile('jimish_parekh');
  assert(user1b !== null, 'jimish_parekh should exist');
  assert.strictEqual(user1b.dliId, 'DLI-CORE-004');
  assert.strictEqual(user1b.roles[0].claimStatus, 'VERIFIED');
  console.log('  ✅ DLI-ID:', user1b.dliId, '| Status:', user1b.roles[0].claimStatus, '| Score:', user1b.evidenceSummary.confidenceScore);

  // Test 2: Community Participant / Lead
  console.log('\n[Case 2] Community Lead: mohamedbelal');
  const user2 = await pulse.getMemberProfile('mohamedbelal');
  assert(user2 !== null, 'mohamedbelal should exist');
  assert.strictEqual(user2.dliId, 'DLI-LEAD-001');
  assert.strictEqual(user2.roles[0].claimStatus, 'VERIFIED');
  console.log('  ✅ DLI-ID:', user2.dliId, '| Role:', user2.roles[0].role, '| Status:', user2.roles[0].claimStatus);

  // Test 3: Candidate / Observed Public Evidence
  console.log('\n[Case 3] Candidate / Observed Partner: 0xzeeve');
  const user3 = await pulse.getMemberProfile('0xzeeve');
  assert(user3 !== null, '0xzeeve should exist');
  assert.strictEqual(user3.dliId, 'DLI-CAND-001');
  assert.strictEqual(user3.roles[0].claimStatus, 'UNVERIFIED');
  console.log('  ✅ DLI-ID:', user3.dliId, '| Status:', user3.roles[0].claimStatus, '| Level:', user3.evidenceSummary.verificationLevel);

  // Test 4: Completely External Person
  console.log('\n[Case 4] Completely External Person: vitalikbuterin');
  const user4 = await pulse.getMemberProfile('vitalikbuterin');
  assert.strictEqual(user4, null, 'vitalikbuterin must NOT be found in Dlicom registry');
  console.log('  ✅ Correctly returned null (no invented profile for external person)');

  // Test 5: Username with little/no public data
  console.log('\n[Case 5] Unknown Username: unknownuser_9988');
  const user5 = await pulse.getMemberProfile('unknownuser_9988');
  assert.strictEqual(user5, null, 'unknownuser_9988 must return null');
  console.log('  ✅ Correctly returned null (no invented profile for unknown handle)');

  // Test 6: Invalid Username
  console.log('\n[Case 6] Invalid Username: $$$invalid@@@');
  const user6 = await pulse.getMemberProfile('$$$invalid@@@');
  assert.strictEqual(user6, null, 'Invalid username must return null');
  console.log('  ✅ Correctly returned null (rejected invalid syntax)');

  // Test 7: DLI-ID Lookup
  console.log('\n[Case 7] Direct DLI-ID Lookup: DLI-CORE-003');
  const user7 = await pulse.getMemberProfile('DLI-CORE-003');
  assert(user7 !== null, 'DLI-CORE-003 should exist');
  assert.strictEqual(user7.identity.normalizedHandle, 'georgechahine');
  console.log('  ✅ Successfully resolved DLI-CORE-003 -> @georgechahine');

  console.log('\n' + '='.repeat(70));
  console.log('🎉 ALL 7 ADVERSARIAL USER TESTS PASSED! ZERO INVENTED INFORMATION.');
  console.log('='.repeat(70));
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
