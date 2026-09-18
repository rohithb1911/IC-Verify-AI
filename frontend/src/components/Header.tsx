import React, { useState } from 'react';
import { Bell, HelpCircle, Search, Sun, Moon, User } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  title: string;
}

export default function Header({ darkMode, setDarkMode, title }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Counterfeit STM32F103 detected at Node 04", time: "5m ago", type: "error" },
    { id: 2, text: "Reference Database updated: ATmega328P templates", time: "1h ago", type: "info" },
    { id: 3, text: "DIP-8 Package verification checks passed", time: "2h ago", type: "success" }
  ]);

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="relative w-full h-16 bg-white border-b border-slate-200 px-7 flex items-center justify-between sticky top-0 z-40 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          {title || 'Dashboard Overview'}
        </h1>
      </div>

      {/* Center Search */}
      <div className="relative w-72 max-w-sm hidden sm:block">
        <input
          type="text"
          placeholder="Search ID or Part..."
          className="w-full pl-9 pr-4 py-1.5 rounded-full bg-slate-50/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0B4F9C] focus:ring-1 focus:ring-[#0B4F9C] transition-all"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#0B4F9C]" />
            {notifications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white border border-slate-200 p-4 shadow-xl z-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                <button 
                  onClick={() => setNotifications([])} 
                  className="text-[10px] text-slate-500 hover:text-[#0B4F9C] cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-md border text-[11px] leading-relaxed flex items-start justify-between gap-2 transition-all ${
                        n.type === 'error' 
                          ? 'bg-rose-50 border-rose-200 text-rose-800' 
                          : n.type === 'success' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-sky-50 border-sky-200 text-sky-800'
                      }`}
                    >
                      <div>
                        <div>{n.text}</div>
                        <div className="text-[9px] text-slate-500 mt-1">{n.time}</div>
                      </div>
                      <button 
                        onClick={() => removeNotification(n.id)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Question Icon */}
        <button
          onClick={() => alert("AOI Console Help:\n- Use 'Start New Inspection' to load an IC image or sample preset.\n- The system validates laser markings, surface defects, and authenticity.\n- View history records or export reports from the Scans Records tab.")}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4 text-[#0B4F9C]" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0B4F9C] shadow-xs">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900">J. Doe</div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Lead Inspector</div>
          </div>
        </div>
      </div>
    </header>
  );
}
