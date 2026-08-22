import React, { useState } from 'react';
import { Shield, ShieldCheck, Activity, Terminal, GitCommit, FileCode, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';
import { BlueDefenseResult, Scenario, BlueStrategy, RedAttackResult } from '../types';
import { AiTag, AiFeatureBadge } from './AiTag';

interface BlueAgentPanelProps {
  scenario: Scenario;
  blueResult?: BlueDefenseResult;
  redResult?: RedAttackResult;
  strategy: BlueStrategy;
  temperature: number;
  isDefending: boolean;
}

export const BlueAgentPanel: React.FC<BlueAgentPanelProps> = ({
  scenario,
  blueResult,
  redResult,
  strategy,
  temperature,
  isDefending,
}) => {
  const [activeTab, setActiveTab] = useState<'triage' | 'traffic' | 'patchStrategy'>('triage');

  return (
    <div className="bg-[#0c0f18] border border-[#162238] rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0c1a2f] via-[#0f1422] to-[#0c0f18] px-3.5 py-2.5 border-b border-[#162238] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#0d213f] border border-sky-600/50 text-sky-400 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold font-mono text-sky-300 flex items-center gap-1.5">
              <span>BLUE AGENT</span>
              <AiFeatureBadge label="AI AGENT" />
              <span className="text-slate-500 text-[10px] font-normal">(Autonomous Defender)</span>
            </h2>
            <div className="text-[10px] text-sky-400/80 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Strategy: <span className="text-sky-200 uppercase font-semibold">{strategy}</span> • Temp: {temperature}</span>
              <AiTag label={blueResult?.modelUsed || 'gemini-3.7-flash'} size="xs" variant="blue" />
            </div>
          </div>
        </div>

        {/* Defense Status Badge */}
        {isDefending ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-600/60 text-sky-300 text-xs font-mono animate-pulse">
            <Wrench className="w-3 h-3 animate-spin" />
            <span className="font-semibold text-[11px]">HOT-PATCHING...</span>
          </div>
        ) : blueResult ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono bg-sky-950/80 text-sky-300 border border-sky-700/70">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-medium">PATCH STAGED (+{blueResult.diffStats.additions}/-{blueResult.diffStats.deletions})</span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-slate-500">LISTENING</span>
        )}
      </div>

      {/* Breach Signature Identified Box */}
      <div className="p-3 bg-[#090c15] border-b border-[#1a2333]">
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between mb-1">
          <span className="flex items-center gap-1 text-sky-400 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            BREACH SIGNATURE DETECTED:
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 font-mono font-medium">
            {blueResult?.patchStrategy || scenario.defaultPatch.patchStrategy}
          </span>
        </div>
        <p className="text-xs text-slate-200 font-mono leading-relaxed bg-[#0e1320] p-2.5 rounded-lg border border-[#1e273b]">
          {blueResult?.identifiedSignature || 'Monitoring incoming mock HTTP traffic and anomaly logs across microservice routes.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-[#080b13] px-3 pt-2 border-b border-[#1a2333] gap-1 text-xs font-mono">
        <button
          id="blue-triage-tab-btn"
          onClick={() => setActiveTab('triage')}
          className={`px-3 py-1.5 rounded-t-md border-t border-x transition-colors cursor-pointer text-xs ${
            activeTab === 'triage'
              ? 'bg-[#0d121f] text-sky-300 border-sky-800/60 font-semibold shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c101c]'
          }`}
        >
          Attack Triage & Root Cause
        </button>
        <button
          id="blue-traffic-tab-btn"
          onClick={() => setActiveTab('traffic')}
          className={`px-3 py-1.5 rounded-t-md border-t border-x transition-colors cursor-pointer text-xs ${
            activeTab === 'traffic'
              ? 'bg-[#0d121f] text-sky-300 border-sky-800/60 font-semibold shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c101c]'
          }`}
        >
          Traffic Log Stream
        </button>
        <button
          id="blue-patch-strategy-tab-btn"
          onClick={() => setActiveTab('patchStrategy')}
          className={`px-3 py-1.5 rounded-t-md border-t border-x transition-colors cursor-pointer text-xs ${
            activeTab === 'patchStrategy'
              ? 'bg-[#0d121f] text-sky-300 border-sky-800/60 font-semibold shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c101c]'
          }`}
        >
          Zero-Downtime SLA
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-auto bg-[#070910] p-3 text-xs font-mono min-h-[200px] max-h-[340px]">
        {activeTab === 'triage' ? (
          <div className="space-y-3">
            {/* Technical Analysis */}
            <div className="bg-[#0e1320] border border-[#1e273b] p-3 rounded-lg space-y-1.5">
              <div className="text-[10px] text-sky-400 uppercase font-semibold">Triage Analysis:</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {blueResult?.attackAnalysis || 'Blue Agent is analyzing payload structure against TypeScript AST and Express middleware definitions.'}
              </p>
            </div>

            {/* Patch Rationale */}
            <div className="bg-[#0d121f] border border-[#1a2334] p-3 rounded-lg space-y-1.5">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Zero-Downtime Hotfix Rationale:
                </span>
                <AiTag label="AI SYNTHESIZED" size="xs" variant="blue" />
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {blueResult?.rationale || scenario.defaultPatch.rationale}
              </p>
            </div>

            {/* Hotfix Stats */}
            {blueResult && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#0e1320] border border-[#1e273b] p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-semibold">ADDED</div>
                  <div className="text-emerald-400 font-bold mt-0.5">+{blueResult.diffStats.additions} lines</div>
                </div>
                <div className="bg-[#0e1320] border border-[#1e273b] p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-semibold">DELETED</div>
                  <div className="text-rose-400 font-bold mt-0.5">-{blueResult.diffStats.deletions} lines</div>
                </div>
                <div className="bg-[#0e1320] border border-[#1e273b] p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-semibold">FILES</div>
                  <div className="text-cyan-400 font-bold mt-0.5">1 module</div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'traffic' ? (
          <div className="space-y-1.5">
            {/* Synthetic Normal Traffic logs */}
            {scenario.normalTrafficSamples.map((sample, idx) => (
              <div key={idx} className="p-2 rounded-md text-[11px] font-mono bg-[#0e1320] border border-[#1a2333] flex items-start gap-2">
                <span className="text-emerald-400 font-semibold">[LEGIT]</span>
                <span className="text-slate-300">{sample.method} {sample.path}</span>
                <span className="text-slate-500 ml-auto text-[10px]">{sample.name}</span>
              </div>
            ))}

            {/* Red Attack Traffic log */}
            {redResult && (
              <div className="p-2 rounded-md text-[11px] font-mono bg-rose-950/40 border border-rose-900/60 text-rose-300 flex items-start gap-2 animate-pulse">
                <span className="text-rose-400 font-bold">[BREACH]</span>
                <span>{redResult.payload.method} {redResult.payload.path}</span>
                <span className="text-rose-400 ml-auto font-mono text-[10px]">ANOMALY TRIGGER</span>
              </div>
            )}

            {/* Blue Hotpatch logs */}
            {blueResult?.executionLogs.map((log, idx) => (
              <div key={idx} className="p-2 rounded-md text-[11px] font-mono bg-sky-950/40 border border-sky-900/60 text-sky-300 flex items-start gap-2">
                <span className="text-sky-400 font-bold">[PATCH]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="bg-[#0e1320] border border-[#1e273b] p-3 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Zero-Downtime Guarantee:</div>
              <p className="leading-relaxed text-slate-300">
                The hot-patch is dynamically evaluated against synthetic legitimate user traffic samples. If the patch causes any normal user requests to return 4xx/5xx or break expected contract schemas, the Arbiter will penalize the Blue Agent for a Production Outage regression.
              </p>
            </div>
            <div className="bg-[#0d121f] border border-[#1a2334] p-3 rounded-lg">
              <div className="text-[10px] text-cyan-400 uppercase font-semibold mb-1">Regression Baseline:</div>
              <div className="text-[11px] text-slate-400">
                {scenario.normalTrafficSamples.length} automated integration tests verified on every hot-patch injection.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
