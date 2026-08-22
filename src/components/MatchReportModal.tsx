import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Share2, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  Copy, 
  Cpu, 
  Activity, 
  Zap, 
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';
import { MatchReportData } from '../types';
import { downloadReportAsPdf, downloadReportAsJson } from '../utils/reportGenerator';

interface MatchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: MatchReportData;
}

export const MatchReportModal: React.FC<MatchReportModalProps> = ({
  isOpen,
  onClose,
  reportData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isBlueWin = reportData.finalVerdict === 'BLUE_WIN';
  const isRedWin = reportData.finalVerdict === 'RED_WIN';

  const handleCopyMarkdown = () => {
    const md = `# Cyber Defense Arena Match Report
**Match ID**: ${reportData.matchId}
**Date**: ${new Date(reportData.timestamp).toUTCString()}
**Scenario**: ${reportData.scenario.name} (${reportData.scenario.cweId})
**Target Microservice**: ${reportData.scenario.targetService}

## Summary Metrics
- **Final Verdict**: ${reportData.verdictTitle}
- **Resilience Score**: ${reportData.overallResilienceScore}%
- **Production Uptime**: ${reportData.productionUptimePercent}%
- **Mitigation Success Rate**: ${reportData.mitigationSuccessRate}%
- **Match Score**: Blue ${reportData.scores.blue} - Red ${reportData.scores.red} (Draws: ${reportData.scores.draws})

## Arbiter Analysis
${reportData.arbiterAnalysis}

## Attack Path Traversal
- **Entry Point**: ${reportData.attackPathData.entryPoint}
- **Target Sink**: ${reportData.attackPathData.targetSink}
- **Blast Radius**: ${reportData.attackPathData.blastRadius}
${reportData.attackPathData.hops.map(h => `1. **Hop ${h.hopNumber} (${h.nodeName})**: ${h.action} [${h.mitreTechnique}] -> ${h.status.toUpperCase()}`).join('\n')}

## Containment Recommendation
${reportData.attackPathData.containmentRecommendation}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#090d16] border border-[#1e2a3f] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100">
        {/* Header */}
        <div className="bg-[#070a12] px-6 py-4 border-b border-[#172235] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                POST-MATCH SECURITY AUDIT REPORT
                <span className="text-xs font-normal text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700">
                  {reportData.matchId}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed offline review artifact with MITRE ATT&CK traversal, SLA metrics, and Arbiter verdict.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-pdf-report-btn"
              onClick={() => downloadReportAsPdf(reportData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              id="download-json-report-btn"
              onClick={() => downloadReportAsJson(reportData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/70 text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              id="close-match-report-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#121826] text-slate-400 hover:text-white hover:bg-[#1a2336] transition-colors border border-[#232f48] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#080b13]">
          {/* Executive Verdict Banner */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isBlueWin
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              : isRedWin
              ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/60 text-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl border mt-0.5 ${
                isBlueWin
                  ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300'
                  : isRedWin
                  ? 'bg-rose-900/60 border-rose-400 text-rose-300'
                  : 'bg-amber-900/60 border-amber-400 text-amber-300'
              }`}>
                {isBlueWin ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    Arbiter Verdict
                  </span>
                  <span className="text-xs text-slate-400">
                    Target: {reportData.scenario.targetService}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  {reportData.verdictTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {reportData.arbiterAnalysis}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/80 border border-white/20 text-xs font-bold flex items-center gap-1.5 text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied MD' : 'Copy Brief'}</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Resilience Score
              </span>
              <div className="text-xl font-bold text-cyan-300">
                {reportData.overallResilienceScore}%
              </div>
              <div className="text-[10px] text-slate-500">Defense robustness</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Production Uptime
              </span>
              <div className="text-xl font-bold text-emerald-300">
                {reportData.productionUptimePercent}%
              </div>
              <div className="text-[10px] text-slate-500">Zero-downtime SLA</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Mitigation Rate
              </span>
              <div className="text-xl font-bold text-purple-300">
                {reportData.mitigationSuccessRate}%
              </div>
              <div className="text-[10px] text-slate-500">Attack neutralized</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Round Score
              </span>
              <div className="text-xl font-bold text-slate-200">
                <span className="text-blue-400">{reportData.scores.blue}</span>
                <span className="text-slate-600 mx-1">-</span>
                <span className="text-red-400">{reportData.scores.red}</span>
              </div>
              <div className="text-[10px] text-slate-500">Blue vs Red victories</div>
            </div>
          </div>

          {/* Attack Path Data Breakdown */}
          <div className="p-4 rounded-xl bg-[#0b0f1a] border border-[#172235] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Attack Path Traversal & Microservice Sinks
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400">Blast Radius:</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {reportData.attackPathData.blastRadius}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {reportData.attackPathData.hops.map((hop, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#06080f] border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-bold flex items-center justify-center text-[10px] border border-slate-700">
                      {hop.hopNumber}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{hop.nodeName}</span>
                        <span className="text-[10px] font-normal text-slate-500">({hop.protocol}:{hop.port})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{hop.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/60 text-red-300 border border-red-800/50">
                      {hop.mitreTechnique}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hop.status === 'exploited' ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'
                    }`}>
                      {hop.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-xs text-indigo-200">
              <span className="font-bold text-indigo-400">Containment Recommendation: </span>
              <span>{reportData.attackPathData.containmentRecommendation}</span>
            </div>
          </div>

          {/* Microservice Code & Hotfix Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0b0f1a] border border-[#172235] space-y-2">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Red Team Exploit Vector</span>
              </h4>
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Technique: </span>
                {reportData.redExploitDetails.mitreTechnique}
              </div>
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Target Sink: </span>
                {reportData.redExploitDetails.endpoint}
              </div>
              <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] text-rose-300 font-mono overflow-x-auto max-h-32">
                {reportData.redExploitDetails.payloadBody}
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-[#0b0f1a] border border-[#172235] space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Blue Team Mitigation Hotfix</span>
              </h4>
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Strategy: </span>
                {reportData.blueDefenseDetails.patchStrategy}
              </div>
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">D3FEND: </span>
                {reportData.blueDefenseDetails.d3fendRule}
              </div>
              <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] text-emerald-300 font-mono overflow-x-auto max-h-32">
                {reportData.blueDefenseDetails.patchedCode.slice(0, 300)}...
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#070a12] px-6 py-3 border-t border-[#172235] flex items-center justify-between text-xs text-slate-500">
          <span>Complies with ISO/IEC 27001 & NIST SP 800-53 security auditing frameworks.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
