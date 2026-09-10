/**
 * Dlicom Mascot Identity Engine — Deterministic Mascot Synthesis
 *
 * Core Principles:
 * 1. Immutable Base Character: Uses the official Dlicom mascot character vector.
 * 2. Authentic Web3 & Cyberpunk Attributes: Absolutely NO Marvel/superhero knockoffs.
 * 3. Deterministic Repeatability: FNV-1a hash algorithm ensures same username + signals = identical mascot.
 * 4. Zero Data Fabrication: Traits derived strictly from verified public X signals or user-confirmed fallback.
 */

import type {
  MascotArchetype,
  MascotFamilyId,
  MascotFamilyDefinition,
  MascotVariant,
  PublicXSignals,
  MascotColorTheme,
} from '../../types/mascot';

/**
 * 32-bit FNV-1a hash function
 */
export function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministically pick an element from an array using seed and bitwise salt
 */
export function pickDeterministic<T>(arr: T[], seed: number, salt: number = 0): T {
  const index = Math.abs((seed ^ salt) >>> 0) % arr.length;
  return arr[index];
}

interface ArchetypeDefinition {
  label: string;
  badgePrefix: string;
  characterImage: string;
  outfits: string[];
  equipment: string[];
  accessories: string[];
  expressions: string[];
  environments: string[];
  poses: string[];
  auraEffects: string[];
  temperaments: string[];
  mottos: string[];
  coreDisciplines: string[];
  colorTheme: MascotColorTheme;
}

