/**
 * Dlicom Pulse — Community Intelligence & Contribution Hub Data Models
 *
 * Enforces strict 3-tier claim distinction across all community entities:
 * 1. VERIFIED: Formally confirmed by official Dlicom properties (dlicom.io, whitepaper, Hacken audit, Base contracts).
 * 2. OBSERVED_PUBLIC_EVIDENCE: Corroborated via observable public X interactions, commits, or community activity.
 * 3. UNVERIFIED: Self-reported, X bio claim without proof, or pending review.
 */

export type ClaimStatus =
  | 'VERIFIED'
  | 'OBSERVED_PUBLIC_EVIDENCE'
  | 'UNVERIFIED';

export interface ClaimEvidence {
  status: ClaimStatus;
  sourceUrl: string;
  sourceType: string;
  summary: string;
  observedAt: string;
  confidenceScore: number; // 0 - 100
}

export interface PulseProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'CORE_PROTOCOL' | 'SMART_CONTRACTS' | 'SOCIAL_FI' | 'GOVERNANCE' | 'REGIONAL_EXPANSION' | 'SECURITY';
  status: 'PRODUCTION' | 'ACTIVE_DEV' | 'AUDITED' | 'PROPOSED';
  leadHandles: string[];
  contributorHandles: string[];
  officialUrl: string;
  repoUrl?: string;
  auditUrl?: string;
  claimStatus: ClaimStatus;
  evidenceSummary: string;
  metrics: {
    contributorsCount: number;
    verifiedContributionsCount: number;
  };
}

export interface PulseContribution {
  id: string;
  title: string;
  description: string;
  category: 'SMART_CONTRACT' | 'CORE_DEV' | 'UI_UX' | 'COMMUNITY' | 'REGIONAL' | 'SECURITY_AUDIT' | 'DOCUMENTATION';
  memberHandle: string;
  memberDliId: string;
  memberDisplayName: string;
  projectId?: string;
  projectName?: string;
  claimStatus: ClaimStatus;
  evidenceUrl: string;
  evidenceSummary: string;
  observedAt: string;
  impactNote?: string;
}

export interface PulseAchievement {
  id: string;
  title: string;
  description: string;
  recipientHandle: string;
  recipientDliId: string;
  recipientDisplayName: string;
  category: 'CORE_MILESTONE' | 'COMMUNITY_HONOR' | 'SECURITY_EXCELLENCE' | 'REGIONAL_LEADERSHIP';
  awardedAt: string;
  claimStatus: ClaimStatus;
  evidenceUrl: string;
  badgeIcon?: string;
}

export interface PulseOpportunity {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  type: 'BOUNTY' | 'CORE_ROLE' | 'CONTRIBUTION_CALL' | 'AMBASSADOR';
  skillsRequired: string[];
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'FILLED';
  reward?: string;
  applyUrl: string;
  claimStatus: ClaimStatus;
  postedAt: string;
}

export interface MemberSkill {
  name: string;
  category: string;
  claimStatus: ClaimStatus;
  evidenceUrl?: string;
}

export interface CommunityParticipationRecord {
  firstObservedActivity: string;
  lastActiveDate: string;
  activityType: string;
  summary: string;
  claimStatus: ClaimStatus;
  evidenceUrl: string;
}

export interface MemberProfileData {
  dliId: string;
  identity: {
    handle: string;
    normalizedHandle: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    region?: string;
    followersCount?: number;
    followingCount?: number;
    isBlueVerified?: boolean;
  };
  roles: Array<{
    role: string;
    claimStatus: ClaimStatus;
    evidenceUrl: string;
    summary: string;
  }>;
  skills: MemberSkill[];
  projects: PulseProject[];
  contributions: PulseContribution[];
  achievements: PulseAchievement[];
  communityParticipation: CommunityParticipationRecord;
  evidenceSummary: {
    confidenceScore: number;
    verificationLevel: string;
    provenanceTrail: string[];
    evidenceUrls: string[];
    authorityLevel: string;
    whyVerified: string;
  };
}

export interface PulseDashboardData {
  stats: {
    communityMemberCount: number;
    verifiedMemberCount: number;
    candidateCount: number;
    activeContributorsCount: number;
    projectsCount: number;
    contributionsCount: number;
    openOpportunitiesCount: number;
  };
  activeContributors: Array<{
    dliId: string;
    handle: string;
    displayName: string;
    avatarUrl: string;
    role: string;
    recentContributionCount: number;
    projectsCount?: number;
    claimStatus: ClaimStatus;
  }>;
  recentContributions: PulseContribution[];
  projects: PulseProject[];
  achievements: PulseAchievement[];
  communityActivity: Array<{
    id: string;
    timestamp: string;
    actorHandle: string;
    actorDisplayName: string;
    action: string;
    targetName: string;
    activityType?: 'VERIFICATION' | 'CONTRIBUTION' | 'OPPORTUNITY';
    claimStatus: ClaimStatus;
    evidenceUrl: string;
  }>;
  opportunities: PulseOpportunity[];
}
