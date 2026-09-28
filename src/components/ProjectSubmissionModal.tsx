import React, { useState } from 'react';
import { Track, Project, EventConfig } from '../types';
import { api } from '../api';
import { X, Lock, AlertTriangle, Send } from 'lucide-react';

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  event: EventConfig | null;
  initialProject?: Project | null;
  onSuccess: () => void;
}

export const ProjectSubmissionModal: React.FC<ProjectSubmissionModalProps> = ({
  isOpen,
  onClose,
  tracks,
  event,
  initialProject,
  onSuccess,
}) => {
  const [title, setTitle] = useState(initialProject?.title || '');
  const [trackId, setTrackId] = useState(initialProject?.track_id || tracks[0]?.id || 'dev-tools');
  const [summary, setSummary] = useState(initialProject?.summary || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [repoUrl, setRepoUrl] = useState(initialProject?.repo_url || '');
  const [demoUrl, setDemoUrl] = useState(initialProject?.demo_url || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (initialProject) {
        await api.updateProject(initialProject.id, {
          title,
          track_id: trackId,
          summary,
          description,
          repo_url: repoUrl,
          demo_url: demoUrl,
        });
      } else {
        await api.createProject({
          title,
          track_id: trackId,
          summary,
          description,
          repo_url: repoUrl,
          demo_url: demoUrl,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.data?.message || err.message || 'Submission rejected by server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white border border-[#E2E4E9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBFD] border-b border-[#E2E4E9] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#111318] font-mono uppercase">
              {initialProject ? 'EDIT SUBMISSION DOSSIER' : 'REGISTER PROJECT EVIDENCE'}
            </h3>
            <p className="text-xs text-[#6B7280] font-mono mt-0.5">
              Submit project metadata, repository endpoints, and architecture notes
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111318] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deadline Warning Banner if closed */}
        {event?.is_deadline_passed && (
          <div className="px-6 py-3 bg-[#FEF2F2] border-b border-[#FCA5A5] flex items-center space-x-2 text-xs font-mono text-[#DC2626] font-bold">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              NOTICE: Event submissions closed on {event?.submissions_close}. Backend API will reject writes.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>SERVER-SIDE REJECTION (HTTP 403):</span>
              </div>
              <p className="text-[11px]">{errorMessage}</p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#6B7280] mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Quiet Hours"
              className="w-full px-3 py-2 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#6B7280] mb-1">
              Competition Track *
            </label>
            <select
              value={trackId}
              onChange={e => setTrackId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318]"
            >
              {tracks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#6B7280] mb-1">
              One-Line Summary Pitch *
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Concise summary of what your project achieves..."
              className="w-full px-3 py-2 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#6B7280] mb-1">
              Technical Architecture & Evidence Notes
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe components, sandbox runtime, benchmarks, and architecture..."
              className="w-full px-3 py-2 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#6B7280] mb-1">
                Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#6B7280] mb-1">
                Live Demo Endpoint
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={e => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9] focus:border-[#6E44FF] focus:outline-none text-xs text-[#111318]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#E2E4E9] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#FAFBFD] hover:bg-[#F3F4F6] text-[#4B5563] text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#111318] hover:bg-[#2A2E37] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#00C9DB]" />
              <span>{submitting ? 'Verifying with Gateway...' : 'Submit to Registry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
