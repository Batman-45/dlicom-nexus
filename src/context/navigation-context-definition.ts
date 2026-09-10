import { createContext } from 'react';

export type AppView = 
  | 'mascot_generator'
  | 'mascot_gallery'
  | 'circle'
  | 'home'
  | 'builder'
  | 'library'
  | 'connectors'
  | 'executions'
  | 'execution_detail';

export interface NavigationContextValue {
  currentView: AppView;
  selectedExecutionId: string | null;
  selectedPipelineId: string | null;
  targetHandle: string | null;
  sidebarExpanded: boolean;
  navigateTo: (view: AppView, params?: { executionId?: string; pipelineId?: string; handle?: string }) => void;
  navigateByUrl: (url: string) => void;
  toggleSidebar: () => void;
}

export const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);
