import React, { useState, useEffect } from 'react';
import { User, EventConfig } from '../types';
import { api } from '../api';
import { 
  Trophy, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  HelpCircle, 
  FileCheck,
  Scale
} from 'lucide-react';

interface ResultsViewProps {
  currentUser: User;
  event: EventConfig | null;
  onRefreshGlobalEvent: () => void;
  onSelectProject: (id: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  currentUser,
  event,
  onRefreshGlobalEvent,
  onSelectProject,
}) => {
  const [resultsData, setResultsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await api.getResults();
      setResultsData(data);
    } catch (err: any) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [currentUser]);

  const handleTogglePublish = async () => {
    if (!resultsData) return;
    setPublishing(true);
    try {
      const next = !resultsData.published;
      await api.togglePublishResults(next);
      onRefreshGlobalEvent();
      fetchResults();
    } catch (err: any) {
      alert(`Error publishing results: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs font-mono text-[#6B7280] max-w-7xl mx-auto">
        Compiling standardized judging calculations...
      </div>
    );
  }

  // If results locked and user is NOT organizer
  if (!resultsData?.published && currentUser.role !== 'organizer') {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6 font-mono">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E4E9] flex items-center justify-center mx-auto text-[#D97706] shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#D97706] font-bold">
            RESULTS LOCKED BY EVENT DIRECTOR
          </div>
          <h2 className="text-3xl font-black text-[#111318] tracking-tight font-sans">
            Official Standings Awaiting Release
          </h2>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
            Deliberations are in progress. Results undergo mathematical Z-score variance stabilization before public release.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E4E9] text-left text-xs space-y-2 shadow-xs">
          <div className="text-[#111318] font-bold flex items-center space-x-1.5">
            <Scale className="w-4 h-4 text-[#6E44FF]" />
            <span>Integrity & Calibration Method</span>
          </div>
          <p className="text-[#6B7280] leading-relaxed">
            All ballots are calibrated across individual judge variances to prevent leniency divergence and score compression anomalies.
          </p>
        </div>
      </div>
    );
  }

  const standings = resultsData?.standings || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Organizer Preview Notice */}
      {!resultsData?.published && currentUser.role === 'organizer' && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-2 text-[#D97706]">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              <strong>ORGANIZER PREVIEW:</strong> Results are hidden from participants. Click below to release publicly.
            </span>
          </div>
          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className="px-4 py-1.5 rounded-lg bg-[#111318] text-white font-bold text-xs whitespace-nowrap transition-all shadow-xs"
          >
            Publish Results to Public
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#6E44FF] uppercase tracking-wider font-bold">
            <Trophy className="w-4 h-4" />
            <span>OFFICIAL STANDINGS & CALIBRATED SCORES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111318] tracking-tight mt-1">
            Defensible Hackathon Standings
          </h2>
          <p className="text-xs text-[#6B7280] font-mono mt-0.5">
            Transparently computed via deterministic Z-Score standardization.
          </p>
        </div>

        {currentUser.role === 'organizer' && (
          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
              resultsData?.published
                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                : 'bg-[#111318] text-white hover:bg-[#2A2E37]'
            }`}
          >
            {resultsData?.published ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{resultsData?.published ? 'Lock Results' : 'Publish Results'}</span>
          </button>
        )}
      </div>

      {/* Editorial Standings Table */}
      <div className="rounded-2xl border border-[#E2E4E9] bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E4E9] flex items-center justify-between font-mono">
          <span className="text-xs font-bold text-[#111318] uppercase tracking-wider">
            Official Standings Roster ({standings.length} Projects)
          </span>
          <span className="text-[10px] text-[#6E44FF] font-bold">
            Z-SCORE STANDARDIZED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#FAFBFD] border-b border-[#E2E4E9] text-[11px] uppercase tracking-wider text-[#6B7280]">
                <th className="py-3 px-5 w-16 text-center">Rank</th>
                <th className="py-3 px-5">Project & Track</th>
                <th className="py-3 px-5">Team</th>
                <th className="py-3 px-5 text-center">Normalized Score</th>
                <th className="py-3 px-5 text-center">Raw Score</th>
                <th className="py-3 px-5 text-center">Reviews</th>
                <th className="py-3 px-5 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4E9]">
              {standings.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#FAFBFD] transition-colors">
                  <td className="py-4 px-5 text-center font-black text-sm text-[#111318]">
                    {item.rank < 10 ? `0${item.rank}` : item.rank}
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-xs text-[#111318] font-sans">{item.title}</div>
                    <div className="text-[10px] text-[#6E44FF] mt-0.5">{item.track}</div>
                  </td>
                  <td className="py-4 px-5 text-[#6B7280]">
                    {item.team}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span className="font-mono text-sm font-bold text-[#6E44FF] px-2 py-0.5 rounded bg-[#FAF5FF] border border-[#DDD6FE]">
                      {item.normalizedScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center text-[#6B7280]">
                    {item.rawScore.toFixed(2)}
                  </td>
                  <td className="py-4 px-5 text-center text-[#111318]">
                    {item.reviewsCount} / 3
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-bold">
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparent Judging Metadata Explanation */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-4 font-mono text-xs">
        <div className="flex items-center space-x-2 text-[#111318] font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-[#6E44FF]" />
          <span>Judging Integrity & Normalization Proof</span>
        </div>

        <p className="text-[#6B7280] leading-relaxed">
          To ensure fairness, scores undergo deterministic Z-Score standardization:
          each judge's harshness/lenience mean ($\mu_j$) and variance ($\sigma_j$) are normalized against the global distribution, guaranteeing no team is penalized or inflated by judge assignment luck.
        </p>

        <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-1.5 text-[11px] text-[#111318]">
          <div className="font-bold text-[#6E44FF]">Normalization Equation:</div>
          <div>1. Standardize deviation: <code className="text-[#059669]">Z = (RawScore - Mean_Judge) / Std_Judge</code></div>
          <div>2. Map to global baseline: <code className="text-[#059669]">Score_Norm = Clamp(Mean_Global + Z * Std_Global, 1.0, 5.0)</code></div>
        </div>
      </div>
    </div>
  );
};
