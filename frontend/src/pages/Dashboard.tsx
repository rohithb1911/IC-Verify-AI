import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Camera, AlertCircle, CheckCircle, RefreshCw, Layers, 
  ShieldCheck, Play, ArrowRight, Video, AlertTriangle, ShieldAlert,
  Sparkles, CheckCircle2, Database, TrendingUp, Cpu, Scan, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService, InspectionResult } from '../services/api';

interface HistoryRow {
  id: string;
  timestamp: string;
  part_number: string;
  result: 'GENUINE' | 'FAKE' | 'SUSPICIOUS';
  confidence: string;
  isBoldPart?: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Workstation visibility
  const [showWorkstation, setShowWorkstation] = useState(true);
  const workstationRef = useRef<HTMLDivElement>(null);

  // Time range selector for System Health & Volume
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('7D');

  // Volume Chart Data
  const volumeChartData = {
    '24H': [
      { time: '00:00', volume: 120 },
      { time: '04:00', volume: 140 },
      { time: '08:00', volume: 290 },
      { time: '12:00', volume: 380 },
      { time: '16:00', volume: 460 },
      { time: '20:00', volume: 320 },
    ],
    '7D': [
      { time: 'Day 1', volume: 150 },
      { time: 'Day 2', volume: 190 },
      { time: 'Day 3', volume: 140 },
      { time: 'Day 4', volume: 310 },
      { time: 'Day 5', volume: 280 },
      { time: 'Day 6', volume: 440 },
      { time: 'Day 7', volume: 390 },
      { time: 'Day 8', volume: 510 },
      { time: 'Day 9', volume: 460 },
      { time: 'Day 10', volume: 620 },
      { time: 'Day 11', volume: 590 },
    ],
    '30D': [
      { time: 'W1', volume: 1200 },
      { time: 'W2', volume: 1850 },
      { time: 'W3', volume: 2400 },
      { time: 'W4', volume: 3100 },
    ]
  };

  // Static reference rows matching user's screenshot
  const initialRecentHistory: HistoryRow[] = [
    { id: '#29042', timestamp: '2023-10-27 14:32:01', part_number: 'XC-7A200T-2FBG484C', result: 'GENUINE', confidence: '99.9%' },
    { id: '#29041', timestamp: '2023-10-27 14:31:45', part_number: 'XC-7A200T-2FBG484C', result: 'GENUINE', confidence: '98.5%' },
    { id: '#29040', timestamp: '2023-10-27 14:30:12', part_number: 'STM32F407VGT6', result: 'FAKE', confidence: '42.1%', isBoldPart: true },
    { id: '#29039', timestamp: '2023-10-27 14:28:55', part_number: 'PIC32MX795F512L', result: 'SUSPICIOUS', confidence: '76.4%' },
    { id: '#29038', timestamp: '2023-10-27 14:27:30', part_number: 'XC-7A200T-2FBG484C', result: 'GENUINE', confidence: '99.7%' },
  ];
  const [recentHistory, setRecentHistory] = useState<HistoryRow[]>(initialRecentHistory);

  // Camera scanning state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Target Part selection (from 50 reference parts catalog)
  const [targetPart, setTargetPart] = useState<string>("Auto-Detect");
  const [referenceParts, setReferenceParts] = useState<{ part_number: string; manufacturer: string; category?: string }[]>([]);

  // Core processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  
  // Results
  const [scanResult, setScanResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logsSequence = [
    "Initializing Automated Optical Inspection (AOI) Engine...",
    "Running OpenCV Image Preprocessing: Grayscale & Gaussian Denoise...",
    "Running Canny Edge Detection & Package Contour Extraction...",
    "Scanning IC Surface for Structural Cracks & Fracture Fissures...",
    "Analyzing Perimeter Geometry for Corner & Edge Chipping...",
    "Detecting Surface Abrasions & Thermal Burn / Pitting Voids...",
    "Running OCR Markings Parser: Extracting Part Number & Date Code...",
    "Comparing Logo Vector & Font Metrics against Genuine Catalog...",
    "Compiling Unified Physical Integrity & Authenticity Decision...",
    "Inspection Completed."
  ];

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload PNG, JPG, JPEG, or BMP.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    stopCamera();
    setShowWorkstation(true);
  };

