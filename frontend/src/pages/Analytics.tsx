import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar 
} from 'recharts';
import { ShieldCheck, BarChart3, Activity, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';
import { apiService, AnalyticsData, SystemLog } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await apiService.getAnalytics();
      const logsList = await apiService.getLogs();
      setData(stats);
      setLogs(logsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#06B6D4', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-electricCyan border-t-transparent rounded-full animate-spin" />
        <span>Loading analytics dashboard...</span>
      </div>
    );
  }

  // Radial bar chart format for detection accuracy
  const accuracyData = [
    { name: 'System Accuracy', value: data.systemAccuracy, fill: '#06B6D4' },
    { name: 'Target Accuracy', value: 100, fill: '#1f2937' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-cardBorder pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-electricCyan" /> AOI Performance Analytics
        </h2>
        <p className="text-xs text-gray-400">Real-time statistics of scanning indices, counterfeits detection ratios, and node details.</p>
      </div>

      {/* Grid of 4 Quick Metrics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-2">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Scanned</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{data.totalInspections}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +12%</span>
          </div>
          <div className="text-[10px] text-gray-500">Inspections across all nodes</div>
        </div>

        <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-2">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Counterfeits Flagged</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-400">{data.counterfeitCount}</span>
            <span className="text-[10px] text-gray-500">Chips</span>
          </div>
          <div className="text-[10px] text-gray-500">Mismatched markings/logos</div>
        </div>

        <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-2">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pass Success Rate</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">{data.successRate}%</span>
            <span className="text-[10px] text-gray-500">Genuine</span>
          </div>
          <div className="text-[10px] text-gray-500">Verified factory components</div>
        </div>

        <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-2">
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">AI System Accuracy</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-electricCyan">{data.systemAccuracy}%</span>
            <span className="text-[10px] text-gray-500">F1 Score</span>
          </div>
          <div className="text-[10px] text-gray-500">Based on verified standard datasets</div>
        </div>
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Area Chart (Daily scans vs counterfeits) */}
        <div className="lg:col-span-8 rounded-xl glass-panel p-5 border border-cardBorder space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-electricCyan" /> Daily Inspections Trend
            </h3>
            <span className="text-[10px] text-gray-500">Last 7 Scans Timeline</span>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyInspections} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCounterfeits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 9 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                <Area type="monotone" dataKey="inspections" stroke="#06B6D4" name="Total Inspected" fillOpacity={1} fill="url(#colorInspections)" />
                <Area type="monotone" dataKey="counterfeits" stroke="#8B5CF6" name="Counterfeits Flagged" fillOpacity={1} fill="url(#colorCounterfeits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manufacturer Distribution Pie */}
        <div className="lg:col-span-4 rounded-xl glass-panel p-5 border border-cardBorder space-y-4">
          <h3 className="text-xs font-bold text-gray-300">Manufacturer Distribution</h3>
          
          <div className="h-60 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.manufacturerDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.manufacturerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-lg font-extrabold text-white">{data.totalInspections}</div>
              <div className="text-[9px] text-gray-500 uppercase">Brands</div>
            </div>
          </div>

          {/* Color legend list */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
            {data.manufacturerDistribution.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* System logs / Activity section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Counterfeit Detection Rate bar chart */}
        <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-4">
          <h3 className="text-xs font-bold text-gray-300">Counterfeit Flag Density (Brands)</h3>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.manufacturerDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 8 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 10 }} />
                <Bar dataKey="value" name="Scanned Count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time system logs */}
        <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-electricCyan" /> Node Inspection Action Logs
            </h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-gray-900 text-gray-500 font-semibold uppercase tracking-wider">Live System</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-2.5 rounded bg-gray-950/40 border border-cardBorder/40 flex items-start gap-3 text-[10px]"
              >
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                  log.level === 'ERROR' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                    : 'bg-electricCyan/10 text-electricCyan border border-electricCyan/20'
                }`}>
                  {log.level}
                </span>
                <div className="flex-grow space-y-0.5">
                  <div className="text-gray-300 leading-normal">{log.message}</div>
                  <div className="text-[8px] text-gray-600">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
