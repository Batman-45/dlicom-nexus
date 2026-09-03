export type FriendCategory = 'friends' | 'creators' | 'builders' | 'communities';

export type CircleFilter = 'all' | 'friends' | 'creators' | 'builders' | 'communities' | 'active';

export interface MutualFriendInfo {
  id: string;
  name: string;
  avatar: string;
}

export interface UserSocials {
  twitter?: string;
  github?: string;
  warpcast?: string;
  telegram?: string;
  website?: string;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  timestamp: string;
  iconType?: 'spark' | 'community' | 'art' | 'code' | 'connect';
}

export interface DlicomUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner?: string;
  bio: string;
  role: string;
  category: FriendCategory;
  tags: string[];
  friendsCount: number;
  mutualFriendsCount: number;
  mutualFriendsList: MutualFriendInfo[];
  connectionStrength: number; // 0 to 100
  interactionScore?: number; // 0 to 100 observed score
  interactionTypes?: string[];
  followersCount?: number;
  followingCount?: number;
  verified?: boolean;
  isOnline: boolean;
  lastActive?: string;
  joinedDate: string;
  location?: string;
  sparksReceived?: number;
  isCurrentUser?: boolean;
  socials?: UserSocials;
  recentActivity?: RecentActivityItem[];
  // Visual layout coordinates in constellation space (relative to center 0,0)
  x: number;
  y: number;
  orbitRadius: number; // distance from center
  orbitAngle: number; // angle in degrees
  highlightColor?: string;
}

export interface NetworkStatsData {
  totalFriends: number;
  mutualConnections: number;
  activeToday: number;
  communitiesCount: number;
  avgConnectionScore: number;
}

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}
