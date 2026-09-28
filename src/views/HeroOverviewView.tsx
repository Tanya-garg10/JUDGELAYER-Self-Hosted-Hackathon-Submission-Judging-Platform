import React from 'react';
import { User, EventConfig, Project } from '../types';
import { 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Gavel, 
  Sliders, 
  Trophy, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Users, 
  Sparkles,
  Cpu,
  Activity,
  KeyRound,
  FileCheck
} from 'lucide-react';

interface HeroOverviewViewProps {
  currentUser: User;
  event: EventConfig | null;
  projects: Project[];
  onNavigate: (view: string) => void;
  onOpenTrustLayer: () => void;
  onOpenSubmitModal: () => void;
}

export const HeroOverviewView: React.FC<HeroOverviewViewProps> = ({
  currentUser,
  event,
  projects,
  onNavigate,
  onOpenTrustLayer,
  onOpenSubmitModal,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-[#E2E4E9] text-[11px] font-mono text-[#4B5563] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6E44FF] animate-pulse"></span>
            <span className="text-[#111318] font-bold">TRUST INFRASTRUCTURE</span>
            <span className="text-[#D1D5DB]">·</span>
            <span>ZERO CLOUD SECRETS</span>
            <span className="text-[#D1D5DB]">·</span>
            <span className="text-[#059669] font-medium">100% AUDITABLE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#111318] leading-[1.08] uppercase">
            The trust infrastructure<br />
            <span className="text-[#6E44FF]">behind hackathon judging.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto font-mono leading-relaxed">
            Submissions go in. Evidence gets reviewed. Scores stay isolated. Results remain auditable.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('judge')}
              className="px-6 py-2.5 rounded-lg bg-[#111318] hover:bg-[#2A2E37] text-white font-medium text-xs flex items-center space-x-2 shadow-sm transition-all font-mono"
            >
              <Gavel className="w-4 h-4 text-[#00C9DB]" />
              <span>Launch Case-Review Workstation</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] ml-1" />
            </button>

            <button
              onClick={() => onNavigate('gallery')}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-[#FAFBFD] text-[#111318] border border-[#E2E4E9] hover:border-[#6E44FF]/50 text-xs font-mono transition-all shadow-xs"
            >
              Explore Public Gallery ({projects.length})
            </button>

            <button
              onClick={onOpenTrustLayer}
              className="px-4 py-2.5 rounded-lg bg-[#6E44FF]/10 hover:bg-[#6E44FF]/15 text-[#6E44FF] border border-[#6E44FF]/30 text-xs font-mono flex items-center space-x-1.5 transition-all font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Inspect Security Core</span>
            </button>
          </div>
        </div>

        {/* Central TRUST CORE Diagram */}
        <div className="mt-12 max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-sm relative overflow-hidden bg-command-grid">
          <div className="flex items-center justify-between border-b border-[#E2E4E9] pb-4 mb-8">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[#111318] tracking-widest uppercase">
                CONTROLLED EVENT TOPOLOGY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                ACTIVE TOPOLOGY
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#6B7280]">
              CRYPTO-ISOLATED SIGNAL PATHS
            </div>
          </div>

          {/* Central Node Visual */}
          <div className="relative flex flex-col items-center">
            {/* Top Core */}
            <div className="z-10 p-5 rounded-2xl bg-[#111318] text-white border-2 border-[#6E44FF] shadow-lg text-center min-w-[200px] mb-8">
              <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono tracking-widest text-[#00C9DB] mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C9DB] animate-ping"></span>
                <span>CENTRAL SIGNAL ROUTER</span>
              </div>
              <div className="text-base font-black font-mono tracking-wider">TRUST CORE</div>
              <div className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">SECURITY SUPERVISOR</div>
            </div>

            {/* Connecting lines */}
            <div className="hidden sm:block absolute top-20 w-3/4 h-8 border-t-2 border-dashed border-[#CDD0D8]"></div>

            {/* 4 Controlled Zones */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-4 z-10">
              {/* Zone 1 */}
              <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] hover:border-[#6E44FF]/40 transition-all text-left space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
                  <span>ZONE 01</span>
                  <span className="text-[#059669]">● ONLINE</span>
                </div>
                <div className="font-bold text-sm text-[#111318] font-mono">PARTICIPANTS</div>
                <div className="text-2xl font-black font-mono text-[#111318]">10 Teams</div>
                <p className="text-[11px] text-[#6B7280] font-mono leading-relaxed">
                  Rosters, key credentials & team verification.
                </p>
              </div>

              {/* Zone 2 */}
              <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] hover:border-[#6E44FF]/40 transition-all text-left space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
                  <span>ZONE 02</span>
                  <span className="text-[#D97706]">● LOCKED</span>
                </div>
                <div className="font-bold text-sm text-[#111318] font-mono">SUBMISSIONS</div>
                <div className="text-2xl font-black font-mono text-[#111318]">{projects.length} Projects</div>
                <p className="text-[11px] text-[#6B7280] font-mono leading-relaxed">
                  Repository snapshots, live demos & immutable dossiers.
                </p>
              </div>

              {/* Zone 3 */}
              <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] hover:border-[#6E44FF]/40 transition-all text-left space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
                  <span>ZONE 03</span>
                  <span className="text-[#6E44FF]">● ISOLATED</span>
                </div>
                <div className="font-bold text-sm text-[#111318] font-mono">JUDGES</div>
                <div className="text-2xl font-black font-mono text-[#6E44FF]">3 Panels</div>
                <p className="text-[11px] text-[#6B7280] font-mono leading-relaxed">
                  Peer scores blocked (403), case-workstation active.
                </p>
              </div>

              {/* Zone 4 */}
              <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] hover:border-[#6E44FF]/40 transition-all text-left space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
                  <span>ZONE 04</span>
                  <span className="text-[#4B5563]">● AUDITED</span>
                </div>
                <div className="font-bold text-sm text-[#111318] font-mono">RESULTS</div>
                <div className="text-2xl font-black font-mono text-[#059669]">Z-Norm</div>
                <p className="text-[11px] text-[#6B7280] font-mono leading-relaxed">
                  Standardized calibration & cryptographic publication gate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Integrity Monitor & Signal Status */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Integrity Monitor Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E4E9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E4E9] pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#6E44FF]" />
              <span className="font-mono text-xs font-bold text-[#111318] uppercase tracking-wider">
                INTEGRITY MONITOR
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#059669] font-bold">100% OPERATIONAL</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <span className="text-[#4B5563]">ROLE ISOLATION:</span>
              <span className="text-[#059669] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ACTIVE (GATEWAY ENFORCED)</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <span className="text-[#4B5563]">PEER SCORE ACCESS:</span>
              <span className="text-[#059669] font-bold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>BLOCKED (HTTP 403 AUDITED)</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <span className="text-[#4B5563]">PARTICIPANT ACCESS:</span>
              <span className="text-[#059669] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PROTECTED (ZERO LEAKS)</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <span className="text-[#4B5563]">AUDIT TRAIL:</span>
              <span className="text-[#059669] font-bold flex items-center space-x-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>RECORDING (TAMPER-PROOF)</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <span className="text-[#4B5563]">EVENT STATUS:</span>
              <span className="text-[#6E44FF] font-bold">
                ● {event?.status ? event.status.toUpperCase() : 'OPEN'}
              </span>
            </div>
          </div>
        </div>

        {/* Event Scope & Competition Tracks Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E4E9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E4E9] pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#111318]" />
              <span className="font-mono text-xs font-bold text-[#111318] uppercase tracking-wider">
                COMPETITION TRACKS & SCOPE
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF5FF] text-[#6E44FF] font-bold border border-[#DDD6FE]">
              5 ACTIVE TRACKS
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="p-2 rounded bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <div>
                <span className="text-[#111318] font-bold">Developer Tools</span>
                <span className="block text-[10px] text-[#6B7280]">Compilers, runtimes, sandboxes & developer DX</span>
              </div>
              <span className="text-[10px] font-bold text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                4 Submissions
              </span>
            </div>

            <div className="p-2 rounded bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <div>
                <span className="text-[#111318] font-bold">AI & ML Infrastructure</span>
                <span className="block text-[10px] text-[#6B7280]">Model evaluation, edge inference & retrieval engines</span>
              </div>
              <span className="text-[10px] font-bold text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                2 Submissions
              </span>
            </div>

            <div className="p-2 rounded bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <div>
                <span className="text-[#111318] font-bold">Security & Identity</span>
                <span className="block text-[10px] text-[#6B7280]">Zero-knowledge systems, auth gateways & cryptosystems</span>
              </div>
              <span className="text-[10px] font-bold text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                2 Submissions
              </span>
            </div>

            <div className="p-2 rounded bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <div>
                <span className="text-[#111318] font-bold">Decentralized Systems</span>
                <span className="block text-[10px] text-[#6B7280]">Distributed consensus, P2P protocols & verifiable logs</span>
              </div>
              <span className="text-[10px] font-bold text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                2 Submissions
              </span>
            </div>

            <div className="p-2 rounded bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
              <div>
                <span className="text-[#111318] font-bold">Open Source & Community</span>
                <span className="block text-[10px] text-[#6B7280]">Ecosystem tools, documentation & accessibility</span>
              </div>
              <span className="text-[10px] font-bold text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                1 Submission
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
