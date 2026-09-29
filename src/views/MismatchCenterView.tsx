import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Filter, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  Eye, 
  X 
} from 'lucide-react';
import { WatershedSite, MismatchStatus, MismatchSeverity } from '../types';

interface MismatchCenterViewProps {
  sites: WatershedSite[];
  onSelectSite: (site: WatershedSite) => void;
  onUpdateStatus: (siteId: string, status: MismatchStatus, officer?: string, notes?: string) => void;
}

export const MismatchCenterView: React.FC<MismatchCenterViewProps> = ({
  sites,
  onSelectSite,
  onUpdateStatus
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  // Assignment Modal State
  const [assigningSiteId, setAssigningSiteId] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('Er. Sandeep Patil (Junior Engineer)');
  const [auditNotes, setAuditNotes] = useState<string>('Immediate field verification requested for soil and water retention audit.');

  const mismatches = sites.filter(s => s.isFlagged);

  const filteredMismatches = mismatches.filter(m => {
    if (statusFilter !== 'all' && m.mismatchStatus !== statusFilter) return false;
    if (severityFilter !== 'all' && m.mismatchSeverity !== severityFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity?: MismatchSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-yellow-950 text-yellow-300 border border-yellow-800">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300">LOW</span>;
    }
  };

  const getStatusBadge = (status?: MismatchStatus) => {
    switch (status) {
      case 'Open':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-950/80 text-red-300 border border-red-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Open</span>;
      case 'Assigned':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Assigned</span>;
      case 'Verified':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-950/80 text-sky-300 border border-sky-800 flex items-center gap-1"><Activity className="w-3 h-3" /> Verified</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      default:
        return null;
    }
  };

  const handleConfirmAssignment = () => {
    if (!assigningSiteId) return;
    onUpdateStatus(assigningSiteId, 'Assigned', selectedOfficer, auditNotes);
    setAssigningSiteId(null);
  };

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 p-4 sm:p-8 space-y-8">
      
      {/* 1. Header & Context */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>SIH 2026 Audit Subsystem · IsolationForest & Change Detection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Evidence Mismatch & Audit Center
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Automated cross-validation flags where geo-tagged ground photos contradict 24-month Sentinel-2 NDVI/NDWI satellite records.
          </p>
        </div>

        {/* Severity Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Critical Flags</span>
            <span className="text-lg font-bold font-mono text-rose-400">
              {mismatches.filter(m => m.mismatchSeverity === 'critical').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/80 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">High Priority</span>
            <span className="text-lg font-bold font-mono text-amber-400">
              {mismatches.filter(m => m.mismatchSeverity === 'high').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Mismatches</span>
            <span className="text-lg font-bold font-mono text-white">{mismatches.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Statuses ({mismatches.length})</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="Verified">Verified</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredMismatches.length} flagged sites
        </div>
      </div>

      {/* 3. Mismatch Table & Evidence Cards */}
      <div className="max-w-6xl mx-auto rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Site / Code</th>
                <th className="py-3.5 px-4 font-semibold">Claimed Structure</th>
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Discrepancy Explanation</th>
                <th className="py-3.5 px-4 font-semibold">Audit Status</th>
                <th className="py-3.5 px-4 font-semibold">Officer</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredMismatches.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Site & Location */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[11px] font-mono text-teal-400 mt-0.5">
                      {m.code} · {m.village}, {m.block}
                    </div>
                  </td>

                  {/* Claimed vs Detected */}
                  <td className="py-4 px-4 font-mono">
                    <span className="capitalize text-slate-200 block font-semibold">{m.structureType.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-500">CNN: {(m.classificationConfidence * 100).toFixed(1)}%</span>
                  </td>

                  {/* Severity */}
                  <td className="py-4 px-4">
                    {getSeverityBadge(m.mismatchSeverity)}
                  </td>

                  {/* Explanation Prose */}
                  <td className="py-4 px-4 max-w-sm">
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                      {m.mismatchReason}
                    </p>
                    <div className="text-[10px] font-mono text-rose-400/90 mt-1">
                      ΔNDVI: {m.deltaNdvi} · ΔNDWI: {m.deltaNdwi} · Anomaly: {m.anomalyScore}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-4 px-4">
                    <select
                      value={m.mismatchStatus || 'Open'}
                      onChange={(e) => onUpdateStatus(m.id, e.target.value as MismatchStatus)}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Verified">Verified</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>

                  {/* Assigned Officer */}
                  <td className="py-4 px-4 text-[11px] font-mono text-slate-400">
                    {m.assignedOfficer ? (
                      <span className="text-slate-200">{m.assignedOfficer}</span>
                    ) : (
                      <span className="text-slate-600 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                    {m.mismatchStatus === 'Open' && (
                      <button
                        onClick={() => setAssigningSiteId(m.id)}
                        className="px-2.5 py-1 text-xs rounded bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors cursor-pointer"
                      >
                        Assign
                      </button>
                    )}
                    <button
                      onClick={() => onSelectSite(m)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Assignment Modal */}
      {assigningSiteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-400" />
                Assign Field Officer for Verification
              </h3>
              <button
                onClick={() => setAssigningSiteId(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase">Select Officer</label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-hidden"
                >
                  <option value="Er. Sandeep Patil (Junior Engineer / BDO Kannad)">Er. Sandeep Patil (Junior Engineer / BDO Kannad)</option>
                  <option value="Kavita Shinde (Agronomy Officer Gangapur)">Kavita Shinde (Agronomy Officer Gangapur)</option>
                  <option value="Mahesh Deshmukh (Junior Engineer Minor Irrigation)">Mahesh Deshmukh (Junior Engineer Minor Irrigation)</option>
                  <option value="Suresh More (District GIS Cell)">Suresh More (District GIS Cell)</option>
                  <option value="Anand Rao (Executive Engineer GSDA)">Anand Rao (Executive Engineer GSDA)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase">Dispatch Instructions</label>
                <textarea
                  rows={3}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Task will be queued to the officer's <strong>BhuNetra Field Capture PWA</strong> with offline sync support.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setAssigningSiteId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
