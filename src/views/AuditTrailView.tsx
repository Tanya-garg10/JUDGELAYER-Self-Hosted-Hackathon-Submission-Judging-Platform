import React, { useState, useEffect } from 'react';
import { AuditLogEntry, User } from '../types';
import { api } from '../api';
import { 
  ScrollText, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Search, 
  Filter,
  Terminal,
  Clock,
  KeyRound
} from 'lucide-react';

interface AuditTrailViewProps {
  currentUser: User;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BLOCKED_403' | 'SUCCESS'>('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getActorBadge = (actorName: string, action: string) => {
    if (action.includes('PEER_ISOLATION') || action.includes('BLOCKED') || action.includes('ACCESS_DENIED')) {
      return { label: 'ACCESS CONTROL', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#FCA5A5]' };
    }
    if (actorName.includes('Judge A')) {
      return { label: 'JUDGE-01 (ADA)', bg: 'bg-[#F5F3FF]', text: 'text-[#6E44FF]', border: 'border-[#DDD6FE]' };
    }
    if (actorName.includes('Judge B')) {
      return { label: 'JUDGE-02 (MARCUS)', bg: 'bg-[#F5F3FF]', text: 'text-[#6E44FF]', border: 'border-[#DDD6FE]' };
    }
    if (actorName.includes('Judge C')) {
      return { label: 'JUDGE-03 (ARIS)', bg: 'bg-[#F5F3FF]', text: 'text-[#6E44FF]', border: 'border-[#DDD6FE]' };
    }
    if (actorName.includes('Organizer')) {
      return { label: 'ORGANIZER', bg: 'bg-[#FAF5FF]', text: 'text-[#9333EA]', border: 'border-[#E9D5FF]' };
    }
    if (actorName.includes('Participant')) {
      return { label: 'PARTICIPANT', bg: 'bg-[#F0FDF4]', text: 'text-[#059669]', border: 'border-[#BBF7D0]' };
    }
    return { label: 'SYSTEM SUPERVISOR', bg: 'bg-[#F3F4F6]', text: 'text-[#374151]', border: 'border-[#E5E7EB]' };
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#6E44FF] uppercase tracking-wider font-bold">
            <ScrollText className="w-4 h-4" />
            <span>CRYPTOGRAPHIC LEDGER STREAM</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111318] tracking-tight mt-1">
            Tamper-Proof Audit Timeline
          </h2>
          <p className="text-xs text-[#6B7280] font-mono mt-0.5">
            Real-time chronological verification of every evaluation, submission, and boundary probe.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-xs font-mono text-[#111318] border border-[#E2E4E9] flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6E44FF] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stream</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stream, actors, hashes..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318] placeholder:text-[#9CA3AF] shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(['ALL', 'BLOCKED_403', 'SUCCESS'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                statusFilter === filter
                  ? filter === 'BLOCKED_403'
                    ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] font-bold'
                    : 'bg-[#111318] text-white font-bold'
                  : 'bg-white text-[#6B7280] border border-[#E2E4E9]'
              }`}
            >
              {filter === 'ALL' ? 'All Stream' : filter === 'BLOCKED_403' ? 'Blocked (403)' : 'Verified'}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline Stream as requested */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E4E9] shadow-xs space-y-6">
        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E5E7EB] space-y-8 font-mono">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280]">
              No audit records matching filter criteria.
            </div>
          ) : (
            filteredLogs.map(log => {
              const isBlocked = log.status === 'BLOCKED_403';
              const badge = getActorBadge(log.actor_name, log.action);
              const timeString = new Date(log.timestamp).toLocaleTimeString([], { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              });

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                    isBlocked 
                      ? 'border-[#DC2626] bg-[#DC2626] shadow-[0_0_8px_rgba(220,38,38,0.4)]' 
                      : 'border-[#6E44FF] bg-[#6E44FF]'
                  }`}></div>

                  {/* Log Content Card */}
                  <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] hover:border-[#6E44FF]/40 transition-all space-y-2">
                    {/* Top Row: Timestamp & Actor Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-[#111318] text-sm tracking-tight">{timeString}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isBlocked ? (
                          <span className="inline-flex items-center space-x-1 text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FCA5A5]">
                            <Lock className="w-3 h-3" />
                            <span>ACCESS BLOCKED (403)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>RECORDED & SIGNED</span>
                          </span>
                        )}
                        <span className="text-[10px] text-[#9CA3AF]">{log.id}</span>
                      </div>
                    </div>

                    {/* Action Title */}
                    <div className="text-xs font-bold text-[#111318] flex items-center space-x-2">
                      <span className="text-[#6E44FF]">→</span>
                      <span>{log.action}</span>
                    </div>

                    {/* Details explanation */}
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {log.details}
                    </p>

                    {/* Technical footer metadata */}
                    <div className="pt-1 text-[10px] text-[#9CA3AF] flex items-center justify-between border-t border-[#E2E4E9]/60">
                      <span>Resource: {log.resource_type} ({log.resource_id})</span>
                      <span>Actor: {log.actor_name}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
