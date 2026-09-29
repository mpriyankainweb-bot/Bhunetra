import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SiteDetailDrawer } from './components/SiteDetailDrawer';
import { DataModeModal } from './components/DataModeModal';

// Views
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { MismatchCenterView } from './views/MismatchCenterView';
import { ScoreEngineView } from './views/ScoreEngineView';
import { UploadClassifyView } from './views/UploadClassifyView';
import { FieldCaptureView } from './views/FieldCaptureView';
import { PublicPortalView } from './views/PublicPortalView';
import { ReportsView } from './views/ReportsView';
import { IntegrationView } from './views/IntegrationView';
import { OpenApiDocsView } from './views/OpenApiDocsView';

// Types & Data
import { WatershedSite, UserRole, DataMode, ScoreWeights, TerrainPreset, MismatchStatus } from './types';
import { INITIAL_SITES, TERRAIN_PRESETS, computeWatershedScore } from './data/seedData';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>('planner');
  const [dataMode, setDataMode] = useState<DataMode>('DEMO');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Data State
  const [sites, setSites] = useState<WatershedSite[]>(INITIAL_SITES);
  const [selectedSite, setSelectedSite] = useState<WatershedSite | null>(null);
  const [currentWeights, setCurrentWeights] = useState<ScoreWeights>(TERRAIN_PRESETS.semi_arid.weights);
  const [currentPreset, setCurrentPreset] = useState<TerrainPreset>('semi_arid');

  // Modal State
  const [isDataModeModalOpen, setIsDataModeModalOpen] = useState<boolean>(false);

  // Sync theme with html root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load sites from API on mount
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/sites');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setSites(json.data);
          }
        }
      } catch (e) {
        console.warn('Using seeded sites in client fallback:', e);
      }
    };
    fetchSites();
  }, []);

  // Update mismatch status handler
  const handleUpdateMismatchStatus = async (
    siteId: string, 
    status: MismatchStatus, 
    officer?: string, 
    notes?: string
  ) => {
    try {
      await fetch(`/api/mismatches/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedOfficer: officer, auditNotes: notes })
      });
    } catch (e) {
      console.warn('API update failed, updating in-memory state:', e);
    }

    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          mismatchStatus: status,
          assignedOfficer: officer || s.assignedOfficer,
          mismatchAuditTrail: notes ? `${s.mismatchAuditTrail || ''} | ${notes}` : s.mismatchAuditTrail
        };
      }
      return s;
    }));

    if (selectedSite && selectedSite.id === siteId) {
      setSelectedSite(prev => prev ? {
        ...prev,
        mismatchStatus: status,
        assignedOfficer: officer || prev.assignedOfficer
      } : null);
    }
  };

  // Recompute scores across all sites handler
  const handleRecomputeScores = async (newWeights: ScoreWeights, preset: TerrainPreset) => {
    setCurrentWeights(newWeights);
    setCurrentPreset(preset);

    try {
      const res = await fetch('/api/score/recompute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          w1_ndvi: newWeights.w1_ndvi,
          w2_ndwi: newWeights.w2_ndwi,
          w3_structure: newWeights.w3_structure,
          w4_consistency: newWeights.w4_consistency,
          terrain_preset: preset
        })
      });

      if (res.ok) {
        // Fetch refreshed sites
        const refreshed = await fetch('/api/sites');
        if (refreshed.ok) {
          const json = await refreshed.json();
          if (json.data) {
            setSites(json.data);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Recompute API error, computing in-memory:', e);
    }

    // Client-side fallback recomputation
    setSites(prev => prev.map(site => {
      const consistency = site.anomalyScore < -0.5 ? 0.25 : 0.88;
      const breakdown = computeWatershedScore(
        site.deltaNdvi,
        site.postworkNdwi,
        site.classificationConfidence,
        consistency,
        newWeights
      );
      return {
        ...site,
        healthScore: breakdown.composite,
        scoreBreakdown: {
          ...breakdown,
          deltaNdviRaw: site.deltaNdvi,
          deltaNdwiRaw: site.postworkNdwi
        }
      };
    }));
  };

  // Quick Demo Trigger: Opens the critical flagged Hatnoor Plantation site
  const handleOpenFlaggedDemo = () => {
    const flaggedSite = sites.find(s => s.id === 'SITE-MH-CSN-004') || sites.find(s => s.isFlagged);
    if (flaggedSite) {
      setSelectedSite(flaggedSite);
      setCurrentTab('dashboard');
    }
  };

  const mismatchCount = sites.filter(s => s.isFlagged).length;

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Government-Grade Top Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        userRole={userRole}
        onRoleChange={setUserRole}
        dataMode={dataMode}
        onDataModeToggle={() => setIsDataModeModalOpen(true)}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        mismatchCount={mismatchCount}
      />

      {/* Main Viewport Router */}
      <main className="flex-1 w-full">
        {currentTab === 'landing' && (
          <LandingView
            onNavigate={setCurrentTab}
            onOpenFlaggedDemo={handleOpenFlaggedDemo}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            sites={sites}
            selectedSite={selectedSite}
            onSelectSite={setSelectedSite}
            onOpenScoreEngine={() => setCurrentTab('score_engine')}
          />
        )}

        {currentTab === 'mismatches' && (
          <MismatchCenterView
            sites={sites}
            onSelectSite={setSelectedSite}
            onUpdateStatus={handleUpdateMismatchStatus}
          />
        )}

        {currentTab === 'score_engine' && (
          <ScoreEngineView
            currentWeights={currentWeights}
            currentPreset={currentPreset}
            onRecompute={handleRecomputeScores}
            onNavigateToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'upload' && (
          <UploadClassifyView
            onNavigateToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'field_pwa' && (
          <FieldCaptureView />
        )}

        {currentTab === 'public_portal' && (
          <PublicPortalView
            sites={sites}
            onSelectSite={setSelectedSite}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            sites={sites}
            onSelectSite={setSelectedSite}
          />
        )}

        {currentTab === 'integration' && (
          <IntegrationView />
        )}

        {currentTab === 'api_docs' && (
          <OpenApiDocsView />
        )}
      </main>

      {/* Slide-Over Site Detail Drawer */}
      <SiteDetailDrawer
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
        onAssignOfficer={(siteId) => {
          setSelectedSite(null);
          setCurrentTab('mismatches');
        }}
      />

      {/* Data Mode Switcher Modal */}
      <DataModeModal
        isOpen={isDataModeModalOpen}
        onClose={() => setIsDataModeModalOpen(false)}
        currentMode={dataMode}
        onToggleMode={() => {
          setDataMode(prev => prev === 'DEMO' ? 'LIVE' : 'DEMO');
          setIsDataModeModalOpen(false);
        }}
      />

      {/* Official Government Prototype Footer */}
      <Footer />

    </div>
  );
}
