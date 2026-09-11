import { createContext } from 'react';

export type AppView = 
  | 'mascot_generator'
  | 'mascot_gallery';

export interface NavigationContextValue {
  currentView: AppView;
  targetHandle: string | null;
  navigateTo: (view: AppView, params?: { handle?: string }) => void;
  navigateByUrl: (url: string) => void;
}

export const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);
