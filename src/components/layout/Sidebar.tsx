import React, { useEffect, useState } from 'react';
import { 
  Home, 
  GitFork, 
  Layers, 
  Puzzle, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigation, type AppView } from '../../context';
import { globalPipelineStore } from '../../core/store/pipelineStore';
import { globalExecutionStore } from '../../core/store/executionStore';

export const Sidebar: React.FC = () => {
  const { currentView, sidebarExpanded, navigateTo, toggleSidebar } = useNavigation();
  const [pipelineCount, setPipelineCount] = useState<number>(globalPipelineStore.getAllPipelines().length);
  const [activeRunsCount, setActiveRunsCount] = useState<number>(0);

  useEffect(() => {
    const unsubPipeline = globalPipelineStore.subscribe(() => {
      setPipelineCount(globalPipelineStore.getAllPipelines().length);
    });

    const unsubExec = globalExecutionStore.subscribe(() => {
      const active = globalExecutionStore.getRuns().filter(r => r.status === 'running').length;
      setActiveRunsCount(active);
    });

    return () => {
      unsubPipeline();
      unsubExec();
    };
  }, []);

  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'home', label: 'Nexus Home', icon: <Home size={18} /> },
    { id: 'builder', label: 'Pipeline Builder', icon: <GitFork size={18} /> },
    { id: 'library', label: 'Pipeline Library', icon: <Layers size={18} />, badge: pipelineCount },
    { id: 'connectors', label: 'Connector Catalog', icon: <Puzzle size={18} />, badge: '5 Native' },
    { id: 'executions', label: 'Execution Center', icon: <Activity size={18} />, badge: activeRunsCount > 0 ? `${activeRunsCount} Active` : undefined }
  ];

  return (
    <aside className={`nexus-sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
      <div className="nav-group">
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'executions' && currentView === 'execution_detail');
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
              title={item.label}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
              {sidebarExpanded && (
                <>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sidebarExpanded && (
          <div style={{
            padding: '10px',
            backgroundColor: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-dim)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-emerald)', fontWeight: 600, marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              <span>Dlicom Mesh Secure</span>
            </div>
            <span>Node: us-east-01</span>
          </div>
        )}

        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          title={sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
};