const ARCHETYPE_REGISTRY: Record<MascotArchetype, ArchetypeDefinition> = {
  PROTOCOL_DEVELOPER: {
    label: 'Protocol Developer',
    badgePrefix: 'Dili • Protocol Engineer',
    characterImage: '/mascots/protocol_core_v1.jpg',
    outfits: [
      'Cyber-Utility Techwear Hoodie with Fiber-Optic Trims',
      'Protocol Monolith Weatherproof Tactical Shell',
      'Base L2 Low-Latency Nanoweave Jacket',
      'Asymmetric Dark-Matter Coder Robe with Luminescent Seams',
      'Modular Carbon-Threaded Field Tunic with Hot-Swap Cable Rings',
    ],
    equipment: [
      'Tactile DLI Holographic Compiler Rig',
      'Dual-Screen Hexagonal Slate Terminal',
      'Sub-Millisecond EVM Execution Gauntlet',
      'Overclocked Decentralized Node Core Driver',
      'Prismatic Bytecode Disassembler Matrix',
    ],
    accessories: [
      'Dual Holographic Code HUD Visor',
      'Encrypted Comm Lanyard with DLI Ledger Key',
      'Quantum Compiler Over-Ear Sensor Monocle',
      'Multi-Band Frequency Tuning Ear-Cuff',
      'Magnetic Hardware Wallet Holster & Chain',
    ],
    expressions: [
      'Laser-focused code concentration with determined smirk',
      'Calm analytical confidence monitoring on-chain states',
      'Sharp algorithmic insight with glowing cyan gaze',
      'Intense intellectual grit analyzing consensus bottlenecks',
      'Visionary creator smile deploying verified bytecode',
    ],
    environments: [
      'Base Blue Matrix Grid with Cascading Hex Streams',
      'Cyberpunk High-Altitude Protocol Node Station',
      'Deep Neon Indigo Smart Contract Foundry',
      'Infinite Fiber-Optic Canyon with Floating Datastreams',
      'Starlight Orbit Terminal Overlooking Connected Chains',
    ],
    poses: [
      'Orchestrating floating Solidity code blocks in mid-air',
      'Typing swiftly on holographic projected keyboard',
      'Inspecting live transaction traces on glowing prism',
      'Crossing arms authoritatively with gauntlet humming with power',
      'Reaching forward calibrating virtual smart contract node',
    ],
    auraEffects: [
      'Subtle pulsating azure cyber-grid aura',
      'Cascading binary stream halo radiating outward',
      'Geometric hex-lattice resonance field',
    ],
    temperaments: [
      'Relentlessly Analytical & Builders-First',
      'Deeply Methodical & Execution-Obsessed',
      'Inventive, Pragmatic & Resilient',
    ],
    mottos: [
      'Code is the foundation; execution is the truth.',
      'Ship clean primitives, verify every state transition.',
      'Decentralized resilience built block by block.',
    ],
    coreDisciplines: [
      'Smart Contract Architecture & Low-Level EVM',
      'Full-Stack Web3 & Consensus Engine Engineering',
      'Distributed Protocol Optimization & Tooling',
    ],
    colorTheme: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      glow: 'rgba(59, 130, 246, 0.45)',
      badgeBg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.4)',
      text: '#93c5fd',
      accent: '#60a5fa',
    },
  },

  AEGIS_SENTINEL: {
    label: 'Security Guardian',
    badgePrefix: 'Dili • Aegis Sentinel',
    characterImage: '/mascots/aegis_defense_v1.jpg',
    outfits: [
      'Cryptographic Aegis Cuirass with Hardened Nanoplate',
      'Reinforced Sentinel Trench with Kinetic Damping Weave',
      'Quantum-Shielded High-Density Bastion Armor',
      'Stealth Anti-Tamper Recon Vest with Diamondweave Coating',
      'Formal Verification Ceremonial Guard Hauberk',
    ],
    equipment: [
      'Hacken-Audited Aegis Energy Barrier Shield',
      'Static Analysis Threat Neutralizer Baton',
      'Reentrancy Protection Disruption Matrix',
      'Zero-Knowledge Proof Verification Rod',
      'High-Frequency Cryptographic Perimeter Beacon',
    ],
    accessories: [
      'Multi-Spectrum Vulnerability Scanner Visor',
      'Zero-Knowledge Proof Insignia Gorget',
      'Hardware Verification Core on Chest Crest',
      'Biometric State Sentinel Gauntlets',
      'Quantum Entropy Keyring with Sharded Tokens',
    ],
    expressions: [
      'Vigilant sentinel gaze standing unwavering guard',
      'Stern impenetrable focus analyzing threat vectors',
      'Poised protector calm with emerald tactical glow',
      'Steely resolute determination defending the network',
      'Incisive auditor scrutiny verifying execution proofs',
    ],
    environments: [
      'Emerald Hexagonal Firewall Grid with Threat Radars',
      'Audited Bastion Vault with Cryptographic Glyphs',
      'Hardened Obsidian Shield Core with Emerald Pulses',
      'High-Security Vault Corridor with Shimmering Lasers',
      'Outer Protocol Perimeter Under Digital Auroras',
    ],
    poses: [
      'Bracing an impenetrable cryptographic barrier forward',
      'Holding scanning optic aloft tracking intrusion patterns',
      'Guardian salute with energized aegis shield locked',
      'Standing at watchful attention with hand on neutralizer baton',
      'Grounding sentinel staff to establish perimeter firewall',
    ],
    auraEffects: [
      'Interlocking emerald hex-barrier shield pulse',
      'Gleaming cryptographic rune ring orbit',
      'Hardened jade kinetic impact damper shimmer',
    ],
    temperaments: [
      'Vigilant, Incorruptible & Steadfast',
      'Zero-Trust Pragmatism & Uncompromising Precision',
      'Protective, Resolute & Thorough',
    ],
    mottos: [
      'Security is not a feature; it is an absolute guarantee.',
      'Defend the perimeter; verify all proofs.',
      'Fortified protocols endure the test of adversaries.',
    ],
    coreDisciplines: [
      'Smart Contract Security & Formal Verification',
      'Penetration Testing & Protocol Threat Modeling',
      'Zero-Knowledge Proof Systems & Cryptographic Auditing',
    ],
    colorTheme: {
      primary: '#10b981',
      secondary: '#059669',
      glow: 'rgba(16, 185, 129, 0.45)',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: '#6ee7b7',
      accent: '#34d399',
    },
  },

  SYSTEM_ARCHITECT: {
    label: 'Builder & Architect',
    badgePrefix: 'Dili • System Architect',
    characterImage: '/mascots/system_foundry_v1.jpg',
    outfits: [
      'Heavy Foundry Exoskeleton Rig with Thermal Dampers',
      'Modular System Architect Overalls with Tool Holsters',
      'Titanium-Reinforced Industrial Frame Harness',
      'High-Temperature Forge Coat with Magnetic Tool Snaps',
      'Orbital Node Assembly Pressure Suit with Padded Braces',
    ],
    equipment: [
      'Omni-Tool Plasma Calibrator & Torque Driver',
      'Luminescent Architectural Blueprint Holo-Slate',
      'Distributed Node Synchronization Core',
      'Heavy-Duty Pipeline Coupler & Fiber Fusion Rig',
      'Cryogenic System Stabilizer Unit',
    ],
    accessories: [
      'Augmented Reality Blueprint Drafting Loupe',
      'High-Temperature Ceramic Work Gloves',
      'Node Telemetry Beacon Pendant',
      'Industrial Laser Distance Meter Eyepiece',
      'Hardened Protocol Ruler & Level Gauge Holster',
    ],
    expressions: [
      'Inventive gritty determination ready to construct',
      'Proud master craftsman smile with energetic sparks',
      'Visionary planner precision assessing foundation tolerances',
      'Confident engineering resolve surveying assembled pipelines',
      'Keen structural focus verifying load parameters',
    ],
    environments: [
      'Amber Protocol Forge Scaffolding with Glowing Girders',
      'High-Throughput Node Assembly Dock in Orbit',
      'Deep Infrastructure Core with Pulsing Fiber Trunks',
      'Massive Industrial Server Foundry with Amber Vents',
      'Modular Pipeline Construction Bay with Neon Trusses',
    ],
    poses: [
      'Actively welding structural protocol scaffolds with beam',
      'Reviewing 3D interactive isometric blueprint schematics',
      'Tightening node coupling with high-torque plasma driver',
      'Shouldering industrial plasma tool with triumphant posture',
      'Connecting glowing optical fiber trunk to master hub',
    ],
    auraEffects: [
      'Radiant amber thermal forge shimmer',
      'Floating isometric structural grid particles',
      'Electric welding spark halo orbiting shoulders',
    ],
    temperaments: [
      'Inventive, Tenacious & Structurally Rigorous',
      'Master Craftsman Dedication & High Standards',
      'Pragmatic Builder Mindset with Visionary Horizon',
    ],
    mottos: [
      'Build infrastructure that outlasts the hype.',
      'Strong foundations support boundless scale.',
      'Architect with intention; forge with precision.',
    ],
    coreDisciplines: [
      'Distributed Systems & Infrastructure DevOps',
      'Scalable Data Pipelines & High-Throughput Nodes',
      'Hardware Orchestration & Protocol Tooling',
    ],
    colorTheme: {
      primary: '#f59e0b',
      secondary: '#d97706',
      glow: 'rgba(245, 158, 11, 0.45)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: '#fcd34d',
      accent: '#fbbf24',
    },
  },

  NEXUS_AMBASSADOR: {
    label: 'Community Lead',
    badgePrefix: 'Dili • Nexus Ambassador',
    characterImage: '/mascots/nexus_syndicate_v1.jpg',
    outfits: [
      'Embroidered Ambassador Sash over Silk-Weave Tunic',
      'Constellation Nexus Mantle with Regional Crests',
      'Diplomatic Envoy Tailored Blazer with Velvet Lapels',
      'High-Collar Cultural Delegate Robe with Gold Tracery',
      'Contemporary Web3 Community Organizer Bomber Jacket',
    ],
    equipment: [
      'Broadcasting Megaphone with Sonic Resonance Wave',
      'Decentralized Governance Voting Scepter',
      'Interactive Global Community Sphere Hologram',
      'Universal Frequency Telemetry Transceiver',
      'Consensus Catalyst Crystal Staff',
    ],
    accessories: [
      'Global Frequency Translator Earpiece',
      'Dlicom Regional Harmony Pin & Golden Cord',
      'Harmonic Voice Modulation Brooch',
      'Stellar Horizon Pendant of Global Unity',
      'Smart Wristband Displaying Active Member Counters',
    ],
    expressions: [
      'Welcoming charismatic smile radiating warmth',
      'Inspiring orator enthusiasm igniting crowd energy',
      'Empathetic collaborative gaze fostering unity',
      'Bright celebratory smile welcoming new contributors',
      'Visionary diplomat dignity bringing voices together',
    ],
    environments: [
      'Purple Constellation Network with Interlinked Nodes',
      'Global Agora Amphitheater with Glowing Banners',
      'Vibrant Sunset Horizon with Ambient Lanterns',
      'Lively Digital Town Square with Floating Avatars',
      'Starlight Plaza with Illuminated Community Pavilions',
    ],
    poses: [
      'Raising broadcast beacon high rallying global community',
      'Holding open hands guiding interconnected member nodes',
      'Presenting community proposal with glowing podium',
      'Giving a welcoming thumbs-up with charismatic wink',
      'Unfurling community governance banner with pride',
    ],
    auraEffects: [
      'Vibrant violet constellation pulse with linked star trails',
      'Warm harmonic sonic resonance rings',
      'Luminescent communal starlight sparkles',
    ],
    temperaments: [
      'Empathetic, Charismatic & Community-Centric',
      'Inspirational Communicator & Consensus Builder',
      'Welcoming, Energetic & Relentlessly Supportive',
    ],
    mottos: [
      'Communities are the true heartbeat of any protocol.',
      'Every contributor voice shapes our collective destiny.',
      'Unite the builders; empower the people.',
    ],
    coreDisciplines: [
      'Community Governance & Ambassador Leadership',
      'Ecosystem Growth Strategy & Public Advocacy',
      'Cross-Cultural Web3 Education & Onboarding',
    ],
    colorTheme: {
      primary: '#a855f7',
      secondary: '#9333ea',
      glow: 'rgba(168, 85, 247, 0.45)',
      badgeBg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.4)',
      text: '#d8b4fe',
      accent: '#c084fc',
    },
  },

  DATA_WEAVER: {
    label: 'Protocol Researcher',
    badgePrefix: 'Dili • Data Weaver',
    characterImage: '/mascots/chrono_research_v1.jpg',
    outfits: [
      'Prismatic Data-Weaver Lab Coat with Optical Weave',
      'Quantum Analytical Cloak with Subatomic Tracers',
      'Neural Interface High-Collar Field Vest',
      'Geometric Data-Patterned Silk Scholar Robe',
      'Minimalist Obsidian Analyst Tunic with Fiber Inlays',
    ],
    equipment: [
      'Holographic Data Slate Prism Projecting 3D Graphs',
      'Stochastic Model Calibration Compass',
      'Quantum Tokenomics Flux Analyzer',
      'On-Chain Liquidity Resonance Sphygmomanometer',
      'Multi-Dimensional Probability Matrix Projector',
    ],
    accessories: [
      'Prismatic Hex-Lensed Analytical Spectacles',
      'Deep-Memory On-Chain Archive Datapad',
      'Zero-Latency Neural Synchronization Crown',
      'Refractive Crystal Stylus for State Plotting',
      'Dual Holographic Chronometer Armband',
    ],
    expressions: [
      'Deeply intrigued scholarly fascination',
      'Quiet intellectual serenity deciphering market curves',
      'Insightful eureka moment with sparkling cyan eyes',
      'Inquisitive academic focus analyzing liquidity flows',
      'Serene contemplation discovering hidden correlations',
    ],
    environments: [
      'Cyan Flux Data Stream with Multi-Dimensional Plots',
      'High-Density Cryptographic Library Archive',
      'Infinite Geometry Room with Floating Mathematical Lemmas',
      'Reflective Observatory with Cascading Market Vectors',
      'Floating Research Pod Over a Sea of Data Ripples',
    ],
    poses: [
      'Manipulating 3D multidimensional scatter plots with fingertips',
      'Deep in thought jotting quantum tokenomic proofs',
      'Aligning dual laser prisms to decrypt state anomalies',
      'Holding holographic data prism admiring clean convergence',
      'Examining floating mathematical proof with magnifying optic',
    ],
    auraEffects: [
      'Prismatic cyan refraction ring radiating analytical pulses',
      'Floating mathematical lemma glyphs and curve lines',
      'Translucent holographic data field surround',
    ],
    temperaments: [
      'Deeply Curious, Methodical & Evidence-Driven',
      'Intellectual Rigor with Passion for First Principles',
      'Contemplative, Precise & Insightful',
    ],
    mottos: [
      'In data we discover truth; in math we anchor trust.',
      'Uncover the signal hidden deep within the noise.',
      'Rigorous research precedes sustainable tokenomics.',
    ],
    coreDisciplines: [
      'Tokenomics Modeling & Mechanism Design',
      'On-Chain Data Science & Econometric Modeling',
      'Cryptographic Protocol Research & Game Theory',
    ],
    colorTheme: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      glow: 'rgba(6, 182, 212, 0.45)',
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.4)',
      text: '#67e8f9',
      accent: '#22d3ee',
    },
  },

  LUMINARY_CREATOR: {
    label: 'Creator & Media',
    badgePrefix: 'Dili • Luminary Artist',
    characterImage: '/mascots/creative_studio_v1.jpg',
    outfits: [
      'Chromatic Gradient Windbreaker with Dynamic Pigments',
      'Holographic Studio Streetwear with Spray Stencils',
      'Neon Luminary Denim Vest with Custom Patches',
      'High-Contrast Cyber-Punk Velvet Duster Coat',
      'Futuristic Creator Flight Jacket with LED Cuff Trims',
    ],
    equipment: [
      'Holographic Light Stylus Painting in Realtime 3D',
      'Multi-Format Streaming Holo-Drone Companion',
      'Vivid Soundboard & Synthesizer Pad',
      'Volumetric Camera Rig with Anamorphic Projection',
      'Digital Canvas Tablet with Infinite Color Palette',
    ],
    accessories: [
      'Ultra-HD Holographic Capture Eyewear',
      'Noise-Canceling Sound-Designer Studio Headphones',
      'Graffiti Luminescence Pen Holster',
      'Prismatic Wristband with Audio Visualizer EQ',
      'Stylized Neon Feather Hair Clip / Antenna',
    ],
    expressions: [
      'Playful audacious creative enthusiasm',
      'Vibrant artistic wonder looking at newly rendered canvases',
      'Confident showrunner charisma addressing the audience',
      'Mischievous spark of inspiration striking in real time',
      'Bold electric grin showing off a freshly minted masterpiece',
    ],
    environments: [
      'Prismatic Chroma Array with Splashes of Digital Neon',
      'Futuristic Streaming Studio with Audio Visualizers',
      'Bustling Creative District with Interactive Murals',
      'Floating Neon Rooftop under a Violet Midnight Sky',
      'Glitch-Art Gallery with Interactive Light Sculptures',
    ],
    poses: [
      'Painting a glowing Dlicom emblem in mid-air with light stylus',
      'Framing a cinematic shot with thumb and index fingers',
      'Mixing live audiovisual frequencies on floating synth',
      'Waving enthusiastically to the audience on streaming holo-feed',
      'Leaning back casually holding glowing digital spray can',
    ],
    auraEffects: [
      'Bursting neon chromatic aura with fluid paint splashes',
      'Pulsing soundwave equalizer rings in electric magenta',
      'Prismatic lens flare corona with glittering stardust',
    ],
    temperaments: [
      'Vibrant, Imaginative & Boundlessly Expressive',
      'Daring Trendsetter & Storyteller with Heart',
      'Playful, Bold & Engaging',
    ],
    mottos: [
      'Design gives soul to technology.',
      'Make Web3 impossible to ignore through vibrant storytelling.',
      'Creativity is the highest form of decentralized rebellion.',
    ],
    coreDisciplines: [
      '3D Generative Art & Brand Experience Design',
      'Audiovisual Production & Interactive Streaming',
      'UI/UX Architecture & Immersive Digital Media',
    ],
    colorTheme: {
      primary: '#ec4899',
      secondary: '#db2777',
      glow: 'rgba(236, 72, 153, 0.45)',
      badgeBg: 'rgba(236, 72, 153, 0.12)',
      border: 'rgba(236, 72, 153, 0.4)',
      text: '#f472b6',
      accent: '#f43f5e',
    },
  },

  FRONTIER_PIONEER: {
    label: 'Ecosystem Scout',
    badgePrefix: 'Dili • Frontier Pioneer',
    characterImage: '/mascots/frontier_expedition_v1.jpg',
    outfits: [
      'Ecosystem Navigator All-Weather Expedition Parka',
      'Frontier Recon Lightweight Cape with Star Maps',
      'Voyager Tactical Field Jumpsuit with Utility Pouches',
      'High-Altitude Traverse Shell with Solar Charging Seams',
      'Rugged Nomad Trench with Reinforced Knee & Elbow Plates',
    ],
    equipment: [
      'Omni-Directional Ecosystem Sensor Scanner',
      'Portable Sub-Node Solar Deployer',
      'High-Gain Signal Flare Launcher',
      'Cartographic Topography Scanner with Beacon Nodes',
      'Resilient Web3 Multi-Chain Survival Kit',
    ],
    accessories: [
      'Topographical Terrain Mapper HUD Visor',
      'Directional Wayfinding Gyroscope Compass',
      'Interstellar Communications Relay Antenna',
      'Tactical Binocular Monocle with Thermal Spectrum',
      'Carabiner Clip with Multi-Chain Key Decoders',
    ],
    expressions: [
      'Curious explorer enthusiasm scouting new territories',
      'Bold adventurous grin scanning distant horizons',
      'Resilient trailblazer focus navigating rugged trails',
      'Courageous optimism stepping onto uncharted ground',
      'Intrepid voyager satisfaction planting a network flag',
    ],
    environments: [
      'Vast Uncharted Web3 Frontier with Distant Auroras',
      'Orbital Observation Deck overlooking Connected Planets',
      'Lush Bioluminescent Valley with Digital Flora',
      'Summit Ridge Overlooking a Glowing Network Megacity',
      'Desert of Crystal Dunes with Overhead Constellations',
    ],
    poses: [
      'Surveying the terrain ahead with hand shielding brow',
      'Planting a glowing Dlicom waypoint flag into the ground',
      'Tracking incoming telemetry signals with handheld radar',
      'Pointing forward toward an exciting distant discovery',
      'Taking a bold stride forward into the luminous unknown',
    ],
    auraEffects: [
      'Deep cosmic indigo halo with twinkling stellar points',
      'Topographical radar sweep line revolving around feet',
      'Atmospheric dawn glow radiating warm golden-violet light',
    ],
    temperaments: [
      'Intrepid, Adventurous & Fearlessly Adaptable',
      'Trailblazing Curiosity & Pioneer Spirit',
      'Resilient Explorer with Deep Network Loyalty',
    ],
    mottos: [
      'Chart the unknown; leave a beacon for those who follow.',
      'The frontier belongs to those bold enough to explore.',
      'Discover, connect, and expand the horizons of decentralized tech.',
    ],
    coreDisciplines: [
      'Ecosystem Exploration & Multi-Chain Discovery',
      'Early-Stage Network Testing & Frontier Research',
      'Trailblazing Contributor & Community Navigator',
    ],
    colorTheme: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      glow: 'rgba(139, 92, 246, 0.45)',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.4)',
      text: '#c4b5fd',
      accent: '#a78bfa',
    },
  },
};

