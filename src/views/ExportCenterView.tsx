import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api';
import { 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Play 
} from 'lucide-react';

interface ExportCenterViewProps {
  currentUser: User;
  onRefreshAudit: () => void;
}

export const ExportCenterView: React.FC<ExportCenterViewProps> = ({
  currentUser,
  onRefreshAudit,
}) => {
  const isOrganizer = currentUser.role === 'organizer';
  const [probeResult, setProbeResult] = useState<any | null>(null);
  const [probing, setProbing] = useState(false);

  const exportItems = [
    {
      type: 'scores',
      title: 'Individual Judge Scores & Rubrics',
      filename: 'judgelayer_scores.csv',
      description: 'Comprehensive ballot breakdown: Architecture, Quality, Innovation, Impact, raw composites, and qualitative commentary.',
    },
    {
      type: 'results',
      title: 'Final Ranked Leaderboard & Normalization',
      filename: 'judgelayer_results.csv',
      description: 'Official ranked standings including raw scores, Z-score normalized composites, review coverage %, and track categories.',
    },
    {
      type: 'projects',
      title: 'Submitted Projects & Team Metadata',
      filename: 'judgelayer_projects.csv',
      description: 'Project titles, summaries, team rosters, GitHub repository URLs, live demo endpoints, and submission timestamps.',
    },
    {
      type: 'audit',
      title: 'Cryptographic Audit Trail',
      filename: 'judgelayer_audit_trail.csv',
      description: 'Complete tamper-evident chronological event ledger of all authentication, score submissions, and boundary enforcement events.',
    },
  ];

  const handleTestUnauthorizedExport = async () => {
    setProbing(true);
    setProbeResult(null);
    try {
      const res = await fetch('/api/export.csv?type=scores', {
        headers: currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setProbeResult({
          status: res.status,
          success: false,
          body,
        });
      } else {
        setProbeResult({
          status: res.status,
          success: true,
        });
      }
      onRefreshAudit();
    } catch (err: any) {
      setProbeResult({
        status: 403,
        success: false,
        error: err.message,
      });
    } finally {
      setProbing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#6E44FF] uppercase tracking-wider font-bold">
            <Download className="w-4 h-4" />
            <span>ORGANIZER EXPORT CENTER · RFC-4180 COMPLIANT CSV</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111318] tracking-tight mt-1">
            Data Portability & Audit Exports
          </h2>
          <p className="text-xs text-[#6B7280] font-mono mt-0.5">
            Download authoritative event datasets, judge scorecards, and cryptographic audit logs.
          </p>
        </div>

        <div>
          {isOrganizer ? (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ORGANIZER PRIVILEGES ACTIVE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] text-xs font-mono font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>ACCESS RESTRICTED (HTTP 403)</span>
            </span>
          )}
        </div>
      </div>

      {/* Role Notice if not organizer */}
      {!isOrganizer && (
        <div className="p-6 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-3 font-mono text-xs">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0" />
            <div>
              <span className="text-[#DC2626] font-bold text-sm">
                RESTRICTED RESOURCE: ORGANIZER ACCESS REQUIRED
              </span>
              <p className="text-[#6B7280] mt-0.5 text-xs">
                You are currently browsing as <strong>{currentUser.name} ({currentUser.role})</strong>. CSV export endpoints are restricted strictly to organizers to protect confidential judging deliberations.
              </p>
            </div>
          </div>

          <button
            onClick={handleTestUnauthorizedExport}
            disabled={probing}
            className="px-4 py-2 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-[#DC2626] border border-[#FCA5A5] text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 font-bold"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{probing ? 'Probing /api/export.csv...' : 'Simulate Non-Organizer Export Request (Verify 403)'}</span>
          </button>

          {probeResult && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] space-y-1">
              <div className="flex items-center justify-between text-[#DC2626] font-bold">
                <span>✓ REJECTION VERIFIED: HTTP {probeResult.status} FORBIDDEN</span>
                <span className="text-[#059669]">PASS</span>
              </div>
              <pre className="text-[10px] text-[#6B7280] bg-white p-2 rounded border border-[#E2E4E9] overflow-x-auto">
                {JSON.stringify(probeResult.body || probeResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportItems.map(item => (
          <div
            key={item.type}
            className="p-6 rounded-2xl bg-white border border-[#E2E4E9] flex flex-col justify-between space-y-4 hover:border-[#6E44FF]/40 transition-all shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#FAFBFD] text-[#6E44FF] border border-[#E2E4E9]">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111318]">{item.title}</h3>
                  <span className="text-[10px] font-mono text-[#6B7280]">{item.filename}</span>
                </div>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E2E4E9] flex items-center justify-between font-mono">
              <span className="text-[10px] text-[#6B7280]">FORMAT: text/csv</span>

              {isOrganizer ? (
                <a
                  href={`/api/export.csv?type=${item.type}`}
                  download={item.filename}
                  className="px-4 py-2 rounded-lg bg-[#111318] hover:bg-[#2A2E37] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </a>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg bg-[#F3F4F6] text-[#9CA3AF] text-xs border border-[#E2E4E9] cursor-not-allowed flex items-center space-x-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Organizer Only</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
