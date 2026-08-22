export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Phase = 'INIT' | 'RED_ATTACK' | 'BLUE_DEFENSE' | 'ARBITER_EVAL' | 'ROUND_COMPLETE';

export type RedStrategy = 'apt' | 'fuzzer' | 'fuzzing' | 'stealth_prober' | 'script_kiddie' | 'zero_day_hunter' | 'brute_force' | 'evasion' | 'custom_manual';
export type BlueStrategy = 'waf_filter' | 'waf_rules' | 'input_sanitization' | 'crypto_hardening' | 'logic_refactor' | 'whitelist_guard' | 'rate_limit' | 'custom_manual';

export type AppViewTab = 'arena' | 'interactive' | 'attack_path' | 'graphs' | 'matrix' | 'topology' | 'telemetry' | 'replay';

export type OperatorRole = 'spectator' | 'red_attacker' | 'blue_defender' | 'arbiter_judge';

export interface TrafficSample {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  expectedStatus: number;
  description: string;
}

export interface MitreAttackInfo {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  tacticName: string;
  description: string;
  url?: string;
  subtechnique?: string;
}

export interface MitreDefendInfo {
  d3fendId: string;
  d3fendName: string;
  tactic: string;
  description: string;
  countermeasureType: string;
}

export interface OwaspInfo {
  code: string;
  title: string;
  year: '2021' | '2023-API' | '2025-LLM';
  category: string;
  description: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface RealWorldIncident {
  isFamousIncident?: boolean;
  incidentName: string;
  year: number | string;
  cveId?: string;
  affectedEntities?: string;
  estimatedImpact?: string;
  realWorldStory: string;
  technicalRootCause: string;
  cveUrl?: string;
}

export interface ServiceTopologyNode {
  serviceName: string;
  serviceType: 'gateway' | 'auth' | 'database' | 'worker' | 'ai' | 'api' | 'storage' | 'billing' | 'catalog';
  port: number;
  cluster: string;
  upstream?: string[];
  downstream?: string[];
}

export interface Scenario {
  id: string;
  name: string;
  category: string;
  targetService: string;
  vulnerabilityType: string;
  cweId: string;
  severity: Severity;
  description: string;
  targetFile: string;
  vulnerableCode: string;
  isCustom?: boolean;
  realWorldIncident?: RealWorldIncident;
  mitreAttack?: MitreAttackInfo;
  mitreDefend?: MitreDefendInfo;
  owasp?: OwaspInfo;
  attackMechanics?: string[];
  defenseMechanics?: string[];
  topology?: ServiceTopologyNode;
  apiDoc: {
    endpoint: string;
    method: string;
    purpose: string;
    expectedParams: string[];
    sampleRequest: string;
  };
  normalTrafficSamples: TrafficSample[];
  defaultExploit: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    headers: Record<string, string>;
    params: Record<string, any>;
    body: any;
    flawIdentified: string;
    attackVector: string;
    rationale: string;
  };
  defaultPatch: {
    patchedCode: string;
    patchStrategy: string;
    rationale: string;
  };
}

export interface HttpPayload {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers: Record<string, string>;
  params: Record<string, any>;
  body: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'security' | 'success' | 'patch';
  message: string;
  source?: 'RED' | 'BLUE' | 'ARBITER' | 'SANDBOX' | 'SYSTEM' | 'OPERATOR';
  statusCode?: number;
  rawResponse?: any;
  breachExfiltration?: string;
}

export interface RedAttackResult {
  flawIdentified: string;
  attackVector: string;
  payload: HttpPayload;
  rationale: string;
  cveTag: string;
  executionLogs: LogEntry[];
  success: boolean;
  statusCode: number;
  responseBody: any;
  exfiltratedData?: string;
  executedAt: number;
  modelUsed?: string;
  isUserInitiated?: boolean;
}

export interface BlueDefenseResult {
  identifiedSignature: string;
  attackAnalysis: string;
  patchStrategy: string;
  unifiedDiff: string;
  patchedCode: string;
  rationale: string;
  diffStats: {
    additions: number;
    deletions: number;
    filesChanged: number;
  };
  executionLogs: LogEntry[];
  generatedAt: number;
  modelUsed?: string;
  isUserInitiated?: boolean;
}

