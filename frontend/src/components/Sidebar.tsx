import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Cpu, History, Database, BarChart3, ShieldAlert, Settings, LogOut, FileText } from 'lucide-react';

interface SidebarProps {
  currentRole?: string;
  onLogout?: () => void;
}

export default function Sidebar({ currentRole = "operator", onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Cpu className="w-5 h-5" /> },
    { name: 'History', path: '/history', icon: <History className="w-5 h-5" /> },
    { name: 'Reference Database', path: '/database', icon: <Database className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  if (currentRole === 'administrator') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: <ShieldAlert className="w-5 h-5" /> });
  }

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('ic_token');
      navigate('/');
    }
  };

  return (
    <aside className="w-64 bg-gray-950/80 border-r border-cardBorder min-h-screen flex flex-col justify-between glass-panel sticky top-0">
      <div className="p-6">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-electricCyan to-neonViolet flex items-center justify-center neon-glow-cyan">
            <Cpu className="w-5 h-5 text-background stroke-[2.5]" />
          </div>
          <span className="text-md font-bold tracking-wider text-white">
            IC VERIFY <span className="text-electricCyan">AI</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-electricCyan/15 to-neonViolet/15 border-l-2 border-electricCyan text-electricCyan' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`${isActive ? 'text-electricCyan' : 'text-gray-400 group-hover:text-gray-200'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profile & Logout */}
      <div className="p-6 border-t border-cardBorder space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 border border-cardBorder flex items-center justify-center font-bold text-neonViolet">
            {currentRole.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-200 capitalize">{currentRole}</div>
            <div className="text-xs text-gray-500">Inspection Node 04</div>
          </div>
        </div>
        
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 border border-transparent hover:border-red-500/25"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
