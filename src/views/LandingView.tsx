import React from 'react';
import { 
  ArrowRight, 
  Layers, 
  Activity, 
  Sliders, 
  ShieldCheck, 
  MapPin, 
  Database, 
  Cpu, 
  Globe2, 
  Eye, 
  FileCheck2, 
  AlertTriangle 
} from 'lucide-react';
import { APP_IMAGES } from '../assets/images';

interface LandingViewProps {
  onNavigate: (tab: string) => void;
  onOpenFlaggedDemo: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenFlaggedDemo }) => {
  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0B1F33]/60 via-[#070E18] to-[#070E18] pt-12 pb-16 px-4 sm:px-8">
        {/* Subtle background satellite overlay with measured scrim */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen overflow-hidden">
          <img
            src={APP_IMAGES.heroSatellite}
            alt="Satellite Watershed Imagery"
            className="w-full h-full object-cover object-center filter blur-xs"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070E18] via-[#070E18]/80 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* SIH Header Kicker */}
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono tracking-wide mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Smart India Hackathon 2026 · Problem Statement 26015</span>
            <span className="hidden md:inline text-slate-600">·</span>
            <span className="hidden md:inline text-slate-400">Department of Land Resources (DoLR), MoRD</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl text-balance leading-tight">
            Turning geo-tagged photos into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-amber-300">
              evidence-backed watershed intelligence
            </span>
          </h1>

          {/* Subtitle Prose */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            BhuNetra sits alongside ISRO’s SRISHTI-DRISHTI platform to cross-validate MGNREGA & WDC-PMKSY field photos against multi-year Sentinel-2 NDVI/NDWI satellite trends. When a ground photo claims a new plantation or check dam, BhuNetra verifies whether the satellite confirms actual vegetation gains or surface water retention.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-950/50 cursor-pointer"
            >
              <span>Launch GIS Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenFlaggedDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/60 text-rose-300 font-medium text-sm transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Inspect Flagged Mismatches (6 Detected)</span>
            </button>

            <button
              onClick={() => onNavigate('score_engine')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Tune Score Engine</span>
            </button>
          </div>

          {/* Quantitative Proof Ribbon */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">25 Sites</div>
              <div className="text-xs text-slate-400 mt-1">CSN District, Maharashtra</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400 tabular-nums">6 Flagged</div>
              <div className="text-xs text-slate-400 mt-1">Evidence Discrepancies</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-teal-300 tabular-nums">24 Months</div>
              <div className="text-xs text-slate-400 mt-1">Sentinel-2 Time Series</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 tabular-nums">0 – 100</div>
              <div className="text-xs text-slate-400 mt-1">Explainable Health Index</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4 CORE MODULES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-teal-400 uppercase tracking-wider">Solution Architecture</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">The 4 Core Analytical Modules</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2 md:mt-0">
            Engineered to fulfill all technical requirements of SIH Problem Statement 26015.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Module 1 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-700/60 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-800/80 flex items-center justify-center text-teal-400 mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">01. Ingestion & Spatial Boundary Alignment</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Accepts field photos via bulk upload or offline mobile PWA, extracts hardware EXIF GPS coordinates (rejecting non-geotagged images), and geometrically snaps coordinates to micro-watershed boundary polygons.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
              <span>Hardware EXIF Validation</span>
              <span>·</span>
              <span>PostGIS Polygon Snapping</span>
            </div>
          </div>

          {/* Module 2 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-700/60 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">02. Interpretation Engine & Grad-CAM</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              EfficientNet-B0 transfer learning classifies images into 5 categories (check dam, farm pond, plantation, degraded land, water body) while generating pixel-level Grad-CAM attention heatmaps for explainable verification.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
              <span>PyTorch EfficientNet-B0</span>
              <span>·</span>
              <span>Grad-CAM Explainability</span>
            </div>
          </div>

          {/* Module 3 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-700/60 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">03. Scoring & Temporal Change Detection</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Retrieves Sentinel-2 24-month cloud-masked composites, calculates pre-vs-post NDVI and NDWI deltas, and computes a composite 0–100 Watershed Health Score weighted by terrain preset (semi-arid, hilly, coastal).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
              <span>Sentinel-2 SCL Mask</span>
              <span>·</span>
              <span>Transparent Formula Engine</span>
            </div>
          </div>

          {/* Module 4 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-700/60 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">04. Evidence Mismatch & Decision Dashboard</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Cross-checks ground claims against satellite truth using rule-based filters and IsolationForest anomaly scores. Flags vegetation deficits, dry reservoirs, and boundary deviations with an auditable officer workflow.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
              <span>IsolationForest Anomaly</span>
              <span>·</span>
              <span>4-Stage Audit Workflow</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ANIMATED 3-LAYER ARCHITECTURE DIAGRAM */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="rounded-2xl bg-[#091522] border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-mono text-teal-400 uppercase tracking-wider">End-to-End Pipeline</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">End-to-End 3-Layer Technical Architecture</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              How BhuNetra transforms disparate field photographs into actionable spatial intelligence.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Layer 1: INPUT LAYER */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700/60">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-semibold tracking-wide text-sky-300">INPUT LAYER</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Multi-Source Ingestion</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">Geo-Tagged Field Photos</div>
                  <div className="text-slate-400 mt-1">EXIF GPS hardware tags, camera metadata from MGNREGA works</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">SRISHTI-DRISHTI 30m Data</div>
                  <div className="text-slate-400 mt-1">ISRO NRSC official watershed satellite basemaps & geometries</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">Sentinel-2 (10m) & Landsat</div>
                  <div className="text-slate-400 mt-1">Google Earth Engine multi-spectral bands B3, B4, B8, SCL mask</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-200">Watershed MIS Records</div>
                  <div className="text-slate-400 mt-1">Sanctioned structures, baseline dates, allocated budgets, agencies</div>
                </div>
              </div>
            </div>

            {/* Vertical Flow Connector */}
            <div className="flex justify-center text-teal-400 font-mono text-xs">
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full flex items-center gap-1.5">
                <span>↓ Ingest & Stream Telemetry ↓</span>
              </span>
            </div>

            {/* Layer 2: PROCESSING LAYER */}
            <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-900/50">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/40">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold tracking-wide text-purple-300">PROCESSING & AI LAYER</span>
                </div>
                <span className="text-[11px] font-mono text-purple-300/80">Computer Vision · Remote Sensing · Anomaly Detection</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="font-semibold text-purple-200">1. EXIF GPS Verification</div>
                  <div className="text-slate-400 mt-1">Immediate rejection if GPS missing; geometric polygon snapping</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="font-semibold text-purple-200">2. EfficientNet-B0 + Grad-CAM</div>
                  <div className="text-slate-400 mt-1">5-class structure tagging with activation heatmaps</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="font-semibold text-purple-200">3. NDVI / NDWI Change Engine</div>
                  <div className="text-slate-400 mt-1">Baseline vs post-work spectral delta calculation across 24 months</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="font-semibold text-purple-200">4. Isolation Forest Outliers</div>
                  <div className="text-slate-400 mt-1">Unsupervised spectral anomaly detection for erratic reflectance</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs sm:col-span-2">
                  <div className="font-semibold text-purple-200">5. Composite Watershed Health Score (0-100)</div>
                  <div className="text-slate-400 mt-1 font-mono text-[11px]">
                    Score = w₁·NDVI_gain + w₂·NDWI_presence + w₃·Structure_evidence + w₄·Consistency_factor
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Flow Connector */}
            <div className="flex justify-center text-teal-400 font-mono text-xs">
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full flex items-center gap-1.5">
                <span>↓ Synthesize Insights & Deliver Outputs ↓</span>
              </span>
            </div>

            {/* Layer 3: OUTPUT LAYER */}
            <div className="p-5 rounded-xl bg-teal-950/20 border border-teal-900/50">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-teal-900/40">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-semibold tracking-wide text-teal-300">OUTPUT & INTERACTION LAYER</span>
                </div>
                <span className="text-[11px] font-mono text-teal-300/80">Decision Support · Field Tools · Public Trust</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-teal-500 text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-teal-300 text-xs">GIS Dashboard</div>
                  <div className="text-slate-400 text-[11px] mt-1">Full-height interactive map with layer toggles</div>
                </button>
                <button
                  onClick={() => onNavigate('mismatches')}
                  className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-rose-500 text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-rose-300 text-xs">Mismatch Center</div>
                  <div className="text-slate-400 text-[11px] mt-1">Audit queue with officer verification assignment</div>
                </button>
                <button
                  onClick={() => onNavigate('field_pwa')}
                  className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-amber-500 text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-amber-300 text-xs">Field Capture PWA</div>
                  <div className="text-slate-400 text-[11px] mt-1">Offline-first mobile camera with queue sync</div>
                </button>
                <button
                  onClick={() => onNavigate('public_portal')}
                  className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-sky-500 text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-sky-300 text-xs">Public Portal</div>
                  <div className="text-slate-400 text-[11px] mt-1">Citizen-safe transparency without admin data</div>
                </button>
                <button
                  onClick={() => onNavigate('integration')}
                  className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-purple-500 text-left transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-purple-300 text-xs">SRISHTI REST API</div>
                  <div className="text-slate-400 text-[11px] mt-1">Two-way sync contract for ISRO geoportal</div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. WHY BHUNETRA STANDS OUT (SIH COMPETITIVE MATRIX) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-mono text-teal-400 uppercase tracking-wider">Competitive Edge</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Why BhuNetra Stands Out</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Most hackathon submissions stop at 'plotting geo-tagged photos on a map'. BhuNetra transforms photo documentation into an audit and outcome verification engine.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Capability</th>
                <th className="py-3.5 px-4 font-semibold text-slate-500">Standard SIH Submission</th>
                <th className="py-3.5 px-4 font-semibold text-teal-400">BhuNetra Innovation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Photo Verification</td>
                <td className="py-3.5 px-4 text-slate-400">Trusts uploaded photos at face value</td>
                <td className="py-3.5 px-4 text-teal-300">
                  Cross-validates against 24-month Sentinel-2 NDVI/NDWI trends. Flags discrepancies immediately.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Scoring Metric</td>
                <td className="py-3.5 px-4 text-slate-400">Separate unlinked vegetation & water maps</td>
                <td className="py-3.5 px-4 text-teal-300">
                  Single explainable 0–100 Watershed Health Score with component breakdown and terrain presets.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Explainability Layer</td>
                <td className="py-3.5 px-4 text-slate-400">Black-box score or arbitrary percentages</td>
                <td className="py-3.5 px-4 text-teal-300">
                  Grad-CAM heatmaps highlight structure pixels; clear plain-English mismatch explanations.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Rural Field Usability</td>
                <td className="py-3.5 px-4 text-slate-400">Requires uninterrupted internet access</td>
                <td className="py-3.5 px-4 text-teal-300">
                  Offline-first PWA with IndexedDB queue, multilingual toggle (Hindi, Telugu, Marathi), voice notes.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Govt Integration</td>
                <td className="py-3.5 px-4 text-slate-400">Isolated standalone demo portal</td>
                <td className="py-3.5 px-4 text-teal-300">
                  API-first architecture ready to plug directly into ISRO’s SRISHTI-DRISHTI 30m feed and Bhuvan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. QUICK LAUNCH CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-950/60 via-[#0B1F33] to-purple-950/60 border border-teal-800/60 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Ready to examine the live geospatial layer?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Inspect 25 seeded sites across 4 micro-watersheds in Chhatrapati Sambhaji Nagar, review 6 deliberate audit mismatches, and recompute weights.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
            >
              Open Interactive Map
            </button>
            <button
              onClick={() => onNavigate('public_portal')}
              className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white text-sm transition-colors cursor-pointer"
            >
              Public Transparency View
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
