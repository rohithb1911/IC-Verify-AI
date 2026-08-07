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
    <div className="flex min-h-screen bg-background">
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
  const [darkMode, setDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('operator');
  const [username, setUsername] = useState('');
  
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

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
        {/* Radial backing glows */}
        <div className="absolute inset-0 bg-radial-gradient z-0 pointer-events-none opacity-40" />
        
        <div className="relative z-10 w-full max-w-md rounded-2xl glass-panel-glow-cyan border border-cardBorder p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-electricCyan to-neonViolet flex items-center justify-center mb-4 neon-glow-cyan">
              <Cpu className="w-7 h-7 text-background stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-wider text-white">IC VERIFY AI SIGN IN</h2>
            <p className="text-xs text-gray-500 mt-1.5">Automated Optical Inspection marking counterfeit analyzer.</p>
          </div>

          {loginError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold block">Operator Username</label>
              <input
                type="text"
                required
                placeholder="e.g. admin or operator"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full px-4 py-2.5 rounded bg-gray-900 border border-cardBorder text-gray-200 placeholder-gray-600 focus:outline-none focus:border-electricCyan focus:ring-1 focus:ring-electricCyan"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-semibold block">Password</label>
              <input
                type="password"
                required
                placeholder="Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded bg-gray-900 border border-cardBorder text-gray-200 placeholder-gray-600 focus:outline-none focus:border-electricCyan focus:ring-1 focus:ring-electricCyan"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-electricCyan to-blue-500 text-background font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-electricCyan/15"
            >
              Sign In to Node
            </button>
          </form>

          {/* Quick links for evaluation demo */}
          <div className="pt-2 border-t border-cardBorder/60 space-y-3">
            <div className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-wider">SIH Quick Demo Login</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePreFill('admin')}
                className="py-2 rounded bg-gray-900 border border-cardBorder text-gray-300 font-medium hover:border-electricCyan/40 text-[10px] transition-colors"
              >
                Administrator Node
              </button>
              <button
                onClick={() => handlePreFill('operator')}
                className="py-2 rounded bg-gray-900 border border-cardBorder text-gray-300 font-medium hover:border-electricCyan/40 text-[10px] transition-colors"
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
