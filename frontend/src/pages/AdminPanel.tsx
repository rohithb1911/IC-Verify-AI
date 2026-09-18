import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Cpu, Database, 
  Activity, CheckCircle, RefreshCw, Trash2, Key, Save,
  CheckCircle2, Sliders, Server, HardDrive, Terminal,
  Plus, X, ShieldCheck, Download, Sparkles
} from 'lucide-react';
import { apiService, SystemLog } from '../services/api';

export default function AdminPanel() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState<'models' | 'users' | 'maintenance' | 'logs'>('models');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reloadingModel, setReloadingModel] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('operator');
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');
  
  // Mock users
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', role: 'administrator', created: '2026-06-01', status: 'Active' },
    { id: 2, username: 'operator', role: 'operator', created: '2026-06-15', status: 'Active' },
    { id: 3, username: 'inspection_node_04', role: 'operator', created: '2026-07-02', status: 'Active' }
  ]);

  // Mock models status
  const [models, setModels] = useState([
    { name: 'YOLOv8 Logo Extractor', version: 'v1.4.2', accuracy: '98.5%', status: 'Active', latency: '45ms', threshold: 85 },
    { name: 'PaddleOCR Marking Engine', version: 'v3.1.0', accuracy: '97.2%', status: 'Active', latency: '120ms', threshold: 80 },
    { name: 'IC Package Size Classifier', version: 'v2.0.1', accuracy: '99.1%', status: 'Active', latency: '12ms', threshold: 90 },
    { name: 'Surface Defect Texture Segmenter', version: 'v1.1.5', accuracy: '95.6%', status: 'Active', latency: '85ms', threshold: 75 }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadLogs = async () => {
    try {
      const data = await apiService.getLogs();
      setLogs(data);
      showToast("Node audit logs refreshed.");
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch system logs.");
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleReloadModel = (modelName: string) => {
    setReloadingModel(modelName);
    setTimeout(() => {
      setReloadingModel(null);
      showToast(`Model weights for ${modelName} reloaded successfully.`);
    }, 1200);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    const newUser = {
      id: Date.now(),
      username: newUsername.trim(),
      role: newRole,
      created: new Date().toISOString().slice(0, 10),
      status: 'Active'
    };
    setUsers([...users, newUser]);
    setNewUsername('');
    setShowAddUserModal(false);
    showToast(`Operator node '${newUser.username}' provisioned.`);
  };

  const handleDeleteUser = (id: number, username: string) => {
    if (confirm(`Are you sure you want to revoke access for ${username}?`)) {
      setUsers(users.filter(u => u.id !== id));
      showToast(`Operator node '${username}' removed.`);
    }
  };

  const handleThresholdChange = (index: number, val: number) => {
    const updated = [...models];
    updated[index].threshold = val;
    setModels(updated);
  };

  const triggerBackup = async () => {
    try {
      const data = await apiService.exportReferenceDatabase('json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ic_verify_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("Database backup package downloaded successfully.");
    } catch (e) {
      showToast("Failed to export database backup.");
    }
  };

  const clearScans = () => {
    if (confirm("Are you sure you want to clear scan logs? This cannot be undone.")) {
      localStorage.removeItem('ic_scan_history');
      showToast("Scan history cleared.");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'ALL' && log.level !== logFilter) return false;
    return true;
  });

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
            <ShieldAlert className="w-7 h-7 text-[#0B4F9C]" />
            Admin & System Control Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure AI inference weights, audit security protocols, provision operator permissions, and manage reference models.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>JEDEC SEC-01 Verified</span>
          </div>

          <button
            onClick={() => handleReloadModel('All Models')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer"
            title="Reload weights on FastAPI CV workers"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync All Weights</span>
          </button>

          <button
            onClick={triggerBackup}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B4F9C] hover:bg-[#083D7A] text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Backup Registry</span>
          </button>

        </div>
      </div>

      {/* 2. Top 5 KPI Summary Cards (Matching Reference Database Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Active AI Models */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">AI Inference Engines</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              100% Online
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">4 Active</span>
            <span className="text-[11px] font-semibold text-emerald-600">CV Workers</span>
          </div>
        </div>

        {/* Card 2: Node Operators */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Provisioned Operators</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
              RBAC Enforced
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{users.length} Nodes</span>
            <span className="text-[11px] font-normal text-slate-400">Authorized</span>
          </div>
        </div>

        {/* Card 3: Inference Latency */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Average Latency</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
              GPU Accelerated
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">65.8ms</span>
            <span className="text-[11px] font-normal text-slate-400">Real-Time CV</span>
          </div>
        </div>

        {/* Card 4: Reference Records */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Database Records</span>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
              JEDEC Library
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">14,820</span>
            <span className="text-[11px] font-normal text-slate-400">Golden Templates</span>
          </div>
        </div>

        {/* Card 5: Security Posture */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">System Posture</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Compliant
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 tracking-tight">Passing</span>
            <span className="text-[11px] font-normal text-slate-400">0 Vulnerabilities</span>
          </div>
        </div>

      </div>

      {/* 3. Main Split Layout: Tabs on left, content on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Tabs (col-span-3) */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200/90 p-2 shadow-sm space-y-1">
          
          <button
            onClick={() => setActiveTab('models')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'models' 
                ? 'bg-[#0B4F9C] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4" /> AI Models & Weights
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'models' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              4
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-[#0B4F9C] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4" /> Node Operators
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'users' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {users.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'maintenance' 
                ? 'bg-[#0B4F9C] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Database className="w-4 h-4" /> Database Maintenance
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'logs' 
                ? 'bg-[#0B4F9C] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4" /> Node Audit Logs
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
              Live
            </span>
          </button>

        </div>

        {/* Tab Contents (col-span-9) */}
        <div className="md:col-span-9 space-y-6">

          {/* TAB: Models */}
          {activeTab === 'models' && (
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#0B4F9C]" />
                    AI Model Weights & Classifiers
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Status of active computer vision neural models running inference on OpenCV/YOLO workers.</p>
                </div>
                <button
                  onClick={() => handleReloadModel('All Model Weights')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reload All Engines</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {models.map((model, idx) => {
                  const isReloading = reloadingModel === model.name || reloadingModel === 'All Model Weights' || reloadingModel === 'All Models';
                  return (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center font-mono text-[#0B4F9C] font-black text-sm shrink-0 shadow-2xs">
                          AI
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{model.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {model.version}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-medium">
                              F1 Score: <strong className="text-slate-800 font-mono">{model.accuracy}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 font-medium">
                              Latency: <strong className="text-slate-800 font-mono">{model.latency}</strong>
                            </span>
                          </div>

                          {/* Interactive Confidence Slider */}
                          <div className="mt-3 flex items-center gap-3 max-w-sm">
                            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Confidence Cutoff:</span>
                            <input
                              type="range"
                              min="50"
                              max="99"
                              value={model.threshold}
                              onChange={(e) => handleThresholdChange(idx, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B4F9C]"
                            />
                            <span className="text-[11px] font-mono font-bold text-slate-700 w-8 text-right">
                              {model.threshold}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {model.status}
                        </span>
                        
                        <button 
                          onClick={() => handleReloadModel(model.name)}
                          disabled={isReloading}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isReloading ? 'animate-spin text-[#0B4F9C]' : ''}`} />
                          <span>{isReloading ? 'Reloading...' : 'Reload'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: Users */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#0B4F9C]" />
                    Registered Node Operators
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authorized personnel with permission to upload and audit IC verification batches.</p>
                </div>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B4F9C] hover:bg-[#083D7A] text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-900/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision Node Operator</span>
                </button>
              </div>

              {/* Table styled with Reference Database table theme */}
              <div className="rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Operator / Node Identity</th>
                      <th className="py-3 px-4">Role Privileges</th>
                      <th className="py-3 px-4">Provisioned Date</th>
                      <th className="py-3 px-4">Access Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="text-slate-700 hover:bg-blue-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                          {u.username}
                        </td>
                        <td className="py-3 px-4 capitalize font-medium">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            u.role === 'administrator' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{u.created}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button 
                            onClick={() => showToast(`Credentials key regenerated for ${u.username}`)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer transition-all"
                            title="Rotate Key"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          {u.username !== 'admin' && (
                            <button 
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 shadow-2xs cursor-pointer transition-all"
                              title="Revoke Access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#0B4F9C]" />
                        Provision New Node Operator
                      </h3>
                      <button 
                        onClick={() => setShowAddUserModal(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddUser} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-700 font-semibold block">Operator Username / Node Identifier</label>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="e.g. operator_smt_03"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700 font-semibold block">System Access Role</label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        >
                          <option value="operator">Operator (Run Inferences & View History)</option>
                          <option value="administrator">Administrator (Full Control & Weights Config)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#083D7A] text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-900/20 cursor-pointer"
                        >
                          Provision Operator
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: Maintenance */}
          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-6 shadow-sm">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0B4F9C]" />
                  System Database Maintenance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Export complete inspection archives, clear preview caches, or restore database packages.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Backup Card */}
                <div className="p-5 rounded-xl bg-white border border-slate-200/90 space-y-3 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Registry Snapshot</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Full DB
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-2">Export Master Database Package</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Download a complete JSON package including golden samples, OCR font matrices, and optical calibration parameters.
                    </p>
                  </div>
                  
                  <button 
                    onClick={triggerBackup}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg bg-[#0B4F9C] hover:bg-[#083D7A] text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-900/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Database Backup
                  </button>
                </div>

                {/* Reset History Card */}
                <div className="p-5 rounded-xl bg-white border border-slate-200/90 space-y-3 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Log Purge</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Irreversible
                      </span>
                    </div>
                    <h4 className="font-bold text-rose-700 text-sm mt-2">Purge Local Scan Records</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Purge cached browser inspection history and reset scan counters for fresh test sessions.
                    </p>
                  </div>
                  
                  <button 
                    onClick={clearScans}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Local Inspection History
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB: Logs */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-600" />
                    Node Audit & Security Trail
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time system events, model initialization logs, and security audits.</p>
                </div>

                <div className="flex items-center gap-2">
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

                  <button 
                    onClick={loadLogs}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
                  </button>
                </div>
              </div>

              {/* High-Tech Terminal Box (matching ReferenceDatabase inspection specimen aesthetic) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 h-96 overflow-y-auto space-y-2 shadow-inner">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-600">
                    No audit trail logs recorded for this category.
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
                      <span className="text-slate-300 font-medium break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Audit Daemon: Active
                </span>
                <span className="font-mono">{filteredLogs.length} events logged</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
