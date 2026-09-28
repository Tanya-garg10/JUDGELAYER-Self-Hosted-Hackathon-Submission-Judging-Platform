import React, { useState } from 'react';
import { Project, User } from '../types';
import { api } from '../api';
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  CheckCircle2, 
  Save, 
  Send, 
  ShieldCheck, 
  Code2, 
  Cpu, 
  Layers, 
  Check, 
  Lock,
  FileText,
  AlertCircle
} from 'lucide-react';

interface SplitReviewRoomProps {
  project: Project;
  currentUser: User;
  onBack: () => void;
  onScoreUpdated: () => void;
}

export const SplitReviewRoom: React.FC<SplitReviewRoomProps> = ({
  project,
  currentUser,
  onBack,
  onScoreUpdated,
}) => {
  const existingScore = project.myScore;
  const [architecture, setArchitecture] = useState<number>(existingScore?.quality ? existingScore.quality * 2 : 8.5);
  const [innovation, setInnovation] = useState<number>(existingScore?.innovation ? existingScore.innovation * 2 : 9.0);
  const [impact, setImpact] = useState<number>(existingScore?.impact ? existingScore.impact * 2 : 8.0);
  const [execution, setExecution] = useState<number>(existingScore?.functionality ? existingScore.functionality * 2 : 9.0);
  const [evidenceNotes, setEvidenceNotes] = useState<string>(existingScore?.comment || '');
  const [saving, setSaving] = useState(false);
  const [confirmedSubmitted, setConfirmedSubmitted] = useState(false);

  // Total out of 40 (or scaled composite)
  const totalScore = (architecture + innovation + impact + execution).toFixed(1);
  const normalizedTen = ((architecture + innovation + impact + execution) / 4).toFixed(2);

  const handleSaveReview = async (status: 'draft' | 'submitted') => {
    setSaving(true);
    try {
      // Map 10-point scale back to 1-5 scale for DB compatibility
      await api.submitScore({
        judge_id: currentUser.judge_id || currentUser.id,
        project_id: project.id,
        quality: architecture / 2,
        innovation: innovation / 2,
        impact: impact / 2,
        functionality: execution / 2,
        comment: evidenceNotes,
        status,
      });

      if (status === 'submitted') {
        setConfirmedSubmitted(true);
        setTimeout(() => setConfirmedSubmitted(false), 4000);
      }
      onScoreUpdated();
    } catch (err: any) {
      alert(`Error recording ballot: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col bg-[#F6F7F9] pb-12 animate-in fade-in duration-200">
      {/* Top Workstation Bar */}
      <div className="px-4 sm:px-6 py-3 bg-white border-b border-[#E2E4E9] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-[#4B5563] hover:text-[#111318] px-3 py-1.5 rounded-md bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E2E4E9] transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Assigned Cases</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAFBFD] text-[#6E44FF] border border-[#E2E4E9] font-bold">
                CASE #{project.id.replace('proj_', '').toUpperCase()}
              </span>
              <h2 className="text-base font-bold text-[#111318] tracking-tight">{project.title}</h2>
              <span className="text-xs font-mono text-[#6B7280]">
                by {project.team_name || project.team_id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-[#4B5563] bg-[#FAFBFD] px-2.5 py-1 rounded border border-[#E2E4E9]">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>Judge: {currentUser.name} ({currentUser.judge_id || currentUser.id})</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono text-[#4B5563] bg-[#FAFBFD] px-2.5 py-1 rounded border border-[#E2E4E9]">
            <Lock className="w-3.5 h-3.5 text-[#6E44FF]" />
            <span>Peer Scores Hidden</span>
          </div>
        </div>
      </div>

      {/* 3-Column Review Workstation */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6">
        {/* Left Column: Project Evidence Dossier (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-[#E2E4E9] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E4E9] pb-3">
              <span className="text-xs font-mono font-bold uppercase text-[#111318] tracking-wider">
                EVIDENCE DOSSIER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                VERIFIED SNAPSHOT
              </span>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-[#6B7280]">Summary Pitch</div>
              <p className="mt-1 text-xs text-[#111318] leading-relaxed font-medium">
                {project.summary}
              </p>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-[#6B7280]">Technical Architecture</div>
              <p className="mt-1 text-xs text-[#4B5563] leading-relaxed whitespace-pre-line bg-[#FAFBFD] p-3 rounded-lg border border-[#E2E4E9]">
                {project.description || 'No detailed architecture description provided by team.'}
              </p>
            </div>

            {/* Evidence Links */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] uppercase font-mono text-[#6B7280]">Verified Endpoints</div>
              <div className="space-y-2">
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] hover:border-[#6E44FF] text-xs text-[#111318] transition-all font-mono"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Github className="w-4 h-4 text-[#4B5563]" />
                      <span className="truncate">{project.repo_url}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  </a>
                )}

                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] hover:border-[#059669] text-xs text-[#111318] transition-all font-mono"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <ExternalLink className="w-4 h-4 text-[#059669]" />
                      <span className="truncate">{project.demo_url}</span>
                    </div>
                    <span className="text-[10px] text-[#059669] font-semibold">Live Demo</span>
                  </a>
                )}
              </div>
            </div>

            {/* Team Roster */}
            {project.team_members && project.team_members.length > 0 && (
              <div className="pt-2 border-t border-[#E2E4E9] space-y-2">
                <div className="text-[10px] uppercase font-mono text-[#6B7280]">Team Personnel</div>
                <div className="space-y-1 font-mono text-xs">
                  {project.team_members.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[#111318] bg-[#FAFBFD] px-2.5 py-1.5 rounded border border-[#E2E4E9]">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-[10px] text-[#6B7280]">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Criteria Evaluation & Evidence Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-[#E2E4E9] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E4E9] pb-3">
              <span className="text-xs font-mono font-bold uppercase text-[#111318] tracking-wider">
                EVALUATION CRITERIA
              </span>
              <span className="text-[10px] font-mono text-[#6E44FF] font-semibold">
                SCALE: 1.0 — 10.0
              </span>
            </div>

            {/* Criterion 1: Architecture */}
            <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#111318]">Architecture & Code Quality</span>
                  <span className="block text-[11px] text-[#6B7280]">Modularity, typing, error boundaries, test harness.</span>
                </div>
                <span className="font-mono text-base font-black text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                  {architecture.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={architecture}
                onChange={e => setArchitecture(parseFloat(e.target.value))}
                className="w-full accent-[#6E44FF] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#9CA3AF]">
                <span>1.0 Fragile</span>
                <span>5.0 Standard</span>
                <span>10.0 Production-Grade</span>
              </div>
            </div>

            {/* Criterion 2: Innovation */}
            <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#111318]">Technical Innovation</span>
                  <span className="block text-[11px] text-[#6B7280]">Novelty, non-trivial engineering over boilerplate.</span>
                </div>
                <span className="font-mono text-base font-black text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                  {innovation.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={innovation}
                onChange={e => setInnovation(parseFloat(e.target.value))}
                className="w-full accent-[#6E44FF] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#9CA3AF]">
                <span>1.0 Generic</span>
                <span>5.0 Creative</span>
                <span>10.0 Breakthrough</span>
              </div>
            </div>

            {/* Criterion 3: Impact */}
            <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#111318]">Ecosystem Impact</span>
                  <span className="block text-[11px] text-[#6B7280]">Real-world adoptability, developer fatigue reduction.</span>
                </div>
                <span className="font-mono text-base font-black text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                  {impact.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={impact}
                onChange={e => setImpact(parseFloat(e.target.value))}
                className="w-full accent-[#6E44FF] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#9CA3AF]">
                <span>1.0 Niche</span>
                <span>5.0 Useful</span>
                <span>10.0 Indispensable</span>
              </div>
            </div>

            {/* Criterion 4: Execution */}
            <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#111318]">Execution & Functionality</span>
                  <span className="block text-[11px] text-[#6B7280]">End-to-end functionality, polish, resilience under test.</span>
                </div>
                <span className="font-mono text-base font-black text-[#6E44FF] px-2 py-0.5 rounded bg-white border border-[#E2E4E9]">
                  {execution.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={execution}
                onChange={e => setExecution(parseFloat(e.target.value))}
                className="w-full accent-[#6E44FF] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#9CA3AF]">
                <span>1.0 Broken</span>
                <span>5.0 Functional</span>
                <span>10.0 Flawless</span>
              </div>
            </div>

            {/* Evidence Notes */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#6B7280]">
                <span>Evidence Notes & Verification Rationale</span>
                <span>Markdown Supported</span>
              </div>
              <textarea
                rows={4}
                value={evidenceNotes}
                onChange={e => setEvidenceNotes(e.target.value)}
                placeholder="Detail specific evidence observed during testing, edge case handling, or architectural strengths..."
                className="w-full p-3 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318] font-mono placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: YOUR REVIEW Sticky Card (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-[#E2E4E9] shadow-xs space-y-5 sticky top-20">
            <div className="border-b border-[#E2E4E9] pb-3">
              <span className="text-xs font-mono font-bold uppercase text-[#111318] tracking-wider">
                YOUR REVIEW
              </span>
              <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">CASE #{project.id.replace('proj_', '').toUpperCase()}</p>
            </div>

            {/* Scorecard table as requested */}
            <div className="font-mono text-xs space-y-2 bg-[#FAFBFD] p-3.5 rounded-lg border border-[#E2E4E9]">
              <div className="flex justify-between items-center text-[#4B5563]">
                <span>Architecture</span>
                <span className="font-bold text-[#111318]">{architecture.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center text-[#4B5563]">
                <span>Innovation</span>
                <span className="font-bold text-[#111318]">{innovation.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center text-[#4B5563]">
                <span>Impact</span>
                <span className="font-bold text-[#111318]">{impact.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center text-[#4B5563]">
                <span>Execution</span>
                <span className="font-bold text-[#111318]">{execution.toFixed(1)}</span>
              </div>

              <div className="pt-2 border-t border-[#E2E4E9] flex justify-between items-center font-bold text-sm text-[#111318]">
                <span>TOTAL</span>
                <span className="text-[#6E44FF] text-base">{totalScore}</span>
              </div>
            </div>

            {/* Status indicators */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center space-x-1.5 text-[#059669]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                <span>Your score: Active</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#6B7280]">
                <Lock className="w-3.5 h-3.5 text-[#6E44FF]" />
                <span>Peer scores hidden</span>
              </div>
            </div>

            {confirmedSubmitted && (
              <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-mono text-xs flex items-center space-x-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>Official Ballot Encrypted & Recorded!</span>
              </div>
            )}

            {/* Submit Review Action */}
            <div className="space-y-2 pt-2 border-t border-[#E2E4E9]">
              <button
                onClick={() => handleSaveReview('submitted')}
                disabled={saving}
                className="w-full py-3 px-4 rounded-lg bg-[#111318] hover:bg-[#2A2E37] text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#00C9DB]" />
                <span>SUBMIT REVIEW →</span>
              </button>

              <button
                onClick={() => handleSaveReview('draft')}
                disabled={saving}
                className="w-full py-2 px-4 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-[#4B5563] border border-[#E2E4E9] text-xs font-mono flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft Evidence</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
