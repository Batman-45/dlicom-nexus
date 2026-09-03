import { createContext } from 'react';

export type AppView = 
  | 'home'
  | 'builder'
  | 'library'
  | 'connectors'
  | 'executions'
  | 'execution_detail';

export interface NavigationContextValue {
  currentView: AppView;
  selectedExecutionId: string | null;
  sidebarExpanded: boolean;
  navigateTo: (view: AppView, params?: { executionId?: string; pipelineId?: string }) => void;
  toggleSidebar: () => void;
}

export const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);
