import React, { useState } from 'react';
import { api } from '../api';
import { Search } from 'lucide-react';

interface AssignmentMatrixProps {
  data: {
    judges: Array<{ id: string; name: string; title: string }>;
    matrix: Array<{
      projectId: string;
      title: string;
      track: string;
      judges: Record<string, 'none' | 'assigned' | 'draft' | 'completed'>;
    }>;
  };
  onRefresh: () => void;
}

export const AssignmentMatrix: React.FC<AssignmentMatrixProps> = ({ data, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const filteredMatrix = data.matrix.filter(row =>
    row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.track.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = async (judgeId: string, projectId: string, currentlyAssigned: boolean) => {
    const key = `${judgeId}-${projectId}`;
    setToggling(key);
    try {
      await api.toggleAssignment(judgeId, projectId, !currentlyAssigned);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to update assignment: ${err.message}`);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E2E4E9] bg-white shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-[#E2E4E9] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#111318] tracking-tight font-mono uppercase">
            JUDGE × PROJECT ASSIGNMENT MATRIX
          </h3>
          <p className="text-xs text-[#6B7280] font-mono mt-0.5">
            Micro-dot distribution. Click any dot to toggle judge assignment.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] text-xs text-[#111318] font-mono placeholder:text-[#9CA3AF] focus:border-[#6E44FF] focus:outline-none w-48"
            />
          </div>

          {/* Legend Dots */}
          <div className="flex items-center space-x-3 text-[11px] font-mono text-[#6B7280]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
              <span>Reviewed</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6E44FF]"></span>
              <span>Assigned</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] border border-[#D1D5DB]"></span>
              <span>Unassigned</span>
            </span>
          </div>
        </div>
      </div>

      {/* Clean Dots Matrix Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="bg-[#FAFBFD] border-b border-[#E2E4E9] text-[11px] uppercase tracking-wider text-[#6B7280]">
              <th className="py-3 px-5 font-semibold w-1/3">Project Submission</th>
              {data.judges.map(j => (
                <th key={j.id} className="py-3 px-4 font-semibold text-center min-w-[120px]">
                  <div className="text-[#111318] font-bold">{j.name}</div>
                  <div className="text-[10px] text-[#9CA3AF] font-normal uppercase tracking-widest">{j.id}</div>
                </th>
              ))}
              <th className="py-3 px-4 font-semibold text-center w-24">Coverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E4E9]">
            {filteredMatrix.map(row => {
              const assignedCount = Object.values(row.judges).filter(s => s !== 'none').length;
              const completedCount = Object.values(row.judges).filter(s => s === 'completed').length;

              return (
                <tr key={row.projectId} className="hover:bg-[#FAFBFD] transition-colors">
                  <td className="py-3 px-5">
                    <div className="font-bold text-[#111318] text-xs">{row.title}</div>
                    <div className="text-[10px] text-[#6E44FF] mt-0.5">{row.track}</div>
                  </td>

                  {data.judges.map(j => {
                    const status = row.judges[j.id] || 'none';
                    const isKeyToggling = toggling === `${j.id}-${row.projectId}`;

                    return (
                      <td key={j.id} className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggle(j.id, row.projectId, status !== 'none')}
                          disabled={isKeyToggling}
                          className="group/dot inline-flex items-center justify-center p-2 rounded-full hover:bg-[#F3F4F6] transition-all cursor-pointer"
                          title={`${j.name} on ${row.title}: ${status.toUpperCase()} (Click to toggle)`}
                        >
                          {status === 'completed' ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-[#059669] shadow-xs flex items-center justify-center text-white text-[8px] font-bold group-hover/dot:scale-125 transition-transform">
                              ✓
                            </span>
                          ) : status === 'draft' ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-[#D97706] shadow-xs group-hover/dot:scale-125 transition-transform"></span>
                          ) : status === 'assigned' ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-[#6E44FF] shadow-xs group-hover/dot:scale-125 transition-transform"></span>
                          ) : (
                            <span className="w-3 h-3 rounded-full bg-[#E5E7EB] border border-[#D1D5DB] group-hover/dot:border-[#6E44FF] group-hover/dot:bg-[#6E44FF]/20 transition-all"></span>
                          )}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3 px-4 text-center">
                    <div className="font-mono text-xs font-bold text-[#111318]">
                      {completedCount} / 3
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">
                      {assignedCount} set
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
