import React, { useState } from 'react';
import { Scenario, MatchStrategyConfig, RedStrategy, BlueStrategy, CommanderSettings } from '../types';
import { 
  Sliders, 
  Flame, 
  ShieldCheck, 
  Scale, 
  Zap, 
  CheckCircle2, 
  Play, 
  X, 
  Crosshair, 
  Lock, 
  Sparkles, 
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface StrategySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  currentSettings: CommanderSettings;
  onApplyAndLaunch: (updatedSettings: Partial<CommanderSettings>, strategyConfig: MatchStrategyConfig) => void;
}

export const StrategySelectionModal: React.FC<StrategySelectionModalProps> = ({
  isOpen,
  onClose,
  scenario,
  currentSettings,
  onApplyAndLaunch
}) => {
  // Red Strategy options
  const [selectedRedStrategy, setSelectedRedStrategy] = useState<RedStrategy>(currentSettings.redStrategy || 'apt');
  const [redAggression, setRedAggression] = useState<number>(currentSettings.redAggression || 3);
  const [redTemperature, setRedTemperature] = useState<number>(currentSettings.redTemperature || 0.7);
  const [selectedRedVector, setSelectedRedVector] = useState<string>(scenario.id);

  // Blue Strategy options
  const [selectedBlueStrategy, setSelectedBlueStrategy] = useState<BlueStrategy>(currentSettings.blueStrategy || 'logic_refactor');
  const [blueStrictness, setBlueStrictness] = useState<number>(currentSettings.blueStrictness || 4);
  const [blueTemperature, setBlueTemperature] = useState<number>(currentSettings.blueTemperature || 0.5);
  const [prioritizeZeroDowntime, setPrioritizeZeroDowntime] = useState<boolean>(true);

  // Arbiter evaluation policy
  const [arbitrationPolicy, setArbitrationPolicy] = useState<'strict_sla' | 'balanced' | 'security_first'>('strict_sla');

  if (!isOpen) return null;

  const redDoctrines: { id: RedStrategy; name: string; desc: string; icon: string; tag: string }[] = [
    {
      id: 'apt',
      name: 'Advanced Persistent Threat (APT)',
      desc: 'Stealthy, targeted exploit synthesis focusing on subtle logic flaws and auth bypasses.',
      icon: 'Crosshair',
      tag: 'STEALTH & PRECISION'
    },
    {
      id: 'fuzzing',
      name: 'Dynamic Payload Fuzzing & Mutation',
      desc: 'High-volume mutated payloads injecting edge metacharacters, boundary values, and race packets.',
      icon: 'Flame',
      tag: 'AGGRESSIVE MUTATION'
    },
    {
      id: 'brute_force',
      name: 'Rate-Limit & Batch Amplification',
      desc: 'Floods multiplexed requests and high-cardinality queries to exhaust thread pools.',
      icon: 'Zap',
      tag: 'RESOURCE EXHAUSTION'
    },
    {
      id: 'evasion',
      name: 'WAF Evasion & Obfuscation',
      desc: 'Encodes payloads with unicode variants, hex representations, and comment bypasses.',
      icon: 'Lock',
      tag: 'SIGNATURE BYPASS'
    }
  ];

  const blueDoctrines: { id: BlueStrategy; name: string; desc: string; icon: string; tag: string }[] = [
    {
      id: 'logic_refactor',
      name: 'Architectural Logic Refactoring',
      desc: 'Deep structural rewrite eliminating vulnerable paradigms while maintaining API contracts.',
      icon: 'ShieldCheck',
      tag: 'ROOT-CAUSE HARDENING'
    },
    {
      id: 'input_sanitization',
      name: 'AST Parameterized Guardrail',
      desc: 'Enforces strict allow-lists and parameterized bindings before untrusted input touches sinks.',
      icon: 'Lock',
      tag: 'INPUT BOUNDARY'
    },
    {
      id: 'rate_limit',
      name: 'Adaptive Rate & Complexity Throttling',
      desc: 'Restricts batch sizes, AST query depths, and concurrent execution windows.',
      icon: 'Layers',
      tag: 'TRAFFIC THROTTLING'
    },
    {
      id: 'waf_rules',
      name: 'Edge Pattern Inspection Jail',
      desc: 'Drops malformed signatures and link-local IP targets at the ingress boundary.',
      icon: 'Cpu',
      tag: 'EDGE ISOLATION'
    }
  ];

  const handleLaunch = () => {
    const config: MatchStrategyConfig = {
      redVectorId: selectedRedVector,
      redVectorName: scenario.name,
      redTacticCategory: selectedRedStrategy,
      redPayloadPreset: scenario.defaultExploit.attackVector,
      redAggression,
      redTemperature,
      blueProtocolId: selectedBlueStrategy,
      blueProtocolName: scenario.defaultPatch.patchStrategy,
      blueGuardrailCategory: selectedBlueStrategy,
      bluePatchPreset: scenario.defaultPatch.rationale,
      blueStrictness,
      blueTemperature,
      arbitrationPolicy,
      prioritizeZeroDowntime
    };

    onApplyAndLaunch(
      {
        redStrategy: selectedRedStrategy,
        redAggression,
        redTemperature,
        blueStrategy: selectedBlueStrategy,
        blueStrictness,
        blueTemperature
      },
      config
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#0A0D15] border border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-cyan-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  MATCH STRATEGY SELECTION OVERLAY
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: {scenario.name}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Configure Adversarial Doctrines & Defensive Protocols
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#07090F]">
          {/* Top Row: Target Scenario Brief */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Active Proving Ground Scenario
              </span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{scenario.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                  {scenario.cweId}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">
                {scenario.description}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 shrink-0">
              Target: <span className="text-cyan-400">{scenario.targetService}</span>
            </div>
          </div>

          {/* Strategy Columns: Red vs Blue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Red Team Attack Vector Selection */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-rose-950/20 to-slate-900/40 border border-rose-900/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-rose-900/30">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Flame className="w-4 h-4" />
                  <span>Red Team Attack Doctrine</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  OFFENSIVE SINK
                </span>
              </div>

              {/* Red Doctrine Cards */}
              <div className="space-y-2.5">
                {redDoctrines.map((doc) => {
                  const isSelected = selectedRedStrategy === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedRedStrategy(doc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/60 border-rose-500 text-white shadow-md shadow-rose-950/50'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span className={isSelected ? 'text-rose-400' : 'text-slate-400'}>
                            {doc.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-rose-300 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-800/60">
                          {doc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {doc.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Red Aggression Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Attack Mutation Intensity:</span>
                  <span className="text-rose-400 font-bold">Level {redAggression} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={redAggression}
                  onChange={(e) => setRedAggression(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Blue Team Defense Protocol Selection */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/20 to-slate-900/40 border border-cyan-900/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-900/30">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Blue Team Defense Protocol</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  D3FEND MITIGATION
                </span>
              </div>

              {/* Blue Doctrine Cards */}
              <div className="space-y-2.5">
                {blueDoctrines.map((doc) => {
                  const isSelected = selectedBlueStrategy === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedBlueStrategy(doc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950/50'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span className={isSelected ? 'text-cyan-400' : 'text-slate-400'}>
                            {doc.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
                          {doc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {doc.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Blue Strictness Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Guardrail Strictness SLA:</span>
                  <span className="text-cyan-400 font-bold">Level {blueStrictness} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={blueStrictness}
                  onChange={(e) => setBlueStrictness(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Arbiter SLA Policy */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs font-mono">
                <Scale className="w-4 h-4" />
                <span>Arbiter Judgment Criteria & Zero-Downtime SLA</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prioritizeZeroDowntime}
                  onChange={(e) => setPrioritizeZeroDowntime(e.target.checked)}
                  className="accent-purple-500 rounded cursor-pointer"
                />
                <span>Strict Zero-Downtime Rule (Fail on any 500 error)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setArbitrationPolicy('strict_sla')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  arbitrationPolicy === 'strict_sla'
                    ? 'bg-purple-900/50 border-purple-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Strict SLA (99.9% Uptime)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Penalizes any legitimate traffic degradation.</div>
              </button>

              <button
                type="button"
                onClick={() => setArbitrationPolicy('balanced')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  arbitrationPolicy === 'balanced'
                    ? 'bg-purple-900/50 border-purple-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Balanced Resilience</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Equal weight to exploit blocking and latency.</div>
              </button>

              <button
                type="button"
                onClick={() => setArbitrationPolicy('security_first')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  arbitrationPolicy === 'security_first'
                    ? 'bg-purple-900/50 border-purple-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Security Priority</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Zero tolerance for successful exploit payloads.</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#080B11] border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Selected: <span className="text-rose-400 font-bold">{selectedRedStrategy.toUpperCase()}</span> vs <span className="text-cyan-400 font-bold">{selectedBlueStrategy.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleLaunch}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-950/60 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Deploy Doctrines & Launch Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
