import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Microscope, History, Database, BarChart3, 
  Settings, Play, Cpu, LogOut, ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentRole?: string;
  onLogout?: () => void;
}

export default function Sidebar({ currentRole = "operator", onLogout }: SidebarProps) {
  const navigate = useNavigate();

  const handleStartBatch = () => {
    navigate('/dashboard');
    window.dispatchEvent(new CustomEvent('aoi:start-batch'));
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('ic_token');
      navigate('/');
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between sticky top-0 transition-colors z-30 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      <div className="p-5 space-y-5">
        {/* Brand Header */}
        <div 
          onClick={() => navigate('/dashboard')} 
          className="cursor-pointer pt-1"
        >
          <h1 className="text-base font-black tracking-tight text-[#0B4F9C] uppercase font-sans">
            IC MARKING AOI
          </h1>
        </div>

        {/* System Online / Ready for Batch status card */}
        <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/90 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-sky-100 text-[#0B4F9C] flex items-center justify-center shrink-0 border border-sky-200/60">
            <Cpu className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System: Online
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              Ready for Batch
            </div>
          </div>
        </div>

        {/* START BATCH CTA Button */}
        <button
          onClick={handleStartBatch}
          className="w-full py-2.5 px-3 rounded-md bg-[#0B4F9C] hover:bg-[#093e7a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>START BATCH</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#0B4F9C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>

          {/* New Inspection */}
          <button
            onClick={() => {
              navigate('/dashboard');
              window.dispatchEvent(new CustomEvent('aoi:new-inspection'));
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          >
            <Microscope className="w-4 h-4 text-slate-500" />
            <span>New Inspection</span>
          </button>

          {/* History */}
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#0B4F9C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <History className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>History</span>
              </>
            )}
          </NavLink>

          {/* Reference Database */}
          <NavLink
            to="/database"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#0B4F9C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Database className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>Reference Database</span>
              </>
            )}
          </NavLink>

          {/* Analytics */}
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#0B4F9C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <BarChart3 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>Analytics</span>
              </>
            )}
          </NavLink>

          {/* Admin Panel (if admin) */}
          {currentRole === 'administrator' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0B4F9C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ShieldAlert className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>Admin Panel</span>
                </>
              )}
            </NavLink>
          )}
        </nav>
      </div>

      {/* Footer Navigation: Settings & Profile */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <NavLink
          to="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Settings</span>
        </NavLink>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-[#0B4F9C]">
              JD
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 truncate">J. Doe</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">Lead Inspector</div>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
