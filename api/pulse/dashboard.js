// Vercel Serverless Function: GET /api/pulse/dashboard

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Authoritative Dlicom Pulse projects
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
  ];

  const recentContributions = [
    {
      id: 'contrib-001',
      title: 'Base ERC-20 Token & Staking Contract Implementation',
      memberHandle: 'jimish_parekh',
      memberDliId: 'DLI-CORE-004',
      memberDisplayName: 'Jimish Parekh',
      projectName: '$DLI Smart Contracts on Base',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      observedAt: '2026-02-18T10:00:00Z',
    },
    {
      id: 'contrib-002',
      title: 'Tokenomics Modeling & Hacken Security Audit Resolution',
      memberHandle: 'georgechahine',
      memberDliId: 'DLI-CORE-003',
      memberDisplayName: 'George Chahine',
      projectName: 'Hacken Security & Formal Verification',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      observedAt: '2026-02-20T14:30:00Z',
    },
    {
      id: 'contrib-003',
      title: 'Dlicom Manifesto & Ecosystem Architecture Whitepaper',
      memberHandle: 'mohammadqadriah',
      memberDliId: 'DLI-CORE-002',
      memberDisplayName: 'Mohammad Qadriah',
      projectName: 'Dlicom SocialFi Platform',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://whitepaper.dlicom.io/',
      observedAt: '2026-01-15T09:00:00Z',
    },
  ];

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({
    status: 'ok',
    hub: 'Dlicom Pulse',
    stats: {
      communityMemberCount: 13,
      verifiedMemberCount: 11,
      candidateCount: 2,
      activeContributorsCount: 8,
      projectsCount: 6,
      contributionsCount: 10,
      openOpportunitiesCount: 4,
    },
    projects,
    recentContributions,
    achievements: [
      {
        id: 'achieve-001',
        title: 'Hacken Security Excellence Certification',
        description: 'Successfully passed formal audit by Hacken with zero critical vulnerabilities.',
        recipientHandle: 'georgechahine',
        recipientDliId: 'DLI-CORE-003',
        recipientDisplayName: 'George Chahine',
        category: 'SECURITY_EXCELLENCE',
        awardedAt: '2026-02-20T12:00:00Z',
        claimStatus: 'VERIFIED',
        evidenceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      },
      {
        id: 'achieve-002',
        title: 'Founding Manifesto Author',
        description: 'Authored and published the foundational Dlicom SocialFi doctrine.',
        recipientHandle: 'mohammadqadriah',
        recipientDliId: 'DLI-CORE-002',
        recipientDisplayName: 'Mohammad Qadriah',
        category: 'CORE_MILESTONE',
        awardedAt: '2026-01-15T00:00:00Z',
        claimStatus: 'VERIFIED',
        evidenceUrl: 'https://whitepaper.dlicom.io/',
      },
      {
        id: 'achieve-003',
        title: 'Base Smart Contract Deployer',
        description: 'Successfully engineered and deployed verified smart contract architecture on Base.',
        recipientHandle: 'jimish_parekh',
        recipientDliId: 'DLI-CORE-004',
        recipientDisplayName: 'Jimish Parekh',
        category: 'CORE_MILESTONE',
        awardedAt: '2026-02-18T10:00:00Z',
        claimStatus: 'VERIFIED',
        evidenceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      },
    ],
    communityActivity: [
      {
        id: 'act-01',
        timestamp: '2026-03-04T16:20:00Z',
        actorHandle: 'georgechahine',
        actorDisplayName: 'George Chahine',
        action: 'verified security invariants on',
        targetName: 'Hacken Security Audit',
        claimStatus: 'VERIFIED',
        evidenceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      },
      {
        id: 'act-02',
        timestamp: '2026-03-03T11:45:00Z',
        actorHandle: 'jimish_parekh',
        actorDisplayName: 'Jimish Parekh',
        action: 'deployed smart contract update for',
        targetName: '$DLI Staking Vaults on Base',
        claimStatus: 'VERIFIED',
        evidenceUrl: 'https://whitepaper.dlicom.io/',
      },
    ],
    opportunities: [
      {
        id: 'opp-001',
        title: 'Smart Contract Security Reviewer — Staking Vaults',
        projectName: '$DLI Smart Contracts on Base',
        type: 'BOUNTY',
        skillsRequired: ['Solidity', 'Base L2', 'Formal Verification'],
        reward: '2,500 $DLI',
        applyUrl: 'https://github.com/dlicom-nexus',
        claimStatus: 'VERIFIED',
      },
    ],
  });
}
