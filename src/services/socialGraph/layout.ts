import type { DlicomUser, FriendCategory, NetworkStatsData } from '../../types/circle';
import type { SocialConnection, SocialGraphResult, TransformedConstellationData } from './types';

const CATEGORY_COLORS: Record<FriendCategory, string[]> = {
  creators: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af'],
  builders: ['#38bdf8', '#3b82f6', '#60a5fa', '#0ea5e9'],
  communities: ['#10b981', '#34d399', '#059669', '#14b8a6'],
  friends: ['#a855f7', '#8b5cf6', '#c084fc', '#06b6d4'],
};

export function transformSocialGraphToConstellation(graph: SocialGraphResult): TransformedConstellationData {
  const { profile, connections, isMockData = false } = graph;

  // 1. Construct Central Dominant Node
  const currentUser: DlicomUser = {
    id: profile.id || `user-${profile.username}`,
    username: profile.username,
    displayName: profile.displayName || profile.username,
    avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    banner: profile.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    bio: profile.bio || 'Exploring sovereign social graphs and digital constellation identity on Dlicom.',
    role: profile.role || 'Circle Origin',
    category: 'friends',
    tags: isMockData
      ? ['Circle Origin', 'Demo Constellation', 'Simulated Graph']
      : ['Origin Node', 'Public X Profile', 'X Interactions'],
    friendsCount: connections.length,
    followersCount: profile.followersCount,
    followingCount: profile.followingCount,
    verified: profile.verified,
    mutualFriendsCount: 0,
    mutualFriendsList: [],
    connectionStrength: 100,
    interactionScore: 100,
    isOnline: true,
    lastActive: 'Active now',
    joinedDate: profile.joinedDate || 'Recently',
    location: profile.location || 'Cyberspace',
    sparksReceived: 2450,
    isCurrentUser: true,
    socials: {
      twitter: profile.username,
      ...profile.socials,
    },
    recentActivity: isMockData
      ? [
          { id: 'act-c1', action: `[Demo] Initialized 28-node circle for @${profile.username}`, timestamp: 'Active now', iconType: 'spark' },
          { id: 'act-c2', action: '[Demo] Mapped constellation orbits and tier affinities', timestamp: '1h ago', iconType: 'community' },
        ]
      : undefined,
    x: 0,
    y: 0,
    orbitRadius: 0,
    orbitAngle: 0,
    highlightColor: '#38bdf8',
  };

  // 2. Separate connections into 3 Orbit Tiers by connectionStrength
  // Inner: strength >= 80
  // Middle: 50 <= strength < 80
  // Outer: strength < 50
  const sorted = [...connections].sort((a, b) => (b.connectionStrength ?? 50) - (a.connectionStrength ?? 50));

  const innerTier: SocialConnection[] = [];
  const middleTier: SocialConnection[] = [];
  const outerTier: SocialConnection[] = [];

  sorted.forEach((conn, index) => {
    const strength = conn.connectionStrength ?? Math.max(20, Math.min(98, 98 - index * 3));
    if (strength >= 80) {
      innerTier.push(conn);
    } else if (strength >= 50) {
      middleTier.push(conn);
    } else {
      outerTier.push(conn);
    }
  });

  // Ensure reasonable balance across tiers if all connections have similar strengths
  if (innerTier.length === 0 && sorted.length > 0) {
    const take = Math.min(5, Math.ceil(sorted.length / 3));
    innerTier.push(...sorted.slice(0, take));
  }

  // 3. Layout each tier radially
  const layoutTier = (
    tierItems: SocialConnection[],
    baseRadius: number,
    radiusVariance: number,
    angleOffset: number
  ): DlicomUser[] => {
    const count = tierItems.length;
    if (count === 0) return [];

    const angleStep = (2 * Math.PI) / count;

    return tierItems.map((conn, idx) => {
      // Deterministic angle & radius for stability
      const angle = angleOffset + idx * angleStep + ((idx % 3) * 0.08 - 0.08);
      const angleDegrees = Math.round(((angle * 180) / Math.PI + 360) % 360);

      // Subtle radial jitter
      const rJitter = ((idx * 17) % radiusVariance) - radiusVariance / 2;
      const radius = Math.round(baseRadius + rJitter);

      const x = Math.round(radius * Math.cos(angle));
      const y = Math.round(radius * Math.sin(angle));

      const category: FriendCategory = conn.category || (idx % 4 === 0 ? 'creators' : idx % 4 === 1 ? 'builders' : idx % 4 === 2 ? 'communities' : 'friends');
      const palette = CATEGORY_COLORS[category] || CATEGORY_COLORS.friends;
      const highlightColor = palette[idx % palette.length];
      const strength = conn.connectionStrength ?? Math.max(25, Math.round(100 - (radius / 520) * 80));

      return {
        id: conn.id || `conn-${conn.username}-${idx}`,
        username: conn.username,
        displayName: conn.displayName || conn.username,
        avatar: conn.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
        banner: conn.banner || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        bio: conn.bio || `Active member in @${profile.username}'s network.`,
        role: conn.role || (category === 'creators' ? 'Creative Node' : category === 'builders' ? 'Core Builder' : category === 'communities' ? 'Guild Member' : 'Network Ally'),
        category,
        tags: conn.tags && conn.tags.length > 0 ? conn.tags : [isMockData ? 'Demo Node' : 'X Community', 'Social Graph', category],
        friendsCount: conn.followersCount || Math.min(connections.length, (conn.mutualFriendsCount ?? 0) + 1),
        mutualFriendsCount: conn.interactionCount ?? conn.mutualFriendsCount ?? 1,
        mutualFriendsList: conn.mutualFriendsList || [],
        connectionStrength: strength,
        interactionScore: conn.interactionScore ?? strength,
        interactionTypes: conn.interactionTypes || [],
        isOnline: conn.isOnline ?? (idx % 3 !== 0),
        lastActive: conn.lastActive || (idx % 3 !== 0 ? 'Active now' : `${((idx * 3) % 12) + 1}h ago`),
        joinedDate: conn.joinedDate || '2025',
        location: conn.location || 'Global',
        sparksReceived: conn.sparksReceived ?? Math.round(400 + (idx * 110) % 2500),
        socials: {
          twitter: conn.username,
          ...conn.socials,
        },
        recentActivity: conn.recentActivity,
        x,
        y,
        orbitRadius: radius,
        orbitAngle: angleDegrees,
        highlightColor,
      };
    });
  };

  const innerFriends = layoutTier(innerTier, 205, 30, 0.4);
  const middleFriends = layoutTier(middleTier, 345, 40, 1.2);
  const outerFriends = layoutTier(outerTier, 495, 50, 0.7);

  const friends = [...innerFriends, ...middleFriends, ...outerFriends];

  // 4. Compute Network Statistics HUD Data
  const totalFriends = friends.length;
  const mutualConnections = friends.reduce((sum, f) => sum + f.mutualFriendsCount, 0);
  const activeToday = friends.filter((f) => f.isOnline).length;
  const communitiesCount = friends.filter((f) => f.category === 'communities').length;
  const avgScore = totalFriends > 0
    ? Math.round(friends.reduce((sum, f) => sum + f.connectionStrength, 0) / totalFriends)
    : 0;

  const stats: NetworkStatsData = graph.stats || {
    totalFriends,
    mutualConnections,
    activeToday,
    communitiesCount,
    avgConnectionScore: avgScore,
  };

  return {
    currentUser,
    friends,
    stats,
    isMockData,
  };
}
