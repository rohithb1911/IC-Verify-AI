import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, Search, Activity, Play, ArrowRight, ArrowDown } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated PCB Circuit Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Circuit trace nodes
    interface TraceNode {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      speed: number;
      progress: number;
      color: string;
      radius: number;
      connections: { x: number; y: number }[];
    }

    const traces: TraceNode[] = [];
    const colors = ['#06B6D4', '#8B5CF6'];

    const createTrace = (): TraceNode => {
      const isHorizontal = Math.random() > 0.5;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = Math.random() * 120 + 40;
      const angle = isHorizontal ? 0 : Math.PI / 2;
      
      const targetX = x + Math.cos(angle) * length * (Math.random() > 0.5 ? 1 : -1);
      const targetY = y + Math.sin(angle) * length * (Math.random() > 0.5 ? 1 : -1);

      // Add custom connections/bends to look like actual PCB traces
      const connections = [];
      let cx = x;
      let cy = y;
      const segments = Math.floor(Math.random() * 3) + 1;
      for (let s = 0; s < segments; s++) {
        const nextH = Math.random() > 0.5;
        const segLen = Math.random() * 60 + 20;
        if (nextH) {
          cx += Math.random() > 0.5 ? segLen : -segLen;
        } else {
          cy += Math.random() > 0.5 ? segLen : -segLen;
        }
        connections.push({ x: cx, y: cy });
      }

      return {
        x,
        y,
        targetX: cx,
        targetY: cy,
        speed: Math.random() * 0.01 + 0.005,
        progress: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 2 + 1,
        connections
      };
    };

    // Initialize traces
    for (let i = 0; i < 40; i++) {
      traces.push(createTrace());
    }

    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? 'rgba(3, 7, 18, 0.08)' : 'rgba(248, 250, 252, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Traces
      traces.forEach((t, index) => {
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = t.color;

        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        
        t.connections.forEach((c) => {
          ctx.lineTo(c.x, c.y);
        });
        ctx.stroke();

        // Draw pulsing flow dots along the lines
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (t.connections.length > 0) {
          // Approximate current point based on progress
          const segmentIndex = Math.floor(t.progress * t.connections.length);
          const currentSeg = t.connections[Math.min(segmentIndex, t.connections.length - 1)];
          ctx.arc(currentSeg.x, currentSeg.y, t.radius + 1.5, 0, Math.PI * 2);
        } else {
          const cx = t.x + (t.targetX - t.x) * t.progress;
          const cy = t.y + (t.targetY - t.y) * t.progress;
          ctx.arc(cx, cy, t.radius + 1.5, 0, Math.PI * 2);
        }
        ctx.fill();

        // Draw soldering joint circles
        ctx.fillStyle = t.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        ctx.arc(t.targetX, t.targetY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.arc(t.targetX, t.targetY, 2, 0, Math.PI * 2);
        ctx.stroke();

        // Update progress
        t.progress += t.speed;
        if (t.progress >= 1) {
          traces[index] = createTrace();
        }
      });

      // Reset shadow
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const features = [
    { icon: <Cpu className="w-6 h-6 text-electricCyan" />, title: "IC Image Upload & Preprocess", desc: "Adaptive denoising, contrast correction, and perspective warps." },
    { icon: <Search className="w-6 h-6 text-neonViolet" />, title: "PaddleOCR Text Recognition", desc: "Recognize marking fonts, part numbers, and date code arrays." },
    { icon: <ShieldCheck className="w-6 h-6 text-electricCyan" />, title: "YOLOv8 Logo Detection", desc: "Segment manufacturer symbols and compare with genuine vectors." },
    { icon: <Activity className="w-6 h-6 text-neonViolet" />, title: "Surface Quality Inspection", desc: "Identify micro-scratches, cracks, remarking traces, and packaging wear." }
  ];

  return (
    <div className="relative min-h-screen bg-background text-slate-800 overflow-hidden flex flex-col justify-between">
      {/* Circuit Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />

      {/* Header Banner */}
      <header className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-[#0B4F9C] flex items-center justify-center shadow-sm">
            <Cpu className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="text-base font-black tracking-tight text-[#0B4F9C] uppercase font-sans">
            IC MARKING AOI
          </span>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-md bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 hover:border-[#0B4F9C] hover:text-[#0B4F9C] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          Enter Console <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex-grow flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-[#0B4F9C] mb-6 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#0B4F9C]" /> Smart India Hackathon 2026 Solution
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 max-w-4xl leading-tight text-slate-900">
          Automated Optical Marking Inspection <br />
          <span className="text-[#0B4F9C]">
            (AOI Console Node 04)
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="text-base md:text-lg text-slate-600 font-normal max-w-2xl mb-4 leading-relaxed">
          High-accuracy computer vision verification against genuine semiconductor databases, detecting counterfeit laser markings and structural package defects.
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-14">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-md bg-[#0B4F9C] hover:bg-[#093e7a] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Launch Inspection <Cpu className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            Run Demo Scan <Play className="w-3.5 h-3.5 fill-[#0B4F9C] text-[#0B4F9C]" />
          </button>

          <a 
            href="#features"
            className="px-8 py-4 rounded-xl bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-cardBorder text-slate-700 dark:text-gray-300 font-semibold hover:border-slate-300 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
          >
            Learn More <ArrowDown className="w-4 h-4" />
          </a>
        </div>

        {/* Features Preview Cards Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-slate-200 dark:border-cardBorder text-left hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/10 shadow-sm transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-gray-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-gray-200 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-6 border-t border-slate-200 dark:border-cardBorder max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-gray-500">
        <div>© 2026 IC Verify AI. All Rights Reserved.</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="#" className="hover:text-sky-600 dark:hover:text-electricCyan transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-sky-600 dark:hover:text-electricCyan transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-sky-600 dark:hover:text-electricCyan transition-colors">SIH Portal</a>
        </div>
      </footer>
    </div>
  );
}
