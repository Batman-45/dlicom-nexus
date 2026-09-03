import { useContext } from 'react';
import { NavigationContext, type NavigationContextValue } from './navigation-context-definition';

export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
