import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Cpu, FileText, Database, 
  Settings2, Activity, Play, CheckCircle, RefreshCw, Trash2, Key, Save 
} from 'lucide-react';
import { apiService, SystemLog } from '../services/api';

export default function AdminPanel() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState('models');
  
  // Mock users
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', role: 'administrator', created: '2026-06-01' },
    { id: 2, username: 'operator', role: 'operator', created: '2026-06-15' },
    { id: 3, username: 'inspection_node_04', role: 'operator', created: '2026-07-02' }
  ]);

  // Mock models status
  const [models, setModels] = useState([
    { name: 'YOLOv8 Logo Extractor', version: 'v1.4.2', accuracy: '98.5%', status: 'Active', latency: '45ms' },
    { name: 'PaddleOCR Marking Engine', version: 'v3.1.0', accuracy: '97.2%', status: 'Active', latency: '120ms' },
    { name: 'IC Package Size Classifier', version: 'v2.0.1', accuracy: '99.1%', status: 'Active', latency: '12ms' },
    { name: 'Surface Defect Texture Segmenter', version: 'v1.1.5', accuracy: '95.6%', status: 'Active', latency: '85ms' }
  ]);

  const loadLogs = async () => {
    try {
      const data = await apiService.getLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const triggerBackup = () => {
    alert("Database Backup initiated. Downloading local ZIP backup package.");
  };

  const clearScans = () => {
    if (confirm("Are you sure you want to clear scan logs? This cannot be undone.")) {
      localStorage.removeItem('ic_scan_history');
      alert("Scan history cleared.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-cardBorder pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-neonViolet" /> Admin & System Control Center
          </h2>
          <p className="text-xs text-gray-400">Configure AI inference weights, audit security protocols, and manage reference models.</p>
        </div>
      </div>

      {/* Main Split Layout: Tabs on left, content on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Navigation Tabs (col-span-3) */}
        <div className="md:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('models')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'models' 
                ? 'bg-gradient-to-r from-electricCyan/15 to-neonViolet/15 border-l-2 border-electricCyan text-electricCyan' 
                : 'text-gray-400 hover:text-white hover:bg-gray-900/30'
            }`}
          >
            <Cpu className="w-4 h-4" /> AI Models & Weights
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-electricCyan/15 to-neonViolet/15 border-l-2 border-electricCyan text-electricCyan' 
                : 'text-gray-400 hover:text-white hover:bg-gray-900/30'
            }`}
          >
            <Users className="w-4 h-4" /> Node Operators
          </button>
          
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'maintenance' 
                ? 'bg-gradient-to-r from-electricCyan/15 to-neonViolet/15 border-l-2 border-electricCyan text-electricCyan' 
                : 'text-gray-400 hover:text-white hover:bg-gray-900/30'
            }`}
          >
            <Database className="w-4 h-4" /> Database Maintenance
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'logs' 
                ? 'bg-gradient-to-r from-electricCyan/15 to-neonViolet/15 border-l-2 border-electricCyan text-electricCyan' 
                : 'text-gray-400 hover:text-white hover:bg-gray-900/30'
            }`}
          >
            <Activity className="w-4 h-4" /> Node Audit Logs
          </button>
        </div>

        {/* Tab Contents (col-span-9) */}
        <div className="md:col-span-9 space-y-6">

          {/* TAB: Models */}
          {activeTab === 'models' && (
            <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-200">AI Model Weights & Classifiers</h3>
                <p className="text-[10px] text-gray-500 mt-1">Status of current active visual models running inference on FastAPI CV workers.</p>
              </div>

              <div className="space-y-4">
                {models.map((model, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-950/40 border border-cardBorder/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-gray-900 border border-cardBorder flex items-center justify-center font-mono text-neonViolet font-bold">
                        AI
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-200">{model.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span>Version: {model.version}</span>
                          <span>•</span>
                          <span>F1 Score: {model.accuracy}</span>
                          <span>•</span>
                          <span>Inference Latency: {model.latency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {model.status}
                      </span>
                      <button className="px-3 py-1.5 rounded bg-gray-900 border border-cardBorder text-[10px] text-gray-400 hover:text-white transition-all flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Reload Weights
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Users */}
          {activeTab === 'users' && (
            <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-200">Registered Node Operators</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Authorized personnel with permission to upload and audit IC verification files.</p>
                </div>
                <button className="px-3 py-1.5 rounded bg-gray-900 border border-cardBorder text-[10px] text-electricCyan hover:border-electricCyan/50 transition-all font-bold">
                  Add Operator Node
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-cardBorder text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Operator Name</th>
                      <th className="p-3">System Role</th>
                      <th className="p-3">Provisioned Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cardBorder/50">
                    {users.map((u) => (
                      <tr key={u.id} className="text-gray-300">
                        <td className="p-3 font-semibold">{u.username}</td>
                        <td className="p-3 capitalize">{u.role}</td>
                        <td className="p-3 text-gray-500">{u.created}</td>
                        <td className="p-3 text-right space-x-2">
                          <button className="p-1 rounded bg-gray-900 border border-cardBorder text-gray-500 hover:text-white">
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          {u.username !== 'admin' && (
                            <button className="p-1 rounded bg-gray-900 border border-cardBorder text-red-500/60 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Maintenance */}
          {activeTab === 'maintenance' && (
            <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-200">System Database Maintenance</h3>
                <p className="text-[10px] text-gray-500 mt-1">Export inspection logs backup templates or restore reference rules database settings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-lg bg-gray-950/40 border border-cardBorder space-y-3">
                  <h4 className="font-bold text-gray-300">Backup Registry</h4>
                  <p className="text-[10px] text-gray-500">Produce complete dump of inspections scans, reference IC templates, and action logs.</p>
                  <button 
                    onClick={triggerBackup}
                    className="px-4 py-2 rounded bg-electricCyan text-background font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Backup Database Package
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-gray-950/40 border border-cardBorder space-y-3">
                  <h4 className="font-bold text-red-400">Reset System Logs</h4>
                  <p className="text-[10px] text-gray-500">Purge local browser SQLite mock logs and delete uploaded raw chip preview files.</p>
                  <button 
                    onClick={clearScans}
                    className="px-4 py-2 rounded bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-950/60 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All Scan History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Logs */}
          {activeTab === 'logs' && (
            <div className="rounded-xl glass-panel p-5 border border-cardBorder space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-200">Active Node Audit Trail</h3>
                <button 
                  onClick={loadLogs}
                  className="px-3 py-1.5 rounded bg-gray-900 border border-cardBorder text-[10px] text-gray-400 hover:text-white transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh Logs
                </button>
              </div>

              <div className="bg-black/60 border border-cardBorder rounded-lg p-4 font-mono text-[10px] text-gray-400 h-96 overflow-y-auto space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={log.level === 'ERROR' ? 'text-red-400 font-bold' : 'text-electricCyan font-bold'}>
                      {log.level}
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
