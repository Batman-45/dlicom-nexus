// Vercel Serverless Function: GET /api/pulse/opportunities

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const opportunities = [
    {
      id: 'opp-001',
      title: 'Smart Contract Security Reviewer — Staking Vaults',
      projectId: 'dlicom-token-contracts',
      projectName: '$DLI Smart Contracts on Base',
      type: 'BOUNTY',
      status: 'ACTIVE',
      reward: '2,500 $DLI',
      currency: 'DLI',
      requiredSkills: ['Solidity', 'Base L2', 'Formal Verification', 'Foundry'],
      skillsRequired: ['Solidity', 'Base L2', 'Formal Verification', 'Foundry'],
      description:
        'Independent peer-review bounty to audit new multi-token staking logic and test edge-case gas optimizations on Base.',
      sourceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      applyUrl: 'https://github.com/dlicom-nexus',
      publishedDate: '2026-03-01T10:00:00Z',
      postedAt: '2026-03-01T10:00:00Z',
      claimStatus: 'VERIFIED',
    },
    {
      id: 'opp-002',
      title: 'Regional Ambassador — Southeast Asia (SEA)',
      projectId: 'dlicom-community-programs',
      projectName: 'Dliever & Dcoded Community Guilds',
      type: 'AMBASSADOR',
      status: 'ACTIVE',
      reward: 'Monthly Grant + Performance Rewards',
      currency: 'USDT',
      requiredSkills: ['Community Management', 'Local Language Moderation', 'SocialFi'],
      skillsRequired: ['Community Management', 'Local Language Moderation', 'SocialFi'],
      description:
        'Lead Dlicom community meetups, translate developer announcements, and coordinate localized Telegram groups across Southeast Asia.',
      sourceUrl: 'https://dlicom.io/',
      applyUrl: 'https://dlicom.io/',
      publishedDate: '2026-03-02T14:00:00Z',
      postedAt: '2026-03-02T14:00:00Z',
      claimStatus: 'VERIFIED',
    },
    {
      id: 'opp-003',
      title: 'Pulse Web UI & Graph Visualization Contributor',
      projectId: 'dlicom-socialfi-app',
      projectName: 'Dlicom SocialFi Platform',
      type: 'CONTRIBUTION_CALL',
      status: 'ACTIVE',
      reward: '1,200 $DLI',
      currency: 'DLI',
      requiredSkills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Accessible UX'],
      skillsRequired: ['React 19', 'TypeScript', 'Tailwind CSS', 'Accessible UX'],
      description:
        'Contribute frontend components for the open-source Dlicom Pulse directory, optimizing load speeds and responsive mobile rendering.',
      sourceUrl: 'https://github.com/dlicom-nexus',
      applyUrl: 'https://github.com/dlicom-nexus',
      publishedDate: '2026-03-03T11:00:00Z',
      postedAt: '2026-03-03T11:00:00Z',
      claimStatus: 'VERIFIED',
    },
    {
      id: 'opp-004',
      title: 'Technical Documentation & Zero-Knowledge Spec Writer',
      projectId: 'dlicom-messaging-mesh',
      projectName: 'Encrypted Peer-to-Peer Messaging',
      type: 'BOUNTY',
      status: 'ACTIVE',
      reward: '800 $DLI',
      currency: 'DLI',
      requiredSkills: ['Cryptographic Protocols', 'Technical Writing', 'Markdown'],
      skillsRequired: ['Cryptographic Protocols', 'Technical Writing', 'Markdown'],
      description:
        'Draft developer-facing architectural documentation detailing end-to-end encryption key-exchange invariants and message schemas.',
      sourceUrl: 'https://whitepaper.dlicom.io/',
      applyUrl: 'https://whitepaper.dlicom.io/',
      publishedDate: '2026-03-04T09:30:00Z',
      postedAt: '2026-03-04T09:30:00Z',
      claimStatus: 'VERIFIED',
    },
  ];

  const { status, type } = req.query;
  let filtered = opportunities;

  if (status) {
    filtered = filtered.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }

  if (type) {
    filtered = filtered.filter((o) => o.type.toLowerCase() === type.toLowerCase());
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({
    status: 'ok',
    totalOpportunities: filtered.length,
    opportunities: filtered,
  });
}
