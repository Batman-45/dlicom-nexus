import type { SocialConnection, SocialGraphProvider, SocialProfile, SocialGraphResult } from './types';
import { SocialGraphError } from './types';
import { CURRENT_USER as DEMO_CURRENT_USER, FRIENDS_DATA as DEMO_FRIENDS_DATA, NETWORK_STATS as DEMO_NETWORK_STATS } from '../../data/friends';
import { seedFromString, createSeededRng, seededShuffle } from './deterministicSeed';

const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1640951613773-54706e06851d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1645378999013-95abebf5f3c1?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=160&auto=format&fit=crop&q=80',
] as const;

const BANNER_POOL = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&auto=format&fit=crop&q=80',
] as const;

const FIRST_NAMES = [
  'Elena', 'Kenji', 'Maya', 'Liam', 'Zara', 'Lucas', 'Sophia', 'Devon',
  'Chloe', 'Mateo', 'Aria', 'Hassan', 'Oliver', 'Nadia', 'Yuki', 'Gabriel',
  'Camilla', 'Samuel', 'Ananya', 'Kai', 'Priya', 'Ren', 'Leila', 'Finn',
  'Isadora', 'Tomás', 'Amara', 'Felix', 'Sora', 'Ikaika', 'Rania', 'Desmond',
  'Ingrid', 'Kwame', 'Miriam',
] as const;

const LAST_NAMES = [
  'Vance', 'Sato', 'Lin', 'Nakamoto', 'Al-Mansoor', 'Dubois', 'Lorenzen',
  'Miles', 'Pixel', 'Silva', 'Thorne', 'Malik', 'Berg', 'Petrov', 'Tanaka',
  'Santos', 'Rossi', 'King', 'Sharma', 'Sterling', 'Okafor', 'Watanabe',
  'Ferreira', 'Andersen', 'Novak', 'Reyes', 'Ito', 'Bauer',
] as const;

const HANDLE_SUFFIXES = [
  'dev', 'art', 'eth', 'zk', 'sol', 'node', 'code', 'p2p', 'build',
  'labs', 'hq', 'xyz', 'io', 'studio', 'dao', 'protocol', 'net',
] as const;

type ConnCategory = 'creators' | 'builders' | 'communities' | 'friends';

interface Archetype {
  role: string;
  cat: ConnCategory;
  bio: string;
  tags: string[];
  activityVerb: string;
  iconType: 'spark' | 'community' | 'art' | 'code' | 'connect';
}

