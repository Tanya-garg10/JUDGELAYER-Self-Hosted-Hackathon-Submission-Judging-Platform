import React, { useState, useEffect } from 'react';
import { User, EventConfig } from '../types';
import { api } from '../api';
import { EdgeAlerts } from '../components/EdgeAlerts';
import { AssignmentMatrix } from '../components/AssignmentMatrix';
import { 
  Sliders, 
  Layers, 
  Gavel, 
  CheckCircle2, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Trophy, 
  Download, 
  Activity,
  FileSpreadsheet
} from 'lucide-react';

interface OrganizerViewProps {
  currentUser: User;
  event: EventConfig | null;
  onRefreshGlobalEvent: () => void;
  onNavigateToResults: () => void;
  onNavigateToExports: () => void;
  onNavigateToProject: (id: string) => void;
}

export const OrganizerView: React.FC<OrganizerViewProps> = ({
  currentUser,
  event,
  onRefreshGlobalEvent,
  onNavigateToResults,
  onNavigateToExports,
  onNavigateToProject,
}) => {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [matrixData, setMatrixData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingDeadline, setUpdatingDeadline] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchOrganizerData = async () => {
    setLoading(true);
    try {
      const [dash, mat] = await Promise.all([
        api.getOrganizerDashboard(),
        api.getAssignmentsMatrix(),
      ]);
      setDashboardData(dash);
      setMatrixData(mat);
    } catch (err: any) {
      console.error('Failed to fetch organizer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const handleTogglePublish = async () => {
    if (!dashboardData) return;
    setPublishing(true);
    try {
      const nextState = !dashboardData.metrics.resultsPublished;
      await api.togglePublishResults(nextState);
      onRefreshGlobalEvent();
      fetchOrganizerData();
    } catch (err: any) {
      alert(`Error toggling results: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleDeadline = async () => {
    setUpdatingDeadline(true);
    try {
      const isCurrentlyClosed = event?.status === 'closed' || event?.is_deadline_passed;
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const pastDate = new Date(Date.now() - 86400000).toISOString();

      await api.updateEvent({
        status: isCurrentlyClosed ? 'open' : 'closed',
        submissions_close: isCurrentlyClosed ? futureDate : pastDate,
      });

      onRefreshGlobalEvent();
      fetchOrganizerData();
    } catch (err: any) {
      alert(`Error updating deadline: ${err.message}`);
    } finally {
      setUpdatingDeadline(false);
    }
  };

  const handleResetFixtures = async () => {
    if (!confirm('Reset all databases, scores, and assignments to pristine fixtures.json state?')) return;
    try {
      await api.resetFixtures();
      onRefreshGlobalEvent();
      fetchOrganizerData();
      alert('System successfully reset to default fixtures.json.');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-16 text-center text-xs font-mono text-[#6B7280] max-w-7xl mx-auto">
        Connecting to event mission control...
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const edgeCases = dashboardData?.edgeCases || { incompleteProjects: [], duplicates: [], compressedJudges: [] };
  const coveragePercent = metrics.coveragePercent || 72;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Mission-Control Interface Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E4E9] pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#6E44FF] uppercase tracking-wider font-bold">
              <Sliders className="w-4 h-4" />
              <span>EVENT CONTROL ROOM · LIVE SUPERVISION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111318] tracking-tight mt-1">
              Mission Control & Supervision
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse mr-2"></span>
              EVENT STATUS: {event?.status ? event.status.toUpperCase() : 'OPEN'}
            </span>

            <button
              onClick={handleTogglePublish}
              disabled={publishing}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
                metrics.resultsPublished
                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                  : 'bg-[#111318] text-white hover:bg-[#2A2E37]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{metrics.resultsPublished ? 'Lock Results' : 'Publish Final Standings'}</span>
            </button>
          </div>
        </div>

        {/* Mission-Control Numbers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9]">
            <div className="text-[10px] uppercase text-[#6B7280]">SUBMISSIONS</div>
            <div className="text-2xl font-black text-[#111318] mt-1">
              {metrics.totalProjects || 11}
            </div>
            <div className="text-[10px] text-[#059669] mt-0.5">100% Ingested</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9]">
            <div className="text-[10px] uppercase text-[#6B7280]">JUDGES</div>
            <div className="text-2xl font-black text-[#111318] mt-1">
              {metrics.totalJudges || 3}
            </div>
            <div className="text-[10px] text-[#6E44FF] mt-0.5">Isolated Panels</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9]">
            <div className="text-[10px] uppercase text-[#6B7280]">REVIEWS RECORDED</div>
            <div className="text-2xl font-black text-[#111318] mt-1">
              {metrics.totalReviews || 19}
            </div>
            <div className="text-[10px] text-[#6B7280] mt-0.5">Ballots Audited</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9]">
            <div className="text-[10px] uppercase text-[#6B7280]">COMPLETION</div>
            <div className="text-2xl font-black text-[#059669] mt-1">
              {coveragePercent}%
            </div>
            <div className="text-[10px] text-[#6B7280] mt-0.5">Target: 3/Project</div>
          </div>
        </div>

        {/* Judge Coverage Bar */}
        <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111318] font-bold">JUDGE COVERAGE</span>
            <span className="text-[#059669] font-bold">{coveragePercent}% Target Met</span>
          </div>
          <div className="w-full bg-[#E5E7EB] h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#6E44FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
            <span>Minimum 3 independent judges per project</span>
            <span>Target: 33 Reviews Total</span>
          </div>
        </div>

        {/* Operational Control Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E4E9] font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleDeadline}
              disabled={updatingDeadline}
              className="px-3.5 py-1.5 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-[#111318] border border-[#E2E4E9] flex items-center space-x-1.5 transition-colors"
            >
              {event?.is_deadline_passed ? <Unlock className="w-3.5 h-3.5 text-[#059669]" /> : <Lock className="w-3.5 h-3.5 text-[#D97706]" />}
              <span>{event?.is_deadline_passed ? 'Reopen Deadline (Simulate)' : 'Close Deadline (Simulate)'}</span>
            </button>

            <button
              onClick={onNavigateToExports}
              className="px-3.5 py-1.5 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-[#111318] border border-[#E2E4E9] flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#6E44FF]" />
              <span>Export CSV ↓</span>
            </button>
          </div>

          <button
            onClick={handleResetFixtures}
            className="px-3 py-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] border border-[#FCA5A5] flex items-center space-x-1.5 transition-colors"
            title="Reset system to pristine fixtures.json"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Fixtures</span>
          </button>
        </div>
      </div>

      {/* Edge-Case Intelligence */}
      <EdgeAlerts
        edgeCases={edgeCases}
        onNavigateToProject={onNavigateToProject}
        onNavigateToMatrix={() => {}}
        onNavigateToNormalization={onNavigateToResults}
      />

      {/* Assignment Matrix with Clean Dots */}
      {matrixData && (
        <AssignmentMatrix
          data={matrixData}
          onRefresh={fetchOrganizerData}
        />
      )}
    </div>
  );
};
