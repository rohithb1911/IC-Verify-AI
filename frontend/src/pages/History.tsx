import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, Download, Play, AlertTriangle, CheckCircle2, XCircle, Info, ChevronRight, X } from 'lucide-react';
import { apiService, InspectionResult } from '../services/api';
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
    if (filterDecision === 'GENUINE') return item.final_decision === 'GENUINE';
    if (filterDecision === 'COUNTERFEIT') return item.final_decision.includes('COUNTERFEIT') || item.final_decision.includes('SUSPICIOUS');
    return true;
  });

  // Export CSV
  const exportToCSV = (item: InspectionResult) => {
    const headers = [
      "Inspection ID", "Date", "Part Number", "Manufacturer", "OCR Text",
      "OCR Confidence", "Logo Match", "Font Similarity", "Surface Quality",
      "Counterfeit Probability", "Decision", "Inspector"
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
      item.final_decision,
      item.inspector_name || "AI Engine"
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
    doc.setFillColor(3, 7, 18); // Dark Background #030712
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(6, 182, 212); // Electric Cyan #06B6D4
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("IC VERIFY AI", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Smart India Hackathon 2026 - Automated Optical Inspection (AOI)", 15, 27);
    doc.text(`Inspector: ${item.inspector_name || "AI Engine Node 04"}`, 15, 33);

    // Date / Report Header
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 140, 33);

    // 2. Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INSPECTION ANALYSIS REPORT", 15, 55);

    // Draw horizontal line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 58, 195, 58);

    // Metadata Table Grid
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Device Specification", 15, 68);
    doc.text("AOI Test Verification Metrics", 110, 68);

    doc.setFont("helvetica", "normal");
    
    // Left column
    doc.text(`Part Number: ${item.part_number}`, 15, 76);
    doc.text(`Manufacturer: ${item.manufacturer}`, 15, 83);
    doc.text(`Date Code (YYWW): ${item.date_code}`, 15, 90);
    doc.text(`Batch Code: ${item.batch_number || "N/A"}`, 15, 97);
    
    // Right column
    doc.text(`OCR Confidence: ${item.ocr_confidence}%`, 110, 76);
    doc.text(`Logo Match Score: ${item.logo_match}%`, 110, 83);
    doc.text(`Font Similarity: ${item.font_similarity}%`, 110, 90);
    doc.text(`Surface Defects Score: ${item.surface_quality}%`, 110, 97);

    // 3. Counterfeit Analysis
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 110, 180, 25, 'F');
    doc.setDrawColor(item.final_decision.includes("COUNTERFEIT") ? 239 : 16, item.final_decision.includes("COUNTERFEIT") ? 68 : 185, item.final_decision.includes("COUNTERFEIT") ? 68 : 129); // Red or Emerald border
    doc.rect(15, 110, 180, 25);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(item.final_decision.includes("COUNTERFEIT") ? 239 : 16, item.final_decision.includes("COUNTERFEIT") ? 68 : 185, item.final_decision.includes("COUNTERFEIT") ? 68 : 129);
    doc.setFontSize(12);
    doc.text(`DECISION: ${item.final_decision}`, 22, 118);
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Genuine Component Match: ${Math.max(0, 100 - item.counterfeit_probability)}%  |  Counterfeit Risk: ${item.counterfeit_probability}%`, 22, 124);
    doc.text(`Verified against genuine device reference catalog rules.`, 22, 129);

    // 4. Detected OCR markings text
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Extracted Markings Text", 15, 150);
    
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 153, 180, 12, 'F');
    doc.text(item.detected_text, 22, 161);

    // 5. Details Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CV Defect & Alignment Assessment Summary:", 15, 180);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const details = [
      `1. Logo Matching: The logo template match index was evaluated at ${item.logo_match}%.`,
      `2. Font Check: Text characters match catalog typography at ${item.font_similarity}%.`,
      `3. Surface Quality: A scratch density check detected surface defect score of ${item.surface_quality}%.`,
      `4. Date Code Verification: Chip manufactured year/week code: ${item.date_code}.`
    ];
    
    details.forEach((det, idx) => {
      doc.text(det, 15, 188 + (idx * 6));
    });

    // 6. Signatures block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Verification Analyst Sign-off", 15, 240);
    doc.line(15, 243, 75, 243);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("AOI Inspection Engine v1.4", 15, 247);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("SIH Nodal Center Officer", 130, 240);
    doc.line(130, 243, 190, 243);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Official Inspection Stamp Area", 130, 247);

    // Save
    doc.save(`IC_Inspection_Report_${item.part_number}_${item.id}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cardBorder pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inspection History Logs</h2>
          <p className="text-xs text-gray-400">View, search, filter, and export report files for all completed inspections.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-electricCyan to-blue-500 text-background font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-background" /> Start New Inspection
        </button>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <input
            type="text"
            placeholder="Search by part number or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900/60 border border-cardBorder text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-electricCyan transition-all"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
        </div>

        <div className="md:col-span-4 flex gap-2">
          <div className="w-full relative">
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-900/60 border border-cardBorder text-xs text-gray-300 focus:outline-none focus:border-electricCyan appearance-none"
            >
              <option value="ALL">All Scan Decisions</option>
              <option value="GENUINE">Genuine Only</option>
              <option value="COUNTERFEIT">Counterfeit / Remarks Only</option>
            </select>
            <Filter className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl glass-panel overflow-hidden border border-cardBorder">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-electricCyan border-t-transparent rounded-full animate-spin" />
            <span>Loading historical logs...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No inspection logs match your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cardBorder bg-gray-950/50 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Part Number</th>
                  <th className="p-4">Manufacturer</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Decision</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBorder/60">
                {filteredHistory.map((item) => {
                  const isFake = item.final_decision.includes("COUNTERFEIT") || item.final_decision.includes("SUSPICIOUS");
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-900/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedInspection(item)}
                    >
                      <td className="p-4 font-semibold text-gray-500">#{item.id}</td>
                      <td className="p-4 text-gray-400">{new Date(item.timestamp).toLocaleString()}</td>
                      <td className="p-4 font-bold text-gray-200 group-hover:text-electricCyan transition-colors">{item.part_number}</td>
                      <td className="p-4 text-gray-400">{item.manufacturer}</td>
                      <td className="p-4 text-center">
                        <span className={`font-bold ${isFake ? 'text-red-400' : 'text-emerald-400'}`}>
                          {item.counterfeit_probability}%
                        </span>
                        <span className="text-[10px] text-gray-600 block">risk</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                          isFake 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isFake ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {item.final_decision}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => generatePDFReport(item)}
                          className="p-1.5 rounded bg-gray-900 border border-cardBorder text-gray-400 hover:text-white hover:border-electricCyan/50 transition-all"
                          title="Download PDF Inspection Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportToCSV(item)}
                          className="p-1.5 rounded bg-gray-900 border border-cardBorder text-gray-400 hover:text-white hover:border-electricCyan/50 transition-all"
                          title="Export CSV Metadata"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedInspection(item)}
                          className="p-1.5 rounded bg-gray-900 border border-cardBorder text-gray-400 hover:text-white hover:border-electricCyan/50 transition-all"
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

      {/* Result Detail Modal (The Result Page view requested by user) */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl glass-panel-glow-cyan border border-cardBorder p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            
            {/* Close */}
            <button 
              onClick={() => setSelectedInspection(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-900 border border-cardBorder text-gray-400 hover:text-white hover:border-red-500/40 hover:bg-red-950/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-cardBorder pb-4">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">SIH inspection result page</span>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                  Part Verification Report: <span className="text-electricCyan">{selectedInspection.part_number}</span>
                </h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => generatePDFReport(selectedInspection)}
                  className="px-4 py-2 rounded-lg bg-electricCyan text-background font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download PDF Report
                </button>
                <button
                  onClick={() => exportToCSV(selectedInspection)}
                  className="px-4 py-2 rounded-lg bg-gray-900 border border-cardBorder text-gray-300 font-bold text-xs hover:border-gray-700 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            {/* Main Visualizer split */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Visual CV Steps */}
              <div className="md:col-span-7 space-y-4">
                <div className="text-xs font-bold text-gray-400">Computer Vision Inspection Steps</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-semibold">Original Image</span>
                    <div className="aspect-video bg-black border border-cardBorder rounded-lg overflow-hidden">
                      <img src={selectedInspection.raw_image_url} alt="Raw" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-semibold">Denoised & Preprocessed</span>
                    <div className="aspect-video bg-black border border-cardBorder rounded-lg overflow-hidden">
                      <img src={selectedInspection.processed_image_url} alt="Processed" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-semibold">Detected IC package (Crop)</span>
                    <div className="aspect-video bg-black border border-cardBorder rounded-lg overflow-hidden">
                      <img src={selectedInspection.ic_crop_url} alt="Crop" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-semibold">Defects Contour Overlay</span>
                    <div className="aspect-video bg-black border border-cardBorder rounded-lg overflow-hidden">
                      <img src={selectedInspection.defect_url || selectedInspection.bbox_url} alt="Defect" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Text extract Courier box */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold">Extracted OCR Markings Font Content</span>
                  <div className="p-3 bg-black border border-cardBorder rounded-lg font-mono text-xs text-gray-300 flex justify-between items-center">
                    <span>{selectedInspection.detected_text}</span>
                    <span className="text-[10px] text-gray-500">Confidence: {selectedInspection.ocr_confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Score Summary */}
              <div className="md:col-span-5 space-y-4">
                <div className="text-xs font-bold text-gray-400">Authenticity Scorecard</div>
                
                {/* Decision Alert */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  selectedInspection.final_decision.includes("COUNTERFEIT")
                    ? 'bg-red-500/10 border-red-500/25 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                }`}>
                  {selectedInspection.final_decision.includes("COUNTERFEIT") ? <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">{selectedInspection.final_decision}</h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {selectedInspection.final_decision.includes("COUNTERFEIT")
                        ? "Warning: Marking parameters don't match the genuine device database standard guidelines."
                        : "Device marking specifications align with standard factory datasheet regulations."
                      }
                    </p>
                  </div>
                </div>

                {/* Score list */}
                <div className="space-y-3 bg-gray-900/30 border border-cardBorder/60 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Counterfeit Probability</span>
                    <span className={`font-bold ${selectedInspection.counterfeit_probability > 45 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {selectedInspection.counterfeit_probability}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-200 font-bold">Percentage of Genuine</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {Math.max(0, 100 - selectedInspection.counterfeit_probability)}%
                    </span>
                  </div>
                  
                  <hr className="border-cardBorder" />

                  <div className="flex justify-between">
                    <span className="text-gray-400">Manufacturer Match</span>
                    <span className="text-gray-200 font-semibold">{selectedInspection.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Logo Template Similarity</span>
                    <span className="text-gray-200 font-semibold">{selectedInspection.logo_match}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Marking Typographical Font Match</span>
                    <span className="text-gray-200 font-semibold">{selectedInspection.font_similarity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Surface Defect Quality</span>
                    <span className="text-gray-200 font-semibold">{selectedInspection.surface_quality}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date Code (YYWW)</span>
                    <span className="text-gray-200 font-semibold">{selectedInspection.date_code}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500">
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
