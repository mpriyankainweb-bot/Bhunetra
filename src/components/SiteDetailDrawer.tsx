import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Cpu, 
  Activity, 
  Sliders, 
  Eye, 
  Sparkles, 
  Share2, 
  UserCheck 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { WatershedSite } from '../types';
import { APP_IMAGES } from '../assets/images';

interface SiteDetailDrawerProps {
  site: WatershedSite | null;
  onClose: () => void;
  onAssignOfficer: (siteId: string) => void;
}

export const SiteDetailDrawer: React.FC<SiteDetailDrawerProps> = ({
  site,
  onClose,
  onAssignOfficer
}) => {
  if (!site) return null;

  const [activeTab, setActiveTab] = useState<'trends' | 'gradcam' | 'before_after'>('trends');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 40) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300';
    if (score >= 40) return 'bg-amber-950/40 border-amber-800/60 text-amber-300';
    return 'bg-rose-950/40 border-rose-800/60 text-rose-300';
  };

  // Radial Score Arc calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (site.healthScore / 100) * circumference;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] lg:w-[640px] bg-[#0A121F] border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
      
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#070D16] flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-teal-400 font-semibold">{site.code}</span>
            <span>·</span>
            <span>{site.village}, {site.block}</span>
            <span>·</span>
            <span>{site.watershedName.split(' ')[0]}</span>
          </div>
          <h2 className="text-lg font-bold text-white leading-snug">{site.name}</h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
        
        {/* 1. Audit Flag Banner (If Mismatch Detected) */}
        {site.isFlagged && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/80 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                    Evidence Mismatch Flagged · {site.mismatchSeverity?.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-rose-900/60 border border-rose-700/60 rounded text-rose-200">
                    Status: {site.mismatchStatus}
                  </span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed font-medium">
                  {site.mismatchReason}
                </p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  IsolationForest Anomaly Score: <span className="text-rose-300 font-semibold">{site.anomalyScore}</span> (Threshold &lt; -0.50)
                </div>
                {site.assignedOfficer && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Assigned Officer: <strong className="text-slate-200">{site.assignedOfficer}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Photo & AI Classification Lockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ground Geo-tagged Photo */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-4/3 group">
            <img
              src={site.photoUrl}
              alt={site.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* GPS Overlay Tag */}
            <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/80 backdrop-blur-xs border border-white/10 text-[10px] font-mono text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E
              </span>
              <span className="text-slate-400">Elev: {site.elevationMeters}m</span>
            </div>
            {/* Classification Badge on Photo */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono font-semibold text-teal-300 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-teal-400" />
              <span>{site.classificationLabel.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          {/* Health Score Radial & Key Metrics */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Watershed Health Index</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Composite 0 – 100 Scale</div>
              </div>

              {/* Radial Arc */}
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-18 h-18 transform -rotate-90">
                  <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={getScoreColor(site.healthScore)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-xl font-bold font-mono ${getScoreColor(site.healthScore).split(' ')[0]}`}>
                    {site.healthScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Component Breakdown Bars */}
            <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vegetation Gain (NDVI)</span>
                  <span className="font-mono text-slate-200">{site.scoreBreakdown.ndvi_gain}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${site.scoreBreakdown.ndvi_gain}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Surface Water (NDWI)</span>
                  <span className="font-mono text-slate-200">{site.scoreBreakdown.ndwi_presence}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${site.scoreBreakdown.ndwi_presence}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Structure Evidence (CNN)</span>
                  <span className="font-mono text-slate-200">{site.scoreBreakdown.structure_evidence}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${site.scoreBreakdown.structure_evidence}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Temporal Consistency</span>
                  <span className="font-mono text-slate-200">{site.scoreBreakdown.consistency_factor}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${site.scoreBreakdown.consistency_factor}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Administrative & MIS Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block">Sanctioned Date</span>
            <span className="font-mono text-slate-200 font-medium">{site.sanctionedDate}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Completed Date</span>
            <span className="font-mono text-slate-200 font-medium">{site.completionDate}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Budget Outlay</span>
            <span className="font-mono text-slate-200 font-medium">₹{site.budgetInrLakhs.toFixed(2)} Lakhs</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">MGNREGA Work ID</span>
            <span className="font-mono text-teal-300 font-medium truncate block">{site.mgnregaWorkId}</span>
          </div>
        </div>

        {/* 4. Interactive Analytical Tabs (Trends / Grad-CAM / Before-After) */}
        <div>
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 mb-4">
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'trends' ? 'bg-teal-950/80 text-teal-300 border border-teal-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24-Mo Spectral Trends
            </button>
            <button
              onClick={() => setActiveTab('gradcam')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'gradcam' ? 'bg-teal-950/80 text-teal-300 border border-teal-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grad-CAM Explainability
            </button>
            <button
              onClick={() => setActiveTab('before_after')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'before_after' ? 'bg-teal-950/80 text-teal-300 border border-teal-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite Before / After
            </button>
          </div>

          {/* TAB 1: 24-Month Recharts Series */}
          {activeTab === 'trends' && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-medium text-slate-300">Sentinel-2 NDVI vs. NDWI Time Series</span>
                <span className="text-[11px] font-mono text-slate-400">Monthly Median Composites</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={site.timeseries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis 
                      dataKey="monthLabel" 
                      stroke="#64748B" 
                      fontSize={10} 
                      tickLine={false} 
                      interval={3}
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={10} 
                      domain={[-0.5, 0.8]} 
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      labelStyle={{ color: '#94A3B8', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <ReferenceLine 
                      x="Aug 24" 
                      stroke="#F59E0B" 
                      strokeDasharray="4 4" 
                      label={{ value: 'Work Sanctioned', fill: '#F59E0B', fontSize: 10, position: 'top' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ndvi" 
                      name="NDVI (Vegetation)" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ndwi" 
                      name="NDWI (Water Presence)" 
                      stroke="#0EA5E9" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Spectral Metric Indicators */}
              <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Baseline NDVI</span>
                  <span className="font-mono font-semibold text-slate-300">{site.baselineNdvi.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Post-Work NDVI</span>
                  <span className={`font-mono font-semibold ${site.deltaNdvi > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {site.postworkNdvi.toFixed(2)} ({site.deltaNdvi >= 0 ? '+' : ''}{site.deltaNdvi.toFixed(2)})
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Baseline NDWI</span>
                  <span className="font-mono font-semibold text-slate-300">{site.baselineNdwi.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">Post-Work NDWI</span>
                  <span className={`font-mono font-semibold ${site.deltaNdwi > 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                    {site.postworkNdwi.toFixed(2)} ({site.deltaNdwi >= 0 ? '+' : ''}{site.deltaNdwi.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Grad-CAM Explainability Heatmap */}
          {activeTab === 'gradcam' && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-300">Grad-CAM Neural Attention Map</span>
                <span className="font-mono text-[11px] text-slate-400">EfficientNet-B0 · Layer 16</span>
              </div>
              
              <div className="relative rounded-lg overflow-hidden border border-purple-800/60 aspect-4/3">
                <img
                  src={site.photoUrl}
                  alt="Original"
                  className="w-full h-full object-cover filter brightness-90"
                  referrerPolicy="no-referrer"
                />
                {/* Simulated Grad-CAM pseudo-color heat overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/40 via-amber-400/30 to-teal-400/20 mix-blend-color-dodge pointer-events-none" />
                <div className="absolute top-1/3 left-1/4 w-32 h-24 rounded-full bg-red-500/50 filter blur-xl animate-pulse pointer-events-none" />

                <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-black/80 backdrop-blur-xs text-[11px] text-slate-300">
                  <strong>Focus Region:</strong> Masonry spillway geometry and downstream embankment scored highest neural gradient weight (0.942).
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Grad-CAM computes the gradients of the score for target class <code className="text-purple-300 font-mono">{site.classificationLabel}</code> with respect to the final convolutional feature maps, verifying whether the model recognized actual watershed engineering structures or spurious background cues.
              </p>
            </div>
          )}

          {/* TAB 3: Satellite Before / After Slider */}
          {activeTab === 'before_after' && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Satellite Change Comparison (Sentinel-2 10m)</span>
                <span className="text-slate-400 text-[11px] font-mono">Drag slider to compare</span>
              </div>

              <div className="relative h-64 rounded-xl overflow-hidden border border-slate-700 select-none">
                {/* Before Image (Dry/Baseline) */}
                <div className="absolute inset-0 bg-[#16212e] flex items-center justify-center">
                  <img
                    src={APP_IMAGES.heroSatellite}
                    alt="Before Baseline"
                    className="w-full h-full object-cover filter sepia-30 contrast-120"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-[10px] font-mono text-amber-300">
                    Baseline (Oct 2024)
                  </span>
                </div>

                {/* After Image (Clipped by slider) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <div className="w-[600px] h-full">
                    <img
                      src={APP_IMAGES.heroSatellite}
                      alt="Post-Work Treatment"
                      className="w-full h-full object-cover filter hue-rotate-30 saturate-150"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-1 bg-teal-950/80 border border-teal-800 rounded text-[10px] font-mono text-teal-300">
                    Post-Work (Sep 2026)
                  </span>
                </div>

                {/* Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center text-[10px] font-bold shadow-md">
                    ⇄
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          )}
        </div>

      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-[#070D16] flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 font-mono">
          Site ID: <span className="text-slate-200">{site.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {site.isFlagged && site.mismatchStatus === 'Open' && (
            <button
              onClick={() => onAssignOfficer(site.id)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
            >
              Assign for Field Verification
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

    </div>
  );
};
