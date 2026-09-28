import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { Search, Gavel, Layers, Sliders, Trophy, Shield, Users, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onNavigate: (view: string) => void;
  onSelectProject: (proj: Project) => void;
  onSwitchRole: (roleOrId: string) => void;
  onOpenTrustLayer: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  onNavigate,
  onSelectProject,
  onSwitchRole,
  onOpenTrustLayer,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: 'Public Project Gallery', view: 'gallery', icon: Layers },
    { label: 'Judge Case-Review Workstation', view: 'judge', icon: Gavel },
    { label: 'Event Mission Control', view: 'organizer', icon: Sliders },
    { label: 'Results & Normalization Proof', view: 'results', icon: Trophy },
    { label: 'Participant Submission Workspace', view: 'participant', icon: Users },
    { label: 'Trust Core Security Blueprint', action: () => { onClose(); onOpenTrustLayer(); }, icon: Shield },
  ];

  const personas = [
    { id: 'user_organizer', label: 'Elena Rostova (Lead Organizer)' },
    { id: 'user_judge_a', label: 'Ada Okonkwo (Judge A · MIT)' },
    { id: 'user_judge_b', label: 'Marcus Chen (Judge B · InfraDev)' },
    { id: 'user_judge_c', label: 'Dr. Aris Thorne (Judge C · Consensus)' },
    { id: 'user_participant', label: 'Tanya Garg (Participant · Nightshift)' },
    { id: 'visitor', label: 'Anonymous Public Guest' },
  ];

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    (p.track_name && p.track_name.toLowerCase().includes(query.toLowerCase())) ||
    (p.team_name && p.team_name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white border border-[#E2E4E9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3.5 border-b border-[#E2E4E9] flex items-center space-x-2.5">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a case, project title, or persona..."
            className="w-full bg-transparent text-xs text-[#111318] placeholder:text-[#9CA3AF] focus:outline-none font-mono"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#FAFBFD] border border-[#E2E4E9] text-[10px] text-[#6B7280]">ESC</kbd>
        </div>

        <div className="p-2 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Projects matched */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#6B7280]">
                Cases & Projects ({filteredProjects.length})
              </div>
              <div className="space-y-0.5">
                {filteredProjects.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAFBFD] flex items-center justify-between text-[#111318] font-medium transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs">{p.title}</div>
                      <div className="text-[10px] text-[#6E44FF]">{p.track_name} · {p.team_name}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#6B7280]">
              Command Navigation
            </div>
            <div className="space-y-0.5">
              {quickNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.action) item.action();
                      else if (item.view) {
                        onNavigate(item.view);
                        onClose();
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAFBFD] flex items-center justify-between text-[#4B5563] hover:text-[#111318] transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-3.5 h-3.5 text-[#6E44FF]" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persona quick switch */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#6B7280]">
              Switch Persona (Instant Auth)
            </div>
            <div className="space-y-0.5">
              {personas.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSwitchRole(p.id);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#FAFBFD] text-[11px] text-[#4B5563] hover:text-[#111318] flex items-center justify-between transition-colors"
                >
                  <span>{p.label}</span>
                  <span className="text-[9px] text-[#6E44FF] font-bold">SWITCH</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
