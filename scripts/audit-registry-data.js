import { OFFICIAL_SEED_REGISTRY, CANDIDATE_SEED_REGISTRY } from '../src/services/community/registry.ts';

function auditRegistryDataIntegrity() {
  console.log('Auditing production registry dataset for fake or synthetic members...');

  const allRecords = [...OFFICIAL_SEED_REGISTRY, ...CANDIDATE_SEED_REGISTRY];
  let violations = 0;

  for (const m of allRecords) {
    // 1. Must have valid public source URL
    if (!m.officialSourceUrl || (!m.officialSourceUrl.startsWith('https://') && !m.officialSourceUrl.startsWith('http://'))) {
      console.error(`Violation: Member @${m.xHandle} lacks valid HTTP(S) source URL.`);
      violations++;
    }

    // 2. Must have evidence
    if (!m.evidenceSummary || m.evidenceSummary.trim().length < 10) {
      console.error(`Violation: Member @${m.xHandle} has missing or empty evidence summary.`);
      violations++;
    }

    // 3. Must have provenance
    if (!m.provenance || m.provenance.trim().length < 10) {
      console.error(`Violation: Member @${m.xHandle} has missing or empty provenance.`);
      violations++;
    }

    // 4. Must have evidence URLs
    if (!Array.isArray(m.evidenceUrls) || m.evidenceUrls.length === 0) {
      console.error(`Violation: Member @${m.xHandle} has no evidence URLs.`);
      violations++;
    }

    // 5. Check for synthetic placeholder markers
    const textToScan = `${m.displayName} ${m.xHandle} ${m.role} ${m.evidenceSummary}`.toLowerCase();
    const fakeKeywords = ['mock', 'placeholder', 'dummy', 'fake', 'lorem', 'test user', 'synthetic'];
    for (const kw of fakeKeywords) {
      if (textToScan.includes(kw)) {
        console.error(`Violation: Member @${m.xHandle} contains placeholder/synthetic keyword "${kw}".`);
        violations++;
      }
    }
  }

  if (violations === 0) {
    console.log(`DATA INTEGRITY PASS: All ${allRecords.length} records are authentic, evidence-backed, and free of synthetic data.`);
  } else {
    console.error(`DATA INTEGRITY FAIL: Found ${violations} violation(s).`);
    process.exit(1);
  }
}

auditRegistryDataIntegrity();
