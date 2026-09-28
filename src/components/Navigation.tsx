import React, { useState } from 'react';
import { User, EventConfig } from '../types';
import { 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Gavel, 
  Sliders, 
  Trophy, 
  ScrollText, 
  Download, 
  Users, 
  Clock, 
  Search, 
  ChevronDown,
  CheckCircle2,
  Lock,
  Radio,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  onSwitchRole: (roleOrId: string) => void;
  event: EventConfig | null;
  onOpenTrustLayer: () => void;
  onOpenCommandPalette: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onSwitchRole,
  event,
  onOpenTrustLayer,
  onOpenCommandPalette,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Terminal },
    { id: 'gallery', label: 'Projects', icon: Layers, badge: 'Public' },
    { id: 'participant', label: 'Submissions', icon: Users },
    { id: 'judge', label: 'Judging', icon: Gavel, badge: currentUser.role === 'judge' ? 'Active' : undefined },
    { id: 'organizer', label: 'Event Control', icon: Sliders },
    { id: 'results', label: 'Results', icon: Trophy, badge: event?.results_published ? 'Published' : 'Locked' },
    { id: 'audit', label: 'Audit Log', icon: ScrollText },
    { id: 'export', label: 'Exports', icon: Download },
  ];

  const personas = [
    { id: 'user_organizer', label: 'Elena Rostova', role: 'organizer', badge: 'ORGANIZER', desc: 'Event Director & Lead Auditor' },
    { id: 'user_judge_a', label: 'Ada Okonkwo', role: 'judge', badge: 'JUDGE A', desc: 'Principal Systems Architect (MIT)' },
    { id: 'user_judge_b', label: 'Marcus Chen', role: 'judge', badge: 'JUDGE B', desc: 'Staff Platform Engineer (InfraDev)' },
    { id: 'user_judge_c', label: 'Dr. Aris Thorne', role: 'judge', badge: 'JUDGE C', desc: 'Consensus Lead (Bias Sim)' },
    { id: 'user_participant', label: 'Tanya Garg', role: 'participant', badge: 'PARTICIPANT', desc: 'Team Nightshift Lead' },
    { id: 'visitor', label: 'Anonymous Visitor', role: 'visitor', badge: 'PUBLIC', desc: 'Unauthenticated Public Guest' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E4E9]">
      {/* Top Precision Command Bar */}
      <div className="px-4 sm:px-6 py-1.5 bg-[#FAFBFD] border-b border-[#E2E4E9]/70 text-xs text-[#6B7280] flex items-center justify-between font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-black text-[#111318] tracking-widest text-[11px]">JUDGELAYER</span>
            <span className="text-[#D1D5DB]">·</span>
            <span className="text-[11px] text-[#4B5563] font-medium tracking-wide">TRUST COMMAND CENTER</span>
          </div>
          <span className="text-[#D1D5DB]">·</span>
          <span className="inline-flex items-center text-[#059669] text-[11px] font-semibold bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse mr-1.5"></span>
            SYSTEM SECURE
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {event?.is_deadline_passed ? (
            <span className="hidden sm:inline-flex items-center text-[#D97706] text-[11px] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
              <Lock className="w-3 h-3 mr-1 text-[#D97706]" />
              DEADLINE LOCKED (01 MAR 18:00 UTC)
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center text-[#059669] text-[11px] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
              <Clock className="w-3 h-3 mr-1 text-[#059669]" />
              SUBMISSION WINDOW OPEN
            </span>
          )}

          <button
            onClick={onOpenTrustLayer}
            className="flex items-center space-x-1.5 text-xs px-2.5 py-0.5 rounded-md bg-[#6E44FF]/10 hover:bg-[#6E44FF]/15 text-[#6E44FF] border border-[#6E44FF]/30 transition-all font-medium font-mono"
            title="Inspect Trust Core Security & Role Isolation"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#6E44FF]" />
            <span className="font-semibold text-[11px] tracking-wide">TRUST CORE: ACTIVE</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand & Navigation Items */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => onNavigate('overview')}
            className="flex items-center space-x-2.5 text-left group focus:outline-none"
          >
            <div className="w-7 h-7 rounded bg-[#111318] flex items-center justify-center font-mono font-black text-white text-xs shadow-sm">
              JL
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#111318] group-hover:text-[#6E44FF] transition-colors">
                JUDGELAYER
              </span>
              <span className="hidden sm:block text-[9px] uppercase font-mono tracking-widest text-[#6B7280]">
                TRUST COMMAND CENTER
              </span>
            </div>
          </button>

          {/* Nav Pills */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-[#111318] text-white shadow-sm font-semibold' 
                      : 'text-[#4B5563] hover:text-[#111318] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00C9DB]' : 'text-[#6B7280]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badge === 'Active' || item.badge === 'Published'
                        ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search & Role Persona Switcher */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-2 text-xs text-[#6B7280] hover:text-[#111318] bg-white border border-[#E2E4E9] hover:border-[#6E44FF]/50 px-3 py-1.5 rounded-md transition-all font-mono shadow-xs"
            title="Search projects, judges & routes (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="hidden sm:inline">Search console...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#F3F4F6] border border-[#E2E4E9] text-[10px] text-[#6B7280]">⌘K</kbd>
          </button>

          {/* Interactive Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all bg-white hover:bg-[#FAFBFD] border-[#E2E4E9] text-[#111318] shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#6E44FF]"></span>
              <span className="font-semibold text-xs">{currentUser.name}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#4B5563]">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </button>

            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white border border-[#E2E4E9] rounded-xl shadow-xl py-2 z-50 divide-y divide-[#E2E4E9]"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider text-[#6B7280] flex items-center justify-between bg-[#F8F9FA]">
                  <span>Fast Persona Switcher</span>
                  <span className="text-[9px] text-[#6E44FF] font-semibold">ROLE SELECTOR</span>
                </div>

                <div className="py-1">
                  {personas.map(p => {
                    const isSelected = (currentUser.id === p.id) || (currentUser.role === 'visitor' && p.id === 'visitor');
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSwitchRole(p.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F3F4F6] transition-colors ${
                          isSelected ? 'bg-[#F0F2F5] text-[#111318] font-semibold' : 'text-[#4B5563]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#111318]">{p.label}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E5E7EB] text-[#374151]">
                              {p.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6B7280] font-mono mt-0.5">{p.desc}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#059669]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 text-[10px] font-mono text-[#6B7280] bg-[#FAFBFD]">
                  Enforces genuine backend session tokens & boundary isolation.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
