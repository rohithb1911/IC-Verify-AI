import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Shield, ShieldCheck, Search, Activity, 
  Play, ArrowRight, Scan, ChevronDown, CheckCircle2,
  Layers, Database, Sparkles, Terminal, FileCheck
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle animated technical constellation / circuit background matching screenshot
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

    interface Point {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      radius: number;
    }

    const points: Point[] = [
      { x: width * 0.15, y: height * 0.22, vx: 0.1, vy: 0.05, color: '#0284c7', radius: 3 },
      { x: width * 0.12, y: height * 0.45, vx: -0.08, vy: 0.06, color: '#0B4F9C', radius: 2.5 },
      { x: width * 0.22, y: height * 0.35, vx: 0.05, vy: -0.05, color: '#38bdf8', radius: 2 },
      { x: width * 0.82, y: height * 0.20, vx: -0.08, vy: 0.07, color: '#818cf8', radius: 3 },
      { x: width * 0.88, y: height * 0.32, vx: 0.06, vy: -0.05, color: '#0B4F9C', radius: 2.5 },
      { x: width * 0.78, y: height * 0.42, vx: -0.05, vy: 0.06, color: '#a855f7', radius: 2 },
      { x: width * 0.90, y: height * 0.60, vx: -0.07, vy: -0.06, color: '#0284c7', radius: 2 },
      { x: width * 0.08, y: height * 0.70, vx: 0.06, vy: -0.04, color: '#0ea5e9', radius: 2 }
    ];

    const connections: [number, number][] = [
      [0, 1], [0, 2], [1, 2],
      [3, 4], [3, 5], [4, 5], [5, 6]
    ];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      // Draw thin constellation connecting lines
      connections.forEach(([i, j]) => {
        const p1 = points[i];
        const p2 = points[j];
        if (!p1 || !p2) return;

        ctx.strokeStyle = 'rgba(14, 165, 233, 0.22)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw constellation dots
      points.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle outer glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const features = [
    { 
      icon: <Cpu className="w-5 h-5 text-[#0B4F9C]" />, 
      title: "IC Image Upload & Preprocess", 
      desc: "Adaptive bilateral denoising, homography perspective normalization, and contrast enhancement." 
    },
    { 
      icon: <Search className="w-5 h-5 text-indigo-600" />, 
      title: "Sub-Pixel OCR Marking Verification", 
      desc: "Recognize laser font patterns, part numbers, and date code formats against JEDEC golden templates." 
    },
    { 
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />, 
      title: "YOLOv8 Logo Verification", 
      desc: "Segment manufacturer brand logos and compare vector strokes against authentic OEM master dies." 
    },
    { 
      icon: <Activity className="w-5 h-5 text-rose-600" />, 
      title: "Surface Blacktopping & Damage Profiler", 
      desc: "Identify micro-scratches, cracks, remarking burn marks, and mold compound structural wear in <0.2s." 
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 overflow-x-hidden flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Technical Graph Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(14, 165, 233, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(14, 165, 233, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Canvas for dynamic constellation lines */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Crosshair "+" Markers (Matching the user screenshot corners) */}
      <div className="absolute top-20 left-8 text-sky-400/80 font-mono text-base font-light select-none pointer-events-none">+</div>
      <div className="absolute top-20 right-8 text-sky-400/80 font-mono text-base font-light select-none pointer-events-none">+</div>
      <div className="absolute top-1/2 left-16 text-sky-400/60 font-mono text-base font-light select-none pointer-events-none">+</div>
      <div className="absolute top-1/2 right-16 text-sky-400/60 font-mono text-base font-light select-none pointer-events-none">+</div>
      <div className="absolute bottom-28 left-12 text-sky-400/60 font-mono text-base font-light select-none pointer-events-none">+</div>
      <div className="absolute bottom-28 right-12 text-sky-400/60 font-mono text-base font-light select-none pointer-events-none">+</div>

      {/* 2. Top Navigation Bar (Matching Screenshot Exactly, with SIH removed) */}
      <header className="relative z-20 w-full bg-white/95 border-b border-slate-200/90 px-6 sm:px-10 py-3 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] sticky top-0 backdrop-blur-md">
        
        {/* Left Brand + Node badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B4F9C] flex items-center justify-center shadow-xs shrink-0">
            <Cpu className="w-4 h-4 text-white stroke-[2.2]" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 uppercase font-sans">
            IC MARKING AOI
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px] font-bold">
            NODE 04
          </span>
        </div>

        {/* Center Telemetry Specs (Hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-slate-400">SYS.SPECS</span>
            <span className="text-slate-300 font-bold">//</span>
            <span className="text-slate-500 font-bold">OPTICAL TELEMETRY V4.8</span>
          </div>

          {/* Optics Calibrated Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-mono text-[10px] font-bold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>OPTICS CALIBRATED: 99.8% ACC</span>
          </div>
        </div>

        {/* Right Enter Console Button */}
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0B4F9C] hover:bg-[#083D7A] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>ENTER CONSOLE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </header>

      {/* 3. Hero Main Section (Matching Screenshot) */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-16 flex-grow flex flex-col items-center justify-center text-center">
        
        {/* Top Solution Badge (SIH removed, replaced with verified enterprise defense grade) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-slate-200/90 text-xs shadow-2xs mb-7 backdrop-blur-xs">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold text-blue-700">Precision Optical Inspection Suite</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Defense & Semi-Grade Verified</span>
        </div>

        {/* Main Headline (Bold Geometric Lines matching screenshot) */}
        <h1 className="text-4xl sm:text-5xl md:text-[56px] font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl">
          Automated Optical Marking<br />
          Inspection<br />
          <span className="text-[#0B4F9C]">(AOI Console Node 04)</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl text-center leading-relaxed font-normal">
          High-accuracy computer vision verification against genuine semiconductor databases, detecting counterfeit laser markings, surface blacktopping, and structural package defects in sub-0.20s per IC package.
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          
          {/* Primary: LAUNCH INSPECTION */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0B4F9C] hover:bg-[#083D7A] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>LAUNCH INSPECTION</span>
            <Scan className="w-4 h-4" />
          </button>
          
          {/* Secondary: RUN DEMO SCAN */}
          <button 
            onClick={() => {
              navigate('/dashboard');
              window.dispatchEvent(new CustomEvent('aoi:start-batch'));
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-[#0B4F9C] text-[#0B4F9C]" />
            <span>RUN DEMO SCAN</span>
          </button>

          {/* Link: Learn More */}
          <a 
            href="#specifications"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-2 transition-colors cursor-pointer"
          >
            <span>Learn More</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </a>

        </div>

        {/* 4. Bottom 4 KPI / Spec Metric Cards (Matching Screenshot Exactly) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full max-w-4xl mx-auto mt-14">
          
          {/* Card 1: DETECTION SPEED */}
          <div className="bg-white/95 rounded-lg border border-slate-200/90 p-4 shadow-xs text-left hover:border-slate-300 transition-all">
            <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              DETECTION SPEED
            </div>
            <div className="font-mono font-bold text-base text-slate-900 mt-1">
              184 ms / die
            </div>
          </div>

          {/* Card 2: FONT OCR MATCH */}
          <div className="bg-white/95 rounded-lg border border-slate-200/90 p-4 shadow-xs text-left hover:border-slate-300 transition-all">
            <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              FONT OCR MATCH
            </div>
            <div className="font-mono font-bold text-base text-emerald-600 mt-1">
              99.82% Confidence
            </div>
          </div>

          {/* Card 3: BLACKTOPPING PROFILER */}
          <div className="bg-white/95 rounded-lg border border-slate-200/90 p-4 shadow-xs text-left hover:border-slate-300 transition-all">
            <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              BLACKTOPPING PROFILER
            </div>
            <div className="font-mono font-bold text-base text-slate-800 mt-1">
              Sub-5µm Laser Scan
            </div>
          </div>

          {/* Card 4: GOLDEN DB (SIH removed, replaced with JEDEC/Verified DB) */}
          <div className="bg-white/95 rounded-lg border border-slate-200/90 p-4 shadow-xs text-left hover:border-slate-300 transition-all">
            <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              JEDEC GOLDEN DB
            </div>
            <div className="font-mono font-bold text-base text-[#0B4F9C] mt-1">
              2.4M Verified Dies
            </div>
          </div>

        </div>

        {/* 5. Detailed Specifications & Capabilities (Below fold) */}
        <div id="specifications" className="w-full max-w-5xl mt-24 pt-10 border-t border-slate-200/80 text-left space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-[#0B4F9C] tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              INDUSTRIAL COMPUTER VISION PIPELINE
            </span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Core Inspection Capabilities</h3>
            <p className="text-xs text-slate-500">Autonomous multi-stage validation against global semiconductor standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="p-5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs shadow-2xs transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
                  {f.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-xs tracking-tight">{f.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* 6. Footer */}
      <footer className="relative z-10 w-full px-6 py-6 border-t border-slate-200/90 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">IC Verify AI</span>
          <span>•</span>
          <span>Automated Optical Inspection (AOI) Node 04</span>
        </div>
        <div className="flex gap-4 mt-3 sm:mt-0 text-[11px] font-medium">
          <a href="#" className="hover:text-[#0B4F9C] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#0B4F9C] transition-colors">Terms of Verification</a>
          <a href="#" className="hover:text-[#0B4F9C] transition-colors">JEDEC Guidelines</a>
          <a href="#" className="hover:text-[#0B4F9C] transition-colors">API Documentation</a>
        </div>
      </footer>

    </div>
  );
}
