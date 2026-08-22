import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Search, 
  Filter, 
  Crosshair, 
  BookOpen, 
  Flame, 
  History, 
  Plus, 
  Trash2, 
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Scenario } from '../types';
import { getAllScenarios, deleteCustomScenario } from '../data/scenarioStore';
import { CustomScenarioModal } from './CustomScenarioModal';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenarioId: string;
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  currentScenarioId,
  onSelectScenario,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('famous');
  const [allScenariosList, setAllScenariosList] = useState<Scenario[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAllScenariosList(getAllScenarios());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const famousCount = allScenariosList.filter(s => s.realWorldIncident?.isFamousIncident).length;
  const customCount = allScenariosList.filter(s => s.isCustom).length;
  const standardCount = allScenariosList.length;

  const uniqueCategories = Array.from(new Set<string>(allScenariosList.map(s => s.category)));
  const categories: string[] = ['all', 'famous', 'custom', ...uniqueCategories];

  const filtered = allScenariosList.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.targetService.toLowerCase().includes(q) ||
      s.cweId.toLowerCase().includes(q) ||
      (s.realWorldIncident?.cveId?.toLowerCase().includes(q) ?? false) ||
      (s.realWorldIncident?.incidentName?.toLowerCase().includes(q) ?? false) ||
      (s.mitreAttack?.techniqueId.toLowerCase().includes(q) ?? false) ||
      (s.mitreAttack?.techniqueName.toLowerCase().includes(q) ?? false) ||
      (s.owasp?.code.toLowerCase().includes(q) ?? false);

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'famous') return Boolean(s.realWorldIncident?.isFamousIncident);
    if (selectedFilter === 'custom') return Boolean(s.isCustom);
    return s.category === selectedFilter;
  });

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this custom scenario?')) {
      const updated = deleteCustomScenario(id);
      setAllScenariosList(getAllScenarios(updated));
    }
  };

  const handleCustomCreated = (scenario: Scenario) => {
    setAllScenariosList(getAllScenarios());
    onSelectScenario(scenario);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-[#0c0f18] border border-[#1e2a3f] rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100">
          {/* Modal Header */}
          <div className="bg-[#090c14] px-6 py-4 border-b border-[#1a2333] flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  CYBER ATTACK SCENARIO REPOSITORY
                  <span className="text-xs font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                    {allScenariosList.length} ATTACK VECTORS
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select famous real-world CVE cyber attacks (Log4Shell, Capital One, Struts) or create custom attack vectors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="open-custom-scenario-creator-btn"
                onClick={() => setIsCustomModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create / Import Scenario</span>
              </button>

              <button
                id="close-scenario-modal-btn"
                onClick={onClose}
                className="p-2 rounded-lg bg-[#141b2b] text-slate-400 hover:text-white hover:bg-[#1e2840] transition-colors border border-[#232f48] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="px-6 py-3 bg-[#080b13] border-b border-[#161f30] flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by CVE (CVE-2021-44228), Log4Shell, Capital One, T1190, CWE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedFilter('famous')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'famous'
                    ? 'bg-amber-950/70 text-amber-300 border-amber-500/80 shadow-sm shadow-amber-950'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>FAMOUS ATTACKS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/80 text-amber-200 border border-amber-700">
                  {famousCount}
                </span>
              </button>

              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                All Vectors ({standardCount})
              </button>

              <button
                onClick={() => setSelectedFilter('custom')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'custom'
                    ? 'bg-purple-950/70 text-purple-300 border-purple-500/80 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Custom ({customCount})</span>
              </button>

              {categories.filter(c => c !== 'all' && c !== 'famous' && c !== 'custom').slice(0, 3).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors border cursor-pointer ${
                    selectedFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Scenarios Grid */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#080b13]">
            {/* Active Selected Scenario Banner */}
            {(() => {
              const currentScenario = allScenariosList.find(s => s.id === currentScenarioId);
              if (!currentScenario) return null;
              return (
                <div className="p-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/60 rounded-xl flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-300 border border-cyan-500/40 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/90 text-cyan-200 border border-cyan-500/50">
                          CURRENTLY SELECTED SCENARIO
                        </span>
                        <span className="text-xs font-mono text-cyan-300 font-bold">
                          {currentScenario.targetService}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white font-mono mt-0.5 flex items-center gap-2">
                        <span>{currentScenario.name}</span>
                        <span className="text-xs text-amber-300 font-normal">[{currentScenario.cweId}]</span>
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-mono font-extrabold shadow-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                </div>
              );
            })()}

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm">No scenarios match your search filter.</p>
                <button
                  onClick={() => { setSearch(''); setSelectedFilter('all'); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold border border-slate-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((scenario) => {
                  const isSelected = scenario.id === currentScenarioId;
                  const isFamous = scenario.realWorldIncident?.isFamousIncident;
                  const severityColor =
                    scenario.severity === 'CRITICAL'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800';

                  return (
                    <div
                      key={scenario.id}
                      onClick={() => {
                        onSelectScenario(scenario);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/80'
                          : isFamous
                          ? 'bg-[#0f1422] border-amber-900/40 hover:border-amber-500/70 hover:bg-[#131a2c]'
                          : 'bg-[#0d121f] border-[#1a2334] hover:border-slate-600 hover:bg-[#111728]'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${severityColor}`}>
                              {scenario.severity}
                            </span>
                            
                            {isFamous && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-gradient-to-r from-amber-950 to-orange-950 text-amber-300 border border-amber-600/70 font-bold flex items-center gap-1 shadow-xs">
                                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                                {scenario.realWorldIncident?.cveId || 'REAL WORLD ATTACK'}
                              </span>
                            )}

                            {scenario.isCustom && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-700 font-bold">
                                CUSTOM 0-DAY
                              </span>
                            )}

                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#162035] text-slate-300 border border-[#243657]">
                              {scenario.cweId}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {scenario.mitreAttack && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/50 text-red-300 border border-red-800/40 flex items-center gap-1">
                                <Crosshair className="w-2.5 h-2.5" />
                                {scenario.mitreAttack.techniqueId}
                              </span>
                            )}
                            {scenario.owasp && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-800/40 flex items-center gap-1">
                                <BookOpen className="w-2.5 h-2.5" />
                                {scenario.owasp.code}
                              </span>
                            )}

                            {scenario.isCustom && (
                              <button
                                onClick={(e) => handleDeleteCustom(e, scenario.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                title="Delete Custom Scenario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Service */}
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                          <Cpu className={`w-4 h-4 shrink-0 ${isFamous ? 'text-amber-400' : 'text-cyan-400'}`} />
                          {scenario.name}
                        </h3>

                        <div className="text-xs text-cyan-300 font-semibold font-mono">
                          Target: {scenario.targetService}
                        </div>

                        {/* Famous Real-World Story Box */}
                        {isFamous && scenario.realWorldIncident && (
                          <div className="p-2.5 rounded-lg bg-[#070a12] border border-amber-900/30 text-[11px] text-amber-200/90 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
                              <span>Victim: {scenario.realWorldIncident.affectedEntities}</span>
                              <span>Year: {scenario.realWorldIncident.year}</span>
                            </div>
                            <p className="text-slate-300 leading-snug line-clamp-2">
                              {scenario.realWorldIncident.realWorldStory}
                            </p>
                            {scenario.realWorldIncident.estimatedImpact && (
                              <div className="text-[10px] text-rose-300 font-semibold">
                                Impact: {scenario.realWorldIncident.estimatedImpact}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {scenario.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1a2333] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-mono">{scenario.targetFile}</span>
                        <button className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          isSelected ? 'bg-cyan-600 text-white shadow-sm' : 'bg-[#162035] text-slate-300 hover:bg-[#1f2b45]'
                        }`}>
                          <span>{isSelected ? 'ACTIVE' : 'SELECT SCENARIO'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-[#090c14] px-6 py-3 border-t border-[#1a2333] flex items-center justify-between text-xs text-slate-500">
            <span>Deterministic simulation arena maps exploits directly to MITRE ATT&CK® & MITRE D3FEND™.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#141b2b] hover:bg-[#1e2840] text-slate-300 hover:text-white transition-colors border border-[#232f48] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Nested Custom Scenario Creator Modal */}
      <CustomScenarioModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onScenarioCreated={handleCustomCreated}
      />
    </>
  );
};
