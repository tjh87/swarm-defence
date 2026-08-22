import React, { useState, useEffect } from 'react';
import { Scenario, Phase, LiveSimulationState, AttackPathHop } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { ATTACK_PATHS } from '../data/attackPaths';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Server, 
  Database, 
  Cpu, 
  Globe, 
  Activity, 
  Flame, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  Zap,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Route,
  Network,
  Crosshair,
  Lock,
  Terminal,
  AlertTriangle,
  ArrowRight,
  Thermometer
} from 'lucide-react';

interface InteractiveTopologyGraphProps {
  simState: LiveSimulationState;
  onSelectScenario: (scenario: Scenario) => void;
}

interface TopologyNode {
  id: string;
  name: string;
  type: 'gateway' | 'auth' | 'billing' | 'catalog' | 'worker' | 'ai' | 'diagnostics' | 'database';
  port: number;
  cluster: string;
  x: number;
  y: number;
  scenarioId?: string;
  cvss: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'healthy' | 'under_attack' | 'patch_active' | 'evaluating';
}

export const InteractiveTopologyGraph: React.FC<InteractiveTopologyGraphProps> = ({
  simState,
  onSelectScenario
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('auth-gateway');
  
  // View mode: 'attack_path' | 'heatmap' | 'mesh'
  const [viewMode, setViewMode] = useState<'attack_path' | 'heatmap' | 'mesh'>('heatmap');
  
  // Attack Path Stepper State
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(0);
  const [isPathAutoPlaying, setIsPathAutoPlaying] = useState<boolean>(true);

  // Active scenario attack path
  const currentAttackPath = ATTACK_PATHS[simState.activeScenario.id] || ATTACK_PATHS['auth-jwt-none-alg'];

  // State for triggering subtle scaling animation on threat detection
  const [pulsingNodeId, setPulsingNodeId] = useState<string | null>(null);

  // Auto-play attack path hops
  useEffect(() => {
    if (!isPathAutoPlaying || viewMode !== 'attack_path') return;
    const interval = setInterval(() => {
      setCurrentHopIndex((prev) => (prev + 1) % currentAttackPath.hops.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPathAutoPlaying, viewMode, currentAttackPath.hops.length]);

  // Trigger subtle scaling animation whenever a new threat event or phase occurs
  useEffect(() => {
    const targetNode = nodes.find(n => simState.activeScenario.targetService.includes(n.name.replace('-svc', '')));
    if (targetNode) {
      setPulsingNodeId(targetNode.id);
      const timer = setTimeout(() => {
        setPulsingNodeId(null);
      }, 4000); // 4 second scaling pulse on threat detection
      return () => clearTimeout(timer);
    }
  }, [simState.activeScenario.id, simState.phase, simState.scores.red]);

  // Topology node layout in coordinate space (600x400)
  const nodes: TopologyNode[] = [
    {
      id: 'ingress-gateway',
      name: 'ingress-envoy-proxy',
      type: 'gateway',
      port: 443,
      cluster: 'edge-ingress-global',
      x: 90,
      y: 200,
      cvss: 7.5,
      threatLevel: 'HIGH',
      status: 'healthy',
    },
    {
      id: 'auth-gateway',
      name: 'auth-gateway-svc',
      type: 'auth',
      port: 8080,
      cluster: 'edge-ingress-apac',
      x: 240,
      y: 100,
      scenarioId: 'auth-jwt-none-alg',
      cvss: 9.8,
      threatLevel: 'CRITICAL',
      status: simState.activeScenario.id === 'auth-jwt-none-alg' 
        ? (simState.phase === 'RED_ATTACK' ? 'under_attack' : simState.phase === 'BLUE_DEFENSE' ? 'patch_active' : 'healthy')
        : 'healthy',
    },
    {
      id: 'billing-ledger',
      name: 'billing-ledger-svc',
      type: 'billing',
      port: 8084,
      cluster: 'finance-secure-us-east',
      x: 240,
      y: 290,
      scenarioId: 'idor-tenant-order',
      cvss: 8.8,
      threatLevel: 'HIGH',
      status: simState.activeScenario.id === 'idor-tenant-order' || simState.activeScenario.id === 'race-condition-toctou'
        ? (simState.phase === 'RED_ATTACK' ? 'under_attack' : simState.phase === 'BLUE_DEFENSE' ? 'patch_active' : 'healthy')
        : 'healthy',
    },
    {
      id: 'catalog-search',
      name: 'catalog-search-svc',
      type: 'catalog',
      port: 8082,
      cluster: 'catalog-cluster-eu',
      x: 390,
      y: 80,
      scenarioId: 'sqli-order-by-blind',
      cvss: 9.1,
      threatLevel: 'CRITICAL',
      status: simState.activeScenario.id === 'sqli-order-by-blind' || simState.activeScenario.id === 'graphql-batching-dos'
        ? (simState.phase === 'RED_ATTACK' ? 'under_attack' : simState.phase === 'BLUE_DEFENSE' ? 'patch_active' : 'healthy')
        : 'healthy',
    },
    {
      id: 'support-copilot',
      name: 'support-agent-svc',
      type: 'ai',
      port: 8090,
      cluster: 'ai-copilot-cluster',
      x: 390,
      y: 200,
      scenarioId: 'ai-prompt-injection-rag',
      cvss: 8.2,
      threatLevel: 'HIGH',
      status: simState.activeScenario.id === 'ai-prompt-injection-rag' || simState.activeScenario.id === 'ssrf-cloud-metadata'
        ? (simState.phase === 'RED_ATTACK' ? 'under_attack' : simState.phase === 'BLUE_DEFENSE' ? 'patch_active' : 'healthy')
        : 'healthy',
    },
    {
      id: 'pipeline-runner',
      name: 'pipeline-runner-svc',
      type: 'worker',
      port: 9090,
      cluster: 'ci-runner-us-west',
      x: 390,
      y: 320,
      scenarioId: 'rce-yaml-deserialization',
      cvss: 9.8,
      threatLevel: 'CRITICAL',
      status: simState.activeScenario.id === 'rce-yaml-deserialization'
        ? (simState.phase === 'RED_ATTACK' ? 'under_attack' : simState.phase === 'BLUE_DEFENSE' ? 'patch_active' : 'healthy')
        : 'healthy',
    },
    {
      id: 'postgres-cluster',
      name: 'postgres-master-replica',
      type: 'database',
      port: 5432,
      cluster: 'aurora-vpc-secure',
      x: 530,
      y: 200,
      cvss: 8.5,
      threatLevel: 'HIGH',
      status: 'healthy',
    },
  ];

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[1];
  const linkedScenario = activeNode.scenarioId ? SCENARIOS.find(s => s.id === activeNode.scenarioId) : null;

  // Active Hop
  const activeHop = currentAttackPath.hops[currentHopIndex] || currentAttackPath.hops[0];

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden bg-[#07090E] text-slate-100 font-mono">
      {/* Top Bar with Mode Switcher */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-[#0B0F17]/90 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              TOPOLOGY VISUALIZER
            </span>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Microservice Architecture & Threat Heatmap Visualizer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Real-time thermal threat surface overlay mapping red team attack vectors and microservice vulnerability exposure.
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-[#070A10] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'heatmap'
                  ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/80'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>THREAT HEATMAP</span>
            </button>

            <button
              onClick={() => setViewMode('attack_path')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'attack_path'
                  ? 'bg-gradient-to-r from-rose-950 to-purple-950 text-white border border-rose-500/60 shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-rose-400" />
              <span>ATTACK PATH</span>
            </button>

            <button
              onClick={() => setViewMode('mesh')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'mesh'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>STANDARD MESH</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Threat Surface:</span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              98.2% HIGH EXPOSURE
            </span>
          </div>
        </div>
      </div>

      {/* Control Sub-Bar */}
      {viewMode === 'heatmap' && (
        <div className="px-6 py-2.5 bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-purple-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Active Threat Heat Overlay:</span>
            </span>
            <span className="text-white font-bold">{simState.activeScenario.name}</span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
              CWE-{simState.activeScenario.cweId}
            </span>
            <span className="text-slate-300">
              Target Pod: <span className="text-amber-300 font-bold">{simState.activeScenario.targetService}</span>
            </span>
          </div>

          {/* Heat Legend */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400 font-bold">Heat Index:</span>
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" /> Critical (9.0+)
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" /> High (7.0+)
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" /> Normal Mesh
            </span>
          </div>
        </div>
      )}

      {viewMode === 'attack_path' && (
        <div className="px-6 py-2.5 bg-gradient-to-r from-rose-950/30 via-slate-900 to-purple-950/30 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              <span>Active Vector:</span>
            </span>
            <span className="text-white font-bold">{simState.activeScenario.name}</span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
              {simState.activeScenario.cweId}
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Blast Radius: <span className="text-rose-400 font-bold">{currentAttackPath.blastRadius}</span>
            </span>
          </div>

          {/* Hop Stepper Controls */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              Hop <span className="text-cyan-400 font-bold">{currentHopIndex + 1}</span> of <span className="text-white">{currentAttackPath.hops.length}</span>:
            </span>

            <button
              onClick={() => setCurrentHopIndex(prev => (prev - 1 + currentAttackPath.hops.length) % currentAttackPath.hops.length)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Previous Hop"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPathAutoPlaying(!isPathAutoPlaying)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                isPathAutoPlaying
                  ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isPathAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPathAutoPlaying ? 'Auto Traversal' : 'Paused'}</span>
            </button>

            <button
              onClick={() => setCurrentHopIndex(prev => (prev + 1) % currentAttackPath.hops.length)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Next Hop"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: SVG Canvas + Inspector Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visual Network Canvas */}
        <div className="flex-1 relative flex items-center justify-center p-6 bg-[#07090E] overflow-auto">
          <div className="w-full max-w-4xl h-[450px] bg-[#0A0D15]/90 rounded-2xl border border-slate-800/80 p-4 relative shadow-2xl overflow-hidden flex flex-col">
            {/* Background Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* SVG Connecting Edges & Traffic Animation */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 600 400">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="attackPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
                </linearGradient>

                {/* Thermal Radial Heat Gradients for Threat Overlay */}
                <radialGradient id="heatCriticalGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatHighGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#eab308" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatMediumGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Standard Base Mesh Lines */}
              <line x1="90" y1="200" x2="240" y2="100" stroke="url(#edgeGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="90" y1="200" x2="240" y2="290" stroke="url(#edgeGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="240" y1="100" x2="390" y2="80" stroke="url(#edgeGrad)" strokeWidth="1.5" />
              <line x1="240" y1="100" x2="390" y2="200" stroke="url(#edgeGrad)" strokeWidth="1.5" />
              <line x1="240" y1="290" x2="390" y2="320" stroke="url(#edgeGrad)" strokeWidth="1.5" />
              <line x1="240" y1="290" x2="530" y2="200" stroke="url(#edgeGrad)" strokeWidth="1.5" />
              <line x1="390" y1="80" x2="530" y2="200" stroke="url(#edgeGrad)" strokeWidth="1.5" />
              <line x1="390" y1="200" x2="530" y2="200" stroke="url(#edgeGrad)" strokeWidth="1.5" />
              <line x1="390" y1="320" x2="530" y2="200" stroke="url(#edgeGrad)" strokeWidth="1.5" />

              {/* Threat Heatmap Radial Thermal Auras */}
              {viewMode === 'heatmap' && (
                <>
                  {nodes.map((node) => {
                    const isTargetPod = simState.activeScenario.targetService.includes(node.name.replace('-svc', ''));
                    const heatRadius = isTargetPod ? 70 : node.cvss > 9.0 ? 60 : node.cvss > 7.5 ? 50 : 35;
                    const gradId = isTargetPod || node.cvss > 9.0 ? "heatCriticalGrad" : node.cvss > 7.5 ? "heatHighGrad" : "heatMediumGrad";

                    return (
                      <g key={`heat-node-${node.id}`}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={heatRadius}
                          fill={`url(#${gradId})`}
                        >
                          <animate
                            attributeName="r"
                            values={`${heatRadius - 5};${heatRadius + 12};${heatRadius - 5}`}
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    );
                  })}
                </>
              )}

              {/* Attack Path Highlighting in 'attack_path' mode */}
              {viewMode === 'attack_path' && (
                <>
                  {currentAttackPath.hops.map((hop, idx) => {
                    if (idx >= currentAttackPath.hops.length - 1) return null;
                    const fromNode = nodes.find(n => n.id === hop.nodeId) || nodes[0];
                    const toHop = currentAttackPath.hops[idx + 1];
                    const toNode = nodes.find(n => n.id === toHop.nodeId) || nodes[nodes.length - 1];

                    const isCurrentActive = idx === currentHopIndex || idx === currentHopIndex - 1;

                    return (
                      <g key={`hop-line-${idx}`}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="url(#attackPathGrad)"
                          strokeWidth={isCurrentActive ? 4 : 2.5}
                          filter="url(#glow)"
                          strokeDasharray={isCurrentActive ? "6 3" : "none"}
                        />

                        <circle cx={fromNode.x} cy={fromNode.y} r={isCurrentActive ? 5 : 3.5} fill="#f43f5e">
                          <animate
                            attributeName="cx"
                            from={fromNode.x}
                            to={toNode.x}
                            dur={`${1.2 / (idx + 1)}s`}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="cy"
                            from={fromNode.y}
                            to={toNode.y}
                            dur={`${1.2 / (idx + 1)}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {/* Interactive Node Badges on Canvas */}
            <div className="w-full h-full relative">
              {nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isTargetOfSim = simState.activeScenario.targetService.includes(node.name.replace('-svc', ''));
                const hopForThisNode = viewMode === 'attack_path' ? currentAttackPath.hops.find(h => h.nodeId === node.id) : null;
                const isHopActive = hopForThisNode && hopForThisNode.hopNumber === currentHopIndex + 1;
                const isThreatPulsing = node.id === pulsingNodeId || (isTargetOfSim && simState.phase === 'RED_ATTACK');

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (hopForThisNode) {
                        setCurrentHopIndex(hopForThisNode.hopNumber - 1);
                      }
                    }}
                    style={{
                      left: `${(node.x / 600) * 100}%`,
                      top: `${(node.y / 400) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none flex flex-col items-center gap-1 ${
                      isThreatPulsing
                        ? 'bg-rose-950/95 border-rose-400 ring-4 ring-rose-500/90 shadow-2xl shadow-rose-950/90 z-30 scale-125 animate-pulse'
                        : viewMode === 'heatmap' && isTargetOfSim
                        ? 'bg-red-950/95 border-red-400 ring-4 ring-red-500/80 shadow-2xl shadow-red-950/90 z-30 scale-110'
                        : isHopActive
                        ? 'bg-rose-950/90 border-rose-400 ring-4 ring-rose-500/40 shadow-2xl shadow-rose-950/60 z-30 scale-110'
                        : isSelected
                        ? 'bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-500/30 shadow-xl shadow-cyan-950/40 z-20 scale-105'
                        : hopForThisNode
                        ? 'bg-slate-900/90 border-rose-500/60 shadow-lg shadow-rose-950/30 z-10'
                        : isTargetOfSim
                        ? 'bg-slate-900/90 border-amber-500/80 shadow-lg shadow-amber-950/30 z-10'
                        : 'bg-[#0E131F]/90 border-slate-800 hover:border-slate-700 hover:bg-[#121827] z-10'
                    }`}
                  >
                    {/* CVSS Badge in Heatmap View */}
                    {viewMode === 'heatmap' && (
                      <div className={`absolute -top-2.5 -right-2.5 px-1.5 py-0.2 rounded-full font-mono font-bold text-[9px] border shadow-md ${
                        node.cvss >= 9.0
                          ? 'bg-red-600 text-white border-red-400 animate-pulse'
                          : node.cvss >= 7.5
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-cyan-900 text-cyan-300 border-cyan-700'
                      }`}>
                        {node.cvss}
                      </div>
                    )}

                    {/* Hop number badge when in attack path view */}
                    {viewMode === 'attack_path' && hopForThisNode && (
                      <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-rose-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-md">
                        {hopForThisNode.hopNumber}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {node.type === 'gateway' && <Globe className="w-4 h-4 text-blue-400" />}
                      {node.type === 'auth' && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                      {node.type === 'billing' && <Zap className="w-4 h-4 text-emerald-400" />}
                      {node.type === 'catalog' && <Server className="w-4 h-4 text-amber-400" />}
                      {node.type === 'ai' && <Cpu className="w-4 h-4 text-purple-400" />}
                      {node.type === 'worker' && <Layers className="w-4 h-4 text-rose-400" />}
                      {node.type === 'database' && <Database className="w-4 h-4 text-indigo-400" />}

                      <span className="text-xs font-bold text-white font-mono truncate max-w-[130px]">
                        {node.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span>:{node.port}</span>
                      <span>•</span>
                      <span className={
                        isTargetOfSim
                          ? 'text-red-400 font-bold animate-pulse'
                          : hopForThisNode?.status === 'exploited'
                          ? 'text-rose-400 font-bold animate-pulse'
                          : 'text-emerald-400'
                      }>
                        {isTargetOfSim ? 'CRITICAL EXPOSURE' : 'HEALTHY'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side Inspector Drawer */}
        <div className="w-96 border-l border-slate-800/80 bg-[#0B0F17] overflow-y-auto p-5 space-y-5 shrink-0 hidden lg:block font-mono">
          {viewMode === 'heatmap' ? (
            /* Threat Heatmap Matrix Drawer */
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5" />
                  MICROSERVICE THREAT MATRIX
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {activeNode.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded border font-bold ${
                    activeNode.cvss >= 9.0
                      ? 'bg-red-950 text-red-300 border-red-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}>
                    CVSS {activeNode.cvss} ({activeNode.threatLevel})
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    Port: {activeNode.port}
                  </span>
                </div>
              </div>

              {/* Threat Surface Meter Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Attack Surface Heat Index:</span>
                  <span className="font-bold text-amber-400">{Math.round((activeNode.cvss / 10) * 100)}% Heat</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full ${activeNode.cvss >= 9.0 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-amber-500'}`}
                    style={{ width: `${Math.round((activeNode.cvss / 10) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                  Evaluated vulnerability exposure across REST API endpoints, AST validation, and SQL/YAML parsing layers.
                </p>
              </div>

              {/* All Nodes Heat Level Summary */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Cluster Pod Threat Ranking:</span>
                <div className="space-y-1.5 text-xs">
                  {nodes.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => setSelectedNodeId(n.id)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        selectedNodeId === n.id
                          ? 'bg-slate-800 border-amber-500 text-white'
                          : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          n.cvss >= 9.0 ? 'bg-red-500 animate-ping' : n.cvss >= 7.5 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`} />
                        <span className="font-bold font-mono">{n.name}</span>
                      </div>
                      <span className={`font-mono font-bold ${
                        n.cvss >= 9.0 ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {n.cvss} CVSS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'attack_path' ? (
            /* Attack Path Inspector View */
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" />
                  Attack Path Hop Details ({currentHopIndex + 1}/{currentAttackPath.hops.length})
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {activeHop.nodeName}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded border border-rose-800">
                    Protocol: {activeHop.protocol} (:{activeHop.port})
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    Hop #{activeHop.hopNumber}
                  </span>
                </div>
              </div>

              {/* Hop Action Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 font-mono">Traversal Action:</span>
                <div className="text-xs font-semibold text-rose-300">
                  {activeHop.action}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {activeHop.description}
                </p>
              </div>

              {/* MITRE Technique */}
              {activeHop.mitreTechnique && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs font-mono">
                  <span className="text-purple-300 font-bold block mb-0.5">MITRE ATT&CK Technique:</span>
                  <span className="text-slate-300">{activeHop.mitreTechnique}</span>
                </div>
              )}

              {/* Payload Snippet */}
              {activeHop.payloadSnippet && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-rose-400" />
                    Injected Payload / Invocation:
                  </span>
                  <pre className="p-3 bg-[#05070C] rounded-xl border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap break-all">
                    {activeHop.payloadSnippet}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* Standard Node Telemetry Inspector */
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  MICROSERVICE NODE TELEMETRY
                </span>

                <h3 className="text-base font-bold text-white font-mono">
                  {activeNode.name}
                </h3>

                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    Port: {activeNode.port}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    Cluster: {activeNode.cluster}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300">Pod Health & Container SLA</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Ingress Request Rate:</span>
                    <span className="font-mono text-cyan-400">1,420 req/sec</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>P99 Response Latency:</span>
                    <span className="font-mono text-emerald-400">4.2 ms</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Autonomous Hot-Patch Status:</span>
                    <span className="font-mono text-cyan-300">Shield Ready</span>
                  </div>
                </div>
              </div>

              {linkedScenario ? (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">Associated Threat Vector</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                      {linkedScenario.cweId}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white">
                    {linkedScenario.name}
                  </div>

                  <p className="text-xs text-slate-300 font-sans">
                    {linkedScenario.description}
                  </p>

                  <button
                    onClick={() => onSelectScenario(linkedScenario)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Launch Simulation Drill on this Node
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
                  Standard core infrastructure service node. Operating in secure VPC mesh perimeter.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