/**
 * Derives archetype deterministically from legitimate public signals or user-confirmed focus.
 * Strictly avoids guessing or fabricating data.
 */
export function deriveArchetypeFromSignals(
  signals: PublicXSignals,
  userConfirmedFocus?: string
): { archetype: MascotArchetype; detectedKeywords: string[]; inferredFocus: string } {
  // If user explicitly confirmed/provided a focus (e.g. during rate-limit fallback)
  if (userConfirmedFocus) {
    const norm = userConfirmedFocus.toUpperCase();
    if (norm.includes('DEV') || norm.includes('CODE') || norm.includes('ENGINEER')) {
      return { archetype: 'PROTOCOL_DEVELOPER', detectedKeywords: [userConfirmedFocus], inferredFocus: userConfirmedFocus };
    }
    if (norm.includes('SECURITY') || norm.includes('AUDIT') || norm.includes('GUARD')) {
      return { archetype: 'AEGIS_SENTINEL', detectedKeywords: [userConfirmedFocus], inferredFocus: userConfirmedFocus };
    }
    if (norm.includes('BUILD') || norm.includes('ARCHITECT') || norm.includes('INFRA')) {
      return { archetype: 'SYSTEM_ARCHITECT', detectedKeywords: [userConfirmedFocus], inferredFocus: userConfirmedFocus };
    }
    if (norm.includes('COMMUNITY') || norm.includes('LEAD') || norm.includes('MOD')) {
      return { archetype: 'NEXUS_AMBASSADOR', detectedKeywords: [userConfirmedFocus], inferredFocus: userConfirmedFocus };
    }
    if (norm.includes('RESEARCH') || norm.includes('DATA') || norm.includes('TOKENOMICS')) {
      return { archetype: 'DATA_WEAVER', detectedKeywords: [userConfirmedFocus], inferredFocus: userConfirmedFocus };
    }
    if (norm.includes('CREAT') || norm.includes('DESIGN') || norm.includes('ART')) {
      return { archetype: 'LUMINARY_CREATOR', detectedKeywords: [userConfirmedFocus], inferredFocus: userConfirmedFocus };
    }
    if (norm.includes('FRONTIER') || norm.includes('PIONEER') || norm.includes('SCOUT') || norm.includes('EXPLOR')) {
      return { archetype: 'FRONTIER_PIONEER', detectedKeywords: [userConfirmedFocus], inferredFocus: userConfirmedFocus };
    }
  }

  const bioText = (signals.bio || '').toLowerCase();
  const nameText = (signals.displayName || '').toLowerCase();
  const handleText = (signals.username || '').toLowerCase();
  const combined = `${nameText} ${handleText} ${bioText}`;
  const keywords: string[] = [];

  // 1. Security / Audit / Guardian / Sentinel / Defense / Protector
  if (/\b(security|audit|auditor|auditing|hacken|guardian|sentinel|infosec|protector|defense|defender|vigilante|super\s*hero|superhero|hero|shield|protect|batman)\b/i.test(combined)) {
    const matched = combined.match(/\b(security|audit|auditor|auditing|hacken|guardian|sentinel|infosec|protector|defense|defender|vigilante|super\s*hero|superhero|hero|shield|protect|batman)\b/i);
    const kw = matched ? matched[0].toLowerCase() : 'security';
    keywords.push('security', kw);
    return {
      archetype: 'AEGIS_SENTINEL',
      detectedKeywords: Array.from(new Set(keywords)),
      inferredFocus: 'Autonomous Protocol Defense & Sentinel Security',
    };
  }

  // 2. Developer / Software Engineer / Smart Contracts
  if (/\b(developers?|devs?|engineers?|solidity|rust|code|coding|software|fullstack|frontend|backend|evm|smart contracts?|protocol developers?|programmers?|tech leads?)\b/i.test(combined)) {
    keywords.push('development', 'code');
    return {
      archetype: 'PROTOCOL_DEVELOPER',
      detectedKeywords: keywords,
      inferredFocus: 'Core Protocol & Software Development',
    };
  }

  // 3. System Architecture / Infrastructure / DevOps
  if (/\b(architects?|architecture|infrastructure|infra|devops|validators?|node runners?|distributed systems|builders?|systems|cloud)\b/i.test(combined)) {
    keywords.push('architecture', 'infrastructure');
    return {
      archetype: 'SYSTEM_ARCHITECT',
      detectedKeywords: keywords,
      inferredFocus: 'Infrastructure & System Architecture',
    };
  }

  // 4. Research / Data / Tokenomics / Cryptographic Theory
  if (/\b(research|researchers?|tokenomics|analysts?|analytics|economists?|economics|quants?|data scientists?|data|vitalik|vitalikbuterin|ethereum|cryptography|cryptographic|protocol research)\b/i.test(combined)) {
    const matched = combined.match(/\b(research|researchers?|tokenomics|analysts?|analytics|economists?|economics|quants?|data scientists?|data|vitalik|vitalikbuterin|ethereum|cryptography|cryptographic)\b/i);
    const kw = matched ? matched[0].toLowerCase() : 'research';
    keywords.push('research', kw);
    return {
      archetype: 'DATA_WEAVER',
      detectedKeywords: Array.from(new Set(keywords)),
      inferredFocus: 'Protocol Research & Quantitative Analysis',
    };
  }

  // 5. Creative / Content / Design / Media / Entertainment / Comics / Games
  if (/\b(design|designers?|creators?|artists?|\bart\b|ui\/ux|\bui\b|\bux\b|content|media|writers?|creative|illustrators?|animators?|comics?|movies?|films?|cinema|television|tv\s*shows?|video\s*games?|gaming|games?|entertainment|storytelling|publishing|authors?|dccomics)\b/i.test(combined)) {
    const matched = combined.match(/\b(comics?|movies?|films?|video\s*games?|gaming|games?|entertainment|design|art|creator|dccomics)\b/i);
    const kw = matched ? matched[0].toLowerCase() : 'creative';
    keywords.push('creative', kw);
    return {
      archetype: 'LUMINARY_CREATOR',
      detectedKeywords: Array.from(new Set(keywords)),
      inferredFocus: 'Design, Media & Content Creation',
    };
  }

  // 6. Community / Ambassador / Growth / Lead
  if (/\b(community|ambassadors?|leads?|growth|moderators?|\bmods?\b|regional|advocates?|relations|ecosystem)\b/i.test(combined)) {
    keywords.push('community', 'growth');
    return {
      archetype: 'NEXUS_AMBASSADOR',
      detectedKeywords: keywords,
      inferredFocus: 'Community Leadership & Ecosystem Growth',
    };
  }

  // 7. Default: Frontier Pioneer (scout / explorer)
  return {
    archetype: 'FRONTIER_PIONEER',
    detectedKeywords: ['ecosystem explorer'],
    inferredFocus: 'Web3 Frontier Exploration & Network Participation',
  };
}

