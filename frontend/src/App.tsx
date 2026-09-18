import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ReferenceDatabase from './pages/ReferenceDatabase';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Cpu, ShieldCheck, Info } from 'lucide-react';
import { apiService } from './services/api';

// Layout wrapper to conditional render Sidebar & Header based on location
function LayoutContainer({ children, darkMode, setDarkMode, userRole, handleLogout }: { 
  children: React.ReactNode; 
  darkMode: boolean; 
  setDarkMode: (val: boolean) => void;
  userRole: string;
  handleLogout: () => void;
}) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  // Custom page titles
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Inspection Dashboard Node 04';
      case '/history': return 'Scans Historical Records';
      case '/database': return 'Device Reference Guidelines';
      case '/analytics': return 'Performance & Operations Analytics';
      case '/admin': return 'AI Core & Operators Control';
      default: return 'System Panel';
    }
  };

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-slate-800">
      <Sidebar currentRole={userRole} onLogout={handleLogout} />
      <div className="flex-grow flex flex-col min-w-0">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} title={getPageTitle(location.pathname)} />
        <main className="flex-grow overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  // Light theme by default
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ic_theme') === 'dark';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('operator');
  const [username, setUsername] = useState('');
  
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync dark mode class and storage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ic_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ic_theme', 'light');
    }
  }, [darkMode]);

  // Check existing token
  useEffect(() => {
    const token = localStorage.getItem('ic_token');
    const savedRole = localStorage.getItem('ic_role') || 'operator';
    const savedName = localStorage.getItem('ic_username') || '';
    if (token) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
      setUsername(savedName);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const data = await apiService.login(loginUser, loginPass);
      localStorage.setItem('ic_token', data.token);
      localStorage.setItem('ic_role', data.role);
      localStorage.setItem('ic_username', data.username);
      
      setUserRole(data.role);
      setUsername(data.username);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
    }
  };

  // Pre-fill login credentials helper for SIH evaluation
  const handlePreFill = (role: 'admin' | 'operator') => {
    setLoginUser(role);
    setLoginPass(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('ic_token');
    localStorage.removeItem('ic_role');
    localStorage.removeItem('ic_username');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center p-4">
        {/* Subtle luminous ambient glows */}
        <div className="absolute inset-0 bg-radial-gradient z-0 pointer-events-none opacity-40" />
        
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/60 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mb-4 shadow-md shadow-sky-500/25">
              <Cpu className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-wider text-slate-900">IC VERIFY AI SIGN IN</h2>
            <p className="text-xs text-slate-500 mt-1.5">Automated Optical Inspection marking counterfeit analyzer.</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Operator Username</label>
              <input
                type="text"
                required
                placeholder="e.g. admin or operator"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Password</label>
              <input
                type="password"
                required
                placeholder="Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold hover:from-sky-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/25 cursor-pointer"
            >
              Sign In to Node
            </button>
          </form>

          {/* Quick links for evaluation demo */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">SIH Quick Demo Login</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePreFill('admin')}
                className="py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-200 hover:text-slate-900 text-[10px] transition-colors cursor-pointer"
              >
                Administrator Node
              </button>
              <button
                onClick={() => handlePreFill('operator')}
                className="py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-200 hover:text-slate-900 text-[10px] transition-colors cursor-pointer"
              >
                Operator Node
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <LayoutContainer darkMode={darkMode} setDarkMode={setDarkMode} userRole={userRole} handleLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/database" element={<ReferenceDatabase />} />
          <Route path="/analytics" element={<Analytics />} />
          {userRole === 'administrator' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
          {/* Catch-all redirects */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </LayoutContainer>
    </Router>
  );
}
