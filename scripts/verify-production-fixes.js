import fs from 'fs';
import path from 'path';
import whitepaperHandler from '../api/community/whitepaper.js';
import connectionsHandler from '../api/x/users/[username]/connections.js';
import { OfficialAnnouncementProvider } from '../src/services/community/providers/OfficialAnnouncementProvider.ts';
import { matchCommunityConnections } from '../src/services/community/index.ts';
import { fetchXPublicProfile, deduplicateConnections } from '../api/_lib/xPublic.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  [FAIL] Test: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  [PASS] Test: ${message}`);
}

// Mock HTTP Request/Response Helper
function createMockReqRes({ method = 'GET', query = {}, url = '/' } = {}) {
  let statusCode = 200;
  const headers = {};
  let responseData = null;

  const req = {
    method,
    query,
    url,
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    setHeader(key, value) {
      headers[key] = value;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getHeaders: () => headers,
    getData: () => responseData,
  };

  return { req, res };
}

async function runProductionFixesVerification() {
  console.log('=============================================================');
  console.log('PRODUCTION DEPLOYMENT FIXES & AUDIT VERIFICATION');
  console.log('=============================================================\n');

  // --- TEST A: Whitepaper proxy exists and handles upstream response safely ---
  console.log('--- A. WHITEPAPER SERVERLESS PROXY SAFETY ---');
  {
    // Test A1: Reject non-GET
    const { req: reqPost, res: resPost } = createMockReqRes({ method: 'POST' });
    await whitepaperHandler(reqPost, resPost);
    assert(resPost.getStatusCode() === 405, 'Whitepaper proxy rejects non-GET with 405');

    // Test A2: Live GET upstream check
    const { req: reqGet, res: resGet } = createMockReqRes({ method: 'GET' });
    await whitepaperHandler(reqGet, resGet);
    const data = resGet.getData();
    assert(resGet.getStatusCode() === 200, `Whitepaper proxy returns HTTP 200 (actual: ${resGet.getStatusCode()})`);
    assert(typeof data?.responseTimeMs === 'number', 'Whitepaper proxy measures real response latency');
    assert(data?.sourceUrl === 'https://whitepaper.dlicom.io/', 'Whitepaper proxy source URL is official whitepaper');

    // Test A3: Provider handles proxy JSON response and preserves primaryUrl provenance
    const provider = new OfficialAnnouncementProvider();
    const mockProxyFetch = async (url) => {
      if (url === '/api/community/whitepaper') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            status: 200,
            responseTimeMs: 150,
            sourceUrl: 'https://whitepaper.dlicom.io/',
          }),
        };
      }
      return { ok: false, status: 404 };
    };

    // Test customFetch bypass (direct upstream injection for test suite)
    const customFetchRes = await provider.fetchRecords(async (url) => {
      assert(url === 'https://whitepaper.dlicom.io/', 'customFetch targets real upstream URL directly');
      return { ok: true, status: 200 };
    });
    assert(customFetchRes.health.status === 'HEALTHY', 'customFetch direct injection produces HEALTHY health');
    assert(customFetchRes.health.url === 'https://whitepaper.dlicom.io/', 'Health record preserves primaryUrl');

    // Test proxy simulation fetch
    const proxySimulationRes = await provider.fetchRecords(mockProxyFetch);
    assert(proxySimulationRes.health.url === 'https://whitepaper.dlicom.io/', 'Proxy simulation retains primaryUrl');
  }

  // --- TEST B & C: X Vercel endpoint validates handles and rejects invalid handles ---
  console.log('\n--- B & C. X VERCEL ENDPOINT HANDLE VALIDATION & REJECTION ---');
  {
    // Reject non-GET
    const { req: postReq, res: postRes } = createMockReqRes({ method: 'POST', query: { username: 'valid_user' } });
    await connectionsHandler(postReq, postRes);
    assert(postRes.getStatusCode() === 405, 'X endpoint rejects POST with 405');

    // Reject empty handle
    const { req: reqEmpty, res: resEmpty } = createMockReqRes({ query: { username: '' } });
    await connectionsHandler(reqEmpty, resEmpty);
    assert(resEmpty.getStatusCode() === 400, 'X endpoint rejects empty handle with 400');

    // Reject whitespace handle
    const { req: reqSpaces, res: resSpaces } = createMockReqRes({ query: { username: '   ' } });
    await connectionsHandler(reqSpaces, resSpaces);
    assert(resSpaces.getStatusCode() === 400, 'X endpoint rejects whitespace handle with 400');

    // Reject illegal characters
    const { req: reqSpecial, res: resSpecial } = createMockReqRes({ query: { username: 'user$bad!' } });
    await connectionsHandler(reqSpecial, resSpecial);
    assert(resSpecial.getStatusCode() === 400, 'X endpoint rejects illegal characters ($!) with 400');

    // Reject overly long handles (>25 chars)
    const { req: reqLong, res: resLong } = createMockReqRes({ query: { username: 'this_is_way_too_long_for_an_x_handle_2026' } });
    await connectionsHandler(reqLong, resLong);
    assert(resLong.getStatusCode() === 400, 'X endpoint rejects handles >25 chars with 400');

    // Clean leading @ symbol
    const { req: reqAt, res: resAt } = createMockReqRes({ query: { username: '@rohitdeshmane7' } });
    await connectionsHandler(reqAt, resAt);
    assert(resAt.getStatusCode() === 200, 'X endpoint strips leading @ and succeeds with 200');
    const dataAt = resAt.getData();
    assert(dataAt?.profile?.username.toLowerCase() === 'rohitdeshmane7', 'Normalized username stripped @ correctly');
  }

  // --- TEST D: Real X flow returns isMockData=false ---
  console.log('\n--- D. REAL X FLOW GUARANTEES isMockData=false ---');
  {
    const profile = await fetchXPublicProfile('RohitDeshmane7');
    assert(profile.isMockData === false, 'Public X profile fetch sets isMockData: false');
    assert(Array.isArray(profile.connections), 'Connections returned as real array');

    const { req, res } = createMockReqRes({ query: { username: 'RohitDeshmane7' } });
    await connectionsHandler(req, res);
    const apiData = res.getData();
    assert(apiData.isMockData === false, 'Serverless endpoint guarantees isMockData: false');
  }

  // --- TEST E: Production cannot silently fall back to mock graph ---
  console.log('\n--- E. PRODUCTION STRICTLY FORBIDS MOCK GRAPH ---');
  {
    // Verify source code constraint in socialGraph/index.ts
    const indexSource = fs.readFileSync(path.resolve('src/services/socialGraph/index.ts'), 'utf-8');
    assert(indexSource.includes('import.meta.env.DEV'), 'Provider requires DEV mode for mock enablement');
    assert(indexSource.includes('const useMock = isDev && rawEnv === \'true\';'), 'Production strictly disallows mock provider even if VITE_USE_MOCK_DATA is set');

    // Verify CircleOnboarding default
    const onboardingSource = fs.readFileSync(path.resolve('src/components/CircleOnboarding/CircleOnboarding.tsx'), 'utf-8');
    assert(onboardingSource.includes('isDevMode = false'), 'CircleOnboarding defaults isDevMode to false');

    // Verify CirclePage guards demo preset
    const circlePageSource = fs.readFileSync(path.resolve('src/views/CirclePage.tsx'), 'utf-8');
    assert(circlePageSource.includes('[circle] GRAPH GENERATED:'), 'Misleading [circle] MOCK GRAPH log replaced with [circle] GRAPH GENERATED:');
    assert(!circlePageSource.includes('[circle] MOCK GRAPH GENERATED:'), 'Zero occurrences of misleading MOCK GRAPH log in CirclePage');
    assert(circlePageSource.includes('isDevMode={isDevWithMock}'), 'CirclePage passes guarded isDevWithMock to Onboarding');
  }

  // --- TEST F: Candidate accounts cannot enter Circle ---
  console.log('\n--- F. CANDIDATE ACCOUNTS ISOLATED FROM CIRCLE ---');
  {
    const candidateConn = [
      {
        id: 'conn-0xzeeve',
        username: '0xzeeve',
        interactionScore: 85,
        interactionCount: 5,
        interactionTypes: ['reply', 'mention'],
      },
    ];

    const matchResult = await matchCommunityConnections(candidateConn, 'rohitdeshmane7');
    assert(matchResult.matchedCount === 0, 'Candidate account @0xZeeve matchedCount is 0');
    assert(matchResult.matchedConnections.length === 0, 'Candidate account excluded from Circle nodes');
    assert(matchResult.potentialCandidates.length === 1, 'Candidate account preserved in candidate queue');
  }

  // --- TEST G: External accounts cannot enter Circle ---
  console.log('\n--- G. EXTERNAL ACCOUNTS ISOLATED FROM CIRCLE ---');
  {
    const externalConn = [
      {
        id: 'conn-elonmusk',
        username: 'elonmusk',
        interactionScore: 90,
        interactionCount: 10,
        interactionTypes: ['reply', 'quote'],
      },
    ];

    const matchResult = await matchCommunityConnections(externalConn, 'rohitdeshmane7');
    assert(matchResult.matchedCount === 0, 'External account matchedCount is 0');
    assert(matchResult.matchedConnections.length === 0, 'External account excluded from Circle nodes');
    assert(matchResult.externalAccountsCount === 1, 'External account counted in external queue');
  }

  // --- TEST H: Community Friends can enter Circle only with public interaction ---
  console.log('\n--- H. COMMUNITY FRIENDS ENTER CIRCLE ONLY WITH PUBLIC INTERACTION ---');
  {
    // Without interaction: candidate/friend not provided in raw Candidates -> not in Circle
    const noInteractions = [];
    const emptyResult = await matchCommunityConnections(noInteractions, 'rohitdeshmane7');
    assert(emptyResult.matchedCount === 0, 'Non-interacting Community Friends not in Circle');

    // With interaction: mock candidate with community builder evidence
    // In our verified community matcher, when an active community member interacts, they enter Circle
    const interactingMember = [
      {
        id: 'conn-mohammadqadriah',
        username: 'mohammadqadriah',
        interactionScore: 75,
        interactionCount: 3,
        interactionTypes: ['reply'],
      },
    ];
    const matchWithInteraction = await matchCommunityConnections(interactingMember, 'rohitdeshmane7');
    assert(matchWithInteraction.matchedCount === 1, 'Interacting verified community member enters Circle');
    assert(matchWithInteraction.matchedConnections[0].username.toLowerCase() === 'mohammadqadriah', 'Correct member entered');
  }

  // --- TEST I: Official identities can enter Circle only with public interaction ---
  console.log('\n--- I. OFFICIAL IDENTITIES ENTER CIRCLE ONLY WITH PUBLIC INTERACTION ---');
  {
    // Without interaction: @dlicomapp is official, but did not interact with target -> 0 in Circle
    const matchWithoutInteraction = await matchCommunityConnections([], 'rohitdeshmane7');
    const hasDlicomApp = matchWithoutInteraction.matchedConnections.some(
      (c) => c.username.toLowerCase() === 'dlicomapp'
    );
    assert(!hasDlicomApp, 'Official identity @dlicomapp without interaction does NOT enter personal Circle');

    // With interaction: @dlicomapp interacted -> enters Circle
    const matchWithOfficialInteraction = await matchCommunityConnections(
      [
        {
          id: 'conn-dlicomapp',
          username: 'dlicomapp',
          interactionScore: 80,
          interactionCount: 4,
          interactionTypes: ['mention'],
        },
      ],
      'rohitdeshmane7'
    );
    assert(matchWithOfficialInteraction.matchedCount === 1, 'Interacting official identity enters personal Circle');
    assert(
      matchWithOfficialInteraction.matchedConnections[0].username.toLowerCase() === 'dlicomapp',
      'Official identity @dlicomapp successfully verified in personal Circle'
    );
  }

  // --- TEST J: No credentials bundled into production ---
  console.log('\n--- J. PRODUCTION BUNDLE SECRET HYGIENE ---');
  {
    const gitignoreContent = fs.readFileSync(path.resolve('.gitignore'), 'utf-8');
    assert(gitignoreContent.includes('server/.env'), '.gitignore strictly ignores server/.env');
    assert(gitignoreContent.includes('.env*'), '.gitignore strictly ignores .env*');

    // Check dist assets if dist exists
    const distAssetsDir = path.resolve('dist', 'assets');
    if (fs.existsSync(distAssetsDir)) {
      const jsFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
      const secretPatterns = [
        /Bearer\s+AAAA[A-Za-z0-9%_-]+/i,
        /([MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27})/,
        /DISCORD_(TOKEN|SECRET|BOT)/i,
        /SUPABASE_SERVICE_ROLE_KEY/,
        /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
      ];

      let leaksFound = 0;
      for (const file of jsFiles) {
        const content = fs.readFileSync(path.join(distAssetsDir, file), 'utf-8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            leaksFound++;
          }
        }
      }
      assert(leaksFound === 0, `Zero secret patterns detected across ${jsFiles.length} dist asset(s)`);
    } else {
      console.log('  [INFO] dist/assets not yet built, will verify in build step.');
    }
  }

  // --- TEST K: DETERMINISTIC X CONNECTION DEDUPLICATION ---
  console.log('\n--- K. DETERMINISTIC X CONNECTION DEDUPLICATION ---');
  {
    const rawDuplicates = [
      {
        username: 'ritualfnd',
        displayName: 'Ritual Foundation',
        interactionCount: 2,
        interactionTypes: ['reply'],
        interactionScore: 70,
        connectionStrength: 70,
      },
      {
        username: '@RitualFnd',
        displayName: 'Ritual Foundation Official',
        interactionCount: 3,
        interactionTypes: ['quote', 'reply'],
        interactionScore: 85,
        connectionStrength: 85,
      },
      {
        username: '0xMadScientist',
        interactionCount: 1,
        interactionTypes: ['mention'],
        interactionScore: 40,
        connectionStrength: 40,
      },
      {
        username: '0xmadscientist',
        interactionCount: 4,
        interactionTypes: ['reply'],
        interactionScore: 65,
        connectionStrength: 65,
      },
      {
        username: 'cryptooflashh',
        interactionCount: 1,
        interactionTypes: ['mention'],
        interactionScore: 30,
        connectionStrength: 30,
      },
      {
        username: 'cryptooflashh',
        interactionCount: 2,
        interactionTypes: ['quote'],
        interactionScore: 55,
        connectionStrength: 55,
      },
    ];

    const deduped = deduplicateConnections(rawDuplicates);

    assert(deduped.length === 3, `Duplicate entries collapsed from ${rawDuplicates.length} to 3 unique connections`);

    const ritual = deduped.find((c) => c.username.toLowerCase() === 'ritualfnd');
    assert(ritual !== undefined, 'Found collapsed ritualfnd object');
    assert(ritual.interactionCount === 5, `interactionCount merged (2 + 3 = 5, actual: ${ritual.interactionCount})`);
    assert(ritual.interactionScore === 85, `Strongest interactionScore preserved (85, actual: ${ritual.interactionScore})`);
    assert(ritual.connectionStrength === 85, `Strongest connectionStrength preserved (85, actual: ${ritual.connectionStrength})`);
    assert(ritual.interactionTypes.includes('reply') && ritual.interactionTypes.includes('quote'), 'interactionTypes unioned without duplicates');
    assert(ritual.interactionTypes.length === 2, `interactionTypes length is 2 (actual: ${ritual.interactionTypes.length})`);

    const madSci = deduped.find((c) => c.username.toLowerCase() === '0xmadscientist');
    assert(madSci !== undefined, 'Found collapsed 0xMadScientist object');
    assert(madSci.interactionCount === 5, `0xMadScientist interactionCount merged (1 + 4 = 5, actual: ${madSci.interactionCount})`);
    assert(madSci.interactionScore === 65, `0xMadScientist strongest score preserved (65, actual: ${madSci.interactionScore})`);

    // Verify live endpoint RohitDeshmane7 response has 0 duplicates
    const { req, res } = createMockReqRes({ query: { username: 'RohitDeshmane7' } });
    await connectionsHandler(req, res);
    const endpointData = res.getData();
    assert(Array.isArray(endpointData?.connections), 'Endpoint returned connections array');
    const endpointHandles = endpointData.connections.map((c) => c.username.toLowerCase());
    const uniqueEndpointHandles = new Set(endpointHandles);
    assert(
      endpointHandles.length === uniqueEndpointHandles.size,
      `Endpoint returned zero duplicates (${endpointHandles.length} total === ${uniqueEndpointHandles.size} unique)`
    );
  }

  console.log('\n=============================================================');
  console.log(`PRODUCTION FIXES VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('=============================================================');
}

runProductionFixesVerification().catch((err) => {
  console.error('\nTest execution failed:', err);
  process.exit(1);
});
