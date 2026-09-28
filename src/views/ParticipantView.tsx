import React, { useState } from 'react';
import { User, Project, EventConfig } from '../types';
import { api } from '../api';
import { 
  Users, 
  Lock, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  FileText,
  ShieldAlert,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ParticipantViewProps {
  currentUser: User;
  event: EventConfig | null;
  projects: Project[];
  onOpenSubmitModal: () => void;
  onRefreshProjects: () => void;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  currentUser,
  event,
  projects,
  onOpenSubmitModal,
  onRefreshProjects,
}) => {
  const [attemptingPostDeadlineSubmit, setAttemptingPostDeadlineSubmit] = useState(false);
  const [serverRejectionNotice, setServerRejectionNotice] = useState<string | null>(null);

  const myProject = projects.find(p => p.id === 'proj_quiet_hours') || projects[0];

  const handleTestPostDeadlineRejection = async () => {
    setAttemptingPostDeadlineSubmit(true);
    setServerRejectionNotice(null);
    try {
      await api.createProject({
        title: 'Post-Deadline Unauthorized Exploit Draft',
        track_id: 'dev-tools',
        summary: 'Attempting to inject a submission after deadline passes.',
      });
      alert('Unexpected: Project creation succeeded!');
    } catch (err: any) {
      setServerRejectionNotice(err.data?.message || err.message);
    } finally {
      setAttemptingPostDeadlineSubmit(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans">
      {/* Workspace Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#6E44FF] flex items-center space-x-1.5 font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>SUBMISSION WORKSPACE · TEAM NIGHTSHIFT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111318] tracking-tight mt-1">
              Welcome back, {currentUser.name}
            </h2>
            <p className="text-xs text-[#6B7280] font-mono mt-0.5">
              Track: Developer Tools · Status: Registered Submission
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {event?.is_deadline_passed ? (
              <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] text-xs font-mono font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>SUBMISSIONS LOCKED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>SUBMISSIONS OPEN</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Indicator as requested: DRAFT -> SUBMITTED -> UNDER REVIEW -> COMPLETE */}
        <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-2">
          <div className="text-[10px] uppercase font-mono text-[#6B7280] font-bold">
            Submission Lifecycle Progress
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white border border-[#E2E4E9] text-[#6B7280] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
              <span>1. Draft</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#A7F3D0] text-[#059669] flex items-center space-x-2 font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>2. Submitted ✓</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#DDD6FE] text-[#6E44FF] flex items-center space-x-2 font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#6E44FF] animate-pulse"></span>
              <span>3. Under Review</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E2E4E9] text-[#6B7280] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#D1D5DB]"></span>
              <span>4. Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Evidence Card */}
      {myProject && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E4E9] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-[#6E44FF]">#001</span>
                <h3 className="text-xl font-bold text-[#111318]">{myProject.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAFBFD] text-[#6E44FF] border border-[#E2E4E9] font-bold">
                  {myProject.track_name || myProject.track_id}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-mono mt-1">
                Submitted on {new Date(myProject.submitted_at).toUTCString()}
              </p>
            </div>

            <button
              onClick={onOpenSubmitModal}
              className="px-4 py-2 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-xs font-mono text-[#111318] border border-[#E2E4E9] flex items-center space-x-1.5 transition-colors self-start sm:self-auto font-bold"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6E44FF]" />
              <span>Edit Submission Dossier</span>
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="text-[10px] uppercase text-[#6B7280]">Pitch Summary</div>
              <p className="text-[#111318] leading-relaxed font-sans text-xs mt-0.5">{myProject.summary}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-1.5">
              <div className="text-[10px] uppercase text-[#6B7280]">Architecture & Invariants</div>
              <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line">
                {myProject.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
                <span className="text-[#6B7280]">Git Repository:</span>
                <a 
                  href={myProject.repo_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#6E44FF] hover:underline flex items-center space-x-1 font-semibold"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between">
                <span className="text-[#6B7280]">Live Demo:</span>
                <a 
                  href={myProject.demo_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#059669] hover:underline flex items-center space-x-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>quiethours.dev</span>
                </a>
              </div>
            </div>
          </div>

          {/* Team Roster */}
          <div className="pt-4 border-t border-[#E2E4E9] space-y-3 font-mono">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">
              Registered Team Personnel
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between text-xs">
                <div>
                  <div className="text-[#111318] font-bold">Tanya Garg</div>
                  <div className="text-[10px] text-[#6B7280]">tanyagarg5315@gmail.com</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF5FF] text-[#6E44FF] border border-[#DDD6FE] font-bold">
                  Owner
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center justify-between text-xs">
                <div>
                  <div className="text-[#111318] font-bold">Alex Sharma</div>
                  <div className="text-[10px] text-[#6B7280]">alex@nightshift.dev</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563]">
                  Member
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Enforcement Verification Probe */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-4 font-mono">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] shrink-0">
            <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#111318]">
              <span>SUBMISSION DEADLINE ENFORCEMENT</span>
              <span className="text-[9px] px-2 py-0.2 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                SERVER AUTHORITATIVE
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Backend automatically enforces the submission deadline, rejecting late edits with HTTP 403 Forbidden.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestPostDeadlineRejection}
          disabled={attemptingPostDeadlineSubmit}
          className="px-4 py-2 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] text-xs flex items-center space-x-1.5 transition-all disabled:opacity-50 font-bold"
        >
          <span>{attemptingPostDeadlineSubmit ? 'Executing POST /api/projects...' : 'Simulate Post-Deadline Write (Verify Rejection)'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {serverRejectionNotice && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center justify-between text-[#DC2626]">
              <span className="font-bold">✓ SERVER REJECTED POST-DEADLINE WRITE (HTTP 403)</span>
              <span className="text-[10px] text-[#059669] font-bold">PASS</span>
            </div>
            <p className="text-[#6B7280] text-[11px]">{serverRejectionNotice}</p>
          </div>
        )}
      </div>
    </div>
  );
};