export interface TrafficTestResult {
  id: string;
  name: string;
  passed: boolean;
  statusCode: number;
  expectedStatus: number;
  latencyMs: number;
  responsePreview?: string;
}

export interface ArbiterEvaluationResult {
  verdict: 'BLUE_WIN' | 'RED_WIN' | 'DRAW' | 'PATCH_BROKE_PROD';
  verdictTitle: string;
  scoreDelta: {
    red: number;
    blue: number;
  };
  exploitNeutralized: boolean;
  uptimeCheckPassed: boolean;
  normalTrafficResults: TrafficTestResult[];
  exploitReTest: {
    statusCode: number;
    blocked: boolean;
    details: string;
    outputSample: string;
  };
  arbiterAnalysis: string;
  resilienceScore: number;
  evaluatedAt: number;
  isUserInitiated?: boolean;
  executionLogs?: LogEntry[];
}

export interface SimulationRound {
  roundNumber: number;
  scenario: Scenario;
  redResult?: RedAttackResult;
  blueResult?: BlueDefenseResult;
  arbiterResult?: ArbiterEvaluationResult;
  durationMs: number;
  timestamp: number;
}

export interface CommanderSettings {
  redStrategy: RedStrategy;
  redTemperature: number;
  redAggression: number;
  blueStrategy: BlueStrategy;
  blueTemperature: number;
  blueStrictness: number;
  simulationSpeed: '30s' | '15s' | '5s' | 'step';
  autoLoop: boolean;
  soundEnabled: boolean;
  selectedScenarioId?: string;
  operatorRole?: OperatorRole;
}

export interface LiveSimulationState {
  currentRoundNumber: number;
  phase: Phase;
  phaseTimeRemaining: number;
  phaseDuration: number;
  activeScenario: Scenario;
  currentRound: Partial<SimulationRound>;
  history: SimulationRound[];
  scores: {
    red: number;
    blue: number;
    draws: number;
  };
  resilienceMetric: number;
  uptimeMetric: number;
  isPaused: boolean;
  isAiProcessing: boolean;
  statusMessage: string;
}

export interface OperatorActionDebrief {
  id: string;
  timestamp: number;
  role: OperatorRole;
  scenario: Scenario;
  actionName: string;
  actionCategory: 'OFFENSE' | 'DEFENSE' | 'EVALUATION' | 'SCENARIO_CONFIG';
  choiceSummary: string;
  technicalRationale: string;
  outcomeStatus: 'BREACH_SUCCESS' | 'BREACH_BLOCKED' | 'PATCH_EFFECTIVE' | 'PRODUCTION_REGRESSION' | 'VERDICT_RENDERED' | 'RECON_COMPLETE';
  statusCode?: number;
  exfiltratedData?: string;
  diffStats?: { additions: number; deletions: number };
  mitreMapping?: {
    attackId?: string;
    attackName?: string;
    d3fendId?: string;
    d3fendName?: string;
    owaspCode?: string;
    owaspTitle?: string;
  };
  stepByStepBreakdown: string[];
  keyTakeaway: string;
  proSecurityTip: string;
}

export interface SocraticHintStage {
  stage: number; // 1 to 4
  title: string;
  category: 'INQUIRY' | 'VULN_FLOW' | 'GUARDRAIL_DESIGN' | 'CODE_BLUEPRINT';
  socraticQuestion: string;
  thoughtPrompt: string;
  conceptualGuidance: string;
  targetCodeLocation?: string;
  d3fendCountermeasure?: string;
  recommendedPatternSnippet?: string;
}

export interface ScenarioSocraticGuide {
  scenarioId: string;
  scenarioName: string;
  cweId: string;
  overviewInquiry: string;
  stages: SocraticHintStage[];
  commonPitfalls: string[];
  slaConsiderations: string;
}

export interface SocraticAiResponse {
  socraticAdvice: string;
  guidingQuestion: string;
  reflectionPrompt: string;
  recommendedFocusLine?: string;
  suggestedActionSnippet?: string;
  hypothesisValidation?: {
    isSound: boolean;
    feedback: string;
  };
}

