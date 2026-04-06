import React, { useEffect, useRef, useState } from 'react';
import { State, predictPath, updateState, calculateSteeringToTarget, checkCollision, Obstacle, generateAvoidanceCurve } from '../math/models';

interface SimulatorProps {
  steering: number;
  speed: number;
  isSimulating: boolean;
  mode: 'manual' | 'autonomous';
  onTelemetryUpdate?: (state: State) => void;
}

const Simulator: React.FC<SimulatorProps> = ({ steering, speed, isSimulating, mode, onTelemetryUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vehicleState, setVehicleState] = useState<State>({
    x: 150,
    y: 300,
    yaw: 0,
    v: 0,
  });

  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [obstacles] = useState<Obstacle[]>([
    { x: 400, y: 200, radius: 30 },
    { x: 700, y: 450, radius: 40 },
    { x: 900, y: 150, radius: 25 },
  ]);

  const [history, setHistory] = useState<{ x: number; y: number }[]>([]);
  const [collision, setCollision] = useState(false);
  const [avoidanceCp, setAvoidanceCp] = useState<{ x: number; y: number } | null>(null);

  // Handle Canvas Click to set target
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setTarget({ x, y });
  };

  // Simulation Loop
  useEffect(() => {
    if (!isSimulating || collision) return;

    const dt = 0.05;
    const interval = setInterval(() => {
      setVehicleState((prev) => {
        let currentSteering = (steering * Math.PI) / 180;
        let targetSpeed = speed;

        if (mode === 'autonomous' && target) {
          // CO5: Curve Fitting - Generate avoidance curve
          const { lookahead, cp } = generateAvoidanceCurve(prev, target, obstacles);
          setAvoidanceCp(cp); // Save control point for rendering
          
          currentSteering = calculateSteeringToTarget(prev, lookahead);
          const dist = Math.sqrt(Math.pow(target.x - prev.x, 2) + Math.pow(target.y - prev.y, 2));
          if (dist < 20) {
            setTarget(null);
            setAvoidanceCp(null);
            targetSpeed = 0;
          }
        } else {
          setAvoidanceCp(null);
        }

        const newState = updateState(prev, currentSteering, (targetSpeed - prev.v) * 0.5, dt);
        
        if (checkCollision(newState, obstacles)) {
          setCollision(true);
          return prev;
        }

        setHistory((h) => [...h.slice(-200), { x: newState.x, y: newState.y }]);
        onTelemetryUpdate?.(newState);
        return newState;
      });
    }, dt * 1000);

    return () => clearInterval(interval);
  }, [isSimulating, steering, speed, mode, target, obstacles, collision]);

  // Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid (High Tech Style)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw Obstacles
      obstacles.forEach(obs => {
        const grad = ctx.createRadialGradient(obs.x, obs.y, 0, obs.x, obs.y, obs.radius);
        grad.addColorStop(0, '#ef444433');
        grad.addColorStop(1, '#ef444466');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Target
      if (target) {
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(target.x - 15, target.y); ctx.lineTo(target.x + 15, target.y);
        ctx.moveTo(target.x, target.y - 15); ctx.lineTo(target.x, target.y + 15);
        ctx.stroke();

        // Draw Avoidance Curve (CO5: Curve Fitting)
        if (mode === 'autonomous' && avoidanceCp) {
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b'; // Amber color for avoidance curve
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(vehicleState.x, vehicleState.y);
          ctx.quadraticCurveTo(avoidanceCp.x, avoidanceCp.y, target.x, target.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw History
      if (history.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.moveTo(history[0].x, history[0].y);
        for (let i = 1; i < history.length; i++) ctx.lineTo(history[i].x, history[i].y);
        ctx.stroke();
      }

      // Predict Path
      const currentSteering = mode === 'autonomous' && target 
        ? calculateSteeringToTarget(vehicleState, target) 
        : (steering * Math.PI) / 180;
      
      const prediction = predictPath(vehicleState, currentSteering, 0, 4, 0.2);
      ctx.beginPath();
      ctx.strokeStyle = collision ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(prediction[0].x, prediction[0].y);
      for (let i = 1; i < prediction.length; i++) ctx.lineTo(prediction[i].x, prediction[i].y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Sensors (Radar Arcs)
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f622';
      ctx.arc(vehicleState.x, vehicleState.y, 100, vehicleState.yaw - 0.5, vehicleState.yaw + 0.5);
      ctx.stroke();

      // Draw Vehicle
      ctx.save();
      ctx.translate(vehicleState.x, vehicleState.y);
      ctx.rotate(vehicleState.yaw);
      
      // Shadow
      ctx.shadowBlur = 15;
      ctx.shadowColor = collision ? '#ef4444' : '#3b82f6';
      
      // Car Body (Detailed)
      ctx.fillStyle = collision ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(-22, -12, 44, 24, 4);
      ctx.fill();
      
      // Windshield
      ctx.fillStyle = '#ffffff33';
      ctx.fillRect(5, -9, 8, 18);
      
      // Headlights
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(18, -10, 4, 6);
      ctx.fillRect(18, 4, 4, 6);

      ctx.restore();

      if (collision) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('COLLISION DETECTED', canvas.width / 2, canvas.height / 2);
      }

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [vehicleState, history, steering, target, obstacles, collision, mode]);

  return (
    <div className="relative w-full h-[600px] bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair"
      />
      
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-[10px] font-mono text-blue-400 shadow-xl">
          <div className="flex justify-between gap-8">
            <span>POSITION</span>
            <span className="text-white">{vehicleState.x.toFixed(1)}, {vehicleState.y.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>HEADING</span>
            <span className="text-white">{(vehicleState.yaw * 180 / Math.PI).toFixed(1)}°</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>VELOCITY</span>
            <span className="text-white">{vehicleState.v.toFixed(2)} m/s</span>
          </div>
        </div>
        
        {collision && (
          <button 
            onClick={() => {
              setCollision(false);
              setVehicleState({ x: 150, y: 300, yaw: 0, v: 0 });
              setHistory([]);
            }}
            className="bg-red-500 text-white text-[10px] font-bold py-2 rounded-xl shadow-lg shadow-red-500/20 uppercase tracking-widest"
          >
            Reset System
          </button>
        )}
      </div>

      <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-[10px] font-mono text-slate-400">
        CLICK ON MAP TO SET AUTONOMOUS TARGET
      </div>
    </div>
  );
};

export default Simulator;
