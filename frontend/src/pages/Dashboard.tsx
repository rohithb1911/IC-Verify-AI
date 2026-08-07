import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, AlertCircle, CheckCircle, RefreshCw, Layers, ShieldCheck, Play, ArrowRight, Eye, Video } from 'lucide-react';
import { apiService, InspectionResult } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Camera scanning state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Core processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  
  // Results
  const [scanResult, setScanResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logsSequence = [
    "Initializing Automated Optical Inspection (AOI)...",
    "Running OpenCV Image Preprocessing: Grayscale & Gaussian Denoise...",
    "Running Canny Edge Detection & Contour Package Parsing...",
    "Running PaddleOCR engine: Extracting marking text...",
    "Running YOLOv8 logo detection: Extracting manufacturer vector...",
    "Comparing font styles and date codes against genuine catalog...",
    "Assessing surface micro-defects and crack overlays...",
    "Compiling AI Authenticity scoring engine...",
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
    // Validate file type
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
  };

  // Camera Handlers
  const startCamera = async () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError(null);
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

  // Run the analysis pipeline
  const runInspection = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingLogs([logsSequence[0]]);
    setScanResult(null);
    
    // Animate processing logs sequentially
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
    }, 450);

    try {
      // 1. Upload
      const uploadRes = await apiService.uploadFile(selectedFile);
      // 2. Analyze
      const analyzeRes = await apiService.analyzeImage(uploadRes.filename, "AI Inspection Engine Node 04");
      
      clearInterval(logInterval);
      setProcessingStep(logsSequence.length - 1);
      setProcessingLogs(logsSequence);
      
      // Delay just a tiny bit for the user to experience the full logs loaded
      await new Promise(r => setTimeout(r, 600));
      
      setScanResult(analyzeRes);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Overview stats header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cardBorder pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">IC Verification & Optical Inspection</h2>
          <p className="text-xs text-gray-400">Trigger high-fidelity inspection scans and verify marking counterfeiting scores.</p>
        </div>
        <div className="flex gap-3">
          {!cameraActive ? (
            <button 
              onClick={startCamera}
              className="px-4 py-2 rounded-lg bg-gray-900 border border-cardBorder text-xs text-gray-300 hover:border-electricCyan/50 hover:text-electricCyan transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Start Real-time Camera
            </button>
          ) : (
            <button 
              onClick={stopCamera}
              className="px-4 py-2 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 hover:bg-red-950/60 transition-all flex items-center gap-2"
            >
              <Video className="w-4 h-4" /> Stop Camera
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Upload & Stage Previews */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Uploader Card */}
          <div className="relative rounded-xl glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-200">IC Capture Input</h3>
            
            {cameraActive ? (
              /* Camera view active */
              <div className="relative rounded-lg overflow-hidden border border-electricCyan/20 bg-black aspect-video max-h-96 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {/* Scanner visual sweeping effect */}
                <div className="absolute left-0 w-full h-[2px] bg-electricCyan/80 neon-glow-cyan animate-pulse top-1/2 -translate-y-1/2" />
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <button 
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-full bg-electricCyan text-background font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-electricCyan/30"
                  >
                    <Camera className="w-4 h-4" /> Capture Marking
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop uploader */
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] ${
                  dragActive 
                    ? 'border-electricCyan bg-electricCyan/5' 
                    : 'border-cardBorder bg-gray-900/30 hover:border-gray-700'
                }`}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".png,.jpg,.jpeg,.bmp"
                  onChange={handleFileInput}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-200">Drag & drop your IC image here, or <span className="text-electricCyan">browse</span></span>
                  <span className="text-[10px] text-gray-500 mt-2">Supports PNG, JPG, JPEG, BMP (Max 8MB)</span>
                </label>
              </div>
            )}

            {/* Upload preview / Actions */}
            {previewUrl && (
              <div className="p-4 rounded-lg bg-gray-900/60 border border-cardBorder flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover border border-cardBorder" />
                  <div>
                    <div className="text-xs font-bold text-gray-200 truncate max-w-[200px]">{selectedFile?.name}</div>
                    <div className="text-[10px] text-gray-500">{(selectedFile!.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-all text-xs"
                    title="Remove File"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={runInspection}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-electricCyan text-background font-bold text-xs hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-lg shadow-electricCyan/20"
                  >
                    {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-background" />}
                    Start AOI
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Running processing visual log overlay */}
          {isProcessing && (
            <div className="p-6 rounded-xl glass-panel-glow-cyan space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-electricCyan flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing AI Inspection
                </span>
                <span className="text-[10px] text-gray-500">Step {processingStep + 1} of {logsSequence.length}</span>
              </div>
              <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-electricCyan h-full transition-all duration-300"
                  style={{ width: `${((processingStep + 1) / logsSequence.length) * 100}%` }}
                />
              </div>
              <div className="bg-black/40 border border-cardBorder rounded-lg p-4 font-mono text-[10px] text-gray-400 h-32 overflow-y-auto space-y-1">
                {processingLogs.map((log, idx) => (
                  <div key={idx} className={`${idx === processingLogs.length - 1 ? 'text-electricCyan' : 'text-gray-500'}`}>
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CV Pipeline Inspection Workflow View */}
          {scanResult && (
            <div className="p-6 rounded-xl glass-panel space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-electricCyan" /> Computer Vision Inspection Stages
                </h3>
                <span className="text-[10px] text-gray-500">OpenCV Preprocessed Stages</span>
              </div>

              {/* Grid of Stages */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold">1. Original Raw</div>
                  <div className="aspect-square bg-black border border-cardBorder rounded-lg overflow-hidden">
                    <img src={scanResult.raw_image_url} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold">2. CV Preprocessed</div>
                  <div className="aspect-square bg-black border border-cardBorder rounded-lg overflow-hidden">
                    <img src={scanResult.processed_image_url} alt="Preprocessed" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold">3. Crop & Segment</div>
                  <div className="aspect-square bg-black border border-cardBorder rounded-lg overflow-hidden">
                    <img src={scanResult.ic_crop_url} alt="Crop" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold">4. Bounding Overlays</div>
                  <div className="aspect-square bg-black border border-cardBorder rounded-lg overflow-hidden">
                    <img src={scanResult.bbox_url} alt="Bounding Box" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Inspection Summary Card */}
        <div className="lg:col-span-5">
          {scanResult ? (
            <div className={`p-6 rounded-xl border flex flex-col justify-between h-full space-y-6 ${
              scanResult.final_decision.includes("COUNTERFEIT") 
                ? 'glass-panel-glow-violet border-red-500/20' 
                : 'glass-panel border-emerald-500/20'
            }`}>
              
              {/* Header result badge */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Analysis Result</div>
                  <h3 className="text-lg font-extrabold text-white">{scanResult.part_number}</h3>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  scanResult.final_decision.includes("COUNTERFEIT")
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 neon-glow-violet'
                    : scanResult.final_decision.includes("SUSPICIOUS")
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 neon-glow-cyan'
                }`}>
                  {scanResult.final_decision.includes("COUNTERFEIT") ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {scanResult.final_decision}
                </span>
              </div>

              {/* Counterfeit meter */}
              <div className="p-4 rounded-lg bg-gray-950/40 border border-cardBorder space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Counterfeit Risk Index</span>
                  <span className={`font-bold ${scanResult.counterfeit_probability > 45 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {scanResult.counterfeit_probability}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      scanResult.counterfeit_probability > 45 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${scanResult.counterfeit_probability}%` }}
                  />
                </div>
              </div>

              {/* Genuine match meter */}
              <div className="p-4 rounded-lg bg-gray-950/40 border border-cardBorder space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-200 font-bold">Genuine Probability</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.max(0, 100 - scanResult.counterfeit_probability)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - scanResult.counterfeit_probability)}%` }}
                  />
                </div>
              </div>

              {/* Data specifications table */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Specifications</div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-900/40 border border-cardBorder/40 rounded p-2">
                    <div className="text-[10px] text-gray-500">Manufacturer</div>
                    <div className="font-semibold text-gray-200 mt-0.5 truncate">{scanResult.manufacturer}</div>
                  </div>
                  <div className="bg-gray-900/40 border border-cardBorder/40 rounded p-2">
                    <div className="text-[10px] text-gray-500">Part Number</div>
                    <div className="font-semibold text-gray-200 mt-0.5">{scanResult.part_number}</div>
                  </div>
                  <div className="bg-gray-900/40 border border-cardBorder/40 rounded p-2">
                    <div className="text-[10px] text-gray-500">Date Code (YYWW)</div>
                    <div className="font-semibold text-gray-200 mt-0.5">{scanResult.date_code}</div>
                  </div>
                  <div className="bg-gray-900/40 border border-cardBorder/40 rounded p-2">
                    <div className="text-[10px] text-gray-500">Batch Number</div>
                    <div className="font-semibold text-gray-200 mt-0.5 truncate">{scanResult.batch_number}</div>
                  </div>
                </div>
              </div>

              {/* Sub-meters for OCR, Logo, Font */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Verification Indexes</div>

                <div className="space-y-2 text-xs">
                  {/* OCR confidence */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">OCR Read Accuracy</span>
                      <span className="text-gray-200 font-semibold">{scanResult.ocr_confidence}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className="bg-electricCyan h-full" style={{ width: `${scanResult.ocr_confidence}%` }} />
                    </div>
                  </div>

                  {/* Logo Similarity */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Logo Matching Matcher</span>
                      <span className={`font-semibold ${scanResult.logo_match < 60 ? 'text-red-400' : 'text-gray-200'}`}>{scanResult.logo_match}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full ${scanResult.logo_match < 60 ? 'bg-red-500' : 'bg-neonViolet'}`} style={{ width: `${scanResult.logo_match}%` }} />
                    </div>
                  </div>

                  {/* Font Similarity */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Font Similarity Index</span>
                      <span className={`font-semibold ${scanResult.font_similarity < 60 ? 'text-red-400' : 'text-gray-200'}`}>{scanResult.font_similarity}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full ${scanResult.font_similarity < 60 ? 'bg-red-500' : 'bg-neonViolet'}`} style={{ width: `${scanResult.font_similarity}%` }} />
                    </div>
                  </div>

                  {/* Surface Quality */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Surface Defect Index</span>
                      <span className={`font-semibold ${scanResult.surface_quality < 80 ? 'text-amber-400' : 'text-gray-200'}`}>{scanResult.surface_quality}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full ${scanResult.surface_quality < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${scanResult.surface_quality}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Details Button */}
              <div className="pt-2">
                <button 
                  onClick={() => navigate(`/history`)} 
                  className="w-full py-2.5 rounded-lg bg-gray-900 border border-cardBorder text-xs text-gray-300 font-semibold hover:border-electricCyan/50 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  View Scan Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-xl border border-cardBorder glass-panel flex flex-col items-center justify-center text-center h-full min-h-[350px]">
              <div className="w-14 h-14 rounded-full bg-gray-900 border border-cardBorder flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-gray-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-300">Awaiting AOI Inspection Scan</h4>
              <p className="text-xs text-gray-500 mt-2 max-w-xs">Upload an image or start the camera feed and capture markings to run the computer vision analysis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
