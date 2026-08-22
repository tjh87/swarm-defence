import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  Server, 
  Activity, 
  Radio, 
  Crosshair, 
  AlertTriangle, 
  ArrowUpRight, 
  Filter, 
  Zap, 
  Lock,
  Layers,
  Database,
  Globe,
  Cpu
} from 'lucide-react';
import { LiveSimulationState, ServiceRiskMetric } from '../types';

interface RiskHeatmapProps {
  simState: LiveSimulationState;
}

const TOPOLOGY_SERVICES = [
  { id: 'ingress-envoy-proxy', name: 'ingress-envoy-proxy', cluster: 'edge-ingress-global', port: 443, type: 'gateway' as const, endpoint: '/api/v1/*' },
  { id: 'auth-gateway-svc', name: 'auth-gateway-svc', cluster: 'edge-ingress-apac', port: 8080, type: 'auth' as const, endpoint: '/api/v1/auth/exchange' },
  { id: 'billing-ledger-svc', name: 'billing-ledger-svc', cluster: 'finance-secure-us-east', port: 8084, type: 'billing' as const, endpoint: '/api/v1/billing/ledger' },
  { id: 'catalog-search-svc', name: 'catalog-search-svc', cluster: 'catalog-cluster-eu', port: 8082, type: 'catalog' as const, endpoint: '/api/v1/catalog/search' },
  { id: 'pipeline-runner-svc', name: 'pipeline-runner-svc', cluster: 'ci-runner-us-west', port: 9090, type: 'worker' as const, endpoint: '/api/v1/jobs/telemetry' },
  { id: 'support-agent-svc', name: 'support-agent-svc', cluster: 'ai-enclave-us-central', port: 8088, type: 'ai' as const, endpoint: '/api/v1/agent/prompt' },
  { id: 'postgres-master-replica', name: 'postgres-master-replica', cluster: 'database-tier-primary', port: 5432, type: 'database' as const, endpoint: 'tcp://postgres:5432' },
  { id: 'redis-session-cache', name: 'redis-session-cache', cluster: 'cache-in-memory-global', port: 6379, type: 'database' as const, endpoint: 'tcp://redis:6379' }
];

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ simState }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Compute live service risk metrics based on simulation state & attack frequency
  const serviceMetrics: ServiceRiskMetric[] = useMemo(() => {
    const activeScenario = simState.activeScenario || simState.scenario || simState.currentRound?.scenario;
    const currentTargetService = activeScenario?.targetService?.toLowerCase() || '';
    const activeRedTactic = activeScenario?.mitreAttack?.techniqueId || 'T1190';
    const cwe = activeScenario?.cweId || 'CWE-20';
    const cve = activeScenario?.realWorldIncident?.cveId;

    const redScore = simState.scores?.red || 0;
    const blueScore = simState.scores?.blue || 0;
    const totalRounds = Math.max(1, redScore + blueScore + (simState.scores?.draws || 0));

    return TOPOLOGY_SERVICES.map(svc => {
      const isDirectTarget = currentTargetService.includes(svc.name) || currentTargetService.includes(svc.id);
      const isDatabaseSink = svc.type === 'database';
      const isIngressTraversed = svc.type === 'gateway';

      // Calculate attack volume directed at this node
      let targetFrequency = 1;
      if (isDirectTarget) {
        targetFrequency += totalRounds * 3 + (simState.phase === 'RED_ATTACK' || simState.phase === 'BLUE_DEFENSE' ? 4 : 2);
      } else if (isDatabaseSink) {
        targetFrequency += totalRounds + 1;
      } else if (isIngressTraversed) {
        targetFrequency += totalRounds * 2;
      } else {
        targetFrequency += Math.floor(Math.random() * 2);
      }

      // Calculate breach and containment rates
      let breaches = 0;
      let containments = 0;
      if (isDirectTarget) {
        breaches = redScore + (simState.phase === 'RED_ATTACK' ? 1 : 0);
        containments = blueScore + (simState.phase === 'BLUE_DEFENSE' ? 1 : 0);
      } else {
        breaches = Math.floor(redScore * 0.3);
        containments = Math.floor(blueScore * 0.7);
      }

      // Calculate 0-100 Risk Score
      let baseRisk = 15;
      if (isDirectTarget) {
        baseRisk = 80 + (simState.phase === 'RED_ATTACK' ? 15 : 0) - (simState.phase === 'BLUE_DEFENSE' || simState.phase === 'EVALUATION' ? (simState.resilienceScore > 70 ? 25 : 0) : 0);
      } else if (isIngressTraversed) {
        baseRisk = 55 + (simState.phase === 'RED_ATTACK' ? 10 : 0);
      } else if (isDatabaseSink) {
        baseRisk = 48 + (simState.phase === 'RED_ATTACK' ? 20 : 0);
      } else {
        baseRisk = 20 + Math.min(25, targetFrequency * 3);
      }

      const riskScore = Math.min(100, Math.max(5, baseRisk));

      let riskTier: ServiceRiskMetric['riskTier'] = 'LOW';
      if (riskScore >= 75) riskTier = 'CRITICAL';
      else if (riskScore >= 55) riskTier = 'HIGH';
      else if (riskScore >= 35) riskTier = 'MEDIUM';

      let defenseStatus: ServiceRiskMetric['defenseStatus'] = 'IDLE_SECURE';
      if (isDirectTarget && simState.phase === 'RED_ATTACK') defenseStatus = 'UNDER_ATTACK';
      else if (isDirectTarget && (simState.phase === 'BLUE_DEFENSE' || simState.phase === 'EVALUATION')) defenseStatus = 'SHIELDED';
      else if (isDirectTarget && redScore > blueScore) defenseStatus = 'BREACHED';

      return {
        serviceId: svc.id,
        serviceName: svc.name,
        cluster: svc.cluster,
        port: svc.port,
        type: svc.type,
        totalAttacksTargeted: targetFrequency,
        breachCount: breaches,
        containmentCount: containments,
        riskScore,
        riskTier,
        isActivelyUnderSiege: isDirectTarget && (simState.phase === 'RED_ATTACK' || simState.phase === 'BLUE_DEFENSE'),
        activeExploitTechnique: isDirectTarget ? activeRedTactic : undefined,
        associatedCwe: isDirectTarget ? cwe : undefined,
        associatedCve: isDirectTarget ? cve : undefined,
        endpointSample: svc.endpoint,
        defenseStatus
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [simState.activeScenario, simState.scenario, simState.scores, simState.phase, simState.resilienceMetric]);

  const filteredMetrics = useMemo(() => {
    if (clusterFilter === 'all') return serviceMetrics;
    return serviceMetrics.filter(m => m.cluster.includes(clusterFilter) || m.type === clusterFilter);
  }, [serviceMetrics, clusterFilter]);

  const activeSelectedMetric = useMemo(() => {
    if (!selectedServiceId) return filteredMetrics[0] || serviceMetrics[0];
    return serviceMetrics.find(s => s.serviceId === selectedServiceId) || serviceMetrics[0];
  }, [selectedServiceId, filteredMetrics, serviceMetrics]);

  const getHeatmapColor = (score: number, isUnderSiege: boolean) => {
    if (score >= 80) {
      return {
        bg: 'bg-rose-950/70',
        border: 'border-rose-500/80',
        glow: 'shadow-rose-950/60 shadow-lg',
        text: 'text-rose-300',
        badge: 'bg-rose-900/90 text-rose-200 border-rose-600',
        bar: 'bg-rose-500'
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-orange-950/60',
        border: 'border-orange-500/70',
        glow: 'shadow-orange-950/50 shadow-md',
        text: 'text-orange-300',
        badge: 'bg-orange-900/90 text-orange-200 border-orange-600',
        bar: 'bg-orange-500'
      };
    }
    if (score >= 35) {
      return {
        bg: 'bg-amber-950/50',
        border: 'border-amber-500/60',
        glow: 'shadow-amber-950/30',
        text: 'text-amber-300',
        badge: 'bg-amber-900/80 text-amber-200 border-amber-600',
        bar: 'bg-amber-500'
      };
    }
    return {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-500/40',
      glow: '',
      text: 'text-emerald-300',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
      bar: 'bg-emerald-500'
    };
  };

  const getServiceIcon = (type: ServiceRiskMetric['type']) => {
    switch (type) {
      case 'gateway': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'auth': return <Lock className="w-4 h-4 text-blue-400" />;
      case 'billing': return <Activity className="w-4 h-4 text-purple-400" />;
      case 'worker': return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'ai': return <Zap className="w-4 h-4 text-pink-400" />;
      case 'database': return <Database className="w-4 h-4 text-emerald-400" />;
      default: return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800/80 shadow-2xl space-y-4 font-mono text-slate-100">
      {/* Header with Live Pulse Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162033]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                REAL-TIME MICROSERVICE RISK HEATMAP
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">
                <Radio className="w-2.5 h-2.5" />
                LIVE ATTACK TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dynamically maps microservice vulnerability exposure and Red Team exploit targeting frequency.
            </p>
          </div>
        </div>

        {/* View & Filter Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Heatmap Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk Matrix
            </button>
          </div>

          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Enclaves</option>
            <option value="gateway">Ingress Gateways</option>
            <option value="auth">Auth & IAM</option>
            <option value="billing">Ledger / Finance</option>
            <option value="worker">CI Runners</option>
            <option value="database">Database Sinks</option>
          </select>
        </div>
      </div>

      {/* Heatmap Legend Bar */}
      <div className="p-2.5 rounded-xl bg-[#060911] border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">Risk Gradient:</span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              Low (0-34)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
              Medium (35-59)
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-700">
              High (60-74)
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-200 border border-rose-600 font-bold animate-pulse">
              Critical (75-100)
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>Active Target:</span>
          <span className="text-rose-400 font-bold font-mono">
            {(simState.activeScenario || simState.scenario)?.targetService || 'Idle'}
          </span>
        </div>
      </div>

      {/* Main Heatmap Visualizer */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredMetrics.map((svc) => {
            const styles = getHeatmapColor(svc.riskScore, svc.isActivelyUnderSiege);
            const isSelected = selectedServiceId === svc.serviceId;

            return (
              <div
                key={svc.serviceId}
                onClick={() => setSelectedServiceId(svc.serviceId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${styles.bg} ${styles.border} ${styles.glow} ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-xl' : 'hover:scale-[1.02]'
                }`}
              >
                {/* Active Siege Radar Indicator */}
                {svc.isActivelyUnderSiege && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white animate-bounce shadow-md">
                    <Radio className="w-2.5 h-2.5" />
                    <span>SIEGE</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {getServiceIcon(svc.type)}
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">
                        {svc.serviceName}
                      </span>
                    </div>

                    {!svc.isActivelyUnderSiege && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${styles.badge}`}>
                        {svc.riskTier}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Port {svc.port}</span>
                    <span className="truncate max-w-[110px] text-slate-500">{svc.cluster}</span>
                  </div>

                  {/* Risk Score Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Risk Threat Index</span>
                      <span className={`font-bold font-mono ${styles.text}`}>{svc.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                        style={{ width: `${svc.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Telemetry Mini-Row */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Crosshair className="w-3 h-3 text-rose-400" />
                    <span>{svc.totalAttacksTargeted} Attacks</span>
                  </div>

                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    svc.defenseStatus === 'UNDER_ATTACK' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    svc.defenseStatus === 'SHIELDED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    svc.defenseStatus === 'BREACHED' ? 'bg-red-900 text-red-100' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {svc.defenseStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table Matrix */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060810]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c121e] text-slate-400 border-b border-slate-800 text-[11px] uppercase">
              <tr>
                <th className="p-3">Microservice</th>
                <th className="p-3">Cluster / Port</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Attacks Targeted</th>
                <th className="p-3">Active Exploit</th>
                <th className="p-3">Defense Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredMetrics.map((svc) => {
                const styles = getHeatmapColor(svc.riskScore, svc.isActivelyUnderSiege);
                return (
                  <tr
                    key={svc.serviceId}
                    onClick={() => setSelectedServiceId(svc.serviceId)}
                    className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      {getServiceIcon(svc.type)}
                      <span>{svc.serviceName}</span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {svc.cluster} <span className="text-slate-600">(:{svc.port})</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${styles.badge}`}>
                        {svc.riskScore}% ({svc.riskTier})
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {svc.totalAttacksTargeted} hits ({svc.breachCount} breaches / {svc.containmentCount} shielded)
                    </td>
                    <td className="p-3 text-rose-300">
                      {svc.activeExploitTechnique || svc.associatedCwe || 'N/A (Baseline)'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        svc.defenseStatus === 'UNDER_ATTACK' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        svc.defenseStatus === 'SHIELDED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {svc.defenseStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Microservice Deep-Dive Inspection Drawer */}
      {activeSelectedMetric && (
        <div className="p-4 rounded-xl bg-[#0c121f] border border-cyan-900/50 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {getServiceIcon(activeSelectedMetric.type)}
              <h4 className="text-xs font-bold text-cyan-300 uppercase">
                Service Telemetry: {activeSelectedMetric.serviceName}
              </h4>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Endpoint: {activeSelectedMetric.endpointSample}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Risk Score:</span>
              <span className="font-bold text-rose-400">{activeSelectedMetric.riskScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-[#070a12] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Exploit Vulnerability</span>
              <div className="text-rose-300 font-bold">
                {activeSelectedMetric.associatedCve || activeSelectedMetric.associatedCwe || 'No Active 0-Day Flaw'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070a12] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">MITRE ATT&CK Mapping</span>
              <div className="text-purple-300 font-bold">
                {activeSelectedMetric.activeExploitTechnique ? `${activeSelectedMetric.activeExploitTechnique} - Ingress Vector` : 'TA0001 Perimeter Guard'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070a12] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Containment Success</span>
              <div className="text-emerald-300 font-bold">
                {activeSelectedMetric.containmentCount} Mitigations Verified
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
