import React from 'react';
import { Phase } from '../types';
import { Cpu, Flame, Shield, Scale, CheckCircle2 } from 'lucide-react';

interface PhaseOrchestratorBarProps {
  currentPhase: Phase;
  onSelectPhase?: (phase: Phase) => void;
  isAiProcessing: boolean;
  phaseTimeRemaining?: number;
  totalPhaseDuration?: number;
}

export const PhaseOrchestratorBar: React.FC<PhaseOrchestratorBarProps> = ({
  currentPhase,
  onSelectPhase,
  isAiProcessing,
  phaseTimeRemaining,
  totalPhaseDuration,
}) => {
  const phases = [
    {
      id: 'INIT' as Phase,
      title: '1. Target Init & AST Scope',
      desc: 'Target sandbox & AST parsing',
      icon: Cpu,
      accentColor: 'border-amber-500 text-amber-400 bg-amber-950/40',
      activeColor: 'ring-2 ring-amber-400/80 bg-amber-950/70 border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      id: 'RED_ATTACK' as Phase,
      title: '2. Red Agent Attack',
      desc: 'Exploit payload synthesis & mock firing',
      icon: Flame,
      accentColor: 'border-red-500 text-red-400 bg-red-950/40',
      activeColor: 'ring-2 ring-red-500/80 bg-red-950/70 border-red-400',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40'
    },
    {
      id: 'BLUE_DEFENSE' as Phase,
      title: '3. Blue Agent Defense',
      desc: 'Log triage & unified diff hot-patch',
      icon: Shield,
      accentColor: 'border-blue-500 text-blue-400 bg-blue-950/40',
      activeColor: 'ring-2 ring-blue-500/80 bg-blue-950/70 border-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    },
    {
      id: 'ARBITER_EVAL' as Phase,
      title: '4. Arbiter SLA Verification',
      desc: 'Exploit test + 100% uptime check',
      icon: Scale,
      accentColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
      activeColor: 'ring-2 ring-emerald-400/80 bg-emerald-950/70 border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    }
  ];

  const getPhaseIndex = (p: Phase) => {
    switch (p) {
      case 'INIT': return 0;
      case 'RED_ATTACK': return 1;
      case 'BLUE_DEFENSE': return 2;
      case 'ARBITER_EVAL': return 3;
      case 'ROUND_COMPLETE': return 4;
      default: return 0;
    }
  };

  const currentIndex = getPhaseIndex(currentPhase);

  return (
    <div className="bg-[#0b0f19] border border-[#1a2333] rounded-2xl p-3 sm:p-4 shadow-md font-mono">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Interactive Attack & Defense Phase Selector
          </span>
          {isAiProcessing && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 animate-pulse font-medium">
              Gemini Reasoning Active...
            </span>
          )}
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
          <span>Click any phase card below to switch team context manually</span>
        </div>
      </div>

      {/* 4-Stage Step Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {phases.map((p, index) => {
          const Icon = p.icon;
          const isActive = p.id === currentPhase;
          const isCompleted = currentIndex > index;

          return (
            <button
              type="button"
              id={`phase-card-${p.id.toLowerCase()}`}
              key={p.id}
              onClick={() => onSelectPhase?.(p.id)}
              className={`w-full text-left relative rounded-xl p-2.5 transition-all duration-200 border cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
                isActive
                  ? p.activeColor + ' shadow-md shadow-[#080a0f]'
                  : isCompleted
                  ? 'bg-[#0a0d15]/80 border-[#1a2333] hover:border-slate-500 text-slate-400 opacity-90'
                  : 'bg-[#080b12]/50 border-[#141b2b] hover:border-slate-600 text-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-md border ${
                      isActive ? p.accentColor : isCompleted ? 'border-[#222d42] bg-[#0e1422] text-emerald-400' : 'border-[#172030] text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h3 className={`text-xs font-mono font-bold ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-snug truncate max-w-[170px] sm:max-w-[200px]">
                      {p.desc}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${p.badgeColor}`}>
                    ACTIVE
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 font-semibold">
                    DONE
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
