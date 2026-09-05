// Vercel Serverless Function: GET /api/pulse/projects

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const projects = [
    {
      id: 'dlicom-socialfi-app',
      name: 'Dlicom SocialFi Platform',
      tagline: 'AI-Powered decentralized social application with encrypted messaging & tipping',
      category: 'SOCIAL_FI',
      status: 'PRODUCTION',
      leadHandles: ['mohammadqadriah', 'mohamedkilany'],
      officialUrl: 'https://dlicom.io/',
      claimStatus: 'VERIFIED',
      metrics: { contributorsCount: 5, verifiedContributionsCount: 14 },
    },
    {
      id: 'dlicom-token-contracts',
      name: '$DLI Smart Contracts on Base',
      tagline: 'ERC-20 tokenomics, staking vaults, and on-chain protocol incentives on Base L2',
      category: 'SMART_CONTRACTS',
      status: 'AUDITED',
      leadHandles: ['jimish_parekh', 'georgechahine'],
      officialUrl: 'https://whitepaper.dlicom.io/',
      auditUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      claimStatus: 'VERIFIED',
      metrics: { contributorsCount: 3, verifiedContributionsCount: 8 },
    },
    {
      id: 'dlicom-messaging-mesh',
      name: 'Encrypted Peer-to-Peer Messaging',
      tagline: 'End-to-end encrypted messaging protocol with decentralized message relays',
      category: 'CORE_PROTOCOL',
      status: 'ACTIVE_DEV',
      leadHandles: ['jimish_parekh'],
      officialUrl: 'https://dlicom.io/',
      claimStatus: 'VERIFIED',
      metrics: { contributorsCount: 2, verifiedContributionsCount: 6 },
    },
    {
      id: 'dlicom-security-audit',
      name: 'Hacken Security & Formal Verification',
      tagline: 'Third-party code auditing and formal verification of core protocol invariants',
      category: 'SECURITY',
      status: 'AUDITED',
      leadHandles: ['georgechahine', 'jimish_parekh'],
      officialUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      auditUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      claimStatus: 'VERIFIED',
      metrics: { contributorsCount: 2, verifiedContributionsCount: 4 },
    },
    {
      id: 'dlicom-mena-hub',
      name: 'MENA Regional Community & Localization',
      tagline: 'Middle East & North Africa community growth, Arabic translation, and regional onboarding',
      category: 'REGIONAL_EXPANSION',
      status: 'PRODUCTION',
      leadHandles: ['mohamedbelal'],
      officialUrl: 'https://t.me/DlicomAppOfficial',
      claimStatus: 'VERIFIED',
      metrics: { contributorsCount: 2, verifiedContributionsCount: 7 },
    },
    {
      id: 'dlicom-community-programs',
      name: 'Dliever & Dcoded Community Guilds',
      tagline: 'Community stewardship, ambassador incentives, and active moderation programs',
      category: 'GOVERNANCE',
      status: 'ACTIVE_DEV',
      leadHandles: ['oleksandrsamofal', 'timur_akhmatov'],
      officialUrl: 'https://discord.gg/yZdYa48gQM',
      claimStatus: 'VERIFIED',
      metrics: { contributorsCount: 3, verifiedContributionsCount: 9 },
    },
  ];

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({
    status: 'ok',
    totalProjects: projects.length,
    projects,
  });
}
