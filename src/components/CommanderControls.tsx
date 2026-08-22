import React from 'react';
import { Sliders, Flame, Shield, Play, RotateCcw, Cpu, Sparkles, FastForward, Activity, BookOpen } from 'lucide-react';
import { CommanderSettings, RedStrategy, BlueStrategy, Scenario } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { AiTag, AiFeatureBadge } from './AiTag';

interface CommanderControlsProps {
  settings: CommanderSettings;
  onUpdateSettings: (newSettings: Partial<CommanderSettings>) => void;
  activeScenario: Scenario;
  onSelectScenario: (scenarioId: string) => void;
  onTriggerManualDrill: () => void;
  onResetSimulation: () => void;
  isAiProcessing: boolean;
  onOpenStrategyModal?: () => void;
  onOpenTutorial?: () => void;
}

export const CommanderControls: React.FC<CommanderControlsProps> = ({
  settings,
  onUpdateSettings,
  activeScenario,
  onSelectScenario,
  onTriggerManualDrill,
  onResetSimulation,
  isAiProcessing,
  onOpenStrategyModal,
  onOpenTutorial,
}) => {
  const redStrategies: { id: RedStrategy; label: string; desc: string }[] = [
    { id: 'apt', label: 'APT 2026', desc: 'Targeted multi-vector logic exploitation' },
    { id: 'zero_day_hunter', label: 'Zero-Day Hunter', desc: 'Probing undocumented edge logic' },
    { id: 'stealth_prober', label: 'Stealth Prober', desc: 'Evasive headers & payload obfuscation' },
    { id: 'fuzzer', label: 'Boundary Fuzzer', desc: 'Malformed payloads & concurrency bursts' },
    { id: 'script_kiddie', label: 'Known CVE Replay', desc: 'Standard unrefined public payload' },
  ];

  const blueStrategies: { id: BlueStrategy; label: string; desc: string }[] = [
    { id: 'logic_refactor', label: 'Logic Refactor', desc: 'Root cause structural TypeScript repair' },
    { id: 'crypto_hardening', label: 'Crypto Hardening', desc: 'Constant-time verification & HMAC algorithms' },
    { id: 'whitelist_guard', label: 'Whitelist Guard', desc: 'Strict DTO property schema enforcement' },
    { id: 'input_sanitization', label: 'Input Sanitizer', desc: 'Parameterized query & type casting' },
    { id: 'waf_filter', label: 'Perimeter Filter', desc: 'Pre-routing regex & IP blacklist' },
  ];

  return (
    <div className="bg-[#0c0f18] border border-[#1a2333] rounded-xl p-4 shadow-lg space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#1a2333] pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">COMMANDER OVERSEER DECK</h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#162035] text-cyan-300 border border-[#243657] font-semibold">
          Agent Hyperparameters
        </span>
      </div>

      {/* Target Scenario Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          ACTIVE TARGET MICROSERVICE:
        </label>
        <select
          id="scenario-selector-dropdown"
          value={activeScenario.id}
          onChange={(e) => onSelectScenario(e.target.value)}
          className="w-full bg-[#121724] border border-[#243147] text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer"
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              [{s.category}] {s.name} ({s.cweId})
            </option>
          ))}
        </select>
        <p className="text-[11px] text-slate-400 leading-snug">
          {activeScenario.description}
        </p>
      </div>

      {/* Grid: Red vs Blue Strategy Tuning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Red Agent Configuration */}
        <div className="bg-[#090c14] border border-[#2b171c] rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-rose-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Flame className="w-3.5 h-3.5" />
              RED AGENT TUNING
            </span>
            <span className="text-[10px] text-slate-500">Offense</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium">Offensive Strategy:</label>
            <select
              id="red-strategy-select"
              value={settings.redStrategy}
              onChange={(e) => onUpdateSettings({ redStrategy: e.target.value as RedStrategy })}
              className="w-full bg-[#121724] border border-[#28354f] text-rose-200 rounded-md p-1.5 text-xs focus:outline-none cursor-pointer"
            >
              {redStrategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — {s.desc}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">LLM Reasoning Temp:</span>
              <span className="text-rose-300 font-bold">{settings.redTemperature}</span>
            </div>
            <input
              id="red-temp-slider"
              type="range"
              min="0.1"
              max="1.2"
              step="0.1"
              value={settings.redTemperature}
              onChange={(e) => onUpdateSettings({ redTemperature: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-[#141b2b] rounded-lg"
            />
          </div>
        </div>

        {/* Blue Agent Configuration */}
        <div className="bg-[#090c14] border border-[#162238] rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sky-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              BLUE AGENT TUNING
            </span>
            <span className="text-[10px] text-slate-500">Defense</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium">Defensive Remediation:</label>
            <select
              id="blue-strategy-select"
              value={settings.blueStrategy}
              onChange={(e) => onUpdateSettings({ blueStrategy: e.target.value as BlueStrategy })}
              className="w-full bg-[#121724] border border-[#28354f] text-sky-200 rounded-md p-1.5 text-xs focus:outline-none cursor-pointer"
            >
              {blueStrategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — {s.desc}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Hot-Patch Precision Temp:</span>
              <span className="text-sky-300 font-bold">{settings.blueTemperature}</span>
            </div>
            <input
              id="blue-temp-slider"
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.blueTemperature}
              onChange={(e) => onUpdateSettings({ blueTemperature: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-[#141b2b] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Action Trigger Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#1a2333]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="trigger-manual-drill-btn"
            onClick={onTriggerManualDrill}
            disabled={isAiProcessing}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-rose-600 via-amber-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/40 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Instant Red/Blue Drill</span>
            <AiFeatureBadge label="AI DRILL" />
          </button>

          {onOpenStrategyModal && (
            <button
              id="commander-open-strategy-btn"
              onClick={onOpenStrategyModal}
              className="px-3 py-2 rounded-lg bg-[#141b2b] hover:bg-[#1f283d] text-purple-300 hover:text-white border border-purple-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Match Strategy Overlay"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Strategy Deck Overlay</span>
            </button>
          )}

          {onOpenTutorial && (
            <button
              id="commander-open-tutorial-btn"
              onClick={onOpenTutorial}
              className="px-3 py-2 rounded-lg bg-[#141b2b] hover:bg-[#1f283d] text-cyan-300 hover:text-white border border-cyan-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open AI Interactive Tutorial"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guided Tutorial</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reset-simulation-btn"
            onClick={onResetSimulation}
            className="px-3 py-2 rounded-lg bg-[#141b2b] hover:bg-[#1e2840] text-slate-300 flex items-center gap-1.5 transition-colors border border-[#232f48] cursor-pointer"
            title="Reset score and round state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
