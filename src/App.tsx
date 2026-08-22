import React, { useState, useEffect, useCallback } from 'react';
import { SCENARIOS } from './data/scenarios';
import {
  Scenario,
  Phase,
  CommanderSettings,
  RedAttackResult,
  BlueDefenseResult,
  ArbiterEvaluationResult,
  SimulationRound,
  AppViewTab,
  OperatorRole
} from './types';
import { Header } from './components/Header';
import { PhaseOrchestratorBar } from './components/PhaseOrchestratorBar';
import { CodeWorkbench } from './components/CodeWorkbench';
import { RedAgentPanel } from './components/RedAgentPanel';
import { BlueAgentPanel } from './components/BlueAgentPanel';
import { ArbiterChamber } from './components/ArbiterChamber';
import { CommanderControls } from './components/CommanderControls';
import { ThreatTelemetry } from './components/ThreatTelemetry';
import { ScenarioModal } from './components/ScenarioModal';
import { MitreOwaspMatrix } from './components/MitreOwaspMatrix';
import { GraphicalAnalyticsDashboard } from './components/GraphicalAnalyticsDashboard';
import { InteractiveTopologyGraph } from './components/InteractiveTopologyGraph';
import { InteractiveCyberRange } from './components/InteractiveCyberRange';
import { TutorialGuideModal } from './components/TutorialGuideModal';
import { StrategySelectionModal } from './components/StrategySelectionModal';
import { AgentReplayStudio } from './components/AgentReplayStudio';
import { MatchReportModal } from './components/MatchReportModal';
import { StartScreenModal } from './components/StartScreenModal';
import { InteractiveGuidePresentation } from './components/InteractiveGuidePresentation';
import { KillChainStageTracker } from './components/KillChainStageTracker';
import { AttackPathMap } from './components/AttackPathMap';
import { AiFeatureBadge } from './components/AiTag';
import { generateMatchReportData } from './utils/reportGenerator';
import { ATTACK_PATHS } from './data/attackPaths';
import { getAllScenarios } from './data/scenarioStore';
import { sounds } from './utils/audio';
import { 
  Shield, 
  BarChart3, 
  Layers, 
  Activity, 
  Network, 
  Terminal, 
  CheckCircle2, 
  Flame, 
  Zap, 
  ChevronRight,
  Play,
  Sliders,
  Film,
  BookOpen,
  FileText
} from 'lucide-react';
import { MatchReportData } from './types';

