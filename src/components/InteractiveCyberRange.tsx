import React, { useState, useEffect } from 'react';
import {
  Flame,
  Shield,
  Scale,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Wrench,
  Activity,
  Code2,
  Terminal,
  FileCode,
  GitCompare,
  Eye,
  Info,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Layers,
  Zap,
  BookOpen,
  Sliders,
  Check,
  Copy,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  Scenario,
  HttpPayload,
  RedAttackResult,
  BlueDefenseResult,
  ArbiterEvaluationResult,
  OperatorRole,
  OperatorActionDebrief,
  CommanderSettings,
  Severity
} from '../types';
import { SCENARIOS } from '../data/scenarios';
import { sounds } from '../utils/audio';
import { SocraticHintModal } from './SocraticHintModal';
import { HelpCircle } from 'lucide-react';
import { AiTag, AiFeatureBadge } from './AiTag';

interface InteractiveCyberRangeProps {
  activeScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
  settings: CommanderSettings;
  onUpdateSettings: (newSettings: Partial<CommanderSettings>) => void;
  onAdvanceToArena: () => void;
}

export const InteractiveCyberRange: React.FC<InteractiveCyberRangeProps> = ({
  activeScenario,
  onSelectScenario,
  settings,
  onUpdateSettings,
  onAdvanceToArena,
}) => {
  // Current Role
  const [operatorRole, setOperatorRole] = useState<OperatorRole>(settings.operatorRole || 'red_attacker');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (settings.operatorRole) {
      setOperatorRole(settings.operatorRole);
    }
  }, [settings.operatorRole]);

  // Red Team Interactive State
  const [redMethod, setRedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>(activeScenario.defaultExploit.method);
  const [redPath, setRedPath] = useState<string>(activeScenario.defaultExploit.path);
  const [redHeaders, setRedHeaders] = useState<string>(JSON.stringify(activeScenario.defaultExploit.headers, null, 2));
  const [redParams, setRedParams] = useState<string>(JSON.stringify(activeScenario.defaultExploit.params || {}, null, 2));
  const [redBody, setRedBody] = useState<string>(JSON.stringify(activeScenario.defaultExploit.body || {}, null, 2));
  const [redActionName, setRedActionName] = useState<string>('Targeted Exploit Vector');
  const [redRationale, setRedRationale] = useState<string>(activeScenario.defaultExploit.rationale);
  const [redAttackLoading, setRedAttackLoading] = useState<boolean>(false);
  const [lastRedResult, setLastRedResult] = useState<RedAttackResult | null>(null);

  // Blue Team Interactive State
  const [blueCode, setBlueCode] = useState<string>(activeScenario.defaultPatch.patchedCode);
  const [blueStrategyName, setBlueStrategyName] = useState<string>(activeScenario.defaultPatch.patchStrategy);
  const [blueRationale, setBlueRationale] = useState<string>(activeScenario.defaultPatch.rationale);
  const [bluePatchLoading, setBluePatchLoading] = useState<boolean>(false);
  const [lastBlueResult, setLastBlueResult] = useState<BlueDefenseResult | null>(null);

  // Arbiter Interactive State
  const [arbiterLoading, setArbiterLoading] = useState<boolean>(false);
  const [lastArbiterResult, setLastArbiterResult] = useState<ArbiterEvaluationResult | null>(null);

  // AI Co-Pilot State
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotAdvice, setCopilotAdvice] = useState<{ advice: string; suggestions: string[] } | null>(null);

  // Operator Action Debrief State
  const [currentDebrief, setCurrentDebrief] = useState<OperatorActionDebrief | null>(null);
  const [debriefHistory, setDebriefHistory] = useState<OperatorActionDebrief[]>([]);
  const [activeTabStudio, setActiveTabStudio] = useState<'editor' | 'terminal' | 'debrief' | 'diff'>('editor');

  // Socratic Hint System Modal State
  const [socraticModalOpen, setSocraticModalOpen] = useState<boolean>(false);

  // Sync state when scenario changes
  useEffect(() => {
    setRedMethod(activeScenario.defaultExploit.method);
    setRedPath(activeScenario.defaultExploit.path);
    setRedHeaders(JSON.stringify(activeScenario.defaultExploit.headers, null, 2));
    setRedParams(JSON.stringify(activeScenario.defaultExploit.params || {}, null, 2));
    setRedBody(JSON.stringify(activeScenario.defaultExploit.body || {}, null, 2));
    setRedActionName(`Exploit: ${activeScenario.vulnerabilityType}`);
    setRedRationale(activeScenario.defaultExploit.rationale);

    setBlueCode(activeScenario.defaultPatch.patchedCode);
    setBlueStrategyName(activeScenario.defaultPatch.patchStrategy);
    setBlueRationale(activeScenario.defaultPatch.rationale);

    setLastRedResult(null);
    setLastBlueResult(null);
    setLastArbiterResult(null);
    setCopilotAdvice(null);
  }, [activeScenario]);

  // Categories list
  const categories = ['All', 'Authentication', 'Access Control', 'Injection', 'Cloud Security', 'Concurrency', 'AI / LLM', 'API Security'];

  const filteredScenarios = selectedCategory === 'All'
    ? SCENARIOS
    : SCENARIOS.filter((s) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()) || s.name.toLowerCase().includes(selectedCategory.toLowerCase()));

  // 1. Launch Interactive Red Attack
  const handleExecuteRedAttack = async () => {
    setRedAttackLoading(true);
    sounds.playRedAttack();

    let parsedHeaders = {};
    let parsedParams = {};
    let parsedBody = {};

    try {
      if (redHeaders.trim()) parsedHeaders = JSON.parse(redHeaders);
    } catch (e) {
      console.warn('Headers JSON parse warning, using empty', e);
    }
    try {
      if (redParams.trim()) parsedParams = JSON.parse(redParams);
    } catch (e) {
      console.warn('Params JSON parse warning, using empty', e);
    }
    try {
      if (redBody.trim()) parsedBody = JSON.parse(redBody);
    } catch (e) {
      console.warn('Body JSON parse warning, using empty', e);
    }

    const payload: HttpPayload = {
      method: redMethod,
      path: redPath,
      headers: parsedHeaders,
      params: parsedParams,
      body: parsedBody
    };

    try {
      const res = await fetch('/api/interactive/execute-red', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          payload,
          actionName: redActionName,
          rationale: redRationale,
          vectorName: `${redMethod} ${redPath}`
        })
      });

      const data = await res.json();
      if (data.success && data.redResult) {
        setLastRedResult(data.redResult);
        if (data.debrief) {
          setCurrentDebrief(data.debrief);
          setDebriefHistory((prev) => [data.debrief, ...prev.slice(0, 20)]);
          setActiveTabStudio('debrief');
        } else {
          setActiveTabStudio('terminal');
        }
        sounds.playTick();
      }
    } catch (err) {
      console.error('Error executing red attack:', err);
    } finally {
      setRedAttackLoading(false);
    }
  };

  // 2. Deploy Interactive Blue Hot-Patch
  const handleDeployBluePatch = async () => {
    setBluePatchLoading(true);
    sounds.playBluePatch();

    try {
      const res = await fetch('/api/interactive/execute-blue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          patchedCode: blueCode,
          strategy: 'custom_manual',
          strategyName: blueStrategyName,
          rationale: blueRationale
        })
      });

      const data = await res.json();
      if (data.success && data.blueResult) {
        setLastBlueResult(data.blueResult);
        if (data.debrief) {
          setCurrentDebrief(data.debrief);
          setDebriefHistory((prev) => [data.debrief, ...prev.slice(0, 20)]);
          setActiveTabStudio('debrief');
        } else {
          setActiveTabStudio('diff');
        }
        sounds.playTick();
      }
    } catch (err) {
      console.error('Error deploying blue patch:', err);
    } finally {
      setBluePatchLoading(false);
    }
  };

  // 3. Execute Interactive Arbiter Evaluation
  const handleRunArbiter = async () => {
    setArbiterLoading(true);

    let parsedHeaders = {};
    let parsedParams = {};
    let parsedBody = {};
    try { if (redHeaders.trim()) parsedHeaders = JSON.parse(redHeaders); } catch (e) {}
    try { if (redParams.trim()) parsedParams = JSON.parse(redParams); } catch (e) {}
    try { if (redBody.trim()) parsedBody = JSON.parse(redBody); } catch (e) {}

    const payload: HttpPayload = {
      method: redMethod,
      path: redPath,
      headers: parsedHeaders,
      params: parsedParams,
      body: parsedBody
    };

    try {
      const res = await fetch('/api/interactive/evaluate-arbiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          attackPayload: payload,
          patchedCode: blueCode
        })
      });

      const data = await res.json();
      if (data.success && data.arbiterResult) {
        setLastArbiterResult(data.arbiterResult);
        if (data.debrief) {
          setCurrentDebrief(data.debrief);
          setDebriefHistory((prev) => [data.debrief, ...prev.slice(0, 20)]);
          setActiveTabStudio('debrief');
        }
        sounds.playVictory(data.arbiterResult.verdict === 'BLUE_WIN');
      }
    } catch (err) {
      console.error('Error running arbiter:', err);
    } finally {
      setArbiterLoading(false);
    }
  };

  // 4. Request AI Co-Pilot Advice
  const handleGetCopilotAdvice = async () => {
    setCopilotLoading(true);
    try {
      let parsedHeaders = {};
      let parsedParams = {};
      let parsedBody = {};
      try { if (redHeaders.trim()) parsedHeaders = JSON.parse(redHeaders); } catch (e) {}
      try { if (redParams.trim()) parsedParams = JSON.parse(redParams); } catch (e) {}
      try { if (redBody.trim()) parsedBody = JSON.parse(redBody); } catch (e) {}

      const res = await fetch('/api/interactive/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: operatorRole === 'red_attacker' ? 'red' : operatorRole === 'blue_defender' ? 'blue' : 'arbiter',
          scenarioId: activeScenario.id,
          payload: { method: redMethod, path: redPath, headers: parsedHeaders, params: parsedParams, body: parsedBody },
          patchedCode: blueCode,
          question: `How can I optimize my ${operatorRole === 'red_attacker' ? 'exploit payload' : operatorRole === 'blue_defender' ? 'defense patch' : 'evaluation verdict'} for ${activeScenario.name}?`
        })
      });

      const data = await res.json();
      if (data.success && data.copilot) {
        setCopilotAdvice(data.copilot);
      }
    } catch (err) {
      console.error('Copilot advice request failed:', err);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Preset Exploit Injectors
  const applyPresetExploit = (presetName: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', path: string, headers: any, params: any, body: any, rationale: string) => {
    setRedMethod(method);
    setRedPath(path);
    setRedHeaders(JSON.stringify(headers, null, 2));
    setRedParams(JSON.stringify(params, null, 2));
    setRedBody(JSON.stringify(body, null, 2));
    setRedActionName(presetName);
    setRedRationale(rationale);
    sounds.playTick();
  };

  // Preset Patch Injectors
  const applyPresetPatch = (name: string, code: string, rationale: string) => {
    setBlueCode(code);
    setBlueStrategyName(name);
    setBlueRationale(rationale);
    sounds.playTick();
  };

  return (
    <div className="space-y-4 font-mono text-xs text-slate-200">
      {/* Top Banner: Role Selection & Guided Intelligence */}
      <div className="bg-[#0c0f18] border border-[#1a2333] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#182233] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-900/60 to-slate-900 border border-cyan-500/40 text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  OPERATOR CYBER RANGE
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border transition-colors ${
                    operatorRole === 'red_attacker'
                      ? 'bg-rose-950/90 text-rose-300 border-rose-700/60'
                      : operatorRole === 'blue_defender'
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700/60'
                      : 'bg-purple-950/90 text-purple-300 border-purple-700/60'
                  }`}>
                    SINGLE TEAM OPERATOR
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  Active Operational Team:{' '}
                  <span className={`font-bold ${
                    operatorRole === 'red_attacker' ? 'text-rose-400' : operatorRole === 'blue_defender' ? 'text-cyan-300' : 'text-purple-300'
                  }`}>
                    {operatorRole === 'red_attacker' ? 'RED TEAM (ATTACKER)' : operatorRole === 'blue_defender' ? 'BLUE TEAM (DEFENDER)' : 'AI ARBITER (JUDGE)'}
                  </span>
                  {' '}— Select your team below to switch operational focus.
                </p>
              </div>
            </div>
          </div>

          {/* Role Selection Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#080b13] p-1.5 rounded-xl border border-[#1e2a40]">
            <button
              id="role-select-red-btn"
              onClick={() => { setOperatorRole('red_attacker'); onUpdateSettings({ operatorRole: 'red_attacker' }); sounds.playTick(); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                operatorRole === 'red_attacker'
                  ? 'bg-rose-950 text-rose-300 border border-rose-600/70 shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121724]'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>RED TEAM (Attacker)</span>
            </button>

            <button
              id="role-select-blue-btn"
              onClick={() => { setOperatorRole('blue_defender'); onUpdateSettings({ operatorRole: 'blue_defender' }); sounds.playTick(); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                operatorRole === 'blue_defender'
                  ? 'bg-sky-950 text-sky-300 border border-sky-600/70 shadow-md shadow-sky-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121724]'
              }`}
            >
              <Shield className="w-4 h-4 text-sky-400" />
              <span>BLUE TEAM (Defender)</span>
            </button>

            <button
              id="role-select-arbiter-btn"
              onClick={() => { setOperatorRole('arbiter_judge'); onUpdateSettings({ operatorRole: 'arbiter_judge' }); sounds.playTick(); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                operatorRole === 'arbiter_judge'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/70 shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121724]'
              }`}
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>ARBITER (Judge)</span>
            </button>
          </div>
        </div>

        {/* Scenario Selection Deck */}
        <div className="pt-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className={`w-4 h-4 ${
                operatorRole === 'red_attacker' ? 'text-rose-400' : operatorRole === 'blue_defender' ? 'text-cyan-400' : 'text-purple-400'
              }`} />
              <span className="text-xs font-bold text-slate-300">TARGET MICROSERVICE SCENARIO:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-md border text-xs transition-colors ${
                operatorRole === 'red_attacker'
                  ? 'text-rose-300 bg-rose-950/80 border-rose-800/80'
                  : operatorRole === 'blue_defender'
                  ? 'text-cyan-300 bg-[#141b2b] border-[#212c44]'
                  : 'text-purple-300 bg-purple-950/80 border-purple-800/80'
              }`}>
                {activeScenario.name}
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? operatorRole === 'red_attacker'
                        ? 'bg-rose-950 text-rose-300 border border-rose-700/80 font-bold'
                        : operatorRole === 'blue_defender'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-bold'
                        : 'bg-purple-950 text-purple-300 border border-purple-700/80 font-bold'
                      : 'bg-[#101420] text-slate-400 hover:text-slate-200 hover:bg-[#182030] border border-[#1a2333]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Grid Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {filteredScenarios.map((sc) => {
              const isSelected = sc.id === activeScenario.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? operatorRole === 'red_attacker'
                        ? 'bg-[#1a0f12] border-rose-500 text-white shadow-md shadow-rose-950/60'
                        : operatorRole === 'blue_defender'
                        ? 'bg-[#141b2b] border-cyan-500 text-white shadow-md shadow-cyan-950/60'
                        : 'bg-[#160f22] border-purple-500 text-white shadow-md shadow-purple-950/60'
                      : 'bg-[#090c14] border-[#182133] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className={`px-1.5 py-0.2 rounded font-semibold border ${
                        isSelected
                          ? operatorRole === 'red_attacker'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : operatorRole === 'blue_defender'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-purple-950 text-purple-300 border-purple-800'
                          : 'bg-[#0f1422] text-slate-400 border-[#1c263a]'
                      }`}>
                        {sc.category}
                      </span>
                      <span className={`font-bold ${sc.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {sc.severity}
                      </span>
                    </div>
                    <div className="font-bold text-xs truncate text-slate-100">{sc.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{sc.vulnerabilityType}</div>
                  </div>
                  {isSelected && (
                    <div className={`flex items-center gap-1 text-[10px] font-semibold mt-1.5 pt-1 border-t ${
                      operatorRole === 'red_attacker'
                        ? 'text-rose-300 border-rose-900/60'
                        : operatorRole === 'blue_defender'
                        ? 'text-cyan-300 border-[#223048]'
                        : 'text-purple-300 border-purple-900/60'
                    }`}>
                      <CheckCircle2 className={`w-3 h-3 ${
                        operatorRole === 'red_attacker' ? 'text-rose-400' : operatorRole === 'blue_defender' ? 'text-cyan-400' : 'text-purple-400'
                      }`} />
                      <span>Active Target</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 Cols): Role Workspace & Action Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* ================= RED TEAM ATTACK WORKSPACE ================= */}
          {operatorRole === 'red_attacker' && (
            <div className="bg-[#0c0f18] border border-[#2b171c] rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
              <div className="flex items-center justify-between border-b border-[#2b171c] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#2b0d15] border border-rose-600/60 text-rose-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-300">RED TEAM EXPLOIT STUDIO</h3>
                    <p className="text-[11px] text-slate-400">Craft and fire offensive payloads to trigger {activeScenario.vulnerabilityType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="red-copilot-btn"
                    onClick={handleGetCopilotAdvice}
                    disabled={copilotLoading}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900/80 text-rose-200 border border-rose-700/60 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    title="Get AI Red Team recommendations"
                  >
                    {copilotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-rose-400" />}
                    <span>AI Red Assist</span>
                    <AiFeatureBadge label="AI" />
                  </button>

                  <button
                    id="red-execute-attack-btn"
                    onClick={handleExecuteRedAttack}
                    disabled={redAttackLoading}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/60 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {redAttackLoading ? <Send className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Launch Attack Payload</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Attack Actions */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  TACTICAL ATTACK PRESETS:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      applyPresetExploit(
                        'Targeted Default Exploit',
                        activeScenario.defaultExploit.method,
                        activeScenario.defaultExploit.path,
                        activeScenario.defaultExploit.headers,
                        activeScenario.defaultExploit.params || {},
                        activeScenario.defaultExploit.body || {},
                        activeScenario.defaultExploit.rationale
                      )
                    }
                    className="p-2 rounded-lg bg-[#140f16] border border-[#2b1723] hover:border-rose-600/70 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200 flex items-center justify-between">
                      <span>Primary Weaponized Vector</span>
                      <span className="text-[10px] text-slate-500 font-normal">{activeScenario.cweId}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeScenario.defaultExploit.attackVector}</p>
                  </button>

                  <button
                    onClick={() =>
                      applyPresetExploit(
                        'Recon & Endpoint Prober',
                        'GET',
                        activeScenario.apiDoc.endpoint,
                        { 'x-origin-client': 'security-audit-probe', 'accept': 'application/json' },
                        {},
                        {},
                        'Probes endpoint structure and headers without injecting payload.'
                      )
                    }
                    className="p-2 rounded-lg bg-[#140f16] border border-[#2b1723] hover:border-rose-600/70 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200">
                      <span>Passive Recon & Fingerprint</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Test baseline response codes and route headers</p>
                  </button>
                </div>
              </div>

              {/* Interactive HTTP Request Builder */}
              <div className="bg-[#080b13] border border-[#1e273b] rounded-xl p-3 space-y-3">
                {/* Method & Path Row */}
                <div className="flex items-center gap-2">
                  <select
                    id="red-method-select"
                    value={redMethod}
                    onChange={(e) => setRedMethod(e.target.value as any)}
                    className="bg-[#141b2b] border border-[#243350] text-rose-300 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>

                  <input
                    id="red-path-input"
                    type="text"
                    value={redPath}
                    onChange={(e) => setRedPath(e.target.value)}
                    className="flex-1 bg-[#141b2b] border border-[#243350] text-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-rose-500"
                    placeholder="/api/v1/resource"
                  />
                </div>

                {/* HTTP Headers Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>HTTP Request Headers (JSON):</span>
                    <span className="text-[10px] text-slate-500">e.g. Authorization, X-User-Id</span>
                  </div>
                  <textarea
                    id="red-headers-editor"
                    rows={3}
                    value={redHeaders}
                    onChange={(e) => setRedHeaders(e.target.value)}
                    className="w-full bg-[#0d121f] border border-[#1e273b] rounded-lg p-2 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Body or Query Params */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Payload Body / Parameters (JSON):</span>
                    <span className="text-[10px] text-amber-400">Inject exploit payload here</span>
                  </div>
                  <textarea
                    id="red-body-editor"
                    rows={4}
                    value={redBody}
                    onChange={(e) => setRedBody(e.target.value)}
                    className="w-full bg-[#0d121f] border border-[#1e273b] rounded-lg p-2 text-[11px] font-mono text-amber-300 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= BLUE TEAM DEFENSE WORKSPACE ================= */}
          {operatorRole === 'blue_defender' && (
            <div className="bg-[#0c0f18] border border-[#162238] rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
              <div className="flex items-center justify-between border-b border-[#162238] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#0d213f] border border-sky-600/60 text-sky-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-sky-300">BLUE TEAM ZERO-DOWNTIME HOT-PATCH STUDIO</h3>
                    <p className="text-[11px] text-slate-400">Deploy defensive guardrails to neutralize vulnerabilities without breaking SLAs</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="blue-socratic-hints-btn"
                    onClick={() => setSocraticModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border border-amber-600/60 text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    title="Open Socratic Guidance & Hypothesis Validator"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Strategic Socratic Hints</span>
                  </button>

                  <button
                    id="blue-copilot-btn"
                    onClick={handleGetCopilotAdvice}
                    disabled={copilotLoading}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900/80 text-sky-200 border border-sky-700/60 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    title="Get AI Blue Team recommendations"
                  >
                    {copilotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-sky-400" />}
                    <span>AI Blue Assist</span>
                    <AiFeatureBadge label="AI" />
                  </button>

                  <button
                    id="blue-deploy-patch-btn"
                    onClick={handleDeployBluePatch}
                    disabled={bluePatchLoading}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-950/60 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {bluePatchLoading ? <Wrench className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                    <span>Deploy Hot-Patch to Container</span>
                  </button>
                </div>
              </div>

              {/* Mitigation Pattern Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  DEFENSIVE MITIGATION PRESETS:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      applyPresetPatch(
                        activeScenario.defaultPatch.patchStrategy,
                        activeScenario.defaultPatch.patchedCode,
                        activeScenario.defaultPatch.rationale
                      )
                    }
                    className="p-2 rounded-lg bg-[#0e1726] border border-[#1d2d47] hover:border-sky-600/70 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-sky-300 group-hover:text-sky-200 flex items-center justify-between">
                      <span>Zero-Downtime Hardening Patch</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">Recommended</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeScenario.defaultPatch.patchStrategy}</p>
                  </button>

                  <button
                    onClick={() =>
                      applyPresetPatch(
                        'Revert to Vulnerable Code',
                        activeScenario.vulnerableCode,
                        'Reset codebase to initial unpatched state for baseline testing.'
                      )
                    }
                    className="p-2 rounded-lg bg-[#0e1726] border border-[#1d2d47] hover:border-sky-600/70 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-300 group-hover:text-white">
                      <span>Reset to Original Vulnerable Code</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Test exploit against baseline unprotected routes</p>
                  </button>
                </div>
              </div>

              {/* Interactive Code Patch Editor */}
              <div className="bg-[#080b13] border border-[#1e273b] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-sky-300 font-semibold">
                    <Code2 className="w-3.5 h-3.5" />
                    Target Source Code ({activeScenario.targetFile}):
                  </span>
                  <span className="text-[10px] text-slate-500">Live TypeScript Sandboxed Environment</span>
                </div>
                <textarea
                  id="blue-code-editor"
                  rows={11}
                  value={blueCode}
                  onChange={(e) => setBlueCode(e.target.value)}
                  className="w-full bg-[#070910] border border-[#1e273b] rounded-lg p-2.5 text-xs font-mono text-emerald-300 leading-relaxed focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* ================= ARBITER JUDGE WORKSPACE ================= */}
          {operatorRole === 'arbiter_judge' && (
            <div className="bg-[#0c0f18] border border-[#2b2716] rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
              <div className="flex items-center justify-between border-b border-[#2b2716] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#2b220d] border border-amber-600/60 text-amber-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-300">ARBITER VERIFICATION CHAMBER</h3>
                    <p className="text-[11px] text-slate-400">Run dual verification: Re-test offensive exploit + test 100% legitimate traffic SLA</p>
                  </div>
                </div>

                <button
                  id="arbiter-run-validation-btn"
                  onClick={handleRunArbiter}
                  disabled={arbiterLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/60 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {arbiterLoading ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Execute Dual-Validation Suite</span>
                </button>
              </div>

              {/* Arbiter Verification Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#090c14] border border-[#1a2333] rounded-xl p-3 space-y-2">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Offensive Exploit Neutralization
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Re-fires the active Red Team attack payload against the staged Blue patch. If the patch returns HTTP 403 or filters the vector, threat is marked NEUTRALIZED.
                  </p>
                </div>

                <div className="bg-[#090c14] border border-[#1a2333] rounded-xl p-3 space-y-2">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Zero-Downtime SLA Check
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Executes {activeScenario.normalTrafficSamples.length} legitimate customer request contracts. If any normal traffic returns errors, a Production Outage penalty is applied.
                  </p>
                </div>
              </div>

              {/* Normal Traffic Suite Preview */}
              <div className="bg-[#080b13] border border-[#1e273b] rounded-xl p-3 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold">Legitimate Traffic Regression Baselines:</div>
                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                  {activeScenario.normalTrafficSamples.map((sample, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#0d121f] border border-[#192233] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{sample.method}</span>
                        <span className="text-slate-300">{sample.path}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">Expected HTTP {sample.expectedStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Co-Pilot Advice Callout Banner */}
          {copilotAdvice && (
            <div className="bg-gradient-to-r from-[#0d1726] to-[#0c121e] border border-cyan-500/50 rounded-2xl p-4 space-y-2 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI CYBERSECURITY CO-PILOT INTELLIGENCE</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{copilotAdvice.advice}</p>
              {copilotAdvice.suggestions.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pt-1">
                  {copilotAdvice.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right Column (5 Cols): Live Execution Telemetry, Intelligence Debrief & Explanations */}
        <div className="lg:col-span-5 space-y-4">
          {/* Action Results & Debrief Studio Card */}
          <div className="bg-[#0c0f18] border border-[#1a2333] rounded-2xl overflow-hidden shadow-xl flex flex-col h-full">
            {/* Tabs */}
            <div className="bg-[#090c14] px-3 pt-2.5 border-b border-[#1a2333] flex items-center gap-1">
              <button
                id="debrief-tab-btn"
                onClick={() => setActiveTabStudio('debrief')}
                className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTabStudio === 'debrief'
                    ? 'bg-[#0f1422] text-cyan-300 border-t border-x border-[#1e2a40]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Action Debrief & Explanation</span>
              </button>

              <button
                id="terminal-tab-btn"
                onClick={() => setActiveTabStudio('terminal')}
                className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTabStudio === 'terminal'
                    ? 'bg-[#0f1422] text-cyan-300 border-t border-x border-[#1e2a40]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Execution Logs</span>
              </button>

              <button
                id="diff-tab-btn"
                onClick={() => setActiveTabStudio('diff')}
                className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTabStudio === 'diff'
                    ? 'bg-[#0f1422] text-cyan-300 border-t border-x border-[#1e2a40]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5 text-sky-400" />
                <span>Unified Diff</span>
              </button>
            </div>

            {/* Tab 1: Operator Debrief & Explanation */}
            {activeTabStudio === 'debrief' && (
              <div className="p-4 space-y-3.5 overflow-y-auto max-h-[580px]">
                {currentDebrief ? (
                  <div className="space-y-3">
                    {/* Status Pill & Title */}
                    <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1e2a42] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            currentDebrief.outcomeStatus === 'BREACH_SUCCESS'
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : currentDebrief.outcomeStatus === 'BREACH_BLOCKED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : currentDebrief.outcomeStatus === 'PATCH_EFFECTIVE'
                              ? 'bg-sky-950 text-sky-300 border border-sky-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {currentDebrief.outcomeStatus.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          HTTP {currentDebrief.statusCode || 200}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{currentDebrief.actionName}</h4>
                      <p className="text-xs text-slate-300">{currentDebrief.choiceSummary}</p>
                    </div>

                    {/* Step-by-Step Execution Breakdown */}
                    <div className="bg-[#090c14] border border-[#1a2333] rounded-xl p-3 space-y-2">
                      <div className="text-[11px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Execution Trace:
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        {currentDebrief.stepByStepBreakdown.map((step, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-[#0d121f] text-[11px] leading-relaxed">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sensitive Exfiltrated Data if any */}
                    {currentDebrief.exfiltratedData && (
                      <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 space-y-1.5">
                        <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          EXFILTRATED SENSITIVE ASSETS:
                        </div>
                        <pre className="p-2 rounded bg-black/60 text-rose-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                          {currentDebrief.exfiltratedData}
                        </pre>
                      </div>
                    )}

                    {/* MITRE & OWASP Context */}
                    <div className="bg-[#090c14] border border-[#1a2333] rounded-xl p-3 space-y-2">
                      <div className="text-[11px] text-purple-400 font-bold uppercase flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Framework Mapping:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {currentDebrief.mitreMapping?.attackId && (
                          <div className="p-2 rounded bg-[#0d121f] border border-[#1c2438]">
                            <div className="text-slate-400">MITRE ATT&CK:</div>
                            <div className="text-rose-300 font-bold mt-0.5">{currentDebrief.mitreMapping.attackId}</div>
                            <div className="text-slate-400 truncate">{currentDebrief.mitreMapping.attackName}</div>
                          </div>
                        )}
                        {currentDebrief.mitreMapping?.d3fendId && (
                          <div className="p-2 rounded bg-[#0d121f] border border-[#1c2438]">
                            <div className="text-slate-400">MITRE D3FEND:</div>
                            <div className="text-sky-300 font-bold mt-0.5">{currentDebrief.mitreMapping.d3fendId}</div>
                            <div className="text-slate-400 truncate">{currentDebrief.mitreMapping.d3fendName}</div>
                          </div>
                        )}
                        {currentDebrief.mitreMapping?.owaspCode && (
                          <div className="p-2 rounded bg-[#0d121f] border border-[#1c2438] col-span-2">
                            <div className="text-slate-400">OWASP Standard:</div>
                            <div className="text-purple-300 font-bold mt-0.5">{currentDebrief.mitreMapping.owaspCode} - {currentDebrief.mitreMapping.owaspTitle}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Takeaway & Pro Tip */}
                    <div className="bg-[#0d1424] border border-[#1d2c47] rounded-xl p-3 space-y-2">
                      <div>
                        <div className="text-[10px] text-cyan-400 uppercase font-bold">Key Tactical Takeaway:</div>
                        <p className="text-xs text-slate-200 leading-relaxed mt-0.5">{currentDebrief.keyTakeaway}</p>
                      </div>
                      <div className="pt-2 border-t border-[#1a253a]">
                        <div className="text-[10px] text-emerald-400 uppercase font-bold">2026 Production Security Tip:</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{currentDebrief.proSecurityTip}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                    <div>No drill actions executed yet.</div>
                    <p className="text-[11px] text-slate-600">
                      Launch an attack payload or deploy a hot-patch to see the step-by-step educational debrief and results explanation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Terminal Execution Logs */}
            {activeTabStudio === 'terminal' && (
              <div className="p-3 bg-[#070910] overflow-y-auto max-h-[580px] space-y-1.5 text-[11px]">
                {lastRedResult?.executionLogs && lastRedResult.executionLogs.length > 0 ? (
                  lastRedResult.executionLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded font-mono flex items-start gap-2 border ${
                        log.level === 'security'
                          ? 'bg-rose-950/30 border-rose-900/40 text-rose-300'
                          : log.level === 'warn'
                          ? 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                          : 'bg-[#0d121f] border-[#182133] text-slate-300'
                      }`}
                    >
                      <span className="text-slate-500 text-[10px]">[{log.timestamp.split('T')[1]?.slice(0, 8)}]</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-8">Awaiting attack execution...</div>
                )}
              </div>
            )}

            {/* Tab 3: Unified Diff Preview */}
            {activeTabStudio === 'diff' && (
              <div className="p-3 bg-[#070910] overflow-y-auto max-h-[580px] text-xs font-mono">
                {lastBlueResult?.unifiedDiff ? (
                  <pre className="text-slate-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                    {lastBlueResult.unifiedDiff}
                  </pre>
                ) : (
                  <div className="text-slate-500 text-center py-8">Deploy a hot-patch to view the generated unified diff.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Socratic Hint System Modal */}
      <SocraticHintModal
        isOpen={socraticModalOpen}
        onClose={() => setSocraticModalOpen(false)}
        scenario={activeScenario}
        currentPatchedCode={blueCode}
        onApplySuggestedSnippet={(snippet) => {
          setBlueCode(snippet);
        }}
      />
    </div>
  );
};
