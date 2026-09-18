import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, FileText, Download, Play, AlertTriangle, 
  CheckCircle2, XCircle, Info, ChevronRight, X, Activity, Scissors, Flame, CheckCircle
} from 'lucide-react';
import { apiService, InspectionResult, DamageDefect } from '../services/api';
import { jsPDF } from 'jspdf';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<InspectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDecision, setFilterDecision] = useState('ALL');
  
  // Selected inspection for detailed result view
  const [selectedInspection, setSelectedInspection] = useState<InspectionResult | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiService.getHistory(search);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search]);

  const filteredHistory = history.filter(item => {
    if (filterDecision === 'ALL') return true;
    if (filterDecision === 'GENUINE') {
      return item.final_decision.includes('GENUINE') && !item.damage_detected;
    }
    if (filterDecision === 'COUNTERFEIT') {
      return item.final_decision.includes('COUNTERFEIT') || item.final_decision.includes('SUSPICIOUS');
    }
    if (filterDecision === 'DAMAGED') {
      return item.damage_detected || (item.damage_count && item.damage_count > 0);
    }
    return true;
  });

  // Export CSV
  const exportToCSV = (item: InspectionResult) => {
    const headers = [
      "Inspection ID", "Date", "Part Number", "Manufacturer", "OCR Text",
      "OCR Confidence", "Logo Match", "Font Similarity", "Surface Quality",
      "Counterfeit Probability", "Physical Integrity", "Damage Detected",
      "Damage Defect Count", "Damage Severity", "Decision", "Inspector"
    ];
    
    const rows = [
      item.id,
      new Date(item.timestamp).toLocaleString(),
      item.part_number,
      item.manufacturer,
      `"${item.detected_text}"`,
      `${item.ocr_confidence}%`,
      `${item.logo_match}%`,
      `${item.font_similarity}%`,
      `${item.surface_quality}%`,
      `${item.counterfeit_probability}%`,
      `${item.physical_integrity ?? 100}%`,
      item.damage_detected ? "YES" : "NO",
      item.damage_count || 0,
      item.damage_severity || "NONE",
      item.final_decision,
      item.inspector_name || "AI Engine Node 04"
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), rows.join(",")].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IC_Verification_Report_${item.part_number}_${item.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Professional PDF Report
  const generatePDFReport = (item: InspectionResult) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Header Banner
    doc.setFillColor(3, 7, 18);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(6, 182, 212);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("IC VERIFY AI", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Industrial Automated Optical & Damage Inspection (AOI) Suite", 15, 27);
    doc.text(`Inspector: ${item.inspector_name || "AI Inspection Engine Node 04"}`, 15, 33);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 140, 33);

    // 2. Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INSPECTION & DAMAGE ANALYSIS REPORT", 15, 52);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 55, 195, 55);

    // Metadata Table Grid
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Device Specification", 15, 64);
    doc.text("AOI Test Verification Metrics", 110, 64);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    // Left column
    doc.text(`Part Number: ${item.part_number}`, 15, 71);
    doc.text(`Manufacturer: ${item.manufacturer}`, 15, 77);
    doc.text(`Date Code (YYWW): ${item.date_code}`, 15, 83);
    doc.text(`Batch Code: ${item.batch_number || "N/A"}`, 15, 89);
    
    // Right column
    doc.text(`Physical Integrity: ${item.physical_integrity ?? 100}%`, 110, 71);
    doc.text(`Damage Detected: ${item.damage_detected ? `YES (${item.damage_count} defects)` : 'NO (Intact)'}`, 110, 77);
    doc.text(`OCR Confidence: ${item.ocr_confidence}%`, 110, 83);
    doc.text(`Logo Match Score: ${item.logo_match}%`, 110, 89);

    // 3. Overall Decision Box
    const isRejected = item.final_decision.includes("REJECTED") || item.final_decision.includes("COUNTERFEIT");
    const isDefective = item.final_decision.includes("DEFECTIVE");
    const isSuspicious = item.final_decision.includes("SUSPICIOUS");
    const rColor = isRejected ? [239, 68, 68] : (isDefective || isSuspicious) ? [245, 158, 11] : [16, 185, 129];

    doc.setFillColor(248, 250, 252);
    doc.rect(15, 96, 180, 24, 'F');
    doc.setDrawColor(rColor[0], rColor[1], rColor[2]);
    doc.rect(15, 96, 180, 24);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(rColor[0], rColor[1], rColor[2]);
    doc.setFontSize(11);
    doc.text(`VERDICT: ${item.final_decision}`, 22, 104);
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Authenticity Risk: ${item.counterfeit_probability}%  |  Physical Integrity: ${item.physical_integrity ?? 100}%  |  Damage Severity: ${item.damage_severity || 'NONE'}`, 22, 110);
    doc.text(`Component verified against genuine catalog rules and IPC surface damage criteria.`, 22, 115);

    // 4. Physical Damage Defect Findings
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Physical Damage & Defect Findings:", 15, 129);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    if (item.damages && item.damages.length > 0) {
      item.damages.slice(0, 4).forEach((d: DamageDefect, idx: number) => {
        doc.text(`• [${d.severity.toUpperCase()}] ${d.type}: ${d.description} (Conf: ${d.confidence}%, BBox: [${d.bbox.join(',')}])`, 18, 136 + (idx * 5.5));
      });
    } else {
      doc.text("• Package physically intact: Zero structural cracks, edge chipping, or burn voids detected.", 18, 136);
    }

    // 5. Extracted OCR Markings
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Extracted Markings Text", 15, 165);
    
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 168, 180, 10, 'F');
    doc.text(item.detected_text, 22, 175);

    // 6. Technical Assessment Checklist
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AOI Diagnostic Telemetry:", 15, 188);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const details = [
      `1. Logo Matching: Evaluated at ${item.logo_match}% against factory vector database.`,
      `2. Font Typography: Character glyph structure checked at ${item.font_similarity}% match.`,
      `3. Surface Quality Score: Surface roughness & texture measured at ${item.surface_quality}%.`,
      `4. Date Code Verification: Decoded YYWW date code (${item.date_code}) validated for operational validity.`
    ];
    
    details.forEach((det, idx) => {
      doc.text(det, 15, 195 + (idx * 5));
    });

    // 7. Signatures block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Verification Analyst Sign-off", 15, 240);
    doc.line(15, 243, 75, 243);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("AOI Inspection Engine Node 04", 15, 247);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Chief Quality Assurance Officer", 130, 240);
    doc.line(130, 243, 190, 243);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Official Inspection Stamp Area", 130, 247);

    // Save
    doc.save(`IC_Inspection_Report_${item.part_number}_${item.id}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
         {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inspection History & Damage Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">Search, filter by damage condition, and export detailed inspection reports.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-md bg-[#0B4F9C] hover:bg-[#093e7a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" /> Start New Inspection
        </button>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <input
            type="text"
            placeholder="Search by part number, manufacturer, or defect..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0B4F9C] focus:ring-1 focus:ring-[#0B4F9C] transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="md:col-span-4 flex gap-2">
          <div className="w-full relative">
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B4F9C] focus:ring-1 focus:ring-[#0B4F9C] appearance-none shadow-xs cursor-pointer"
            >
              <option value="ALL">All Scan Records</option>
              <option value="DAMAGED">Damaged / Defective Only</option>
              <option value="GENUINE">Genuine & Intact Only</option>
              <option value="COUNTERFEIT">Counterfeit Markings Only</option>
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-lg bg-white overflow-hidden border border-slate-200 shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#0B4F9C] border-t-transparent rounded-full animate-spin"></div>
            Loading historical scans...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No inspection records match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Part Number</th>
                  <th className="py-2.5 px-4">Manufacturer</th>
                  <th className="py-2.5 px-4 text-center">Package Quality</th>
                  <th className="py-2.5 px-4 text-center">Risk Score</th>
                  <th className="py-2.5 px-4 text-center">Verdict</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => {
                  const isRejected = item.final_decision.includes("REJECTED") || item.final_decision.includes("COUNTERFEIT");
                  const isDefective = item.final_decision.includes("DEFECTIVE");
                  const isSuspicious = item.final_decision.includes("SUSPICIOUS");

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedInspection(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        #{item.id}
                      </td>
                      
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {item.part_number}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {item.manufacturer}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.damage_detected ? (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F57C00] text-white inline-flex items-center gap-1">
                            {item.damage_count} Defect{item.damage_count > 1 ? 's' : ''} ({item.physical_integrity}%)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F8EE] text-[#168846] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Intact (100%)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-bold ${item.counterfeit_probability > 45 ? 'text-[#DC2626]' : item.counterfeit_probability > 18 ? 'text-[#EA580C]' : 'text-slate-800'}`}>
                          {item.counterfeit_probability}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                          isRejected 
                            ? 'bg-[#DC2626] text-white' 
                            : isDefective || isSuspicious
                              ? 'bg-[#F57C00] text-white'
                              : 'bg-[#E8F8EE] text-[#168846]'
                        }`}>
                          {item.final_decision}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => generatePDFReport(item)}
                          className="p-1 rounded bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Download PDF Inspection Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportToCSV(item)}
                          className="p-1 rounded bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Export CSV Metadata"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedInspection(item)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-cardBorder text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
                          title="Inspect Detailed Visual Metrics"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-cardBorder p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            
            {/* Close */}
            <button 
              onClick={() => setSelectedInspection(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-cardBorder pb-4">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">AOI Optical & Damage Audit Dossier</span>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                  Inspection Report: <span className="text-[#0B4F9C]">{selectedInspection.part_number}</span>
                </h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => generatePDFReport(selectedInspection)}
                  className="px-4 py-2 rounded-md bg-[#0B4F9C] hover:bg-[#093e7a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF Report
                </button>
                <button
                  onClick={() => exportToCSV(selectedInspection)}
                  className="px-4 py-2 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            {/* Main Visualizer split */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Visual CV Steps */}
              <div className="md:col-span-7 space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-gray-400">Computer Vision Inspection Steps</div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-gray-500 font-semibold">1. Original Capture</span>
                    <div className="aspect-video bg-slate-100 dark:bg-black border border-slate-200 dark:border-cardBorder rounded-xl overflow-hidden shadow-inner">
                      <img src={selectedInspection.raw_image_url} alt="Raw" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-gray-500 font-semibold">2. Denoised & Threshold</span>
                    <div className="aspect-video bg-slate-100 dark:bg-black border border-slate-200 dark:border-cardBorder rounded-xl overflow-hidden shadow-inner">
                      <img src={selectedInspection.processed_image_url} alt="Processed" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-gray-500 font-semibold">3. Cropped IC</span>
                    <div className="aspect-video bg-slate-100 dark:bg-black border border-slate-200 dark:border-cardBorder rounded-xl overflow-hidden shadow-inner">
                      <img src={selectedInspection.ic_crop_url} alt="Crop" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-gray-500 font-semibold">4. Marking Boxes</span>
                    <div className="aspect-video bg-slate-100 dark:bg-black border border-slate-200 dark:border-cardBorder rounded-xl overflow-hidden shadow-inner">
                      <img src={selectedInspection.bbox_url} alt="BBox" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] text-rose-600 dark:text-red-400 font-semibold flex items-center gap-1">
                      <Activity className="w-3 h-3" /> 5. Damage & Defect Overlay Map
                    </span>
                    <div className="aspect-video bg-slate-100 dark:bg-black border border-rose-300 dark:border-red-500/40 rounded-xl overflow-hidden ring-1 ring-rose-300/40 shadow-inner">
                      <img src={selectedInspection.damage_image_url || selectedInspection.defect_url} alt="Damage Map" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Extracted Markings */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 dark:text-gray-500 font-semibold">Extracted OCR Markings Font Content</span>
                  <div className="p-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-cardBorder rounded-xl font-mono text-xs text-slate-800 dark:text-gray-300 flex justify-between items-center shadow-inner">
                    <span>{selectedInspection.detected_text}</span>
                    <span className="text-[10px] text-slate-400 dark:text-gray-500">Confidence: {selectedInspection.ocr_confidence}%</span>
                  </div>
                </div>

                {/* Defect Items breakdown */}
                {selectedInspection.damages && selectedInspection.damages.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-cardBorder/40">
                    <span className="text-[10px] text-rose-600 dark:text-red-400 font-bold uppercase tracking-wider">Identified Defect Zones:</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedInspection.damages.map((d: DamageDefect) => (
                        <div key={d.id} className="p-3 rounded-xl bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-cardBorder text-xs space-y-1 shadow-sm">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                              {d.type.includes("Crack") ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> : <Scissors className="w-3.5 h-3.5 text-amber-600" />}
                              {d.type}
                            </span>
                            <span className="text-[10px] font-bold text-rose-600 uppercase">{d.severity}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-gray-400">{d.description}</p>
                          <div className="flex justify-between text-[10px] text-slate-400 dark:text-gray-500">
                            <span>Confidence: {d.confidence}%</span>
                            <span>BBox: [{d.bbox.join(', ')}]</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Score Summary */}
              <div className="md:col-span-5 space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-gray-400">Authenticity & Integrity Scorecard</div>
                
                {/* Decision Alert */}
                {(() => {
                  const isRej = selectedInspection.final_decision.includes("REJECTED") || selectedInspection.final_decision.includes("COUNTERFEIT");
                  const isDef = selectedInspection.final_decision.includes("DEFECTIVE");
                  const isSusp = selectedInspection.final_decision.includes("SUSPICIOUS");

                  return (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                      isRej
                        ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'
                        : isDef || isSusp
                          ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-400'
                    }`}>
                      {isRej ? (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
                      ) : isDef || isSusp ? (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                      )}
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider">{selectedInspection.final_decision}</h4>
                        <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1">
                          {isDef 
                            ? `Authentic IC markings verified, but packaging structural defects detected (${selectedInspection.damage_count} instances).`
                            : isRej
                              ? "Marking typography, logo vectors, or date code mismatch registered catalog standards."
                              : isSusp
                                ? "Minor marking variations identified. Secondary inspection advised."
                                : "Device packaging and markings conform with standard factory datasheet specifications."
                          }
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Score list */}
                <div className="space-y-3 bg-slate-50 dark:bg-gray-900/30 border border-slate-200 dark:border-cardBorder/60 rounded-xl p-4 text-xs shadow-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Physical Integrity Index</span>
                    <span className={`font-bold ${selectedInspection.physical_integrity < 75 ? 'text-rose-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {selectedInspection.physical_integrity}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Counterfeit Risk</span>
                    <span className={`font-bold ${selectedInspection.counterfeit_probability > 45 ? 'text-rose-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {selectedInspection.counterfeit_probability}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-gray-400">Damage Severity Rating</span>
                    <span className={`font-bold uppercase ${selectedInspection.damage_detected ? 'text-rose-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {selectedInspection.damage_severity || "NONE"}
                    </span>
                  </div>
                  
                  <hr className="border-slate-200 dark:border-cardBorder" />

                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Manufacturer</span>
                    <span className="text-slate-800 dark:text-gray-200 font-semibold">{selectedInspection.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Logo Template Similarity</span>
                    <span className="text-slate-800 dark:text-gray-200 font-semibold">{selectedInspection.logo_match}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Marking Font Match</span>
                    <span className="text-slate-800 dark:text-gray-200 font-semibold">{selectedInspection.font_similarity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Surface Quality Metric</span>
                    <span className="text-slate-800 dark:text-gray-200 font-semibold">{selectedInspection.surface_quality}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Date Code (YYWW)</span>
                    <span className="text-slate-800 dark:text-gray-200 font-semibold">{selectedInspection.date_code}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-gray-500">
                  <span>Inspection ID: #{selectedInspection.id}</span>
                  <span>Date: {new Date(selectedInspection.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
