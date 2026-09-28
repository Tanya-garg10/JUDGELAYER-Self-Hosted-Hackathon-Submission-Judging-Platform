import React from 'react';
import { AlertTriangle, Copy, FileWarning, Sliders, ArrowRight } from 'lucide-react';

interface EdgeAlertsProps {
  edgeCases: {
    incompleteProjects: Array<{ id: string; title: string; reviewsCount: number; target: number }>;
    duplicates: Array<any>;
    compressedJudges: Array<{ judgeId: string; name: string; scoreCount: number; mean: number; std: number }>;
  };
  onNavigateToProject?: (id: string) => void;
  onNavigateToMatrix?: () => void;
  onNavigateToNormalization?: () => void;
}

export const EdgeAlerts: React.FC<EdgeAlertsProps> = ({
  edgeCases,
  onNavigateToProject,
  onNavigateToMatrix,
  onNavigateToNormalization,
}) => {
  const hasIncomplete = edgeCases.incompleteProjects.length > 0;
  const hasDuplicates = edgeCases.duplicates.length > 0;
  const hasCompressed = edgeCases.compressedJudges.length > 0;

  if (!hasIncomplete && !hasDuplicates && !hasCompressed) {
    return (
      <div className="p-4 rounded-xl bg-white border border-[#A7F3D0] text-xs font-mono text-[#059669] flex items-center space-x-2 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
        <span>All systems clear: Zero duplicate submissions, zero compression anomalies, full coverage.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-[#D97706] font-bold">
          <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          <span>EDGE-CASE INTELLIGENCE & FIXTURE ANOMALIES</span>
        </div>
        <span className="text-[10px] text-[#6B7280]">AUTOMATED TOPOLOGY SCAN</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Duplicate Submissions Card */}
        {hasDuplicates && (
          <div className="p-4 rounded-xl bg-white border border-[#FCA5A5] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#DC2626] font-bold flex items-center space-x-1.5">
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate Submission</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] font-bold border border-[#FCA5A5]">
                {edgeCases.duplicates.length} Detected
              </span>
            </div>
            <p className="text-xs text-[#4B5563] font-sans">
              <strong className="text-[#111318]">"{edgeCases.duplicates[0]?.title}"</strong> was flagged as an accidental duplicate of existing submission.
            </p>
            {onNavigateToProject && (
              <button
                onClick={() => onNavigateToProject(edgeCases.duplicates[0]?.id)}
                className="mt-1 text-[11px] text-[#DC2626] hover:underline flex items-center space-x-1 font-bold"
              >
                <span>Inspect Duplicate Draft</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Incomplete Review Batch */}
        {hasIncomplete && (
          <div className="p-4 rounded-xl bg-white border border-[#FDE68A] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#D97706] font-bold flex items-center space-x-1.5">
                <FileWarning className="w-3.5 h-3.5" />
                <span>Incomplete Review Batch</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] font-bold border border-[#FDE68A]">
                {edgeCases.incompleteProjects.length} Projects
              </span>
            </div>
            <p className="text-xs text-[#4B5563] font-sans">
              <strong className="text-[#111318]">{edgeCases.incompleteProjects[0]?.title}</strong> has only {edgeCases.incompleteProjects[0]?.reviewsCount} of {edgeCases.incompleteProjects[0]?.target} required reviews.
            </p>
            {onNavigateToMatrix && (
              <button
                onClick={onNavigateToMatrix}
                className="mt-1 text-[11px] text-[#D97706] hover:underline flex items-center space-x-1 font-bold"
              >
                <span>Assign in Matrix</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Score Compression */}
        {hasCompressed && (
          <div className="p-4 rounded-xl bg-white border border-[#DDD6FE] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6E44FF] font-bold flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Score Compression</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF5FF] text-[#6E44FF] font-bold border border-[#DDD6FE]">
                σ &lt; 0.15
              </span>
            </div>
            <p className="text-xs text-[#4B5563] font-sans">
              <strong className="text-[#111318]">{edgeCases.compressedJudges[0]?.name}</strong> assigned identical 5.0 scores across all {edgeCases.compressedJudges[0]?.scoreCount} reviewed projects.
            </p>
            {onNavigateToNormalization && (
              <button
                onClick={onNavigateToNormalization}
                className="mt-1 text-[11px] text-[#6E44FF] hover:underline flex items-center space-x-1 font-bold"
              >
                <span>View Z-Score Calibration</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
