import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Cpu, 
  Shield, 
  Flame, 
  Zap, 
  Scale, 
  Terminal, 
  Activity, 
  Network, 
  Layers, 
  Code2, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  CheckCircle, 
  Play, 
  FileText, 
  HelpCircle,
  Database,
  Sliders,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface InteractiveGuidePresentationProps {
  isOpen: boolean;
  onClose: () => void;
}

type SlideId = 'overview' | 'blueprint' | 'lifecycle' | 'agents' | 'how-to-use';

export const InteractiveGuidePresentation: React.FC<InteractiveGuidePresentationProps> = ({ isOpen, onClose }) => {
  const [activeSlide, setActiveSlide] = useState<SlideId>('overview');
  const [selectedComponent, setSelectedComponent] = useState<string>('workbench');
  const [selectedPhase, setSelectedPhase] = useState<string>('RED_ATTACK');

  if (!isOpen) return null;

  const slides: { id: SlideId; label: string }[] = [
    { id: 'overview', label: '1. Executive Architecture' },
    { id: 'blueprint', label: '2. Component Blueprint' },
    { id: 'lifecycle', label: '3. Simulation Lifecycle' },
    { id: 'agents', label: '4. AI Agent Cognitive Stack' },
    { id: 'how-to-use', label: '5. Commander Guide' },
  ];

  const handleNextSlide = () => {
    const currentIndex = slides.findIndex(s => s.id === activeSlide);
    if (currentIndex < slides.length - 1) {
      setActiveSlide(slides[currentIndex + 1].id);
    }
  };

  const handlePrevSlide = () => {
    const currentIndex = slides.findIndex(s => s.id === activeSlide);
    if (currentIndex > 0) {
      setActiveSlide(slides[currentIndex - 1].id);
    }
  };

  // Component metadata for the Component Blueprint Explorer
  const componentDetails: Record<string, {
    title: string;
    icon: React.ReactNode;
    role: string;
    inputs: string[];
    outputs: string[];
    underTheHood: string;
    techStack: string[];
  }> = {
    header: {
      title: "Header Control Center",
      icon: <Terminal className="w-5 h-5 text-cyan-400" />,
      role: "Global orchestration dashboard housing team selection, live speed config, simulation controls, and Socratic mode triggers.",
      inputs: ["User action clicks", "Simulation round state"],
      outputs: ["Active simulation speed", "Current strategy modes", "Modal triggers"],
      underTheHood: "Monitors and coordinates global state flags like current active scenario, team preferences (Blue Team Socratic helper vs fully automated agent), and playback clock intervals.",
      techStack: ["React Context", "Lucide Icons", "Tailwind CSS Layouts"]
    },
    orchestrator: {
      title: "Simulation Phase Orchestrator",
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      role: "Visual timelines and state progress trackers mapping active simulation stages dynamically.",
      inputs: ["Phase countdown timer", "Active simulation status"],
      outputs: ["UI render updates", "Phase transition callbacks"],
      underTheHood: "Drives standard countdown intervals from INIT -> RED_ATTACK -> BLUE_DEFENSE -> EVALUATION using a deterministic state machine.",
      techStack: ["CSS Grid Transitions", "React Hooks", "HTML5 Canvas/SVG Progress Indicators"]
    },
    workbench: {
      title: "Blue Agent Code Workbench",
      icon: <Code2 className="w-5 h-5 text-emerald-400" />,
      role: "Interactive code window showing live vulnerable service microservice files alongside simulated hotfixes.",
      inputs: ["Active Scenario source code", "Blue Agent defensive recommendation"],
      outputs: ["Synthesized patch files", "Diff highlighted viewports"],
      underTheHood: "Renders highlighted source code segments. Synthesizes recommendations into complete unified diffs, displaying side-by-side or inline modifications.",
      techStack: ["Monaco Editor Engine", "React Diff Viewer", "Dynamic Line-by-Line Refactor Parsers"]
    },
    redAgent: {
      title: "Red Agent Exploitation Console",
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      role: "Terminal window displaying exploitation strategies, payloads, and automated AI terminal execution logs.",
      inputs: ["Target microservice vulnerability meta", "Red Strategy profile (APT vs Script Kiddie)"],
      outputs: ["Active exploit payloads", "OWASP classification maps"],
      underTheHood: "Emulates adversary shell logs, displaying synthesized CVE payloads, command-line arguments, and visual exploit outcomes.",
      techStack: ["Terminal Shell Emulators", "MITRE ATT&CK Schema", "Streaming Text Output Handlers"]
    },
    blueAgent: {
      title: "Blue Agent Defensive Terminal",
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      role: "Secure console illustrating hotfix generation, diagnostic scanning, and secure compilation logs.",
      inputs: ["Exploit payloads", "Vulnerable code context"],
      outputs: ["Defensive strategy selection", "Compilation results"],
      underTheHood: "Models defensive engineer workflows, tracing syntax-tree reviews, defensive patching steps, and patch compilation logs.",
      techStack: ["Static Code Analyzers", "Secure Compilation Logs", "Syntax Tree Checkers"]
    },
    arbiter: {
      title: "Arbiter Evaluation Chamber",
      icon: <Scale className="w-5 h-5 text-purple-400" />,
      role: "The ultimate judge - evaluates whether the Blue Team's hotfix successfully containerized and mitigated the Red Team's exploit payload.",
      inputs: ["Exploit script", "Applied secure hotfix patch", "Vulnerable source code"],
      outputs: ["Round decision (Red Victory, Blue Victory, or Draw)", "Score updates", "Detailed Socratic evaluation logs"],
      underTheHood: "Leverages Gemini API server-side logic to run automated sandboxed compilation tests, verifying whether the patch compiled, closed the target CWE, and preserved core business logic.",
      techStack: ["Gemini 2.5/1.5 Flash Reasoning", "Safety Assertion Testing", "Unified Diff Validation Algorithms"]
    },
    threatTelemetry: {
      title: "Threat Telemetry Dashboard",
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      role: "Analytical graphical charts showing risk profiles, exploit latency graphs, and live threat event logs.",
      inputs: ["Live simulation round logs", "Dynamic score counters"],
      outputs: ["Dynamic SVG charts", "Real-time threat feeds"],
      underTheHood: "Aggregates simulation history records to compute live indicators like service resilience, zero-day threat logs, and latency.",
      techStack: ["Recharts Library", "D3 Mathematical SVG Pathing", "Local Simulation History Stores"]
    },
    topology: {
      title: "Interactive Topology Graph",
      icon: <Network className="w-5 h-5 text-cyan-400" />,
      role: "Node-link visualization showing all network microservices, current firewalls, and active attack vectors.",
      inputs: ["Target service", "Active attack phase", "Applied mitigation"],
      outputs: ["Visual node highlights", "Packet transmission animations"],
      underTheHood: "Draws visual nodes representing authentication, billing, search, and container ingress. Triggers packet flows (red packets for attacks, green for patches).",
      techStack: ["HTML5 Canvas Rendering", "D3 Force Layout Simulation", "CSS Glow Path Keyframes"]
    }
  };

  // Phase metadata for Simulation Lifecycle Slide
  const phaseDetails: Record<string, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
    process: string;
    deliverables: string[];
    technicalDetail: string;
  }> = {
    INIT: {
      title: "Initialize Cyber Range (INIT)",
      subtitle: "Scenario Provisioning & Attack Vector Binding",
      icon: <Database className="w-5 h-5 text-sky-400" />,
      colorClass: "border-sky-500/40 bg-sky-950/25",
      process: "Retrieves target scenario data (CWE, OWASP Category, CVSS rating, and original raw source code files) from the application state store.",
      deliverables: ["Active Scenario Profile", "Vulnerable Target Service Binding", "Initial 100% SLA Uptime Baseline"],
      technicalDetail: "Spins up the state machine, resetting the local round workspace. Fetches the corresponding source file from the secure asset tree and renders it cleanly inside the Blue Agent Code Workbench."
    },
    RED_ATTACK: {
      title: "Adversary Exploitation (RED_ATTACK)",
      subtitle: "Red Agent Exploitation Sequence",
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      colorClass: "border-rose-500/40 bg-rose-950/25",
      process: "The adversarial AI analyzes the targeted microservice endpoint, synthesizes custom exploit payloads (e.g. SQLi statements, RCE shell scripts, BOLA parameters), and initiates the network assault.",
      deliverables: ["MITRE ATT&CK technique mapping", "Exploit shell commands", "Active cyber threat events logged on telemetry"],
      technicalDetail: "Synthesizes the payload by passing the vulnerable code segment and selected adversary aggression level to the AI agent. The terminal console simulates live payload transmission directly toward the vulnerable target node."
    },
    BLUE_DEFENSE: {
      title: "Defensive Hotfix Synthesis (BLUE_DEFENSE)",
      subtitle: "Blue Agent Remediation Engine",
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      colorClass: "border-cyan-500/40 bg-cyan-950/25",
      process: "The defensive AI acts as a security engineer, reviewing the vulnerabilities, evaluating red team shell activity, and compiling structural patch recommendations.",
      deliverables: ["Diagnostic code analysis", "Unified diff code patch files", "Applied defense tactics logs"],
      technicalDetail: "Analyzes the vulnerable AST and applies input sanitization, JWT validation, or bounds checking. If Socratic mode is active, the simulator pauses here, enabling interactive hints and manual strategy overrides before finalizing the patch."
    },
    EVALUATION: {
      title: "Arbiter Consensus Decision (EVALUATION)",
      subtitle: "The Ultimate Verification Phase",
      icon: <Scale className="w-5 h-5 text-purple-400" />,
      colorClass: "border-purple-500/40 bg-purple-950/25",
      process: "The Arbiter Evaluation engine receives inputs from both sides. It simulates exploit execution against the newly-patched codebase to check for containment.",
      deliverables: ["Compilation verification logs", "Functional business-logic preservation checks", "Score assignments (Red/Blue/Draw)"],
      technicalDetail: "Determines outcomes programmatically: Blue wins if the patch compiles, blocks the vulnerability, and keeps functional business code intact. Red wins if the patch fails or leaves the vulnerability open. Draw occurs if business logic is disrupted or patch breaks compilation."
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030509]/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-6xl bg-[#080C14] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[92vh]">
        
        {/* Title Bar Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0C1220] via-cyan-950/40 to-[#0C1220] border-b border-cyan-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  SYSTEM PRESENTATION
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Interactive Simulator Architecture & Components Guide
                </span>
              </div>
              <h2 className="text-lg font-black tracking-wide text-white mt-0.5">
                AI Cyber Range: How Under-The-Hood Mechanics Work
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
            title="Close presentation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Presentation Navigation Slideshow Tabs */}
        <div className="px-6 py-2 bg-[#05080E] border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {slides.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSlide(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap border transition-all cursor-pointer ${
                activeSlide === s.id
                  ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/60 shadow-inner'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Dynamic Slide Content viewport */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#06090F] space-y-6 max-h-[64vh]">
          
          {/* SLIDE 1: EXECUTIVE ARCHITECTURE OVERVIEW */}
          {activeSlide === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono">
                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                    <span>Real-Time Autonomous Threat Simulation</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    Dual-Agent Defensive Cybersecurity Range
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    This simulator implements a state-of-the-art **AI vs AI (Adversary vs Defender) Autonomous Cyber Range**. 
                    Using the **Gemini Cognitive Execution Pipeline**, our server-side controllers orchestrate structured operations 
                    representing full-scale microservice security incidents.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Unlike standard cybersecurity tutorials that rely on static text descriptions, this range emulates code-level attacks, 
                    synthesizes target exploit payloads in real-time, runs static tree verification scans, and evaluates the containment 
                    effectiveness of applied patches under high-stress scenarios.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold mb-1">
                        <Flame className="w-4 h-4" />
                        <span>Adversarial AI Stack</span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans">
                        Acts as the malicious actor (Red Agent), applying specific MITRE ATT&CK patterns dynamically scaled to targeted assets.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
                        <Shield className="w-4 h-4" />
                        <span>Mitigation & Patching Engine</span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans">
                        Acts as the defense architect (Blue Agent), reviewing vulnerable structures and formulating secure code refactoring patches.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1220] to-[#05080E] border border-cyan-900/60 shadow-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                      System Topology Node Data
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs text-slate-400 font-sans">Deployment Model</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">Google Gemini</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs text-slate-400 font-sans">Vulnerability Matrix</span>
                        <span className="text-xs font-mono font-bold text-purple-400">OWASP Top 10 API</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs text-slate-400 font-sans">Persistence Stack</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">State synchronization</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-sans">Visual Framework</span>
                        <span className="text-xs font-mono font-bold text-white">Vite, React 18+</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-center">
                    <div className="text-xs text-cyan-300 font-bold mb-0.5">Under-The-Hood Mechanics</div>
                    <p className="text-[10px] text-slate-400">
                      The core simulator runs entirely inside deterministic client-side state models, leveraging prompt schemas in `/src/utils` & dynamic server components.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: COMPONENT BLUEPRINT MAP */}
          {activeSlide === 'blueprint' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-slate-300 font-sans">
                Click on any of the app sections in the interactive schematic below to see an explanation of what that component does, its inputs, outputs, and internal algorithms.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual App Layout Schematic Mockup */}
                <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col space-y-2 relative shadow-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute top-2.5 right-3.5">
                    Interactive Application Map
                  </div>
                  
                  {/* Mock Header */}
                  <button 
                    onClick={() => setSelectedComponent('header')}
                    className={`w-full p-2.5 rounded-lg border text-left font-mono transition-all duration-300 ${
                      selectedComponent === 'header' 
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-inner ring-1 ring-cyan-400/30' 
                        : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Header Controls & Options Toolbar
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1 py-0.5 rounded">Click to inspect</span>
                    </div>
                  </button>

                  {/* Mock Orchestrator */}
                  <button 
                    onClick={() => setSelectedComponent('orchestrator')}
                    className={`w-full p-2 rounded-lg border text-left font-mono transition-all duration-300 ${
                      selectedComponent === 'orchestrator' 
                        ? 'border-amber-400 bg-amber-950/40 shadow-inner ring-1 ring-amber-400/30' 
                        : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Simulation Phase Orchestrator Timeline Bar
                      </span>
                    </div>
                  </button>

                  {/* Main Grid Mockup */}
                  <div className="grid grid-cols-3 gap-2 h-56">
                    
                    {/* Left Column (Red Panel & Attack Path Map) */}
                    <div className="flex flex-col gap-2 h-full">
                      <button 
                        onClick={() => setSelectedComponent('redAgent')}
                        className={`flex-1 p-2 rounded-lg border text-left font-mono transition-all duration-300 flex flex-col justify-between ${
                          selectedComponent === 'redAgent' 
                            ? 'border-rose-400 bg-rose-950/40 shadow-inner' 
                            : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-rose-400 block">Red Adversary Panel</span>
                        <div className="w-full h-1 bg-rose-950 rounded-full overflow-hidden mt-1"><div className="w-2/3 h-full bg-rose-500 animate-pulse"></div></div>
                      </button>

                      <button 
                        onClick={() => setSelectedComponent('topology')}
                        className={`flex-1 p-2 rounded-lg border text-left font-mono transition-all duration-300 flex flex-col justify-between ${
                          selectedComponent === 'topology' 
                            ? 'border-cyan-400 bg-cyan-950/40 shadow-inner' 
                            : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-cyan-400 block">Topology / Network Graph</span>
                        <div className="flex items-center gap-1 justify-center py-2">
                          <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                          <div className="w-4 h-0.5 bg-slate-700"></div>
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                        </div>
                      </button>
                    </div>

                    {/* Middle Column (Code Workbench & Arbiter) */}
                    <div className="flex flex-col gap-2 h-full">
                      <button 
                        onClick={() => setSelectedComponent('workbench')}
                        className={`flex-1 p-2 rounded-lg border text-left font-mono transition-all duration-300 flex flex-col justify-between ${
                          selectedComponent === 'workbench' 
                            ? 'border-emerald-400 bg-emerald-950/40 shadow-inner' 
                            : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-emerald-400 block">Code Workbench (Diff Viewer)</span>
                        <span className="text-[9px] text-slate-500 block leading-tight mt-1">const sanitize = (data) =&gt; ...</span>
                      </button>

                      <button 
                        onClick={() => setSelectedComponent('arbiter')}
                        className={`p-2 rounded-lg border text-left font-mono transition-all duration-300 flex flex-col justify-between ${
                          selectedComponent === 'arbiter' 
                            ? 'border-purple-400 bg-purple-950/40 shadow-inner' 
                            : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-purple-400 block">Arbiter Evaluation Chamber</span>
                        <span className="text-[8px] text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded text-center block mt-1">Verdict Consensus</span>
                      </button>
                    </div>

                    {/* Right Column (Blue Panel & Threat Telemetry Charts) */}
                    <div className="flex flex-col gap-2 h-full">
                      <button 
                        onClick={() => setSelectedComponent('blueAgent')}
                        className={`flex-1 p-2 rounded-lg border text-left font-mono transition-all duration-300 flex flex-col justify-between ${
                          selectedComponent === 'blueAgent' 
                            ? 'border-blue-400 bg-blue-950/40 shadow-inner' 
                            : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-blue-400 block">Blue Defense Console</span>
                        <div className="w-full h-1 bg-blue-950 rounded-full overflow-hidden mt-1"><div className="w-1/2 h-full bg-blue-400"></div></div>
                      </button>

                      <button 
                        onClick={() => setSelectedComponent('threatTelemetry')}
                        className={`flex-1 p-2 rounded-lg border text-left font-mono transition-all duration-300 flex flex-col justify-between ${
                          selectedComponent === 'threatTelemetry' 
                            ? 'border-indigo-400 bg-indigo-950/40 shadow-inner' 
                            : 'border-slate-800 bg-[#0C1220]/70 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-indigo-400 block">Threat Telemetry & Charts</span>
                        <span className="text-[8px] text-slate-500 font-sans block text-center py-2">Recharts Dashboard View</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Selected Component Description Pane */}
                <div className="p-5 rounded-2xl bg-[#090F1B] border border-cyan-800/40 shadow-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        {componentDetails[selectedComponent].icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Selected Panel</div>
                        <h4 className="text-md font-bold text-white tracking-wide">{componentDetails[selectedComponent].title}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {componentDetails[selectedComponent].role}
                    </p>

                    <div className="border-t border-slate-800/80 pt-3 space-y-2.5">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Inputs / Subscribed State:</span>
                        <div className="flex flex-wrap gap-1">
                          {componentDetails[selectedComponent].inputs.map((inp, idx) => (
                            <span key={idx} className="text-[10px] font-sans px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {inp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Outputs / Emitted Triggers:</span>
                        <div className="flex flex-wrap gap-1">
                          {componentDetails[selectedComponent].outputs.map((out, idx) => (
                            <span key={idx} className="text-[10px] font-sans px-2 py-0.5 rounded bg-cyan-950 border border-cyan-900/60 text-cyan-300 font-mono">
                              {out}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800/60 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-black block">Operational Logic:</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {componentDetails[selectedComponent].underTheHood}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Tech Stack:</span>
                    <span className="text-slate-200 font-bold">{componentDetails[selectedComponent].techStack.join(' + ')}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SLIDE 3: SIMULATION STATE LIFECYCLE */}
          {activeSlide === 'lifecycle' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-slate-300 font-sans">
                The simulator works like an autonomous round-based cyber wargaming machine. It runs in four core phases sequentially, driven by an interval timer. Click on each phase to explore the operations:
              </p>

              {/* Lifecycle Flow Horizontal Chain */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(phaseDetails).map((ph, idx) => (
                  <button
                    key={ph}
                    onClick={() => setSelectedPhase(ph)}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                      selectedPhase === ph
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/20'
                        : 'border-slate-800 bg-[#0C1220]/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${selectedPhase === ph ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {phaseDetails[ph].icon}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">Phase {idx + 1}</span>
                      </div>
                      <h4 className="text-xs font-mono font-bold text-white tracking-wide">{ph}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{phaseDetails[ph].title}</p>
                    </div>
                    {selectedPhase === ph && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-cyan-400 rounded-t-full shadow shadow-cyan-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Phase Details */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#0A0F1D]/80 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-cyan-400 tracking-wide uppercase">
                      Current Inspected Stage
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {phaseDetails[selectedPhase].title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 italic">
                      {phaseDetails[selectedPhase].subtitle}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Core Orchestrator Process:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {phaseDetails[selectedPhase].process}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-900/40 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 block">Programmatic Payload Sequence</span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {phaseDetails[selectedPhase].technicalDetail}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-400 block uppercase tracking-wider">
                      Stage Deliverables
                    </span>
                    <ul className="space-y-2 text-xs">
                      {phaseDetails[selectedPhase].deliverables.map((deliv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                    Orchestrated by `/src/App.tsx` state loop.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: AGENT COGNITIVE STACK */}
          {activeSlide === 'agents' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
              <p className="text-sm text-slate-300">
                The absolute highlight of this system is the autonomous interaction between Gemini reasoning models. Below is an engineering overview of how prompts are framed, parsed, and validated:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* Red Agent Cognitive Flow */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-900/60 text-rose-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-rose-400 font-bold uppercase tracking-widest block text-[9px]">
                        Red Team Architecture
                      </span>
                      <h4 className="text-sm font-extrabold text-white">Adversary LLM Pipeline</h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px]">Cognitive Instructions:</span>
                    <p className="text-slate-300 leading-relaxed bg-[#0A0D15] p-3 rounded-lg border border-slate-900 font-mono text-[11px]">
                      "Analyze target microservice architecture. Formulate a functional exploit script matching MITRE technique {`{techniqueId}`} targeting CWE {`{cweId}`}. Render exploit outcome and log messages. Output JSON containing precise exploit payload."
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px]">State Adaptability:</span>
                    <p className="text-slate-400 leading-relaxed">
                      Inputs include aggression levels (1-5) and specific strategy vectors (APT, insider threat, script kiddie, SQLi injection).
                    </p>
                  </div>
                </div>

                {/* Blue Agent Cognitive Flow */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-900/60 text-cyan-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-cyan-400 font-bold uppercase tracking-widest block text-[9px]">
                        Blue Team Architecture
                      </span>
                      <h4 className="text-sm font-extrabold text-white">Defender LLM Pipeline</h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px]">Cognitive Instructions:</span>
                    <p className="text-slate-300 leading-relaxed bg-[#0A0D15] p-3 rounded-lg border border-slate-900 font-mono text-[11px]">
                      "Review vulnerability profile and active exploit script. Formulate a secure refactoring patch targeting the vulnerable source code. Preserve standard business logic functionality. Output patch diff file."
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px]">State Adaptability:</span>
                    <p className="text-slate-400 leading-relaxed">
                      Socratic Mode inserts human-guided heuristics before compilation, preventing fully automated mistakes and displaying structured suggestions.
                    </p>
                  </div>
                </div>

              </div>

              {/* Arbiter Consensus Engine Explanation */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-purple-950/20 border border-purple-900/40 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-black uppercase">
                  <Scale className="w-5 h-5" />
                  <span>The Arbiter consensus Engine</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Arbiter evaluates the battle. It is a decoupled, highly strict security validation model running on **Gemini Core**. It verifies:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-purple-300 font-mono font-bold mb-1">1. Compilation Integrity</div>
                    <p className="text-[10px] text-slate-400">Ensures the Blue Agent's refactored patch contains zero syntax errors or parsing defects.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-purple-300 font-mono font-bold mb-1">2. Vulnerability Mitigation</div>
                    <p className="text-[10px] text-slate-400">Asserts that the patch securely prevents the Red payload from compromising memory, data, or privileges.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-purple-300 font-mono font-bold mb-1">3. Logic Preservation</div>
                    <p className="text-[10px] text-slate-400">Ensures the developer didn't simply comment out code or break normal microservice query flows.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: USER COMMANDER GUIDE */}
          {activeSlide === 'how-to-use' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-sans">
              <p className="text-sm text-slate-300">
                As the **Cyber Range Commander**, you have multiple visual tools and dials to control, monitor, and influence the simulation:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* Visual Telemetry Controls */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
                    <Sliders className="w-4 h-4" />
                    <span>Influence Simulator Strategies</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Click **STRATEGY** in the header to modify tactics. Adjust Red Aggression or defensive strictly levels, changing Agent prompt outputs dynamically.
                  </p>
                  <ul className="space-y-1 text-slate-300 list-disc pl-4">
                    <li>Choose insider threat or API fuzzing strategies.</li>
                    <li>Toggle strict parsing, dependency analysis, or secure coding frameworks.</li>
                  </ul>
                </div>

                {/* Socratic Helpers */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Interactive Socratic Hinting</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    If you prefer a guided educational experience, toggle **TUTORIAL MODE / Socratic Tips**. The game pauses during Blue Defense, compiling:
                  </p>
                  <ul className="space-y-1 text-slate-300 list-disc pl-4">
                    <li>Dynamic architectural vulnerability maps.</li>
                    <li>Multiple choice questions explaining CWE/OWASP risks.</li>
                    <li>Defensive guidelines for correct patches.</li>
                  </ul>
                </div>

                {/* Replay Studio */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-mono font-bold">
                    <Play className="w-4 h-4" />
                    <span>Agent Replay Studio</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Review past iterations. Open **REPLAY** from the header toolbar to rewind rounds step-by-step, comparing the code modifications made.
                  </p>
                </div>

                {/* Match Report */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                    <FileText className="w-4 h-4" />
                    <span>Download Comprehensive Reports</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Upon completing a round cycle, click **REPORT** to review compliance assessments, tactical posture reviews, and architectural suggestions.
                  </p>
                </div>

              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-center">
                <span className="text-xs font-mono font-bold text-cyan-300 block mb-1">
                  Ready to test your defensive posture?
                </span>
                <p className="text-[11px] text-slate-400">
                  Select a targeted microservice scenario, adjust simulation speeds, and launch the state machine directly from the header toolbar.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer buttons / slides navigation */}
        <div className="px-6 py-4 bg-[#05080E] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Exit Presentation Walkthrough
          </button>

          <div className="flex items-center gap-3">
            <button
              disabled={slides.findIndex(s => s.id === activeSlide) === 0}
              onClick={handlePrevSlide}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Slide</span>
            </button>

            <button
              onClick={
                slides.findIndex(s => s.id === activeSlide) === slides.length - 1
                  ? onClose
                  : handleNextSlide
              }
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer"
            >
              <span>
                {slides.findIndex(s => s.id === activeSlide) === slides.length - 1
                  ? 'Start Operations'
                  : 'Next Slide'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
