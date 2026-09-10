import React, { useState, useEffect } from 'react';
import { MascotGeneratorPage } from './views/MascotGeneratorPage';
import { MascotGalleryPage } from './views/MascotGalleryPage';

const CirclePage = React.lazy(() =>
  import('./views/CirclePage').then((m) => ({ default: m.CirclePage }))
);

export default function App(): React.JSX.Element {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo(0, 0);
    }
  };

  // Preserved X Circle Route
  if (currentPath === '/circle') {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#07050f] text-slate-100 flex items-center justify-center p-8">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CirclePage onNavigate={navigate} />
      </React.Suspense>
    );
  }

  // 12 Families × 36 Variants Gallery Route: /mascots
  if (currentPath === '/mascots') {
    return <MascotGalleryPage onNavigate={navigate} />;
  }

  // Direct Mascot Profile Route: /mascot/:username
  if (currentPath.startsWith('/mascot/')) {
    const username = currentPath.replace('/mascot/', '').split('/')[0];
    return <MascotGeneratorPage key={username} onNavigate={navigate} initialUsername={username} />;
  }

  // Default to Mascot Generator Landing Page (/)
  return <MascotGeneratorPage onNavigate={navigate} />;
}


