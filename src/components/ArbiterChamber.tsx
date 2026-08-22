import React, { useEffect } from 'react';
import { Scale, CheckCircle, XCircle, AlertTriangle, Trophy, ShieldCheck, Flame, Cpu, ArrowUpRight, Zap, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ArbiterEvaluationResult, Scenario } from '../types';
import { AiTag, AiFeatureBadge } from './AiTag';

interface ArbiterChamberProps {
  arbiterResult?: ArbiterEvaluationResult;
  scenario: Scenario;
  isEvaluating: boolean;
  onNextRound: () => void;
  onOpenMatchReport?: () => void;
}

export const ArbiterChamber: React.FC<ArbiterChamberProps> = ({
  arbiterResult,
  scenario,
  isEvaluating,
  onNextRound,
  onOpenMatchReport,
}) => {
  useEffect(() => {
    if (arbiterResult?.verdict === 'BLUE_WIN') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#38bdf8', '#34d399', '#818cf8']
        });
      } catch (e) {}
    }
  }, [arbiterResult?.verdict]);

  const getVerdictStyle = (v?: string) => {
    switch (v) {
      case 'BLUE_WIN':
        return {
          bg: 'bg-gradient-to-r from-emerald-950/80 via-[#0e1624] to-sky-950/80',
          border: 'border-emerald-500/70',
          text: 'text-emerald-300',
          badge: 'bg-emerald-900 text-emerald-200 border-emerald-500',
          icon: ShieldCheck
        };
      case 'RED_WIN':
        return {
          bg: 'bg-gradient-to-r from-rose-950/80 via-[#180e14] to-rose-950/80',
          border: 'border-rose-500/70',
          text: 'text-rose-300',
          badge: 'bg-rose-900 text-rose-200 border-rose-500',
          icon: Flame
        };
      case 'PATCH_BROKE_PROD':
        return {
          bg: 'bg-gradient-to-r from-amber-950/80 via-[#18140e] to-[#0f1422]',
          border: 'border-amber-500/70',
          text: 'text-amber-300',
          badge: 'bg-amber-900 text-amber-200 border-amber-500',
          icon: AlertTriangle
        };
      default:
        return {
          bg: 'bg-[#0a0d15]/90',
          border: 'border-[#1a2333]',
          text: 'text-slate-300',
          badge: 'bg-[#141b2b] text-slate-300 border-[#222d42]',
          icon: Scale
        };
    }
  };

  const style = getVerdictStyle(arbiterResult?.verdict);
  const VerdictIcon = style.icon;

  return (
    <div className={`bg-[#0c0f18] border ${style.border} rounded-xl overflow-hidden shadow-xl transition-all duration-300`}>
      {/* Header */}
      <div className="bg-[#090c14] px-4 py-3 border-b border-[#1a2333] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#141b2b] border border-[#232f48] text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <span>ARBITER DECISION CHAMBER</span>
              <AiFeatureBadge label="AI JUDGE" />
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#161f31] text-slate-300 border border-[#243350] font-mono">
                Automated Judge & Regression Suite
              </span>
            </h2>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>Target: <span className="text-cyan-300 font-semibold">{scenario.targetService}</span> • Class: {scenario.vulnerabilityType}</span>
              <AiTag label="AUTOMATED VERDICT" size="xs" variant="blue" />
            </div>
          </div>
        </div>

        {isEvaluating ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-mono animate-pulse">
            <Zap className="w-3.5 h-3.5 animate-spin" />
            <span className="font-semibold text-[11px]">RUNNING DUAL-VERIFICATION SUITE...</span>
          </div>
        ) : arbiterResult ? (
          <div className="flex items-center gap-2">
            {onOpenMatchReport && (
              <button
                id="arbiter-export-report-btn"
                onClick={onOpenMatchReport}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                title="Download Match Audit Report (PDF/JSON)"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Report</span>
              </button>
            )}
            <button
              id="arbiter-next-round-btn"
              onClick={onNextRound}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-mono text-xs font-bold shadow-md shadow-cyan-950/60 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Advance Next Round</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500">Awaiting Phase 4 Trigger</span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Verdict Banner */}
        {arbiterResult ? (
          <div className={`p-4 rounded-xl border ${style.border} ${style.bg} space-y-2.5 shadow-sm`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <VerdictIcon className={`w-6 h-6 ${style.text} animate-bounce`} />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Authoritative Verdict</div>
                  <h3 className={`text-base font-bold font-mono ${style.text}`}>
                    {arbiterResult.verdictTitle}
                  </h3>
                </div>
              </div>

              {/* Score Impact Pill */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="px-2.5 py-1 rounded-md bg-[#090c14] border border-[#1e273b] text-slate-300 font-semibold">
                  <span className="text-rose-400">RED: +{arbiterResult.scoreDelta.red}</span>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-[#090c14] border border-[#1e273b] text-slate-300 font-semibold">
                  <span className="text-sky-400">BLUE: +{arbiterResult.scoreDelta.blue}</span>
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-200 leading-relaxed bg-black/50 p-3 rounded-lg border border-white/5">
              {arbiterResult.arbiterAnalysis}
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-[#1a2333] bg-[#090c14] text-center font-mono text-xs text-slate-500">
            The Arbiter is waiting for Red Agent exploitation and Blue Agent hotfix synthesis to conclude before executing dual validation.
          </div>
        )}

        {/* Validation Suite Dual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {/* Test 1: Zero-Downtime Normal Traffic Suite */}
          <div className="bg-[#090c14] border border-[#1a2333] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#182234] pb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Zero-Downtime User Traffic Tests:
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${arbiterResult?.uptimeCheckPassed ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' : 'bg-[#141b2b] text-slate-400'}`}>
                {arbiterResult?.uptimeCheckPassed ? '100% PASS (SLA MET)' : 'PENDING'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
              {arbiterResult?.normalTrafficResults && arbiterResult.normalTrafficResults.length > 0 ? (
                arbiterResult.normalTrafficResults.map((t) => (
                  <div
                    key={t.id}
                    className={`p-2 rounded-md flex items-center justify-between text-[11px] border ${
                      t.passed ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      {t.passed ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                      <span className="truncate">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-400">{t.latencyMs}ms</span>
                      <span className="font-bold">HTTP {t.statusCode}</span>
                    </div>
                  </div>
                ))
              ) : (
                scenario.normalTrafficSamples.map((s, idx) => (
                  <div key={idx} className="p-2 rounded-md bg-[#0d121f] border border-[#1a2333] text-slate-400 flex items-center justify-between text-[11px]">
                    <span>{s.name}</span>
                    <span className="text-[10px] text-slate-500">Exp: HTTP {s.expectedStatus}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Test 2: Exploit Payload Neutralization Re-Test */}
          <div className="bg-[#090c14] border border-[#1a2333] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#182234] pb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Exploit Neutralization Re-Test:
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${arbiterResult?.exploitNeutralized ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'}`}>
                {arbiterResult?.exploitNeutralized ? 'NEUTRALIZED' : arbiterResult ? 'FAILED' : 'PENDING'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d121f] border border-[#1a2333] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Exploit HTTP Status:</span>
                <span className={`font-bold ${arbiterResult?.exploitReTest.statusCode === 200 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  HTTP {arbiterResult?.exploitReTest.statusCode || '---'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed">
                {arbiterResult?.exploitReTest.details || 'Awaiting hot-patch deployment to re-fire offensive vector.'}
              </div>
              {arbiterResult?.exploitReTest.outputSample && (
                <pre className="bg-[#070910] p-2 rounded text-[10px] text-slate-400 overflow-x-auto truncate border border-[#161f31]">
                  {arbiterResult.exploitReTest.outputSample}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