  // Camera Handlers
  const startCamera = async () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError(null);
    setShowWorkstation(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Failed to access camera device. Verify permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
          processSelectedFile(file);
        }
      }, 'image/jpeg');
    }
  };

  // Generate Synthetic Test Sample with specific physical damage
  const generatePresetSample = (presetType: 'clean' | 'cracked' | 'chipped' | 'burnt' | 'counterfeit_damaged') => {
    setShowWorkstation(true);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 480);

    const icWidth = 360;
    const icHeight = 260;
    const icX = 140;
    const icY = 110;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.fillRect(icX, icY, icWidth, icHeight);
    ctx.strokeRect(icX, icY, icWidth, icHeight);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 22px "Courier New", monospace';
    let partText = 'NE555P';
    let subText = 'TI 2315 BATCH_A7';
    let filename = 'preset_clean_ne555p.png';

    if (presetType === 'cracked') {
      partText = 'STM32F103C8T6';
      subText = 'ST PHL 99042 CRACK_TEST';
      filename = 'preset_cracked_stm32.png';
      setTargetPart('STM32F103C8T6');
    } else if (presetType === 'chipped') {
      partText = 'ATMEGA328P-PU';
      subText = 'ATMEL 2144 CHIP_SAMPLE';
      filename = 'preset_chipped_atmega.png';
      setTargetPart('ATMEGA328P-PU');
    } else if (presetType === 'burnt') {
      partText = 'ESP32-WROOM-32';
      subText = 'ESP 2208 BURN_SAMPLE';
      filename = 'preset_burnt_esp32.png';
      setTargetPart('ESP32-WROOM-32');
    } else if (presetType === 'counterfeit_damaged') {
      partText = 'LM317T (REMARKED)';
      subText = 'FAKEMFG 8821 X-RAY_FAIL';
      filename = 'preset_counterfeit_lm317.png';
      setTargetPart('LM317T');
    } else {
      setTargetPart('NE555P');
    }

    ctx.fillText(partText, icX + 45, icY + 110);
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(subText, icX + 45, icY + 155);

    if (presetType === 'cracked' || presetType === 'counterfeit_damaged') {
      ctx.strokeStyle = '#05070a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(icX + 60, icY + 70);
      ctx.lineTo(icX + 160, icY + 130);
      ctx.lineTo(icX + 210, icY + 180);
      ctx.lineTo(icX + 290, icY + 230);
      ctx.stroke();

      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(icX + 160, icY + 130);
      ctx.lineTo(icX + 240, icY + 110);
      ctx.stroke();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], filename, { type: 'image/png' });
        processSelectedFile(file);
      }
    }, 'image/png');
  };

  // Load real photorealistic high-res sample IC images
  const loadRealSample = async (filename: string, part: string) => {
    setTargetPart(part);
    setShowWorkstation(true);
    try {
      let res = await fetch(`/samples/${filename}`);
      if (!res.ok) {
        const backendBase = (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173')
          ? 'http://localhost:8000'
          : '';
        res = await fetch(`${backendBase}/static/uploads/${filename}`);
      }
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], filename, { type: 'image/jpeg' });
        processSelectedFile(file);
        return;
      }
    } catch {}
    if (filename.includes('ne555')) generatePresetSample('clean');
    else if (filename.includes('cracked')) generatePresetSample('cracked');
    else if (filename.includes('counterfeit')) generatePresetSample('counterfeit_damaged');
    else generatePresetSample('clean');
  };

  // Load reference catalog on mount
  useEffect(() => {
    apiService.getReference().then(res => {
      if (res && res.length > 0) {
        setReferenceParts(res);
      }
    }).catch(() => {});
  }, []);

  // Listen to sidebar action events
  useEffect(() => {
    const handleStart = () => {
      setShowWorkstation(true);
      setTimeout(() => {
        workstationRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    window.addEventListener('aoi:start-batch', handleStart);
    window.addEventListener('aoi:new-inspection', handleStart);
    return () => {
      window.removeEventListener('aoi:start-batch', handleStart);
      window.removeEventListener('aoi:new-inspection', handleStart);
    };
  }, []);

  // Run the inspection pipeline
  const runInspection = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingLogs([logsSequence[0]]);
    setScanResult(null);
    
    const logInterval = setInterval(() => {
      setProcessingStep(prev => {
        const next = prev + 1;
        if (next < logsSequence.length) {
          setProcessingLogs(logs => [...logs, logsSequence[next]]);
          return next;
        } else {
          clearInterval(logInterval);
          return prev;
        }
      });
    }, 380);

    try {
      const uploadRes = await apiService.uploadFile(selectedFile);
      const analyzeRes = await apiService.analyzeImage(
        uploadRes.filename, 
        "AI Inspection Engine Node 04",
        targetPart !== "Auto-Detect" ? targetPart : undefined,
        previewUrl || uploadRes.raw_image_url
      );
      
      clearInterval(logInterval);
      setProcessingStep(logsSequence.length - 1);
      setProcessingLogs(logsSequence);
      
      await new Promise(r => setTimeout(r, 450));
      setScanResult(analyzeRes);

      // Prepend to recent history table
      const isFake = analyzeRes.final_decision.includes("COUNTERFEIT") || analyzeRes.final_decision.includes("REJECTED");
      const isDefective = analyzeRes.final_decision.includes("DEFECTIVE");
      const resVerdict: 'GENUINE' | 'FAKE' | 'SUSPICIOUS' = isFake ? 'FAKE' : (isDefective ? 'SUSPICIOUS' : 'GENUINE');
      
      const newRow: HistoryRow = {
        id: `#${Math.floor(29043 + Math.random() * 50)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        part_number: analyzeRes.part_number || targetPart,
        result: resVerdict,
        confidence: `${(100 - analyzeRes.counterfeit_probability).toFixed(1)}%`,
        isBoldPart: isFake
      };
      setRecentHistory(prev => [newRow, ...prev.slice(0, 6)]);
    } catch (err: any) {
      clearInterval(logInterval);
      setError(err?.message || "Failed to analyze the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-slate-800 bg-[#f1f4f9]">
      
      {/* ========================================================================= */}
      {/* ROW 1: TOP 5 KPI METRIC CARDS (Matching Reference Screenshot) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* 1. TOTAL INSPECTED */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Inspected
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              124,592
            </div>
          </div>
          <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
            <Cpu className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* 2. GENUINE */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            Genuine
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            123,800
          </div>
        </div>

        {/* 3. SUSPICIOUS */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
            Suspicious
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            645
          </div>
        </div>

        {/* 4. FAKE */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            Fake
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            147
          </div>
        </div>

        {/* 5. SYSTEM ACCURACY (Solid Deep Blue Card) */}
        <div className="bg-[#0B4F9C] text-white rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            System Accuracy
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-white tracking-tight">
              99.8%
            </span>
            <TrendingUp className="w-5 h-5 text-white/90" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ROW 2: SYSTEM HEALTH & VOLUME (Left) + INITIATE OPTICAL SCAN (Right) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: SYSTEM HEALTH & VOLUME Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              System Health & Volume
            </h3>
            {/* Time period filter pills */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              {(['24H', '7D', '30D'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    timeRange === t 
                      ? 'bg-slate-200/80 text-slate-900 font-bold' 
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeChartData[timeRange]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B4F9C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0B4F9C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  axisLine={{ stroke: '#f1f5f9' }} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  axisLine={{ stroke: '#f1f5f9' }} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#0B4F9C" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#volumeColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: INITIATE OPTICAL SCAN (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0B4F9C] mb-3 shadow-xs">
            <Scan className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Initiate Optical Scan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Load batch parameters and align optics for new inspection run.
          </p>
          <button
            onClick={() => {
              setShowWorkstation(true);
              setTimeout(() => workstationRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="w-full mt-5 py-2.5 px-4 rounded-md bg-[#0B4F9C] hover:bg-[#093e7a] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-[0.99]"
          >
            Start New Inspection
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE INSPECTION WORKSTATION (Dropzone, Camera, Presets, CV Stages) */}
      {/* ========================================================================= */}
      {showWorkstation && (
        <div ref={workstationRef} className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scan className="w-4 h-4 text-[#0B4F9C]" />
                Optical Inspection Workstation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Drop chip imagery, select one-click benchmark samples, or initiate direct camera input.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!cameraActive ? (
                <button 
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#0B4F9C]" />
                  Camera Feed
                </button>
              ) : (
                <button 
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  Stop Camera
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demonstration Test Presets */}
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0B4F9C]" />
              One-Click Demonstration Test Presets:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadRealSample('ic_pristine_ne555p_genuine.jpg', 'NE555P')}
                className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pristine NE555P (Genuine Pass)
              </button>
              <button
                type="button"
                onClick={() => loadRealSample('ic_pristine_stm32f103_genuine.jpg', 'STM32F103C8T6')}
                className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pristine STM32 (Genuine Pass)
              </button>
              <button
                type="button"
                onClick={() => loadRealSample('ic_cracked_stm32f103_defect.jpg', 'STM32F103C8T6')}
                className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Cracked STM32 (Defective Genuine)
              </button>
              <button
                type="button"
                onClick={() => loadRealSample('ic_remarked_lm317t_counterfeit_damaged.jpg', 'LM317T')}
                className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3 h-3 text-rose-600" /> Remarked LM317T (Counterfeit & Damaged)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Drag & Drop zone (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {cameraActive ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black aspect-video max-h-80 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <button 
                      onClick={capturePhoto}
                      className="px-4 py-2 rounded-md bg-[#0B4F9C] text-white font-bold text-xs hover:bg-[#083e7a] transition-all flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Capture Chip Image
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[160px] ${
                    dragActive ? 'border-[#0B4F9C] bg-sky-50/50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input 
                    type="file" 
                    id="file-upload-main" 
                    className="hidden" 
                    accept=".png,.jpg,.jpeg,.bmp"
                    onChange={handleFileInput}
                  />
                  <label htmlFor="file-upload-main" className="cursor-pointer flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      Drag & drop IC image here, or <span className="text-[#0B4F9C] font-bold">browse file</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Supports PNG, JPG, JPEG, BMP (AOI resolution recommended)
                    </span>
                  </label>
                </div>
              )}

              {/* Target IC Selector & Preview Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="target-ic-select" className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-[#0B4F9C]" /> Reference Part:
                  </label>
                  <select
                    id="target-ic-select"
                    value={targetPart}
                    onChange={(e) => setTargetPart(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B4F9C]"
                  >
                    <option value="Auto-Detect">Auto-Detect ({referenceParts.length || 50} ICs)</option>
                    {referenceParts.map((rp) => (
                      <option key={rp.part_number} value={rp.part_number}>
                        {rp.part_number} - {rp.manufacturer}
                      </option>
                    ))}
                  </select>
                </div>

                {previewUrl && (
                  <button 
                    onClick={runInspection}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-md bg-[#0B4F9C] hover:bg-[#093e7a] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>Execute Inspection</span>
                  </button>
                )}
              </div>

              {/* Progress Log Overlay */}
              {isProcessing && (
                <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0B4F9C]">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running OpenCV Optical Inspection
                    </span>
                    <span className="text-slate-500 font-normal">
                      Stage {processingStep + 1} of {logsSequence.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0B4F9C] h-full transition-all duration-300"
                      style={{ width: `${((processingStep + 1) / logsSequence.length) * 100}%` }}
                    />
                  </div>
                  <div className="bg-slate-900 text-slate-200 rounded p-2.5 font-mono text-[10px] h-20 overflow-y-auto">
                    {processingLogs.map((log, idx) => (
                      <div key={idx} className={idx === processingLogs.length - 1 ? 'text-sky-300' : 'text-slate-400'}>
                        &gt; {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Stage Computer Vision previews */}
              {scanResult && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0B4F9C]" />
                    5 Optical Stages Extracted:
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { title: '1. Raw', img: scanResult.raw_image_url || previewUrl },
                      { title: '2. Filtered', img: scanResult.processed_image_url || previewUrl },
                      { title: '3. BBox', img: scanResult.bbox_url || previewUrl },
                      { title: '4. Marking', img: scanResult.defect_url || previewUrl },
                      { title: '5. Damage', img: scanResult.damage_image_url || previewUrl },
                    ].map((st, i) => (
                      <div key={i} className="text-center space-y-1">
                        <div className="text-[9px] font-bold text-slate-500 truncate">{st.title}</div>
                        <div className="aspect-square bg-slate-100 border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                          {st.img ? (
                            <img src={st.img} alt={st.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] text-slate-400">N/A</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right: Live Verdict Scorecard (5 cols) */}
            <div className="lg:col-span-5">
              {scanResult ? (() => {
                const isRejected = scanResult.final_decision.includes("REJECTED") || scanResult.final_decision.includes("COUNTERFEIT");
                const isDefective = scanResult.final_decision.includes("DEFECTIVE");
                const isSuspicious = scanResult.final_decision.includes("SUSPICIOUS");

                return (
                  <div className="rounded-lg border border-slate-200 p-5 bg-slate-50/60 space-y-4">
                    
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Analysis Decision</div>
                        <div className="text-base font-extrabold text-slate-900">{scanResult.part_number}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        isRejected 
                          ? 'bg-[#DC2626] text-white' 
                          : isDefective || isSuspicious
                            ? 'bg-[#F57C00] text-white'
                            : 'bg-[#E8F8EE] text-[#168846]'
                      }`}>
                        {isRejected ? 'FAKE' : isDefective || isSuspicious ? 'SUSPICIOUS' : 'GENUINE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-medium">Physical Integrity</div>
                        <div className={`text-base font-bold ${scanResult.physical_integrity < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {scanResult.physical_integrity}%
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-medium">Counterfeit Risk</div>
                        <div className={`text-base font-bold ${scanResult.counterfeit_probability > 45 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {scanResult.counterfeit_probability}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">OCR Read Accuracy:</span>
                        <span className="font-semibold text-slate-800">{scanResult.ocr_confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Logo Match:</span>
                        <span className="font-semibold text-slate-800">{scanResult.logo_match}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Font Similarity:</span>
                        <span className="font-semibold text-slate-800">{scanResult.font_similarity}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/history')}
                      className="w-full py-2 rounded bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      View in Scans Records <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                  </div>
                );
              })() : (
                <div className="rounded-lg border border-slate-200 p-8 bg-slate-50/60 flex flex-col items-center justify-center text-center h-full min-h-[240px]">
                  <ShieldCheck className="w-8 h-8 text-slate-400 mb-2" />
                  <div className="text-xs font-bold text-slate-800">Awaiting Inspection</div>
                  <div className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                    Select an IC preset or upload a chip image to generate an immediate verification verdict.
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ROW 3: RECENT INSPECTION HISTORY TABLE (Matching Reference Screenshot) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header / Action */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recent Inspection History
          </h3>
          <button
            onClick={() => navigate('/history')}
            className="px-3 py-1 rounded border border-[#0B4F9C] text-[#0B4F9C] hover:bg-sky-50 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            View Full Log
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-5">ID</th>
                <th className="py-2.5 px-5">Timestamp</th>
                <th className="py-2.5 px-5">Part Number</th>
                <th className="py-2.5 px-5 text-center">Result</th>
                <th className="py-2.5 px-5 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentHistory.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* ID */}
                  <td className="py-3 px-5 font-mono text-slate-500 text-[11px]">
                    {row.id}
                  </td>
                  
                  {/* TIMESTAMP */}
                  <td className="py-3 px-5 text-slate-600 font-mono text-[11px]">
                    {row.timestamp}
                  </td>
                  
                  {/* PART NUMBER */}
                  <td className={`py-3 px-5 font-mono text-xs ${
                    row.isBoldPart ? 'font-black text-slate-900' : 'text-slate-700'
                  }`}>
                    {row.part_number}
                  </td>
                  
                  {/* RESULT BADGE */}
                  <td className="py-3 px-5 text-center">
                    {row.result === 'GENUINE' && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F8EE] text-[#168846]">
                        GENUINE
                      </span>
                    )}
                    {row.result === 'FAKE' && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#DC2626] text-white">
                        FAKE
                      </span>
                    )}
                    {row.result === 'SUSPICIOUS' && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F57C00] text-white">
                        SUSPICIOUS
                      </span>
                    )}
                  </td>
                  
                  {/* CONFIDENCE */}
                  <td className={`py-3 px-5 text-right font-mono font-bold text-xs ${
                    row.result === 'FAKE' 
                      ? 'text-[#DC2626]' 
                      : row.result === 'SUSPICIOUS' 
                        ? 'text-[#EA580C]' 
                        : 'text-slate-700'
                  }`}>
                    {row.confidence}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