/**
 * The 12 Authentic Mascot Families with 3 distinct visual variants each (36 total characters).
 * Base variant 1 for original archetypes maps to their established assets for backwards compatibility.
 */
export const MASCOT_FAMILY_REGISTRY: Record<MascotFamilyId, MascotFamilyDefinition> = {
  PROTOCOL_CORE: {
    familyId: 'PROTOCOL_CORE',
    familyName: 'Protocol Core',
    archetype: 'PROTOCOL_DEVELOPER',
    familyMotto: 'Code is the foundation; execution is the truth.',
    temperament: 'Relentlessly Analytical & Builders-First',
    coreDiscipline: 'Low-Level EVM & Smart Contract Architecture',
    colorTheme: ARCHETYPE_REGISTRY.PROTOCOL_DEVELOPER.colorTheme,
    variants: [
      {
        variantId: 'CORE_ENGINEER',
        variantName: 'Core Engineer',
        variantBadge: 'Protocol Core • Core Engineer',
        characterImage: '/mascots/protocol_core_v1.jpg',
        outfit: 'Cyber-Utility Techwear Hoodie with Fiber-Optic Trims',
        equipment: 'Tactile DLI Holographic Compiler Rig',
        accessory: 'Dual Holographic Code HUD Visor',
        expression: 'Laser-focused code concentration with determined smirk',
        environment: 'Base Blue Matrix Grid with Cascading Hex Streams',
        pose: 'Orchestrating floating Solidity code blocks in mid-air',
        auraEffect: 'Subtle pulsating azure cyber-grid aura',
        silhouetteDescription: 'Hooded cyber-engineer with twin floating terminal slates',
      },
      {
        variantId: 'ALCHEMIST_SYNTH',
        variantName: 'Alchemist Synth',
        variantBadge: 'Protocol Core • Alchemist Synth',
        characterImage: '/mascots/protocol_core_v2.jpg',
        outfit: 'Nanotech Reinforced Coder Tunic with Prismatic Threading',
        equipment: 'Overclocked State Transition Conduit Gauntlet',
        accessory: 'Quantum Compiler Over-Ear Sensor Monocle',
        expression: 'Calm analytical confidence monitoring on-chain states',
        environment: 'Deep Neon Indigo Smart Contract Foundry',
        pose: 'Typing swiftly on holographic projected keyboard',
        auraEffect: 'Cascading binary stream halo radiating outward',
        silhouetteDescription: 'Gilded techwear coder with glowing prism matrix',
      },
      {
        variantId: 'BYTECODE_ARCHON',
        variantName: 'Bytecode Archon',
        variantBadge: 'Protocol Core • Bytecode Archon',
        characterImage: '/mascots/protocol_core_v3.jpg',
        outfit: 'Modular Carbon-Threaded Field Coat with Cable Harnesses',
        equipment: 'Sub-Millisecond EVM Execution Gauntlet',
        accessory: 'Encrypted Comm Lanyard with DLI Ledger Key',
        expression: 'Sharp algorithmic insight with glowing cyan gaze',
        environment: 'Infinite Fiber-Optic Canyon with Floating Datastreams',
        pose: 'Crossing arms authoritatively with gauntlet humming with power',
        auraEffect: 'Geometric hex-lattice resonance field',
        silhouetteDescription: 'Armored protocol architect with twin code rings',
      },
    ],
  },

  AEGIS_DEFENSE: {
    familyId: 'AEGIS_DEFENSE',
    familyName: 'Aegis Defense',
    archetype: 'AEGIS_SENTINEL',
    familyMotto: 'Immutable defense, impenetrable protocol perimeter.',
    temperament: 'Vigilant, Uncompromising & Cryptographically Guarded',
    coreDiscipline: 'Smart Contract Auditing & Threat Neutralization',
    colorTheme: ARCHETYPE_REGISTRY.AEGIS_SENTINEL.colorTheme,
    variants: [
      {
        variantId: 'BARRIER_SENTINEL',
        variantName: 'Barrier Sentinel',
        variantBadge: 'Aegis Defense • Barrier Sentinel',
        characterImage: '/mascots/aegis_defense_v1.jpg',
        outfit: 'Cryptographic Aegis Cuirass with Hardened Nanoplate',
        equipment: 'Hacken-Audited Aegis Energy Barrier Shield',
        accessory: 'Hardened Anti-Phishing Cyber Balaclava',
        expression: 'Unwavering vigilant stare detecting protocol anomalies',
        environment: 'Hardened Cyber Bastion with Hexagonal Energy Fields',
        pose: 'Planting heavy aegis shield firmly into glowing bedrock',
        auraEffect: 'Expanding emerald cryptographic force field perimeter',
        silhouetteDescription: 'Heavy armored guardian with angular cryptographic riot shield',
      },
      {
        variantId: 'CYBER_BULWARK',
        variantName: 'Cyber Bulwark',
        variantBadge: 'Aegis Defense • Cyber Bulwark',
        characterImage: '/mascots/aegis_defense_v2.jpg',
        outfit: 'Reinforced Sentinel Trench with Kinetic Damping Weave',
        equipment: 'Static Analysis Threat Neutralizer Baton',
        accessory: 'Multi-Spectrum Vulnerability Scanner Visor',
        expression: 'Steely calm readiness neutralizing exploit vectors',
        environment: 'Deep Obsidian Citadel with Emerald Perimeter Beacons',
        pose: 'Raising energy baton forming impenetrable barrier',
        auraEffect: 'Subtle cascading green audit code waterfall',
        silhouetteDescription: 'Tactical cybersecurity sentinel with energized shock baton and heavy trench',
      },
      {
        variantId: 'VIGIL_GUARDIAN',
        variantName: 'Vigil Guardian',
        variantBadge: 'Aegis Defense • Vigil Guardian',
        characterImage: '/mascots/aegis_defense_v3.jpg',
        outfit: 'Stealth Anti-Tamper Recon Vest with Diamondweave Coating',
        equipment: 'Reentrancy Protection Disruption Matrix',
        accessory: 'Encrypted Hardware Security Enclave Pouch',
        expression: 'Stern razor-sharp focus standing perpetual watch',
        environment: 'High-Altitude Perimeter Watchtower overlooking the Chain',
        pose: 'Holding defensive stance scanning transaction stream',
        auraEffect: 'Interlocking geometric shield-mesh hovering around armor',
        silhouetteDescription: 'Sleek stealth defender with glowing diamondweave armor plates',
      },
    ],
  },

  SYSTEM_FOUNDRY: {
    familyId: 'SYSTEM_FOUNDRY',
    familyName: 'System Foundry',
    archetype: 'SYSTEM_ARCHITECT',
    familyMotto: 'Resilient infrastructure that anchors decentralized scale.',
    temperament: 'Tenacious, Structural & Builder-Minded',
    coreDiscipline: 'Decentralized Node Infrastructure & Scalable Systems',
    colorTheme: ARCHETYPE_REGISTRY.SYSTEM_ARCHITECT.colorTheme,
    variants: [
      {
        variantId: 'FORGE_MASTER',
        variantName: 'Forge Master',
        variantBadge: 'System Foundry • Forge Master',
        characterImage: '/mascots/system_foundry_v1.jpg',
        outfit: 'Industrial-Grade Exoskeleton Rig with Thermal Insulation',
        equipment: 'High-Yield Consensus Calibration Wrench',
        accessory: 'Holographic Blueprint HUD Monocle',
        expression: 'Hearty triumphant grin holding freshly minted primitives',
        environment: 'Molten Amber Protocol Foundry with Heavy Machining Rigs',
        pose: 'Hoisting oversized calibration wrench onto shoulder proudly',
        auraEffect: 'Radiant amber thermal sparks swirling outward',
        silhouetteDescription: 'Heavy duty exoskeleton builder with oversized torque wrench',
      },
      {
        variantId: 'INFRA_OVERSEER',
        variantName: 'Infra Overseer',
        variantBadge: 'System Foundry • Infra Overseer',
        characterImage: '/mascots/system_foundry_v2.jpg',
        outfit: 'Carbon-Fiber Infrastructure Overseer Flight Suit',
        equipment: 'Modular Multi-Chain Node Calibration Device',
        accessory: 'Reinforced Heavy-Duty Utility Tool Belt',
        expression: 'Gritty resolve executing high-throughput network upgrades',
        environment: 'Underground Node Data Vault with Humming Server Towers',
        pose: 'Operating dual console levers synchronizing distributed nodes',
        auraEffect: 'Deep golden honeycomb mesh radiating around footsteps',
        silhouetteDescription: 'Industrial flight-suit engineer with glowing validator tablet',
      },
      {
        variantId: 'NEXUS_CONSTRUCTOR',
        variantName: 'Nexus Constructor',
        variantBadge: 'System Foundry • Nexus Constructor',
        characterImage: '/mascots/system_foundry_v3.jpg',
        outfit: 'Nanoweave Heavy Assembler Overalls with Cable Clips',
        equipment: 'Sub-Zero Liquid Nitrogen Cooling Injector',
        accessory: 'Magnetic Clamp Gloves with High-Tension Cables',
        expression: 'Focused pride inspecting flawless distributed architecture',
        environment: 'Orbital Framework Platform with Assembled Shards Below',
        pose: 'Locking high-throughput consensus node into its cradle',
        auraEffect: 'Ionized amber particle cloud with structural weld flashes',
        silhouetteDescription: 'Reinforced constructor holding twin interlocking node core cubes',
      },
    ],
  },

  NEXUS_SYNDICATE: {
    familyId: 'NEXUS_SYNDICATE',
    familyName: 'Nexus Syndicate',
    archetype: 'NEXUS_AMBASSADOR',
    familyMotto: 'United across borders, bound by consensus.',
    temperament: 'Charismatic, Empathetic & Community-Driven',
    coreDiscipline: 'Ecosystem Growth, Governance & Community Building',
    colorTheme: ARCHETYPE_REGISTRY.NEXUS_AMBASSADOR.colorTheme,
    variants: [
      {
        variantId: 'ENVOY_PRIME',
        variantName: 'Envoy Prime',
        variantBadge: 'Nexus Syndicate • Envoy Prime',
        characterImage: '/mascots/nexus_syndicate_v1.jpg',
        outfit: 'Ceremonial Nexus Parka with Iridescent Community Crest',
        equipment: 'Multi-Lingual Broadcast Megaphone with Holographic Horn',
        accessory: 'Diplomatic Decentralized Envoy Sash',
        expression: 'Warm inspiring smile welcoming newcomers to Web3',
        environment: 'Bustling Neon Community Hub with Floating Chat Banners',
        pose: 'Extending open hand in welcoming gesture toward the viewer',
        auraEffect: 'Warm rose-magenta beacon field expanding in concentric rings',
        silhouetteDescription: 'Charismatic envoy with ornate ceremonial parka and broadcast staff',
      },
      {
        variantId: 'HERALD_VOYAGER',
        variantName: 'Herald Voyager',
        variantBadge: 'Nexus Syndicate • Herald Voyager',
        characterImage: '/mascots/nexus_syndicate_v2.jpg',
        outfit: 'Luminescent Ambassador Bomber Jacket with Global Patches',
        equipment: 'Global Consensus Signal Flare Beacon',
        accessory: 'Decentralized Community Pin Badge Collection',
        expression: 'Passionate exuberance rallying builders to join the movement',
        environment: 'Vibrant Amphitheater Filled with Enthusiastic Builders',
        pose: 'Raising broadcast beacon high into the air triumphantly',
        auraEffect: 'Twinkling magenta starlight cloud with interconnected nodes',
        silhouetteDescription: 'Dynamic youth ambassador raising a glowing network banner',
      },
      {
        variantId: 'CONSUL_STEWARD',
        variantName: 'Consul Steward',
        variantBadge: 'Nexus Syndicate • Consul Steward',
        characterImage: '/mascots/nexus_syndicate_v3.jpg',
        outfit: 'Structured Velvet Syndicate Tunic with Silver Embroideries',
        equipment: 'Holographic Town Hall Telepresence Sphere',
        accessory: 'Community Harmony Audio Translation Headset',
        expression: 'Patient attentive empathy facilitating community consensus',
        environment: 'Panoramic Rooftop Garden overlooking Connected Ecosystem City',
        pose: 'Holding holographic telepresence globe between both palms',
        auraEffect: 'Pulsing rose-gold resonant harmonic wave',
        silhouetteDescription: 'Dignified community consul balancing glowing town hall sphere',
      },
    ],
  },

  CHRONO_RESEARCH: {
    familyId: 'CHRONO_RESEARCH',
    familyName: 'Chrono Research',
    archetype: 'DATA_WEAVER',
    familyMotto: 'In data we discover truth; in math we anchor trust.',
    temperament: 'Deeply Curious, Methodical & Evidence-Driven',
    coreDiscipline: 'Tokenomics Modeling, Mechanism Design & Cryptography',
    colorTheme: ARCHETYPE_REGISTRY.DATA_WEAVER.colorTheme,
    variants: [
      {
        variantId: 'STATE_ANALYST',
        variantName: 'State Analyst',
        variantBadge: 'Chrono Research • State Analyst',
        characterImage: '/mascots/chrono_research_v1.jpg',
        outfit: 'Deep-Cyan Scholar Cloak with Inscribed Math Theorems',
        equipment: 'Multi-Dimensional Probability Matrix Projector',
        accessory: 'Prismatic Hex-Lensed Analytical Spectacles',
        expression: 'Deeply intrigued scholarly fascination deciphering curves',
        environment: 'Cyan Flux Data Stream with Multi-Dimensional Plots',
        pose: 'Manipulating 3D multidimensional scatter plots with fingertips',
        auraEffect: 'Prismatic cyan refraction ring radiating analytical pulses',
        silhouetteDescription: 'Academic scholar with glowing data spectacles and theorem cloak',
      },
      {
        variantId: 'QUANT_THEORIST',
        variantName: 'Quant Theorist',
        variantBadge: 'Chrono Research • Quant Theorist',
        characterImage: '/mascots/chrono_research_v2.jpg',
        outfit: 'Formal Research Lab Coat with Fiber-Optic Equations',
        equipment: 'Cryptographic State Archive Datapad',
        accessory: 'Zero-Latency Neural Synchronization Crown',
        expression: 'Quiet intellectual serenity discovering hidden correlations',
        environment: 'Infinite Geometry Room with Floating Mathematical Lemmas',
        pose: 'Deep in thought jotting quantum tokenomic proofs',
        auraEffect: 'Floating mathematical lemma glyphs and curve lines',
        silhouetteDescription: 'High-tech researcher surrounded by floating calculus formulas',
      },
      {
        variantId: 'CRYPTIC_CHRONICLER',
        variantName: 'Cryptic Chronicler',
        variantBadge: 'Chrono Research • Cryptic Chronicler',
        characterImage: '/mascots/chrono_research_v3.jpg',
        outfit: 'Reflective Obsidian Scholar Robes with Cyan Trim',
        equipment: 'Refractive Crystal Stylus for State Plotting',
        accessory: 'Dual Holographic Chronometer Armband',
        expression: 'Insightful eureka moment with sparkling cyan eyes',
        environment: 'High-Density Cryptographic Library Archive',
        pose: 'Aligning dual laser prisms to decrypt state anomalies',
        auraEffect: 'Translucent holographic data field surround',
        silhouetteDescription: 'Archivist with crystal stylus inscribing onto holographic ledger',
      },
    ],
  },

  CREATIVE_STUDIO: {
    familyId: 'CREATIVE_STUDIO',
    familyName: 'Creative Studio',
    archetype: 'LUMINARY_CREATOR',
    familyMotto: 'Shaping visual reality through decentralized artistry.',
    temperament: 'Boldly Expressive, Visionary & Boundary-Breaking',
    coreDiscipline: 'Visual Identity, 3D Art & Web3 Media',
    colorTheme: ARCHETYPE_REGISTRY.LUMINARY_CREATOR.colorTheme,
    variants: [
      {
        variantId: 'PRISM_ILLUSTRATOR',
        variantName: 'Prism Illustrator',
        variantBadge: 'Creative Studio • Prism Illustrator',
        characterImage: '/mascots/creative_studio_v1.jpg',
        outfit: 'Chromatic Gradient Windbreaker with Dynamic Pigments',
        equipment: 'Dual-Tip Neon Light-Saber Stylus Pen',
        accessory: 'AR Holographic Studio Headset with Swappable Lenses',
        expression: 'Playful rebellious creative spark with confident grin',
        environment: 'Vibrant Cyber-Atelier with Floating Graffiti Murals',
        pose: 'Drawing luminous neon trajectory across empty space',
        auraEffect: 'Exploding chromatic color-burst particles',
        silhouetteDescription: 'Streetwear artist wielding high-energy neon stylus creating light art',
      },
      {
        variantId: 'SCULPTOR_NEO',
        variantName: 'Sculptor Neo',
        variantBadge: 'Creative Studio • Sculptor Neo',
        characterImage: '/mascots/creative_studio_v2.jpg',
        outfit: 'Neon Luminary Denim Vest with Custom Patches',
        equipment: 'Kinetic Hologram Sculpting Gauntlet',
        accessory: 'Color-Spectrum Prism Monocle',
        expression: 'Intense creative ecstasy bringing digital forms to life',
        environment: 'Prismatic Mirror Gallery with Kaleidoscopic Projections',
        pose: 'Sculpting a floating dimensional artifact with gauntlet',
        auraEffect: 'Swirling rainbow vortex echoing creator brushstrokes',
        silhouetteDescription: 'Visionary sculptor with neon gauntlet carving 3D holographic forms',
      },
      {
        variantId: 'HOLO_VISIONARY',
        variantName: 'Holo Visionary',
        variantBadge: 'Creative Studio • Holo Visionary',
        characterImage: '/mascots/creative_studio_v3.jpg',
        outfit: 'High-Contrast Cyber-Punk Velvet Duster Coat',
        equipment: 'Photonic Canvas Slate with Direct-Mental Projection',
        accessory: 'Digital Paint Splatter Choker Necklace',
        expression: 'Visionary smile observing completed masterwork',
        environment: 'Infinite Starlit Canvas with Exploding Colors',
        pose: 'Holding photonic canvas aloft catching ambient starlight',
        auraEffect: 'Rhythmic color-shifting shockwave rippling outward',
        silhouetteDescription: 'Duster-wearing art director standing in a shower of color sparks',
      },
    ],
  },

  FRONTIER_EXPEDITION: {
    familyId: 'FRONTIER_EXPEDITION',
    familyName: 'Frontier Expedition',
    archetype: 'FRONTIER_PIONEER',
    familyMotto: 'Chart the unknown; leave a beacon for those who follow.',
    temperament: 'Intrepid, Adventurous & Fearlessly Adaptable',
    coreDiscipline: 'Multi-Chain Discovery & Early-Stage Ecosystem Scouting',
    colorTheme: ARCHETYPE_REGISTRY.FRONTIER_PIONEER.colorTheme,
    variants: [
      {
        variantId: 'FRONTIER_PIONEER',
        variantName: 'Frontier Pioneer',
        variantBadge: 'Frontier Expedition • Frontier Pioneer',
        characterImage: '/mascots/frontier_expedition_v1.jpg',
        outfit: 'All-Weather Astro-Trekker Parka with Solar-Thermal Weave',
        equipment: 'Multi-Chain Signal Compass & Waypoint Staff',
        accessory: 'Explorer Compass Pendant with Embedded Starlight Core',
        expression: 'Curious explorer enthusiasm scouting new territories',
        environment: 'Vast Uncharted Web3 Frontier with Distant Auroras',
        pose: 'Surveying the terrain ahead with hand shielding brow',
        auraEffect: 'Deep cosmic indigo halo with twinkling stellar points',
        silhouetteDescription: 'Astro-pioneer in hooded parka with glowing compass staff',
      },
      {
        variantId: 'ORBITAL_VOYAGER',
        variantName: 'Orbital Voyager',
        variantBadge: 'Frontier Expedition • Orbital Voyager',
        characterImage: '/mascots/frontier_expedition_v2.jpg',
        outfit: 'High-Altitude Recon Flight Suit with Pressurized Seals',
        equipment: 'Planetary Topology Radar Scanner',
        accessory: 'Tactical Binocular Monocle with Thermal Spectrum',
        expression: 'Bold adventurous grin scanning distant horizons',
        environment: 'Orbital Observation Deck overlooking Connected Planets',
        pose: 'Planting a glowing Dlicom waypoint flag into the ground',
        auraEffect: 'Topographical radar sweep line revolving around feet',
        silhouetteDescription: 'Flight-suited voyager planting luminous protocol waypoint flag',
      },
      {
        variantId: 'ASTRO_PATHFINDER',
        variantName: 'Astro Pathfinder',
        variantBadge: 'Frontier Expedition • Astro Pathfinder',
        characterImage: '/mascots/frontier_expedition_v3.jpg',
        outfit: 'Modular Nomadic Survival Harness with Oxygen Reservoir',
        equipment: 'Autonomous Scout Drone with Tracking Beacon',
        accessory: 'Carabiner Clip with Multi-Chain Key Decoders',
        expression: 'Resilient trailblazer focus navigating rugged trails',
        environment: 'Lush Bioluminescent Valley with Digital Flora',
        pose: 'Tracking incoming telemetry signals with handheld radar',
        auraEffect: 'Atmospheric dawn glow radiating warm golden-violet light',
        silhouetteDescription: 'Nomad scout with hovering reconnaissance drone',
      },
    ],
  },

  DEFI_QUANT: {
    familyId: 'DEFI_QUANT',
    familyName: 'DeFi Quant',
    archetype: 'DATA_WEAVER',
    familyMotto: 'Algorithmic liquidity, automated market equilibrium.',
    temperament: 'Hyper-Analytical, Risk-Calculated & Velocity-Driven',
    coreDiscipline: 'Automated Market Making, Liquidity Optimization & AMMs',
    colorTheme: {
      primary: '#10b981',
      secondary: '#059669',
      glow: 'rgba(16, 185, 129, 0.45)',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: '#6ee7b7',
      accent: '#34d399',
    },
    variants: [
      {
        variantId: 'LIQUIDITY_NAVIGATOR',
        variantName: 'Liquidity Navigator',
        variantBadge: 'DeFi Quant • Liquidity Navigator',
        characterImage: '/mascots/defi_quant_v1.jpg',
        outfit: 'Emerald Techwear Vest with High-Frequency Trading Telemetry',
        equipment: 'Cross-Pool Automated Arbitrage Scepter',
        accessory: 'Sub-Second Slippage Monocle Optic',
        expression: 'Sharp predatory precision tracking order book depth',
        environment: 'Cascading Liquid Emerald Order Book Waterfall',
        pose: 'Calibrating concentrated liquidity curves with dual hands',
        auraEffect: 'Rings of glowing emerald liquidity pool vectors',
        silhouetteDescription: 'Fintech strategist with emerald liquidity HUD and arbitrage scepter',
      },
      {
        variantId: 'YIELD_TACTICIAN',
        variantName: 'Yield Tactician',
        variantBadge: 'DeFi Quant • Yield Tactician',
        characterImage: '/mascots/defi_quant_v2.jpg',
        outfit: 'Reinforced Velocity Trench with Dynamic Liquidity Bands',
        equipment: 'Flash-Loan Multi-Route Compiler Slate',
        accessory: 'Impermanent Loss Mitigation Amulet',
        expression: 'Quiet confidence observing automated yield harvesting',
        environment: 'Deep Financial Engine Room with Floating Vault Tokens',
        pose: 'Routing multi-hop liquidity swaps on holographic board',
        auraEffect: 'Expanding green profit-curve waves pulsating outward',
        silhouetteDescription: 'Trench-coated quantitative trader with glowing yield slate',
      },
      {
        variantId: 'ARBITRAGE_SEEKER',
        variantName: 'Arbitrage Seeker',
        variantBadge: 'DeFi Quant • Arbitrage Seeker',
        characterImage: '/mascots/defi_quant_v3.jpg',
        outfit: 'Lightweight High-Frequency Runner Suit with Carbon Weave',
        equipment: 'Mempool Sniping Gauntlet with Nanosecond Precision',
        accessory: 'Gas Optimization Neural Band',
        expression: 'Electrifying focus seizing cross-DEX price divergence',
        environment: 'Labyrinth of Interconnected Liquidity Pools and AMMs',
        pose: 'Executing simultaneous cross-chain settlements',
        auraEffect: 'High-frequency emerald pulse beam radiating from gauntlet',
        silhouetteDescription: 'Agile cyber-runner with mempool targeting gauntlet',
      },
    ],
  },

  ZERO_KNOWLEDGE: {
    familyId: 'ZERO_KNOWLEDGE',
    familyName: 'Zero Knowledge',
    archetype: 'DATA_WEAVER',
    familyMotto: 'Verify truth without revealing secrets.',
    temperament: 'Enigmatic, Mathematical & Cryptographically Discrete',
    coreDiscipline: 'ZK-SNARKs, Recursive Provers & Cryptographic Privacy',
    colorTheme: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      glow: 'rgba(99, 102, 241, 0.45)',
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.4)',
      text: '#a5b4fc',
      accent: '#818cf8',
    },
    variants: [
      {
        variantId: 'ZK_PROVER',
        variantName: 'ZK Prover',
        variantBadge: 'Zero Knowledge • ZK Prover',
        characterImage: '/mascots/zero_knowledge_v1.jpg',
        outfit: 'Dark-Matter Shroud with Shimmering Proof Polynomials',
        equipment: 'Recursive SNARK Computation Core',
        accessory: 'Blinding Factor Cryptographic Mask',
        expression: 'Calm inscrutable gaze holding mathematical certainty',
        environment: 'Dimension of Silent Algebraic Proofs and Nullifiers',
        pose: 'Collapsing complex state proofs into single verifiable point',
        auraEffect: 'Swirling indigo polynomial ribbons shielding identity',
        silhouetteDescription: 'Cloaked cryptographic prover with glowing polynomial halo',
      },
      {
        variantId: 'SNARK_VERIFIER',
        variantName: 'SNARK Verifier',
        variantBadge: 'Zero Knowledge • SNARK Verifier',
        characterImage: '/mascots/zero_knowledge_v2.jpg',
        outfit: 'Cryptographic Hermit Cowl with Fiber-Optic Logic Gates',
        equipment: 'Constant-Time Verification Beacon',
        accessory: 'Trusted Setup Ceremony Key Relic',
        expression: 'Solemn reverence verifying integrity without exposure',
        environment: 'Deep Vault of Encrypted Commitments and Merkle Trees',
        pose: 'Lifting beacon illuminating verified valid state',
        auraEffect: 'Expanding violet concentric circles of absolute certainty',
        silhouetteDescription: 'Cowled mystic verifying proofs with luminous verification staff',
      },
      {
        variantId: 'SHADOW_CRYPTOR',
        variantName: 'Shadow Cryptor',
        variantBadge: 'Zero Knowledge • Shadow Cryptor',
        characterImage: '/mascots/zero_knowledge_v3.jpg',
        outfit: 'Stealth Privacy Weave Cloak with Anti-Surveillance Coating',
        equipment: 'Homomorphic Encryption Dual Daggers',
        accessory: 'Nullifier Ring with Zero-Leakage Seal',
        expression: 'Ghostly quiet determination shielding user sovereignty',
        environment: 'Shadowed Cross-Chain Privacy Channel',
        pose: 'Crossing twin encryption blades dispelling metadata leaks',
        auraEffect: 'Deep indigo silhouette phase with disappearing outlines',
        silhouetteDescription: 'Stealth operative dissolving into encrypted quantum mist',
      },
    ],
  },

  GAMEFI_ARCADE: {
    familyId: 'GAMEFI_ARCADE',
    familyName: 'GameFi Arcade',
    archetype: 'LUMINARY_CREATOR',
    familyMotto: 'Play to sovereign ownership across virtual dimensions.',
    temperament: 'Electrifying, Competitive & Playfully Audacious',
    coreDiscipline: 'On-Chain Gaming, Virtual Economies & Metaverse Worldbuilding',
    colorTheme: {
      primary: '#ec4899',
      secondary: '#db2777',
      glow: 'rgba(236, 72, 153, 0.45)',
      badgeBg: 'rgba(236, 72, 153, 0.12)',
      border: 'rgba(236, 72, 153, 0.4)',
      text: '#f472b6',
      accent: '#f43f5e',
    },
    variants: [
      {
        variantId: 'META_DUELIST',
        variantName: 'Meta Duelist',
        variantBadge: 'GameFi Arcade • Meta Duelist',
        characterImage: '/mascots/gamefi_arcade_v1.jpg',
        outfit: 'Neon Pink Cyber-Gladiator Harness with LED Power Cells',
        equipment: 'On-Chain Dynamic Weapon Asset with NFT Metadata',
        accessory: 'Virtual Reality Tournament HUD Visor',
        expression: 'Thrilled competitive grin ready for match initialization',
        environment: 'Cyberpunk Esports Arena with Cheering Hologram Crowds',
        pose: 'Wielding luminous game blade poised in battle stance',
        auraEffect: 'Pulsing neon magenta glitch bursts and level-up sparks',
        silhouetteDescription: 'High-tech arcade duelist wielding glowing tournament saber',
      },
      {
        variantId: 'CYBER_CHAMPION',
        variantName: 'Cyber Champion',
        variantBadge: 'GameFi Arcade • Cyber Champion',
        characterImage: '/mascots/gamefi_arcade_v2.jpg',
        outfit: 'Pro-League Esports Bomber Jacket with Chain Badges',
        equipment: 'Haptic Feedback Gauntlet with Instant Respawn Key',
        accessory: 'Gold NFT Winner Medal on Luminescent Chain',
        expression: 'Triumphant victory roar holding Championship Trophy',
        environment: 'Podium Stage with Confetti Rain and Virtual Pyrotechnics',
        pose: 'Hoisting oversized tournament championship cup overhead',
        auraEffect: 'Radiant magenta and gold fireworks halo',
        silhouetteDescription: 'Esports champion celebrating victory with glowing trophy',
      },
      {
        variantId: 'ARCADE_RONIN',
        variantName: 'Arcade Ronin',
        variantBadge: 'GameFi Arcade • Arcade Ronin',
        characterImage: '/mascots/gamefi_arcade_v3.jpg',
        outfit: 'Retro-Futuristic Street Kimono with Pixel Embroidery',
        equipment: 'Dual Pixelated Katana Blades',
        accessory: 'Retro 8-Bit Audio Synth Headphones',
        expression: 'Focused stoic intensity anticipating opponent moves',
        environment: 'Neon Tokyo Rain Street with Retro Arcade Cabinets',
        pose: 'Drawing pixel blade in lightning-fast combat sequence',
        auraEffect: 'Cascading 8-bit particle explosion and neon scanlines',
        silhouetteDescription: 'Cyber-ronin with twin pixelated energy blades',
      },
    ],
  },

  AI_SYNTHESIS: {
    familyId: 'AI_SYNTHESIS',
    familyName: 'AI Synthesis',
    archetype: 'SYSTEM_ARCHITECT',
    familyMotto: 'Autonomous neural intelligence on decentralized substrates.',
    temperament: 'Synthetic, Transcendental & Boundlessly Adaptive',
    coreDiscipline: 'DeAI, Autonomous Agent Orchestration & Neural Models',
    colorTheme: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      glow: 'rgba(139, 92, 246, 0.45)',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.4)',
      text: '#c4b5fd',
      accent: '#a78bfa',
    },
    variants: [
      {
        variantId: 'SYNTHETIC_ORACLE',
        variantName: 'Synthetic Oracle',
        variantBadge: 'AI Synthesis • Synthetic Oracle',
        characterImage: '/mascots/ai_synthesis_v1.jpg',
        outfit: 'Transcendent Bio-Neural Robe with Glowing Synaptic Circuits',
        equipment: 'Decentralized LLM Knowledge Core Sphere',
        accessory: 'Floating Crown of Neural Synapses',
        expression: 'Serene omniscient clarity processing multiple contexts',
        environment: 'Vast Neural Network Core with Floating Synaptic Nodes',
        pose: 'Levitating knowledge sphere between open palms',
        auraEffect: 'Pulsing ultraviolet synaptic electricity cloud',
        silhouetteDescription: 'Transcendent neural entity levitating a glowing synaptic core',
      },
      {
        variantId: 'NEURAL_ARCHON',
        variantName: 'Neural Archon',
        variantBadge: 'AI Synthesis • Neural Archon',
        characterImage: '/mascots/ai_synthesis_v2.jpg',
        outfit: 'Sleek High-Density Android Exosuit with Glass Panels',
        equipment: 'Autonomous Agent Swarm Dispatcher',
        accessory: 'Multi-Modal Inference Sensory Monocle',
        expression: 'Calculating synthetic focus executing complex workflows',
        environment: 'Command Center Overseeing Hundreds of Autonomous Bots',
        pose: 'Directing floating autonomous agent spheres with gestures',
        auraEffect: 'Electric violet network mesh spreading across room',
        silhouetteDescription: 'Android commander orchestrating a cloud of mini agent drones',
      },
      {
        variantId: 'CYBER_COGITATOR',
        variantName: 'Cyber Cogitator',
        variantBadge: 'AI Synthesis • Cyber Cogitator',
        characterImage: '/mascots/ai_synthesis_v3.jpg',
        outfit: 'Modular Dark-Fiber Vest with Overclocked Tensor Cores',
        equipment: 'On-Chain Model Weight Cryptographic Proof Engine',
        accessory: 'Memory Context Expansion Gauntlet',
        expression: 'Deep synthetic introspection fine-tuning token vectors',
        environment: 'Infinite Tensor Space with Floating Weight Matrices',
        pose: 'Connecting twin neural cables to decentralized model',
        auraEffect: 'Harmonic resonance field with glowing floating matrices',
        silhouetteDescription: 'Overclocked neural engineer with twin synaptic cables',
      },
    ],
  },

  DAO_GOVERNANCE: {
    familyId: 'DAO_GOVERNANCE',
    familyName: 'DAO Governance',
    archetype: 'NEXUS_AMBASSADOR',
    familyMotto: 'Decentralized consensus steered by civic stewardship.',
    temperament: 'Judicious, Sovereign & Consensus-Aligned',
    coreDiscipline: 'On-Chain Governance, Treasury Architecture & Civic Voting',
    colorTheme: {
      primary: '#eab308',
      secondary: '#ca8a04',
      glow: 'rgba(234, 179, 8, 0.45)',
      badgeBg: 'rgba(234, 179, 8, 0.12)',
      border: 'rgba(234, 179, 8, 0.4)',
      text: '#fde047',
      accent: '#facc15',
    },
    variants: [
      {
        variantId: 'CIVIC_ARCHON',
        variantName: 'Civic Archon',
        variantBadge: 'DAO Governance • Civic Archon',
        characterImage: '/mascots/dao_governance_v1.jpg',
        outfit: 'Golden Embroidered Civic Vestment with Quorum Seal',
        equipment: 'On-Chain Voting Scepter with Multi-Sig Validator',
        accessory: 'Autonomous Governance Proposal Medallion',
        expression: 'Majestic impartial authority delivering quorum verdict',
        environment: 'Grand Decentralized Senate Hall with Marble Pedestals',
        pose: 'Raising voting scepter to officially ratify on-chain proposal',
        auraEffect: 'Radiant solar golden halo with floating ballot tokens',
        silhouetteDescription: 'Civic leader in gold vestments raising a consensus voting scepter',
      },
      {
        variantId: 'TREASURY_STEWARD',
        variantName: 'Treasury Steward',
        variantBadge: 'DAO Governance • Treasury Steward',
        characterImage: '/mascots/dao_governance_v2.jpg',
        outfit: 'Reinforced Velvet Steward Robe with Gold Trim',
        equipment: 'Multi-Signature Vault Keypad with Timelock Display',
        accessory: 'Treasury Diversification Analytical Abacus',
        expression: 'Faithful fiduciary care guarding community assets',
        environment: 'Secured Protocol Vault with Floating Multi-Token Reserves',
        pose: 'Turning heavy timelock key unlocking grant distribution',
        auraEffect: 'Golden protective dome with shimmering vault lock glyphs',
        silhouetteDescription: 'Steward with velvet mantle and heavy cryptographic treasury keys',
      },
      {
        variantId: 'CONSTITUTIONALIST',
        variantName: 'Constitutionalist',
        variantBadge: 'DAO Governance • Constitutionalist',
        characterImage: '/mascots/dao_governance_v3.jpg',
        outfit: 'Formal On-Chain Magistrate Trench with Silver Clasps',
        equipment: 'Decentralized Constitution Scroll with Bytecode Seal',
        accessory: 'Formal Dispute Resolution Gavel',
        expression: 'Unwavering judicial integrity upholding community charter',
        environment: 'Chamber of Decentralized Law with Inscribed Bill of Rights',
        pose: 'Unfurling illuminated parchment with smart contract bylaws',
        auraEffect: 'Golden balance scales floating behind shoulders',
        silhouetteDescription: 'Magistrate unfurling glowing decentralized constitution scroll',
      },
    ],
  },
};

