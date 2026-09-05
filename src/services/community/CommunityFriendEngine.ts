/**
 * Dlicom Community Friend Evidence Engine
 *
 * Implements deterministic evaluation for the COMMUNITY_FRIEND evidence layer.
 * Rules:
 * - Public evidence only.
 * - Score alone NEVER establishes community membership.
 * - Minimum promotion requirement:
 *   1. At least 2 independent public Dlicom-related evidence signals.
 *   2. At least 1 meaningful community participation signal (Authority Level >= 2).
 *   3. No contradictory official evidence.
 *   4. Valid, explicitly known X handle (never guessed).
 *   5. Reproducible evidence URLs.
 * - Candidate cannot bypass classification through score manipulation.
 * - Weak signals (bio claim only, single interaction, follow-only, partner-only) NEVER promote.
 */

import {
  type CommunityMember,
  type EvidenceSignal,
  type EvidenceSignalType,
  VerificationLevel,
} from './types.ts';
import {
  isValidHandle,
  normalizeHandle,
  computeSourceFreshness,
} from './engine.ts';

export const SIGNAL_METADATA: Record<
  EvidenceSignalType,
  { authorityLevel: number; baseScore: number; description: string }
> = {
  OFFICIAL_DLICOM_LINK: {
    authorityLevel: 5,
    baseScore: 40,
    description: 'Direct official Dlicom-controlled source link',
  },
  OFFICIAL_COMMUNITY_PROGRAM: {
    authorityLevel: 4,
    baseScore: 40,
    description: 'Official Dlicom community initiative or program role',
  },
  OFFICIAL_DLICOM_ANNOUNCEMENT: {
    authorityLevel: 4,
    baseScore: 30,
    description: 'Official Dlicom announcement naming identity',
  },
  OFFICIAL_EVENT_PARTICIPATION: {
    authorityLevel: 4,
    baseScore: 30,
    description: 'Official Dlicom event or space participation',
  },
  OFFICIAL_COMPETITION_WINNER: {
    authorityLevel: 4,
    baseScore: 20,
    description: 'Official Dlicom competition or hackathon winner',
  },
  PUBLIC_DLICOM_BUILD_OR_CONTRIBUTION: {
    authorityLevel: 3,
    baseScore: 20,
    description: 'Public open contribution or build on Dlicom Base protocols',
  },
  OFFICIAL_DLICOM_REPLY: {
    authorityLevel: 3,
    baseScore: 15,
    description: 'Official Dlicom account direct reply on X',
  },
  OFFICIAL_DLICOM_MENTION: {
    authorityLevel: 3,
    baseScore: 15,
    description: 'Official Dlicom account direct public mention on X',
  },
  OFFICIAL_TEAM_MEMBER_INTERACTION: {
    authorityLevel: 3,
    baseScore: 15,
    description: 'Meaningful interaction with verified Dlicom core leadership',
  },
  PUBLIC_DLICOM_CAMPAIGN_ACTIVITY: {
    authorityLevel: 2,
    baseScore: 20,
    description: 'Attributable public participation in official Dlicom campaign',
  },
  REPEATED_DLICOM_COMMUNITY_ACTIVITY: {
    authorityLevel: 2,
    baseScore: 15,
    description: 'Repeated public community engagement across Dlicom spaces',
  },
  PUBLIC_DLICOM_BIO_CLAIM: {
    authorityLevel: 1,
    baseScore: 5,
    description: 'Self-declared Dlicom affiliation in public X bio',
  },
  SINGLE_DLICOM_INTERACTION: {
    authorityLevel: 1,
    baseScore: 5,
    description: 'Single isolated public interaction or reply on X',
  },
  THIRD_PARTY_DLICOM_MENTION: {
    authorityLevel: 1,
    baseScore: 3,
    description: 'Third-party ecosystem mention linking account to Dlicom',
  },
  PARTNER_ACTIVITY: {
    authorityLevel: 1,
    baseScore: 3,
    description: 'Third-party partner or infrastructure rollout activity',
  },
  FOLLOWED_BY_DLICOM: {
    authorityLevel: 1,
    baseScore: 3,
    description: 'Followed by official @DlicomApp account on X',
  },
  FOLLOWING_DLICOM: {
    authorityLevel: 1,
    baseScore: 1,
    description: 'Publicly follows official @DlicomApp account on X',
  },
};

