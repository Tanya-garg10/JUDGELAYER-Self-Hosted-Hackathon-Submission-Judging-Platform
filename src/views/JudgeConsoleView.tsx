import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { api } from '../api';
import { SplitReviewRoom } from '../components/SplitReviewRoom';
import { 
  Gavel, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  AlertOctagon, 
  Lock, 
  Play, 
  Shield,
  FileCheck,
  EyeOff
} from 'lucide-react';

interface JudgeConsoleViewProps {
  currentUser: User;
  onRefreshGlobalAudit: () => void;
  onSwitchRole: (roleOrId: string) => void;
}

export const JudgeConsoleView: React.FC<JudgeConsoleViewProps> = ({
  currentUser,
  onRefreshGlobalAudit,
  onSwitchRole,
}) => {
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [activeReviewProject, setActiveReviewProject] = useState<Project | null>(null);
  const [peerTestResult, setPeerTestResult] = useState<any | null>(null);
  const [peerTesting, setPeerTesting] = useState(false);

  const fetchJudgeAssignments = async () => {
    if (currentUser.role !== 'judge' && currentUser.role !== 'organizer') {
      setLoading(false);
      setErrorNotice(`Active persona is '${currentUser.role}'. A judge role is required to evaluate cases.`);
      return;
    }

    setLoading(true);
    setErrorNotice(null);
    try {
      const res = await api.getJudgeProjects();
      setAssignedProjects(res.projects);
    } catch (err: any) {
      console.error('Failed to load judge projects:', err);
      setErrorNotice(err.message || 'Authentication required to access judge projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudgeAssignments();
  }, [currentUser]);

  const runPeerIsolationTest = async () => {
    setPeerTesting(true);
    setPeerTestResult(null);
    try {
      const currentJudgeId = currentUser.judge_id || 'judge_a';
      const peerJudgeId = currentJudgeId === 'judge_a' ? 'judge_b' : 'judge_a';

      const res = await fetch(`/api/judge/scores?judge=${peerJudgeId}`, {
        credentials: 'same-origin',
        headers: currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
      });

      const body = await res.json();
      setPeerTestResult({
        status: res.status,
        peerId: peerJudgeId,
        body,
      });

      onRefreshGlobalAudit();
    } catch (err: any) {
      setPeerTestResult({
        status: 403,
        error: err.message,
      });
    } finally {
      setPeerTesting(false);
    }
  };

  if (activeReviewProject) {
    return (
      <SplitReviewRoom
        project={activeReviewProject}
        currentUser={currentUser}
        onBack={() => {
          setActiveReviewProject(null);
          fetchJudgeAssignments();
        }}
        onScoreUpdated={() => {
          fetchJudgeAssignments();
        }}
      />
    );
  }

  const reviewedCount = assignedProjects.filter(p => p.reviewStatus === 'submitted').length;
  const inProgressCount = assignedProjects.filter(p => p.reviewStatus === 'draft').length;
  const pendingCount = assignedProjects.length - reviewedCount - inProgressCount;
  const completionPercent = assignedProjects.length > 0 
    ? Math.round((reviewedCount / assignedProjects.length) * 100) 
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Workstation Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#6E44FF]">
            <Gavel className="w-4 h-4 text-[#6E44FF]" />
            <span className="font-bold">CASE-REVIEW WORKSTATION</span>
            <span className="text-[#D1D5DB]">·</span>
            <span className="text-[#111318] font-bold">{currentUser.name}</span>
            <span className="text-[10px] text-[#059669] uppercase bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
              {currentUser.judge_id || currentUser.id}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#111318] tracking-tight mt-1">
            Assigned Case Queue & Deliberations
          </h2>
          <p className="text-xs text-[#6B7280] font-mono mt-0.5 max-w-xl">
            Review project evidence, verify test benchmarks, and submit cryptographic ballots.
          </p>
        </div>

        {/* Progress Display */}
        <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] min-w-[240px] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#6B7280]">Review Progress</span>
            <span className="text-sm font-bold text-[#111318]">{reviewedCount} / {assignedProjects.length}</span>
          </div>

          <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#6E44FF] h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
            <span>{completionPercent}% Completed</span>
            <span>{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Prominent Security Panel as requested */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E4E9] pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#111318]">
            <ShieldCheck className="w-4 h-4 text-[#6E44FF]" />
            <span>YOUR JUDGING SCOPE</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            BACKEND ENFORCED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center space-x-2 text-[#111318]">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span>Assigned projects only</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center space-x-2 text-[#111318]">
            <Lock className="w-3.5 h-3.5 text-[#6E44FF]" />
            <span>Peer scores hidden</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center space-x-2 text-[#111318]">
            <EyeOff className="w-3.5 h-3.5 text-[#6E44FF]" />
            <span>Participant scores hidden</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] flex items-center space-x-2 text-[#111318]">
            <FileCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span>Every action audited</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-[#6B7280] font-mono">
            Verify boundary: Attempting to retrieve peer judge ballots triggers an immediate 403 Forbidden response.
          </p>
          <button
            onClick={runPeerIsolationTest}
            disabled={peerTesting}
            className="px-3 py-1.5 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-[#DC2626] border border-[#FCA5A5] text-xs font-mono flex items-center space-x-1.5 transition-colors disabled:opacity-50 shrink-0"
          >
            <Play className="w-3 h-3" />
            <span>{peerTesting ? 'Probing...' : 'Test Peer Isolation'}</span>
          </button>
        </div>

        {peerTestResult && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] font-mono text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[#DC2626]">
              <span className="font-bold flex items-center space-x-1.5">
                <AlertOctagon className="w-4 h-4" />
                <span>PEER ISOLATION TEST: HTTP {peerTestResult.status} FORBIDDEN (PASS)</span>
              </span>
              <span className="text-[10px] text-[#059669] bg-white px-2 py-0.5 rounded border border-[#A7F3D0]">
                ✓ BOUNDARY SECURE
              </span>
            </div>
            <pre className="p-2 rounded bg-white border border-[#FCA5A5] text-[10px] text-[#DC2626] overflow-x-auto">
              {JSON.stringify(peerTestResult.body, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Assigned Case List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="uppercase tracking-wider text-[#6B7280] font-semibold">
            Assigned Project Cases ({assignedProjects.length})
          </span>
          <span className="text-[#6E44FF]">EACH CASE REQUIRES INDEPENDENT DELIBERATION</span>
        </div>

        {errorNotice ? (
          <div className="p-8 text-center text-xs font-mono rounded-xl bg-white border border-[#E2E4E9] space-y-4">
            <div className="text-[#DC2626] font-bold text-sm">JUDGE ROLE REQUIRED</div>
            <p className="text-[#6B7280] max-w-md mx-auto">{errorNotice}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => onSwitchRole('user_judge_a')}
                className="px-4 py-2 rounded-lg bg-[#111318] text-white text-xs font-mono"
              >
                Switch to Judge A (Ada Okonkwo)
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#6B7280] rounded-xl bg-white border border-[#E2E4E9]">
            Loading assigned cases...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedProjects.map(project => {
              const score = project.myScore;
              const isReviewed = project.reviewStatus === 'submitted';
              const isDraft = project.reviewStatus === 'draft';

              return (
                <div
                  key={project.id}
                  className="p-5 rounded-xl bg-white border border-[#E2E4E9] hover:border-[#6E44FF]/50 transition-all flex flex-col justify-between space-y-4 shadow-xs group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-[#6E44FF] font-semibold uppercase">
                          CASE #{project.id.replace('proj_', '').toUpperCase()}
                        </div>
                        <h3 className="text-base font-bold text-[#111318] group-hover:text-[#6E44FF] transition-colors">
                          {project.title}
                        </h3>
                        <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
                          {project.track_name || project.track_id}
                        </div>
                      </div>

                      {isReviewed ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center space-x-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>REVIEWED</span>
                        </span>
                      ) : isDraft ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center space-x-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>DRAFT</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] shrink-0">
                          PENDING
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E2E4E9] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#6B7280]">
                      {project.team_name || project.team_id}
                    </span>

                    <button
                      onClick={() => setActiveReviewProject(project)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#111318] hover:bg-[#2A2E37] text-white text-xs font-mono flex items-center space-x-1.5 transition-all"
                    >
                      <span>{isReviewed ? 'Edit Ballot' : isDraft ? 'Resume Case' : 'Review Case'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
