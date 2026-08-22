import React, { useState } from 'react';
import { 
  Flame, 
  Shield, 
  Scale, 
  Play, 
  Terminal, 
  Code2, 
  Sliders, 
  Zap, 
  Crosshair, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Cpu, 
  Globe, 
  BookOpen, 
  X,
  Target,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Scenario, OperatorRole, CommanderSettings, AppViewTab } from '../types';
import { getAllScenarios } from '../data/scenarioStore';
import { sounds } from '../utils/audio';

interface StartScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (role: OperatorRole, targetTab: AppViewTab, updatedScenario?: Scenario, customSettings?: Partial<CommanderSettings>) => void;
  currentScenario: Scenario;
  currentSettings: CommanderSettings;
  onOpenTutorial?: () => void;
  onOpenPresentation?: () => void;
}

export const StartScreenModal: React.FC<StartScreenModalProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
  currentScenario,
  currentSettings,
  onOpenTutorial,
  onOpenPresentation
}) => {
  const [selectedRole, setSelectedRole] = useState<OperatorRole>(currentSettings.operatorRole || 'red_attacker');
  const [playMode, setPlayMode] = useState<'interactive' | 'arena'>('interactive');
  const [chosenScenarioId, setChosenScenarioId] = useState<string>(currentScenario.id);
  const [selectedRedTactic, setSelectedRedTactic] = useState<string>('apt');
  const [selectedBlueTactic, setSelectedBlueTactic] = useState<string>('logic_refactor');

  if (!isOpen) return null;

  const allScenarios = getAllScenarios();
  const activeSelectedScenario = allScenarios.find(s => s.id === chosenScenarioId) || currentScenario;

  const handleConfirmSelection = (roleToLaunch = selectedRole) => {
    // Play appropriate sound
    if (roleToLaunch === 'red_attacker') {
      sounds.playRedAttack();
    } else if (roleToLaunch === 'blue_defender') {
      sounds.playBluePatch();
    } else {
      sounds.playVictory(true);
    }

    const updatedSettings: Partial<CommanderSettings> = {
      operatorRole: roleToLaunch,
      redStrategy: selectedRedTactic as any,
      blueStrategy: selectedBlueTactic as any,
      selectedScenarioId: activeSelectedScenario.id
    };

    onSelectTeam(
      roleToLaunch,
      playMode === 'interactive' ? 'interactive' : 'arena',
      activeSelectedScenario,
      updatedSettings
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#080b13] border border-[#1e2a40] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[92vh]">
        {/* Tactical Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-[#0d1424] to-slate-950 border-b border-[#1b263b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  CYBER COMBAT ARENA • DEPLOYMENT SUITE
                </span>
                <span className="text-xs font-mono text-emerald-400 hidden sm:inline flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  SYSTEM READY
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase">
                CHOOSE YOUR OPERATIONAL FACTION
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close Start Screen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto bg-[#060810]">
          {/* Main Team Choice Grid: 3 Factions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Red Team */}
            <div
              onClick={() => {
                setSelectedRole('red_attacker');
                sounds.playTick();
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 ${
                selectedRole === 'red_attacker'
                  ? 'bg-gradient-to-b from-rose-950/70 via-rose-950/30 to-[#0c0812] border-rose-500 ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/60'
                  : 'bg-[#0a0d16] border-slate-800/80 hover:border-rose-900/60 hover:bg-[#0e0c18]'
              }`}
            >
              {selectedRole === 'red_attacker' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SELECTED</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-600/60 text-rose-400 flex items-center justify-center">
                    <Flame className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-rose-400 uppercase">
                      OFFENSIVE ADVERSARY
                    </span>
                    <h3 className="text-base font-bold text-white uppercase">
                      RED TEAM COMMANDER
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Probe target microservices, bypass WAFs, craft malicious HTTP exploits, and exfiltrate credentials.
                </p>

                {/* Capabilities Bullet List */}
                <div className="space-y-1.5 pt-2 border-t border-rose-900/30 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>0-Day Payloads (JNDI, SQLi, SSRF, IDOR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Custom HTTP Exploit Crafting Studio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>MITRE ATT&CK TTP Execution Engine</span>
                  </div>
                </div>
              </div>

              {/* Red Tactics Selector */}
              <div className="pt-2 border-t border-rose-900/30 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  Offensive Tactic Mindset:
                </span>
                <select
                  value={selectedRedTactic}
                  onChange={(e) => setSelectedRedTactic(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2.5 py-1.5 bg-[#140b12] border border-rose-800/60 rounded-lg text-xs font-mono text-rose-200 focus:outline-none focus:border-rose-400"
                >
                  <option value="apt">APT • Stealth Kill-Chain</option>
                  <option value="fuzzer">High-Rate Fuzzing & Injection</option>
                  <option value="zero_day_hunter">0-Day Vulnerability Hunter</option>
                  <option value="stealth_prober">Stealth IAM Credential Probe</option>
                </select>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmSelection('red_attacker');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/70 cursor-pointer transition-all"
              >
                <span>JOIN RED TEAM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Blue Team */}
            <div
              onClick={() => {
                setSelectedRole('blue_defender');
                sounds.playTick();
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 ${
                selectedRole === 'blue_defender'
                  ? 'bg-gradient-to-b from-cyan-950/70 via-sky-950/30 to-[#070e17] border-cyan-500 ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-950/60'
                  : 'bg-[#0a0d16] border-slate-800/80 hover:border-cyan-900/60 hover:bg-[#080f1a]'
              }`}
            >
              {selectedRole === 'blue_defender' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SELECTED</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-600/60 text-cyan-400 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                      DEFENSIVE GUARDIAN
                    </span>
                    <h3 className="text-base font-bold text-white uppercase">
                      BLUE TEAM DEFENDER
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Shield infrastructure, engineer zero-downtime hot-patches, sanitize inputs, and safeguard SLA uptime.
                </p>

                {/* Capabilities Bullet List */}
                <div className="space-y-1.5 pt-2 border-t border-cyan-900/30 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Real-time Code Hot-Patching IDE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>MITRE D3FEND Countermeasure Mapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Interactive Socratic AI Hint System</span>
                  </div>
                </div>
              </div>

              {/* Blue Tactics Selector */}
              <div className="pt-2 border-t border-cyan-900/30 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  Defensive Guardrail Strategy:
                </span>
                <select
                  value={selectedBlueTactic}
                  onChange={(e) => setSelectedBlueTactic(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2.5 py-1.5 bg-[#08121f] border border-cyan-800/60 rounded-lg text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="logic_refactor">Zero-Trust Logic Refactor</option>
                  <option value="waf_rules">WAF Edge Filter & Rate Limiter</option>
                  <option value="crypto_hardening">Cryptographic IAM Hardening</option>
                  <option value="input_sanitization">AST & Regex Input Sanitization</option>
                </select>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmSelection('blue_defender');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/70 cursor-pointer transition-all"
              >
                <span>JOIN BLUE TEAM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: Joint War Room / Spectator */}
            <div
              onClick={() => {
                setSelectedRole('arbiter_judge');
                sounds.playTick();
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 ${
                selectedRole === 'arbiter_judge'
                  ? 'bg-gradient-to-b from-purple-950/70 via-indigo-950/30 to-[#0f0918] border-purple-500 ring-2 ring-purple-500/50 shadow-xl shadow-purple-950/60'
                  : 'bg-[#0a0d16] border-slate-800/80 hover:border-purple-900/60 hover:bg-[#0e0918]'
              }`}
            >
              {selectedRole === 'arbiter_judge' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SELECTED</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-950/90 border border-purple-600/60 text-purple-400 flex items-center justify-center">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                      JOINT OPERATIONS
                    </span>
                    <h3 className="text-base font-bold text-white uppercase">
                      AI ARBITER & WAR ROOM
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Autonomous dual-AI cyber war game. Evaluate model performance with automated verdicts and analytics.
                </p>

                {/* Capabilities Bullet List */}
                <div className="space-y-1.5 pt-2 border-t border-purple-900/30 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Autonomous 30s Round Battle Simulation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Service Topology & Dynamic Risk Heatmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Downloadable PDF / JSON Security Reports</span>
                  </div>
                </div>
              </div>

              {/* Mode Info */}
              <div className="pt-2 border-t border-purple-900/30 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  Dual-AI Arbiter Suite:
                </span>
                <p className="text-[11px] text-purple-200/90 font-mono">
                  Multi-phase verification of exploit containment & API contract preservation.
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmSelection('arbiter_judge');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950/70 cursor-pointer transition-all"
              >
                <span>LAUNCH JOINT ARENA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mission & Play Style Configuration Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            {/* Scenario Quick Selector */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    Initial Cyber Scenario / Mission
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {allScenarios.length} Scenarios Available
                </span>
              </div>

              <select
                value={chosenScenarioId}
                onChange={(e) => setChosenScenarioId(e.target.value)}
                className="w-full p-2.5 bg-[#060810] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <optgroup label="Famous Historical Cyber Attacks">
                  {allScenarios.filter(s => s.realWorldIncident?.isFamousIncident).map(s => (
                    <option key={s.id} value={s.id}>
                      ★ {s.name} ({s.realWorldIncident?.cveId || s.cweId})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Standard Enterprise Scenarios">
                  {allScenarios.filter(s => !s.realWorldIncident?.isFamousIncident && !s.isCustom).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} • {s.category} ({s.severity})
                    </option>
                  ))}
                </optgroup>
                {allScenarios.some(s => s.isCustom) && (
                  <optgroup label="Custom Created Scenarios">
                    {allScenarios.filter(s => s.isCustom).map(s => (
                      <option key={s.id} value={s.id}>
                        [CUSTOM] {s.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Scenario Preview Box */}
              <div className="p-3 rounded-lg bg-[#05070e] border border-slate-800/80 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 font-bold">{activeSelectedScenario.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeSelectedScenario.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    activeSelectedScenario.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                    'bg-amber-950 text-amber-300'
                  }`}>
                    {activeSelectedScenario.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                  {activeSelectedScenario.description}
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-1 border-t border-slate-800/60">
                  <span>Target: <span className="text-slate-300">{activeSelectedScenario.targetService}</span></span>
                  <span>CWE: <span className="text-slate-300">{activeSelectedScenario.cweId}</span></span>
                </div>
              </div>
            </div>

            {/* Play Mode & Entry Point */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono">
                    Operational Mode & Interface
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Choose how you want to interact with the cyber defense simulation:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPlayMode('interactive')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    playMode === 'interactive'
                      ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                      : 'bg-[#060810] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>OPERATOR RANGE</span>
                  </div>
                  <p className="text-[10px] leading-tight font-sans text-slate-300">
                    Hands-on console with HTTP payload crafter, live code IDE, and Socratic hints.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlayMode('arena')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    playMode === 'arena'
                      ? 'bg-purple-950/70 border-purple-500 text-purple-200'
                      : 'bg-[#060810] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>AI COMBAT ARENA</span>
                  </div>
                  <p className="text-[10px] leading-tight font-sans text-slate-300">
                    Autonomous Red vs Blue war game rounds with real-time analytics & MITRE matrices.
                  </p>
                </button>
              </div>

              {/* Launch Mission Final Action & Tutorial Guide */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  id="start-screen-launch-mission-btn"
                  onClick={() => handleConfirmSelection(selectedRole)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-mono text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/60 cursor-pointer transition-all"
                >
                  <span>COMMENCE CYBER MISSION</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {onOpenTutorial && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTutorial();
                    }}
                    className="py-3 px-4 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-500/60 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shrink-0"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>LAUNCH TUTORIAL</span>
                  </button>
                )}

                {onOpenPresentation && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPresentation();
                    }}
                    className="py-3 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 text-purple-300 hover:text-white border border-purple-500/60 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shrink-0"
                  >
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>SYSTEM TOUR</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#080b13] border-t border-[#1a2436] flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Selected Faction:</span>
            <span className={`font-bold ${
              selectedRole === 'red_attacker' ? 'text-rose-400' :
              selectedRole === 'blue_defender' ? 'text-cyan-400' : 'text-purple-400'
            }`}>
              {selectedRole === 'red_attacker' ? 'RED TEAM (Attacker)' :
               selectedRole === 'blue_defender' ? 'BLUE TEAM (Defender)' : 'JOINT ARBITER'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};
