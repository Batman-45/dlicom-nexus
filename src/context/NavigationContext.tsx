import React, { useState, type ReactNode } from 'react';
import { NavigationContext, type AppView } from './navigation-context-definition';

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);

  const navigateTo = (view: AppView, params?: { executionId?: string; pipelineId?: string }) => {
    if (params?.executionId) {
      setSelectedExecutionId(params.executionId);
    }
    setCurrentView(view);
  };

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        selectedExecutionId,
        sidebarExpanded,
        navigateTo,
        toggleSidebar
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
