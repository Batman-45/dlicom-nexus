import React, { useState, useMemo, useCallback, useEffect } from 'react';
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

type CirclePageState = 'onboarding' | 'loading' | 'error' | 'constellation';

export const CirclePage: React.FC = () => {
  // Page Flow State - Initial visit starts clean on onboarding
  const [pageState, setPageState] = useState<CirclePageState>('onboarding');
  const [targetUsername, setTargetUsername] = useState<string>('');
  const [errorState, setErrorState] = useState<Error | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  // Constellation Graph Data
  const [currentUser, setCurrentUser] = useState<DlicomUser | null>(null);
  const [friends, setFriends] = useState<DlicomUser[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStatsData>({
    totalFriends: 0,
    mutualConnections: 0,
    activeToday: 0,
    communitiesCount: 0,
    avgConnectionScore: 0,
  });

  // UI Interactive States
  const [selectedUser, setSelectedUser] = useState<DlicomUser | null>(null);
  const [activeFilter, setActiveFilter] = useState<CircleFilter>('all');
  const [activeNavTab, setActiveNavTab] = useState<string>('circle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [isStaleData, setIsStaleData] = useState<boolean>(false);

  // Viewport Transform State
  const [transform, setTransform] = useState<ViewportTransform>({
    x: 0,
    y: 0,
    scale: 0.95,
  });

  // Core Flow: Build Circle from X Username
  const handleBuildCircle = useCallback(async (rawUsername: string) => {
    const username = rawUsername.replace(/^@+/, '').trim();
    if (!username) return;

    setTargetUsername(username);
    setPageState('loading');
    setErrorState(null);

    try {
      const provider = getSocialGraphProvider();
      // Safe diagnostics — no secrets logged
      console.log('[circle] PROVIDER MODE:', provider.mode);
      console.log('[circle] USERNAME:', username);

      const graphResult = await provider.getGraph(username);
      console.log('[circle] MOCK GRAPH GENERATED:', graphResult.connections.length, 'connections | isMockData:', graphResult.isMockData);

      const transformed = transformSocialGraphToConstellation(graphResult);

      setCurrentUser(transformed.currentUser);
      setFriends(transformed.friends);
      setNetworkStats(transformed.stats);
      setIsMockData(transformed.isMockData);
      setIsStaleData(!!graphResult.isStale);

      // Reset view to center and open constellation
      setSelectedUser(null);
      setTransform({ x: 0, y: 0, scale: 0.95 });
      setPageState('constellation');
    } catch (err: unknown) {
      // Log the exact error so devs can diagnose it in browser console
      console.error('[circle] BUILD FAILED:', err instanceof Error ? err.message : String(err), err);
      setErrorState(err instanceof Error ? err : new Error('Unable to build your Circle right now.'));
      setPageState('error');
    }
  }, []);

  // Developer Prototype Demo Preset Loader (Alex Chen & 28 friends)
  const handleLoadDemoPreset = useCallback(async () => {
    setTargetUsername('alexchen (Prototype Demo)');
    setPageState('loading');
    setErrorState(null);

    try {
      const mockProvider = new MockSocialGraphProvider();
      const graphResult = await mockProvider.getDemoPreset();
      const transformed = transformSocialGraphToConstellation(graphResult);

      setCurrentUser(transformed.currentUser);
      setFriends(transformed.friends);
      setNetworkStats(transformed.stats);
      setIsMockData(true);
      setIsStaleData(false);

      setSelectedUser(null);
      setTransform({ x: 0, y: 0, scale: 0.95 });
      setPageState('constellation');
    } catch (err: unknown) {
      setErrorState(err instanceof Error ? err : new Error('Unable to load demo data.'));
      setPageState('error');
    }
  }, []);

  // Return to Onboarding to change user
  const handleChangeCircle = useCallback(() => {
    setSelectedUser(null);
    setSearchQuery('');
    setActiveFilter('all');
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

  // Render Onboarding State
  if (pageState === 'onboarding') {
    return (
      <CircleOnboarding
        onSubmit={handleBuildCircle}
        onLoadDemoPreset={handleLoadDemoPreset}
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
        onLoadDemoPreset={handleLoadDemoPreset}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06080e] select-none">
      {/* Left Navigation Rail (Desktop/Tablet) */}
      <NavigationRail
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        activeNavTab={activeNavTab}
        onNavTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'circle') handleCenterOnYou();
          else if (tab === 'guilds') setActiveFilter('communities');
          else if (tab === 'explore') handleChangeCircle();
        }}
      />

      {/* Top Header with Compact Search & Filters & Demo Indicator */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={categoryCounts}
        totalVisible={filteredUserIds.size}
        onChangeCircle={handleChangeCircle}
        isMockData={isMockData}
        isStaleData={isStaleData}
      />

      {/* Hero Interactive Friend Constellation Canvas */}
      <main className="w-full h-full sm:pl-16 md:pl-20">
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
      />
    </div>
  );
};
