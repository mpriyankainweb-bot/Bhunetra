import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Droplet, 
  Trees, 
  Send, 
  ShieldCheck, 
  MapPin, 
  HeartHandshake 
} from 'lucide-react';
import { WatershedSite } from '../types';

interface PublicPortalViewProps {
  sites: WatershedSite[];
  onSelectSite: (site: WatershedSite) => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  sites,
  onSelectSite
}) => {
  const [villageSearch, setVillageSearch] = useState<string>('Balegaon');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Filter sites matching village query
  const villageSites = sites.filter(s => 
    s.village.toLowerCase().includes(villageSearch.toLowerCase()) ||
    s.block.toLowerCase().includes(villageSearch.toLowerCase())
  );

  const displaySites = villageSites.length > 0 ? villageSites : sites.slice(0, 4);
  const verifiedCount = displaySites.filter(s => !s.isFlagged).length;
  const avgHealth = displaySites.length ? Math.round(displaySites.reduce((acc, s) => acc + s.healthScore, 0) / displaySites.length) : 0;

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 p-4 sm:p-8 space-y-8">
      
      {/* 1. Citizen Header */}
      <div className="max-w-5xl mx-auto text-center space-y-3 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/80 text-teal-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Transparency Portal · Gram Panchayat Open Data</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Citizen Watershed Progress Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Track public water conservation and plantation works in your village, verified independently by satellite telemetry.
        </p>

        {/* Search Village Bar */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search your village (e.g. Balegaon, Pachod, Hatnoor)..."
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* 2. Public Outcome KPI Cards (Citizen Safe - No Budgets) */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Works Built</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{displaySites.length}</div>
          <span className="text-[11px] text-slate-400">Structures Sanctioned</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Satellite Verified</span>
          <div className="text-2xl font-bold font-mono text-teal-300 mt-1">{verifiedCount} of {displaySites.length}</div>
          <span className="text-[11px] text-teal-400">Confirmed by Sentinel-2</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Green Cover Growth</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">+24.2%</div>
          <span className="text-[11px] text-slate-400">Vegetation Expansion</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Water Capacity Added</span>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">14,500 m³</div>
          <span className="text-[11px] text-slate-400">Groundwater Recharge</span>
        </div>

      </div>

      {/* 3. Citizen Works Cards Grid */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            Works in {villageSearch || 'District'}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Showing {displaySites.length} public records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displaySites.map(site => (
            <div
              key={site.id}
              onClick={() => onSelectSite(site)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-700/60 transition-all cursor-pointer flex gap-4"
            >
              <div className="w-24 h-24 rounded-lg bg-black overflow-hidden shrink-0">
                <img
                  src={site.photoUrl}
                  alt={site.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate">{site.name}</span>
                  <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    site.healthScore >= 70 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {site.healthScore} / 100
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 capitalize">
                  {site.structureType.replace('_', ' ')} · {site.village}
                </div>

                <div className="text-[11px] text-slate-500">
                  Completed on: {site.completionDate}
                </div>

                <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                  {!site.isFlagged ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Satellite Validated
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      Under Physical Inspection
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Citizen Feedback / Social Audit Box */}
      <div className="max-w-5xl mx-auto rounded-xl bg-gradient-to-r from-slate-900 to-[#0A1624] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-teal-400" />
          <h3 className="text-base font-bold text-white">Community Feedback & Social Audit</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Are you a local resident of {villageSearch || 'the village'}? Report ground observations directly to the District Watershed Cell.
        </p>

        <form onSubmit={handleSubmitFeedback} className="space-y-3">
          <textarea
            rows={2}
            placeholder="Share feedback on water availability, structure maintenance, or plantation survival..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Anonymous community submission · Routed to DoLR Grievance Portal
            </span>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Community Observation</span>
            </button>
          </div>
        </form>

        {feedbackSubmitted && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Thank you! Your feedback has been registered and tagged to village social audit records.</span>
          </div>
        )}
      </div>

    </div>
  );
};
