import React, { useState } from 'react';
import { Code2, GitCompare, FileCode, CheckCircle, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';
import { Scenario, BlueDefenseResult } from '../types';
import { AiTag, AiFeatureBadge } from './AiTag';

interface CodeWorkbenchProps {
  scenario: Scenario;
  blueResult?: BlueDefenseResult;
  isPatched: boolean;
}

export const CodeWorkbench: React.FC<CodeWorkbenchProps> = ({
  scenario,
  blueResult,
  isPatched,
}) => {
  const [activeTab, setActiveTab] = useState<'vulnerable' | 'diff' | 'patched' | 'spec'>('vulnerable');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveCode = () => {
    if (activeTab === 'vulnerable') return scenario.vulnerableCode;
    if (activeTab === 'diff') return blueResult?.unifiedDiff || scenario.defaultPatch.patchedCode;
    if (activeTab === 'patched') return blueResult?.patchedCode || scenario.defaultPatch.patchedCode;
    return JSON.stringify(scenario.apiDoc, null, 2);
  };

  // Format and colorize unified diff lines
  const renderDiffContent = (diffText: string) => {
    if (!diffText) {
      return (
        <div className="text-slate-500 italic p-6 text-center font-mono text-xs">
          [Awaiting Phase 3: Blue Agent hotfix synthesis to generate unified diff patch...]
        </div>
      );
    }

    const lines = diffText.split('\n');
    return (
      <div className="font-mono-code text-xs leading-5">
        {lines.map((line, idx) => {
          let lineClass = 'text-slate-300';
          let bgClass = '';
          if (line.startsWith('+') && !line.startsWith('+++')) {
            lineClass = 'text-emerald-300 font-medium';
            bgClass = 'bg-emerald-950/40 border-l-2 border-emerald-500 pl-2';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            lineClass = 'text-red-400 line-through opacity-80';
            bgClass = 'bg-red-950/30 border-l-2 border-red-500 pl-2';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-cyan-400 font-bold';
            bgClass = 'bg-cyan-950/30 py-1 pl-2 text-cyan-300';
          } else {
            bgClass = 'pl-2.5';
          }

          return (
            <div key={idx} className={`flex items-start ${bgClass} hover:bg-slate-800/40`}>
              <span className="w-8 select-none text-right pr-3 text-slate-600 text-[11px]">{idx + 1}</span>
              <pre className={`flex-1 overflow-x-auto ${lineClass}`}>{line || ' '}</pre>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#0c0f18] border border-[#1a2333] rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
      {/* Header bar with tabs */}
      <div className="bg-[#090c14] px-3 py-2 border-b border-[#1a2333] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="tab-vulnerable-code-btn"
            onClick={() => setActiveTab('vulnerable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'vulnerable'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121828]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-rose-400" />
            <span>Vulnerable Target</span>
          </button>

          <button
            id="tab-diff-patch-btn"
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'diff'
                ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121828]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-sky-400" />
            <span>Blue Unified Diff</span>
            <AiFeatureBadge label="AI DIFF" />
            {blueResult && (
              <span className="text-[10px] px-1 rounded bg-sky-900 text-sky-200 font-bold">
                +{blueResult.diffStats.additions}/-{blueResult.diffStats.deletions}
              </span>
            )}
          </button>

          <button
            id="tab-patched-code-btn"
            onClick={() => setActiveTab('patched')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'patched'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121828]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Post-Patch Sandbox</span>
            {isPatched && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            id="tab-api-spec-btn"
            onClick={() => setActiveTab('spec')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'spec'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121828]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Route Specification</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            File: <span className="text-slate-300 font-medium">{scenario.targetFile}</span>
          </span>
          <button
            id="copy-code-btn"
            onClick={() => handleCopy(getActiveCode())}
            className="p-1.5 rounded-md bg-[#141b2b] hover:bg-[#1c263c] text-slate-400 hover:text-slate-200 transition-colors border border-[#212c44] cursor-pointer"
            title="Copy snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Target File Info Banner */}
      <div className="bg-[#0a0e18] px-3.5 py-1.5 border-b border-[#182133] flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-[#161f31] text-slate-300 text-[10px] font-medium border border-[#222f4b]">
            {scenario.category}
          </span>
          <span className="text-slate-200 font-semibold">{scenario.name}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-900/60 font-medium">
          {scenario.cweId} • {scenario.severity}
        </span>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 overflow-auto bg-[#070910] p-2 min-h-[280px] max-h-[460px] relative">
        {activeTab === 'diff' ? (
          renderDiffContent(blueResult?.unifiedDiff || '')
        ) : activeTab === 'spec' ? (
          <div className="p-3 text-xs font-mono space-y-3">
            <div className="bg-[#0e1320] border border-[#1e273b] p-3 rounded-lg">
              <div className="text-slate-400 mb-1 text-[11px] font-semibold">ENDPOINT DEFINITION</div>
              <div className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
                  {scenario.apiDoc.method}
                </span>
                <span>{scenario.apiDoc.endpoint}</span>
              </div>
              <p className="text-slate-300 mt-2 text-xs leading-relaxed">{scenario.apiDoc.purpose}</p>
            </div>

            <div className="bg-[#0e1320] border border-[#1e273b] p-3 rounded-lg">
              <div className="text-slate-400 mb-1 text-[11px] font-semibold">EXPECTED PARAMETERS / HEADERS</div>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-xs">
                {scenario.apiDoc.expectedParams.map((p, i) => (
                  <li key={i} className="text-amber-300 font-mono">{p}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0e1320] border border-[#1e273b] p-3 rounded-lg">
              <div className="text-slate-400 mb-1 text-[11px] font-semibold">MOCK HTTP REQUEST SAMPLE</div>
              <pre className="bg-[#080b13] p-2.5 rounded text-slate-300 overflow-x-auto text-[11px] border border-[#172033]">
                {scenario.apiDoc.sampleRequest}
              </pre>
            </div>
          </div>
        ) : (
          <div className="font-mono-code text-xs leading-5">
            {getActiveCode().split('\n').map((line, idx) => {
              const isVulnHighlight = line.includes('VULNERABILITY:') || line.includes('SECURITY PATCH:');
              return (
                <div
                  key={idx}
                  className={`flex items-start ${
                    isVulnHighlight ? 'bg-amber-950/30 border-l-2 border-amber-400 pl-2 text-amber-200' : 'pl-3'
                  } hover:bg-[#121828]/50`}
                >
                  <span className="w-8 select-none text-right pr-3 text-slate-600 text-[11px]">{idx + 1}</span>
                  <pre className="flex-1 overflow-x-auto text-slate-300 whitespace-pre">{line || ' '}</pre>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#090c14] px-3 py-1.5 border-t border-[#1a2333] flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span>Sandbox Runtime: <span className="text-cyan-400 font-medium">Node VM Isolated Context</span></span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Zero-Downtime Hot-Patching Active</span>
        </div>
      </div>
    </div>
  );
};
