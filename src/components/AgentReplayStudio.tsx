import React, { useState, useEffect } from 'react';
import { SimulationRound, LogEntry, Phase, Scenario } from '../types';
import { AiTag, AiFeatureBadge } from './AiTag';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Server, 
  Database, 
  Globe, 
  Cpu, 
  Layers, 
  X,
  FastForward,
  Rewind,
  Zap,
  Sliders,
  Film
} from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';

export interface AgentReplayStudioProps {
  history?: SimulationRound[];
  activeScenario?: Scenario;
  currentSimState?: any;
  onOpenScenarioModal?: () => void;
  // Modal props
  isOpen?: boolean;
  onClose?: () => void;
  round?: SimulationRound | null;
  scenario?: Scenario;
}

export const AgentReplayStudio: React.FC<AgentReplayStudioProps> = ({
  history = [],
  activeScenario = SCENARIOS[0],
  currentSimState,
  onOpenScenarioModal,
  isOpen,
  onClose,
  round: providedRound,
  scenario: providedScenario,
}) => {
  // Determine if operating in Modal mode
  const isModalMode = typeof isOpen === 'boolean';

  if (isModalMode && !isOpen) return null;

  // Determine scenario
  const effectiveScenario = providedScenario || activeScenario || SCENARIOS[0];

  // Selected round state (default to latest in history or provided round)
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(
    history.length > 0 ? history.length - 1 : 0
  );

  // Fallback synthetic round if no history or provided round exists
  const fallbackRound: SimulationRound = {
    roundNumber: 1,
    scenario: effectiveScenario,
    durationMs: 30000,
    timestamp: Date.now(),
    redResult: {
      success: true,
      statusCode: 200,
      payload: {
        method: effectiveScenario.defaultExploit.method,
        path: effectiveScenario.defaultExploit.path,
        headers: effectiveScenario.defaultExploit.headers,
        params: effectiveScenario.defaultExploit.params,
        body: effectiveScenario.defaultExploit.body,
      },
      responseBody: JSON.stringify({ status: 'EXPLOITED', flaw: effectiveScenario.cweId }),
      flawIdentified: effectiveScenario.vulnerabilityType,
      attackVector: effectiveScenario.category,
      rationale: effectiveScenario.defaultExploit.rationale,
      cveTag: effectiveScenario.cweId,
      executedAt: Date.now() - 25000,
      executionLogs: [
        { timestamp: new Date().toISOString(), level: 'info', source: 'RED', message: `Initializing attack module against ${effectiveScenario.targetService}` },
        { timestamp: new Date().toISOString(), level: 'warn', source: 'RED', message: `Crafted HTTP exploit payload targeting CWE-${effectiveScenario.cweId}` },
        { timestamp: new Date().toISOString(), level: 'error', source: 'RED', message: `Target breached! Response HTTP 200 OK with unauthorized payload reflection` }
      ]
    },
    blueResult: {
      identifiedSignature: effectiveScenario.vulnerabilityType,
      attackAnalysis: `Detected payload injection on ${effectiveScenario.targetFile}`,
      patchStrategy: 'AST & Regex Zero-Trust Sanitizer',
      unifiedDiff: `+ if (isMaliciousInput(req.body)) return res.status(403);`,
      patchedCode: `// SECURITY HOT-PATCH\nif (isMaliciousInput(req.body)) return res.status(403).json({ error: 'Access Denied' });`,
      rationale: 'Applied AST input sanitization rules.',
      diffStats: { additions: 3, deletions: 0, filesChanged: 1 },
      generatedAt: Date.now() - 15000,
      executionLogs: [
        { timestamp: new Date().toISOString(), level: 'info', source: 'BLUE', message: `Ingesting WAF anomaly logs from ${effectiveScenario.targetService}` },
        { timestamp: new Date().toISOString(), level: 'info', source: 'BLUE', message: `Generating zero-downtime hot-patch for ${effectiveScenario.targetFile}` },
        { timestamp: new Date().toISOString(), level: 'patch', source: 'BLUE', message: `Hot-patch compiled and verified against AST rules` }
      ]
    },
    arbiterResult: {
      verdict: 'BLUE_WIN',
      verdictTitle: 'NEUTRALIZED & 100% SLA PRESERVED',
      scoreDelta: { red: 0, blue: 100 },
      exploitNeutralized: true,
      uptimeCheckPassed: true,
      normalTrafficResults: [],
      exploitReTest: {
        statusCode: 403,
        blocked: true,
        details: 'Exploit blocked by hot-patch',
        outputSample: 'HTTP 403 Forbidden'
      },
      arbiterAnalysis: `Blue Team hot-patch successfully contained ${effectiveScenario.cweId} exploit while preserving all legitimate REST API client traffic.`,
      resilienceScore: 94,
      evaluatedAt: Date.now() - 5000,
      executionLogs: [
        { timestamp: new Date().toISOString(), level: 'info', source: 'ARBITER', message: `Firing re-test exploit against patched microservice container` },
        { timestamp: new Date().toISOString(), level: 'success', source: 'ARBITER', message: `Exploit blocked (HTTP 403 Forbidden)!` },
        { timestamp: new Date().toISOString(), level: 'success', source: 'ARBITER', message: `Verified 3/3 normal traffic SLA contracts. Final Verdict: BLUE_WIN` }
      ]
    }
  };

  const effectiveRound = providedRound || (history.length > 0 ? history[selectedRoundIndex] || history[history.length - 1] : fallbackRound);

  // Replay timeline position (0 to 30 seconds)
  const [currentSecond, setCurrentSecond] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeLogFilter, setActiveLogFilter] = useState<'ALL' | 'RED' | 'BLUE' | 'ARBITER'>('ALL');

  const TOTAL_SECONDS = 30;

  const getPhaseAtSecond = (sec: number): Phase => {
    if (sec < 5) return 'INIT';
    if (sec < 15) return 'RED_ATTACK';
    if (sec < 25) return 'BLUE_DEFENSE';
    return 'ARBITER_EVAL';
  };

  const currentPhase = getPhaseAtSecond(currentSecond);

  // Combine logs with synthetic second timestamps
  const allLogs: { second: number; log: LogEntry }[] = [
    {
      second: 1,
      log: {
        timestamp: new Date((effectiveRound?.timestamp || Date.now()) - 29000).toISOString(),
        level: 'info',
        source: 'SYSTEM',
        message: `[ORCHESTRATOR] Initializing target pod sandbox: ${effectiveScenario.targetService} (${effectiveScenario.cweId})`
      }
    },
    {
      second: 3,
      log: {
        timestamp: new Date((effectiveRound?.timestamp || Date.now()) - 27000).toISOString(),
        level: 'info',
        source: 'SYSTEM',
        message: `[VPC_READY] Ingress gateway listening on :443. Target microservice listening on :${effectiveScenario.topology?.port || 8080}`
      }
    },
    ...(effectiveRound?.redResult?.executionLogs || []).map((l, i) => ({
      second: 5 + Math.min(9, i * 2),
      log: l
    })),
    ...(effectiveRound?.blueResult?.executionLogs || []).map((l, i) => ({
      second: 15 + Math.min(9, i * 2),
      log: l
    })),
    {
      second: 26,
      log: {
        timestamp: new Date((effectiveRound?.timestamp || Date.now()) - 4000).toISOString(),
        level: 'info',
        source: 'ARBITER',
        message: `[ARBITER_VERIFY] Firing re-test exploit & running ${effectiveScenario.normalTrafficSamples?.length || 3} SLA traffic contracts`
      }
    },
    {
      second: 28,
      log: {
        timestamp: new Date((effectiveRound?.timestamp || Date.now()) - 2000).toISOString(),
        level: effectiveRound?.arbiterResult?.verdict === 'BLUE_WIN' ? 'success' : 'warn',
        source: 'ARBITER',
        message: `[FINAL_VERDICT] ${effectiveRound?.arbiterResult?.verdictTitle || 'Ruling Rendered'} • Resilience: ${effectiveRound?.arbiterResult?.resilienceScore || 90}%`
      }
    }
  ];

  const visibleLogs = allLogs.filter(l => l.second <= currentSecond).map(l => l.log);
  const filteredLogs = visibleLogs.filter(l => {
    if (activeLogFilter === 'ALL') return true;
    if (activeLogFilter === 'RED') return l.source === 'RED';
    if (activeLogFilter === 'BLUE') return l.source === 'BLUE';
    if (activeLogFilter === 'ARBITER') return l.source === 'ARBITER';
    return true;
  });

  // Timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSecond((prev) => {
        if (prev >= TOTAL_SECONDS) {
          setIsPlaying(false);
          return TOTAL_SECONDS;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleSeek = (sec: number) => {
    setCurrentSecond(Math.max(0, Math.min(TOTAL_SECONDS, sec)));
  };

  const handleReset = () => {
    setCurrentSecond(0);
    setIsPlaying(true);
  };

  const getNodeReplayStatus = (nodeId: string): 'healthy' | 'compromised' | 'shielded' | 'verified' => {
    if (currentSecond < 5) return 'healthy';
    if (currentSecond < 15) {
      if (nodeId === 'target-service') {
        return 'compromised';
      }
      return 'healthy';
    }
    if (currentSecond < 25) {
      return 'shielded';
    }
    return effectiveRound?.arbiterResult?.verdict === 'BLUE_WIN' ? 'verified' : 'compromised';
  };

  const nodes = [
    { id: 'ingress-gateway', name: 'ingress-envoy-proxy', port: 443, type: 'gateway' },
    { id: 'target-service', name: effectiveScenario.targetService, port: effectiveScenario.topology?.port || 8080, type: 'service' },
    { id: 'database-sink', name: 'postgres-master-replica', port: 5432, type: 'database' }
  ];

  const contentUI = (
    <div className="w-full bg-[#080B13] border border-[#1b263b] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 min-h-[620px]">
      {/* Top Replay Studio Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-[#0d1526] to-slate-950 border-b border-[#1b263b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md">
            <Film className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                MATCH AGENT REPLAY STUDIO
              </span>
              <AiFeatureBadge label="AI REPLAY" />
              <span className="text-xs font-mono text-slate-300">
                Round #{effectiveRound?.roundNumber || 1} • {effectiveScenario.name}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Interactive Match Progression & Heatmap Telemetry
            </h2>
          </div>
        </div>

        {/* Round History Selector */}
        <div className="flex items-center gap-2">
          {history.length > 1 && (
            <div className="flex items-center gap-1 text-xs font-mono bg-[#0d1322] border border-slate-700 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400">Round:</span>
              <select
                value={selectedRoundIndex}
                onChange={(e) => setSelectedRoundIndex(Number(e.target.value))}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                {history.map((r, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-slate-200">
                    Round #{r.roundNumber} ({r.arbiterResult?.verdict || 'DONE'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isModalMode && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrubbing & Transport Controls Deck */}
      <div className="px-6 py-4 bg-[#060810] border-b border-[#182338] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Replay Timeline:</span>
            <span className="text-amber-300 font-bold">00:{currentSecond.toString().padStart(2, '0')} / 00:{TOTAL_SECONDS}</span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
              Phase: {currentPhase}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {['0.5x', '1x', '2x', '4x'].map((s) => {
              const spd = parseFloat(s);
              return (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrub Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={TOTAL_SECONDS}
            value={currentSecond}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-1">
            <span>0s (Init)</span>
            <span>5s (Red Attack)</span>
            <span>15s (Blue Patch)</span>
            <span>25s (Arbiter)</span>
            <span>30s (Verdict)</span>
          </div>
        </div>

        {/* Transport Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => handleSeek(currentSecond - 5)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800"
            title="Rewind 5s"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer font-mono text-xs"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'PAUSE REPLAY' : 'PLAY REPLAY'}</span>
          </button>

          <button
            onClick={() => handleSeek(currentSecond + 5)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800"
            title="Forward 5s"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body: Microservice Heatmap + Synchronized Logs */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-[#05070d]">
        {/* Left: Interactive Microservice Topology & Heatmap State */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-[#182338] flex flex-col space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 uppercase">
              <Activity className="w-4 h-4 text-cyan-400" />
              Synchronized Topology & Threat Heatmap
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
              T = {currentSecond}s
            </span>
          </div>

          {/* Microservice Pod Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {nodes.map((node) => {
              const status = getNodeReplayStatus(node.id);
              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    status === 'compromised'
                      ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/40 animate-pulse'
                      : status === 'shielded'
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/30'
                      : status === 'verified'
                      ? 'bg-emerald-950/40 border-emerald-500/80'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono truncate max-w-[130px]">
                      {node.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">:{node.port}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Status:</span>
                    <span className={
                      status === 'compromised'
                        ? 'text-rose-400 font-bold'
                        : status === 'shielded'
                        ? 'text-cyan-300 font-bold'
                        : status === 'verified'
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-400'
                    }>
                      {status === 'compromised' ? 'EXPLOITED' : status === 'shielded' ? 'HOT-PATCHED' : status === 'verified' ? 'SECURE' : 'IDLE'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Phase Action Highlight Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 mt-auto">
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
              Phase Narrative at T = {currentSecond}s
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentSecond < 5 && 'Microservice mesh initialized. Target container listening on port :8080.'}
              {currentSecond >= 5 && currentSecond < 15 && `Red Agent executed exploit payload against ${effectiveScenario.targetService}. Flaw exploited: ${effectiveScenario.vulnerabilityType}.`}
              {currentSecond >= 15 && currentSecond < 25 && `Blue Agent detected anomalous breach logs and compiled zero-downtime hot-patch for ${effectiveScenario.targetFile}.`}
              {currentSecond >= 25 && `Arbiter evaluated exploit neutralization and 100% SLA uptime. Final ruling: ${effectiveRound?.arbiterResult?.verdictTitle || 'Verified'}.`}
            </p>
          </div>
        </div>

        {/* Right: Synchronized Terminal Logs */}
        <div className="p-5 flex flex-col space-y-3 overflow-hidden bg-[#04060b]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Synchronized Execution Log Stream ({filteredLogs.length})</span>
            </div>

            <div className="flex gap-1 text-[10px] font-mono">
              {(['ALL', 'RED', 'BLUE', 'ARBITER'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveLogFilter(f)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeLogFilter === f
                      ? 'bg-slate-800 text-amber-300 font-bold border border-amber-800'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable logs box */}
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 p-2.5 rounded-xl bg-black/60 border border-slate-900 max-h-[380px]">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-8 text-xs">
                Replay timer running. Logs stream dynamically as events trigger along the 30s timeline...
              </div>
            ) : (
              filteredLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-[11px] ${
                    log.source === 'RED'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      : log.source === 'BLUE'
                      ? 'bg-cyan-950/30 border-cyan-900/50 text-cyan-300'
                      : log.source === 'ARBITER'
                      ? 'bg-purple-950/30 border-purple-900/50 text-purple-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] opacity-75 mb-0.5 font-bold">
                    <span>[{log.source}] {log.level.toUpperCase()}</span>
                    <span>{log.timestamp.split('T')[1]?.slice(0, 8)}</span>
                  </div>
                  <div className="font-semibold break-all">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-[#080B13] border-t border-[#182338] flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Verdict: <span className="text-amber-300 font-bold">{effectiveRound?.arbiterResult?.verdict || 'EVALUATED'}</span></span>
        {isModalMode && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Replay
          </button>
        )}
      </div>
    </div>
  );

  if (isModalMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-5xl max-h-[94vh] overflow-hidden">
          {contentUI}
        </div>
      </div>
    );
  }

  return contentUI;
};
