import React, { useState } from 'react';
import { Project, Track, User } from '../types';
import { 
  Search, 
  Github, 
  ExternalLink, 
  Layers, 
  Plus, 
  LayoutGrid, 
  List, 
  Eye, 
  CheckCircle2,
  Tag
} from 'lucide-react';

interface GalleryViewProps {
  projects: Project[];
  tracks: Track[];
  currentUser: User;
  onOpenSubmitModal: () => void;
  onSelectProject: (proj: Project) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  projects,
  tracks,
  currentUser,
  onOpenSubmitModal,
  onSelectProject,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inspectProject, setInspectProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase()) ||
      (p.team_name && p.team_name.toLowerCase().includes(search.toLowerCase()));

    const matchesTrack = selectedTrack === 'all' || p.track_id === selectedTrack;

    return matchesSearch && matchesTrack;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#6E44FF] uppercase tracking-wider font-bold">
            <Layers className="w-4 h-4" />
            <span>PUBLIC EVIDENCE REGISTRY · ZERO AUTHENTICATION REQUIRED</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111318] tracking-tight mt-1">
            Registered Submissions Roster
          </h2>
          <p className="text-xs text-[#6B7280] font-mono mt-0.5">
            Verified hackathon projects across 5 competition tracks.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="px-5 py-2.5 rounded-lg bg-[#111318] hover:bg-[#2A2E37] text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Project Evidence</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project title, team, or evidence..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318] placeholder:text-[#9CA3AF] shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedTrack('all')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
              selectedTrack === 'all'
                ? 'bg-[#111318] text-white font-bold'
                : 'bg-white text-[#6B7280] border border-[#E2E4E9] hover:text-[#111318]'
            }`}
          >
            All Tracks ({projects.length})
          </button>

          {tracks.map(t => {
            const count = projects.filter(p => p.track_id === t.id).length;
            const isSelected = selectedTrack === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#111318] text-white font-bold'
                    : 'bg-white text-[#6B7280] border border-[#E2E4E9] hover:text-[#111318]'
                }`}
              >
                {t.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Editorial Project Cards */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E2E4E9] space-y-2 font-mono">
          <p className="text-sm text-[#111318] font-bold">No matching project dossiers found</p>
          <p className="text-xs text-[#6B7280]">Try clearing search or selecting a different track.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const projectNumber = `#${String(index + 1).padStart(3, '0')}`;
            return (
              <div
                key={project.id}
                className="p-6 rounded-2xl bg-white border border-[#E2E4E9] hover:border-[#6E44FF]/60 transition-all flex flex-col justify-between space-y-5 shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[#E2E4E9] pb-3">
                    <span className="font-mono text-xs font-black text-[#6E44FF] tracking-wider">
                      {projectNumber}
                    </span>
                    {project.is_duplicate ? (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] font-bold">
                        DUPLICATE DRAFT
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-bold">
                        VERIFIED EVIDENCE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-[#111318] group-hover:text-[#6E44FF] transition-colors tracking-tight">
                      {project.title}
                    </h3>
                    <div className="text-xs font-mono text-[#6E44FF] mt-0.5 font-medium">
                      {project.track_name || project.track_id}
                    </div>
                  </div>

                  <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-3">
                    {project.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#E2E4E9] font-mono text-xs">
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span>Team: <strong className="text-[#111318] font-bold">{project.team_name || project.team_id}</strong></span>
                    <span className="text-[11px] text-[#059669]">{project.reviews_count || 0}/3 Reviews</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md bg-[#FAFBFD] border border-[#E2E4E9] text-[#4B5563] hover:text-[#111318] hover:border-[#6E44FF]"
                          title="Git Repository"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md bg-[#FAFBFD] border border-[#E2E4E9] text-[#4B5563] hover:text-[#059669] hover:border-[#059669]"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => setInspectProject(project)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FAFBFD] hover:bg-[#111318] text-[#111318] hover:text-white border border-[#E2E4E9] text-xs font-bold flex items-center space-x-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#6E44FF]" />
                      <span>View Dossier</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {inspectProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-white border border-[#E2E4E9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#FAFBFD] border-b border-[#E2E4E9] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#6E44FF] font-bold uppercase">CASE EVIDENCE DOSSIER</span>
                <h3 className="text-lg font-black text-[#111318]">{inspectProject.title}</h3>
                <div className="text-xs font-mono text-[#6B7280] mt-0.5">
                  Track: {inspectProject.track_name} · Team: {inspectProject.team_name}
                </div>
              </div>
              <button
                onClick={() => setInspectProject(null)}
                className="p-1 rounded text-[#9CA3AF] hover:text-[#111318] text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div>
                <div className="text-[10px] uppercase text-[#6B7280]">Pitch Summary</div>
                <p className="mt-1 text-[#111318] text-xs leading-relaxed font-sans">{inspectProject.summary}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-2">
                <div className="text-[10px] uppercase text-[#6B7280]">Technical Architecture Specifications</div>
                <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line">
                  {inspectProject.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9]">
                  <div className="text-[10px] uppercase text-[#6B7280]">Repository URL</div>
                  <a 
                    href={inspectProject.repo_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-[#6E44FF] hover:underline truncate block mt-1"
                  >
                    {inspectProject.repo_url || 'N/A'}
                  </a>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9]">
                  <div className="text-[10px] uppercase text-[#6B7280]">Live Demo</div>
                  <a 
                    href={inspectProject.demo_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-[#059669] hover:underline truncate block mt-1"
                  >
                    {inspectProject.demo_url || 'N/A'}
                  </a>
                </div>
              </div>

              {inspectProject.team_members && inspectProject.team_members.length > 0 && (
                <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] space-y-2">
                  <div className="text-[10px] uppercase text-[#6B7280]">Team Members</div>
                  <div className="space-y-1">
                    {inspectProject.team_members.map((m, i) => (
                      <div key={i} className="flex justify-between text-xs text-[#111318]">
                        <span className="font-semibold">{m.name}</span>
                        <span className="text-[#6B7280]">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-[#FAFBFD] border-t border-[#E2E4E9] flex justify-end font-mono">
              <button
                onClick={() => setInspectProject(null)}
                className="px-4 py-1.5 rounded-lg bg-[#111318] text-white text-xs hover:bg-[#2A2E37]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
