import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#060B13] py-6 px-4 sm:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Organization & Project Citation */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <span className="font-semibold text-slate-300">BhuNetra</span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span>Smart India Hackathon 2026 (PS 26015)</span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span>Dept of Land Resources, Ministry of Rural Development</span>
        </div>

        {/* Center: Exact Required Prompt Statement */}
        <div className="text-center text-slate-400 font-mono text-[11px] px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-md">
          Prototype. Production integrates with the SRISHTI-DRISHTI 30m feed, Sentinel-2 and Bhuvan.
        </div>

        {/* Right: Architecture & Security */}
        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span>WDC-PMKSY 2.0</span>
          <span>·</span>
          <span>ISRO NRSC Protocol</span>
          <span>·</span>
          <span>GDAL / Earth Engine</span>
        </div>
      </div>
    </footer>
  );
};