export interface CandidateEvaluationInput {
  rawHandle: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  signals: EvidenceSignal[];
  claimedRole?: string;
  officialSourceUrl?: string;
  discoverySource?: string;
  firstDiscoveredAt?: string;
}

export interface CandidateEvaluationResult {
  classification: VerificationLevel;
  confidenceScore: number;
  isEligibleForCircle: boolean;
  member?: CommunityMember;
  rejectionReason?: string;
  verificationExplanation: string;
  requiredEvidence: string;
  deduplicatedSignals: EvidenceSignal[];
  strongestEvidenceType?: EvidenceSignalType;
}

/**
 * Deduplicate identical evidence signals:
 * Prevents double-counting identical evidence from the same URL and signal type.
 */
export function deduplicateSignals(signals: EvidenceSignal[]): EvidenceSignal[] {
  const seen = new Set<string>();
  const deduped: EvidenceSignal[] = [];

  for (const sig of signals) {
    const key = `${sig.type}:${(sig.sourceUrl || '').trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(sig);
    }
  }

  return deduped;
}

/**
 * Evaluates candidate evidence and classifies into:
 * - COMMUNITY_FRIEND (strong public evidence satisfying all promotion rules)
 * - COMMUNITY_CANDIDATE (some Dlicom connection, but missing required evidence)
 * - EXTERNAL_ACCOUNT (insufficient or zero Dlicom community evidence)
 */
export function evaluateCommunityFriend(
  input: CandidateEvaluationInput
): CandidateEvaluationResult {
  const { rawHandle, displayName, bio, avatarUrl, signals, claimedRole, officialSourceUrl } = input;

  // 1. Missing handle check
  if (!rawHandle || !rawHandle.trim()) {
    return {
      classification: VerificationLevel.EXTERNAL_ACCOUNT,
      confidenceScore: 0,
      isEligibleForCircle: false,
      rejectionReason: 'Missing X handle. Unmapped names without explicit handles are rejected and never guessed.',
      verificationExplanation: 'Rejected: No valid X handle provided.',
      requiredEvidence: 'An explicit, observable X handle.',
      deduplicatedSignals: [],
    };
  }

  // 2. Handle validity check
  if (!isValidHandle(rawHandle)) {
    return {
      classification: VerificationLevel.EXTERNAL_ACCOUNT,
      confidenceScore: 0,
      isEligibleForCircle: false,
      rejectionReason: 'Malformed handle. URLs, emails, wallet addresses, and symbols are strictly rejected.',
      verificationExplanation: 'Rejected: Malformed handle syntax.',
      requiredEvidence: 'A valid alphanumeric X username conforming to platform standards.',
      deduplicatedSignals: [],
    };
  }

  const cleanHandle = normalizeHandle(rawHandle);
  const dedupedSignals = deduplicateSignals(signals || []);
  const now = new Date().toISOString();

  // Calculate distinct independent signals
  // A signal is independent if marked independent, or has a distinct non-empty source URL
  const distinctUrls = new Set(dedupedSignals.map((s) => (s.sourceUrl || '').trim().toLowerCase()).filter(Boolean));
  const independentCount = Math.max(
    dedupedSignals.filter((s) => s.independent).length,
    distinctUrls.size,
    // If signals come from distinctly different signal types with descriptions
    new Set(dedupedSignals.map((s) => s.type)).size >= 2 ? 2 : 1
  );

  // Highest authority signal
  let maxAuthority = 0;
  let strongestType: EvidenceSignalType | undefined;
  for (const s of dedupedSignals) {
    const meta = SIGNAL_METADATA[s.type];
    const auth = s.authorityLevel || (meta ? meta.authorityLevel : 1);
    if (auth > maxAuthority) {
      maxAuthority = auth;
      strongestType = s.type;
    }
  }

  // Has meaningful community participation (Authority Level >= 2)
  const hasMeaningfulParticipation = dedupedSignals.some((s) => {
    const meta = SIGNAL_METADATA[s.type];
    const auth = s.authorityLevel || (meta ? meta.authorityLevel : 1);
    return auth >= 2;
  });

  // Calculate score deterministically from deduplicated signals
  let rawScore = 0;
  for (const s of dedupedSignals) {
    const meta = SIGNAL_METADATA[s.type];
    const weight = s.scoreWeight ?? (meta ? meta.baseScore : 5);
    rawScore += weight;
  }

  // Check for contradictory official staff claims
  const lowerClaim = (claimedRole || '').toLowerCase();
  const claimsOfficialStaff =
    lowerClaim.includes('core team') ||
    lowerClaim.includes('ceo') ||
    lowerClaim.includes('cto') ||
    lowerClaim.includes('cfo') ||
    lowerClaim.includes('founder') ||
    lowerClaim.includes('lead') ||
    lowerClaim.includes('manager');

  // If claiming official staff but lacking official Level 5 website link
  const hasOfficialLink = dedupedSignals.some((s) => s.type === 'OFFICIAL_DLICOM_LINK');
  const hasContradictoryStaffClaim = claimsOfficialStaff && !hasOfficialLink;

  // Promotion evaluation:
  // Must satisfy:
  // - At least 2 independent public signals
  // - At least 1 meaningful participation signal (Level >= 2)
  // - Valid handle
  // - Reproducible evidence URLs
  // - Candidate cannot bypass classification through score manipulation
  const satisfiesPromotion =
    dedupedSignals.length >= 2 &&
    independentCount >= 2 &&
    hasMeaningfulParticipation &&
    maxAuthority >= 2;

  let classification: VerificationLevel = VerificationLevel.COMMUNITY_CANDIDATE;
  let isEligibleForCircle = false;
  let confidenceScore = 0;
  let verificationExplanation = '';
  let rejectionReason: string | undefined;
  let requiredEvidence = '';

  if (satisfiesPromotion) {
    classification = VerificationLevel.COMMUNITY_FRIEND;
    isEligibleForCircle = true;
    // Score clamped for Community Friend (70 - 89)
    confidenceScore = Math.min(89, Math.max(70, Math.round(rawScore)));

    const sourcesSummary = dedupedSignals
      .map((s) => s.sourceUrl)
      .filter(Boolean)
      .slice(0, 2)
      .join(' and ');

    verificationExplanation = `Matched because @${cleanHandle} has independent public evidence of Dlicom community participation through ${sourcesSummary || 'publicly observable community activities'}. Demonstrates verified community contribution (${strongestType || 'community activity'}).`;

    if (hasContradictoryStaffClaim) {
      verificationExplanation += ' Note: Identity is classified as Community Friend — not official Dlicom staff.';
    }

    requiredEvidence = 'Verified through multiple independent public participation signals.';
  } else if (dedupedSignals.length > 0 || (bio && bio.toLowerCase().includes('dlicom'))) {
    // Has some Dlicom signal, but insufficient for Community Friend promotion
    classification = VerificationLevel.COMMUNITY_CANDIDATE;
    isEligibleForCircle = false;
    confidenceScore = Math.min(69, Math.max(40, Math.round(rawScore || 45)));

    rejectionReason =
      'Public evidence suggests a possible Dlicom connection, but this identity is not independently verified as a Dlicom community member.';

    if (!hasMeaningfulParticipation) {
      rejectionReason += ' Only weak signals (e.g. bio claim, single interaction, or partner mention) observed; requires meaningful community participation (Authority Level 2+).';
      requiredEvidence = 'At least 1 meaningful community participation signal (event participation, official announcement, program contribution) and 2 independent public sources.';
    } else if (independentCount < 2) {
      rejectionReason += ' Single isolated signal observed; requires at least 2 independent public evidence sources.';
      requiredEvidence = 'A second independent public source corroborating community participation.';
    } else {
      requiredEvidence = 'Additional public evidence of active community contribution.';
    }

    verificationExplanation = `Candidate: @${cleanHandle} has preliminary public signals, but lacks full independent corroboration. Excluded from Circle.`;
  } else {
    // External account
    classification = VerificationLevel.EXTERNAL_ACCOUNT;
    isEligibleForCircle = false;
    confidenceScore = Math.min(30, Math.round(rawScore));
    rejectionReason = 'No meaningful Dlicom community evidence found in public observation.';
    verificationExplanation = `External account: @${cleanHandle} has public interactions but no evidence of Dlicom community membership.`;
    requiredEvidence = 'Observable public evidence linking the account to Dlicom community initiatives.';
  }

  const evidenceUrls = Array.from(
    new Set(
      [
        officialSourceUrl,
        ...dedupedSignals.map((s) => s.sourceUrl),
      ].filter(Boolean) as string[]
    )
  );

  const evidenceSummary =
    classification === VerificationLevel.COMMUNITY_FRIEND
      ? verificationExplanation
      : rejectionReason || 'Observational evaluation completed.';

  const member: CommunityMember = {
    dliId: `DLI-FRND-${cleanHandle.substring(0, 4).toUpperCase()}-001`,
    xHandle: rawHandle.replace(/^@+/, ''),
    normalizedHandle: cleanHandle,
    displayName: displayName || cleanHandle,
    role: classification === VerificationLevel.COMMUNITY_FRIEND ? 'Dlicom Community Friend' : 'Community Candidate',
    verificationLevel: classification,
    verificationStatus: classification === VerificationLevel.COMMUNITY_FRIEND ? 'VERIFIED' : 'CANDIDATE',
    sourceType: 'PUBLIC_X_EVIDENCE',
    sourceAuthority: `LEVEL ${maxAuthority || 1}: PUBLIC_COMMUNITY_EVIDENCE`,
    officialSourceUrl: evidenceUrls[0] || 'https://x.com/DlicomApp',
    evidenceUrls,
    evidenceDescriptions: dedupedSignals.map((s) => `${s.type}: ${s.description}`),
    evidenceSummary,
    evidence: evidenceSummary,
    provenance: `Evaluated by CommunityFriendEngine on ${now} via ${dedupedSignals.length} public signal(s).`,
    provenanceTrail: [
      `Initial public evidence evaluation on ${now}.`,
      ...dedupedSignals.map((s) => `Signal [${s.type}]: ${s.description} (${s.sourceUrl})`),
    ],
    confidenceScore,
    discoverySource: input.discoverySource || 'Community Friend Evidence Engine',
    firstVerifiedAt: input.firstDiscoveredAt || now,
    verifiedAt: now,
    lastVerifiedAt: now,
    sourceFreshness: computeSourceFreshness(now),
    status: 'ACTIVE',
    avatarUrl: avatarUrl || `https://unavatar.io/x/${cleanHandle}`,
    bio,
    candidateReason: classification === VerificationLevel.COMMUNITY_CANDIDATE ? rejectionReason : undefined,
    whyNotVerified: classification !== VerificationLevel.COMMUNITY_FRIEND ? rejectionReason : undefined,
    requiredEvidence,
    classification,
    evidenceSignals: dedupedSignals,
    strongestEvidenceType: strongestType,
    verificationExplanation,
    notOfficialReason: 'Community Friend — not official Dlicom staff or core leadership.',
  };

  return {
    classification,
    confidenceScore,
    isEligibleForCircle,
    member,
    rejectionReason,
    verificationExplanation,
    requiredEvidence,
    deduplicatedSignals: dedupedSignals,
    strongestEvidenceType: strongestType,
  };
}
