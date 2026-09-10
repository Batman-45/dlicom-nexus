import React, { useState, useMemo } from 'react';
import { Sparkles, Search, Filter, ArrowRight, Shield, Terminal, Cpu, Users, BookOpen, Palette, Compass, DollarSign, Lock, Gamepad2, Brain, Vote } from 'lucide-react';
import { MascotNavbar } from '../components/Mascot/MascotNavbar';
import { MASCOT_FAMILY_REGISTRY } from '../services/mascot/mascotEngine';
import type { MascotFamilyId } from '../types/mascot';
import '../components/Mascot/mascot.css';

interface MascotGalleryPageProps {
  onNavigate: (path: string) => void;
}

const FAMILY_ICONS: Record<MascotFamilyId, React.ReactNode> = {
  PROTOCOL_CORE: <Terminal className="w-4 h-4 text-sky-400" />,
  AEGIS_DEFENSE: <Shield className="w-4 h-4 text-emerald-400" />,
  SYSTEM_FOUNDRY: <Cpu className="w-4 h-4 text-amber-400" />,
  NEXUS_SYNDICATE: <Users className="w-4 h-4 text-rose-400" />,
  CHRONO_RESEARCH: <BookOpen className="w-4 h-4 text-cyan-400" />,
  CREATIVE_STUDIO: <Palette className="w-4 h-4 text-fuchsia-400" />,
  FRONTIER_EXPEDITION: <Compass className="w-4 h-4 text-indigo-400" />,
  DEFI_QUANT: <DollarSign className="w-4 h-4 text-yellow-400" />,
  ZERO_KNOWLEDGE: <Lock className="w-4 h-4 text-purple-400" />,
  GAMEFI_ARCADE: <Gamepad2 className="w-4 h-4 text-pink-400" />,
  AI_SYNTHESIS: <Brain className="w-4 h-4 text-violet-400" />,
  DAO_GOVERNANCE: <Vote className="w-4 h-4 text-amber-300" />,
};