const ARCHETYPES: readonly Archetype[] = [
  { role: 'Generative Artist', cat: 'creators', bio: 'Designing interactive visual systems, generative shaders, and data-driven canvases.', tags: ['Generative Art', 'GLSL', 'Creative Coding', 'Three.js'], activityVerb: 'published a new generative canvas', iconType: 'art' },
  { role: 'Protocol Builder', cat: 'builders', bio: 'Working on zero-knowledge proofs, peer-to-peer state sync, and distributed ledgers.', tags: ['ZK Proofs', 'Rust', 'P2P Networks', 'Consensus'], activityVerb: 'merged a protocol optimization PR', iconType: 'code' },
  { role: 'Guild Steward', cat: 'communities', bio: 'Organizing global developer hubs, local hackathons, and community learning circles.', tags: ['DAOs', 'Public Goods', 'Hackathons', 'Mentorship'], activityVerb: 'hosted a community meetup', iconType: 'community' },
  { role: 'UI/UX Architect', cat: 'creators', bio: 'Crafting minimalist design systems, typography frameworks, and canvas graph tools.', tags: ['Design Systems', 'Figma', 'Motion Design', 'Typography'], activityVerb: 'shipped a new design system token update', iconType: 'art' },
  { role: 'Infra Lead', cat: 'builders', bio: 'High-performance GraphQL telemetry, IPFS pinning, and decentralized storage layers.', tags: ['GraphQL', 'IPFS', 'DevOps', 'Observability'], activityVerb: 'deployed a new infra pipeline', iconType: 'code' },
  { role: 'Community Lead', cat: 'communities', bio: 'Fostering local tech gatherings, digital nomad hubs, and cross-chain ecosystem events.', tags: ['Events', 'Digital Nomad', 'Ecosystem', 'Cross-chain'], activityVerb: 'launched a new community initiative', iconType: 'community' },
  { role: 'Network Researcher', cat: 'friends', bio: 'Exploring sovereign identity, distributed reputation, and social graph topology.', tags: ['Graph Theory', 'Identity', 'Reputation', 'Decentralization'], activityVerb: 'published a research thread', iconType: 'spark' },
  { role: 'Open Source Developer', cat: 'builders', bio: 'Maintaining core open-source libraries for decentralized social protocols.', tags: ['Open Source', 'TypeScript', 'Node.js', 'Protocols'], activityVerb: 'released a new library version', iconType: 'code' },
  { role: 'Audiovisual Creator', cat: 'creators', bio: 'Blending ambient soundscapes with 3D world design and interactive audiovisual art.', tags: ['Spatial Audio', 'Three.js', 'Synthesizers', 'Immersive XR'], activityVerb: 'shared a new immersive audiovisual piece', iconType: 'art' },
  { role: 'Ecosystem Builder', cat: 'communities', bio: 'Bridging on-chain and off-chain communities through grants, bounties, and coordination.', tags: ['Grants', 'Bounties', 'Web3', 'Coordination'], activityVerb: 'launched a new ecosystem grant round', iconType: 'community' },
  { role: 'Educator', cat: 'friends', bio: 'Creating open learning resources for decentralized technologies and digital sovereignty.', tags: ['Education', 'Tutorials', 'Open Learning', 'Web3 Literacy'], activityVerb: 'published a learning guide', iconType: 'spark' },
  { role: 'Full-Stack Founder', cat: 'builders', bio: 'Building end-to-end decentralized products from protocol to polished user interface.', tags: ['Startups', 'Full-Stack', 'Product Design', 'Founder'], activityVerb: 'shipped a new product milestone', iconType: 'code' },
] as const;

const LOCATIONS = [
  'San Francisco, CA', 'Tokyo, Japan', 'Berlin, Germany', 'London, UK',
  'Bengaluru, India', 'New York, NY', 'Lisbon, Portugal', 'Singapore',
  'Amsterdam, NL', 'Seoul, South Korea', 'São Paulo, Brazil', 'Remote',
  'Nairobi, Kenya', 'Dubai, UAE', 'Toronto, Canada', 'Kyoto, Japan',
  'Barcelona, Spain', 'Cape Town, SA',
] as const;

const PROFILE_BIOS = [
  'Exploring decentralized social graphs and digital constellation identity on Dlicom.',
  'Building open social protocols and permissionless network tools.',
  'Pioneer of sovereign identity and composable community graphs.',
  'Graph theorist by day, constellation mapper by night. Web3 explorer.',
  'Connecting the open social web — one link at a time.',
  'Architect of decentralized circles, guilds, and community constellations.',
  'Open-source believer. Social graph pioneer. Digital nomad.',
  'Turning social connections into living, breathing constellations.',
] as const;

const PROFILE_ROLES = [
  'Circle Pioneer', 'Graph Explorer', 'Network Architect', 'Constellation Mapper',
  'Protocol Enthusiast', 'Open Social Builder', 'Decentralized Native', 'Guild Founder',
] as const;

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function usernameToDisplayName(username: string): string {
  const withSpaces = username.replace(/([a-z])([A-Z])/g, '$1 $2');
  const parts = withSpaces.split(/[._\-\s]+/).filter(Boolean);
  return parts.map(capitalize).join(' ') || capitalize(username);
}

