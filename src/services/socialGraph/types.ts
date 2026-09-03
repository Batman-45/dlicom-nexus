import type { DlicomUser, FriendCategory, MutualFriendInfo, NetworkStatsData, RecentActivityItem } from '../../types/circle';

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
}

export interface SocialGraphResult {
  profile: SocialProfile;
  connections: SocialConnection[];
  stats?: NetworkStatsData;
  isMockData?: boolean;
  isStale?: boolean;
  dataStatus?: string;
  reason?: string;
  fetchedAt: string;
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
}
