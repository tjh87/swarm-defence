import React, { useState } from 'react';
import { Target, Terminal, Flame, Shield, CheckCircle2, Zap, Lock, Unlock, Network, Layers, Sparkles, Send, Crosshair } from 'lucide-react';
import { Phase, OperatorRole, Scenario } from '../types';
import { ScenarioMindMap } from './ScenarioMindMap';

interface KillChainStageTrackerProps {
  currentPhase: Phase;
  operatorRole: OperatorRole;
  activeScenario: Scenario;
  isRedExploitFired?: boolean;
  isBluePatchApplied?: boolean;
  onSelectStageOverride?: (stageId: number) => void;
}

export interface KillChainStage {
  id: number;
  name: string;
  category: 'RECON' | 'OFFENSE' | 'DEFENSE' | 'VERIFICATION';
  lmKillChainPhase: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export const KILL_CHAIN_STAGES: KillChainStage[] = [
  {
    id: 1,
    name: 'Reconnaissance',
    category: 'RECON',
    lmKillChainPhase: 'Phase 1: Reconnaissance',
    description: 'Map microservice topology, CWE vulnerability, and API contracts',
    icon: Target,
  },
  {
    id: 2,
    name: 'Weaponization',
    category: 'OFFENSE',
    lmKillChainPhase: 'Phase 2: Weaponization',
    description: 'Synthesize exploit payload and configure attack vector',
    icon: Terminal,
  },
  {
    id: 3,
    name: 'Delivery',
    category: 'OFFENSE',
    lmKillChainPhase: 'Phase 3: Delivery',
    description: 'Transmit HTTP exploit vector through ingress gateway proxy',
    icon: Send,
  },
  {
    id: 4,
    name: 'Exploitation',
    category: 'OFFENSE',
    lmKillChainPhase: 'Phase 4: Exploitation',
    description: 'Trigger CWE vulnerability execution on target service container',
    icon: Flame,
  },
  {
    id: 5,
    name: 'Installation',
    category: 'OFFENSE',
    lmKillChainPhase: 'Phase 5: Installation',
    description: 'Observe container privilege escalation and state mutation',
    icon: Layers,
  },
  {
    id: 6,
    name: 'C2 Defense',
    category: 'DEFENSE',
    lmKillChainPhase: 'Phase 6: Command & Control (C2)',
    description: 'Contain C2 traffic & compile AST zero-downtime hot-patch',
    icon: Shield,
  },
  {
    id: 7,
    name: 'Actions on Objectives',
    category: 'VERIFICATION',
    lmKillChainPhase: 'Phase 7: Actions on Objectives',
    description: 'Arbiter re-tests exploit containment and verifies 100% SLA uptime',
    icon: CheckCircle2,
  },
];

export const KillChainStageTracker: React.FC<KillChainStageTrackerProps> = ({
  currentPhase,
  operatorRole,
  activeScenario,
  isRedExploitFired,
  isBluePatchApplied,
  onSelectStageOverride,
}) => {
  // Manual stage selection state
  const [manualSelectedStage, setManualSelectedStage] = useState<number | null>(null);
  const [isAutoSwitchEnabled, setIsAutoSwitchEnabled] = useState<boolean>(true);
  const [showMindMap, setShowMindMap] = useState<boolean>(true);

  // Determine current stage number (1 to 7) from state machine
  const getAutoStageNumber = (): number => {
    if (currentPhase === 'INIT') return 1;
    if (currentPhase === 'RED_ATTACK') {
      return isRedExploitFired ? 4 : 2;
    }
    if (currentPhase === 'BLUE_DEFENSE') {
      return 6;
    }
    if (currentPhase === 'ARBITER_EVAL' || currentPhase === 'ROUND_COMPLETE') {
      return 7;
    }

    // Role-dependent fallbacks for interactive drill mode
    if (operatorRole === 'red_attacker') {
      return isRedExploitFired ? 4 : 2;
    }
    if (operatorRole === 'blue_defender') {
      return 6;
    }
    if (operatorRole === 'arbiter_judge') {
      return 7;
    }

    return 1;
  };

  const autoStageId = getAutoStageNumber();

  // Effective active stage ID: respects manual lock if user chose one
  const activeStageId = (!isAutoSwitchEnabled && manualSelectedStage !== null)
    ? manualSelectedStage
    : autoStageId;

  const currentStage = KILL_CHAIN_STAGES.find((s) => s.id === activeStageId) || KILL_CHAIN_STAGES[0];

  const handleSelectStage = (stageId: number) => {
    setManualSelectedStage(stageId);
    setIsAutoSwitchEnabled(false);
    if (onSelectStageOverride) {
      onSelectStageOverride(stageId);
    }
  };

  const handleResumeAutoSwitch = () => {
    setManualSelectedStage(null);
    setIsAutoSwitchEnabled(true);
  };

  // Dynamic theme colors based on active operator role
  const isRed = operatorRole === 'red_attacker';
  const isArbiter = operatorRole === 'arbiter_judge';

  const theme = {
    topIconBg: isRed
      ? 'bg-rose-950/80 border-rose-800/80 text-rose-400'
      : isArbiter
      ? 'bg-purple-950/80 border-purple-800/80 text-purple-400'
      : 'bg-cyan-950/80 border-cyan-800/80 text-cyan-400',
    stageBadge: isRed
      ? 'bg-rose-950 text-rose-300 border-rose-800'
      : isArbiter
      ? 'bg-purple-950 text-purple-300 border-purple-800'
      : 'bg-cyan-950 text-cyan-300 border-cyan-800',
    highlightText: isRed
      ? 'text-rose-300'
      : isArbiter
      ? 'text-purple-300'
      : 'text-cyan-300',
    unlockIcon: isRed
      ? 'text-rose-400'
      : isArbiter
      ? 'text-purple-400'
      : 'text-cyan-400',
    activeCard: isRed
      ? 'bg-gradient-to-b from-rose-950/90 via-[#180a0e] to-[#12080a] border-rose-500 ring-2 ring-rose-500/80 shadow-xl shadow-rose-950/60 scale-[1.02] z-10'
      : isArbiter
      ? 'bg-gradient-to-b from-purple-950/90 via-[#120a1f] to-[#0d0716] border-purple-400 ring-2 ring-purple-400/80 shadow-xl shadow-purple-950/60 scale-[1.02] z-10'
      : 'bg-gradient-to-b from-cyan-950/90 via-[#0a1222] to-[#080d1a] border-cyan-400 ring-2 ring-cyan-400/80 shadow-xl shadow-cyan-950/60 scale-[1.02] z-10',
    activeNumberBadge: isRed
      ? 'bg-rose-500 text-black font-extrabold'
      : isArbiter
      ? 'bg-purple-400 text-black font-extrabold'
      : 'bg-cyan-400 text-black font-extrabold',
    activeIconBox: isRed
      ? 'text-rose-300 bg-rose-950 border border-rose-700'
      : isArbiter
      ? 'text-purple-300 bg-purple-950 border border-purple-700'
      : 'text-cyan-300 bg-cyan-950 border border-cyan-700',
    activeTag: isRed
      ? 'bg-rose-950 text-rose-300 border border-rose-700 font-bold'
      : isArbiter
      ? 'bg-purple-950 text-purple-300 border border-purple-700 font-bold'
      : 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold',
  };

  return (
    <div className="bg-[#090d16] border border-[#1a2436] rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3 font-mono">
      {/* Top Banner: Stage Title, Mode Toggle, and Lockheed Martin Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162030] pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border transition-colors ${theme.topIconBg}`}>
            <Crosshair className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                LOCKHEED MARTIN CYBER KILL CHAIN TRACKER
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border transition-colors ${theme.stageBadge}`}>
                STAGE {activeStageId} OF 7
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                {currentStage.lmKillChainPhase}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono mt-0.5">
              Current Stage: <span className={`font-bold transition-colors ${theme.highlightText}`}>{currentStage.name}</span> — {currentStage.description}
            </p>
          </div>
        </div>

        {/* Controls: Auto-Switch Toggle & Mind Map View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Manual vs Auto Indicator & Button */}
          {!isAutoSwitchEnabled && manualSelectedStage !== null ? (
            <button
              onClick={handleResumeAutoSwitch}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/60 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors cursor-pointer shadow-md"
              title="Click to re-enable automated phase transitions"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>LOCKED ON STAGE #{manualSelectedStage} (CLICK TO UNLOCK)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setManualSelectedStage(activeStageId);
                setIsAutoSwitchEnabled(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Click to lock current stage and choose stages manually"
            >
              <Unlock className={`w-3.5 h-3.5 transition-colors ${theme.unlockIcon}`} />
              <span>AUTO-PROGRESSING (CLICK TO MANUALLY SELECT)</span>
            </button>
          )}

          {/* Toggle Mind Map Display */}
          <button
            onClick={() => setShowMindMap(!showMindMap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showMindMap
                ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{showMindMap ? 'HIDE MIND MAP' : 'SHOW SCENARIO MIND MAP'}</span>
          </button>
        </div>
      </div>

      {/* 7-Step Stage Progress Nodes (Clickable) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Click any of the 7 Lockheed Martin Cyber Kill Chain phases below to lock and inspect:</span>
          {!isAutoSwitchEnabled && (
            <span className="text-amber-400 font-bold animate-pulse">
              [ MANUAL STAGE SELECTION ACTIVE ]
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 pt-1">
          {KILL_CHAIN_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isSelected = stage.id === activeStageId;
            const isCompleted = stage.id < activeStageId;

            return (
              <button
                type="button"
                id={`kill-chain-stage-${stage.id}`}
                key={stage.id}
                onClick={() => handleSelectStage(stage.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between focus:outline-none focus:ring-1 focus:ring-cyan-500/50 hover:scale-[1.01] active:scale-[0.99] ${
                  isSelected
                    ? theme.activeCard
                    : isCompleted
                    ? 'bg-[#0a0f1c] border-emerald-800/60 text-slate-300 hover:border-emerald-600'
                    : 'bg-[#060810] border-slate-800/80 opacity-70 text-slate-400 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? theme.activeNumberBadge
                        : isCompleted
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    STAGE {stage.id}
                  </span>

                  <div
                    className={`p-1 rounded-md ${
                      isSelected
                        ? theme.activeIconBox
                        : isCompleted
                        ? 'text-emerald-400 bg-emerald-950/80'
                        : 'text-slate-500 bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-1">
                  <div
                    className={`text-[11px] font-bold font-mono ${
                      isSelected ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-300'
                    }`}
                  >
                    {stage.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-sans line-clamp-2 mt-0.5 leading-snug">
                    {stage.description}
                  </div>
                </div>

                {/* Lockheed Martin Cyber Kill Chain Sub-Tag */}
                <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8px]">
                  <span className="text-amber-400/90 font-bold truncate">
                    P{stage.id}: {stage.name}
                  </span>
                  {isSelected && (
                    <span className={`px-1 py-0.2 rounded font-bold ${theme.activeTag}`}>
                      ACTIVE
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Scenario Mind Map Component */}
      {showMindMap && (
        <div className="pt-2">
          <ScenarioMindMap
            activeScenario={activeScenario}
            activeStageId={activeStageId}
            onSelectStage={handleSelectStage}
            operatorRole={operatorRole}
          />
        </div>
      )}
    </div>
  );
};
