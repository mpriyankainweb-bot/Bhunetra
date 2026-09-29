import React, { useState } from 'react';
import { Code2, ExternalLink, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  authRequired: boolean;
  requestBody?: string;
  responseSample: string;
}

export const OpenApiDocsView: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const endpoints: EndpointDoc[] = [
    {
      method: 'POST',
      path: '/api/auth/login',
      summary: 'Authenticate user and issue JWT bearer token',
      description: 'Supports role-based authentication (Admin, Planner, Field Officer, Citizen).',
      authRequired: false,
      requestBody: JSON.stringify({ username: "officer_sandeep", role: "field_officer" }, null, 2),
      responseSample: JSON.stringify({
        accessToken: "bhunetra_jwt_token_field_officer_sample",
        tokenType: "Bearer",
        role: "field_officer",
        name: "Er. Sandeep Patil",
        district: "Chhatrapati Sambhaji Nagar"
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/sites',
      summary: 'List watershed sites with spatial and health filters',
      description: 'Filters by state, district, watershed, score range (0-100), and evidence mismatch flags.',
      authRequired: true,
      responseSample: JSON.stringify({
        status: "success",
        total: 25,
        dataMode: "DEMO",
        data: [{ id: "SITE-MH-CSN-001", code: "MH-CSN-PAI-001", name: "Balegaon Check Dam", healthScore: 92, isFlagged: false }]
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/sites/{id}',
      summary: 'Retrieve detailed site dossier and 24-month spectral series',
      description: 'Returns ground photo, EfficientNet CNN label, Sentinel-2 NDVI/NDWI series, and Grad-CAM heatmap data.',
      authRequired: true,
      responseSample: JSON.stringify({
        status: "success",
        site: {
          id: "SITE-MH-CSN-004",
          code: "MH-CSN-KAN-004",
          name: "Hatnoor Hill Plantation Drive",
          healthScore: 28,
          isFlagged: true,
          mismatchSeverity: "critical",
          mismatchReason: "Vegetation Deficit Anomaly: Zero biomass gain across 24 months."
        }
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/photos',
      summary: 'Upload and classify field photo with EXIF GPS extraction',
      description: 'Strictly validates EXIF GPS coordinates; rejects non-geotagged images. Snaps to micro-watershed boundary.',
      authRequired: true,
      requestBody: JSON.stringify({
        latitude: 19.5350,
        longitude: 75.3420,
        claimedStructure: "check_dam",
        fileName: "field_dam_01.jpg"
      }, null, 2),
      responseSample: JSON.stringify({
        status: "classified",
        nearestWatershed: "Paithan West Sub-Catchment (43A)",
        cnnInference: { predictedClass: "check_dam", confidence: 0.948 },
        suggestedHealthScore: 91
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/mismatches',
      summary: 'List detected evidence mismatches for audit queue',
      description: 'Returns sites where photo claim contradicts Sentinel-2 trend, filtered by status and severity.',
      authRequired: true,
      responseSample: JSON.stringify({
        status: "success",
        total: 6,
        data: [{ id: "SITE-MH-CSN-004", mismatchSeverity: "critical", mismatchStatus: "Open" }]
      }, null, 2)
    },
    {
      method: 'PATCH',
      path: '/api/mismatches/{id}',
      summary: 'Update mismatch workflow status and assign officer',
      description: 'Transitions status: Open -> Assigned -> Verified -> Resolved.',
      authRequired: true,
      requestBody: JSON.stringify({
        status: "Assigned",
        assignedOfficer: "Er. Sandeep Patil",
        auditNotes: "Physical ground percolation audit ordered."
      }, null, 2),
      responseSample: JSON.stringify({ status: "success", newStatus: "Assigned" }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/score/recompute',
      summary: 'Dynamic multi-criteria scoring recalibration',
      description: 'Recomputes all site scores using weights w1..w4 and terrain presets (semi-arid, hilly, coastal).',
      authRequired: true,
      requestBody: JSON.stringify({
        w1_ndvi: 0.30,
        w2_ndwi: 0.35,
        w3_structure: 0.20,
        w4_consistency: 0.15,
        terrain_preset: "semi_arid"
      }, null, 2),
      responseSample: JSON.stringify({
        status: "recomputed",
        updatedCount: 25,
        averageScore: 78
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/public/summary',
      summary: 'Citizen-safe transparency summary by village',
      description: 'Returns verified works count, vegetation growth %, and water storage added without budget or contractor fields.',
      authRequired: false,
      responseSample: JSON.stringify({
        village: "Balegaon",
        totalWorks: 4,
        verifiedWorks: 4,
        averageHealthScore: 90.5,
        waterStorageCapacityM3: 9800
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/sync',
      summary: 'Batch upload synchronization from offline mobile PWA',
      description: 'Accepts queued field photos captured in rural areas without cellular coverage.',
      authRequired: true,
      requestBody: JSON.stringify({ items: [{ tempId: "TMP-77401", claimedStructure: "check_dam", latitude: 19.5350, longitude: 75.3420 }] }, null, 2),
      responseSample: JSON.stringify({ status: "synced", receivedCount: 1, syncedCount: 1 }, null, 2)
    }
  ];

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 p-4 sm:p-8 space-y-8">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <Code2 className="w-4 h-4 text-teal-400" />
            <span>OpenAPI 3.0 Specification · Interactive Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            BhuNetra REST API Reference
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Live interactive documentation for all endpoints required by Smart India Hackathon Problem Statement 26015.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          Base URL: <code className="text-teal-300">/api</code>
        </div>
      </div>

      {/* Endpoints Accordion List */}
      <div className="max-w-5xl mx-auto space-y-3">
        {endpoints.map((ep, idx) => {
          const isExpanded = expandedIndex === idx;
          const methodColors = {
            GET: 'bg-sky-950 text-sky-300 border-sky-800',
            POST: 'bg-emerald-950 text-emerald-300 border-emerald-800',
            PATCH: 'bg-amber-950 text-amber-300 border-amber-800',
            DELETE: 'bg-rose-950 text-rose-300 border-rose-800'
          };

          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
            >
              {/* Endpoint Header Bar */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 font-mono text-xs overflow-hidden">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                  <span className="font-semibold text-white truncate">{ep.path}</span>
                  <span className="hidden sm:inline text-slate-400 font-sans text-xs">· {ep.summary}</span>
                </div>

                <div className="flex items-center gap-2">
                  {ep.authRequired && (
                    <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                      JWT Auth
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Collapsed Details */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-4 text-xs font-sans">
                  <p className="text-slate-300 leading-relaxed">{ep.description}</p>

                  {/* Request Body if any */}
                  {ep.requestBody && (
                    <div>
                      <span className="font-mono text-[11px] uppercase text-slate-400 block mb-1.5">
                        Request Body (application/json)
                      </span>
                      <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-teal-300 overflow-x-auto">
                        {ep.requestBody}
                      </pre>
                    </div>
                  )}

                  {/* Response Sample */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] uppercase text-slate-400">
                        Response Payload (200 OK)
                      </span>
                      <button
                        onClick={() => copyCode(ep.responseSample, idx)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      {ep.responseSample}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
