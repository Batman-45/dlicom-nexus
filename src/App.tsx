import React, { useState, useEffect } from 'react';
import { PulseDashboardPage } from './views/PulseDashboardPage';
import { PulseMembersPage } from './views/PulseMembersPage';
import { PulseProjectsPage } from './views/PulseProjectsPage';
import { PulseMemberProfilePage } from './views/PulseMemberProfilePage';
import { RegistryPage } from './views/RegistryPage';
import { PassportPage } from './views/PassportPage';
import { MethodologyPage } from './views/MethodologyPage';
import { AuditPage } from './views/AuditPage';

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

  // Pulse V1 Routes
  if (currentPath === '/members') {
    return <PulseMembersPage onNavigate={navigate} />;
  }

  if (currentPath === '/projects') {
    return <PulseProjectsPage onNavigate={navigate} />;
  }

  if (currentPath.startsWith('/member/')) {
    const username = currentPath.replace('/member/', '').split('/')[0];
    return <PulseMemberProfilePage username={username} onNavigate={navigate} />;
  }

  // Preserved Public Evidence & Registry Routes
  if (currentPath === '/registry') {
    return <RegistryPage onNavigate={navigate} initialTab="verified" />;
  }

  if (currentPath === '/registry/candidates') {
    return <RegistryPage onNavigate={navigate} initialTab="candidates" />;
  }

  if (currentPath === '/registry/audit') {
    return <AuditPage onNavigate={navigate} />;
  }

  if (currentPath === '/registry/methodology') {
    return <MethodologyPage onNavigate={navigate} />;
  }

  if (currentPath.startsWith('/passport/')) {
    const dliId = currentPath.replace('/passport/', '').split('/')[0];
    return <PassportPage dliId={dliId} onNavigate={navigate} />;
  }

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

  // Default to Community Dashboard (/)
  return <PulseDashboardPage onNavigate={navigate} />;
}