export default function App() {
  // Active Scenario
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);

  // New Modals State: Guided Tutorial, Match Strategy, Agent Replay, Match Report, Start Screen
  const [tutorialModalOpen, setTutorialModalOpen] = useState<boolean>(true);
  const [strategyModalOpen, setStrategyModalOpen] = useState<boolean>(false);
  const [replayModalOpen, setReplayModalOpen] = useState<boolean>(false);
  const [matchReportModalOpen, setMatchReportModalOpen] = useState<boolean>(false);
  const [startScreenOpen, setStartScreenOpen] = useState<boolean>(true);
  const [presentationOpen, setPresentationOpen] = useState<boolean>(false);
  const [reportData, setReportData] = useState<MatchReportData | null>(null);

  // Commander Settings
  const [settings, setSettings] = useState<CommanderSettings>({
    redStrategy: 'apt',
    redTemperature: 0.7,
    redAggression: 3,
    blueStrategy: 'logic_refactor',
    blueTemperature: 0.5,
    blueStrictness: 4,
    simulationSpeed: 'step',
    autoLoop: false,
    soundEnabled: true,
  });

  // State Machine Phase & Round Tracking
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [phase, setPhase] = useState<Phase>('INIT');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState<number>(5);
  const [phaseDuration, setPhaseDuration] = useState<number>(5);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Round Results
  const [redResult, setRedResult] = useState<RedAttackResult | undefined>(undefined);
  const [blueResult, setBlueResult] = useState<BlueDefenseResult | undefined>(undefined);
  const [arbiterResult, setArbiterResult] = useState<ArbiterEvaluationResult | undefined>(undefined);

  // Scores & Telemetry
  const [scores, setScores] = useState({ red: 0, blue: 0, draws: 0 });
  const [history, setHistory] = useState<SimulationRound[]>([]);
  const [resilienceMetric, setResilienceMetric] = useState<number>(94);
  const [uptimeMetric, setUptimeMetric] = useState<number>(99.9);

  // Active view tab for layout
  const [activeTab, setActiveTab] = useState<AppViewTab>('arena');

  // Compute phase duration based on speed multiplier
  const getPhaseTimeLimit = useCallback((p: Phase, speed: '30s' | '15s' | '5s' | 'step') => {
    if (speed === 'step') return 999;
    const factor = speed === '30s' ? 1 : speed === '15s' ? 0.5 : 0.166;
    switch (p) {
      case 'INIT':
        return Math.max(1, Math.round(5 * factor));
      case 'RED_ATTACK':
        return Math.max(2, Math.round(10 * factor));
      case 'BLUE_DEFENSE':
        return Math.max(2, Math.round(10 * factor));
      case 'ARBITER_EVAL':
        return Math.max(1, Math.round(5 * factor));
      case 'ROUND_COMPLETE':
        return 1;
      default:
        return 5;
    }
  }, []);

  // Update commander settings
  const handleUpdateSettings = (newSettings: Partial<CommanderSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Phase Execution Logic
  const runRedAttackPhase = async (scenario: Scenario = activeScenario) => {
    setIsAiProcessing(true);
    try {
      const res = await fetch('/api/simulate/red', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          strategy: settings.redStrategy,
          temperature: settings.redTemperature
        })
      });
      const data = await res.json();
      if (data.success && data.redResult) {
        setRedResult(data.redResult);
        sounds.playRedAttack();
      }
    } catch (err) {
      console.error('Error running Red Attack:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const runBlueDefensePhase = async (scenario: Scenario = activeScenario, currentRed = redResult) => {
    setIsAiProcessing(true);
    try {
      const res = await fetch('/api/simulate/blue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          logs: currentRed?.executionLogs || [],
          currentCode: scenario.vulnerableCode,
          strategy: settings.blueStrategy,
          temperature: settings.blueTemperature
        })
      });
      const data = await res.json();
      if (data.success && data.blueResult) {
        setBlueResult(data.blueResult);
        sounds.playBluePatch();
      }
    } catch (err) {
      console.error('Error running Blue Defense:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const runArbiterPhase = async (
    scenario: Scenario = activeScenario,
    currentRed = redResult,
    currentBlue = blueResult
  ) => {
    setIsAiProcessing(true);
    try {
      const res = await fetch('/api/simulate/arbiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          redResult: currentRed,
          blueResult: currentBlue
        })
      });
      const data = await res.json();
      if (data.success && data.arbiterResult) {
        const arb: ArbiterEvaluationResult = data.arbiterResult;
        setArbiterResult(arb);

        // Update score
        setScores((prev) => ({
          red: prev.red + (arb.verdict === 'RED_WIN' ? 1 : arb.verdict === 'PATCH_BROKE_PROD' ? 1 : 0),
          blue: prev.blue + (arb.verdict === 'BLUE_WIN' ? 1 : 0),
          draws: prev.draws + (arb.verdict === 'DRAW' ? 1 : 0)
        }));

        setResilienceMetric(arb.resilienceScore);
        setUptimeMetric(arb.uptimeCheckPassed ? 99.9 : 92.4);
        sounds.playVictory(arb.verdict === 'BLUE_WIN');

        // Append to history
        const roundRecord: SimulationRound = {
          roundNumber,
          scenario,
          redResult: currentRed,
          blueResult: currentBlue,
          arbiterResult: arb,
          durationMs: 30000,
          timestamp: Date.now()
        };
        setHistory((prev) => [roundRecord, ...prev.slice(0, 49)]);
      }
    } catch (err) {
      console.error('Error running Arbiter evaluation:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Step to next phase
  const advanceToNextPhase = useCallback(() => {
    if (phase === 'INIT') {
      const nextTime = getPhaseTimeLimit('RED_ATTACK', settings.simulationSpeed);
      setPhase('RED_ATTACK');
      setPhaseDuration(nextTime);
      setPhaseTimeRemaining(nextTime);
      runRedAttackPhase(activeScenario);
    } else if (phase === 'RED_ATTACK') {
      const nextTime = getPhaseTimeLimit('BLUE_DEFENSE', settings.simulationSpeed);
      setPhase('BLUE_DEFENSE');
      setPhaseDuration(nextTime);
      setPhaseTimeRemaining(nextTime);
      runBlueDefensePhase(activeScenario, redResult);
    } else if (phase === 'BLUE_DEFENSE') {
      const nextTime = getPhaseTimeLimit('ARBITER_EVAL', settings.simulationSpeed);
      setPhase('ARBITER_EVAL');
      setPhaseDuration(nextTime);
      setPhaseTimeRemaining(nextTime);
      runArbiterPhase(activeScenario, redResult, blueResult);
    } else if (phase === 'ARBITER_EVAL' || phase === 'ROUND_COMPLETE') {
      // Advance to next round & next scenario
      const nextRound = roundNumber + 1;
      const nextScenarioIndex = (SCENARIOS.findIndex((s) => s.id === activeScenario.id) + 1) % SCENARIOS.length;
      const nextScenario = SCENARIOS[nextScenarioIndex];

      setRoundNumber(nextRound);
      setActiveScenario(nextScenario);
      setRedResult(undefined);
      setBlueResult(undefined);
      setArbiterResult(undefined);

      const nextTime = getPhaseTimeLimit('INIT', settings.simulationSpeed);
      setPhase('INIT');
      setPhaseDuration(nextTime);
      setPhaseTimeRemaining(nextTime);
      sounds.playTick();
    }
  }, [phase, activeScenario, redResult, blueResult, roundNumber, settings.simulationSpeed, getPhaseTimeLimit]);

  // Main 1-Second Timer Tick for State Machine
  useEffect(() => {
    if (!settings.autoLoop || settings.simulationSpeed === 'step') return;

    const timer = setInterval(() => {
      setPhaseTimeRemaining((prev) => {
        if (prev <= 1) {
          advanceToNextPhase();
          return getPhaseTimeLimit(phase, settings.simulationSpeed);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.autoLoop, settings.simulationSpeed, phase, advanceToNextPhase, getPhaseTimeLimit]);

  // Manual Trigger: Launch full instant drill
  const handleLaunchInstantDrill = async () => {
    setIsAiProcessing(true);
    try {
      const res = await fetch('/api/simulate/full-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          redStrategy: settings.redStrategy,
          blueStrategy: settings.blueStrategy,
          redTemp: settings.redTemperature,
          blueTemp: settings.blueTemperature
        })
      });
      const data = await res.json();
      if (data.success && data.round) {
        setRedResult(data.round.redResult);
        setBlueResult(data.round.blueResult);
        setArbiterResult(data.round.arbiterResult);

        setScores((prev) => ({
          red: prev.red + (data.round.arbiterResult.verdict === 'RED_WIN' ? 1 : 0),
          blue: prev.blue + (data.round.arbiterResult.verdict === 'BLUE_WIN' ? 1 : 0),
          draws: prev.draws + (data.round.arbiterResult.verdict === 'DRAW' ? 1 : 0)
        }));

        setResilienceMetric(data.round.arbiterResult.resilienceScore);
        setUptimeMetric(data.round.arbiterResult.uptimeCheckPassed ? 99.9 : 92.4);
        setPhase('ARBITER_EVAL');
        sounds.playVictory(data.round.arbiterResult.verdict === 'BLUE_WIN');

        setHistory((prev) => [data.round, ...prev.slice(0, 49)]);
      }
    } catch (err) {
      console.error('Instant drill failed:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    setRoundNumber(1);
    setScores({ red: 0, blue: 0, draws: 0 });
    setHistory([]);
    setRedResult(undefined);
    setBlueResult(undefined);
    setArbiterResult(undefined);
    setResilienceMetric(94);
    setUptimeMetric(99.9);
    setPhase('INIT');
    const initTime = getPhaseTimeLimit('INIT', settings.simulationSpeed);
    setPhaseDuration(initTime);
    setPhaseTimeRemaining(initTime);
    sounds.playTick();
  };

  const handleSelectScenarioDirectly = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setRedResult(undefined);
    setBlueResult(undefined);
    setArbiterResult(undefined);
    setPhase('INIT');
    setPhaseTimeRemaining(getPhaseTimeLimit('INIT', settings.simulationSpeed));
    setActiveTab('arena');
  };

  const handleSelectPhase = useCallback((selectedPhase: Phase) => {
    setPhase(selectedPhase);
    const newTime = getPhaseTimeLimit(selectedPhase, settings.simulationSpeed);
    setPhaseDuration(newTime);
    setPhaseTimeRemaining(newTime);
    sounds.playTick();

    if (selectedPhase === 'RED_ATTACK') {
      if (!redResult && !isAiProcessing) {
        runRedAttackPhase(activeScenario);
      }
    } else if (selectedPhase === 'BLUE_DEFENSE') {
      if (!blueResult && !isAiProcessing) {
        runBlueDefensePhase(activeScenario, redResult);
      }
    } else if (selectedPhase === 'ARBITER_EVAL') {
      if (!arbiterResult && !isAiProcessing) {
        runArbiterPhase(activeScenario, redResult, blueResult);
      }
    }
  }, [settings.simulationSpeed, getPhaseTimeLimit, redResult, blueResult, arbiterResult, isAiProcessing, activeScenario]);

  const liveSimState = {
    currentRoundNumber: roundNumber,
    phase,
    phaseTimeRemaining,
    phaseDuration,
    activeScenario,
    currentRound: {
      roundNumber,
      scenario: activeScenario,
      redResult,
      blueResult,
      arbiterResult,
    },
    history,
    scores,
    resilienceMetric,
    uptimeMetric,
    isPaused: !settings.autoLoop,
    isAiProcessing,
    statusMessage: `Round #${roundNumber} • ${activeScenario.name}`
  };

  const handleOpenMatchReport = useCallback(() => {
    const data = generateMatchReportData({
      scenario: activeScenario,
      simState: liveSimState,
      attackPath: ATTACK_PATHS[activeScenario.id]
    });
    setReportData(data);
    setMatchReportModalOpen(true);
  }, [activeScenario, liveSimState]);

  const handleSelectTeamFromStartScreen = useCallback((
    role: OperatorRole,
    targetTab: AppViewTab,
    updatedScenario?: Scenario,
    customSettings?: Partial<CommanderSettings>
  ) => {
    if (updatedScenario) {
      setActiveScenario(updatedScenario);
    }
    handleUpdateSettings({
      operatorRole: role,
      ...(customSettings || {})
    });
    setActiveTab(targetTab);
    setStartScreenOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#070910] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Tactical Top Header */}
      <Header
        roundNumber={roundNumber}
        phase={phase}
        phaseTimeRemaining={phaseTimeRemaining}
        phaseDuration={phaseDuration}
        scores={scores}
        resilienceMetric={resilienceMetric}
        uptimeMetric={uptimeMetric}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onNextPhase={advanceToNextPhase}
        onResetSimulation={handleResetSimulation}
        activeScenario={activeScenario}
        onOpenScenarioModal={() => setScenarioModalOpen(true)}
        isAiProcessing={isAiProcessing}
        onOpenInteractiveTab={() => setActiveTab('interactive')}
        onOpenTutorial={() => setTutorialModalOpen(true)}
        onOpenStrategyModal={() => setStrategyModalOpen(true)}
        onOpenReplay={() => setActiveTab('replay')}
        onOpenMatchReport={handleOpenMatchReport}
        onOpenStartScreen={() => setStartScreenOpen(true)}
        onOpenPresentation={() => setPresentationOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* 30-Second Stage Orchestrator Bar */}
        <PhaseOrchestratorBar
          currentPhase={phase}
          phaseTimeRemaining={phaseTimeRemaining}
          totalPhaseDuration={phaseDuration}
          isAiProcessing={isAiProcessing}
          onSelectPhase={handleSelectPhase}
        />

        {/* Attack / Defense Stage Lifecycle Tracker */}
        <KillChainStageTracker
          currentPhase={phase}
          operatorRole={settings.operatorRole}
          activeScenario={activeScenario}
          isRedExploitFired={Boolean(redResult)}
          isBluePatchApplied={Boolean(blueResult?.patchedCode)}
          onSelectStageOverride={(stageId) => {
            if (stageId === 1) handleSelectPhase('INIT');
            else if (stageId <= 5) handleSelectPhase('RED_ATTACK');
            else if (stageId <= 8) handleSelectPhase('BLUE_DEFENSE');
            else handleSelectPhase('ARBITER_EVAL');
          }}
        />

        {/* Streamlined Visual Tab Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              id="view-arena-tab-btn"
              onClick={() => setActiveTab('arena')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'arena'
                  ? 'bg-[#141b2b] text-cyan-300 border border-cyan-500/80 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c101c]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>WAR ROOM ARENA</span>
            </button>

            <button
              id="view-interactive-tab-btn"
              onClick={() => setActiveTab('interactive')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'interactive'
                  ? 'bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-sky-950/80 text-white border border-cyan-400 shadow-md shadow-cyan-950/60'
                  : 'text-slate-300 hover:text-white hover:bg-[#121829] border border-cyan-900/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-extrabold text-cyan-300">OPERATOR RANGE</span>
              <AiFeatureBadge label="AI DRILL" />
            </button>

            <button
              id="view-attack-path-tab-btn"
              onClick={() => setActiveTab('attack_path')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'attack_path'
                  ? 'bg-[#141b2b] text-rose-300 border border-rose-500/80 shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c101c]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>ATTACK PATH MAP</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                MITRE
              </span>
            </button>

            <button
              id="view-replay-tab-btn"
              onClick={() => setActiveTab('replay')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'replay'
                  ? 'bg-[#141b2b] text-amber-300 border border-amber-500/80 shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c101c]'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>AGENT REPLAY STUDIO</span>
              {history.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-mono">
                  {history.length}
                </span>
              )}
            </button>

            <button
              id="view-graphs-tab-btn"
              onClick={() => setActiveTab('graphs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'graphs'
                  ? 'bg-[#141b2b] text-cyan-300 border border-cyan-500/80 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c101c]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>TACTICAL CHARTS & GRAPHS</span>
            </button>

            <button
              id="view-matrix-tab-btn"
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-[#141b2b] text-cyan-300 border border-cyan-500/80 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c101c]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>MITRE ATT&CK & OWASP MATRIX</span>
            </button>

            <button
              id="view-topology-tab-btn"
              onClick={() => setActiveTab('topology')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'topology'
                  ? 'bg-[#141b2b] text-cyan-300 border border-cyan-500/80 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c101c]'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-blue-400" />
              <span>MESH TOPOLOGY</span>
            </button>

            <button
              id="view-telemetry-tab-btn"
              onClick={() => setActiveTab('telemetry')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'telemetry'
                  ? 'bg-[#141b2b] text-cyan-300 border border-cyan-500/80 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c101c]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>AUDIT TELEMETRY</span>
              <span className="text-[10px] px-1.5 rounded-full bg-[#1e2a3f] text-cyan-300 font-semibold">
                {history.length}
              </span>
            </button>

            <button
              id="view-report-modal-btn"
              onClick={handleOpenMatchReport}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900/80 hover:text-white shadow-sm"
              title="Generate and Download Offline PDF/JSON Match Summary Security Report"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>MATCH REPORT (PDF/JSON)</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 hidden xl:flex items-center gap-2 shrink-0">
            <span>Target:</span>
            <span className="text-cyan-400 font-semibold">{activeScenario.name}</span>
          </div>
        </div>

        {/* Tab 1: War Room Arena */}
        {activeTab === 'arena' && (
          <div className="space-y-4">
            {/* Primary Grid: Red Agent vs Blue Agent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RedAgentPanel
                scenario={activeScenario}
                redResult={redResult}
                strategy={settings.redStrategy}
                temperature={settings.redTemperature}
                isAttacking={phase === 'RED_ATTACK' || isAiProcessing}
              />

              <BlueAgentPanel
                scenario={activeScenario}
                blueResult={blueResult}
                redResult={redResult}
                strategy={settings.blueStrategy}
                temperature={settings.blueTemperature}
                isDefending={phase === 'BLUE_DEFENSE' || isAiProcessing}
              />
            </div>

            {/* Middle Grid: Code Workbench & Live Sandbox */}
            <div className="grid grid-cols-1 gap-4">
              <CodeWorkbench
                scenario={activeScenario}
                blueResult={blueResult}
                isPatched={Boolean(blueResult?.patchedCode)}
              />
            </div>

            {/* Bottom Row: Arbiter Decision Chamber */}
            <div className="grid grid-cols-1 gap-4">
              <ArbiterChamber
                scenario={activeScenario}
                arbiterResult={arbiterResult}
                isEvaluating={phase === 'ARBITER_EVAL' || isAiProcessing}
                onNextRound={advanceToNextPhase}
                onOpenMatchReport={handleOpenMatchReport}
              />
            </div>

            {/* Commander Tuning Controls Deck */}
            <CommanderControls
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              activeScenario={activeScenario}
              onSelectScenario={(scenarioId) => {
                const found = SCENARIOS.find((s) => s.id === scenarioId);
                if (found) {
                  handleSelectScenarioDirectly(found);
                }
              }}
              onTriggerManualDrill={handleLaunchInstantDrill}
              onResetSimulation={handleResetSimulation}
              isAiProcessing={isAiProcessing}
              onOpenStrategyModal={() => setStrategyModalOpen(true)}
              onOpenTutorial={() => setTutorialModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Interactive Cyber Range (Operator Controlled) */}
        {activeTab === 'interactive' && (
          <InteractiveCyberRange
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenarioDirectly}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onAdvanceToArena={() => setActiveTab('arena')}
          />
        )}

        {/* Tab 3: Visual Attack Path Map */}
        {activeTab === 'attack_path' && (
          <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#07090E]">
            <AttackPathMap
              activeScenario={activeScenario}
              operatorRole={settings.operatorRole}
              onSelectScenario={handleSelectScenarioDirectly}
            />
          </div>
        )}

        {/* Tab 4: Agent Replay Studio */}
        {activeTab === 'replay' && (
          <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#07090E] min-h-[600px]">
            <AgentReplayStudio
              history={history}
              activeScenario={activeScenario}
              currentSimState={liveSimState}
              onOpenScenarioModal={() => setScenarioModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 4: Tactical Charts & Graphs */}
        {activeTab === 'graphs' && (
          <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#07090E]">
            <GraphicalAnalyticsDashboard simState={liveSimState} />
          </div>
        )}

        {/* Tab 5: MITRE ATT&CK & OWASP Matrix */}
        {activeTab === 'matrix' && (
          <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#07090E] min-h-[600px]">
            <MitreOwaspMatrix
              onSelectScenario={handleSelectScenarioDirectly}
              activeScenarioId={activeScenario.id}
            />
          </div>
        )}

        {/* Tab 6: Mesh Topology */}
        {activeTab === 'topology' && (
          <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#07090E] min-h-[550px]">
            <InteractiveTopologyGraph
              simState={liveSimState}
              onSelectScenario={handleSelectScenarioDirectly}
            />
          </div>
        )}

        {/* Tab 7: Audit Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <ThreatTelemetry
              history={history}
              scores={scores}
              resilienceMetric={resilienceMetric}
            />
          </div>
        )}
      </main>

      {/* Scenario Selection Modal */}
      <ScenarioModal
        isOpen={scenarioModalOpen}
        onClose={() => setScenarioModalOpen(false)}
        currentScenarioId={activeScenario.id}
        onSelectScenario={(s) => {
          handleSelectScenarioDirectly(s);
        }}
      />

      {/* Interactive AI Guided Tutorial Modal */}
      <TutorialGuideModal
        isOpen={tutorialModalOpen}
        onClose={() => setTutorialModalOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        currentActiveTab={activeTab}
      />

      {/* Strategy Selection Deck Overlay */}
      <StrategySelectionModal
        isOpen={strategyModalOpen}
        onClose={() => setStrategyModalOpen(false)}
        scenario={activeScenario}
        currentSettings={settings}
        onApplyStrategy={(config) => {
          handleUpdateSettings({
            redStrategy: config.redTacticCategory as any,
            redAggression: config.redAggression,
            redTemperature: config.redTemperature,
            blueStrategy: config.blueGuardrailCategory as any,
            blueStrictness: config.blueStrictness,
            blueTemperature: config.blueTemperature
          });
          handleLaunchInstantDrill();
        }}
        onTriggerInstantDrill={handleLaunchInstantDrill}
      />

      {/* Match Summary Security & Audit Report Modal (PDF / JSON) */}
      <MatchReportModal
        isOpen={matchReportModalOpen}
        onClose={() => setMatchReportModalOpen(false)}
        reportData={reportData}
      />

      {/* Start Screen Team Selection Modal */}
      <StartScreenModal
        isOpen={startScreenOpen}
        onClose={() => setStartScreenOpen(false)}
        onSelectTeam={handleSelectTeamFromStartScreen}
        currentScenario={activeScenario}
        currentSettings={settings}
        onOpenTutorial={() => setTutorialModalOpen(true)}
        onOpenPresentation={() => setPresentationOpen(true)}
      />

      {/* Interactive App Guide HTML Presentation Walkthrough */}
      <InteractiveGuidePresentation
        isOpen={presentationOpen}
        onClose={() => setPresentationOpen(false)}
      />
    </div>
  );
}
