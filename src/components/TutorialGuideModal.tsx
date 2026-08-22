import React, { useState } from 'react';
import { TutorialStep, AppViewTab } from '../types';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  Shield, 
  Users, 
  Flame, 
  Zap, 
  Network, 
  Sliders, 
  Play, 
  CheckCircle2, 
  Lightbulb, 
  BookOpen,
  Scale,
  Activity
} from 'lucide-react';

interface TutorialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AppViewTab) => void;
  currentActiveTab: AppViewTab;
}

export const TutorialGuideModal: React.FC<TutorialGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentActiveTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (TUTORIAL_STEPS[nextIndex].targetTab) {
        onNavigateTab(TUTORIAL_STEPS[nextIndex].targetTab!);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (TUTORIAL_STEPS[prevIndex].targetTab) {
        onNavigateTab(TUTORIAL_STEPS[prevIndex].targetTab!);
      }
    }
  };

  const getStepIcon = (category: string) => {
    switch (category) {
      case 'WELCOME': return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'TEAMS': return <Users className="w-5 h-5 text-purple-400" />;
      case 'RED_ATTACK': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'BLUE_HOTFIX': return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'SOCRATIC_HINTS': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'ARBITER_EVAL': return <Scale className="w-5 h-5 text-emerald-400" />;
      case 'TOPOLOGY_ATTACK_PATH': return <Network className="w-5 h-5 text-blue-400" />;
      case 'MATRIX': return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'ANALYTICS': return <Activity className="w-5 h-5 text-amber-400" />;
      case 'STRATEGY_SELECT': return <Sliders className="w-5 h-5 text-emerald-400" />;
      case 'AGENT_REPLAY': return <Play className="w-5 h-5 text-pink-400 fill-current" />;
      default: return <Compass className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0A0D15] border border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-cyan-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  INTERACTIVE TUTORIAL & DECISION GUIDE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {currentStep.badge}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Exit tutorial anytime"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 pt-3 pb-2 bg-[#080B11] border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-1">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  if (s.targetTab) onNavigateTab(s.targetTab);
                }}
                className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-cyan-400 shadow-md shadow-cyan-400/50'
                    : idx < currentStepIndex
                    ? 'bg-cyan-700'
                    : 'bg-slate-800'
                }`}
                title={`Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 bg-[#07090F] overflow-y-auto max-h-[60vh]">
          {/* Main instruction banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/30 border border-cyan-800/40 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
              {getStepIcon(currentStep.category)}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold font-mono text-cyan-400">Core Guidance:</span>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {currentStep.instruction}
              </p>
            </div>
          </div>

          {/* Detailed help breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Operational Walkthrough</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {currentStep.detailedHelp}
            </p>
          </div>

          {/* Hot Security Tip */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-start gap-3 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 font-mono">Tactical Tip: </span>
              <span className="text-amber-200/90">{currentStep.hotTip}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-[#080B11] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Exit Tutorial Guide
          </button>

          <div className="flex items-center gap-3">
            <button
              disabled={isFirst}
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer"
            >
              <span>{isLast ? 'Complete & Start Playing' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
