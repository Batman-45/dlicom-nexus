/**
 * Public-Evidence Dlicom Community Registry Types
 *
 * Strict public evidence system where:
 * - OFFICIALLY_VERIFIED & OFFICIAL_COMMUNITY_ROLE are Circle-eligible.
 * - COMMUNITY_CANDIDATE is NEVER Circle-eligible (shown in /registry/candidates).
 * - EXTERNAL_ACCOUNT is NEVER Circle-eligible and never a Dlicom member.
 */

export type DlicomCommunityRole =
  | 'Core Team'
  | 'Regional Lead'
  | 'Regional Helper'
  | 'Community Manager'
  | 'MOD'
  | 'Ambassador'
  | 'DCO'
  | 'Dcoded'
  | 'Dliever'
  | 'OG'
  | 'Verified Member'
  | 'Community Candidate';

export const VerificationLevel = {
  OFFICIALLY_VERIFIED: 'OFFICIALLY_VERIFIED',
  OFFICIAL_COMMUNITY_ROLE: 'OFFICIAL_COMMUNITY_ROLE',
  COMMUNITY_FRIEND: 'COMMUNITY_FRIEND',
  COMMUNITY_CANDIDATE: 'COMMUNITY_CANDIDATE',
  EXTERNAL_ACCOUNT: 'EXTERNAL_ACCOUNT',
} as const;

export type VerificationLevel = (typeof VerificationLevel)[keyof typeof VerificationLevel];

export type EvidenceSignalType =
  | 'OFFICIAL_DLICOM_LINK'
  | 'OFFICIAL_DLICOM_ANNOUNCEMENT'
  | 'OFFICIAL_EVENT_PARTICIPATION'
  | 'OFFICIAL_COMMUNITY_PROGRAM'
  | 'OFFICIAL_COMPETITION_WINNER'
  | 'OFFICIAL_DLICOM_REPLY'
  | 'OFFICIAL_DLICOM_MENTION'
  | 'OFFICIAL_TEAM_MEMBER_INTERACTION'
  | 'REPEATED_DLICOM_COMMUNITY_ACTIVITY'
  | 'PUBLIC_DLICOM_BUILD_OR_CONTRIBUTION'
  | 'PUBLIC_DLICOM_CAMPAIGN_ACTIVITY'
  | 'PUBLIC_DLICOM_BIO_CLAIM'
  | 'SINGLE_DLICOM_INTERACTION'
  | 'FOLLOWING_DLICOM'
  | 'FOLLOWED_BY_DLICOM'
  | 'THIRD_PARTY_DLICOM_MENTION'
  | 'PARTNER_ACTIVITY';

export interface EvidenceSignal {
  type: EvidenceSignalType;
  authorityLevel: number; // 1 to 5
  description: string;
  sourceUrl: string;
  observedAt: string;
  independent: boolean;
  scoreWeight?: number;
}

export type CommunitySourceType =
  | 'OFFICIAL_WEBSITE'
  | 'OFFICIAL_DLICOM_PROPERTY'
  | 'OFFICIAL_COMMUNITY_SOURCE'
  | 'OFFICIAL_ANNOUNCEMENT'
  | 'PUBLIC_X_EVIDENCE'
  | 'EXTERNAL_INTERACTION';

export type SourceFreshness = 'FRESH' | 'RECENT' | 'STALE';

export interface ConflictRecord {
  id: string;
  dliId?: string;
  handle: string;
  field: string;
  existingValue?: string;
  newValue?: string;
  existingSource?: string;
  newSource?: string;
  winningSource?: string;
  reason?: string;
  sourceA: string;
  valA: string;
  sourceB: string;
  valB: string;
  resolvedVal?: string;
  resolutionRationale?: string;
  resolutionStatus: 'UNRESOLVED' | 'RESOLVED_BY_AUTHORITY' | 'RESOLVED_BY_TIMESTAMP';
  timestamp: string;
}

export interface EvidenceScoreBreakdown {
  baseSourceScore: number;
  roleAuthorityScore: number;
  freshnessFactor: number;
  totalScore: number; // 0 - 100
  scoringRulesApplied: string[];
}

