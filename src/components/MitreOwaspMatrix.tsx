import React, { useState } from 'react';
import { SCENARIOS } from '../data/scenarios';
import { Scenario } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Flame, 
  ExternalLink, 
  Play, 
  Crosshair, 
  Search, 
  Filter, 
  Cpu, 
  FileCode,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface MitreOwaspMatrixProps {
  onSelectScenario: (scenario: Scenario) => void;
  activeScenarioId?: string;
}

export const MitreOwaspMatrix: React.FC<MitreOwaspMatrixProps> = ({
  onSelectScenario,
  activeScenarioId
}) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
    SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'flow' | 'frameworks'>('matrix');

  const filteredScenarios = SCENARIOS.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mitreAttack?.techniqueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mitreAttack?.techniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owasp?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cweId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = ['all', ...Array.from(new Set(SCENARIOS.map(s => s.category)))];

  // Group scenarios by MITRE Tactic
  const tacticGroups: Record<string, Scenario[]> = {};
  SCENARIOS.forEach(s => {
    const tactic = s.mitreAttack?.tacticName || 'General';
    if (!tacticGroups[tactic]) tacticGroups[tactic] = [];
    tacticGroups[tactic].push(s);
  });

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden bg-[#07090E] text-slate-100">
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-[#0B0F17]/90 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FRAMEWORK MAPPING
            </span>
            <h2 className="text-lg font-bold text-white tracking-wide">
              MITRE ATT&CK® • MITRE D3FEND™ • OWASP Top 10 Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-world microservice threat vectors mapped to standardized tactics, offensive techniques, and defensive hot-patch countermeasures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'matrix' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tactical Grid
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'flow' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Attack vs Defense Flow
            </button>
            <button
              onClick={() => setViewMode('frameworks')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'frameworks' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OWASP & ATLAS
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search technique, CWE, OWASP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Interactive Matrix / Scenarios List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono shrink-0">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md border whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {viewMode === 'matrix' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredScenarios.map((scenario) => {
                const isSelected = selectedScenario.id === scenario.id;
                const isActiveInSim = activeScenarioId === scenario.id;

                return (
                  <div
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900/90 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-950/30'
                        : 'bg-[#0E131F]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#121827]/80'
                    }`}
                  >
                    {isActiveInSim && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 animate-pulse">
                        ACTIVE DRILL
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          scenario.severity === 'CRITICAL'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {scenario.severity}
                        </span>

                        {scenario.mitreAttack && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/40 text-red-300 border border-red-800/40 flex items-center gap-1">
                            <Crosshair className="w-2.5 h-2.5" />
                            {scenario.mitreAttack.techniqueId}
                          </span>
                        )}

                        {scenario.owasp && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/40 text-blue-300 border border-blue-800/40">
                            {scenario.owasp.code}
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {scenario.cweId}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 leading-snug">
                        {scenario.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                        Target: <span className="text-cyan-400">{scenario.targetService}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScenario(scenario);
                        }}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        Simulate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'flow' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" />
                  <strong>Offensive Vector (MITRE ATT&CK)</strong>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <strong>Defensive Hot-Patch Countermeasure (MITRE D3FEND)</strong>
                </span>
              </div>

              <div className="space-y-3">
                {filteredScenarios.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedScenario(s)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedScenario.id === s.id
                        ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/30'
                        : 'bg-[#0E131F]/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Attack Info */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/60 text-red-300 border border-red-800/60 font-bold">
                            ATT&CK {s.mitreAttack?.techniqueId}
                          </span>
                          <span className="text-xs font-bold text-red-200">
                            {s.mitreAttack?.techniqueName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({s.mitreAttack?.tacticName})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {s.defaultExploit.attackVector}
                        </p>
                      </div>

                      {/* Middle Bridge */}
                      <div className="hidden lg:flex items-center justify-center px-2">
                        <div className="w-8 h-[1px] bg-slate-700 relative">
                          <ArrowRight className="w-3 h-3 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Right: Defense Info */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold">
                            D3FEND {s.mitreDefend?.d3fendId}
                          </span>
                          <span className="text-xs font-bold text-emerald-300">
                            {s.mitreDefend?.d3fendName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {s.defaultPatch.patchStrategy}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScenario(s);
                        }}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center gap-1.5 self-end lg:self-center transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Launch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'frameworks' && (
            <div className="space-y-6">
              {/* OWASP Breakdown */}
              <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">OWASP Top 10 & API Security 2023 Coverage</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">9 Active Vectors Tested</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredScenarios.filter(s => s.owasp).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s)}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/90 hover:border-blue-500/50 cursor-pointer space-y-1.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
                          {s.owasp?.code} - {s.owasp?.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{s.owasp?.year}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{s.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{s.owasp?.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* MITRE ATLAS AI Security Breakdown */}
              <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">MITRE ATLAS™ (Adversarial Threat Landscape for AI Systems)</h3>
                  </div>
                  <span className="text-xs font-mono text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/50">
                    GenAI & LLM Security
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-200">AML.T0051: LLM Prompt Injection & Tool Calling Hijack</span>
                    <span className="text-[10px] font-mono text-purple-300">OWASP LLM01:2025</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Autonomous agent copilots are vulnerable to indirect and direct prompt injection that forces unauthenticated invocation of sensitive internal tools (e.g. transferCredits, data exfiltration).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Deep-Dive Scenario Inspector Drawer */}
        <div className="w-96 border-l border-slate-800/80 bg-[#0B0F17] overflow-y-auto p-5 space-y-5 shrink-0 hidden lg:block">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                THREAT SPECIFICATION
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedScenario.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedScenario.severity}
              </span>
            </div>

            <h3 className="text-base font-bold text-white leading-tight">
              {selectedScenario.name}
            </h3>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                {selectedScenario.category}
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                {selectedScenario.cweId}
              </span>
            </div>
          </div>

          {/* MITRE ATT&CK Card */}
          {selectedScenario.mitreAttack && (
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-red-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  MITRE ATT&CK®
                </span>
                <span className="font-mono text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/60">
                  {selectedScenario.mitreAttack.techniqueId}
                </span>
              </div>
              <div className="text-xs font-semibold text-white">
                {selectedScenario.mitreAttack.techniqueName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Tactic: {selectedScenario.mitreAttack.tacticName} ({selectedScenario.mitreAttack.tactic})
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedScenario.mitreAttack.description}
              </p>
            </div>
          )}

          {/* MITRE D3FEND Card */}
          {selectedScenario.mitreDefend && (
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  MITRE D3FEND™
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                  {selectedScenario.mitreDefend.d3fendId}
                </span>
              </div>
              <div className="text-xs font-semibold text-white">
                {selectedScenario.mitreDefend.d3fendName}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedScenario.mitreDefend.description}
              </p>
            </div>
          )}

          {/* OWASP Mapping */}
          {selectedScenario.owasp && (
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  OWASP Category
                </span>
                <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded">
                  {selectedScenario.owasp.code}
                </span>
              </div>
              <div className="text-xs font-semibold text-white">
                {selectedScenario.owasp.title} ({selectedScenario.owasp.year})
              </div>
              <p className="text-xs text-slate-300">
                {selectedScenario.owasp.description}
              </p>
            </div>
          )}

          {/* Attack Mechanics Steps */}
          {selectedScenario.attackMechanics && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                Offensive Exploitation Sequence:
              </span>
              <div className="space-y-1.5">
                {selectedScenario.attackMechanics.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="font-mono text-[10px] text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Defense Mechanics Steps */}
          {selectedScenario.defenseMechanics && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero-Downtime Hot-Patch Mechanics:
              </span>
              <div className="space-y-1.5">
                {selectedScenario.defenseMechanics.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => onSelectScenario(selectedScenario)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Live Simulation Drill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
