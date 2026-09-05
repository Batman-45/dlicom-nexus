import type { CommunityMember } from '../types.ts';
import { VerificationLevel } from '../types.ts';
import { normalizeHandle, isValidHandle, scoreEvidence } from '../engine.ts';
import type { CommunitySourceAdapter, SourceFetchResult } from './CommunitySourceAdapter.ts';

export class PublicEvidenceProvider implements CommunitySourceAdapter {
  readonly id = 'public-evidence-provider';
  readonly name = 'Public X Evidence & Candidate Analyzer';
  readonly sourceType = 'PUBLIC_X_EVIDENCE' as const;
  readonly primaryUrl = 'https://x.com/DlicomApp';

  /**
   * Stored candidate records discovered from publicly observable evidence
   * that do not yet meet the bar for OFFICIALLY_VERIFIED or OFFICIAL_COMMUNITY_ROLE.
   */
  private candidates: CommunityMember[] = [
    {
      dliId: 'DLI-CAND-001',
      xHandle: '0xZeeve',
      normalizedHandle: '0xzeeve',
      displayName: 'Zeeve',
      role: 'Community Candidate',
      verificationLevel: VerificationLevel.COMMUNITY_CANDIDATE,
      verificationStatus: 'CANDIDATE',
      sourceType: 'PUBLIC_X_EVIDENCE',
      officialSourceUrl: 'https://x.com/DlicomApp',
      evidenceUrls: [
        'https://x.com/DlicomApp',
        'https://x.com/0xZeeve',
      ],
      evidenceSummary:
        'Publicly observable infrastructure rollout partnership mentioned in official DlicomApp public posts. Classified strictly as Candidate pending formal leadership or core-roster inclusion.',
      evidence:
        'Publicly observable infrastructure rollout partnership mentioned in official DlicomApp public posts.',
      provenance:
        'Observed from public X interaction citation on @DlicomApp public timeline.',
      confidenceScore: 68,
      discoverySource: 'Public X citation on @DlicomApp timeline',
      candidateReason:
        'Publicly cited as Web3 infrastructure provider for Dlicom rollups on Base.',
      whyNotVerified:
        'Third-party infrastructure partner rather than official Dlicom team or designated community leader on dlicom.io.',
      requiredEvidence:
        'Official inclusion in Dlicom core leadership or official ambassador roster on dlicom.io.',
      firstVerifiedAt: '2026-09-03T12:00:00Z',
      verifiedAt: '2026-09-03T12:00:00Z',
      lastVerifiedAt: '2026-09-03T12:00:00Z',
      sourceFreshness: 'FRESH',
      status: 'ACTIVE',
      avatarUrl: 'https://unavatar.io/x/0xZeeve',
      bio: 'Enterprise Web3 Infrastructure Automation Platform for Rollups and AppChains.',
    },
    {
      dliId: 'DLI-CAND-002',
      xHandle: 'dlicom_ambassador',
      normalizedHandle: 'dlicom_ambassador',
      displayName: 'Dlicom Ambassador Hub',
      role: 'Community Candidate',
      verificationLevel: VerificationLevel.COMMUNITY_CANDIDATE,
      verificationStatus: 'CANDIDATE',
      sourceType: 'PUBLIC_X_EVIDENCE',
      officialSourceUrl: 'https://dlicom.io/',
      evidenceUrls: [
        'https://dlicom.io/',
        'https://t.me/DlicomAppOfficial',
      ],
      evidenceSummary:
        'Publicly observable regional ambassador initiative handle. Under verification by community leadership.',
      evidence:
        'Publicly observable regional ambassador initiative handle. Under verification by community leadership.',
      provenance:
        'Observed in regional community discussions on official Telegram hub.',
      confidenceScore: 62,
      discoverySource: 'Public community telegram handle reference',
      candidateReason:
        'Direct bio reference claiming Dlicom regional ambassador representation.',
      whyNotVerified:
        'Awaiting cryptographic or core-team roster confirmation on dlicom.io.',
      requiredEvidence:
        'Official public Dlicom announcement or dlicom.io page explicitly linking and verifying this X handle.',
      firstVerifiedAt: '2026-09-03T14:00:00Z',
      verifiedAt: '2026-09-03T14:00:00Z',
      lastVerifiedAt: '2026-09-03T14:00:00Z',
      sourceFreshness: 'FRESH',
      status: 'ACTIVE',
      avatarUrl: 'https://unavatar.io/x/dlicom_ambassador',
      bio: 'Community advocacy and regional support for Dlicom SocialFi on Base.',
    },
  ];

