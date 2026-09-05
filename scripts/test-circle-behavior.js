import { matchCommunityConnections } from '../src/services/community/index.ts';

async function testCircleBehavior() {
  console.log('Testing personal Circle matching behavior under public evidence rules...');

  // 1. Target Account: @RohitDeshmane7
  console.log('\n--- SCENARIO 1: Personal Circle for @RohitDeshmane7 ---');
  // Simulated public interactions observed for RohitDeshmane7:
  // e.g. interactions with ritualnet, web3 builders, and dlicomapp
  const rohitInteractions = [
    {
      username: 'ritualnet',
      displayName: 'Ritual',
      bio: 'AI execution layer on-chain',
      interactionTypes: ['reply', 'repost'],
    },
    {
      username: 'wbgames',
      displayName: 'WB Games',
      bio: 'Official Warner Bros Games account',
      interactionTypes: ['like'],
    },
    {
      username: '0xZeeve',
      displayName: 'Zeeve',
      bio: 'Web3 infrastructure automation',
      interactionTypes: ['mention'],
    },
  ];

  const rohitResult = await matchCommunityConnections(rohitInteractions, 'RohitDeshmane7');
  console.log(`Candidate interactions analyzed : ${rohitResult.totalCandidates}`);
  console.log(`Verified Dlicom Circle nodes    : ${rohitResult.matchedCount}`);
  console.log(`Potential Community Candidates   : ${rohitResult.potentialCandidates.length}`);
  console.log(`Filtered External Accounts       : ${rohitResult.externalAccountsCount}`);

  if (rohitResult.matchedCount === 0) {
    console.log('PASS: Zero verified members entered Circle constellation. Strict empty state triggered.');
  } else {
    console.error('FAIL: Unverified accounts leaked into Circle constellation.');
    process.exit(1);
  }

  if (rohitResult.potentialCandidates.length === 1 && rohitResult.potentialCandidates[0].normalizedHandle === '0xzeeve') {
    console.log('PASS: @0xZeeve successfully captured in Potential Dlicom Community candidate queue.');
  } else {
    console.error('FAIL: Candidate was not isolated properly.');
    process.exit(1);
  }

  // 2. Positive Dlicom-Member Fixture
  console.log('\n--- SCENARIO 2: Personal Circle with Verified Dlicom Connections ---');
  const positiveInteractions = [
    {
      username: 'mohammadqadriah',
      displayName: 'Mohammad Qadriah',
      bio: 'Chairman & Co-Founder @DlicomApp',
      interactionTypes: ['reply', 'quote'],
    },
    {
      username: 'dlicomapp',
      displayName: 'Dlicom',
      bio: 'AI-powered SocialFi on Base',
      interactionTypes: ['mention'],
    },
    {
      username: 'external_builder_42',
      displayName: 'External Builder',
      bio: 'Just another Web3 enthusiast',
      interactionTypes: ['reply'],
    },
  ];

  const positiveResult = await matchCommunityConnections(positiveInteractions, 'community_supporter');
  console.log(`Candidate interactions analyzed : ${positiveResult.totalCandidates}`);
  console.log(`Verified Dlicom Circle nodes    : ${positiveResult.matchedCount}`);
  console.log(`Potential Community Candidates   : ${positiveResult.potentialCandidates.length}`);
  console.log(`Filtered External Accounts       : ${positiveResult.externalAccountsCount}`);

  if (positiveResult.matchedCount === 2) {
    console.log('PASS: Exactly 2 verified Dlicom members entered the Circle.');
    for (const member of positiveResult.matchedConnections) {
      console.log(`  • Node: @${member.username} (${member.role})`);
    }
  } else {
    console.error('FAIL: Expected 2 verified Dlicom members.');
    process.exit(1);
  }

  if (positiveResult.externalAccountsCount === 1) {
    console.log('PASS: External builder account strictly excluded from Circle.');
  } else {
    console.error('FAIL: External account was not excluded.');
    process.exit(1);
  }

  // Check traceability
  const explanation = positiveResult.matchExplanations['mohammadqadriah'];
  console.log(`Traceable explanation for @mohammadqadriah: "${explanation}"`);
  if (explanation && explanation.includes('mohammadqadriah') && explanation.includes('DLI-CORE-002')) {
    console.log('PASS: Traceable explanation verified.');
  } else {
    console.error('FAIL: Missing or invalid explanation.');
    process.exit(1);
  }

  console.log('\nALL CIRCLE BEHAVIOR TESTS PASSED PERFECTLY.');
}

testCircleBehavior().catch((err) => {
  console.error('Error in circle behavior test:', err);
  process.exit(1);
});