export class MockSocialGraphProvider implements SocialGraphProvider {
  readonly mode = 'mock' as const;

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getProfile(rawUsername: string): Promise<SocialProfile> {
    await this.delay(400);
    const username = rawUsername.replace(/^@+/, '').trim().toLowerCase();

    if (!username) {
      throw new SocialGraphError('Please enter a valid X username.', 'INVALID_HANDLE');
    }

    if (username === 'notfound' || username.startsWith('notfound_')) {
      throw new SocialGraphError("Couldn't find that X account.", 'NOT_FOUND');
    }

    if (username === 'error' || username.startsWith('error_')) {
      throw new SocialGraphError('Unable to build your Circle right now.', 'UNAVAILABLE');
    }

    if (username === 'alexchen' || username === 'alex.dlicom') {
      return {
        id: DEMO_CURRENT_USER.id,
        username: DEMO_CURRENT_USER.username,
        displayName: DEMO_CURRENT_USER.displayName,
        avatar: DEMO_CURRENT_USER.avatar,
        banner: DEMO_CURRENT_USER.banner,
        bio: DEMO_CURRENT_USER.bio,
        role: DEMO_CURRENT_USER.role,
        followersCount: DEMO_CURRENT_USER.friendsCount,
        followingCount: 142,
        location: DEMO_CURRENT_USER.location,
        joinedDate: DEMO_CURRENT_USER.joinedDate,
        socials: DEMO_CURRENT_USER.socials,
      };
    }

    const seed = seedFromString(username);
    const rng = createSeededRng(seed);

    const avatars = seededShuffle([...AVATAR_POOL], rng);
    const banners = seededShuffle([...BANNER_POOL], rng);

    return {
      id: `mock-user-${username}`,
      username,
      displayName: usernameToDisplayName(username),
      avatar: avatars[0],
      banner: banners[0],
      bio: rng.pick(PROFILE_BIOS),
      role: rng.pick(PROFILE_ROLES),
      followersCount: 28,
      followingCount: 28,
      location: rng.pick(LOCATIONS),
      joinedDate: `Joined ${rng.pick(['Jan', 'Mar', 'Jun', 'Sep', 'Nov'] as const)} ${rng.int(2022, 2025)}`,
      socials: {
        twitter: username,
        github: username,
      },
    };
  }

  async getConnections(rawUsername: string): Promise<SocialConnection[]> {
    await this.delay(600);
    const username = rawUsername.replace(/^@+/, '').trim().toLowerCase();

    if (username === 'alexchen' || username === 'alex.dlicom') {
      return DEMO_FRIENDS_DATA.map((f) => ({
        id: f.id,
        username: f.username,
        displayName: f.displayName,
        avatar: f.avatar,
        banner: f.banner,
        bio: f.bio,
        role: f.role,
        category: f.category,
        tags: f.tags,
        connectionStrength: f.connectionStrength,
        mutualFriendsCount: f.mutualFriendsCount,
        mutualFriendsList: f.mutualFriendsList,
        isOnline: f.isOnline,
        lastActive: f.lastActive,
        joinedDate: f.joinedDate,
        location: f.location,
        sparksReceived: f.sparksReceived,
        socials: f.socials,
        recentActivity: f.recentActivity,
      }));
    }

    // ── Seeded deterministic generation ──────────────────────────────────────
    const seed = seedFromString(username);
    const rng = createSeededRng(seed);

    const COUNT = 28;

    const shuffledFirstNames = seededShuffle([...FIRST_NAMES], rng);
    const shuffledLastNames  = seededShuffle([...LAST_NAMES], rng);
    const shuffledAvatars    = seededShuffle([...AVATAR_POOL], rng);
    const shuffledBanners    = seededShuffle([...BANNER_POOL], rng);
    const shuffledArchetypes = seededShuffle([...ARCHETYPES], rng);
    const shuffledLocations  = seededShuffle([...LOCATIONS], rng);
    const shuffledSuffixes   = seededShuffle([...HANDLE_SUFFIXES], rng);

    return Array.from({ length: COUNT }, (_, idx) => {
      const firstName = shuffledFirstNames[idx % shuffledFirstNames.length];
      const lastName  = shuffledLastNames[idx % shuffledLastNames.length];
      const archetype = shuffledArchetypes[idx % shuffledArchetypes.length];

      // Build a handle that feels personal and varied
      const suffix        = shuffledSuffixes[idx % shuffledSuffixes.length];
      const handleVariant = rng.int(0, 2);
      const handle =
        handleVariant === 0
          ? `${firstName.toLowerCase()}_${suffix}`
          : handleVariant === 1
          ? `${firstName.toLowerCase()}${lastName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4)}`
          : `${firstName.toLowerCase()}.${suffix}`;

      const avatar   = shuffledAvatars[idx % shuffledAvatars.length];
      const banner   = shuffledBanners[idx % shuffledBanners.length];
      const location = shuffledLocations[idx % shuffledLocations.length];

      // Inner (0–7): ~80–96  |  Middle (8–17): ~50–79  |  Outer (18–27): ~22–49
      const baseStrength =
        idx < 8  ? rng.int(80, 96) :
        idx < 18 ? rng.int(50, 79) :
                   rng.int(22, 49);

      const isOnline          = rng.next() > 0.38;
      const hoursAgo          = rng.int(1, 23);
      const lastActive        = isOnline ? 'Active now' : `${hoursAgo}h ago`;
      const rawMutuals        = rng.int(1, Math.max(2, 32 - idx));
      // Scale mutual connections realistically to the 28-node circle (1 to 18)
      const mutualFriendsCount = idx < 8
        ? Math.min(18, Math.max(8, Math.round(rawMutuals * 0.6)))
        : idx < 18
        ? Math.min(12, Math.max(4, Math.round(rawMutuals * 0.4)))
        : Math.min(6, Math.max(1, Math.round(rawMutuals * 0.25)));
      const circleConnections = Math.min(28, mutualFriendsCount + 1);
      const sparksReceived    = rng.int(240, 3400);
      const joinYear          = rng.int(2022, 2025);
      const joinMonth         = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'][rng.int(0, 5)];

      return {
        id: `mock-conn-${username}-${idx}`,
        username: handle,
        displayName: `${firstName} ${lastName}`,
        avatar,
        banner,
        bio: archetype.bio,
        role: archetype.role,
        category: archetype.cat,
        tags: ['Demo Identity', ...archetype.tags],
        connectionStrength: baseStrength,
        followersCount: circleConnections,
        followingCount: circleConnections,
        mutualFriendsCount,
        isOnline,
        lastActive,
        joinedDate: `${joinMonth} ${joinYear}`,
        location,
        sparksReceived,
        socials: { twitter: handle },
        recentActivity: [
          {
            id: `act-${username}-${idx}`,
            action: `[Demo] ${firstName} · ${archetype.activityVerb}`,
            timestamp: lastActive === 'Active now' ? 'Just now' : lastActive,
            iconType: archetype.iconType,
          },
        ],
      };
    });
  }

