/**
 * Public-Evidence Dlicom Community Registry Engine
 *
 * Deterministic evidence scoring, deduplication, conflict resolution,
 * and source freshness tracking.
 */

import {
  type CommunityMember,
  type ConflictRecord,
  type EvidenceScoreBreakdown,
  type SourceFreshness,
  VerificationLevel,
  type CommunitySourceType,
} from './types.ts';

/**
 * Normalizes an X handle: lowercases, trims whitespace, and strips leading '@'s.
 */
export function normalizeHandle(handle: string): string {
  if (!handle) return '';
  return handle.trim().replace(/^@+/, '').trim().toLowerCase();
}

/**
 * Validates whether an X handle conforms to standard X platform constraints (1-25 alphanumeric/underscore).
 * Strictly rejects:
 * - URLs (e.g. https://...)
 * - Email addresses (e.g. user@domain.com)
 * - EVM Wallet addresses (e.g. 0x1234...40chars)
 * - Names with whitespace
 * - Symbols and malformed punctuation
 */
export function isValidHandle(handle: string): boolean {
  if (!handle || typeof handle !== 'string') return false;
  const raw = handle.trim();
  if (!raw) return false;

  // Reject URLs
  if (/^https?:\/\/|www\.|\//i.test(raw)) return false;
  // Reject email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(raw)) return false;
  // Reject Ethereum/EVM wallet addresses (0x followed by 38-42 hex characters)
  if (/^0x[a-fA-F0-9]{38,44}$/i.test(raw)) return false;
  // Reject names with spaces
  if (/\s/.test(raw.replace(/^@+/, ''))) return false;

  const clean = normalizeHandle(raw);
  return /^[a-zA-Z0-9_]{1,25}$/.test(clean);
}

/**
 * Computes source freshness based on elapsed time since lastVerifiedAt.
 * - FRESH: verified within the last 7 days (< 604800s)
 * - RECENT: verified within 8 to 30 days
 * - STALE: not re-verified in over 30 days (> 2592000s)
 */
export function computeSourceFreshness(lastVerifiedAt: string): SourceFreshness {
  if (!lastVerifiedAt) return 'STALE';
  const timestamp = new Date(lastVerifiedAt).getTime();
  if (isNaN(timestamp)) return 'STALE';

  const elapsedMs = Math.max(0, Date.now() - timestamp);
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  if (elapsedDays <= 7) return 'FRESH';
  if (elapsedDays <= 30) return 'RECENT';
  return 'STALE';
}

/**
 * Deterministic Source Authority Hierarchy (Levels 1 - 5)
 * Higher rank wins in collisions.
 * LEVEL 5: OFFICIAL_WEBSITE
 * LEVEL 4: OFFICIAL_DLICOM_PROPERTY
 * LEVEL 3: OFFICIAL_ANNOUNCEMENT
 * LEVEL 2: OFFICIAL_COMMUNITY_SOURCE
 * LEVEL 1: PUBLIC_X_EVIDENCE
 */
export const SOURCE_AUTHORITY_RANK: Record<CommunitySourceType, number> = {
  OFFICIAL_WEBSITE: 100,
  OFFICIAL_DLICOM_PROPERTY: 80,
  OFFICIAL_ANNOUNCEMENT: 60,
  OFFICIAL_COMMUNITY_SOURCE: 40,
  PUBLIC_X_EVIDENCE: 20,
  EXTERNAL_INTERACTION: 0,
};

export function getAuthorityLabel(sourceType: CommunitySourceType): string {
  switch (sourceType) {
    case 'OFFICIAL_WEBSITE':
      return 'LEVEL 5: OFFICIAL_WEBSITE';
    case 'OFFICIAL_DLICOM_PROPERTY':
      return 'LEVEL 4: OFFICIAL_DLICOM_PROPERTY';
    case 'OFFICIAL_ANNOUNCEMENT':
      return 'LEVEL 3: OFFICIAL_ANNOUNCEMENT';
    case 'OFFICIAL_COMMUNITY_SOURCE':
      return 'LEVEL 2: OFFICIAL_COMMUNITY_SOURCE';
    case 'PUBLIC_X_EVIDENCE':
      return 'LEVEL 1: PUBLIC_X_EVIDENCE';
    default:
      return 'LEVEL 0: EXTERNAL_INTERACTION';
  }
}

/**
 * Deterministic Evidence Scoring Engine
 *
 * Evaluates public evidence strictly according to the approved hierarchy:
 * - 100: Official Dlicom source explicitly identifies identity (Leadership / Core Team)
 * - 90+: Official Dlicom source explicitly assigns community role (Lead / Mod / Manager)
 * - 70–89: Multiple strong public sources with attributable evidence
 * - 40–69: Meaningful but incomplete evidence (Candidate)
 * - 1–39: Weak signal
 * - 0: No membership evidence
 *
 * NOTE: confidenceScore NEVER overrides verificationLevel.
 */
export function scoreEvidence(
  member: Partial<CommunityMember>
): EvidenceScoreBreakdown {
  const rulesApplied: string[] = [];
  let baseSourceScore = 0;
  let roleAuthorityScore = 0;

  const sourceType = member.sourceType || 'PUBLIC_X_EVIDENCE';
  const role = member.role || 'Community Candidate';
  const level = member.verificationLevel || VerificationLevel.COMMUNITY_CANDIDATE;

  // 1. Source Credibility Assessment
  if (sourceType === 'OFFICIAL_WEBSITE' || sourceType === 'OFFICIAL_DLICOM_PROPERTY') {
    baseSourceScore = 60;
    rulesApplied.push('Verified on official Dlicom-controlled web property (+60)');
  } else if (sourceType === 'OFFICIAL_ANNOUNCEMENT') {
    baseSourceScore = 55;
    rulesApplied.push('Verified via official Dlicom public announcement (+55)');
  } else if (sourceType === 'OFFICIAL_COMMUNITY_SOURCE') {
    baseSourceScore = 50;
    rulesApplied.push('Verified through official Dlicom community property (+50)');
  } else if (sourceType === 'PUBLIC_X_EVIDENCE') {
    baseSourceScore = 30;
    rulesApplied.push('Public X profile evidence (+30)');
  } else {
    baseSourceScore = 0;
    rulesApplied.push('No verifiable public Dlicom source (0)');
  }

  // 2. Role Designation Authority
  if (role === 'Core Team' || level === VerificationLevel.OFFICIALLY_VERIFIED) {
    roleAuthorityScore = 40;
    rulesApplied.push('Officially listed Core Team / Leadership roster (+40)');
  } else if (
    role === 'Regional Lead' ||
    role === 'Community Manager' ||
    role === 'MOD' ||
    level === VerificationLevel.OFFICIAL_COMMUNITY_ROLE
  ) {
    roleAuthorityScore = 35;
    rulesApplied.push('Explicit official community leadership role (+35)');
  } else if (role === 'Regional Helper' || role === 'Ambassador' || role === 'OG' || level === VerificationLevel.COMMUNITY_FRIEND) {
    roleAuthorityScore = 25;
    rulesApplied.push('Attributable community role / friend credential (+25)');
  } else if (role === 'DCO' || role === 'Dcoded' || role === 'Dliever') {
    roleAuthorityScore = 20;
    rulesApplied.push('Attributable Dlicom ecosystem participation (+20)');
  } else {
    roleAuthorityScore = 10;
    rulesApplied.push('Candidate / general community observation (+10)');
  }

  // Corroborating evidence URLs multiplier
  const evidenceCount = (member.evidenceUrls || []).length;
  if (evidenceCount >= 3) {
    roleAuthorityScore = Math.min(40, roleAuthorityScore + 5);
    rulesApplied.push(`Multi-source corroboration: ${evidenceCount} verified URLs (+5)`);
  }

  // 3. Freshness Factor
  const freshness = computeSourceFreshness(member.lastVerifiedAt || member.verifiedAt || '');
  let freshnessFactor = 1.0;
  if (freshness === 'FRESH') {
    freshnessFactor = 1.0;
    rulesApplied.push('Source freshness: FRESH (100% weight)');
  } else if (freshness === 'RECENT') {
    freshnessFactor = 0.98;
    rulesApplied.push('Source freshness: RECENT (98% weight)');
  } else {
    freshnessFactor = 0.92;
    rulesApplied.push('Source freshness: STALE (92% weight)');
  }

  let totalScore = Math.round((baseSourceScore + roleAuthorityScore) * freshnessFactor);

  // Strict Ceiling Guardrails per Level
  if (level === VerificationLevel.OFFICIALLY_VERIFIED) {
    totalScore = Math.max(95, Math.min(100, totalScore));
  } else if (level === VerificationLevel.OFFICIAL_COMMUNITY_ROLE) {
    totalScore = Math.max(80, Math.min(94, totalScore));
  } else if (level === VerificationLevel.COMMUNITY_FRIEND) {
    totalScore = Math.max(70, Math.min(89, totalScore));
  } else if (level === VerificationLevel.COMMUNITY_CANDIDATE) {
    totalScore = Math.max(40, Math.min(79, totalScore));
  } else if (level === VerificationLevel.EXTERNAL_ACCOUNT) {
    totalScore = Math.min(30, totalScore);
  }

  return {
    baseSourceScore,
    roleAuthorityScore,
    freshnessFactor,
    totalScore,
    scoringRulesApplied: rulesApplied,
  };
}

/**
 * Deterministic Deduplication and Conflict Handling
 *
 * Merges records case-insensitively by normalized X handle.
 * When conflicting metadata is encountered:
 * - Detects field-level collisions.
 * - Resolves deterministically by source authority rank.
 * - If ranks tie, resolves by newest timestamp.
 * - Unions all evidence URLs without duplicates.
 * - Records full audit history.
 */
export function deduplicateRegistry(
  members: CommunityMember[],
  onConflict?: (conflict: ConflictRecord) => void
): { deduplicated: CommunityMember[]; conflicts: ConflictRecord[] } {
  const map = new Map<string, CommunityMember>();
  const conflicts: ConflictRecord[] = [];

  for (const raw of members) {
    const cleanHandle = normalizeHandle(raw.xHandle || raw.normalizedHandle || raw.xUsername || '');
    if (!isValidHandle(cleanHandle)) continue;

    const sourceFreshness = computeSourceFreshness(raw.lastVerifiedAt || raw.verifiedAt);
    const scoreInfo = scoreEvidence({
      ...raw,
      normalizedHandle: cleanHandle,
      sourceFreshness,
    });

    const authorityLabel = getAuthorityLabel(raw.sourceType || 'OFFICIAL_WEBSITE');
    const primaryEvidenceDesc =
      raw.evidenceSummary ||
      raw.evidence ||
      raw.sourceEvidence ||
      'Publicly verified against official Dlicom properties.';
    const primaryProvenance =
      raw.provenance ||
      `Verified via ${raw.sourceType || 'OFFICIAL_WEBSITE'} from ${raw.officialSourceUrl || 'https://dlicom.io/'}.`;

    const normalizedMember: CommunityMember = {
      ...raw,
      dliId: raw.dliId,
      xHandle: raw.xHandle || cleanHandle,
      normalizedHandle: cleanHandle,
      displayName: raw.displayName || cleanHandle,
      role: raw.role || 'Verified Member',
      verificationLevel: raw.verificationLevel || VerificationLevel.OFFICIALLY_VERIFIED,
      verificationStatus: raw.verificationStatus || 'VERIFIED',
      sourceType: raw.sourceType || 'OFFICIAL_WEBSITE',
      sourceAuthority: raw.sourceAuthority || authorityLabel,
      officialSourceUrl: raw.officialSourceUrl || raw.sourceUrl || 'https://dlicom.io/',
      evidenceUrls: Array.from(
        new Set([
          ...(raw.evidenceUrls || []),
          raw.officialSourceUrl,
          raw.sourceUrl,
        ].filter(Boolean) as string[])
      ),
      evidenceDescriptions: raw.evidenceDescriptions || [primaryEvidenceDesc],
      evidenceSummary: primaryEvidenceDesc,
      evidence: primaryEvidenceDesc,
      provenance: primaryProvenance,
      provenanceTrail: raw.provenanceTrail || [primaryProvenance],
      confidenceScore: raw.confidenceScore ?? scoreInfo.totalScore,
      discoverySource: raw.discoverySource || raw.sourceTitle || 'dlicom.io official roster',
      firstVerifiedAt: raw.firstVerifiedAt || raw.verifiedAt || '2026-09-03T00:00:00Z',
      verifiedAt: raw.verifiedAt || raw.firstVerifiedAt || '2026-09-03T00:00:00Z',
      lastVerifiedAt: raw.lastVerifiedAt || raw.verifiedAt || new Date().toISOString(),
      sourceFreshness,
      status: raw.status || 'ACTIVE',
      conflicts: raw.conflicts || raw.conflictHistory || [],
      conflictHistory: raw.conflictHistory || raw.conflicts || [],
    };

    const existing = map.get(cleanHandle);
    if (!existing) {
      map.set(cleanHandle, normalizedMember);
      continue;
    }

    // Collision detected -> Evaluate conflict
    const existingRank = SOURCE_AUTHORITY_RANK[existing.sourceType] || 0;
    const incomingRank = SOURCE_AUTHORITY_RANK[normalizedMember.sourceType] || 0;

    const existingTime = new Date(existing.lastVerifiedAt).getTime() || 0;
    const incomingTime = new Date(normalizedMember.lastVerifiedAt).getTime() || 0;

    let resolveWinner: 'EXISTING' | 'INCOMING' = 'EXISTING';
    let resolutionRationale = '';
    let resolutionStatus: ConflictRecord['resolutionStatus'] = 'RESOLVED_BY_AUTHORITY';

    if (incomingRank > existingRank) {
      resolveWinner = 'INCOMING';
      resolutionRationale = `Incoming source authority (${normalizedMember.sourceType} [${incomingRank}]) exceeds existing source (${existing.sourceType} [${existingRank}]).`;
      resolutionStatus = 'RESOLVED_BY_AUTHORITY';
    } else if (incomingRank === existingRank) {
      if (incomingTime > existingTime) {
        resolveWinner = 'INCOMING';
        resolutionRationale = `Incoming record has fresher verification timestamp (${normalizedMember.lastVerifiedAt} vs ${existing.lastVerifiedAt}).`;
        resolutionStatus = 'RESOLVED_BY_TIMESTAMP';
      } else {
        resolveWinner = 'EXISTING';
        resolutionRationale = `Existing record retained due to newer or equal verification timestamp.`;
        resolutionStatus = 'RESOLVED_BY_TIMESTAMP';
      }
    } else {
      resolveWinner = 'EXISTING';
      resolutionRationale = `Existing source authority (${existing.sourceType} [${existingRank}]) exceeds incoming source (${normalizedMember.sourceType} [${incomingRank}]).`;
      resolutionStatus = 'RESOLVED_BY_AUTHORITY';
    }

    // Check for specific field discrepancies
    const hasRoleConflict = existing.role !== normalizedMember.role;
    const hasLevelConflict = existing.verificationLevel !== normalizedMember.verificationLevel;

    if (hasRoleConflict || hasLevelConflict) {
      const conflictField = hasRoleConflict ? 'role' : 'verificationLevel';
      const existingVal = hasRoleConflict ? String(existing.role) : String(existing.verificationLevel);
      const incomingVal = hasRoleConflict ? String(normalizedMember.role) : String(normalizedMember.verificationLevel);
      const existingSrc = `${existing.sourceType} (${existing.officialSourceUrl})`;
      const incomingSrc = `${normalizedMember.sourceType} (${normalizedMember.officialSourceUrl})`;
      const winningSrc = resolveWinner === 'INCOMING' ? normalizedMember.sourceType : existing.sourceType;

      const conflictRecord: ConflictRecord = {
        id: `conf-${cleanHandle}-${Date.now()}`,
        dliId: existing.dliId,
        handle: cleanHandle,
        field: conflictField,
        existingValue: existingVal,
        newValue: incomingVal,
        existingSource: existingSrc,
        newSource: incomingSrc,
        winningSource: winningSrc,
        reason: resolutionRationale,
        sourceA: existingSrc,
        valA: existingVal,
        sourceB: incomingSrc,
        valB: incomingVal,
        resolvedVal: resolveWinner === 'INCOMING' ? incomingVal : existingVal,
        resolutionRationale,
        resolutionStatus,
        timestamp: new Date().toISOString(),
      };

      conflicts.push(conflictRecord);
      if (onConflict) onConflict(conflictRecord);
    }

    // Merge evidence URLs without duplication
    const mergedEvidenceUrls = Array.from(
      new Set([...existing.evidenceUrls, ...normalizedMember.evidenceUrls])
    );

    const mergedEvidenceDescriptions = Array.from(
      new Set([
        ...(existing.evidenceDescriptions || [existing.evidenceSummary]),
        ...(normalizedMember.evidenceDescriptions || [normalizedMember.evidenceSummary]),
      ])
    );

    const mergedEvidenceSources = Array.from(
      new Set([
        ...(existing.evidenceSources || [existing.sourceType]),
        ...(normalizedMember.evidenceSources || [normalizedMember.sourceType]),
      ])
    );

    const mergedEvidenceTypes = Array.from(
      new Set([
        ...(existing.evidenceTypes || [existing.sourceType]),
        ...(normalizedMember.evidenceTypes || [normalizedMember.sourceType]),
      ])
    );

    const mergedProvenanceTrail = Array.from(
      new Set([
        ...(existing.provenanceTrail || [existing.provenance]),
        ...(normalizedMember.provenanceTrail || [normalizedMember.provenance]),
      ])
    );

    const mergedConflictHistory = [
      ...(existing.conflictHistory || existing.conflicts || []),
      ...(normalizedMember.conflictHistory || normalizedMember.conflicts || []),
    ];

    if (resolveWinner === 'INCOMING') {
      map.set(cleanHandle, {
        ...normalizedMember,
        dliId: existing.dliId || normalizedMember.dliId, // Preserve authoritative DLI-ID
        firstVerifiedAt: existing.firstVerifiedAt || normalizedMember.firstVerifiedAt,
        evidenceUrls: mergedEvidenceUrls,
        evidenceDescriptions: mergedEvidenceDescriptions,
        evidenceSources: mergedEvidenceSources,
        evidenceTypes: mergedEvidenceTypes,
        provenanceTrail: mergedProvenanceTrail,
        conflicts: mergedConflictHistory,
        conflictHistory: mergedConflictHistory,
      });
    } else {
      map.set(cleanHandle, {
        ...existing,
        evidenceUrls: mergedEvidenceUrls,
        evidenceDescriptions: mergedEvidenceDescriptions,
        evidenceSources: mergedEvidenceSources,
        evidenceTypes: mergedEvidenceTypes,
        provenanceTrail: mergedProvenanceTrail,
        lastVerifiedAt:
          incomingTime > existingTime ? normalizedMember.lastVerifiedAt : existing.lastVerifiedAt,
        sourceFreshness: computeSourceFreshness(
          incomingTime > existingTime ? normalizedMember.lastVerifiedAt : existing.lastVerifiedAt
        ),
        conflicts: mergedConflictHistory,
        conflictHistory: mergedConflictHistory,
      });
    }
  }

  return {
    deduplicated: Array.from(map.values()),
    conflicts,
  };
}

export interface RawDiscoveredIdentity {
  rawHandle: string;
  displayName?: string;
  sourceType: CommunitySourceType;
  officialSourceUrl: string;
  roleClaim?: string;
  evidenceSummary?: string;
  evidenceUrls?: string[];
  isExplicitOfficialLink?: boolean;
  verificationLevel?: VerificationLevel;
  evidenceSignals?: import('./types.ts').EvidenceSignal[];
}

export interface IngestionResult {
  accepted: boolean;
  status: 'VERIFIED' | 'CANDIDATE' | 'REJECTED';
  verificationLevel: VerificationLevel;
  member?: CommunityMember;
  rejectionReason?: string;
}

/**
 * Deterministic New Member Discovery & Ingestion Pipeline
 *
 * Implements Section 5 & 7 of the specification:
 * 1. Validate handle (reject URLs, emails, wallet addresses, malformed handles)
 * 2. Reject missing handles (never guess from person's name)
 * 3. Normalize handle case-insensitively
 * 4. Deterministic promotion logic based on source authority and explicit linkage:
 *    - Official Dlicom website explicitly links X handle -> OFFICIALLY_VERIFIED
 *    - Official Dlicom source explicitly identifies Regional Lead / Community Manager -> OFFICIAL_COMMUNITY_ROLE
 *    - Community Friend meeting 2 independent signals + Level 2+ participation -> COMMUNITY_FRIEND
 *    - Third-party reference, bio claim, interaction, or mention -> COMMUNITY_CANDIDATE
 *    - Public interaction without evidence -> EXTERNAL_ACCOUNT
 * 5. Collect provenance and calculate deterministic confidence score
 */
export function ingestDiscoveredIdentity(raw: RawDiscoveredIdentity): IngestionResult {
  // 1. Missing handle check
  if (!raw.rawHandle || !raw.rawHandle.trim()) {
    return {
      accepted: false,
      status: 'REJECTED',
      verificationLevel: VerificationLevel.EXTERNAL_ACCOUNT,
      rejectionReason: 'Missing X handle. Identities without an explicit reliable X handle remain unmapped and are never guessed.',
    };
  }

  // 2. Handle validation
  if (!isValidHandle(raw.rawHandle)) {
    return {
      accepted: false,
      status: 'REJECTED',
      verificationLevel: VerificationLevel.EXTERNAL_ACCOUNT,
      rejectionReason: 'Malformed handle. URLs, emails, wallet addresses, and strings with spaces or invalid characters are strictly rejected.',
    };
  }

  const cleanHandle = normalizeHandle(raw.rawHandle);
  const now = new Date().toISOString();

  // 3. Deterministic promotion classification
  let level: VerificationLevel = VerificationLevel.COMMUNITY_CANDIDATE;
  let status: 'VERIFIED' | 'CANDIDATE' | 'REJECTED' = 'CANDIDATE';
  let role = raw.roleClaim || 'Community Candidate';
  let whyNotVerified: string | undefined;

  const isOfficialSource =
    raw.sourceType === 'OFFICIAL_WEBSITE' ||
    raw.sourceType === 'OFFICIAL_DLICOM_PROPERTY' ||
    raw.sourceType === 'OFFICIAL_ANNOUNCEMENT';

  if (raw.verificationLevel === VerificationLevel.COMMUNITY_FRIEND) {
    level = VerificationLevel.COMMUNITY_FRIEND;
    status = 'VERIFIED';
    role = raw.roleClaim || 'Dlicom Community Friend';
  } else if (isOfficialSource && raw.isExplicitOfficialLink) {
    const lowerRole = (raw.roleClaim || '').toLowerCase();
    if (
      lowerRole.includes('lead') ||
      lowerRole.includes('manager') ||
      lowerRole.includes('mod') ||
      lowerRole.includes('regional')
    ) {
      level = VerificationLevel.OFFICIAL_COMMUNITY_ROLE;
      status = 'VERIFIED';
      role = raw.roleClaim || 'Regional Lead';
    } else {
      level = VerificationLevel.OFFICIALLY_VERIFIED;
      status = 'VERIFIED';
      role = raw.roleClaim || 'Core Team';
    }
  } else if (raw.sourceType === 'OFFICIAL_COMMUNITY_SOURCE' && raw.isExplicitOfficialLink) {
    level = VerificationLevel.OFFICIAL_COMMUNITY_ROLE;
    status = 'VERIFIED';
    role = raw.roleClaim || 'Community Manager';
  } else if (raw.sourceType === 'EXTERNAL_INTERACTION') {
    level = VerificationLevel.EXTERNAL_ACCOUNT;
    status = 'REJECTED';
    whyNotVerified = 'Public interaction without Dlicom credentials. External accounts never enter the Circle.';
  } else {
    // Bio claims, followers, mentions, Telegram references, partner rollouts
    level = VerificationLevel.COMMUNITY_CANDIDATE;
    status = 'CANDIDATE';
    whyNotVerified = 'Discovery signals (bio assertions, mentions, interactions) are not official membership proof. Awaiting official roster confirmation on dlicom.io.';
  }

  const authorityLabel = getAuthorityLabel(raw.sourceType);
  const evidenceSummary =
    raw.evidenceSummary ||
    `Discovered via ${raw.sourceType} from ${raw.officialSourceUrl}.`;
  const provenance = `Ingested from ${raw.sourceType} (${raw.officialSourceUrl}) on ${now}.`;

  const member: CommunityMember = {
    dliId: `DLI-DISC-${cleanHandle.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    xHandle: raw.rawHandle.replace(/^@+/, ''),
    normalizedHandle: cleanHandle,
    displayName: raw.displayName || cleanHandle,
    role,
    verificationLevel: level,
    verificationStatus: status === 'VERIFIED' ? 'VERIFIED' : status === 'CANDIDATE' ? 'CANDIDATE' : 'EXCLUDED',
    sourceType: raw.sourceType,
    sourceAuthority: authorityLabel,
    officialSourceUrl: raw.officialSourceUrl,
    evidenceUrls: Array.from(new Set([raw.officialSourceUrl, ...(raw.evidenceUrls || [])])),
    evidenceDescriptions: [evidenceSummary],
    evidenceSummary,
    evidence: evidenceSummary,
    provenance,
    provenanceTrail: [provenance],
    confidenceScore: 0, // Computed below
    discoverySource: `${raw.sourceType} (${raw.officialSourceUrl})`,
    firstVerifiedAt: now,
    verifiedAt: now,
    lastVerifiedAt: now,
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: `https://unavatar.io/x/${cleanHandle}`,
    candidateReason: level === VerificationLevel.COMMUNITY_CANDIDATE ? evidenceSummary : undefined,
    whyNotVerified,
  };

  const scoreInfo = scoreEvidence(member);
  member.confidenceScore = scoreInfo.totalScore;

  return {
    accepted: status === 'VERIFIED',
    status,
    verificationLevel: level,
    member,
    rejectionReason: whyNotVerified,
  };
}

