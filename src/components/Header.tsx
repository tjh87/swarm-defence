import React from 'react';
import { Shield, Flame, Scale, Play, Pause, FastForward, Volume2, VolumeX, RefreshCw, Cpu, Layers, Terminal, BookOpen, Sliders, Film, FileText, Users } from 'lucide-react';
import { Phase, CommanderSettings, Scenario } from '../types';
import { sounds } from '../utils/audio';
import { AiFeatureBadge, AiTag } from './AiTag';

interface HeaderProps {
  roundNumber: number;
  phase: Phase;
  phaseTimeRemaining: number;
  phaseDuration: number;
  scores: { red: number; blue: number; draws: number };
  resilienceMetric: number;
  uptimeMetric: number;
  settings: CommanderSettings;
  onUpdateSettings: (newSettings: Partial<CommanderSettings>) => void;
  onNextPhase: () => void;
  onResetSimulation: () => void;
  activeScenario: Scenario;
  onOpenScenarioModal: () => void;
  isAiProcessing: boolean;
  onOpenInteractiveTab?: () => void;
  onOpenTutorial?: () => void;
  onOpenStrategyModal?: () => void;
  onOpenReplay?: () => void;
  onOpenMatchReport?: () => void;
  onOpenStartScreen?: () => void;
  onOpenPresentation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roundNumber,
  phase,
  phaseTimeRemaining,
  phaseDuration,
  scores,
  resilienceMetric,
  uptimeMetric,
  settings,
  onUpdateSettings,
  onNextPhase,
  onResetSimulation,
  activeScenario,
  onOpenScenarioModal,
  isAiProcessing,
  onOpenInteractiveTab,
  onOpenTutorial,
  onOpenStrategyModal,
  onOpenReplay,
  onOpenMatchReport,
  onOpenStartScreen,
  onOpenPresentation,
}) => {
  const percentComplete = Math.max(0, Math.min(100, ((phaseDuration - phaseTimeRemaining) / Math.max(phaseDuration, 1)) * 100));

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sounds.enabled = next;
    onUpdateSettings({ soundEnabled: next });
    if (next) sounds.playTick();
  };

  const getPhaseName = () => {
    switch (phase) {
      case 'INIT':
        return 'T-0s..5s: Scenario Loading';
      case 'RED_ATTACK':
        return 'T-5s..15s: Red Exploit Synth';
      case 'BLUE_DEFENSE':
        return 'T-15s..25s: Blue Hot-Patch';
      case 'ARBITER_EVAL':
        return 'T-25s..30s: Arbiter Verification';
      case 'ROUND_COMPLETE':
        return 'T-30s: Round Cycle Done';
      default:
        return 'Active';
    }
  };

  const getCurrentStageInfo = () => {
    if (phase === 'INIT') {
      return { num: 1, text: '1/4: Target Init', color: 'text-cyan-300' };
    }
    if (phase === 'RED_ATTACK') {
      return { num: 2, text: '2/4: Red Attack', color: 'text-rose-400' };
    }
    if (phase === 'BLUE_DEFENSE') {
      return { num: 3, text: '3/4: Blue Defense', color: 'text-blue-400' };
    }
    if (phase === 'ARBITER_EVAL' || phase === 'ROUND_COMPLETE') {
      return { num: 4, text: '4/4: SLA Verification', color: 'text-emerald-400' };
    }
    if (settings.operatorRole === 'red_attacker') {
      return { num: 2, text: '2/4: Red Attack', color: 'text-rose-400' };
    }
    if (settings.operatorRole === 'blue_defender') {
      return { num: 3, text: '3/4: Blue Defense', color: 'text-blue-400' };
    }
    if (settings.operatorRole === 'arbiter_judge') {
      return { num: 4, text: '4/4: SLA Verification', color: 'text-emerald-400' };
    }
    return { num: 1, text: '1/4: Target Init', color: 'text-cyan-300' };
  };

  const currentStage = getCurrentStageInfo();

  // Dynamic team theme styling based on selected operator role
  const getTeamTheme = () => {
    switch (settings.operatorRole) {
      case 'red_attacker':
        return {
          role: 'red_attacker',
          label: 'RED TEAM',
          Icon: Flame,
          headerBorder: 'border-rose-900/60 shadow-rose-950/20',
          iconBoxBg: 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950/80 border-rose-500/70 text-rose-400 shadow-lg shadow-rose-950/60',
          badge2026Bg: 'bg-rose-950/90 border-rose-500/70 text-rose-300 shadow-sm shadow-rose-950/40',
          accentText: 'text-rose-400',
          targetText: 'text-rose-300 hover:text-rose-200',
          teamBadgeClass: 'bg-rose-950/90 border-rose-500/80 text-rose-300 hover:border-rose-400 shadow-rose-950/50',
          teamIconClass: 'text-rose-400',
          teamSelectBtn: 'from-rose-950/90 via-slate-900 to-rose-900/90 border-rose-500/70 text-rose-300 hover:border-rose-400 shadow-rose-950/40',
        };
      case 'arbiter_judge':
        return {
          role: 'arbiter_judge',
          label: 'AI ARBITER',
          Icon: Scale,
          headerBorder: 'border-purple-900/60 shadow-purple-950/20',
          iconBoxBg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950/80 border-purple-500/70 text-purple-400 shadow-lg shadow-purple-950/60',
          badge2026Bg: 'bg-purple-950/90 border-purple-500/70 text-purple-300 shadow-sm shadow-purple-950/40',
          accentText: 'text-purple-400',
          targetText: 'text-purple-300 hover:text-purple-200',
          teamBadgeClass: 'bg-purple-950/90 border-purple-500/80 text-purple-300 hover:border-purple-400 shadow-purple-950/50',
          teamIconClass: 'text-purple-400',
          teamSelectBtn: 'from-purple-950/90 via-slate-900 to-purple-900/90 border-purple-500/70 text-purple-300 hover:border-purple-400 shadow-purple-950/40',
        };
      case 'blue_defender':
      default:
        return {
          role: 'blue_defender',
          label: 'BLUE TEAM',
          Icon: Shield,
          headerBorder: 'border-cyan-900/60 shadow-cyan-950/20',
          iconBoxBg: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-950/80 border-cyan-500/70 text-cyan-400 shadow-lg shadow-cyan-950/60',
          badge2026Bg: 'bg-cyan-950/90 border-cyan-500/70 text-cyan-300 shadow-sm shadow-cyan-950/40',
          accentText: 'text-cyan-400',
          targetText: 'text-cyan-300 hover:text-cyan-200',
          teamBadgeClass: 'bg-cyan-950/90 border-cyan-500/80 text-cyan-300 hover:border-cyan-400 shadow-cyan-950/50',
          teamIconClass: 'text-cyan-400',
          teamSelectBtn: 'from-cyan-950/90 via-slate-900 to-blue-900/90 border-cyan-500/70 text-cyan-300 hover:border-cyan-400 shadow-cyan-950/40',
        };
    }
  };

  const teamTheme = getTeamTheme();
  const TeamBrandIcon = teamTheme.Icon;

  return (
    <header className={`border-b bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2 transition-colors duration-300 ${teamTheme.headerBorder}`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Row 1 / Left Column: Brand & Target Microservice Info */}
        <div className="flex items-center gap-3 shrink-0 min-w-0 max-w-full">
          <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${teamTheme.iconBoxBg}`}>
            <TeamBrandIcon className="w-5 h-5 animate-pulse" />
          </div>
          
          <div className="flex flex-col justify-center min-w-0">
            {/* Swarm Defense Title, 2026, Simulation Live Status */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-mono flex items-center gap-2">
                SWARM DEFENSE
              </h1>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border tracking-wider shrink-0 transition-all ${teamTheme.badge2026Bg}`}>
                2026
              </span>
              <AiFeatureBadge label="AI SWARM" />
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shrink-0 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SIMULATION LIVE
              </span>
            </div>

            {/* Target microservice & vulnerability details */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              <Cpu className={`w-3.5 h-3.5 shrink-0 transition-colors ${teamTheme.accentText}`} />
              <span className="text-slate-400 font-semibold shrink-0">Scenario:</span>
              <button
                id="target-scenario-badge-btn"
                onClick={onOpenScenarioModal}
                className={`font-mono font-semibold hover:underline cursor-pointer flex items-center gap-1.5 transition-colors truncate ${teamTheme.targetText}`}
                title="Click to switch microservice scenario"
              >
                <span className="font-extrabold text-white">{activeScenario.name}</span>
                <span className="text-cyan-300 font-bold">({activeScenario.targetService})</span>
                <span className="text-slate-400 text-[11px] font-normal font-sans">
                  [{activeScenario.cweId}]
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2 / Center Column: Consolidated Operational Scoreboard Bar */}
        <div className="flex items-center justify-between sm:justify-center gap-2 bg-[#0c1018] border border-[#1b2336] rounded-xl px-3 py-1.5 shadow-inner font-mono text-xs overflow-x-auto shrink-0">
          {/* Active Team / Faction Switcher Badge */}
          {onOpenStartScreen && (
            <button
              id="header-active-faction-btn"
              onClick={onOpenStartScreen}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono text-xs font-extrabold shadow-md transition-all cursor-pointer whitespace-nowrap ${
                settings.operatorRole === 'red_attacker'
                  ? 'bg-rose-950/90 border-rose-500/80 text-rose-300 hover:border-rose-400 shadow-rose-950/50'
                  : settings.operatorRole === 'blue_defender'
                  ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-300 hover:border-cyan-400 shadow-cyan-950/50'
                  : 'bg-purple-950/90 border-purple-500/80 text-purple-300 hover:border-purple-400 shadow-purple-950/50'
              }`}
              title="Click to switch your active operational team"
            >
              <span className="text-slate-400 text-[10px]">TEAM:</span>
              {settings.operatorRole === 'red_attacker' && <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              {settings.operatorRole === 'blue_defender' && <Shield className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
              {settings.operatorRole === 'arbiter_judge' && <Scale className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
              <span className="text-white uppercase font-bold">
                {settings.operatorRole === 'red_attacker'
                  ? 'RED TEAM'
                  : settings.operatorRole === 'blue_defender'
                  ? 'BLUE TEAM'
                  : 'AI ARBITER'}
              </span>
              <span className="text-[9px] bg-black/60 px-1 py-0.2 rounded text-slate-300 border border-slate-700">
                SWITCH
              </span>
            </button>
          )}

          <div className="h-4 w-px bg-[#1f293d] shrink-0" />

          {/* Current Process Stage Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#060912] border border-amber-500/40 text-xs font-mono whitespace-nowrap">
            <span className="text-slate-400 text-[9px] uppercase font-semibold">STAGE:</span>
            <span className={`font-bold flex items-center gap-1 text-[11px] ${currentStage.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              {currentStage.text}
            </span>
          </div>

          <div className="h-4 w-px bg-[#1f293d] shrink-0" />

          {/* Red vs Blue Scores */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="flex items-center gap-1 text-xs font-mono">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-slate-400 text-[10px]">RED:</span>
              <span className="text-xs font-bold text-rose-300 bg-rose-950/70 px-1.5 py-0.5 rounded border border-rose-900/60">{scores.red}</span>
            </div>

            <span className="text-slate-600 font-mono text-[10px] font-bold">VS</span>

            <div className="flex items-center gap-1 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400 text-[10px]">BLUE:</span>
              <span className="text-xs font-bold text-sky-300 bg-sky-950/70 px-1.5 py-0.5 rounded border border-sky-900/60">{scores.blue}</span>
            </div>
          </div>
        </div>

        {/* Row 3 / Right Column: Clean Unified Tool & Playback Control Group */}
        <div className="flex items-center gap-2 justify-center lg:justify-center shrink-0 flex-wrap max-w-full mx-auto lg:mx-0">
          
          {/* Action Modals Toolbar Group */}
          <div className="flex items-center gap-1 bg-[#0c1018] border border-[#1b2336] p-1 rounded-xl shadow-sm flex-wrap max-w-full justify-center">
            {/* Team Select Launcher Button */}
            {onOpenStartScreen && (
              <button
                id="header-open-teams-btn"
                onClick={onOpenStartScreen}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r border text-xs font-mono font-extrabold cursor-pointer transition-all group ${teamTheme.teamSelectBtn}`}
                title="Open Start Screen & Choose Team / Faction"
              >
                <div className="flex items-center -space-x-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400 group-hover:animate-bounce" />
                  <Shield className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-pulse" />
                </div>
                <span className="text-white uppercase font-bold text-[11px]">TEAM SELECT</span>
              </button>
            )}

            {/* Guided AI Tutorial Button */}
            {onOpenTutorial && (
              <button
                id="header-open-tutorial-btn"
                onClick={onOpenTutorial}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-950 via-sky-950 to-blue-950 border border-cyan-400/80 text-cyan-200 hover:text-white text-xs font-mono font-bold shadow-md shadow-cyan-950/60 hover:border-cyan-300 cursor-pointer transition-all animate-pulse"
                title="Launch AI Guided Interactive Tutorial Mode"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-wide">TUTORIAL MODE</span>
                <AiFeatureBadge label="GUIDE" />
              </button>
            )}

            {/* Interactive Architecture Presentation Button */}
            {onOpenPresentation && (
              <button
                id="header-open-presentation-btn"
                onClick={onOpenPresentation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 hover:text-white text-xs font-mono font-bold hover:border-cyan-500 hover:bg-cyan-950/70 cursor-pointer transition-all"
                title="Launch Interactive System Architecture Presentation Walkthrough"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-extrabold uppercase tracking-wide">SYSTEM TOUR</span>
              </button>
            )}

            {/* Strategy Selection Deck Button */}
            {onOpenStrategyModal && (
              <button
                id="header-open-strategy-btn"
                onClick={onOpenStrategyModal}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:text-white text-xs font-mono font-semibold hover:border-purple-500 cursor-pointer transition-all"
                title="Configure Match Attack Vectors & Defense Protocols"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden xl:inline text-[11px]">STRATEGY</span>
              </button>
            )}

            {/* Agent Replay Studio Button */}
            {onOpenReplay && (
              <button
                id="header-open-replay-btn"
                onClick={onOpenReplay}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:text-white text-xs font-mono font-semibold hover:border-amber-500 cursor-pointer transition-all"
                title="Scrub & Replay Match Progression Round-by-Round"
              >
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline text-[11px]">REPLAY</span>
              </button>
            )}

            {/* Match Security Report Modal Button */}
            {onOpenMatchReport && (
              <button
                id="header-open-report-btn"
                onClick={onOpenMatchReport}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:text-white text-xs font-mono font-semibold hover:border-emerald-500 cursor-pointer transition-all"
                title="Generate and Download Offline PDF / JSON Match Security Audit Report"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline text-[11px]">REPORT</span>
              </button>
            )}
          </div>

          {/* Simulation Playback & Timer Bar */}
          <div className="flex items-center gap-1 bg-[#0c1018] border border-[#1b2336] p-1 rounded-xl shadow-sm flex-wrap max-w-full justify-center">
            {/* Round Counter */}
            <div className="px-2 py-1 rounded-lg bg-[#060912] border border-[#1f293d] text-xs font-mono text-center">
              <span className="text-[10px] text-slate-400 font-semibold block leading-none">R#{roundNumber}</span>
              <span className="font-bold text-amber-300 text-[11px] leading-none">{phaseTimeRemaining}s</span>
            </div>

            {/* Play/Pause Toggle */}
            <button
              id="sim-autoplay-toggle-btn"
              onClick={() => onUpdateSettings({ autoLoop: !settings.autoLoop })}
              className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1 font-mono transition-all cursor-pointer ${
                settings.autoLoop
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900/80'
                  : 'bg-amber-950/90 text-amber-300 border border-amber-600/60 hover:bg-amber-900/80'
              }`}
              title={settings.autoLoop ? 'Auto Loop Active (30s sequential rounds)' : 'Simulation Paused / Manual Step Mode'}
            >
              {settings.autoLoop ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-bold">{settings.autoLoop ? 'Auto' : 'Paused'}</span>
            </button>

            {/* Speed Toggle */}
            <button
              id="sim-speed-btn"
              onClick={() => {
                const speeds: ('30s' | '15s' | '5s' | 'step')[] = ['30s', '15s', '5s', 'step'];
                const nextIdx = (speeds.indexOf(settings.simulationSpeed) + 1) % speeds.length;
                onUpdateSettings({ simulationSpeed: speeds[nextIdx] });
              }}
              className="px-2 py-1.5 rounded-lg text-xs bg-[#121826] text-slate-300 hover:bg-[#1a2336] hover:text-white font-mono flex items-center gap-1 transition-colors cursor-pointer border border-[#1f2a3f]"
              title="Toggle round speed"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold">{settings.simulationSpeed}</span>
            </button>

            {/* Next Step Button */}
            <button
              id="sim-step-next-btn"
              onClick={onNextPhase}
              disabled={isAiProcessing}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-cyan-950/90 border border-cyan-700/80 text-cyan-300 hover:bg-cyan-900/90 font-mono disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1"
              title="Advance to next phase"
            >
              {isAiProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span className="text-[11px] font-extrabold">Step &gt;&gt;</span>}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
