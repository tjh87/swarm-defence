import React, { useState } from 'react';
import { Activity, ShieldCheck, Flame, Download, CheckCircle, FileSpreadsheet, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { SimulationRound } from '../types';

interface ThreatTelemetryProps {
  history: SimulationRound[];
  scores: { red: number; blue: number; draws: number };
  resilienceMetric: number;
}

export const ThreatTelemetry: React.FC<ThreatTelemetryProps> = ({
  history,
  scores,
  resilienceMetric,
}) => {
  const [copied, setCopied] = useState(false);

  const exportAuditLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swarm-defense-audit-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalRounds = history.length;
  const blueWinRate = totalRounds > 0 ? Math.round((scores.blue / (scores.blue + scores.red || 1)) * 100) : 100;

  return (
    <div className="bg-[#0c0f18] border border-[#1a2333] rounded-xl p-4 shadow-lg space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#1a2333] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">THREAT TELEMETRY & AUDIT INTELLIGENCE</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="export-audit-log-btn"
            onClick={exportAuditLog}
            className="px-2.5 py-1 rounded-lg bg-[#141b2b] hover:bg-[#1e2840] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-[#232f48] cursor-pointer text-xs"
            title="Download JSON audit log"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Incident Log</span>
          </button>
        </div>
      </div>

      {/* High-level metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#090c14] border border-[#1a2333] p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold">SIMULATED ROUNDS</div>
          <div className="text-lg font-bold text-slate-100 mt-0.5">{totalRounds}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sequential loops</div>
        </div>

        <div className="bg-[#090c14] border border-[#1a2333] p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold">BLUE WIN RATE</div>
          <div className="text-lg font-bold text-sky-400 mt-0.5">{blueWinRate}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Threats neutralized</div>
        </div>

        <div className="bg-[#090c14] border border-[#1a2333] p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold">RESILIENCE SCORE</div>
          <div className={`text-lg font-bold mt-0.5 ${resilienceMetric >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {resilienceMetric}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Architecture posture</div>
        </div>

        <div className="bg-[#090c14] border border-[#1a2333] p-2.5 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold">HOT-PATCH SLA</div>
          <div className="text-lg font-bold text-cyan-400 mt-0.5">99.8%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zero-downtime uptime</div>
        </div>
      </div>

      {/* Historical Incident Log List */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
          <span>SIMULATION ROUND HISTORY & POSTMORTEMS:</span>
          <span className="text-[10px] text-slate-500">{history.length} events logged</span>
        </div>

        <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
          {history.length > 0 ? (
            history.map((item, idx) => {
              const isBlue = item.arbiterResult?.verdict === 'BLUE_WIN';
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    isBlue ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200' : 'bg-rose-950/20 border-rose-900/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#121724] text-slate-400 text-[10px] font-bold border border-[#222f4b]">
                      R#{item.roundNumber}
                    </span>
                    <span className={`font-bold ${isBlue ? 'text-sky-300' : 'text-rose-300'}`}>
                      {item.scenario.targetService}
                    </span>
                    <span className="text-slate-500 text-[10px]">({item.scenario.cweId})</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-400 truncate max-w-[200px]">
                      {item.arbiterResult?.verdictTitle || 'Evaluating'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isBlue ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                      }`}
                    >
                      {item.arbiterResult?.verdict || 'DONE'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 rounded-lg bg-[#090c14] border border-[#1a2333] text-center text-slate-500">
              No historical incident rounds recorded yet. The automated state machine will populate telemetry as rounds execute.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
