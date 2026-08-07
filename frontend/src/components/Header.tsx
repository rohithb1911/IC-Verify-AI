import React, { useState } from 'react';
import { Bell, Sun, Moon, Search, Cpu } from 'lucide-react';

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
    <header className="relative w-full h-16 bg-gray-950/40 border-b border-cardBorder px-6 flex items-center justify-between glass-panel sticky top-0 z-40">
      <h1 className="text-lg font-bold tracking-wide text-white capitalize">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Global search (e.g. Part Number)..."
            className="w-64 pl-9 pr-4 py-1.5 rounded-lg bg-gray-900/60 border border-cardBorder text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-electricCyan focus:ring-1 focus:ring-electricCyan transition-all duration-200"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2" />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            setDarkMode(!darkMode);
            document.documentElement.classList.toggle('dark');
          }}
          className="p-2 rounded-lg bg-gray-900 border border-cardBorder text-gray-400 hover:text-white transition-all duration-200 hover:border-electricCyan/40"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-gray-900 border border-cardBorder text-gray-400 hover:text-white transition-all duration-200 hover:border-electricCyan/40 relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel border border-cardBorder p-4 shadow-2xl z-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-200">System Notifications</span>
                <button 
                  onClick={() => setNotifications([])} 
                  className="text-[10px] text-gray-500 hover:text-electricCyan"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start justify-between gap-2 transition-all ${
                        n.type === 'error' 
                          ? 'bg-red-500/5 border-red-500/20 text-red-300' 
                          : n.type === 'success' 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                            : 'bg-blue-500/5 border-blue-500/20 text-blue-300'
                      }`}
                    >
                      <div>
                        <div>{n.text}</div>
                        <div className="text-[9px] text-gray-500 mt-1">{n.time}</div>
                      </div>
                      <button 
                        onClick={() => removeNotification(n.id)}
                        className="text-gray-500 hover:text-white"
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
      </div>
    </header>
  );
}
