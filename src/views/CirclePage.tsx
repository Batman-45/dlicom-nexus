import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { CircleFilter, DlicomUser, NetworkStatsData, ViewportTransform } from '../types/circle';
import { NavigationRail } from '../components/Sidebar/NavigationRail';
import { Header } from '../components/Header/Header';
import { FriendMap } from '../components/FriendMap/FriendMap';
import { FriendProfile } from '../components/FriendProfile/FriendProfile';
import { NetworkStats } from '../components/NetworkStats/NetworkStats';
import { MapControls } from '../components/MapControls/MapControls';
import { CircleOnboarding } from '../components/CircleOnboarding/CircleOnboarding';
import { CircleLoading } from '../components/CircleOnboarding/CircleLoading';
import { CircleError } from '../components/CircleOnboarding/CircleError';
import { getSocialGraphProvider, transformSocialGraphToConstellation, MockSocialGraphProvider } from '../services/socialGraph';
import type { SocialConnection } from '../services/socialGraph/types';

function normalizeUsername(raw: string): string {
  return (raw || '').toLowerCase().replace(/^@+/, '').trim();
}

type CirclePageState = 'onboarding' | 'loading' | 'error' | 'constellation';

interface CirclePageProps {
  onNavigate?: (route: string) => void;
}

export const CirclePage: React.FC<CirclePageProps> = ({ onNavigate }) => {
  // Page Flow State - Initial visit starts clean on onboarding
  const [pageState, setPageState] = useState<CirclePageState>('onboarding');
  const [targetUsername, setTargetUsername] = useState<string>('');
  const [errorState, setErrorState] = useState<Error | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  // Constellation Graph Data (strictly user-scoped)
  const [currentUser, setCurrentUser] = useState<DlicomUser | null>(null);
  const [friends, setFriends] = useState<DlicomUser[]>([]);
  const [rawConnections, setRawConnections] = useState<SocialConnection[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStatsData>({
    totalFriends: 0,
    mutualConnections: 0,
    activeToday: 0,
    communitiesCount: 0,
    avgConnectionScore: 0,
  });

  // Request sequencing and stale async response guards
  const requestSequenceRef = useRef<number>(0);
  const activeRequestUsernameRef = useRef<string>('');

  // UI Interactive States
  const [selectedUser, setSelectedUser] = useState<DlicomUser | null>(null);
  const [activeFilter, setActiveFilter] = useState<CircleFilter>('all');
  const [activeNavTab, setActiveNavTab] = useState<string>('circle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [isStaleData, setIsStaleData] = useState<boolean>(false);
  const [dataStatus, setDataStatus] = useState<string | undefined>(undefined);
  const [dataReason, setDataReason] = useState<string | undefined>(undefined);
  const [potentialCandidates, setPotentialCandidates] = useState<any[]>([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState<number>(0);

  // Viewport Transform State
  const [transform, setTransform] = useState<ViewportTransform>({
    x: 0,
    y: 0,
    scale: 0.95,
  });

  // Invalidate any legacy browser storage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const legacyKeys = ['circleGraph', 'graph', 'friends', 'socialGraph', 'selectedUser'];
        legacyKeys.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch {
      // Storage access unavailable
    }
  }, []);

  // Core Flow: Build Circle from X Username
  const handleBuildCircle = useCallback(async (rawUsername: string) => {
    const username = normalizeUsername(rawUsername);
    if (!username) return;

    // Immediately clear previous graph state to prevent node persistence across user transitions
    const currentSeq = ++requestSequenceRef.current;
    activeRequestUsernameRef.current = username;

    setCurrentUser(null);
    setFriends([]);
    setRawConnections([]);
    setSelectedUser(null);
    setErrorState(null);
    setTargetUsername(username);
    setPageState('loading');

    try {
      const provider = getSocialGraphProvider();
      // Safe diagnostics — no secrets logged
      console.log('[circle] PROVIDER MODE:', provider.mode);
      console.log('[circle] USERNAME:', username);

      const graphResult = await provider.getGraph(username);

      // Stale response guard: discard if a newer request began or target changed
      if (requestSequenceRef.current !== currentSeq || activeRequestUsernameRef.current !== username) {
        console.log(`[circle] Stale async response discarded for @${username} (active is @${activeRequestUsernameRef.current})`);
        return;
      }

      const transformed = transformSocialGraphToConstellation(graphResult);

      const rawCount = graphResult.rawConnectionsCount ?? graphResult.totalCandidatesAnalyzed ?? 0;
      const verifiedDlicomCount = graphResult.matchedMembersCount ?? 0;
      const circleFriendsCount = transformed.friends.length;
      const totalGraphNodes = 1 + circleFriendsCount;

      console.log('[circle] USERNAME:', username);
      console.log('[circle] SOCIAL CONNECTIONS:', rawCount);
      console.log('[circle] DLICOM VERIFIED CONNECTIONS:', verifiedDlicomCount);
      console.log('[circle] CIRCLE FRIENDS:', circleFriendsCount);
      console.log('[circle] GRAPH NODES:', totalGraphNodes);
      console.log('[circle] RAW X CONNECTIONS:', rawCount);
      console.log('[circle] VERIFIED DLICOM MATCHES:', verifiedDlicomCount);
      console.log('[circle] CIRCLE NODES:', circleFriendsCount);
      console.log('[circle] CIRCLE FRIENDS GRAPH NODES GENERATED:', circleFriendsCount);
      console.log('[circle] VERIFIED DLICOM NODES:', verifiedDlicomCount);
      console.log('[circle] GRAPH GENERATED:', circleFriendsCount, 'circle friends | verified Dlicom:', verifiedDlicomCount, '| isMockData:', graphResult.isMockData);

      console.log('[circle-debug] FINAL GRAPH NODES:', totalGraphNodes, `(1 central YOU + ${circleFriendsCount} friends)`);
      console.log('[circle-debug] FINAL GRAPH EDGES:', circleFriendsCount);

      // Development-only invariant assertion: Personal Friend Circle isolation
      if (import.meta.env.DEV) {
        const currentConnectionHandles = new Set(
          (graphResult.rawConnections || []).map((c) => normalizeUsername(c.username))
        );
        for (const friend of transformed.friends) {
          const normFriend = normalizeUsername(friend.username);
          if (!currentConnectionHandles.has(normFriend)) {
            console.error(`[circle-isolation] FATAL VIOLATION: Friend @${friend.username} rendered in Personal Circle without observable public X interaction!`);
            throw new Error(`[circle-isolation] Personal Circle isolation violated: @${friend.username} is not an observable public X connection.`);
          }
        }
      }

      setRawConnections(graphResult.rawConnections || []);
      setCurrentUser(transformed.currentUser);
      setFriends(transformed.friends);
      setNetworkStats(transformed.stats);
      setIsMockData(transformed.isMockData);
      setIsStaleData(!!graphResult.isStale);
      setDataStatus(transformed.dataStatus);
      setDataReason(transformed.reason);
      setPotentialCandidates(transformed.potentialCommunityMembers || []);
      setTotalAnalyzed(transformed.totalCandidatesAnalyzed || 0);

      // Reset view to center and open constellation
      setSelectedUser(null);
      setTransform({ x: 0, y: 0, scale: 0.95 });
      setPageState('constellation');
    } catch (err: unknown) {
      if (requestSequenceRef.current !== currentSeq) return;
      // Log the exact error so devs can diagnose it in browser console
      console.error('[circle] BUILD FAILED:', err instanceof Error ? err.message : String(err), err);
      setErrorState(err instanceof Error ? err : new Error('Unable to build your Circle right now.'));
      setPageState('error');
    }
  }, []);

  // Developer Prototype Demo Preset Loader (Alex Chen & 28 friends) - Dev only
  const handleLoadDemoPreset = useCallback(async () => {
    if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      console.warn('[circle] Prototype demo preset is strictly disabled in production.');
      return;
    }

    requestSequenceRef.current++;
    activeRequestUsernameRef.current = 'alexchen';

    setCurrentUser(null);
    setFriends([]);
    setRawConnections([]);
    setSelectedUser(null);
    setTargetUsername('alexchen (Prototype Demo)');
    setPageState('loading');
    setErrorState(null);

    try {
      const mockProvider = new MockSocialGraphProvider();
      const graphResult = await mockProvider.getDemoPreset();
      const transformed = transformSocialGraphToConstellation(graphResult);

      setRawConnections(graphResult.rawConnections || []);
      setCurrentUser(transformed.currentUser);
      setFriends(transformed.friends);
      setNetworkStats(transformed.stats);
      setIsMockData(true);
      setIsStaleData(false);
      setDataStatus('OK');
      setDataReason(undefined);

      setSelectedUser(null);
      setTransform({ x: 0, y: 0, scale: 0.95 });
      setPageState('constellation');
    } catch (err: unknown) {
      setErrorState(err instanceof Error ? err : new Error('Unable to load demo data.'));
      setPageState('error');
    }
  }, []);

  // Return to Onboarding to change user - completely clears all previous graph state
  const handleChangeCircle = useCallback(() => {
    requestSequenceRef.current++;
    activeRequestUsernameRef.current = '';
    setCurrentUser(null);
    setFriends([]);
    setRawConnections([]);
    setSelectedUser(null);
    setSearchQuery('');
    setActiveFilter('all');
    setTargetUsername('');
    setPageState('onboarding');
  }, []);

  // Calculate filtered users based on active category filter and search query
  const filteredUserIds = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const ids = new Set<string>();

    friends.forEach((user) => {
      let matchesFilter = true;
      if (activeFilter === 'friends') {
        matchesFilter = user.category === 'friends' || user.connectionStrength >= 80;
      } else if (activeFilter === 'creators') {
        matchesFilter = user.category === 'creators';
      } else if (activeFilter === 'builders') {
        matchesFilter = user.category === 'builders';
      } else if (activeFilter === 'communities') {
        matchesFilter = user.category === 'communities';
      } else if (activeFilter === 'active') {
        matchesFilter = user.isOnline;
      }

      let matchesSearch = true;
      if (query) {
        matchesSearch =
          user.displayName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          user.bio.toLowerCase().includes(query) ||
          user.tags.some((t) => t.toLowerCase().includes(query));
      }

      if (matchesFilter && matchesSearch) {
        ids.add(user.id);
      }
    });

    return ids;
  }, [friends, activeFilter, searchQuery]);

  // Category counts for header filter pills
  const categoryCounts = useMemo(() => {
    return {
      all: friends.length,
      friends: friends.filter((u) => u.category === 'friends' || u.connectionStrength >= 80).length,
      creators: friends.filter((u) => u.category === 'creators').length,
      builders: friends.filter((u) => u.category === 'builders').length,
      communities: friends.filter((u) => u.category === 'communities').length,
      active: friends.filter((u) => u.isOnline).length,
    };
  }, [friends]);

  // Handle user selection & pan smoothly to their node
  const handleSelectUser = useCallback((user: DlicomUser) => {
    setSelectedUser(user);
    if (!user.isCurrentUser) {
      const isMobile = window.innerWidth < 768;
      const targetOffsetX = isMobile ? 0 : -80;
      setTransform((prev) => ({
        ...prev,
        x: -user.x * prev.scale + targetOffsetX,
        y: -user.y * prev.scale,
      }));
    }
  }, []);

  const handleCenterOnYou = useCallback(() => {
    setTransform({
      x: 0,
      y: 0,
      scale: 1,
    });
  }, []);

  const handleResetView = useCallback(() => {
    setTransform({
      x: 0,
      y: 0,
      scale: 0.95,
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 2.2),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.35),
    }));
  }, []);

  // Keyboard shortcut handlers (Escape to close profile or return to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedUser) {
          setSelectedUser(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser]);

  const isDevWithMock = !!import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Render Onboarding State
  if (pageState === 'onboarding') {
    return (
      <CircleOnboarding
        onSubmit={handleBuildCircle}
        onLoadDemoPreset={isDevWithMock ? handleLoadDemoPreset : undefined}
        isDevMode={isDevWithMock}
        initialValue={targetUsername}
      />
    );
  }

  // Render Loading State
  if (pageState === 'loading') {
    return <CircleLoading username={targetUsername} />;
  }

  // Render Error State
  if (pageState === 'error') {
    return (
      <CircleError
        username={targetUsername}
        error={errorState}
        onRetry={() => handleBuildCircle(targetUsername)}
        onBackToInput={handleChangeCircle}
      />
    );
  }

  // Render Main Interactive Constellation (if currentUser is ready)
  if (!currentUser) {
    return (
      <CircleOnboarding
        onSubmit={handleBuildCircle}
        onLoadDemoPreset={isDevWithMock ? handleLoadDemoPreset : undefined}
        isDevMode={isDevWithMock}
      />
    );
  }

  // --- HARD RUNTIME BOUNDARY BEFORE RENDER ---
  const normalizedCurrentUsername = normalizeUsername(targetUsername || currentUser?.username || '');

  const currentConnectionHandles = new Set(
    (rawConnections || []).map((c) => normalizeUsername(c.username))
  );

  const graphFriendHandles = friends.map((f) => normalizeUsername(f.username));

  // Diagnostic telemetry logs immediately before graph/node rendering
  console.log('[circle-render] USERNAME:', normalizedCurrentUsername);
  console.log('[circle-render] RAW CONNECTIONS:', currentConnectionHandles.size);
  console.log('[circle-render] CIRCLE FRIENDS:', friends.length);
  console.log('[circle-render] GRAPH FRIEND NODES:', friends.length);
  console.log('[circle-render] GRAPH TOTAL NODES:', 1 + friends.length);
  console.log('[circle-render] GRAPH FRIEND HANDLES:', graphFriendHandles);

  // Assertion: every friend node username must exist in currentConnectionHandles
  if (import.meta.env.DEV && !isMockData && friends.length > 0) {
    for (const friendHandle of graphFriendHandles) {
      if (!currentConnectionHandles.has(friendHandle)) {
        const violationMsg = `CIRCLE ISOLATION VIOLATION: graph contains a non-interacted identity: @${friendHandle} for user @${normalizedCurrentUsername}. Current connection handles: [${Array.from(currentConnectionHandles).join(', ')}]`;
        console.error('[circle-render]', violationMsg);
        throw new Error(violationMsg);
      }
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05030b] select-none">
      {/* Left Floating Navigation Rail (Desktop/Tablet) */}
      <NavigationRail
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        activeNavTab={activeNavTab}
        onNavigate={onNavigate}
        onNavTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'circle') handleCenterOnYou();
          else if (tab === 'guilds') setActiveFilter('communities');
          else if (tab === 'explore') handleChangeCircle();
        }}
      />

      {/* Top Floating Glass Header with Compact Search & Filters */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={categoryCounts}
        totalVisible={filteredUserIds.size}
        onChangeCircle={handleChangeCircle}
        onCenterOnYou={handleCenterOnYou}
        targetUsername={targetUsername || currentUser.username}
        isMockData={isMockData}
        isStaleData={isStaleData}
        dataStatus={dataStatus}
        dataReason={dataReason}
        onNavigate={onNavigate}
      />

      {/* Active Matched Banner when Circle friends exist */}
      {friends.length > 0 && !isMockData && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 max-w-xl text-center">
          <div className="glass-panel px-4 py-2 rounded-full border border-purple-500/30 bg-slate-950/90 shadow-2xl flex items-center gap-2 pointer-events-auto backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <p className="text-xs text-slate-200 font-sans">
              Personal Friend Circle: {friends.length} friend{friends.length === 1 ? '' : 's'} ({friends.filter(f => f.communityClassification === 'official' || f.communityClassification === 'community_role' || f.communityClassification === 'community_friend').length} Dlicom verified � {friends.filter(f => f.communityClassification === 'external' || !f.communityClassification).length} external).
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('/registry')}
                className="ml-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
              >
                View Registry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dlicom Community Matching Empty State Feedback */}
      {friends.length === 0 && !isMockData && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 max-w-xl text-center w-full">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/35 bg-slate-950/95 shadow-2xl pointer-events-auto backdrop-blur-md flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                No observable public X interactions found yet.
              </h3>
            </div>
            <p className="text-xs text-slate-200 font-sans mb-3.5 leading-relaxed max-w-lg">
              We analyzed your public X activity, but no public replies, quotes, reposts, or mentions were available to construct your personal Friend Circle.
            </p>

            {/* Analysis Metric Breakdown */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="block text-base font-mono font-bold text-white">{totalAnalyzed}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">X Accounts Analyzed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-purple-500/30 text-center">
                <span className="block text-base font-mono font-bold text-purple-300">0</span>
                <span className="text-[10px] text-purple-300/80 uppercase tracking-wider block">Verified Dlicom Matches</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-amber-500/20 text-center">
                <span className="block text-base font-mono font-bold text-amber-300">{potentialCandidates.length}</span>
                <span className="text-[10px] text-amber-300/80 uppercase tracking-wider block">Candidates</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="block text-base font-mono font-bold text-slate-300">
                  {Math.max(0, totalAnalyzed - potentialCandidates.length)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">External Accounts</span>
              </div>
            </div>

            {/* Potential Dlicom Community Candidates (Separate display, never in main Circle) */}
            {potentialCandidates.length > 0 && (
              <div className="w-full mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Potential Dlicom Community — Unverified ({potentialCandidates.length})
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80 uppercase">
                    Non-Circle Pipeline
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                  Public evidence suggests a possible Dlicom connection, but this identity is not independently verified as a Dlicom community member.
                </p>
                <div className="space-y-1.5">
                  {potentialCandidates.map((c) => (
                    <div
                      key={c.dliId || c.normalizedHandle || c.xHandle}
                      className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">@{c.xHandle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.confidenceScore}% confidence
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                        Candidate
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('/registry')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  Explore the Public Dlicom Registry
                </button>
              )}
              {onNavigate && (
                <button
                  onClick={() => onNavigate('/registry/methodology')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  Learn how verification works
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Interactive Friend Constellation Canvas (Edge-to-Edge 100% Viewport) */}
      <main className="w-full h-full absolute inset-0">
        <FriendMap
          currentUser={currentUser}
          friends={friends}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          filteredUserIds={filteredUserIds}
          showOrbits={showOrbits}
          transform={transform}
          onTransformChange={setTransform}
        />
      </main>

      {/* Bottom Left Network Statistics HUD */}
      <NetworkStats stats={networkStats} />

      {/* Bottom Map Navigation Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
        onCenterOnYou={handleCenterOnYou}
        showOrbits={showOrbits}
        onToggleOrbits={() => setShowOrbits((prev) => !prev)}
        scale={transform.scale}
      />

      {/* Right Slide-in Profile Panel (Only shown when a friend or YOU is selected) */}
      <FriendProfile
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSelectMutual={(mutualId) => {
          const target = friends.find((f) => f.id === mutualId);
          if (target) handleSelectUser(target);
        }}
        isMockData={isMockData}
        onNavigate={onNavigate}
      />
    </div>
  );
};
