import React from 'react';
import { NavigationProvider, useNavigation } from './context';
import { MascotGeneratorPage } from './views/MascotGeneratorPage';
import { MascotGalleryPage } from './views/MascotGalleryPage';
import { CyberErrorBoundary } from './components/common/CyberErrorBoundary';

const AppContent: React.FC = () => {
  const { currentView, targetHandle, navigateByUrl } = useNavigation();

  // 1. 12 Families × 36 Variants Gallery Route: /mascots
  if (currentView === 'mascot_gallery') {
    return (
      <CyberErrorBoundary fallbackTitle="Mascot Gallery Error">
        <MascotGalleryPage onNavigate={navigateByUrl} />
      </CyberErrorBoundary>
    );
  }

  // 2. Mascot Profile & Generator Landing Route: / and /mascot/:username
  return (
    <CyberErrorBoundary fallbackTitle="Mascot Studio Error">
      <MascotGeneratorPage
        key={targetHandle || 'home'}
        onNavigate={navigateByUrl}
        initialUsername={targetHandle || undefined}
      />
    </CyberErrorBoundary>
  );
};

export default function App(): React.JSX.Element {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}
