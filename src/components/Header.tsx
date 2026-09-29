import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Sliders, 
  UploadCloud, 
  Smartphone, 
  Users, 
  FileText, 
  Network, 
  Code2, 
  Sun, 
  Moon, 
  Radio, 
  UserCheck 
} from 'lucide-react';
import { UserRole, DataMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  dataMode: DataMode;
  onDataModeToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  mismatchCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  userRole,
  onRoleChange,
  dataMode,
  onDataModeToggle,
  isDarkMode,
  onThemeToggle,
  mismatchCount
}) => {
  // Navigation tabs definition
  const allTabs = [
    { id: 'landing', label: 'Overview', icon: null },
    { id: 'dashboard', label: 'GIS Map', icon: Layers },
    { 
      id: 'mismatches', 
      label: 'Mismatches', 
      icon: ShieldAlert,
      badge: mismatchCount > 0 ? mismatchCount : undefined 
    },
    { id: 'score_engine', label: 'Score Engine', icon: Sliders },
    { id: 'upload', label: 'Upload & Classify', icon: UploadCloud },
    { id: 'field_pwa', label: 'Field Capture', icon: Smartphone },
    { id: 'public_portal', label: 'Public Portal', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'integration', label: 'SRISHTI API', icon: Network },
    { id: 'api_docs', label: 'OpenAPI', icon: Code2 },
  ];

  // Role based filtering of visible tabs
  const visibleTabs = allTabs.filter(tab => {
    if (userRole === 'citizen') {
      return ['landing', 'dashboard', 'public_portal'].includes(tab.id);
    }
    if (userRole === 'field_officer') {
      return ['landing', 'dashboard', 'mismatches', 'upload', 'field_pwa', 'public_portal'].includes(tab.id);
    }
    return true; // Admin and Planner see all tabs
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070E18]/90 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('landing')}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-900/50 border border-teal-600/40 flex items-center justify-center text-teal-300 font-bold text-base shadow-xs group-hover:border-teal-400 transition-colors">
              भू
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                BhuNetra
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-400 ml-2 font-normal">
                SIH 2026 · PS 26015
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, clean tabs) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {visibleTabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'text-teal-300 bg-teal-950/60 border border-teal-800/60 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-semibold bg-rose-900/80 text-rose-300 border border-rose-700/60 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Data Mode, Role Switcher, PWA Install, Theme) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Data Mode Switcher with Simulation Badge */}
          <button
            onClick={onDataModeToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
              dataMode === 'DEMO'
                ? 'bg-amber-950/50 border-amber-800/60 text-amber-300 hover:bg-amber-900/50'
                : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
            }`}
            title="Click to toggle between DEMO (realistic seeded Maharashtra dataset) and LIVE (Google Earth Engine Sentinel-2 feed)"
          >
            <Radio className={`w-3 h-3 ${dataMode === 'LIVE' ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
            <span className="font-mono text-[11px] font-medium">
              {dataMode === 'DEMO' ? 'Simulated data' : 'Live Earth Engine'}
            </span>
          </button>

          {/* Role Switcher */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <select
                value={userRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-xs text-slate-200 py-1 pr-2 pl-1 border-none focus:outline-hidden cursor-pointer"
                title="Switch active user role to evaluate permission-tailored views"
              >
                <option value="admin" className="bg-slate-900 text-white">Admin (DoLR)</option>
                <option value="planner" className="bg-slate-900 text-white">Planner</option>
                <option value="field_officer" className="bg-slate-900 text-white">Field Officer</option>
                <option value="citizen" className="bg-slate-900 text-white">Citizen</option>
              </select>
            </div>
          </div>

          {/* In-app PWA install button */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Toggle color theme"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/60 bg-slate-950/80 gap-1 scrollbar-none">
        {visibleTabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'text-teal-300 bg-teal-950/80 border border-teal-800 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1 text-[10px] font-mono bg-rose-900/80 text-rose-300 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
