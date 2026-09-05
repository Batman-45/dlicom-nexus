import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Layers
} from 'lucide-react';

interface MethodologyPageProps {
  onNavigate: (route: string) => void;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ onNavigate }) => {
  const principles = [
    {
      num: '01',
      title: 'X Is Only the Input',
      desc: 'The user provides only their public X @handle. Public X data is used strictly to discover observable public interactions (replies, mentions, quotes), not to guess or invent community standing.',
    },
    {
      num: '02',
      title: 'Public Evidence Only',
      desc: 'Identities enter the registry exclusively through publicly observable, audited official sources. No private backdoors, zero authenticated GraphQL endpoints, zero paid X APIs, zero X Bearer tokens.',
    },
    {
      num: '03',
      title: 'Official Sources Have Highest Authority',
      desc: 'Authoritative evidence must originate from official Dlicom properties (dlicom.io, whitepaper.dlicom.io). Official Dlicom websites carry Level 5 hierarchical authority over secondary citations.',
    },
    {
      num: '04',
      title: 'X Interaction Does NOT Prove Dlicom Membership',
      desc: 'Interacting with @DlicomApp or core members is purely evidence of public communication, NOT evidence of community role. An account must be independently backed by official Dlicom public evidence.',
    },
    {
      num: '05',
      title: 'X Bio Claims Do NOT Prove Membership',
      desc: 'Biographies claiming Dlicom affiliation are classified strictly as unverified candidates until backed by official Dlicom-controlled evidence. Bio claims alone cannot grant verified status.',
    },
    {
      num: '06',
      title: 'Discord-Only Roles Cannot Currently Be Verified',
      desc: 'Some Dlicom community roles exist only inside private Discord environments. Because this registry does not use Discord credentials or private scraping, those identities cannot currently be independently verified.',
    },
    {
      num: '07',
      title: 'Missing X Handles Are Never Guessed',
      desc: 'If an official team member or leader is listed by name on dlicom.io without a linked X handle, the handle is NEVER guessed, approximated, or manufactured. Only verified handles enter.',
    },
    {
      num: '08',
      title: 'Candidates & External Accounts Never Enter Circle',
      desc: 'The personal Circle strictly enforces: Circle Nodes = Observable Public X Interactions ∩ Verified Dlicom Community Registry. Candidates and external accounts are categorically excluded from Circle.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0816]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/registry')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Return to Public Registry"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Registry Methodology & Standards
            </h1>
          </div>

          <button
            onClick={() => onNavigate('/registry')}
            className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors"
          >
            Public Registry
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Intro Hero */}
        <section className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Evidence-First Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Transparent Verification Methodology
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-sans">
            Dlicom Circle prioritizes <span className="font-semibold text-white">accuracy over vanity metrics</span>. 
            A smaller verified registry supported by public Dlicom-controlled evidence is far better than an inflated registry containing guesses.
          </p>
        </section>

        {/* 8 Core Principles Grid */}
        <section className="space-y-4 mb-12">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Core Invariants & Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {principles.map((p) => (
              <div
                key={p.num}
                className="p-5 rounded-2xl bg-[#0e0c1f] border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold mb-1 block">
                    {p.num}
                  </span>
                  <h4 className="text-sm font-semibold text-white mb-2">{p.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Friend Evidence Layer Standards */}
        <section className="mb-12 p-6 rounded-3xl bg-purple-950/30 border border-purple-500/30">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">
                Dlicom Community Friend Evidence Layer (COMMUNITY_FRIEND)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To discover genuine community participants without inflating membership claims, Dlicom Circle defines a separate <strong className="text-purple-300">COMMUNITY_FRIEND</strong> classification. This classification recognizes verified community builders, contributors, and active participants, distinct from official staff or leadership.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-purple-300 font-bold block mb-1">Promotion Rule 1: Independent Signals</span>
                  <span className="text-slate-300">At least 2 independent public Dlicom-related evidence signals required.</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-cyan-300 font-bold block mb-1">Promotion Rule 2: Participation Level</span>
                  <span className="text-slate-300">At least 1 meaningful participation signal (Authority Level &ge; 2) required.</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-emerald-300 font-bold block mb-1">Anti-Inflation Rule: No Score Bypass</span>
                  <span className="text-slate-300">A numerical score alone never promotes. Weak signals (bio claim, single like) cannot bypass rules.</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-amber-300 font-bold block mb-1">Staff Distinction Rule</span>
                  <span className="text-slate-300">Community Friends are never displayed as Core Team, Regional Leads, or Managers.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explicit Disclosure on Private Discord Limitation */}
        <section className="mb-12 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/25">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">
                Explicit Limitation Regarding Private Discord Roles
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Some Dlicom community roles exist only inside private Discord environments (such as Dliever, Dcoded, DCO, Regional Helpers, and MODs). Because this registry does not use Discord credentials or private scraping, those identities cannot currently be independently verified.
              </p>
              <p className="text-xs text-amber-200/90 font-mono bg-black/40 p-3 rounded-xl border border-amber-500/20">
                "Private Discord roles cannot be treated as publicly verified unless Dlicom provides an authorized public source, verifiable on-chain credential, or public roster."
              </p>
            </div>
          </div>
        </section>

        {/* How an Identity Can Become Publicly Verifiable */}
        <section className="p-6 rounded-3xl bg-[#0e0c1f] border border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">
                How an Identity Can Become Publicly Verifiable
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                An identity moves from candidate or external status into the Verified Dlicom Community Registry when it appears in:
              </p>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong className="text-white">Official Dlicom team / community roster</strong>: Published on dlicom.io or dlicom.me.</li>
                <li><strong className="text-white">Official Dlicom-controlled public page</strong>: Including whitepaper.dlicom.io or official documentation.</li>
                <li><strong className="text-white">Official Dlicom public announcement</strong>: An announcement from @DlicomApp explicitly linking and acknowledging the X handle.</li>
                <li><strong className="text-white">Cryptographic or on-chain attestation</strong>: Public sovereign badges or smart contracts deployed by Dlicom on Base.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