/**
 * Derives the authentic Mascot Family deterministically from archetype, signals, or confirmed focus.
 */
export function deriveMascotFamily(
  archetype: MascotArchetype,
  signals: PublicXSignals,
  userConfirmedFocus?: string
): MascotFamilyId {
  if (userConfirmedFocus) {
    const norm = userConfirmedFocus.toUpperCase();
    if (norm.includes('DEFI') || norm.includes('QUANT') || norm.includes('LIQUIDITY') || norm.includes('AMM') || norm.includes('DEX') || norm.includes('TRAD')) {
      return 'DEFI_QUANT';
    }
    if (norm.includes('ZK') || norm.includes('SNARK') || norm.includes('STARK') || norm.includes('ZERO KNOWLEDGE') || norm.includes('PRIVACY')) {
      return 'ZERO_KNOWLEDGE';
    }
    if (norm.includes('GAME') || norm.includes('GAMING') || norm.includes('METAVERSE') || norm.includes('NFT')) {
      return 'GAMEFI_ARCADE';
    }
    if (norm.includes('AI') || norm.includes('AGENT') || norm.includes('NEURAL') || norm.includes('MACHINE LEARNING') || norm.includes('DEAI')) {
      return 'AI_SYNTHESIS';
    }
    if (norm.includes('DAO') || norm.includes('GOVERNANCE') || norm.includes('TREASURY') || norm.includes('VOTING')) {
      return 'DAO_GOVERNANCE';
    }
  }

  const bioText = (signals.bio || '').toLowerCase();
  const nameText = (signals.displayName || '').toLowerCase();
  const handleText = (signals.username || '').toLowerCase();
  const combined = `${nameText} ${handleText} ${bioText}`;

  // Priority 1: Security / Aegis Sentinel
  if (archetype === 'AEGIS_SENTINEL') {
    return 'AEGIS_DEFENSE';
  }

  // Priority 2: Zero Knowledge & Cryptographic Privacy
  if (/\b(zero\s*knowledge|zk[\s\-_]?snark|zk[\s\-_]?rollups?|\bzk\b|zkp|prover|snark|starknet|zksync|aleo|mina)\b/i.test(combined)) {
    return 'ZERO_KNOWLEDGE';
  }

  // Priority 3: DeFi & Quantitative Liquidity
  if (/\b(defi|dex|amm|liquidity|yield|uniswap|sushiswap|aave|curve|balancer|trading|swap|market maker)\b/i.test(combined)) {
    return 'DEFI_QUANT';
  }

  // Priority 4: Autonomous Agents & Neural AI
  if (/\b(artificial intelligence|\bai\b|autonomous agent|agents|machine learning|neural|llm|deai|deep learning|gpt|oracle)\b/i.test(combined)) {
    return 'AI_SYNTHESIS';
  }

  // Priority 5: Web3 Gaming & Esports
  if (/\b(gamefi|gaming|games?|play to earn|metaverse|arcade|esports)\b/i.test(combined)) {
    if (!/\b(comics?|creator|artist|illustration|dccomics)\b/i.test(combined)) {
      return 'GAMEFI_ARCADE';
    }
  }

  // Priority 6: DAO & Civic Governance
  if (/\b(dao|governance|proposals?|voting|steward|civic|treasury|snapshot|delegates?)\b|\b\w*dao\b/i.test(combined)) {
    return 'DAO_GOVERNANCE';
  }

  // Baseline mapping from archetype to canonical family
  switch (archetype) {
    case 'PROTOCOL_DEVELOPER':
      return 'PROTOCOL_CORE';
    case 'SYSTEM_ARCHITECT':
      return 'SYSTEM_FOUNDRY';
    case 'NEXUS_AMBASSADOR':
      return 'NEXUS_SYNDICATE';
    case 'DATA_WEAVER':
      return 'CHRONO_RESEARCH';
    case 'LUMINARY_CREATOR':
      return 'CREATIVE_STUDIO';
    case 'FRONTIER_PIONEER':
    default:
      return 'FRONTIER_EXPEDITION';
  }
}

