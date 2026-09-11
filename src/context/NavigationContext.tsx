import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { NavigationContext, type AppView } from './navigation-context-definition';

function parsePathToView(pathname: string): {
  view: AppView;
  handle: string | null;
} {
  const path = pathname.trim() || '/';

  if (path === '/mascots') {
    return { view: 'mascot_gallery', handle: null };
  }
  if (path.startsWith('/mascot/')) {
    const handle = path.replace('/mascot/', '').split('/')[0] || null;
    return { view: 'mascot_generator', handle };
  }
  if (path.startsWith('/circle/')) {
    const handle = path.replace('/circle/', '').split('/')[0] || null;
    return { view: 'mascot_generator', handle };
  }
  // Default to mascot generator (/) for any root or obsolete routes (/circle, /pipelines, etc.)
  return { view: 'mascot_generator', handle: null };
}

function viewToUrl(
  view: AppView,
  params?: { handle?: string }
): string {
  switch (view) {
    case 'mascot_generator':
      return params?.handle ? `/mascot/${params.handle}` : '/';
    case 'mascot_gallery':
      return '/mascots';
    default:
      return '/';
  }
}

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = parsePathToView(typeof window !== 'undefined' ? window.location.pathname : '/');

  const [currentView, setCurrentView] = useState<AppView>(initial.view);
  const [targetHandle, setTargetHandle] = useState<string | null>(initial.handle);

  // Sync state on popstate
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePathToView(window.location.pathname);
      setCurrentView(parsed.view);
      setTargetHandle(parsed.handle);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback(
    (view: AppView, params?: { handle?: string }) => {
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
    setTargetHandle(parsed.handle);

    if (typeof window !== 'undefined' && url !== window.location.pathname) {
      window.history.pushState({}, '', url);
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        targetHandle,
        navigateTo,
        navigateByUrl,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
