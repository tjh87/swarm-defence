import React from 'react';
import { Scenario, OperatorRole } from '../types';
import { AiTag, AiFeatureBadge } from './AiTag';
import { 
  Target, 
  Terminal, 
  Flame, 
  Shield, 
  CheckCircle2, 
  Send,
  Layers,
  Sparkles
} from 'lucide-react';

interface ScenarioMindMapProps {
  activeScenario: Scenario;
  activeStageId: number; // 1 to 7
  onSelectStage: (stageId: number) => void;
  operatorRole?: OperatorRole;
}

export interface MindMapBranch {
  stageId: number;
  stageName: string;
  lmKillChainPhase: string;
  category: 'RECON' | 'OFFENSE' | 'DEFENSE' | 'VERIFICATION';
  icon: React.FC<{ className?: string }>;
  title: string;
  keyDetails: string[];
  summary: string;
}

export const ScenarioMindMap: React.FC<ScenarioMindMapProps> = ({
  activeScenario,
  activeStageId,
  onSelectStage,
  operatorRole = 'red_attacker',
}) => {
  // Construct branches dynamically from active scenario across all 7 LM Kill Chain phases
  const branches: MindMapBranch[] = [
    {
      stageId: 1,
      stageName: '1. Reconnaissance',
      lmKillChainPhase: 'Phase 1: Reconnaissance',
      category: 'RECON',
      icon: Target,
      title: 'Target Topology & Contract Mapping',
      keyDetails: [
        `Service: ${activeScenario.targetService}`,
        `File: ${activeScenario.targetFile}`,
        `CWE-${activeScenario.cweId} Flaw`
      ],
      summary: 'Map API endpoints, parameters, and AST vulnerability surface'
    },
    {
      stageId: 2,
      stageName: '2. Weaponization',
      lmKillChainPhase: 'Phase 2: Weaponization',
      category: 'OFFENSE',
      icon: Terminal,
      title: 'Payload Synthesis',
      keyDetails: [
        `Type: ${activeScenario.vulnerabilityType}`,
        `Method: ${activeScenario.defaultExploit.method}`,
        `Param: ${Object.keys(activeScenario.defaultExploit.body || {}).join(', ') || 'Query params'}`
      ],
      summary: 'Craft specialized exploit payload matching target vulnerability'
    },
    {
      stageId: 3,
      stageName: '3. Delivery',
      lmKillChainPhase: 'Phase 3: Delivery',
      category: 'OFFENSE',
      icon: Send,
      title: 'Vector Transmission',
      keyDetails: [
        `Endpoint: ${activeScenario.defaultExploit.path}`,
        `Headers: Content-Type: application/json`,
        `Ingress: Microservice Gateway`
      ],
      summary: 'Deliver HTTP request with payload to target service endpoint'
    },
    {
      stageId: 4,
      stageName: '4. Exploitation',
      lmKillChainPhase: 'Phase 4: Exploitation',
      category: 'OFFENSE',
      icon: Flame,
      title: 'Flaw Triggering',
      keyDetails: [
        `Category: ${activeScenario.category}`,
        `Rationale: ${activeScenario.defaultExploit.rationale.slice(0, 35)}...`
      ],
      summary: 'Trigger vulnerability in target container execution engine'
    },
    {
      stageId: 5,
      stageName: '5. Installation',
      lmKillChainPhase: 'Phase 5: Installation',
      category: 'OFFENSE',
      icon: Layers,
      title: 'Privilege Escalation',
      keyDetails: [
        'Sandbox / Namespace Infiltration',
        'State / Memory Mutation',
        'Privilege Context Escapes'
      ],
      summary: 'Observe compromise effects or sandbox isolation escape'
    },
    {
      stageId: 6,
      stageName: '6. C2 Defense',
      lmKillChainPhase: 'Phase 6: Command & Control (C2)',
      category: 'DEFENSE',
      icon: Shield,
      title: 'Containment & Hot-Patching',
      keyDetails: [
        'C2 Channel Egress Blocking',
        'AST & Regex Guardrails',
        'Unified Diff Hot-Patch'
      ],
      summary: 'Compile blue team zero-downtime hot-patch to contain attack'
    },
    {
      stageId: 7,
      stageName: '7. Actions on Objectives',
      lmKillChainPhase: 'Phase 7: Actions on Objectives',
      category: 'VERIFICATION',
      icon: CheckCircle2,
      title: 'SLA & Uptime Verification',
      keyDetails: [
        'Exploit Re-test: HTTP 403 Blocked',
        'Legitimate Probes: HTTP 200 OK',
        '100% Service SLA Uptime'
      ],
      summary: 'Arbiter re-tests containment & verifies zero service downtime'
    }
  ];

  // Dynamic theme variables based on operatorRole
  const isRed = operatorRole === 'red_attacker';
  const isArbiter = operatorRole === 'arbiter_judge';

  const mmTheme = {
    selectedStageBadge: isRed
      ? 'bg-rose-950 text-rose-300 border-rose-700'
      : isArbiter
      ? 'bg-purple-950 text-purple-300 border-purple-700'
      : 'bg-cyan-950 text-cyan-300 border-cyan-700',
    pingBg: isRed ? 'bg-rose-500' : isArbiter ? 'bg-purple-400' : 'bg-cyan-400',
    rootBorder: isRed
      ? 'border-rose-500/80 shadow-rose-950/40'
      : isArbiter
      ? 'border-purple-500/80 shadow-purple-950/40'
      : 'border-cyan-500/80 shadow-cyan-950/40',
    rootTag: isRed
      ? 'text-rose-400 bg-rose-950 border-rose-800'
      : isArbiter
      ? 'text-purple-400 bg-purple-950 border-purple-800'
      : 'text-cyan-400 bg-cyan-950 border-cyan-800',
    rootServiceText: isRed ? 'text-rose-300' : isArbiter ? 'text-purple-300' : 'text-cyan-300',
    activeBranchCard: isRed
      ? 'bg-gradient-to-b from-rose-950/90 via-[#180a0e] to-[#12080a] border-rose-500 ring-2 ring-rose-500/80 shadow-2xl shadow-rose-950/70 scale-[1.02] z-20'
      : isArbiter
      ? 'bg-gradient-to-b from-purple-950/90 via-[#120a1f] to-[#0d0716] border-purple-400 ring-2 ring-purple-400/80 shadow-2xl shadow-purple-950/70 scale-[1.02] z-20'
      : 'bg-gradient-to-b from-cyan-950/90 via-[#0a1324] to-[#080e1d] border-cyan-400 ring-2 ring-cyan-400/80 shadow-2xl shadow-cyan-950/70 scale-[1.02] z-20',
    activePNumberBadge: isRed
      ? 'bg-rose-500 text-black font-extrabold'
      : isArbiter
      ? 'bg-purple-400 text-black font-extrabold'
      : 'bg-cyan-400 text-black font-extrabold',
    activeIconBox: isRed
      ? 'bg-rose-950 text-rose-300 border border-rose-700'
      : isArbiter
      ? 'bg-purple-950 text-purple-300 border border-purple-700'
      : 'bg-cyan-950 text-cyan-300 border border-cyan-700',
    bulletDot: isRed ? 'text-rose-400' : isArbiter ? 'text-purple-400' : 'text-cyan-400',
    activeBottomBorder: isRed ? 'border-rose-800/60 text-rose-300' : isArbiter ? 'border-purple-800/60 text-purple-300' : 'border-cyan-800/60 text-cyan-300',
    activeTagPill: isRed ? 'bg-rose-950 border-rose-700' : isArbiter ? 'bg-purple-950 border-purple-700' : 'bg-cyan-950 border-cyan-700',
  };

  return (
    <div className="w-full bg-[#060911] border border-[#172236] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 font-mono text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162030] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/80 text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                LOCKHEED MARTIN CYBER KILL CHAIN MIND MAP (ALL 7 PHASES)
              </span>
              <AiFeatureBadge label="AI MIND MAP" />
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                STAGE {activeStageId} OF 7 ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Comprehensive 7-stage mapping covering all phases from Reconnaissance through Actions on Objectives
            </p>
          </div>
        </div>

        {/* Lock / Active Stage Tag */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Selected Stage:</span>
          <span className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 shadow-sm ${mmTheme.selectedStageBadge}`}>
            <span className={`w-2 h-2 rounded-full animate-ping ${mmTheme.pingBg}`} />
            Stage #{activeStageId}: {branches.find(b => b.stageId === activeStageId)?.stageName}
          </span>
        </div>
      </div>

      {/* Mind Map Canvas Flow */}
      <div className="relative pt-1 pb-1">
        {/* Central Scenario Root Node */}
        <div className="flex justify-center mb-4">
          <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border-2 shadow-xl text-center max-w-md w-full relative transition-all ${mmTheme.rootBorder}`}>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border transition-colors ${mmTheme.rootTag}`}>
              SCENARIO ROOT TARGET
            </span>
            <h3 className="text-sm font-extrabold text-white mt-1">
              {activeScenario.name}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-slate-300">
              <span className="text-rose-400 font-bold">CWE-{activeScenario.cweId}</span>
              <span>•</span>
              <span className="text-slate-400">{activeScenario.category}</span>
              <span>•</span>
              <span className={`font-bold transition-colors ${mmTheme.rootServiceText}`}>{activeScenario.targetService}</span>
            </div>
          </div>
        </div>

        {/* Mind Map Branches Grid - 7 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 relative">
          {branches.map((branch) => {
            const Icon = branch.icon;
            const isCurrentActive = branch.stageId === activeStageId;

            return (
              <div
                key={branch.stageId}
                onClick={() => onSelectStage(branch.stageId)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isCurrentActive
                    ? mmTheme.activeBranchCard
                    : 'bg-[#080c16] border-slate-800/80 hover:border-slate-700 hover:bg-[#0c1222] text-slate-300'
                }`}
              >
                {/* Top Badge: Stage ID & Kill Chain Phase */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isCurrentActive
                          ? mmTheme.activePNumberBadge
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      P{branch.stageId}
                    </span>

                    <div
                      className={`p-1 rounded-md ${
                        isCurrentActive
                          ? mmTheme.activeIconBox
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Lockheed Martin Kill Chain Badge */}
                  <div className="text-[8px] font-extrabold text-amber-400 bg-amber-950/70 px-1 py-0.5 rounded border border-amber-900/60 truncate">
                    {branch.lmKillChainPhase}
                  </div>
                </div>

                {/* Node Title & Details */}
                <div className="my-1.5 space-y-1">
                  <h4 className={`text-[11px] font-bold leading-snug ${isCurrentActive ? 'text-white' : 'text-slate-200'}`}>
                    {branch.title}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-sans leading-tight line-clamp-2">
                    {branch.summary}
                  </p>
                </div>

                {/* Key Bullet Highlights */}
                <div className="pt-1.5 border-t border-slate-800/80 space-y-1 text-[9px]">
                  {branch.keyDetails.map((detail, idx) => (
                    <div key={idx} className="text-slate-300 flex items-start gap-1 truncate">
                      <span className={`font-bold ${mmTheme.bulletDot}`}>•</span>
                      <span className="truncate">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Active Stage Indicator */}
                {isCurrentActive && (
                  <div className={`mt-2 pt-1 border-t text-[8px] font-bold flex items-center justify-between ${mmTheme.activeBottomBorder}`}>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full animate-ping ${mmTheme.pingBg}`} />
                      ACTIVE
                    </span>
                    <span className={`px-1 py-0.2 rounded border ${mmTheme.activeTagPill}`}>P{branch.stageId}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
