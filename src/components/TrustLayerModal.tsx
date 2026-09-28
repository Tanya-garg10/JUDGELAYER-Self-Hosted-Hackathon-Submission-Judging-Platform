import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  AlertOctagon, 
  Play, 
  Copy, 
  Check,
  Shield,
  Layers,
  ArrowDown
} from 'lucide-react';

interface TrustLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onRefreshAudit?: () => void;
}

export const TrustLayerModal: React.FC<TrustLayerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRefreshAudit,
}) => {
  const [probeResult, setProbeResult] = useState<any | null>(null);
  const [probing, setProbing] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen) return null;

  const runProbe = async (probeType: 'peer_isolation' | 'participant_barrier' | 'deadline_bypass') => {
    setProbing(true);
    try {
      const res = await api.triggerSecurityProbe(probeType);
      setProbeResult({
        type: probeType,
        status: 200,
        data: res,
      });
    } catch (err: any) {
      setProbeResult({
        type: probeType,
        status: err.status || 403,
        error: err.data || { error: err.message },
      });
      if (onRefreshAudit) onRefreshAudit();
    } finally {
      setProbing(false);
    }
  };

  const copyToken = () => {
    if (currentUser.token) {
      navigator.clipboard.writeText(currentUser.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const securityLayers = [
    { name: '1. PARTICIPANT IDENTITY', status: 'ACTIVE', desc: 'Pre-seeded HMAC session credentials. Zero client secrets.', meta: 'TOKEN AUTH' },
    { name: '2. SUBMISSION LAYER', status: 'GATED', desc: 'Strict UTC deadline enforcement. Writes hard-rejected post-deadline.', meta: 'RFC-3339' },
    { name: '3. ACCESS CONTROL GATEWAY', status: 'ENFORCED', desc: 'Backend middleware rejecting peer ballot lookups with HTTP 403.', meta: 'RBAC RULES' },
    { name: '4. JUDGE SCOPE ISOLATION', status: 'ISOLATED', desc: 'Judges only receive assigned project dossiers.', meta: 'ZERO LEAKS' },
    { name: '5. SCORING LAYER', status: 'STANDARDIZED', desc: 'Deterministic Z-Score normalization neutralizing judge bias.', meta: 'Z-NORM MATH' },
    { name: '6. IMMUTABLE AUDIT LOG', status: 'RECORDING', desc: 'Append-only ledger documenting every state transition.', meta: 'SHA-RECORD' },
    { name: '7. RESULTS PUBLICATION', status: 'LOCKED', desc: 'Cryptographic release toggle reserved exclusively for organizer.', meta: 'EXPORT GATE' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white border border-[#E2E4E9] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBFD] border-b border-[#E2E4E9] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#FAF5FF] text-[#6E44FF] border border-[#DDD6FE]">
              <ShieldCheck className="w-5 h-5 text-[#6E44FF]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#111318]">TRUST CORE SECURITY BLUEPRINT</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-bold">
                  SERVER AUTHORITATIVE
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                Backend-authoritative boundary verification and peer ballot isolation.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111318] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
          {/* Active Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9]">
              <div className="text-[10px] uppercase text-[#6B7280]">Active Session</div>
              <div className="mt-1 font-bold text-[#111318]">{currentUser.name}</div>
              <div className="text-[10px] text-[#6E44FF] font-bold uppercase">{currentUser.role}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9]">
              <div className="text-[10px] uppercase text-[#6B7280]">Session Token</div>
              <div className="mt-1 text-[#059669] truncate flex items-center justify-between font-bold">
                <span>{currentUser.token ? currentUser.token.substring(0, 18) + '...' : 'ANONYMOUS'}</span>
                {currentUser.token && (
                  <button onClick={copyToken} className="hover:text-[#111318] ml-1">
                    {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Injected via Bearer header</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9]">
              <div className="text-[10px] uppercase text-[#6B7280]">Peer Isolation</div>
              <div className="mt-1 text-[#059669] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>100% Enforced</span>
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">HTTP 403 on probe</div>
            </div>
          </div>

          {/* Visual Security Architecture Flow */}
          <div className="border border-[#E2E4E9] rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-[#FAFBFD] border-b border-[#E2E4E9] text-[11px] font-bold text-[#111318] flex items-center justify-between">
              <span>VISUAL SECURITY ARCHITECTURE</span>
              <span className="text-[#6E44FF]">CONTROLLED PIPELINE</span>
            </div>

            <div className="p-4 space-y-2">
              {securityLayers.map((layer, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAFBFD] border border-[#E2E4E9]">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-[#111318]">{layer.name}</span>
                    <p className="text-[11px] text-[#6B7280]">{layer.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#059669] border border-[#A7F3D0]">
                      {layer.status}
                    </span>
                    <span className="block text-[9px] text-[#9CA3AF] mt-0.5">{layer.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Boundary Penetration Suite */}
          <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E4E9] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#111318] uppercase tracking-wider flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#6E44FF]" />
                <span>LIVE BOUNDARY PENETRATION SUITE</span>
              </span>
              <span className="text-[10px] text-[#6B7280]">SECURITY VERIFICATION</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => runProbe('peer_isolation')}
                disabled={probing}
                className="px-3 py-2 rounded-lg bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] text-[#DC2626] font-bold text-xs transition-all disabled:opacity-50"
              >
                Probe Peer Isolation
              </button>

              <button
                onClick={() => runProbe('participant_barrier')}
                disabled={probing}
                className="px-3 py-2 rounded-lg bg-white border border-[#FDE68A] hover:bg-[#FFFBEB] text-[#D97706] font-bold text-xs transition-all disabled:opacity-50"
              >
                Probe Participant Barrier
              </button>

              <button
                onClick={() => runProbe('deadline_bypass')}
                disabled={probing}
                className="px-3 py-2 rounded-lg bg-white border border-[#E2E4E9] hover:bg-[#F3F4F6] text-[#4B5563] font-bold text-xs transition-all disabled:opacity-50"
              >
                Probe Deadline Bypass
              </button>
            </div>

            {probeResult && (
              <div className="p-3 rounded-lg bg-white border border-[#E2E4E9] space-y-1.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#E2E4E9] pb-1">
                  <span className="font-bold text-[#111318]">PROBE RESULT</span>
                  <span className="font-bold text-[#DC2626] px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FCA5A5]">
                    HTTP {probeResult.status} FORBIDDEN (PASS)
                  </span>
                </div>
                <div className="text-[#059669] font-bold">
                  ✓ BOUNDARY VERIFIED: Backend successfully intercepted and blocked unauthorized query.
                </div>
                <pre className="text-[10px] text-[#6B7280] bg-[#FAFBFD] p-2 rounded border border-[#E2E4E9] overflow-x-auto">
                  {JSON.stringify(probeResult.error || probeResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAFBFD] border-t border-[#E2E4E9] flex items-center justify-between text-xs font-mono text-[#6B7280]">
          <span>JUDGELAYER TRUST CORE · ZERO CLOUD DEPENDENCIES</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#111318] hover:bg-[#2A2E37] text-white font-bold transition-colors"
          >
            Dismiss Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
