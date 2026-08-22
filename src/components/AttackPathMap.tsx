import React, { useState, useEffect } from 'react';
import { Scenario, ScenarioAttackPath, AttackPathHop, OperatorRole } from '../types';
import { ATTACK_PATHS } from '../data/attackPaths';
import { SCENARIOS } from '../data/scenarios';
import { 
  Terminal, 
  Flame, 
  Shield, 
  Server, 
  Database, 
  Globe, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Cpu, 
  Layers, 
  Lock, 
  Copy, 
  ExternalLink,
  Target,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface AttackPathMapProps {
  activeScenario?: Scenario;
  operatorRole?: OperatorRole;
  onSelectScenario?: (scenario: Scenario) => void;
  onSelectHop?: (hop: AttackPathHop) => void;
}

export const AttackPathMap: React.FC<AttackPathMapProps> = ({
  activeScenario = SCENARIOS[0],
  operatorRole = 'red_attacker',
  onSelectScenario,
  onSelectHop
}) => {
  const attackPathData: ScenarioAttackPath = ATTACK_PATHS[activeScenario.id] || ATTACK_PATHS['auth-jwt-none-alg'];

  const [selectedHopNumber, setSelectedHopNumber] = useState<number>(1);
  const [isSimulatingPath, setIsSimulatingPath] = useState<boolean>(false);
  const [activeSimulationHop, setActiveSimulationHop] = useState<number>(1);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Sync selected hop when scenario changes
  useEffect(() => {
    setSelectedHopNumber(1);
    setActiveSimulationHop(1);
    setIsSimulatingPath(false);
  }, [activeScenario.id]);

  // Simulation playback loop
  useEffect(() => {
    if (!isSimulatingPath) return;

    const interval = setInterval(() => {
      setActiveSimulationHop((prev) => {
        if (prev >= attackPathData.hops.length) {
          setIsSimulatingPath(false);
          sounds.playVictory(false);
          return attackPathData.hops.length;
        }
        sounds.playTick();
        return prev + 1;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulatingPath, attackPathData.hops.length]);

  const selectedHop = attackPathData.hops.find((h) => h.hopNumber === selectedHopNumber) || attackPathData.hops[0];

  const handleCopyPayload = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedPayload(true);
    sounds.playTick();
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getStatusBadge = (status: AttackPathHop['status'], isCurrentActive: boolean) => {
    if (isCurrentActive && isSimulatingPath) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-black animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
          ACTIVE HOP
        </span>
      );
    }
    switch (status) {
      case 'exploited':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" />
            EXPLOITED
          </span>
        );
      case 'exfiltrating':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            EXFILTRATING
          </span>
        );
      case 'blocked':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            BLOCKED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            TRAVERSING
          </span>
        );
    }
  };

  const getNodeIcon = (type: AttackPathHop['type']) => {
    switch (type) {
      case 'ingress':
      case 'client':
        return Globe;
      case 'database':
        return Database;
      case 'internal_metadata':
      case 'os_shell':
        return Terminal;
      case 'worker':
        return Cpu;
      case 'ai':
        return Zap;
      case 'service':
      default:
        return Server;
    }
  };

  // MITRE Tactics Array mapping
  const mitreTactics = [
    { id: 'initial-access', name: 'Initial Access', technique: attackPathData.hops[0]?.mitreTechnique || 'T1190' },
    { id: 'execution', name: 'Execution', technique: attackPathData.hops[1]?.mitreTechnique || 'T1059' },
    { id: 'persistence', name: 'Privilege Escalation', technique: attackPathData.hops[2]?.mitreTechnique || 'T1556' },
    { id: 'exfiltration', name: 'Exfiltration & Impact', technique: attackPathData.hops[3]?.mitreTechnique || 'T1005' },
  ];

  return (
    <div className="w-full bg-[#080B13] border border-[#1b263b] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header & Scenario Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1b263b] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-rose-950 via-slate-900 to-cyan-950 border border-rose-500/50 text-rose-400 shadow-md">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase tracking-wide">
                VISUAL ATTACK PATH MAP
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80 font-bold">
                CWE-{activeScenario.cweId}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              {activeScenario.name}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Sequential MITRE ATT&CK technique traversal across microservice architecture nodes
            </p>
          </div>
        </div>

        {/* Scenario Quick Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {onSelectScenario && (
            <div className="flex items-center gap-1.5 text-xs font-mono bg-[#0c1220] border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Target Scenario:</span>
              <select
                value={activeScenario.id}
                onChange={(e) => {
                  const sc = SCENARIOS.find((s) => s.id === e.target.value);
                  if (sc) onSelectScenario(sc);
                }}
                className="bg-transparent text-cyan-300 font-bold cursor-pointer focus:outline-none"
              >
                {SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                    {sc.name} ({sc.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Path Simulator Control Button */}
          <button
            onClick={() => {
              if (isSimulatingPath) {
                setIsSimulatingPath(false);
              } else {
                setActiveSimulationHop(1);
                setIsSimulatingPath(true);
                sounds.playRedAttack();
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isSimulatingPath
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-950/50'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
            }`}
          >
            {isSimulatingPath ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isSimulatingPath ? 'PAUSE TRAVERSAL' : 'SIMULATE ATTACK PATH'}</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#060912] border border-[#182236] p-3.5 rounded-xl text-xs font-mono">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Entry Point:</span>
          <div className="text-slate-200 font-bold truncate mt-0.5">{attackPathData.entryPoint}</div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Target Sink:</span>
          <div className="text-rose-300 font-bold truncate mt-0.5">{attackPathData.targetSink}</div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Blast Radius:</span>
          <div className="mt-0.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              attackPathData.blastRadius === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
            }`}>
              {attackPathData.blastRadius} IMPACT
            </span>
          </div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Est. Time To Detect:</span>
          <div className="text-cyan-300 font-bold mt-0.5">{attackPathData.estimatedTtdSec}s Automated TTD</div>
        </div>
      </div>

      {/* Visual Sequence Flow of Microservice Hops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-rose-400 animate-pulse" />
            ATTACK PATH SEQUENCE FLOW ({attackPathData.hops.length} HOPS)
          </span>
          <span className="text-slate-400 text-[11px]">
            Click any hop node to inspect technique & payload details
          </span>
        </div>

        {/* Horizontal Hops Grid with Connecting Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {attackPathData.hops.map((hop) => {
            const Icon = getNodeIcon(hop.type);
            const isSelected = selectedHopNumber === hop.hopNumber;
            const isSimulatingActive = isSimulatingPath && activeSimulationHop === hop.hopNumber;
            const isSimulatingPassed = isSimulatingPath && activeSimulationHop > hop.hopNumber;

            return (
              <div
                key={hop.hopNumber}
                onClick={() => {
                  setSelectedHopNumber(hop.hopNumber);
                  sounds.playTick();
                  if (onSelectHop) onSelectHop(hop);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[170px] ${
                  isSimulatingActive
                    ? 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-500/80 shadow-xl shadow-rose-950/60 scale-[1.02]'
                    : isSelected
                    ? 'bg-gradient-to-b from-cyan-950/90 via-[#0a1324] to-[#080f1e] border-cyan-400 ring-1 ring-cyan-400/80 shadow-lg shadow-cyan-950/50'
                    : isSimulatingPassed
                    ? 'bg-[#0a0f1d] border-rose-900/60 text-slate-300 opacity-90'
                    : 'bg-[#070a14] border-slate-800 hover:border-slate-700 hover:bg-[#0b101f]'
                }`}
              >
                {/* Top Badge: Hop Number & Protocol */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSimulatingActive
                      ? 'bg-rose-500 text-black'
                      : isSelected
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    HOP #{hop.hopNumber}
                  </span>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {hop.protocol}:{hop.port}
                    </span>
                  </div>
                </div>

                {/* Microservice Node Header */}
                <div className="flex items-start gap-2.5 my-1">
                  <div className={`p-2 rounded-lg ${
                    isSimulatingActive
                      ? 'bg-rose-900 text-white'
                      : isSelected
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white font-mono leading-snug">
                      {hop.nodeName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                      {hop.action}
                    </p>
                  </div>
                </div>

                {/* MITRE Technique Badge */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/50 truncate">
                    {hop.mitreTechnique}
                  </div>

                  <div className="flex items-center justify-between">
                    {getStatusBadge(hop.status, isSimulatingActive)}
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Hop Inspector & Payload Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#050810] border border-[#172236] rounded-2xl p-4 sm:p-5">
        {/* Left: Technique Context & Adversary Intent */}
        <div className="lg:col-span-1 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-800/80 pr-0 lg:pr-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              HOP #{selectedHop.hopNumber} INSPECTOR
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              {selectedHop.nodeName}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase">MITRE ATT&CK Technique:</span>
              <div className="text-white font-bold text-sm text-rose-300 mt-0.5">
                {selectedHop.mitreTechnique}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase">Microservice Action:</span>
              <div className="text-slate-200 font-semibold mt-0.5">
                {selectedHop.action}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase">Adversary Description:</span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed mt-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                {selectedHop.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Payload Snippet & Containment Strategy */}
        <div className="lg:col-span-2 space-y-3 pl-0 lg:pl-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              EXPLOIT PAYLOAD / VECTOR SNIPPET
            </span>

            <button
              onClick={() => handleCopyPayload(selectedHop.payloadSnippet)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedPayload ? 'COPIED!' : 'COPY PAYLOAD'}</span>
            </button>
          </div>

          {/* Payload Syntax Block */}
          <div className="bg-black/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-rose-200 overflow-x-auto relative">
            <pre className="whitespace-pre-wrap break-all leading-relaxed">
              {selectedHop.payloadSnippet}
            </pre>
          </div>

          {/* Containment & Blue Team Defense Recommendation */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>BLUE TEAM CONTAINMENT GUARDRAIL</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {attackPathData.containmentRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Tactic Overview */}
      <div className="p-4 rounded-2xl bg-[#060912] border border-[#182236] space-y-3">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-purple-400" />
          MITRE ATT&CK TACTICS MATRIX MAPPING
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {mitreTactics.map((tactic, idx) => (
            <div
              key={tactic.id}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1"
            >
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                PHASE #{idx + 1} • {tactic.name}
              </span>
              <div className="text-xs font-bold font-mono text-cyan-300">
                {tactic.technique}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
