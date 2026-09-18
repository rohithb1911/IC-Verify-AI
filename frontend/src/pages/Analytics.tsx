import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, Activity, AlertTriangle, Cpu, TrendingUp, 
  RefreshCw, Download, Filter, Search, CheckCircle2, 
  FileCode, FileSpreadsheet, ShieldAlert, Sparkles, Layers,
  CheckCircle, ArrowUpDown, ChevronRight, Terminal
} from 'lucide-react';
import { apiService, AnalyticsData, SystemLog } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [selectedNode, setSelectedNode] = useState('all');
  const [selectedDefectType, setSelectedDefectType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const stats = await apiService.getAnalytics();
      const logsList = await apiService.getLogs();
      setData(stats);
      setLogs(logsList);
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch latest analytics telemetry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const DEFECT_COLORS = ['#e11d48', '#f97316', '#f59e0b', '#7c3aed'];

  const handleExport = (format: 'json' | 'csv') => {
    if (!data) return;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ic_verify_analytics_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("Telemetry JSON exported successfully.");
    } else {
      let csv = "Metric,Value\n";
      csv += `Total Inspected,${data.totalInspections}\n`;
      csv += `Counterfeits Flagged,${data.counterfeitCount}\n`;
      csv += `Damaged Chips,${data.damagedCount || 0}\n`;
      csv += `Avg Physical Integrity,${data.avgPhysicalIntegrity || 96.4}%\n`;
      csv += `Pass Success Rate,${data.successRate}%\n`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ic_verify_analytics_summary_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("Telemetry CSV table exported successfully.");
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'ALL' && log.level !== logFilter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading || !data) {
    return (
      <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center min-h-[500px] gap-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-semibold text-slate-700">Loading AOI analytics dashboard telemetry...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in text-slate-800 pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Section (Matching Reference Database Header) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#0B4F9C]" />
            AOI Optical & Damage Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Telemetry of physical integrity scores, structural defect classifications, and counterfeit rates across inspection nodes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Live indicator badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Node Telemetry</span>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer"
            title="Refresh AOI metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-[#0B4F9C]' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button 
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B4F9C] hover:bg-[#083D7A] text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Telemetry</span>
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 hidden group-hover:block z-20">
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-600" />
                <span>JSON Telemetry</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV Summary</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Top 5 KPI Summary Cards (Matching Reference Database Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Scanned */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Inspected</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active Fleet
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{data.totalInspections}</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.4% MoM
            </span>
          </div>
        </div>

        {/* Card 2: Counterfeits Flagged */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Counterfeits Flagged</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              Marking Mismatch
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 tracking-tight">{data.counterfeitCount}</span>
            <span className="text-[11px] font-normal text-slate-400">High Risk Chips</span>
          </div>
        </div>

        {/* Card 3: Damaged Chips */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Damaged Chips</span>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
              Physical Defects
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 tracking-tight">{data.damagedCount || 0}</span>
            <span className="text-[11px] font-semibold text-rose-600">({data.defectRate || 0}% rate)</span>
          </div>
        </div>

        {/* Card 4: Avg Physical Integrity */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Avg Physical Integrity</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
              Ra Calibrated
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{data.avgPhysicalIntegrity || 96.4}%</span>
            <span className="text-[11px] font-normal text-slate-400">Package Spec</span>
          </div>
        </div>

        {/* Card 5: Pass Success Rate */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pass Success Rate</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              JEDEC Verified
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 tracking-tight">{data.successRate}%</span>
            <span className="text-[11px] font-normal text-slate-400">Pristine Grade</span>
          </div>
        </div>

      </div>

      {/* 3. Filter Toolbar (Matching Reference Database Toolbar) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm space-y-3">
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200 mr-1.5">
                FILTER
              </span>
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit action logs, node events, or defect notes..."
              className="w-full pl-20 pr-16 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-2xs">
                ALT+F
              </span>
            </div>
          </div>

          {/* Time Horizon Segmented Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
            {(['24h', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase cursor-pointer ${
                  timeRange === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>

        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Inspection Node:</span>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-white cursor-pointer"
            >
              <option value="all">All Inspection Nodes</option>
              <option value="node-01">Node 01 - Incoming Receiving</option>
              <option value="node-02">Node 02 - SMT Feeder Line</option>
              <option value="node-04">Node 04 - High-Res Optical AOI</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Defect Filter:</span>
            <select
              value={selectedDefectType}
              onChange={(e) => setSelectedDefectType(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-white cursor-pointer"
            >
              <option value="all">All Defect Classes</option>
              <option value="laser">Laser Re-marking</option>
              <option value="crack">Crack & Fracture</option>
              <option value="chipping">Edge Chipping</option>
              <option value="thermal">Thermal Burn</option>
            </select>
          </div>

          {(selectedNode !== 'all' || selectedDefectType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedNode('all');
                setSelectedDefectType('all');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-[11px] text-slate-400 font-medium">
            Timeline Horizon: <strong className="text-slate-700 uppercase">{timeRange} Telemetry</strong>
          </div>

        </div>

      </div>

      {/* 4. MAIN CHARTS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Trend Area Chart (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-1 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0B4F9C]" /> Daily Inspections & Defect Trends
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Time-series distribution of scanned chips, detected counterfeits, and physical cracks.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
              7-Day Rolling Buffer
            </span>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyInspections} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B4F9C" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0B4F9C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCounterfeits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDamaged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    fontSize: 11, 
                    color: '#0f172a', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                <Area type="monotone" dataKey="inspections" stroke="#0B4F9C" strokeWidth={2} name="Total Inspected" fillOpacity={1} fill="url(#colorInspections)" />
                <Area type="monotone" dataKey="counterfeits" stroke="#f59e0b" strokeWidth={2} name="Counterfeits Flagged" fillOpacity={1} fill="url(#colorCounterfeits)" />
                <Area type="monotone" dataKey="damaged" stroke="#dc2626" strokeWidth={2} name="Physical Damage Detected" fillOpacity={1} fill="url(#colorDamaged)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Damage Defect Classification Donut (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-1 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Physical Defect Classification
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Semantic CV damage segmentation.</p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              OpenCV CV2
            </span>
          </div>
          
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.damageDistribution || [
                    { name: "Crack / Fracture", value: 6 },
                    { name: "Edge Chipping", value: 4 },
                    { name: "Surface Scratch", value: 8 },
                    { name: "Thermal Burn", value: 2 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data.damageDistribution || []).map((_, index) => (
                    <Cell key={`defect-cell-${index}`} fill={DEFECT_COLORS[index % DEFECT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    fontSize: 11, 
                    color: '#0f172a', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xl font-black text-rose-600 tracking-tight">{data.damagedCount || 0}</div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Defects</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
            {(data.damageDistribution || []).map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 border border-slate-100 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DEFECT_COLORS[index % DEFECT_COLORS.length] }} />
                <span className="truncate font-medium">{entry.name}</span>
                <strong className="ml-auto text-slate-900 font-mono text-[11px]">{entry.value}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. SECONDARY ROW: Manufacturer Distribution & Live Node Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Manufacturer Distribution Bar Chart (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-1 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0B4F9C]" /> Manufacturer Inspection Distribution
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Breakdown of inspected chips grouped by primary semiconductor vendor.</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">JEDEC MFRs</span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.manufacturerDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    fontSize: 11, 
                    color: '#0f172a', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
                  }} 
                />
                <Bar dataKey="value" name="Scanned Count" fill="#0B4F9C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Tech Live Inspection Terminal Logs (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" /> Live AOI Node Action & Audit Stream
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time telemetry messages generated by CV inference pipeline.</p>
            </div>

            {/* Log Level Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              {(['ALL', 'INFO', 'WARNING', 'ERROR'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    logFilter === lvl
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Box (matching ReferenceDatabase inspection specimen aesthetic) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-slate-300 h-64 overflow-y-auto space-y-1.5 shadow-inner">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-600">
                No telemetry logs matching the selected filter criteria.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-slate-900/80 p-1 rounded transition-colors">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                    log.level === 'ERROR' 
                      ? 'bg-rose-950 text-rose-400 border border-rose-800/80' 
                      : log.level === 'WARNING'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                        : 'bg-sky-950 text-sky-400 border border-sky-800/80'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-300 break-all font-medium">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              FastAPI Optical Pipeline connected (Socket /stream/telemetry)
            </span>
            <span className="font-mono">Showing {filteredLogs.length} events</span>
          </div>

        </div>

      </div>

    </div>
  );
}
