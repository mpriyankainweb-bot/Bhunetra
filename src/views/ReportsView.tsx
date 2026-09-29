import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  Building2, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { WatershedSite } from '../types';

interface ReportsViewProps {
  sites: WatershedSite[];
  onSelectSite: (site: WatershedSite) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sites,
  onSelectSite
}) => {
  const [selectedWatershed, setSelectedWatershed] = useState<string>('W-MH-CSN-01');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const watershedMap: Record<string, string> = {
    'all': 'Comprehensive District Watershed Portfolio',
    'W-MH-CSN-01': 'Paithan West Sub-Catchment (43A)',
    'W-MH-CSN-02': 'Gangapur Godavari Basin (12B)',
    'W-MH-CSN-03': 'Kannad Hill Slope Escarpment (08C)',
    'W-MH-CSN-04': 'Vaijapur Dryland Corridor (21D)'
  };

  const reportSites = sites.filter(s => selectedWatershed === 'all' || s.watershedId === selectedWatershed);
  const avgScore = reportSites.length ? Math.round(reportSites.reduce((acc, s) => acc + s.healthScore, 0) / reportSites.length) : 0;
  const flaggedCount = reportSites.filter(s => s.isFlagged).length;
  const totalBudget = reportSites.reduce((acc, s) => acc + s.budgetInrLakhs, 0);

  // Generate real PDF with jsPDF
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Cover Header
      doc.setFillColor(11, 31, 51);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('BHUNETRA · WATERSHED AUDIT DOSSIER', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(45, 212, 191);
      doc.text('Smart India Hackathon 2026 | Problem Statement 26015', 14, 26);
      doc.setTextColor(200, 200, 200);
      doc.text('Department of Land Resources (DoLR), Ministry of Rural Development', 14, 33);

      // Report Meta Table
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Watershed: ${watershedMap[selectedWatershed]}`, 14, 54);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`District: Chhatrapati Sambhaji Nagar, Maharashtra | Generated: ${new Date().toLocaleDateString()}`, 14, 61);

      // Summary KPIs Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 68, 182, 28, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('COMPOSITE SCORE', 20, 76);
      doc.text('TOTAL SITES', 68, 76);
      doc.text('FLAGGED MISMATCHES', 114, 76);
      doc.text('TOTAL EXPENDITURE', 160, 76);

      doc.setFontSize(14);
      doc.setTextColor(18, 124, 102);
      doc.text(`${avgScore}/100`, 20, 86);
      doc.setTextColor(30, 41, 59);
      doc.text(`${reportSites.length}`, 68, 86);
      doc.setTextColor(225, 29, 72);
      doc.text(`${flaggedCount}`, 114, 86);
      doc.setTextColor(30, 41, 59);
      doc.text(`₹${totalBudget.toFixed(1)}L`, 160, 86);

      // Executive Summary
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Executive Remote Sensing Appraisal', 14, 108);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const appraisalText = doc.splitTextToSize(
        `This automated geospatial report synthesizes multi-temporal Sentinel-2 optical imagery (Bands 3, 4, 8) with ground-truth geotagged photographs submitted under MGNREGA / WDC-PMKSY. Out of ${reportSites.length} evaluated structures, ${reportSites.length - flaggedCount} structures demonstrated concordant biophysical outcomes. ${flaggedCount} structure(s) triggered evidence-mismatch alerts due to anomalous spectral signatures or spatial boundary deviations.`,
        182
      );
      doc.text(appraisalText, 14, 115);

      // Structure Audit Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. Structure-Level Verification Inventory', 14, 142);

      let yPos = 150;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(226, 232, 240);
      doc.rect(14, yPos - 5, 182, 7, 'F');
      doc.text('Code', 16, yPos);
      doc.text('Site Name & Village', 45, yPos);
      doc.text('Structure', 105, yPos);
      doc.text('Score', 140, yPos);
      doc.text('Audit Status', 162, yPos);

      yPos += 8;
      doc.setFont('helvetica', 'normal');

      reportSites.forEach((site) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.text(site.code, 16, yPos);
        doc.text(doc.splitTextToSize(`${site.name} (${site.village})`, 55)[0], 45, yPos);
        doc.text(site.structureType.replace('_', ' '), 105, yPos);
        doc.text(`${site.healthScore}`, 140, yPos);
        
        if (site.isFlagged) {
          doc.setTextColor(225, 29, 72);
          doc.text(`FLAGGED (${site.mismatchSeverity?.toUpperCase()})`, 162, yPos);
          doc.setTextColor(30, 41, 59);
        } else {
          doc.setTextColor(16, 185, 129);
          doc.text('CONCORDANT', 162, yPos);
          doc.setTextColor(30, 41, 59);
        }

        yPos += 7;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Prototype. Production integrates with the SRISHTI-DRISHTI 30m feed, Sentinel-2 and Bhuvan.', 14, 288);

      doc.save(`BhuNetra_Report_${selectedWatershed}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 p-4 sm:p-8 space-y-8">
      
      {/* 1. Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Watershed Evaluation Dossier · WDC-PMKSY 2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Watershed Health & Audit Reports
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Generate formal geospatial audit reports for District Magistrates, State Watershed Cells, and DoLR project directors.
          </p>
        </div>

        {/* Watershed Selector & Download CTA */}
        <div className="flex items-center gap-3">
          <select
            value={selectedWatershed}
            onChange={(e) => setSelectedWatershed(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-teal-300 font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="W-MH-CSN-01">Paithan West (43A)</option>
            <option value="W-MH-CSN-02">Gangapur Godavari (12B)</option>
            <option value="W-MH-CSN-03">Kannad Escarpment (08C)</option>
            <option value="W-MH-CSN-04">Vaijapur Corridor (21D)</option>
            <option value="all">District Portfolio (All 25 Sites)</option>
          </select>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-teal-950/50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Report Document Preview */}
      <div className="max-w-5xl mx-auto rounded-2xl bg-[#091522] border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Document Header Lockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
              Ministry of Rural Development · Department of Land Resources
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {watershedMap[selectedWatershed]}
            </h2>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              Evaluation Cycle: 2024–2026 · Chhatrapati Sambhaji Nagar, Maharashtra
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Health Grade</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {avgScore >= 80 ? 'Grade A' : avgScore >= 60 ? 'Grade B' : 'Grade C'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Composite Health</span>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1">{avgScore} / 100</div>
            <span className="text-[11px] text-slate-400">Weighted Index</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Works</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{reportSites.length} Sites</div>
            <span className="text-[11px] text-slate-400">Sanctioned & Built</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Flagged Discrepancies</span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{flaggedCount} Sites</div>
            <span className="text-[11px] text-rose-400/80">Audit Inspection Required</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Sanctioned</span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">₹{totalBudget.toFixed(1)} Lakhs</div>
            <span className="text-[11px] text-slate-400">Public Funds Allocated</span>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs leading-relaxed text-slate-300">
          <h3 className="font-semibold text-white text-sm">Automated Executive Appraisal</h3>
          <p>
            This dossier integrates multi-spectral Sentinel-2 satellite observations (10m resolution) with field photo telemetry uploaded by junior engineers. 
            Across the <strong>{watershedMap[selectedWatershed]}</strong>, {reportSites.length - flaggedCount} works exhibit positive post-monsoon NDVI vegetation gains and sustained water presence (NDWI).
            {flaggedCount > 0 && (
              <span className="text-rose-300 ml-1">
                However, {flaggedCount} site(s) demonstrated critical biophysical inconsistencies, including claimed plantations with negative biomass gains or claimed check dams without surface water storage.
              </span>
            )}
          </p>
        </div>

        {/* Structure Inventory Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Structure-Level Performance Breakdown</h3>
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {reportSites.map(site => (
                  <tr 
                    key={site.id}
                    onClick={() => onSelectSite(site)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-teal-300">{site.code}</td>
                    <td className="py-3 px-4 font-semibold text-white">{site.name}</td>
                    <td className="py-3 px-4 text-slate-400 capitalize">{site.structureType.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">₹{site.budgetInrLakhs.toFixed(2)}L</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={site.healthScore >= 70 ? 'text-emerald-400' : 'text-rose-400'}>
                        {site.healthScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {site.isFlagged ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          FLAGGED
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          CONCORDANT
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
