// Vercel Serverless Function: GET /api/pulse/activity

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const activities = [
    {
      id: 'act-01',
      timestamp: '2026-03-05T09:00:00Z',
      eventType: 'VERIFICATION',
      memberOrProjectRef: '@mohammadqadriah',
      claimTier: 'VERIFIED',
      explanation: 'Chairman & Co-Founder verified on official dlicom.io leadership roster and Dlicom Manifesto',
      sourceUrl: 'https://dlicom.io/',
      actorHandle: 'mohammadqadriah',
      actorDisplayName: 'Mohammad Qadriah',
      action: 'verified leadership credentials for',
      targetName: 'Chairman & Co-Founder Roster',
      activityType: 'VERIFICATION',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://dlicom.io/',
    },
    {
      id: 'act-02',
      timestamp: '2026-03-04T18:00:00Z',
      eventType: 'PROJECT_ACTIVITY',
      memberOrProjectRef: 'Dlicom SocialFi Platform',
      claimTier: 'VERIFIED',
      explanation: 'Integrated self-custody wallet connection protocols and Base L2 micropayments module',
      sourceUrl: 'https://dlicom.io/',
      actorHandle: 'dlicomapp',
      actorDisplayName: 'Dlicom Protocol',
      action: 'deployed platform update to',
      targetName: 'Dlicom SocialFi Portal',
      activityType: 'PROJECT_ACTIVITY',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://dlicom.io/',
    },
    {
      id: 'act-03',
      timestamp: '2026-03-04T16:20:00Z',
      eventType: 'AUDIT_UPDATE',
      memberOrProjectRef: 'Hacken Security Audit',
      claimTier: 'VERIFIED',
      explanation: 'Hacken completed formal verification on SCA-Dlicom-Token with 0 critical security issues',
      sourceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      actorHandle: 'georgechahine',
      actorDisplayName: 'George Chahine',
      action: 'verified security invariants on',
      targetName: 'Hacken Security Audit Report',
      activityType: 'AUDIT_UPDATE',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
    },
    {
      id: 'act-04',
      timestamp: '2026-03-03T11:45:00Z',
      eventType: 'CONTRIBUTION',
      memberOrProjectRef: '$DLI Staking Vaults on Base',
      claimTier: 'VERIFIED',
      explanation: 'Deployed audited smart contract update for multi-token staking vaults on Base',
      sourceUrl: 'https://whitepaper.dlicom.io/',
      actorHandle: 'jimish_parekh',
      actorDisplayName: 'Jimish Parekh',
      action: 'deployed smart contract update for',
      targetName: '$DLI Staking Vaults on Base',
      activityType: 'CONTRIBUTION',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://whitepaper.dlicom.io/',
    },
    {
      id: 'act-05',
      timestamp: '2026-03-03T10:00:00Z',
      eventType: 'OPPORTUNITY',
      memberOrProjectRef: '$DLI Smart Contracts on Base',
      claimTier: 'VERIFIED',
      explanation: 'Posted new 2,500 $DLI security bounty for smart contract vault optimizations',
      sourceUrl: 'https://github.com/dlicom-nexus',
      actorHandle: 'dlicomapp',
      actorDisplayName: 'Dlicom Protocol',
      action: 'posted new security bounty for',
      targetName: 'Staking Vaults Security Audit',
      activityType: 'OPPORTUNITY',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://github.com/dlicom-nexus',
    },
    {
      id: 'act-06',
      timestamp: '2026-03-02T19:10:00Z',
      eventType: 'CONTRIBUTION',
      memberOrProjectRef: 'MENA Community Hub',
      claimTier: 'VERIFIED',
      explanation: 'Published Arabic community localization guide and documentation portal',
      sourceUrl: 'https://t.me/DlicomAppOfficial',
      actorHandle: 'mohamedbelal',
      actorDisplayName: 'Mohamed Belal',
      action: 'published Arabic localization guide in',
      targetName: 'MENA Community Hub',
      activityType: 'CONTRIBUTION',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://t.me/DlicomAppOfficial',
    },
    {
      id: 'act-07',
      timestamp: '2026-03-01T14:30:00Z',
      eventType: 'VERIFICATION',
      memberOrProjectRef: 'Dliever Community Program',
      claimTier: 'VERIFIED',
      explanation: 'Confirmed ambassador cohort leadership for Dliever and Dcoded community initiatives',
      sourceUrl: 'https://discord.gg/yZdYa48gQM',
      actorHandle: 'oleksandrsamofal',
      actorDisplayName: 'Oleksandr Samofal',
      action: 'launched ambassador cohort for',
      targetName: 'Dliever Community Program',
      activityType: 'VERIFICATION',
      claimStatus: 'VERIFIED',
      evidenceUrl: 'https://discord.gg/yZdYa48gQM',
    },
    {
      id: 'act-08',
      timestamp: '2026-02-28T10:00:00Z',
      eventType: 'CONTRIBUTION',
      memberOrProjectRef: 'Base Rollup Infrastructure',
      claimTier: 'OBSERVED_PUBLIC_EVIDENCE',
      explanation: 'Provisioned redundant RPC telemetry infrastructure for Dlicom rollups on Base',
      sourceUrl: 'https://x.com/DlicomApp',
      actorHandle: '0xzeeve',
      actorDisplayName: 'Zeeve',
      action: 'provisioned redundant RPC telemetry for',
      targetName: 'Base Rollup Infrastructure',
      activityType: 'CONTRIBUTION',
      claimStatus: 'OBSERVED_PUBLIC_EVIDENCE',
      evidenceUrl: 'https://x.com/DlicomApp',
    },
  ];

  const { type, member } = req.query;
  let filtered = activities;

  if (type) {
    filtered = filtered.filter((a) => a.eventType === type || a.activityType === type);
  }

  if (member) {
    const clean = member.toLowerCase().replace(/^@+/, '');
    filtered = filtered.filter(
      (a) =>
        a.actorHandle?.toLowerCase() === clean ||
        a.memberOrProjectRef?.toLowerCase().includes(clean)
    );
  }

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  return res.status(200).json({
    status: 'ok',
    totalActivities: filtered.length,
    activities: filtered,
  });
}
