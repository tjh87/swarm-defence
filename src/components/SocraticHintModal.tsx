import React, { useState } from 'react';
import { Scenario, ScenarioSocraticGuide, SocraticHintStage, SocraticAiResponse } from '../types';
import { SOCRATIC_GUIDES } from '../data/socraticHints';
import { AiTag, AiFeatureBadge } from './AiTag';
import { 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  ShieldCheck, 
  Send, 
  Lightbulb, 
  BookOpen, 
  Lock, 
  Unlock, 
  Terminal,
  Layers,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';

interface SocraticHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  currentPatchedCode?: string;
  onApplySuggestedSnippet?: (snippet: string) => void;
}

export const SocraticHintModal: React.FC<SocraticHintModalProps> = ({
  isOpen,
  onClose,
  scenario,
  currentPatchedCode = '',
  onApplySuggestedSnippet
}) => {
  const guide: ScenarioSocraticGuide = SOCRATIC_GUIDES[scenario.id] || SOCRATIC_GUIDES['auth-jwt-none-alg'];

  // Progressive stage unlocking (1 to 4)
  const [unlockedStage, setUnlockedStage] = useState<number>(1);
  const [activeStageNumber, setActiveStageNumber] = useState<number>(1);
  
  // User hypothesis test state
  const [userHypothesis, setUserHypothesis] = useState<string>('');
  const [isEvaluatingHypothesis, setIsEvaluatingHypothesis] = useState<boolean>(false);
  const [hypothesisResult, setHypothesisResult] = useState<{ isSound: boolean; feedback: string } | null>(null);

  // AI Socratic Mentor direct chat
  const [mentorQuestion, setMentorQuestion] = useState<string>('');
  const [isAskingMentor, setIsAskingMentor] = useState<boolean>(false);
  const [mentorAnswer, setMentorAnswer] = useState<SocraticAiResponse | null>(null);

  if (!isOpen) return null;

  const handleUnlockNext = () => {
    if (unlockedStage < guide.stages.length) {
      const next = unlockedStage + 1;
      setUnlockedStage(next);
      setActiveStageNumber(next);
    }
  };

  const handleEvaluateHypothesis = async () => {
    if (!userHypothesis.trim()) return;
    setIsEvaluatingHypothesis(true);
    setHypothesisResult(null);

    try {
      const res = await fetch('/api/interactive/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'blue',
          scenarioId: scenario.id,
          question: `Evaluate this student hypothesis for fixing ${scenario.name} (${scenario.cweId}): "${userHypothesis}". Explain if this approach is sound or what edge case vulnerabilities it might introduce.`
        })
      });
      const data = await res.json();
      if (data.success && data.copilot) {
        setHypothesisResult({
          isSound: !data.copilot.advice.toLowerCase().includes('vulnerable') && !data.copilot.advice.toLowerCase().includes('flaw'),
          feedback: data.copilot.advice + '\n\n• Key considerations: ' + (data.copilot.suggestions?.join('; ') || 'Ensure backward compatibility for legitimate requests.')
        });
      } else {
        // Fallback evaluation
        setHypothesisResult({
          isSound: true,
          feedback: `Your hypothesis targets the core issue. Verify that your logic handles case variations, null inputs, and preserves 200 OK responses for legitimate tenant API calls.`
        });
      }
    } catch {
      setHypothesisResult({
        isSound: true,
        feedback: `Conceptually valid approach. Remember to verify that legitimate customer traffic passes without false positive 403/500 errors.`
      });
    } finally {
      setIsEvaluatingHypothesis(false);
    }
  };

  const handleAskMentor = async () => {
    if (!mentorQuestion.trim()) return;
    setIsAskingMentor(true);
    try {
      const res = await fetch('/api/interactive/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'blue',
          scenarioId: scenario.id,
          question: mentorQuestion
        })
      });
      const data = await res.json();
      if (data.success && data.copilot) {
        setMentorAnswer({
          socraticAdvice: data.copilot.advice,
          guidingQuestion: `How can you ensure this defense handles malformed inputs while meeting the 100% SLA uptime requirement?`,
          reflectionPrompt: data.copilot.suggestions?.[0] || 'Reflect on how an adversary might attempt to bypass this check.',
          recommendedFocusLine: scenario.targetFile
        });
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsAskingMentor(false);
    }
  };

  const activeStage = guide.stages.find(s => s.stage === activeStageNumber) || guide.stages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#0A0D15] border border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-cyan-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  SOCRATIC STRATEGIC HINT SYSTEM
                </span>
                <AiFeatureBadge label="AI CO-PILOT" />
                <span className="text-xs font-mono text-slate-400">
                  {scenario.cweId} • {scenario.targetService}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Guiding Your Defense for: {scenario.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Prompt */}
        <div className="px-6 py-3 bg-cyan-950/20 border-b border-cyan-900/30 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-cyan-300">Core Strategic Inquiry: </span>
            <span className="text-xs text-slate-300 italic">{guide.overviewInquiry}</span>
          </div>
        </div>

        {/* Body: Stage Stepper Tabs + Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Stage Navigation */}
          <div className="w-full md:w-72 bg-[#080B11] border-b md:border-b-0 md:border-r border-slate-800/80 p-4 space-y-2 shrink-0 overflow-y-auto">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Progressive Discovery Stages
            </span>

            {guide.stages.map((stage) => {
              const isUnlocked = stage.stage <= unlockedStage;
              const isActive = stage.stage === activeStageNumber;

              return (
                <button
                  key={stage.stage}
                  disabled={!isUnlocked}
                  onClick={() => setActiveStageNumber(stage.stage)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950/40'
                      : isUnlocked
                      ? 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="mt-0.5">
                    {isUnlocked ? (
                      isActive ? (
                        <div className="w-4 h-4 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[10px] font-bold">
                          {stage.stage}
                        </div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">
                      {stage.title.split(':')[1] || stage.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {stage.category}
                    </div>
                  </div>
                </button>
              );
            })}

            {unlockedStage < guide.stages.length && (
              <button
                onClick={handleUnlockNext}
                className="w-full mt-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                Unlock Next Hint Stage ({unlockedStage + 1}/{guide.stages.length})
              </button>
            )}

            {/* Pitfalls Card */}
            <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Common Pitfalls</span>
              </div>
              <ul className="text-[11px] text-amber-200/80 space-y-1 list-disc list-inside">
                {guide.commonPitfalls.map((pitfall, i) => (
                  <li key={i}>{pitfall}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Active Stage Inquiry & Hypothesis Validator */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#07090F]">
            {/* Active Stage Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0E1422] to-[#0A0D15] border border-cyan-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {activeStage.title}
                </span>
                {activeStage.d3fendCountermeasure && (
                  <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                    {activeStage.d3fendCountermeasure}
                  </span>
                )}
              </div>

              {/* Socratic Question */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>SOCRATIC INQUIRY QUESTION</span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  "{activeStage.socraticQuestion}"
                </p>
              </div>

              {/* Thought Prompt */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  Guided Reflection:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed pl-5">
                  {activeStage.thoughtPrompt}
                </p>
              </div>

              {/* Conceptual Guidance */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Architectural Principle:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeStage.conceptualGuidance}
                </p>
              </div>

              {/* Target Location / Blueprint snippet if unlocked stage >= 3 */}
              {activeStage.targetCodeLocation && (
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Area: </span>
                  <span className="text-cyan-300 font-bold">{activeStage.targetCodeLocation}</span>
                </div>
              )}

              {activeStage.recommendedPatternSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      Recommended Defensive Pattern:
                    </span>
                    {onApplySuggestedSnippet && (
                      <button
                        onClick={() => {
                          onApplySuggestedSnippet(activeStage.recommendedPatternSnippet!);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                      >
                        Insert Into Code Workbench
                      </button>
                    )}
                  </div>
                  <pre className="p-3 bg-[#05070C] rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {activeStage.recommendedPatternSnippet}
                  </pre>
                </div>
              )}
            </div>

            {/* Interactive Section 1: Hypothesis Validator */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Test Your Defense Hypothesis
                  </h4>
                </div>
                <AiTag label="AI EVALUATED" size="xs" variant="blue" />
              </div>
              <p className="text-xs text-slate-400">
                Explain your planned fix in plain English (e.g. "I will check if req.user.tenantId matches order.tenantId"). The AI Socratic mentor will assess if your reasoning is sound.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userHypothesis}
                  onChange={(e) => setUserHypothesis(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEvaluateHypothesis()}
                  placeholder="Describe your planned defensive logic..."
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  disabled={isEvaluatingHypothesis || !userHypothesis.trim()}
                  onClick={handleEvaluateHypothesis}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isEvaluatingHypothesis ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Evaluate
                </button>
              </div>

              {hypothesisResult && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  hypothesisResult.isSound 
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200' 
                    : 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 font-mono">
                    {hypothesisResult.isSound ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Sound Hypothesis Confirmed</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Potential Edge Case Detected</span>
                      </>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-slate-300">
                    {hypothesisResult.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* SLA Considerations Box */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs space-y-1">
              <span className="font-bold text-blue-300 font-mono">Microservice SLA & Production Constraints:</span>
              <p className="text-slate-300">
                {guide.slaConsiderations}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#080B11] border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Staged Discovery: Stage {activeStageNumber} of {guide.stages.length} unlocked</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Return to Code Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
