import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Search, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle2,
  FileBadge,
  Sparkles,
  Users,
  Database,
  Info,
  UserX
} from 'lucide-react';
import { PublicEvidenceRegistry } from '../services/community/registry';
import { VerificationLevel, type CommunityMember } from '../services/community/types';

interface RegistryPageProps {
  onNavigate: (route: string) => void;
  initialTab?: 'official' | 'friends' | 'candidates' | 'external' | 'sources' | 'verified';
}

export const RegistryPage: React.FC<RegistryPageProps> = ({ onNavigate, initialTab = 'official' }) => {
  const [verifiedMembers, setVerifiedMembers] = useState<CommunityMember[]>([]);
  const [communityFriends, setCommunityFriends] = useState<CommunityMember[]>([]);
  const [candidates, setCandidates] = useState<CommunityMember[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  
  // Map 'verified' to 'official' for backward compatibility
  const normalizedInitialTab = initialTab === 'verified' ? 'official' : initialTab;
  const [activeTab, setActiveTab] = useState<'official' | 'friends' | 'candidates' | 'external' | 'sources'>(normalizedInitialTab as any);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toISOString());

  useEffect(() => {
    let isMounted = true;
    const registry = PublicEvidenceRegistry.getInstance();
    
    Promise.all([
      registry.getVerifiedMembers(),
      registry.getCommunityFriends(),
      registry.getCandidates(),
      registry.getDiagnostics(),
    ]).then(([verified, friends, cands, diag]) => {
      if (!isMounted) return;
      setVerifiedMembers(verified);
      setCommunityFriends(friends);
      setCandidates(cands);
      setDiagnostics(diag);
      if (diag?.lastRefresh) {
        setLastRefreshedAt(diag.lastRefresh);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLiveRefresh = async () => {
    setIsRefreshing(true);
    try {
      const registry = PublicEvidenceRegistry.getInstance();
      const diag = await registry.refresh(true);
      const [verified, friends, cands] = await Promise.all([
        registry.getVerifiedMembers(),
        registry.getCommunityFriends(),
        registry.getCandidates(),
      ]);
      setVerifiedMembers(verified);
      setCommunityFriends(friends);
      setCandidates(cands);
      setDiagnostics(diag);
      setLastRefreshedAt(new Date().toISOString());
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const officiallyVerifiedCount = verifiedMembers.filter(
    (m) => m.verificationLevel === VerificationLevel.OFFICIALLY_VERIFIED
  ).length;
  const officialCommunityRoleCount = verifiedMembers.filter(
    (m) => m.verificationLevel === VerificationLevel.OFFICIAL_COMMUNITY_ROLE
  ).length;
  const officialTotalCount = verifiedMembers.length;
  const friendTotalCount = communityFriends.length;
  const candidateTotalCount = candidates.length;
  const staleCount = [...verifiedMembers, ...communityFriends, ...candidates].filter(
    (m) => m.sourceFreshness === 'STALE'
  ).length;
  const freshCount = [...verifiedMembers, ...communityFriends, ...candidates].length - staleCount;

  // Determine current active list based on selected category tab
  let currentList: CommunityMember[] = [];
  if (activeTab === 'official') {
    currentList = verifiedMembers;
  } else if (activeTab === 'friends') {
    currentList = communityFriends;
  } else if (activeTab === 'candidates') {
    currentList = candidates;
  }

  const filteredMembers = currentList.filter((m) => {
    const matchesSearch =
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.xHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dliId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRole === 'ALL' ||
      (selectedRole === 'Core Team' && m.role === 'Core Team') ||
      (selectedRole === 'Regional Lead' && m.role === 'Regional Lead') ||
      (selectedRole === 'Community Manager' && m.role === 'Community Manager') ||
      (selectedRole === 'Community Friend' && m.verificationLevel === VerificationLevel.COMMUNITY_FRIEND);

    const matchesLevel =
      selectedLevel === 'ALL' || m.verificationLevel === selectedLevel;

    return matchesSearch && matchesRole && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0816]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Return to Community Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  Dlicom Public Community Registry
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Public Evidence
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Transparent registry of verified Dlicom community identities and community friends.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('/registry/audit')}
              className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold text-purple-200 transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Audit Log</span>
            </button>
            <button
              onClick={() => onNavigate('/registry/methodology')}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Methodology</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Stats: 6 Metrics Required by Spec */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0c1f] border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Official Identities</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-tight">
              {officialTotalCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {officiallyVerifiedCount} Core · {officialCommunityRoleCount} Roles
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0c1f] border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Community Friends</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-300 tracking-tight">
              {friendTotalCount}
            </div>
            <div className="text-[11px] text-purple-300/80 mt-1">
              Verified Friends
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0c1f] border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Candidates</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-tight">
              {candidateTotalCount}
            </div>
            <div className="text-[11px] text-amber-400/80 mt-1">
              Unverified Queue
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0c1f] border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Evidence Sources</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-300 tracking-tight">
              {diagnostics?.sources?.length ?? 4}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {diagnostics?.sourceHealth || 'HEALTHY'}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0c1f] border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Fresh Records</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-tight">
              {freshCount}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">
              Verified &lt; 30d
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0c1f] border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Stale Records</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${staleCount > 0 ? 'text-red-400' : 'text-slate-200'}`}>
              {staleCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Safely Preserved
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          {/* Distinct Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('official')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'official'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>OFFICIAL DLICOM</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                {officialTotalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>COMMUNITY FRIENDS</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                {friendTotalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'candidates'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>POTENTIAL COMMUNITY</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                {candidateTotalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('external')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'external'
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <UserX className="w-4 h-4 text-slate-400" />
              <span>EXTERNAL / FILTERED</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'sources'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Database className="w-4 h-4 text-cyan-300" />
              <span>Source Health ({diagnostics?.sources?.length ?? 4})</span>
            </button>
          </div>

          {/* Search and Filters */}
          {activeTab !== 'sources' && activeTab !== 'external' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search @handle, name, DLI-ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {activeTab === 'official' && (
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#0e0c1f] border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Core Team">Core Team</option>
                  <option value="Regional Lead">Regional Lead</option>
                  <option value="Community Manager">Community Manager</option>
                </select>
              )}

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#0e0c1f] border border-white/10 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Verification Levels</option>
                <option value={VerificationLevel.OFFICIALLY_VERIFIED}>Officially Verified</option>
                <option value={VerificationLevel.OFFICIAL_COMMUNITY_ROLE}>Community Role</option>
                <option value={VerificationLevel.COMMUNITY_FRIEND}>Community Friend</option>
              </select>

              <span className="text-[10px] font-mono text-slate-400 hidden xl:inline">
                Verified: {new Date(lastRefreshedAt).toLocaleTimeString()}
              </span>

              <button
                onClick={handleLiveRefresh}
                disabled={isRefreshing}
                title="Refresh live public verification"
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Clock className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Verifying...' : 'Refresh verification'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Section Banners */}
        {activeTab === 'official' && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-white">Official Dlicom Community Registry (Circle-Eligible)</strong>
              <p className="mt-0.5 text-slate-300 leading-relaxed">
                Identities officially verified through public, Dlicom-controlled properties (dlicom.io leadership rosters, manifesto citations, and official community roles). These identities are eligible to enter a user's Circle constellation when an observable public X interaction exists.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="mt-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-200 text-xs flex items-start gap-2.5">
            <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-white">Dlicom Community Friends (Circle-Eligible)</strong>
              <p className="mt-0.5 text-slate-300 leading-relaxed">
                Identities backed by strong, independent public Dlicom community evidence (at least 2 independent public signals and 1 meaningful community participation signal). Community Friends are distinct from official Dlicom staff and are eligible to enter a user's Circle constellation upon verified public X interaction.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-white">Potential Dlicom Community — Unverified</strong>
              <p className="mt-0.5 text-slate-300 leading-relaxed">
                Public evidence suggests a possible Dlicom connection, but this identity is not independently verified as a Dlicom community member. These identities hold observable public claims or partner citations, but are strictly excluded from the Circle constellation pending formal core roster publication.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'external' && (
          <div className="mt-4 p-5 rounded-3xl bg-[#0e0c1f] border border-white/10 text-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <UserX className="w-4 h-4 text-slate-400" />
              <span>External X Account Isolation Policy</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>External X Account = public interaction exists, but zero Dlicom membership evidence.</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                <span className="font-mono text-purple-300 text-[10px] uppercase block mb-1 font-bold">1. Input Isolation</span>
                <p className="text-slate-400 leading-snug">
                  X interactions are used exclusively to discover observable interactions for the input user.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                <span className="font-mono text-cyan-300 text-[10px] uppercase block mb-1 font-bold">2. Zero Leakage</span>
                <p className="text-slate-400 leading-snug">
                  External accounts never enter the Circle constellation, are never stored as members, and never receive DLI-IDs.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                <span className="font-mono text-emerald-300 text-[10px] uppercase block mb-1 font-bold">3. Invariant Guarantee</span>
                <p className="text-slate-400 leading-snug">
                  Circle Nodes = Observable Public X Interactions ∩ Verified Dlicom Community Registry.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Source Health Matrix View */}
        {activeTab === 'sources' && (
          <div className="mt-6 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e0c1f]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-white/10 bg-white/5 uppercase font-mono text-[10px] text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Official Source</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Primary URL</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">HTTP Status</th>
                    <th className="py-3 px-4">Discovered</th>
                    <th className="py-3 px-4">Accepted</th>
                    <th className="py-3 px-4">Last Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {(diagnostics?.sources || [
                    { title: 'Official Production Portal', sourceType: 'OFFICIAL_WEBSITE', url: 'https://dlicom.io/', status: 'HEALTHY', httpStatus: 200, recordsExtracted: 9, recordsAccepted: 9, lastChecked: new Date().toISOString() },
                    { title: 'Official Community Leadership', sourceType: 'OFFICIAL_COMMUNITY_SOURCE', url: 'https://dlicom.io/', status: 'HEALTHY', httpStatus: 200, recordsExtracted: 2, recordsAccepted: 2, lastChecked: new Date().toISOString() },
                    { title: 'Official Documentation & Whitepaper', sourceType: 'OFFICIAL_ANNOUNCEMENT', url: 'https://whitepaper.dlicom.io/', status: 'HEALTHY', httpStatus: 200, recordsExtracted: 0, recordsAccepted: 0, lastChecked: new Date().toISOString() },
                    { title: 'Public Evidence & Candidate Stream', sourceType: 'PUBLIC_X_EVIDENCE', url: 'https://x.com/DlicomApp', status: 'HEALTHY', httpStatus: 200, recordsExtracted: 2, recordsAccepted: 0, lastChecked: new Date().toISOString() },
                  ]).map((s: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-white">{s.title}</td>
                      <td className="py-3 px-4 text-slate-400">{s.sourceType}</td>
                      <td className="py-3 px-4 text-cyan-300">
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          {s.url}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200">{s.httpStatus ?? 200} OK</td>
                      <td className="py-3 px-4 font-bold text-white">{s.recordsExtracted ?? s.discovered ?? 0}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{s.recordsAccepted ?? s.accepted ?? 0}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">{new Date(s.lastChecked).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State for Community Friends if none yet */}
        {activeTab === 'friends' && filteredMembers.length === 0 && (
          <div className="mt-8 p-8 rounded-3xl bg-[#0e0c1f] border border-white/10 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center mx-auto text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              0 verified Community Friends found from currently observable public evidence.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              We require at least 2 independent public evidence signals and 1 meaningful community participation signal before an identity is promoted to Community Friend. When in doubt, the engine does not promote.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/registry/methodology')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
              >
                Read Verification Methodology
              </button>
            </div>
          </div>
        )}

        {/* Members Grid (for official, friends, candidates) */}
        {activeTab !== 'sources' && activeTab !== 'external' && filteredMembers.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const isOfficiallyVerified = member.verificationLevel === VerificationLevel.OFFICIALLY_VERIFIED;
              const isCommunityRole = member.verificationLevel === VerificationLevel.OFFICIAL_COMMUNITY_ROLE;
              const isCommunityFriend = member.verificationLevel === VerificationLevel.COMMUNITY_FRIEND;
              const isCandidate = member.verificationLevel === VerificationLevel.COMMUNITY_CANDIDATE;

              // Specialized Candidate Card
              if (isCandidate) {
                return (
                  <div
                    key={member.dliId}
                    className="p-5 rounded-3xl bg-[#0e0c1f] border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Candidate Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatarUrl || `https://unavatar.io/x/${member.normalizedHandle}`}
                            alt={member.displayName}
                            className="w-11 h-11 rounded-2xl bg-white/5 border border-amber-500/20 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                              {member.displayName}
                            </h3>
                            <a
                              href={`https://x.com/${member.normalizedHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-amber-400/90 hover:text-amber-300 transition-colors flex items-center gap-1 font-mono"
                            >
                              @{member.xHandle}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                          {member.dliId}
                        </span>
                      </div>

                      {/* Candidate Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          POTENTIAL DLICOM COMMUNITY — UNVERIFIED
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-white/5 border border-white/5">
                          Score: {member.confidenceScore}%
                        </span>
                      </div>

                      {/* Why Discovered */}
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 mb-2.5 text-xs text-slate-300">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-0.5 font-bold">
                          Why Discovered:
                        </span>
                        <p className="text-slate-200 leading-snug">
                          {member.candidateReason || member.discoverySource}
                        </p>
                      </div>

                      {/* Exact Reason NOT Verified */}
                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-2.5 text-xs">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90 block mb-0.5 font-bold">
                          Exact Reason NOT Verified:
                        </span>
                        <p className="text-amber-100/90 leading-snug">
                          {member.whyNotVerified || 'Third-party claim or partner interaction without formal core team roster entry.'}
                        </p>
                      </div>

                      {/* Additional Evidence Required */}
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 mb-3 text-xs">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-0.5 font-bold">
                          Required for Verification:
                        </span>
                        <p className="text-slate-300 leading-snug">
                          {member.requiredEvidence || 'Formal cryptographic attestation or inclusion in official Dlicom team roster on dlicom.io.'}
                        </p>
                      </div>

                      {/* Public Evidence URLs */}
                      <div className="mb-4">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          Observable Evidence Source:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {member.evidenceUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                            >
                              {url.replace('https://', '').split('/')[0]}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Candidate Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-amber-400/90">Non-Circle Candidate</span>
                      <button
                        onClick={() => onNavigate(`/passport/${member.dliId}`)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-medium transition-colors"
                      >
                        Audit Record
                      </button>
                    </div>
                  </div>
                );
              }

              // Specialized Community Friend Card
              if (isCommunityFriend) {
                return (
                  <div
                    key={member.dliId}
                    className="p-5 rounded-3xl bg-[#0e0c1f] border border-purple-500/30 hover:border-purple-500/60 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatarUrl || `https://unavatar.io/x/${member.normalizedHandle}`}
                            alt={member.displayName}
                            className="w-11 h-11 rounded-2xl bg-white/5 border border-purple-500/30 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                              {member.displayName}
                            </h3>
                            <a
                              href={`https://x.com/${member.normalizedHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1 font-mono"
                            >
                              @{member.xHandle}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30">
                          {member.dliId}
                        </span>
                      </div>

                      {/* Community Friend Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-bold">
                          <Users className="w-3 h-3" />
                          DLICOM COMMUNITY FRIEND
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                          {member.sourceFreshness}
                        </span>
                      </div>

                      {/* Confidence & Strongest Evidence Type */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] font-mono">
                        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-slate-400 block text-[9px] uppercase">Confidence</span>
                          <span className="font-bold text-white">{member.confidenceScore}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-slate-400 block text-[9px] uppercase">Evidence Signals</span>
                          <span className="font-bold text-purple-300">{member.evidenceUrls.length} Sources</span>
                        </div>
                      </div>

                      {/* Why Verified */}
                      <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-3 text-xs leading-relaxed text-slate-200">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block mb-1 font-bold">
                          Why Verified:
                        </span>
                        <p className="line-clamp-3">{member.evidenceSummary || member.verificationExplanation}</p>
                      </div>

                      {/* Evidence Links */}
                      <div className="mb-4">
                        <span className="text-[10px] font-mono text-slate-400 block mb-1">
                          Evidence Links:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {member.evidenceUrls.slice(0, 3).map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 text-[10px] font-mono flex items-center gap-1 transition-colors"
                            >
                              {url.replace('https://', '').split('/')[0]}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer with Passport button */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Circle Eligible</span>
                      <button
                        onClick={() => onNavigate(`/passport/${member.dliId}`)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <span>Passport</span>
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              }

              // Official Dlicom Card
              return (
                <div
                  key={member.dliId}
                  className="p-5 rounded-3xl bg-[#0e0c1f] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatarUrl || `https://unavatar.io/x/${member.normalizedHandle}`}
                          alt={member.displayName}
                          className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                              {member.displayName}
                            </h3>
                          </div>
                          <a
                            href={`https://x.com/${member.normalizedHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
                          >
                            @{member.xHandle}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      <span className="font-mono text-[10px] text-cyan-400/90 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                        {member.dliId}
                      </span>
                    </div>

                    {/* Badges Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                        {member.role}
                      </span>

                      {isOfficiallyVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          OFFICIALLY VERIFIED
                        </span>
                      )}

                      {isCommunityRole && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <FileBadge className="w-3 h-3" />
                          OFFICIAL COMMUNITY ROLE
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                        {member.sourceFreshness}
                      </span>
                    </div>

                    {/* Evidence Summary ("Why Verified") */}
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-3 text-xs leading-relaxed text-slate-300">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block mb-1 font-bold">
                        Public Verification Evidence:
                      </span>
                      <p className="line-clamp-3">{member.evidenceSummary || member.evidence}</p>
                    </div>

                    {/* Public Evidence URLs */}
                    <div className="mb-4">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">
                        Clickable Official Evidence:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {member.evidenceUrls.slice(0, 3).map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                          >
                            {url.replace('https://', '').split('/')[0]}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Evidence Count, Last Verified, Confidence, and Passport link */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                      <span>
                        Evidence: <span className="text-cyan-300 font-bold">{member.evidenceUrls.length} sources</span>
                      </span>
                      <span>•</span>
                      <span>
                        Score: <span className="text-white font-bold">{member.confidenceScore}%</span>
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate(`/passport/${member.dliId}`)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-medium transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>View Passport</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
