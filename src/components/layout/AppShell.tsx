import React, { type ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="nexus-shell">
      <TopBar />
      <div className="nexus-body">
        <Sidebar />
        <main className="nexus-main">
          {children}
        </main>
      </div>
    </div>
  );
};