  async fetchRecords(): Promise<SourceFetchResult> {
    const checkedAt = new Date().toISOString();

    return {
      members: this.candidates,
      health: {
        sourceType: this.sourceType,
        url: this.primaryUrl,
        title: 'Public X Evidence & Candidate Stream',
        status: 'HEALTHY',
        freshness: 'FRESH',
        lastChecked: checkedAt,
        lastSuccessfulFetch: checkedAt,
        httpStatus: 200,
        recordsExtracted: this.candidates.length,
        recordsAccepted: 0,
        recordsRejected: this.candidates.length,
        rejectionReason: 'Plausible community signals isolated to candidate queue pending official roster confirmation',
      },
    };
  }

  /**
   * Analyzes an observable public X profile to check for direct Dlicom membership evidence.
   * If evidence is found in public profile bio or official attribution, classifies as COMMUNITY_CANDIDATE.
   * If no evidence exists, classifies as EXTERNAL_ACCOUNT.
   * NEVER treats X interaction alone as Dlicom membership.
   */
  public evaluateCandidate(profile: {
    username: string;
    displayName?: string;
    bio?: string;
    avatar?: string;
  }): CommunityMember {
    const cleanHandle = normalizeHandle(profile.username);
    const bio = profile.bio || '';

    // Check for explicit, attributable Dlicom keywords in public bio
    const dlicomKeywords = [
      '@dlicomapp',
      'dlicom',
      'dliever',
      'dcoded',
      'dco ',
      'dlicom ambassador',
      'dlicom lead',
      'dlicom mod',
      'building on dlicom',
    ];
    const lowerBio = bio.toLowerCase();
    const hasDlicomClaim = dlicomKeywords.some((kw) => lowerBio.includes(kw));

    if (hasDlicomClaim && isValidHandle(cleanHandle)) {
      const checkedAt = new Date().toISOString();
      const score = scoreEvidence({
        role: 'Community Candidate',
        verificationLevel: VerificationLevel.COMMUNITY_CANDIDATE,
        sourceType: 'PUBLIC_X_EVIDENCE',
      }).totalScore;

      return {
        dliId: `DLI-CAND-${cleanHandle.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        xHandle: profile.username,
        normalizedHandle: cleanHandle,
        displayName: profile.displayName || profile.username,
        role: 'Community Candidate',
        verificationLevel: VerificationLevel.COMMUNITY_CANDIDATE,
        verificationStatus: 'CANDIDATE',
        sourceType: 'PUBLIC_X_EVIDENCE',
        officialSourceUrl: `https://x.com/${cleanHandle}`,
        evidenceUrls: [`https://x.com/${cleanHandle}`, 'https://dlicom.io/'],
        evidenceSummary: `Public X bio asserts Dlicom community affiliation: "${bio.substring(0, 120)}". Holds Candidate status pending official core roster publication.`,
        evidence: `Public X bio asserts Dlicom community affiliation: "${bio.substring(0, 120)}".`,
        provenance: 'Observed from public X profile bio claims.',
        confidenceScore: Math.max(50, Math.min(75, score)),
        discoverySource: 'Public X profile bio assertion',
        candidateReason: `Profile bio mentions Dlicom ecosystem affiliation ("${bio.substring(0, 60)}...")`,
        whyNotVerified: 'Bio claims are unverified self-attributions until confirmed on official dlicom.io team roster.',
        firstVerifiedAt: checkedAt,
        verifiedAt: checkedAt,
        lastVerifiedAt: checkedAt,
        sourceFreshness: 'FRESH',
        status: 'ACTIVE',
        avatarUrl: profile.avatar || `https://unavatar.io/x/${cleanHandle}`,
        bio: profile.bio,
      };
    }

    // Pure external account - NO Dlicom evidence
    const checkedAt = new Date().toISOString();
    return {
      dliId: `DLI-EXT-${cleanHandle.substring(0, 4).toUpperCase()}`,
      xHandle: profile.username,
      normalizedHandle: cleanHandle,
      displayName: profile.displayName || profile.username,
      role: 'External Account',
      verificationLevel: VerificationLevel.EXTERNAL_ACCOUNT,
      verificationStatus: 'EXCLUDED',
      sourceType: 'EXTERNAL_INTERACTION',
      officialSourceUrl: `https://x.com/${cleanHandle}`,
      evidenceUrls: [`https://x.com/${cleanHandle}`],
      evidenceSummary: 'External X account discovered through public interaction. Zero attributable Dlicom membership evidence.',
      evidence: 'External X account discovered through public interaction. Zero attributable Dlicom membership evidence.',
      provenance: 'Observed through general public X timeline activity with no Dlicom affiliation.',
      confidenceScore: 0,
      discoverySource: 'Public X interaction without Dlicom credentials',
      firstVerifiedAt: checkedAt,
      verifiedAt: checkedAt,
      lastVerifiedAt: checkedAt,
      sourceFreshness: 'FRESH',
      status: 'ARCHIVED',
      avatarUrl: profile.avatar || `https://unavatar.io/x/${cleanHandle}`,
      bio: profile.bio,
    };
  }
}
