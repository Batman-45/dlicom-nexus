import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  ShieldCheck,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { PulseNavbar } from '../components/Pulse/PulseNavbar';
import { ClaimBadge } from '../components/Pulse/ClaimBadge';
import { PulseService } from '../services/pulse/pulseService';

interface PulseProjectsPageProps {
  onNavigate: (route: string) => void;
}

export const PulseProjectsPage: React.FC<PulseProjectsPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const projects = useMemo(() => PulseService.getInstance().getProjects(), []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.leadHandles.some((h) => h.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesStat = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStat;
    });
  }, [projects, searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      <PulseNavbar currentPath="/projects" onNavigate={onNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Dlicom Project & Protocol Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ecosystem Projects & Smart Contracts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Production subsystems, audited Base smart contracts, and active initiatives driving the Dlicom SocialFi
              protocol. Verified via public repo, Hacken audit, and whitepaper records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-300 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hacken Audit Report</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, description, or lead handle..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0e0c1f]">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#0e0c1f]">{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <span className="text-[10px] font-mono text-slate-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0e0c1f]">All Statuses</option>
                <option value="PRODUCTION" className="bg-[#0e0c1f]">PRODUCTION</option>
                <option value="AUDITED" className="bg-[#0e0c1f]">AUDITED</option>
                <option value="ACTIVE_DEV" className="bg-[#0e0c1f]">ACTIVE DEV</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-3xl bg-[#0e0c1f] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-6"
            >
              {/* Top Meta */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                      {project.category.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      project.status === 'AUDITED'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : project.status === 'PRODUCTION'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <ClaimBadge status={project.claimStatus} size="sm" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-xs text-purple-300 font-mono mt-0.5">
                    {project.tagline}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {project.description}
                </p>

                {/* Evidence Note */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
                  <span className="font-mono text-cyan-400 font-semibold uppercase text-[10px]">
                    Public Evidence:
                  </span>
                  <p>{project.evidenceSummary}</p>
                </div>
              </div>

              {/* Bottom: Team Leads & Links */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Leads */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">Leads:</span>
                    <div className="flex items-center gap-1.5">
                      {project.leadHandles.map((handle) => (
                        <button
                          key={handle}
                          onClick={() => onNavigate(`/member/${handle}`)}
                          className="px-2 py-0.5 rounded-md bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-[10px] font-mono transition-colors cursor-pointer"
                        >
                          @{handle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="text-[10px] font-mono text-slate-400">
                    <strong className="text-white">{project.metrics.contributorsCount}</strong> contributors ·{' '}
                    <strong className="text-white">{project.metrics.verifiedContributionsCount}</strong> verified tasks
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  {project.auditUrl && (
                    <a
                      href={project.auditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audit Report</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}

                  <a
                    href={project.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Official Source</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