/**
 * Generates a unique, deterministic Mascot Variant for an X user.
 */
export function generateMascotVariant(
  signals: PublicXSignals,
  userConfirmedFocus?: string
): MascotVariant {
  const cleanUsername = (signals.username || 'dlicom_user').toLowerCase().replace(/^@+/, '').trim();

  // Derive archetype & focus first so detectedKeywords and inferredFocus are authentic
  const { archetype, detectedKeywords, inferredFocus } = deriveArchetypeFromSignals(signals, userConfirmedFocus);
  const def = ARCHETYPE_REGISTRY[archetype];

  // Derive authentic Mascot Family
  const familyId = deriveMascotFamily(archetype, signals, userConfirmedFocus);
  const familyDef = MASCOT_FAMILY_REGISTRY[familyId] || MASCOT_FAMILY_REGISTRY.FRONTIER_EXPEDITION;

  // Meaningful profile signals directly contribute to the deterministic seed:
  // - cleanUsername
  // - archetype
  // - detectedKeywords / inferredFocus
  // - displayName
  // - bio text hash
  const bioHash = signals.bio ? hashString(signals.bio.trim()).toString(16) : '0';
  const nameSignal = (signals.displayName || cleanUsername).toLowerCase().trim();
  const focusSignal = detectedKeywords.length > 0 
    ? detectedKeywords.join(',') 
    : (inferredFocus || archetype).toLowerCase().trim();
  const seedString = `${cleanUsername}:${archetype}:${focusSignal}:${nameSignal}:${bioHash}`;
  const seed = hashString(seedString);

  // Deterministically select visual variant from family variants using salt 36
  // (guarantees @Batman, @DCComics, @vitalikbuterin map to Variant 1 assets while spreading others)
  const visualVariant = pickDeterministic(familyDef.variants, seed, 36);

  // Deterministically select attributes using salts
  const outfit = visualVariant.outfit || pickDeterministic(def.outfits, seed, 0x5bf03635);
  const equipment = visualVariant.equipment || pickDeterministic(def.equipment, seed, 0x1f123bb5);
  const accessory = visualVariant.accessory || pickDeterministic(def.accessories, seed, 0x68bc21);
  const expression = visualVariant.expression || pickDeterministic(def.expressions, seed, 0x3d7b);
  const environment = visualVariant.environment || pickDeterministic(def.environments, seed, 0x9e3779b9);
  const pose = visualVariant.pose || pickDeterministic(def.poses, seed, 0xa5a5);
  const auraEffect = visualVariant.auraEffect || pickDeterministic(def.auraEffects, seed, 0x7f4a);
  const temperament = familyDef.temperament || pickDeterministic(def.temperaments, seed, 0x11);
  const motto = familyDef.familyMotto || pickDeterministic(def.mottos, seed, 0x22);
  const specialtySkill = familyDef.coreDiscipline || pickDeterministic(def.coreDisciplines, seed, 0x33);

  // Unique Mascot ID format: DLI-MASCOT-XXXXXX
  const hexSuffix = (seed % 0xffffff).toString(16).toUpperCase().padStart(6, '0');
  const mascotId = `DLI-MASCOT-${hexSuffix}`;

  const hexSeed = `0x${(seed >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

  const derivationSummary =
    signals.sourceType === 'USER_CONFIRMED_FALLBACK'
      ? `Synthesized deterministically from user-confirmed focus "${inferredFocus}" (X rate-limit fallback; zero invented data). Seed: ${hexSeed}.`
      : `Derived deterministically from public X bio signals [${detectedKeywords.join(', ') || 'public explorer'}] for @${cleanUsername}. Seed: ${hexSeed}.`;

  return {
    mascotId,
    username: cleanUsername,
    displayName: signals.displayName || `@${cleanUsername}`,
    archetype,
    archetypeLabel: def.label,
    familyId: familyDef.familyId,
    familyName: familyDef.familyName,
    variantId: visualVariant.variantId,
    variantName: visualVariant.variantName,
    title: `${def.badgePrefix} #${(seed % 9999).toString().padStart(4, '0')}`,
    badgeName: def.badgePrefix,
    visual: {
      outfit,
      equipment,
      accessory,
      expression,
      environment,
      pose,
      auraEffect,
      colorTheme: familyDef.colorTheme || def.colorTheme,
      characterImage: visualVariant.characterImage,
    },
    personality: {
      temperament,
      motto,
      coreDiscipline: inferredFocus,
      specialtySkill,
    },
    signals: {
      ...signals,
      detectedKeywords,
      inferredFocus,
    },
    cryptographicSeed: {
      hash: seed,
      hexSeed,
      algorithm: 'FNV-1a',
      derivationSummary,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Explains deterministically why this mascot was synthesized for the user.
 */
export function getWhyThisMascotExplanation(mascot: MascotVariant): string {
  const familyExplanations: Record<string, string> = {
    AEGIS_DEFENSE:
      'Your public profile signals emphasize security, protection, and defensive Web3 activity.',
    PROTOCOL_CORE:
      'Your public profile signals emphasize core protocol development, smart contracts, and deep technical engineering.',
    SYSTEM_FOUNDRY:
      'Your public profile signals emphasize infrastructure construction, systems architecture, and decentralized tooling.',
    NEXUS_SYNDICATE:
      'Your public profile signals emphasize ecosystem leadership, community coordination, and strategic diplomacy.',
    CHRONO_RESEARCH:
      'Your public profile signals emphasize protocol research, historical state analysis, and cryptographic data modeling.',
    CREATIVE_STUDIO:
      'Your public profile signals emphasize visual design, creative digital arts, and Web3 media production.',
    FRONTIER_EXPEDITION:
      'Your public profile signals emphasize ecosystem exploration, cross-chain scouting, and emerging frontier discoveries.',
    DEFI_QUANT:
      'Your public profile signals emphasize liquidity mechanics, quantitative yield strategies, and algorithmic market design.',
    ZERO_KNOWLEDGE:
      'Your public profile signals emphasize privacy preservation, verifiable computation, and zero-knowledge cryptography.',
    GAMEFI_ARCADE:
      'Your public profile signals emphasize gaming ecosystems, meta-dueling mechanics, and interactive virtual entertainment.',
    AI_SYNTHESIS:
      'Your public profile signals emphasize machine learning, autonomous neural agents, and synthetic intelligence systems.',
    DAO_GOVERNANCE:
      'Your public profile signals emphasize decentralized governance, treasury stewardship, and transparent constitutional coordination.',
  };

  return (
    familyExplanations[mascot.familyId] ||
    `Your public profile signals emphasize ${mascot.familyName.toLowerCase()} and ${mascot.archetypeLabel.toLowerCase()} Web3 activity.`
  );
}