export const MascotGalleryPage: React.FC<MascotGalleryPageProps> = ({ onNavigate }) => {
  const [selectedFamily, setSelectedFamily] = useState<string>('ALL');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const families = useMemo(() => Object.values(MASCOT_FAMILY_REGISTRY), []);

  const archetypes = useMemo(() => {
    const set = new Set<string>();
    families.forEach((f) => set.add(f.archetype));
    return Array.from(set);
  }, [families]);

  // Filtered families & variants
  const filteredFamilies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return families
      .filter((family) => {
        if (
          selectedFamily !== 'ALL' &&
          family.familyId !== selectedFamily &&
          family.familyName.toLowerCase() !== selectedFamily.toLowerCase()
        ) {
          return false;
        }
        if (
          selectedArchetype !== 'ALL' &&
          family.archetype !== selectedArchetype &&
          family.archetype.replace('_', ' ').toLowerCase() !== selectedArchetype.toLowerCase()
        ) {
          return false;
        }
        return true;
      })
      .map((family) => {
        if (!query) return family;

        const matchingVariants = family.variants.filter((v) => {
          return (
            v.variantName.toLowerCase().includes(query) ||
            v.variantBadge.toLowerCase().includes(query) ||
            family.familyName.toLowerCase().includes(query) ||
            family.archetype.toLowerCase().includes(query)
          );
        });

        // If family matches search or any variant matches, keep it
        const familyMatches =
          family.familyName.toLowerCase().includes(query) ||
          family.archetype.toLowerCase().includes(query);

        return {
          ...family,
          variants: familyMatches ? family.variants : matchingVariants,
        };
      })
      .filter((f) => f.variants.length > 0);
  }, [families, selectedFamily, selectedArchetype, searchQuery]);

  const totalVariantsCount = useMemo(() => {
    return filteredFamilies.reduce((sum, f) => sum + f.variants.length, 0);
  }, [filteredFamilies]);

  return (
    <div className="min-h-screen bg-[#070510] text-slate-100 flex flex-col selection:bg-purple-500/30 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="mascot-page-atmosphere">
        <div className="mascot-bg-glow-orb-1" />
        <div className="mascot-bg-glow-orb-2" />
      </div>

      <MascotNavbar onNavigate={onNavigate} currentPath="/mascots" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="mascot-pill-badge mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Dlicom Mascot Library</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            12 Families <span className="text-slate-600 font-light">×</span> 36 Distinct Variants
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Every variant shares the canonical Dlicom mascot character identity while expressing unique Web3 roles, equipment, poses, and environmental auras.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="gallery-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search variants, families, or roles..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            {/* Family filter select */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                id="gallery-family-filter"
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
              >
                <option value="ALL">All Families (12)</option>
                {families.map((f) => (
                  <option key={f.familyId} value={f.familyId}>
                    {f.familyName}
                  </option>
                ))}
              </select>

              {/* Archetype filter select */}
              <select
                id="gallery-archetype-filter"
                value={selectedArchetype}
                onChange={(e) => setSelectedArchetype(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
              >
                <option value="ALL">All Archetypes</option>
                {archetypes.map((arch) => (
                  <option key={arch} value={arch}>
                    {arch.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status count */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-white/5">
            <span>
              Showing <strong className="text-purple-300">{totalVariantsCount}</strong> of 36 variants across{' '}
              <strong className="text-purple-300">{filteredFamilies.length}</strong> families
            </span>
            {(selectedFamily !== 'ALL' || selectedArchetype !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFamily('ALL');
                  setSelectedArchetype('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Gallery Families Structure: Family -> 3 Variants */}
        <div className="space-y-12">
          {filteredFamilies.map((family) => (
            <section
              key={family.familyId}
              id={`family-${family.familyId}`}
              className="space-y-5 p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm"
            >
              {/* Family Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-black/50 border border-white/10">
                      {FAMILY_ICONS[family.familyId]}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {family.familyName}
                    </h2>
                    <span
                      className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                      style={{
                        color: family.colorTheme.text,
                        backgroundColor: family.colorTheme.badgeBg,
                        borderColor: family.colorTheme.border,
                      }}
                    >
                      {family.archetype.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 italic">
                    &ldquo;{family.familyMotto}&rdquo;
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="flex items-center gap-1.5 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors self-start sm:self-center cursor-pointer"
                >
                  <span>Synthesize Mascot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Distinct Variants Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {family.variants.map((variant, idx) => (
                  <div
                    key={variant.variantId}
                    className="mascot-gallery-card group relative rounded-2xl bg-black/40 border border-white/10 overflow-hidden hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top ambient glow */}
                    <div
                      className="absolute top-0 left-0 right-0 h-32 opacity-20 blur-2xl pointer-events-none group-hover:opacity-40 transition-opacity"
                      style={{ backgroundColor: family.colorTheme.primary }}
                    />

                    {/* Image Stage */}
                    <div className="relative aspect-square w-full bg-[#05030a] overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={variant.characterImage}
                        alt={`${family.familyName} - ${variant.variantName}`}
                        loading="lazy"
                        className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Variant Index Badge */}
                      <span className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/70 border border-white/10 text-slate-300 backdrop-blur-md">
                        Variant 0{idx + 1}
                      </span>
                    </div>

                    {/* Card Meta Content */}
                    <div className="p-4 sm:p-5 space-y-2 relative z-10 bg-black/60 border-t border-white/5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                          <span className="mascot-card-family">{family.familyName}</span>
                          <span
                            className="mascot-card-archetype font-semibold tracking-widest uppercase"
                            style={{ color: family.colorTheme.accent }}
                          >
                            {family.archetype.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-purple-300 transition-colors">
                          {variant.variantName}
                        </h3>
                      </div>

                      {/* Equipment / Role Object */}
                      {variant.equipment && (
                        <div className="text-[11px] text-slate-300 font-mono bg-white/[0.03] p-2 rounded-lg border border-white/5 line-clamp-2">
                          <span className="text-slate-500">Gear: </span>
                          {variant.equipment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {filteredFamilies.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <p className="text-slate-400 text-base">No mascot variants matched your query.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFamily('ALL');
                  setSelectedArchetype('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-medium cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