export interface CommunityMember {
  dliId: string; // Deterministic unique ID (e.g. DLI-CORE-001, DLI-ROLE-001, DLI-CAND-001)
  xHandle: string; // Display X handle
  normalizedHandle: string; // Lowercase, stripped '@', trimmed
  displayName: string;
  role: DlicomCommunityRole | string;
  verificationLevel: VerificationLevel;
  verificationStatus: 'VERIFIED' | 'CANDIDATE' | 'EXCLUDED' | 'CONFLICT';
  sourceType: CommunitySourceType;
  sourceAuthority?: string; // Hierarchical authority level string (e.g. LEVEL 5: OFFICIAL_WEBSITE)
  officialSourceUrl: string; // Authoritative primary public URL
  evidenceUrls: string[]; // All public evidence URLs proving identity / role
  evidenceDescriptions?: string[]; // Descriptions corresponding to evidence items
  evidenceSources?: string[]; // All corroborating source names/authorities
  evidenceTypes?: string[]; // All corroborating evidence types
  evidenceSummary: string; // "WHY does Dlicom Circle believe this person is actually part of the Dlicom community?"
  evidence: string; // Backward-compatibility alias
  provenance: string; // Verifiable observation method, origin, and corroboration
  provenanceTrail?: string[]; // Granular chronological provenance log
  confidenceScore: number; // 0 - 100 deterministic score
  discoverySource: string; // e.g. "dlicom.io leadership roster", "official announcement"
  firstVerifiedAt: string; // ISO 8601
  verifiedAt: string; // ISO 8601 (alias)
  lastVerifiedAt: string; // ISO 8601
  sourceFreshness: SourceFreshness;
  status: 'ACTIVE' | 'ARCHIVED' | 'STALE' | 'CONFLICT_HOLD';

  // Community Friend Details & Evidence Signals
  classification?: VerificationLevel;
  evidenceSignals?: EvidenceSignal[];
  strongestEvidenceType?: EvidenceSignalType | string;
  verificationExplanation?: string;
  notOfficialReason?: string;

  // Candidate review details (for COMMUNITY_CANDIDATE)
  candidateReason?: string;
  whyNotVerified?: string;
  requiredEvidence?: string;

  // Conflict state
  conflicts?: ConflictRecord[];
  conflictHistory?: ConflictRecord[];

  // Visual & contextual metadata
  avatarUrl?: string;
  bio?: string;
  region?: string;
  sourceTitle?: string;

  // Backward-compatibility aliases
  xUsername?: string;
  sourceUrl?: string;
  sourceEvidence?: string;
}

export interface SourceHealthReport {
  sourceType: CommunitySourceType;
  url: string;
  title: string;
  status: 'HEALTHY' | 'STALE' | 'UNAVAILABLE' | 'COOLDOWN';
  freshness?: SourceFreshness;
  lastChecked: string;
  lastSuccessfulFetch?: string;
  lastFailedFetch?: string;
  httpStatus?: number;
  responseTimeMs?: number;
  consecutiveFailures?: number;
  cooldownUntil?: string;
  recordsExtracted: number;
  recordsAccepted?: number;
  recordsRejected?: number;
  rejectionReason?: string;
  errorMessage?: string;
}

export interface RegistryDiagnostics {
  registryCount: number;
  officiallyVerifiedCount: number;
  officialCommunityRoleCount: number;
  communityFriendCount?: number;
  candidateCount: number;
  externalCount: number;
  duplicateHandleCount: number;
  duplicateDliIdCount: number;
  conflictCount: number;
  unresolvedConflictCount: number;
  missingProvenanceCount: number;
  staleSourceCount: number;
  lastUpdated: string;
  lastRefresh?: string;
  newDiscoveriesSinceLastRefresh?: number;
  sourceHealth: 'HEALTHY' | 'DEGRADED' | 'STALE';
  sources: SourceHealthReport[];
  conflicts: ConflictRecord[];
  auditTimestamp: string;
}

export interface CommunityMatchResult {
  totalCandidates: number;
  matchedCount: number;
  matchedMembers: CommunityMember[]; // ONLY OFFICIALLY_VERIFIED and OFFICIAL_COMMUNITY_ROLE
  potentialCandidates: CommunityMember[]; // COMMUNITY_CANDIDATE (never in main Circle)
  externalAccountsCount: number; // EXTERNAL_ACCOUNT
  matchExplanations: Record<string, string>; // handle -> deterministic reason string
}