  async getGraph(rawUsername: string): Promise<SocialGraphResult> {
    const profile = await this.getProfile(rawUsername);
    const connections = await this.getConnections(rawUsername);

    return {
      profile,
      connections,
      isMockData: true,
      fetchedAt: new Date().toISOString(),
    };
  }

  // Explicit helper for prototype demo loading
  async getDemoPreset(): Promise<SocialGraphResult> {
    await this.delay(500);
    return {
      profile: {
        id: DEMO_CURRENT_USER.id,
        username: DEMO_CURRENT_USER.username,
        displayName: DEMO_CURRENT_USER.displayName,
        avatar: DEMO_CURRENT_USER.avatar,
        banner: DEMO_CURRENT_USER.banner,
        bio: DEMO_CURRENT_USER.bio,
        role: DEMO_CURRENT_USER.role,
        followersCount: DEMO_CURRENT_USER.friendsCount,
        followingCount: 142,
        location: DEMO_CURRENT_USER.location,
        joinedDate: DEMO_CURRENT_USER.joinedDate,
        socials: DEMO_CURRENT_USER.socials,
      },
      connections: DEMO_FRIENDS_DATA.map((f) => ({
        id: f.id,
        username: f.username,
        displayName: f.displayName,
        avatar: f.avatar,
        banner: f.banner,
        bio: f.bio,
        role: f.role,
        category: f.category,
        tags: f.tags,
        connectionStrength: f.connectionStrength,
        mutualFriendsCount: f.mutualFriendsCount,
        mutualFriendsList: f.mutualFriendsList,
        isOnline: f.isOnline,
        lastActive: f.lastActive,
        joinedDate: f.joinedDate,
        location: f.location,
        sparksReceived: f.sparksReceived,
        socials: f.socials,
        recentActivity: f.recentActivity,
      })),
      stats: DEMO_NETWORK_STATS,
      isMockData: true,
      fetchedAt: new Date().toISOString(),
    };
  }
}