export interface AttackPathHop {
  hopNumber: number;
  nodeId: string;
  nodeName: string;
  type: 'client' | 'ingress' | 'service' | 'worker' | 'ai' | 'database' | 'internal_metadata' | 'os_shell';
  protocol: 'HTTPS' | 'gRPC' | 'SQL' | 'HTTP_IMDS' | 'IPC' | 'GraphQL' | 'WSS';
  port: number;
  action: string;
  status: 'traversing' | 'exploited' | 'blocked' | 'exfiltrating' | 'intact';
  payloadSnippet?: string;
  mitreTechnique?: string;
  description: string;
}

export interface ScenarioAttackPath {
  scenarioId: string;
  entryPoint: string;
  targetSink: string;
  blastRadius: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedTtdSec: number;
  hops: AttackPathHop[];
  containmentRecommendation: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  targetTab?: AppViewTab;
  category: 'WELCOME' | 'TEAMS' | 'RED_ATTACK' | 'BLUE_HOTFIX' | 'SOCRATIC_HINTS' | 'ARBITER_EVAL' | 'TOPOLOGY_ATTACK_PATH' | 'MATRIX' | 'ANALYTICS' | 'STRATEGY_SELECT' | 'AGENT_REPLAY';
  iconName: string;
  badge: string;
  instruction: string;
  detailedHelp: string;
  actionPrompt?: string;
  suggestedActionLabel?: string;
  suggestedActionTab?: AppViewTab;
  hotTip: string;
}

export interface MatchStrategyConfig {
  redVectorId: string;
  redVectorName: string;
  redTacticCategory: string;
  redPayloadPreset: string;
  redAggression: number;
  redTemperature: number;
  blueProtocolId: string;
  blueProtocolName: string;
  blueGuardrailCategory: string;
  bluePatchPreset: string;
  blueStrictness: number;
  blueTemperature: number;
  arbitrationPolicy: 'strict_sla' | 'balanced' | 'security_first';
  prioritizeZeroDowntime: boolean;
}

export interface ReplayFrame {
  timestampMs: number;
  timeLabel: string;
  phase: Phase;
  progressPercent: number;
  activeNodeIds: string[];
  compromisedNodeIds: string[];
  shieldedNodeIds: string[];
  highlightedHopIndex?: number;
  headline: string;
  description: string;
  activeLogs: LogEntry[];
  resilienceScore: number;
  uptimePercent: number;
}

export interface ServiceRiskMetric {
  serviceId: string;
  serviceName: string;
  cluster: string;
  port: number;
  type: 'gateway' | 'auth' | 'billing' | 'catalog' | 'worker' | 'ai' | 'database';
  totalAttacksTargeted: number;
  breachCount: number;
  containmentCount: number;
  riskScore: number; // 0 to 100
  riskTier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isActivelyUnderSiege: boolean;
  activeExploitTechnique?: string;
  associatedCwe?: string;
  associatedCve?: string;
  endpointSample: string;
  defenseStatus: 'SHIELDED' | 'UNDER_ATTACK' | 'BREACHED' | 'IDLE_SECURE';
}

export interface MatchReportData {
  matchId: string;
  timestamp: string;
  scenario: Scenario;
  durationSeconds: number;
  scores: {
    red: number;
    blue: number;
    draws: number;
  };
  overallResilienceScore: number;
  productionUptimePercent: number;
  mitigationSuccessRate: number;
  finalVerdict: 'BLUE_WIN' | 'RED_WIN' | 'DRAW' | 'PATCH_BROKE_PROD';
  verdictTitle: string;
  arbiterAnalysis: string;
  attackPathData: ScenarioAttackPath;
  redExploitDetails: {
    method: string;
    endpoint: string;
    flawIdentified: string;
    payloadBody: string;
    mitreTechnique?: string;
  };
  blueDefenseDetails: {
    patchStrategy: string;
    rationale: string;
    patchedCode: string;
    vulnerableCode: string;
    d3fendRule?: string;
  };
  trafficSuiteResults: TrafficTestResult[];
  complianceNotes: string[];
}

