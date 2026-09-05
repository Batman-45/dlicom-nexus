import type { DlicomUser, FriendCategory, NetworkStatsData } from '../../types/circle';
import type { SocialConnection, SocialGraphResult, TransformedConstellationData } from './types.ts';

const CATEGORY_COLORS: Record<FriendCategory, string[]> = {
  creators: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af'],
  builders: ['#38bdf8', '#3b82f6', '#60a5fa', '#0ea5e9'],
  communities: ['#10b981', '#34d399', '#059669', '#14b8a6'],
  friends: ['#a855f7', '#8b5cf6', '#c084fc', '#06b6d4'],
};

// Seeded pseudorandom generator for 100% deterministic, organic layout
function createSeededRng(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

export function transformSocialGraphToConstellation(graph: SocialGraphResult): TransformedConstellationData {
  const { profile, connections, isMockData = false } = graph;

  // 1. Construct Central Hero Dominant Node ("YOU")
  const currentUser: DlicomUser = {
    id: profile.id || `user-${profile.username}`,
    username: profile.username,
    displayName: profile.displayName || profile.username,
    avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
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
    nodeSize: 168, // Dominant central avatar diameter
  };

  // 2. Sort real connections descending by interaction score / strength
  const sorted = [...connections].sort(
    (a, b) => (b.interactionScore ?? b.connectionStrength ?? 50) - (a.interactionScore ?? a.connectionStrength ?? 50)
  );

  const totalCount = sorted.length;
  const isCompactCommunity = totalCount <= 12; // E.g. 10 connections for RohitDeshmane7
  const rng = createSeededRng(profile.username.toLowerCase());
  const GOLDEN_ANGLE = 2.399963229728653; // Natural phyllotaxis / galaxy distribution
  const baseAngularOffset = rng() * Math.PI * 2;

  // 3. Initial layout calculation with tier sizing and target orbital distances
  interface LayoutNode {
    conn: SocialConnection;
    idx: number;
    size: number;
    targetRadius: number;
    x: number;
    y: number;
  }

  const nodes: LayoutNode[] = sorted.map((conn, idx) => {
    let size = 74;
    let targetRadius = 450;

    // Proportional tier distribution based on network density
    const tier1Cutoff = Math.max(2, Math.ceil(totalCount * 0.28));
    const tier2Cutoff = Math.max(tier1Cutoff + 2, Math.ceil(totalCount * 0.65));

    if (idx < tier1Cutoff) {
      // Tier 1: Prominent hero connections (95–110px)
      size = 104;
      targetRadius = isCompactCommunity ? 220 : 230;
    } else if (idx < tier2Cutoff) {
      // Tier 2: Strong regular interactions (80–90px)
      size = 88;
      targetRadius = isCompactCommunity ? 295 : 335;
    } else {
      // Tier 3: Surrounding community (70–78px)
      size = 74;
      targetRadius = isCompactCommunity ? 370 : 445;
    }

    // Organic angle with natural golden-angle spacing + subtle seeded jitter
    const angle = baseAngularOffset + idx * GOLDEN_ANGLE + (rng() - 0.5) * 0.35;
    const rJitter = (rng() - 0.5) * (isCompactCommunity ? 24 : 38);
    const r = targetRadius + rJitter;

    return {
      conn,
      idx,
      size,
      targetRadius: r,
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
    };
  });

  // 4. Deterministic collision avoidance relaxation loop (35 passes)
  // Ensures zero overlapping avatars and gives ample space for readable @username labels
  const centerRadius = 84; // Half of 168px central node

  for (let iter = 0; iter < 35; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      // A) Clearance from central "YOU" node
      const dCenter = Math.hypot(a.x, a.y);
      const minCenter = centerRadius + a.size / 2 + 52; // Clearance for center glow & labels
      if (dCenter < minCenter) {
        const factor = dCenter > 0.001 ? minCenter / dCenter : 1;
        a.x *= factor;
        a.y *= factor;
      }

      // B) Collision avoidance between sibling nodes
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.size / 2 + b.size / 2 + 42; // Minimum spacing between avatars + labels

        if (dist < minDist) {
          const overlap = minDist - (dist > 0.001 ? dist : 0.001);
          const nx = dist > 0.001 ? dx / dist : Math.cos(i);
          const ny = dist > 0.001 ? dy / dist : Math.sin(i);
          a.x += nx * overlap * 0.5;
          a.y += ny * overlap * 0.5;
          b.x -= nx * overlap * 0.5;
          b.y -= ny * overlap * 0.5;
        }
      }

      // C) Gentle radial spring to maintain organic community orbit
      const curDist = Math.hypot(a.x, a.y);
      if (curDist > 0.001) {
        const diff = curDist - a.targetRadius;
        a.x -= (a.x / curDist) * diff * 0.08;
        a.y -= (a.y / curDist) * diff * 0.08;
      }
    }
  }

  // 5. Transform relaxed nodes into full DlicomUser objects
  const friends: DlicomUser[] = nodes.map(({ conn, idx, size, x, y }) => {
    const finalX = Math.round(x);
    const finalY = Math.round(y);
    const orbitRadius = Math.round(Math.hypot(finalX, finalY));
    const orbitAngle = Math.round(((Math.atan2(finalY, finalX) * 180) / Math.PI + 360) % 360);

    const category: FriendCategory =
      conn.category ||
      (idx % 4 === 0 ? 'creators' : idx % 4 === 1 ? 'builders' : idx % 4 === 2 ? 'communities' : 'friends');
    const palette = CATEGORY_COLORS[category] || CATEGORY_COLORS.friends;
    const isOfficial = conn.communityClassification === 'official';
    const highlightColor = isOfficial ? '#f59e0b' : palette[idx % palette.length];

    const strength =
      conn.interactionScore ??
      conn.connectionStrength ??
      Math.max(25, Math.round(100 - (orbitRadius / 520) * 75));

    return {
      id: conn.id || `conn-${conn.username}-${idx}`,
      username: conn.username,
      displayName: conn.displayName || conn.username,
      avatar:
        conn.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      banner: conn.banner || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      bio: conn.bio || `Active member in @${profile.username}'s network.`,
      role:
        conn.role ||
        (category === 'creators'
          ? 'Creative Node'
          : category === 'builders'
          ? 'Core Builder'
          : category === 'communities'
          ? 'Guild Member'
          : 'Network Ally'),
      category,
      tags:
        conn.tags && conn.tags.length > 0
          ? conn.tags
          : [isMockData ? 'Demo Node' : 'X Community', 'Social Graph', category],
      friendsCount: conn.followersCount || Math.min(connections.length, (conn.mutualFriendsCount ?? 0) + 1),
      mutualFriendsCount: conn.interactionCount ?? conn.mutualFriendsCount ?? 1,
      mutualFriendsList: conn.mutualFriendsList || [],
      connectionStrength: strength,
      interactionScore: strength,
      interactionTypes: conn.interactionTypes || [],
      isOnline: conn.isOnline ?? (idx % 3 !== 0),
      lastActive: conn.lastActive || (idx % 3 !== 0 ? 'Active now' : `${((idx * 3) % 12) + 1}h ago`),
      joinedDate: conn.joinedDate || '2025',
      location: conn.location || 'Global',
      sparksReceived: conn.sparksReceived ?? Math.round(400 + ((idx * 110) % 2500)),
      socials: {
        twitter: conn.username,
        ...conn.socials,
      },
      recentActivity: conn.recentActivity,
      x: finalX,
      y: finalY,
      orbitRadius,
      orbitAngle,
      highlightColor,
      nodeSize: size,
      // Dlicom Verified Community Provenance
      // Personal Circle Membership & Dlicom Classification
      circleEligible: conn.circleEligible,
      communityClassification: conn.communityClassification,
      dliId: conn.dliId,
      verificationLevel: conn.verificationLevel,
      evidenceSummary: conn.evidenceSummary,
      officialSourceUrl: conn.officialSourceUrl,
      evidenceUrls: conn.evidenceUrls,
      matchExplanation: conn.matchExplanation,
      confidenceScore: conn.confidenceScore,
      sourceFreshness: conn.sourceFreshness,
    };
  });

  // 6. Network Statistics HUD Data
  const totalFriends = friends.length;
  const mutualConnections = friends.reduce((sum, f) => sum + f.mutualFriendsCount, 0);
  const activeToday = friends.filter((f) => f.isOnline).length;
  const communitiesCount = friends.filter((f) => f.category === 'communities').length;
  const avgScore =
    totalFriends > 0
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
    dataStatus: graph.dataStatus,
    reason: graph.reason,
    potentialCommunityMembers: graph.potentialCommunityMembers,
    totalCandidatesAnalyzed: graph.totalCandidatesAnalyzed,
    circleEligibleCount: graph.circleEligibleCount,
    matchedMembersCount: graph.matchedMembersCount,
    officialMatchesCount: graph.officialMatchesCount,
    communityFriendMatchesCount: graph.communityFriendMatchesCount,
    candidateMatchesCount: graph.candidateMatchesCount,
    externalFriendsCount: graph.externalFriendsCount,
    externalAccountsCount: graph.externalAccountsCount,
    matchExplanations: graph.matchExplanations,
    rawConnections: graph.rawConnections,
    rawConnectionsCount: graph.rawConnectionsCount,
  };
}
