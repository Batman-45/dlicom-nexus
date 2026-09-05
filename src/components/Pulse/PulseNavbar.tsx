import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  ShieldCheck,
  Database,
  BookOpen,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { DlicomLogo } from '../DlicomLogo/DlicomLogo';

interface PulseNavbarProps {
  currentPath: string;
  onNavigate: (route: string) => void;
  verifiedCount?: number;
  totalCount?: number;
}

export const PulseNavbar: React.FC<PulseNavbarProps> = ({
  currentPath,
  onNavigate,
  verifiedCount = 11,
  totalCount = 13,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/projects', label: 'Projects', icon: FolderGit2 },
    { path: '/registry', label: 'Registry', icon: ShieldCheck },
    { path: '/registry/audit', label: 'Audit Log', icon: Database },
    { path: '/registry/methodology', label: 'Methodology', icon: BookOpen },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchVal.trim().replace(/^@+/, '');
    if (clean) {
      onNavigate(`/member/${clean}`);
      setSearchVal('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080613]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <DlicomLogo size={24} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-sm tracking-tight text-white">
                  Dlicom
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 font-display font-extrabold text-sm">
                  Pulse
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 -mt-0.5">
                Community Intelligence & Contributions
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-sm shadow-purple-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Search & Evidence Badge */}
        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search member or DLI-ID..."
              className="w-48 lg:w-64 px-3 py-1.5 pl-8 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Verification Status Pill */}
          <div
            onClick={() => onNavigate('/registry')}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono cursor-pointer hover:bg-emerald-500/15 transition-colors"
            title="Sourced strictly from official dlicom.io, Hacken audits, and Base smart contracts"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              <strong className="text-white">{verifiedCount}</strong> Verified / {totalCount} Members
            </span>
          </div>

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Links Row */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 px-2 py-1.5 overflow-x-auto bg-[#06040f]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 shrink-0 ${
                isActive
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile search drop */}
      {searchOpen && (
        <form
          onSubmit={handleSearchSubmit}
          className="sm:hidden border-t border-white/10 p-3 bg-[#0a0818]"
        >
          <div className="relative">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search member handle (e.g. mohammadqadriah)..."
              autoFocus
              className="w-full px-3 py-2 pl-9 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </form>
      )}
    </header>
  );
};
