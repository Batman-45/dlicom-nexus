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
      skillsRequired: ['Solidity', 'Base L2', 'Formal Verification', 'Foundry'],
      description:
        'Independent peer-review bounty to audit new multi-token staking logic and test edge-case gas optimizations on Base.',
      status: 'OPEN',
      reward: '2,500 $DLI',
      applyUrl: 'https://github.com/dlicom-nexus',
      claimStatus: 'VERIFIED',
      postedAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'opp-002',
      title: 'Regional Ambassador — Southeast Asia (SEA)',
      projectId: 'dlicom-community-programs',
      projectName: 'Dliever & Dcoded Community Guilds',
      type: 'AMBASSADOR',
      skillsRequired: ['Community Management', 'Local Language Moderation', 'SocialFi'],
      description:
        'Lead Dlicom community meetups, translate developer announcements, and coordinate localized Telegram groups across Southeast Asia.',
      status: 'OPEN',
      reward: 'Monthly Grant + Performance Rewards',
      applyUrl: 'https://dlicom.io/',
      claimStatus: 'VERIFIED',
      postedAt: '2026-03-02T14:00:00Z',
    },
    {
      id: 'opp-003',
      title: 'Pulse Web UI & Graph Visualization Contributor',
      projectId: 'dlicom-socialfi-app',
      projectName: 'Dlicom SocialFi Platform',
      type: 'CONTRIBUTION_CALL',
      skillsRequired: ['React 19', 'TypeScript', 'Tailwind CSS', 'Accessible UX'],
      description:
        'Contribute frontend components for the open-source Dlicom Pulse directory, optimizing load speeds and responsive mobile rendering.',
      status: 'OPEN',
      reward: '1,200 $DLI',
      applyUrl: 'https://github.com/dlicom-nexus',
      claimStatus: 'VERIFIED',
      postedAt: '2026-03-03T11:00:00Z',
    },
    {
      id: 'opp-004',
      title: 'Technical Documentation & Zero-Knowledge Spec Writer',
      projectId: 'dlicom-messaging-mesh',
      projectName: 'Encrypted Peer-to-Peer Messaging',
      type: 'BOUNTY',
      skillsRequired: ['Cryptographic Protocols', 'Technical Writing', 'Markdown'],
      description:
        'Draft developer-facing architectural documentation detailing end-to-end encryption key-exchange invariants and message schemas.',
      status: 'OPEN',
      reward: '800 $DLI',
      applyUrl: 'https://whitepaper.dlicom.io/',
      claimStatus: 'VERIFIED',
      postedAt: '2026-03-04T09:30:00Z',
    },
  ];

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({
    status: 'ok',
    totalOpportunities: opportunities.length,
    opportunities,
  });
}
