import React, { useState } from 'react';
import { Flame, AlertTriangle, Terminal, Send, ShieldAlert, CheckCircle2, XCircle, Code, Eye, FileText } from 'lucide-react';
import { RedAttackResult, Scenario, RedStrategy } from '../types';
import { AiTag, AiFeatureBadge } from './AiTag';

interface RedAgentPanelProps {
  scenario: Scenario;
  redResult?: RedAttackResult;
  strategy: RedStrategy;
  temperature: number;
  isAttacking: boolean;
}

export const RedAgentPanel: React.FC<RedAgentPanelProps> = ({
  scenario,
  redResult,
  strategy,
  temperature,
  isAttacking,
}) => {
  const [activeTab, setActiveTab] = useState<'payload' | 'logs' | 'exfil'>('payload');

  return (
    <div className="bg-[#0c0f18] border border-[#2b171c] rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#200c12] via-[#0f121d] to-[#0c0f18] px-3.5 py-2.5 border-b border-[#2b171c] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#2b0d15] border border-rose-600/50 text-rose-400 shadow-sm">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold font-mono text-rose-300 flex items-center gap-1.5">
              <span>RED AGENT</span>
              <AiFeatureBadge label="AI AGENT" />
              <span className="text-slate-500 text-[10px] font-normal">(Autonomous Attacker)</span>
            </h2>
            <div className="text-[10px] text-rose-400/80 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Strategy: <span className="text-rose-200 uppercase font-semibold">{strategy}</span> • Temp: {temperature}</span>
              <AiTag label={redResult?.modelUsed || 'gemini-3.7-flash'} size="xs" variant="blue" />
            </div>
          </div>
        </div>

        {/* Attack Status Badge */}
        {isAttacking ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs font-mono animate-pulse">
            <Send className="w-3 h-3 animate-bounce" />
            <span className="font-semibold text-[11px]">EXPLOITING...</span>
          </div>
        ) : redResult ? (
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono border ${
              redResult.success
                ? 'bg-rose-950/80 text-rose-300 border-rose-700/70'
                : 'bg-[#151b29] text-slate-300 border-[#222d42]'
            }`}
          >
            {redResult.success ? <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px] font-medium">HTTP {redResult.statusCode} {redResult.success ? 'BREACH' : 'BLOCKED'}</span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-slate-500">IDLE</span>
        )}
      </div>

      {/* Flaw Identified Box */}
      <div className="p-3 bg-[#090c15] border-b border-[#1a2333]">
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between mb-1">
          <span className="flex items-center gap-1 text-rose-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            VULNERABILITY VECTOR DISCOVERED:
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono font-medium">
            {redResult?.cveTag || scenario.cweId}
          </span>
        </div>
        <p className="text-xs text-slate-200 font-mono leading-relaxed bg-[#0e1320] p-2.5 rounded-lg border border-[#1e273b]">
          {redResult?.flawIdentified || scenario.defaultExploit.flawIdentified}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-[#080b13] px-3 pt-2 border-b border-[#1a2333] gap-1 text-xs font-mono">
        <button
          id="red-payload-tab-btn"
          onClick={() => setActiveTab('payload')}
          className={`px-3 py-1.5 rounded-t-md border-t border-x transition-colors cursor-pointer text-xs ${
            activeTab === 'payload'
              ? 'bg-[#0d121f] text-rose-300 border-rose-800/60 font-semibold shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c101c]'
          }`}
        >
          Exploit Payload
        </button>
        <button
          id="red-logs-tab-btn"
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1.5 rounded-t-md border-t border-x transition-colors cursor-pointer text-xs ${
            activeTab === 'logs'
              ? 'bg-[#0d121f] text-rose-300 border-rose-800/60 font-semibold shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c101c]'
          }`}
        >
          Attack Execution Logs ({redResult?.executionLogs.length || 0})
        </button>
        {redResult?.exfiltratedData && (
          <button
            id="red-exfil-tab-btn"
            onClick={() => setActiveTab('exfil')}
            className={`px-3 py-1.5 rounded-t-md border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'exfil'
                ? 'bg-[#0d121f] text-rose-300 border-rose-800/60 font-semibold shadow-sm'
                : 'text-rose-400 border-transparent hover:text-rose-300 hover:bg-[#0c101c]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Exfiltrated Data
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-auto bg-[#070910] p-3 text-xs font-mono min-h-[200px] max-h-[340px]">
        {activeTab === 'payload' ? (
          <div className="space-y-3">
            {/* HTTP Request Header line */}
            <div className="bg-[#0e1320] border border-[#1e273b] p-3 rounded-lg space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-700 font-bold text-xs">
                  {redResult?.payload.method || scenario.defaultExploit.method}
                </span>
                <span className="text-slate-200 font-mono flex-1 truncate text-xs">
                  {redResult?.payload.path || scenario.defaultExploit.path}
                </span>
              </div>

              {/* Headers */}
              {Object.keys(redResult?.payload.headers || scenario.defaultExploit.headers).length > 0 && (
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">HTTP Headers:</div>
                  <div className="bg-[#080b13] p-2.5 rounded-md text-[11px] text-slate-300 space-y-1 border border-[#172033]">
                    {Object.entries(redResult?.payload.headers || scenario.defaultExploit.headers).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-1.5">
                        <span className="text-cyan-400">{k}:</span>
                        <span className="text-amber-300 break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JSON Body */}
              {Object.keys(redResult?.payload.body || scenario.defaultExploit.body).length > 0 && (
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Payload Body (JSON):</div>
                  <pre className="bg-[#080b13] p-2.5 rounded-md text-[11px] text-amber-300 overflow-x-auto border border-[#172033]">
                    {JSON.stringify(redResult?.payload.body || scenario.defaultExploit.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Attack Rationale */}
            <div className="bg-[#0d121f] border border-[#1a2334] p-3 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase mb-1 font-semibold flex items-center justify-between">
                <span>Exploitation Rationale:</span>
                <AiTag label="AI SYNTHESIZED" size="xs" variant="blue" />
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {redResult?.rationale || scenario.defaultExploit.rationale}
              </p>
            </div>
          </div>
        ) : activeTab === 'logs' ? (
          <div className="space-y-1.5">
            {redResult?.executionLogs && redResult.executionLogs.length > 0 ? (
              redResult.executionLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-md text-[11px] font-mono flex items-start gap-2 border ${
                    log.level === 'security'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      : log.level === 'warn'
                      ? 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                      : 'bg-[#0d121f] border-[#182133] text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 text-[10px] select-none">[{log.timestamp.split('T')[1]?.slice(0, 8)}]</span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-8">No execution logs captured yet.</div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-700/60 text-rose-200">
              <div className="font-bold text-xs flex items-center gap-1.5 mb-1.5 text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                SENSITIVE ASSETS EXFILTRATED:
              </div>
              <pre className="p-2.5 rounded bg-black/70 text-rose-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-rose-900/40">
                {redResult?.exfiltratedData}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
