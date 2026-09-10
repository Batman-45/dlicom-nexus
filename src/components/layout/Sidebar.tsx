import React, { useEffect, useState } from 'react';
import { 
  Sparkles,
  Grid,
  Orbit,
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

interface NavEntry {
  id: AppView;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeClass?: string;
}

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

  const identityNavItems: NavEntry[] = [
    { id: 'mascot_generator', label: 'Mascot Studio', icon: <Sparkles size={17} /> },
    { id: 'mascot_gallery', label: 'Mascot Gallery', icon: <Grid size={17} />, badge: '36' },
    { id: 'circle', label: 'Circle Constellation', icon: <Orbit size={17} /> },
  ];

  const workflowNavItems: NavEntry[] = [
    { id: 'library', label: 'Pipeline Studio', icon: <Layers size={17} />, badge: pipelineCount },
    { id: 'builder', label: 'Pipeline Builder', icon: <GitFork size={17} /> },
    { id: 'connectors', label: 'Connector Catalog', icon: <Puzzle size={17} />, badge: '5 Native' },
    { 
      id: 'executions', 
      label: 'Execution Center', 
      icon: <Activity size={17} />, 
      badge: activeRunsCount > 0 ? `${activeRunsCount} Active` : undefined,
      badgeClass: activeRunsCount > 0 ? 'badge-running pulse-dot' : undefined
    }
  ];

  const renderNavGroup = (title: string, items: NavEntry[]) => (
    <div className="nav-section" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
      {sidebarExpanded && (
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-dim)',
          padding: '4px 12px',
          fontFamily: 'var(--font-mono)'
        }}>
          {title}
        </span>
      )}
      {items.map((item) => {
        const isActive = currentView === item.id || 
          (item.id === 'executions' && currentView === 'execution_detail') ||
          (item.id === 'library' && currentView === 'home');

        return (
          <div
            key={item.id}
            id={`sidebar-nav-${item.id}`}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigateTo(item.id)}
            title={item.label}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </span>
            {sidebarExpanded && (
              <>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span className={`nav-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside className={`nexus-sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
      <div className="nav-group" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
        {renderNavGroup('Identity & Social', identityNavItems)}
        <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 8px 12px' }} />
        {renderNavGroup('Workflows & Engine', workflowNavItems)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
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
            <span>Node: us-east-01 · Active</span>
          </div>
        )}

        <button 
          id="sidebar-toggle-btn"
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
