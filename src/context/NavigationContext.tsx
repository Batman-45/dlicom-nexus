import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { NavigationContext, type AppView } from './navigation-context-definition';

function parsePathToView(pathname: string): {
  view: AppView;
  executionId: string | null;
  pipelineId: string | null;
  handle: string | null;
} {
  const path = pathname.trim() || '/';

  if (path === '/mascots') {
    return { view: 'mascot_gallery', executionId: null, pipelineId: null, handle: null };
  }
  if (path.startsWith('/mascot/')) {
    const handle = path.replace('/mascot/', '').split('/')[0];
    return { view: 'mascot_generator', executionId: null, pipelineId: null, handle };
  }
  if (path.startsWith('/circle')) {
    const parts = path.split('/').filter(Boolean);
    const handle = parts[1] || null;
    return { view: 'circle', executionId: null, pipelineId: null, handle };
  }
  if (path.startsWith('/pipeline/')) {
    const parts = path.split('/').filter(Boolean);
    const pipelineId = parts[1] || null;
    return { view: 'builder', executionId: null, pipelineId, handle: null };
  }
  if (path === '/pipelines') {
    return { view: 'library', executionId: null, pipelineId: null, handle: null };
  }
  if (path === '/connectors') {
    return { view: 'connectors', executionId: null, pipelineId: null, handle: null };
  }
  if (path.startsWith('/execution/')) {
    const parts = path.split('/').filter(Boolean);
    const executionId = parts[1] || null;
    return { view: 'execution_detail', executionId, pipelineId: null, handle: null };
  }
  if (path === '/executions') {
    return { view: 'executions', executionId: null, pipelineId: null, handle: null };
  }
  // Default to mascot generator (/)
  return { view: 'mascot_generator', executionId: null, pipelineId: null, handle: null };
}

function viewToUrl(
  view: AppView,
  params?: { executionId?: string; pipelineId?: string; handle?: string }
): string {
  switch (view) {
    case 'mascot_generator':
      return params?.handle ? `/mascot/${params.handle}` : '/';
    case 'mascot_gallery':
      return '/mascots';
    case 'circle':
      return params?.handle ? `/circle/${params.handle}` : '/circle';
    case 'home':
    case 'library':
      return '/pipelines';
    case 'builder':
      return params?.pipelineId ? `/pipeline/${params.pipelineId}` : '/pipeline/active';
    case 'connectors':
      return '/connectors';
    case 'executions':
      return '/executions';
    case 'execution_detail':
      return params?.executionId ? `/execution/${params.executionId}` : '/executions';
    default:
      return '/';
  }
}

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = parsePathToView(typeof window !== 'undefined' ? window.location.pathname : '/');

  const [currentView, setCurrentView] = useState<AppView>(initial.view);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(initial.executionId);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(initial.pipelineId);
  const [targetHandle, setTargetHandle] = useState<string | null>(initial.handle);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);

  // Sync state on popstate
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePathToView(window.location.pathname);
      setCurrentView(parsed.view);
      setSelectedExecutionId(parsed.executionId);
      setSelectedPipelineId(parsed.pipelineId);
      setTargetHandle(parsed.handle);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback(
    (view: AppView, params?: { executionId?: string; pipelineId?: string; handle?: string }) => {
      if (params?.executionId) setSelectedExecutionId(params.executionId);
      if (params?.pipelineId) setSelectedPipelineId(params.pipelineId);
      if (params?.handle !== undefined) setTargetHandle(params.handle || null);

      setCurrentView(view);

      const targetUrl = viewToUrl(view, params);
      if (typeof window !== 'undefined' && targetUrl !== window.location.pathname) {
        window.history.pushState({}, '', targetUrl);
        window.scrollTo(0, 0);
      }
    },
    []
  );

  const navigateByUrl = useCallback((url: string) => {
    const parsed = parsePathToView(url);
    setCurrentView(parsed.view);
    setSelectedExecutionId(parsed.executionId);
    setSelectedPipelineId(parsed.pipelineId);
    setTargetHandle(parsed.handle);

    if (typeof window !== 'undefined' && url !== window.location.pathname) {
      window.history.pushState({}, '', url);
      window.scrollTo(0, 0);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        selectedExecutionId,
        selectedPipelineId,
        targetHandle,
        sidebarExpanded,
        navigateTo,
        navigateByUrl,
        toggleSidebar
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
