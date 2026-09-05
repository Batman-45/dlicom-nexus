import type { DlicomUser, FriendCategory, MutualFriendInfo, NetworkStatsData, RecentActivityItem } from '../../types/circle';
import type { CommunityMember } from '../community/types';

export interface SocialProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner?: string;
  bio: string;
  role?: string;
  followersCount?: number;
  followingCount?: number;
  verified?: boolean;
  location?: string;
  joinedDate?: string;
  socials?: {
    twitter?: string;
    github?: string;
    warpcast?: string;
    website?: string;
  };
}

export interface SocialConnection extends SocialProfile {
  category?: FriendCategory;
  tags?: string[];
  connectionStrength?: number; // 0 to 100
  interactionScore?: number; // 0 to 100
  interactionCount?: number;
  interactionTypes?: string[];
  mutualFriendsCount?: number;
  mutualFriendsList?: MutualFriendInfo[];
  isOnline?: boolean;
  lastActive?: string;
  sparksReceived?: number;
  recentActivity?: RecentActivityItem[];
  // Personal Circle Membership & Dlicom Classification
  circleEligible?: boolean;
  communityClassification?: 'official' | 'community_role' | 'community_friend' | 'candidate' | 'external';
  // Dlicom Evidence Fields
  dliId?: string;
  verificationLevel?: string;
  evidenceSummary?: string;
  officialSourceUrl?: string;
  evidenceUrls?: string[];
  matchExplanation?: string;
  confidenceScore?: number;
  sourceFreshness?: string;
}

export interface SocialGraphResult {
  profile: SocialProfile;
  connections: SocialConnection[]; // Personal Friend Circle connections (all circle-eligible real connections)
  circleFriends?: SocialConnection[]; // Explicit alias for personal friend circle
  rawConnections?: SocialConnection[]; // All analyzed raw X connections
  rawConnectionsCount?: number;
  stats?: NetworkStatsData;
  isMockData?: boolean;
  isStale?: boolean;
  dataStatus?: string;
  reason?: string;
  fetchedAt: string;
  // Community Evidence & Classification Breakdown
  totalCandidatesAnalyzed?: number;
  circleEligibleCount?: number;
  matchedMembersCount?: number; // Verified Dlicom members count (official + community role + community friend)
  officialMatchesCount?: number;
  communityFriendMatchesCount?: number;
  candidateMatchesCount?: number;
  externalFriendsCount?: number;
  potentialCommunityMembers?: CommunityMember[]; // COMMUNITY_CANDIDATE (separate view)
  externalAccountsCount?: number; // Filtered accounts
  matchExplanations?: Record<string, string>;
}

export interface SocialGraphProvider {
  readonly mode: 'mock' | 'production';
  getProfile(username: string): Promise<SocialProfile>;
  getConnections(username: string): Promise<SocialConnection[]>;
  getGraph(username: string): Promise<SocialGraphResult>;
}

export type SocialGraphErrorCode = 'NOT_FOUND' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'UNAVAILABLE' | 'INVALID_HANDLE';

export class SocialGraphError extends Error {
  code: SocialGraphErrorCode;
  constructor(message: string, code: SocialGraphErrorCode) {
    super(message);
    this.name = 'SocialGraphError';
    this.code = code;
  }
}

export interface TransformedConstellationData {
  currentUser: DlicomUser;
  friends: DlicomUser[];
  stats: NetworkStatsData;
  isMockData: boolean;
  dataStatus?: string;
  reason?: string;
  potentialCommunityMembers?: CommunityMember[];
  totalCandidatesAnalyzed?: number;
  circleEligibleCount?: number;
  matchedMembersCount?: number;
  officialMatchesCount?: number;
  communityFriendMatchesCount?: number;
  candidateMatchesCount?: number;
  externalFriendsCount?: number;
  externalAccountsCount?: number;
  matchExplanations?: Record<string, string>;
  rawConnections?: SocialConnection[];
  rawConnectionsCount?: number;
}
