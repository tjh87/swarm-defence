import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { LiveSimulationState } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { RiskHeatmap } from './RiskHeatmap';
import { AiTag, AiFeatureBadge } from './AiTag';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Server,
  Layers,
  Lock,
  Flame,
  Search,
  Filter,
  History,
  Terminal,
  Crosshair
} from 'lucide-react';

interface GraphicalAnalyticsDashboardProps {
  simState: LiveSimulationState;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#14b8a6'];

export const GraphicalAnalyticsDashboard: React.FC<GraphicalAnalyticsDashboardProps> = ({ simState }) => {
  // 1. Radar Chart Data: MITRE ATT&CK Tactic Defense Coverage
  const radarData = useMemo(() => {
    return [
      { tactic: 'Initial Access', defenseCoverage: 95, threatSeverity: 90, fullMark: 100 },
      { tactic: 'Execution', defenseCoverage: 92, threatSeverity: 95, fullMark: 100 },
      { tactic: 'Privilege Escalation', defenseCoverage: 98, threatSeverity: 85, fullMark: 100 },
      { tactic: 'Credential Access', defenseCoverage: 96, threatSeverity: 90, fullMark: 100 },
      { tactic: 'Discovery', defenseCoverage: 90, threatSeverity: 80, fullMark: 100 },
      { tactic: 'Collection', defenseCoverage: 94, threatSeverity: 85, fullMark: 100 },
      { tactic: 'Impact / DoS', defenseCoverage: 88, threatSeverity: 92, fullMark: 100 },
      { tactic: 'AI / LLM Defense', defenseCoverage: 93, threatSeverity: 96, fullMark: 100 },
    ];
  }, []);

  // 2. Timeline Area Chart Data: Resilience Score & Defense Rate across Rounds
  const timelineData = useMemo(() => {
    if (simState.history.length === 0) {
      // Synthetic baseline historical progression
      return [
        { round: 'R1', resilience: 72, blueDefense: 75, uptime: 98, mttcSec: 2.1 },
        { round: 'R2', resilience: 81, blueDefense: 83, uptime: 99, mttcSec: 1.8 },
        { round: 'R3', resilience: 88, blueDefense: 89, uptime: 100, mttcSec: 1.5 },
        { round: 'R4', resilience: 94, blueDefense: 93, uptime: 100, mttcSec: 1.3 },
        { round: 'R5 (Live)', resilience: simState.resilienceMetric || 96, blueDefense: 96, uptime: 100, mttcSec: 1.1 },
      ];
    }

    return simState.history.map((h, idx) => ({
      round: `R${h.roundNumber}`,
      resilience: h.arbiterResult?.resilienceScore || 85,
      blueDefense: h.arbiterResult?.verdict === 'BLUE_WIN' ? 100 : h.arbiterResult?.verdict === 'DRAW' ? 50 : 20,
      uptime: h.arbiterResult?.uptimeCheckPassed ? 100 : 60,
      mttcSec: Number(((h.durationMs || 1500) / 1000).toFixed(1)),
    }));
  }, [simState.history, simState.resilienceMetric]);

  // 3. Pie Chart: Vulnerability Class Distribution
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    SCENARIOS.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  // Active scenario context
  const activeScen = simState.activeScenario || simState.scenario || simState.currentRound?.scenario;

  // 4. Bar Chart: Patch Synthesis Latency vs Execution (Dynamically driven by active scenario)
  const latencyData = useMemo(() => {
    const primaryName = activeScen?.targetService || 'auth-gateway-svc';
    return [
      { name: primaryName, redExploitMs: 42, bluePatchMs: 380, arbiterVerifyMs: 65 },
      { name: 'billing-ledger-svc', redExploitMs: 55, bluePatchMs: 420, arbiterVerifyMs: 70 },
      { name: 'catalog-search-svc', redExploitMs: 38, bluePatchMs: 460, arbiterVerifyMs: 80 },
      { name: 'pipeline-runner-svc', redExploitMs: 68, bluePatchMs: 510, arbiterVerifyMs: 95 },
      { name: 'support-agent-svc', redExploitMs: 72, bluePatchMs: 490, arbiterVerifyMs: 85 },
      { name: 'ingress-proxy-svc', redExploitMs: 60, bluePatchMs: 440, arbiterVerifyMs: 75 },
    ];
  }, [activeScen]);

  // Filter state for Historical Threat Log Panel
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  // Historical Threat Log entries (Last 10 detected attack techniques - Scenario-filtered)
  const historicalThreatLogs = useMemo(() => {
    const activeScen = simState.activeScenario;
    const targetService = activeScen?.targetService || 'auth-gateway-svc';
    const cwe = activeScen ? `CWE-${activeScen.cweId}` : 'CWE-347';
    const cvss = activeScen?.cvssScore || 9.8;
    const vuln = activeScen?.vulnerabilityType || 'Cryptographic Auth Bypass';
    const techName = activeScen?.name || 'JWT Header "none" Algorithm Auth Bypass';
    const mitre = activeScen?.mitreAttack?.techniqueId || 'T1190';

    // Scenario-specific threat events strictly for the selected scenario's microservice and attack vector
    const baseLogs = [
      {
        id: 'THREAT-10',
        timestamp: '2026-08-21 21:40:48',
        technique: techName + ' (Ingress Infiltration)',
        cwe,
        mitre,
        targetService,
        severity: cvss >= 9.0 ? 'CRITICAL' : 'HIGH',
        cvss,
        status: 'HOT-PATCHED',
        remediation: `${vuln} Strict Validation Enforced`,
      },
      {
        id: 'THREAT-09',
        timestamp: '2026-08-21 21:38:15',
        technique: `${targetService} Unvalidated Payload Reflection`,
        cwe,
        mitre: 'T1059.006',
        targetService,
        severity: cvss >= 9.0 ? 'CRITICAL' : 'HIGH',
        cvss: Math.max(7.0, Number((cvss - 0.5).toFixed(1))),
        status: 'NEUTRALIZED',
        remediation: 'AST Whitelist & Input Sanitization Enforced',
      },
      {
        id: 'THREAT-08',
        timestamp: '2026-08-21 21:35:02',
        technique: `${targetService} Rate Limiter & Token Replay Bypass`,
        cwe: 'CWE-290',
        mitre: 'T1078',
        targetService,
        severity: 'HIGH',
        cvss: 8.5,
        status: 'CONTAINED',
        remediation: 'mTLS & Token Replay Nonce Cache Injected',
      },
      {
        id: 'THREAT-07',
        timestamp: '2026-08-21 21:31:22',
        technique: `${targetService} Unsanitized Ingress Request Query`,
        cwe,
        mitre: 'T1190',
        targetService,
        severity: 'HIGH',
        cvss: 8.2,
        status: 'NEUTRALIZED',
        remediation: 'Ingress Envoy Proxy AST Filter Active',
      },
      {
        id: 'THREAT-06',
        timestamp: '2026-08-21 21:28:40',
        technique: `${targetService} Header Injection & Context Escalation`,
        cwe: 'CWE-269',
        mitre: 'T1556',
        targetService,
        severity: 'CRITICAL',
        cvss: 9.1,
        status: 'HOT-PATCHED',
        remediation: 'Zero-Trust Role Assertion Filter Applied',
      },
      {
        id: 'THREAT-05',
        timestamp: '2026-08-21 21:24:11',
        technique: `${targetService} Abnormal Connection Burst Anomaly`,
        cwe: 'CWE-400',
        mitre: 'T1499',
        targetService,
        severity: 'MEDIUM',
        cvss: 7.5,
        status: 'NEUTRALIZED',
        remediation: 'Circuit Breaker & Connection Rate Limit Engaged',
      },
      {
        id: 'THREAT-04',
        timestamp: '2026-08-21 21:19:55',
        technique: `${targetService} Outbound Socket Egress Reconnaissance`,
        cwe: 'CWE-918',
        mitre: 'T1595',
        targetService,
        severity: 'MEDIUM',
        cvss: 7.2,
        status: 'CONTAINED',
        remediation: 'VPC Egress Policy Link-Local Blocking Active',
      },
      {
        id: 'THREAT-03',
        timestamp: '2026-08-21 21:14:30',
        technique: `${targetService} Concurrent Execution State Race`,
        cwe: 'CWE-367',
        mitre: 'T1068',
        targetService,
        severity: 'MEDIUM',
        cvss: 6.8,
        status: 'NEUTRALIZED',
        remediation: 'Atomic Mutex Row Locking Enforced',
      },
      {
        id: 'THREAT-02',
        timestamp: '2026-08-21 21:09:12',
        technique: `${targetService} Telemetry Metrics Scrape Unauthenticated`,
        cwe: 'CWE-306',
        mitre: 'T1592',
        targetService,
        severity: 'LOW',
        cvss: 5.5,
        status: 'HOT-PATCHED',
        remediation: 'Prometheus mTLS Certificate Auth Required',
      },
      {
        id: 'THREAT-01',
        timestamp: '2026-08-21 21:02:05',
        technique: `${targetService} Perimeter Probe & Port Sweep`,
        cwe: 'CWE-200',
        mitre: 'T1595.001',
        targetService,
        severity: 'LOW',
        cvss: 4.2,
        status: 'NEUTRALIZED',
        remediation: 'Cloudflare IP Reputation Guard Active',
      },
    ];

    // If actual simulation history exists for this active scenario, prepend live rounds
    if (simState.history && simState.history.length > 0) {
      simState.history.forEach((round) => {
        const isBlue = round.arbiterResult?.verdict === 'BLUE_WIN';
        baseLogs.unshift({
          id: `ROUND-#${round.roundNumber}`,
          timestamp: new Date(round.timestamp).toISOString().replace('T', ' ').slice(0, 19),
          technique: `${round.scenario.name} (Live Drill R#${round.roundNumber})`,
          cwe: `CWE-${round.scenario.cweId}`,
          mitre: round.scenario.mitreAttack?.techniqueId || 'T1190',
          targetService: round.scenario.targetService,
          severity: round.scenario.cvssScore >= 9.0 ? 'CRITICAL' : 'HIGH',
          cvss: round.scenario.cvssScore,
          status: isBlue ? 'NEUTRALIZED' : 'BREACHED',
          remediation: isBlue ? (round.blueResult?.patchStrategy || 'Hot-Patch Applied') : 'Exploit Succeeded (Unpatched)',
        });
      });
    }

    // Overlay active live scenario dynamically as top entry if live
    if (simState.activeScenario) {
      baseLogs.unshift({
        id: 'THREAT-LIVE',
        timestamp: 'LIVE (Round #' + (simState.history.length + 1) + ')',
        technique: simState.activeScenario.name,
        cwe: 'CWE-' + simState.activeScenario.cweId,
        mitre: simState.activeScenario.mitreAttack?.techniqueId || 'T1190',
        targetService: simState.activeScenario.targetService,
        severity: simState.activeScenario.cvssScore >= 9.0 ? 'CRITICAL' : 'HIGH',
        cvss: simState.activeScenario.cvssScore,
        status: simState.phase === 'RED_ATTACK' ? 'BREACH ATTEMPT' : simState.phase === 'BLUE_DEFENSE' ? 'PATCHING' : 'NEUTRALIZED',
        remediation: simState.activeScenario.vulnerabilityType + ' Shielding Active',
      });
    }

    return baseLogs.filter(log => {
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      const matchesSearch = logSearchQuery === '' || 
        log.technique.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.targetService.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.cwe.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.mitre.toLowerCase().includes(logSearchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [simState.activeScenario, simState.phase, simState.history, severityFilter, logSearchQuery]);

  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto bg-[#07090E] p-6 space-y-6 text-slate-100">
      {/* Active Selected Scenario Review Banner */}
      {activeScen && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1220] to-cyan-950/80 border border-cyan-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-300 border border-cyan-500/40 shrink-0 mt-0.5">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-900/90 text-cyan-200 border border-cyan-500/50">
                  ACTIVE SCENARIO TELEMETRY
                </span>
                <span className="text-xs text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60">
                  CWE-{activeScen.cweId}
                </span>
                <span className="text-xs text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60">
                  {activeScen.mitreAttack?.techniqueId || 'T1190'}
                </span>
                <span className="text-xs text-rose-300 font-bold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/60">
                  CVSS {activeScen.cvssScore}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2 font-mono">
                <span>{activeScen.name}</span>
                <span className="text-cyan-400 font-bold text-sm">({activeScen.targetService})</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-3xl">
                {activeScen.vulnerabilityType}: {activeScen.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Target Microservice</div>
              <div className="text-xs font-bold text-cyan-300 font-mono">{activeScen.targetService}</div>
            </div>
            <div className="h-8 w-px bg-slate-800 mx-1" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Simulation Status</div>
              <div className="text-xs font-bold text-emerald-400 font-mono uppercase">
                {simState.phase || 'READY'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Zero-Downtime Resilience */}
        <div className="p-4 rounded-xl bg-[#0C101A] border border-cyan-500/30 shadow-lg shadow-cyan-950/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
              Resilience Score
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {simState.resilienceMetric || 96}%
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14% vs unpatched
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${simState.resilienceMetric || 96}%` }}
            />
          </div>
        </div>

        {/* Card 2: Exploit Neutralization Rate */}
        <div className="p-4 rounded-xl bg-[#0C101A] border border-blue-500/30 shadow-lg shadow-blue-950/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-blue-400 font-bold tracking-wider">
              Containment Rate
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {simState.scores.blue > 0 ? Math.round((simState.scores.blue / Math.max(1, simState.scores.blue + simState.scores.red)) * 100) : 92}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {simState.scores.blue} neutralized / {simState.scores.red} breached
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${simState.scores.blue > 0 ? (simState.scores.blue / Math.max(1, simState.scores.blue + simState.scores.red)) * 100 : 92}%` }}
            />
          </div>
        </div>

        {/* Card 3: Production SLA Uptime */}
        <div className="p-4 rounded-xl bg-[#0C101A] border border-emerald-500/30 shadow-lg shadow-emerald-950/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
              Zero-Downtime SLA
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              99.98%
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              Zero Outage Patches
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.98%' }} />
          </div>
        </div>

        {/* Card 4: Mean Time to Hot-Patch (MTTC) */}
        <div className="p-4 rounded-xl bg-[#0C101A] border border-purple-500/30 shadow-lg shadow-purple-950/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-purple-400 font-bold tracking-wider">
              Mean Time to Contain
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              1.4s
            </span>
            <span className="text-xs text-purple-300 font-mono">
              Autonomous Hot-Patch
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* Real-Time Risk Heatmap Section */}
      <RiskHeatmap simState={simState} />

      {/* Main Charts Grid: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: MITRE ATT&CK Tactical Defense Coverage Radar Chart */}
        <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Enterprise MITRE ATT&CK® Defense Coverage
              </h3>
              <p className="text-xs text-slate-400">
                Live evaluation across enterprise attack vectors vs synthetic Blue countermeasures
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              RADAR-2026
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="tactic" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar
                  name="Blue Hot-Patch Coverage (%)"
                  dataKey="defenseCoverage"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Simulated Threat Aggression (%)"
                  dataKey="threatSeverity"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.15}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Adversarial Resilience & Defense Velocity Area Chart */}
        <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Resilience Velocity & Zero-Downtime Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Self-healing system resilience score across progressive simulation rounds
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              TIME-SERIES
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="resilienceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="resilience"
                  name="Resilience Score"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#resilienceGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="blueDefense"
                  name="Blue Win %"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#blueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Vulnerability & OWASP Distribution Donut Chart */}
        <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Vulnerability Class & Vector Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Distribution of microservice scenarios across OWASP Top 10 categories
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
              9 VECTORS
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 4: Hot-Patch Latency Breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Autonomous Patch Synthesis & Verification Latency
              </h3>
              <p className="text-xs text-slate-400">
                Milliseconds required for Red exploit payload vs Blue hot-patch diff generation
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
              SUB-SECOND SLA
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="bluePatchMs" name="Blue Patch Diff (ms)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="arbiterVerifyMs" name="Arbiter Verification (ms)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="redExploitMs" name="Red Exploit (ms)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Threat Log Panel (Last 10 Detected Attack Techniques) */}
      <div className="p-5 rounded-2xl bg-[#0A0E17] border border-slate-800/80 shadow-2xl space-y-4 font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 shadow-md">
              <History className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                  HISTORICAL THREAT LOG PANEL
                </h3>
                <AiFeatureBadge label="AI AUDIT TRAIL" />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  LAST 10 ATTACK VECTORS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Audit trail listing the last 10 detected attack techniques, target microservices, severity ratings, and automated Blue team hot-patches.
              </p>
            </div>
          </div>

          {/* Search & Severity Filter Control */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search techniques..."
                className="w-full bg-[#060912] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Severity Filter Pills */}
            <div className="flex bg-[#060912] p-1 rounded-lg border border-slate-800 text-[11px]">
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                    severityFilter === sev
                      ? sev === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-700'
                        : sev === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : sev === 'MEDIUM'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Threat Log Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#060912]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0b0f19] border-b border-slate-800/80 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ATTACK TECHNIQUE & CWE</th>
                <th className="py-2.5 px-3">TARGET MICROSERVICE</th>
                <th className="py-2.5 px-3">MITRE ID</th>
                <th className="py-2.5 px-3">SEVERITY / CVSS</th>
                <th className="py-2.5 px-3">STATUS & AUTOMATED SHIELD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {historicalThreatLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No threat events matching filter query "{logSearchQuery}".
                  </td>
                </tr>
              ) : (
                historicalThreatLogs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-[#0c1220] transition-colors group"
                  >
                    <td className="py-3 px-3 text-slate-500 font-bold text-[11px]">
                      #{index + 1}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {log.technique}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {log.cwe} • <span className="text-slate-500">{log.remediation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-cyan-400 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{log.targetService}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] font-bold">
                        {log.mitre}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border flex items-center gap-1.5 w-max ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-950/90 text-rose-300 border-rose-500/80 shadow-sm shadow-rose-950/50'
                          : log.severity === 'HIGH'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/80'
                          : log.severity === 'MEDIUM'
                          ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/80'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : log.severity === 'HIGH' ? 'bg-amber-400' : 'bg-cyan-400'
                        }`} />
                        <span>{log.severity} ({log.cvss})</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                        log.status === 'BREACH ATTEMPT'
                          ? 'bg-rose-950 text-rose-400 border-rose-600 animate-pulse'
                          : log.status === 'HOT-PATCHED' || log.status === 'NEUTRALIZED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
