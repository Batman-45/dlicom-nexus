import React from 'react';
import { NavigationProvider, useNavigation } from './context';
import { MascotGeneratorPage } from './views/MascotGeneratorPage';
import { MascotGalleryPage } from './views/MascotGalleryPage';
import { AppShell } from './components/layout/AppShell';
import { PipelineLibrary } from './components/views/PipelineLibrary';
import { PipelineBuilder } from './components/views/PipelineBuilder/PipelineBuilder';
import { ConnectorCatalog } from './components/views/ConnectorCatalog';
import { ExecutionCenter } from './components/views/ExecutionCenter';
import { ExecutionDetail } from './components/views/ExecutionDetail';
import { NexusHome } from './components/views/NexusHome';
import { CyberErrorBoundary } from './components/common/CyberErrorBoundary';

const CirclePage = React.lazy(() =>
  import('./views/CirclePage').then((m) => ({ default: m.CirclePage }))
);

const AppContent: React.FC = () => {
  const { currentView, selectedExecutionId, targetHandle, navigateByUrl } = useNavigation();

  // 1. Preserved X Circle Route: /circle and /circle/:handle
  if (currentView === 'circle') {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#07050f] text-slate-100 flex items-center justify-center p-8">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CirclePage onNavigate={navigateByUrl} initialHandle={targetHandle || undefined} />
      </React.Suspense>
    );
  }

  // 2. 12 Families × 36 Variants Gallery Route: /mascots
  if (currentView === 'mascot_gallery') {
    return <MascotGalleryPage onNavigate={navigateByUrl} />;
  }

  // 3. Mascot Profile & Generator Landing Route: / and /mascot/:username
  if (currentView === 'mascot_generator') {
    return (
      <MascotGeneratorPage
        key={targetHandle || 'home'}
        onNavigate={navigateByUrl}
        initialUsername={targetHandle || undefined}
      />
    );
  }

  // 4. Workflow Orchestration Subsystems inside Unified AppShell
  return (
    <AppShell>
      <CyberErrorBoundary fallbackTitle="Orchestration View Error">
        {currentView === 'builder' && <PipelineBuilder />}
        {currentView === 'library' && <PipelineLibrary />}
        {currentView === 'connectors' && <ConnectorCatalog />}
        {currentView === 'executions' && <ExecutionCenter />}
        {currentView === 'execution_detail' && <ExecutionDetail executionId={selectedExecutionId} />}
        {currentView === 'home' && <NexusHome />}
      </CyberErrorBoundary>
    </AppShell>
  );
};

export default function App(): React.JSX.Element {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}
