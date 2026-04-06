import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Settings, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  Info,
  ChevronRight,
  Cpu,
  LineChart,
  Calculator,
  ShieldAlert,
  Navigation,
  Activity,
  Zap,
  Layers
} from 'lucide-react';
import Simulator from './components/Simulator';
import { cn } from './lib/utils';
import { State } from './math/models';

const MATH_CONCEPTS = [
  {
    id: 'CO1',
    title: 'Partial Differential Equations',
    desc: 'Modeling continuous state changes and field-based pathfinding using multi-variable derivatives.',
    icon: <Activity className="w-4 h-4" />
  },
  {
    id: 'CO2',
    title: 'Vector Spaces',
    desc: 'Defining the vehicle state (position, velocity, heading) as vectors in a multi-dimensional linear space.',
    icon: <Layers className="w-4 h-4" />
  },
  {
    id: 'CO3',
    title: 'Inner Product Space',
    desc: 'Calculating Euclidean distances and projections for path tracking and obstacle proximity detection.',
    icon: <Navigation className="w-4 h-4" />
  },
  {
    id: 'CO4',
    title: 'Laplace Transform',
    desc: 'Analyzing control system stability and transient response in the frequency domain for smooth steering.',
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'CO5',
    title: 'Curve Fitting',
    desc: 'Dynamically generating collision-free avoidance paths around obstacles using Quadratic Bezier curves.',
    icon: <LineChart className="w-4 h-4" />
  }
];

export default function App() {
  const [steering, setSteering] = useState(0);
  const [speed, setSpeed] = useState(20);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mode, setMode] = useState<'manual' | 'autonomous'>('manual');
  const [telemetry, setTelemetry] = useState<State | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (telemetry) {
      setHistory(prev => [...prev.slice(-20), telemetry.v]);
    }
  }, [telemetry]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 animate-pulse" />
              <div className="relative bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <Car className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-white uppercase">pathX</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">System Online • Karunya University</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-full border border-slate-800">
              <button 
                onClick={() => setMode('manual')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  mode === 'manual' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Manual
              </button>
              <button 
                onClick={() => setMode('autonomous')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  mode === 'autonomous' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Autonomous
              </button>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                  isSimulating 
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20" 
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20"
                )}
              >
                {isSimulating ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isSimulating ? "Halt" : "Engage"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Top Section: Simulator and Real-time Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Simulator */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
              <div className="relative bg-slate-950 rounded-[32px] border border-slate-800 p-1 shadow-2xl overflow-hidden">
                <Simulator 
                  steering={steering} 
                  speed={speed} 
                  isSimulating={isSimulating} 
                  mode={mode}
                  onTelemetryUpdate={setTelemetry}
                />
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Velocity', value: `${telemetry?.v.toFixed(1) || 0} m/s`, icon: <Zap className="w-4 h-4" />, color: 'text-blue-400' },
                { label: 'Steering', value: `${steering}°`, icon: <Navigation className="w-4 h-4" />, color: 'text-emerald-400' },
                { label: 'Stability', value: '98.2%', icon: <ShieldAlert className="w-4 h-4" />, color: 'text-amber-400' },
                { label: 'Compute', value: '1.2ms', icon: <Activity className="w-4 h-4" />, color: 'text-indigo-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-800/50 flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg bg-slate-800", stat.color)}>{stat.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Controls & Telemetry */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-950 rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-900/30">
                <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-[0.2em]">
                  <Settings className="w-4 h-4 text-blue-500" />
                  Control Interface
                </h3>
              </div>

              <div className="p-8 space-y-10">
                {mode === 'manual' ? (
                  <>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Steering Vector</label>
                        <span className="text-2xl font-mono font-black text-blue-500">{steering}°</span>
                      </div>
                      <div className="relative group">
                        <input 
                          type="range" 
                          min="-45" 
                          max="45" 
                          value={steering} 
                          onChange={(e) => setSteering(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-slate-600">
                        <span>PORT</span>
                        <span>NEUTRAL</span>
                        <span>STARBOARD</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thrust Output</label>
                        <span className="text-2xl font-mono font-black text-blue-500">{speed} m/s</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={speed} 
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                      <Navigation className="w-8 h-8 text-blue-500 animate-pulse" />
                    </div>
                    <h4 className="font-bold text-white">Autonomous Mode Active</h4>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">
                      The vehicle is using Pure Pursuit algorithms to track coordinates. Click anywhere on the map to set a new target.
                    </p>
                  </div>
                )}

                <div className="pt-8 border-t border-slate-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6">Velocity Profile</h4>
                  <div className="h-24 flex items-end gap-1 px-2">
                    {history.map((v, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-blue-500/40 rounded-t-sm transition-all duration-500" 
                        style={{ height: `${Math.min(100, v)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* System Status Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Neural Engine</span>
                </div>
                <h3 className="text-xl font-black mb-2">Real-time Prediction</h3>
                <p className="text-xs text-blue-100/70 leading-relaxed mb-6">
                  Processing kinematic bicycle models with Euler integration at 60Hz.
                </p>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 w-fit">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Optimized</span>
                </div>
              </div>
              <Car className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </aside>
        </div>

        {/* Full-Width Math Concepts Section */}
        <section className="space-y-12 pt-12 border-t border-slate-800">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">
              Academic Framework
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white">Mathematical Foundation</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
              This simulator integrates core mathematical principles from the Karunya University curriculum to model autonomous vehicle behavior.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {MATH_CONCEPTS.map((concept) => (
              <div key={concept.id} className="group p-8 rounded-[32px] bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/50 transition-all duration-500">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-5 bg-slate-900 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl">
                    {concept.icon}
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">{concept.id}</span>
                    <h4 className="font-black text-lg text-white">{concept.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {concept.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Implementation Summary */}
        <section className="relative rounded-[48px] p-12 overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Cpu className="w-4 h-4" />
                System Architecture
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white leading-tight">Engineering the <br/><span className="text-blue-500">Future of Mobility</span></h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                To build this autonomous vehicle simulator, we utilized a modern full-stack architecture that bridges complex mathematical models with real-time web rendering.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "PDE Modeling", desc: "Continuous state change modeling for smooth trajectories." },
                  { title: "Vector Spaces", desc: "State-space representation of vehicle kinematics." },
                  { title: "Inner Products", desc: "Euclidean distance metrics for obstacle avoidance." },
                  { title: "Laplace Control", desc: "Frequency-domain analysis for steering stability." },
                  { title: "Curve Fitting", desc: "Bezier curve generation for dynamic obstacle avoidance." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 text-xs font-black">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="aspect-square bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-slate-800 rounded-full scale-90" 
                />
                <Car className="w-40 h-40 text-blue-500 shadow-2xl" />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <Car className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white">pathX</span>
              <p className="text-[10px] text-slate-600 font-bold">© 2026 Karunya University</p>
            </div>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <a href="#" className="hover:text-blue-500 transition-colors">Karunya</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
