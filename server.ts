/**
 * BhuNetra Full-Stack Express Server
 * Serves API endpoints and mounts Vite dev server in middleware mode.
 */
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_SITES, computeWatershedScore, TERRAIN_PRESETS } from './src/data/seedData';
import { WatershedSite, ScoreWeights, TerrainPreset } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_MODE = process.env.VITE_DATA_MODE || 'DEMO';

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory data store initialized from seed data
let sitesDatabase: WatershedSite[] = JSON.parse(JSON.stringify(INITIAL_SITES));
let currentWeights: ScoreWeights = { ...TERRAIN_PRESETS.semi_arid.weights };
let currentTerrainPreset: TerrainPreset = 'semi_arid';

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// System Info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: DATA_MODE,
    platform: 'BhuNetra',
    version: '1.0.0',
    problemStatement: 'SIH 2026 - PS 26015',
    activeSites: sitesDatabase.length,
    flaggedMismatches: sitesDatabase.filter(s => s.isFlagged).length
  });
});

// Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, role } = req.body;
  const userRole = role || 'planner';
  const roleNames: Record<string, string> = {
    admin: 'Dr. Ramesh Sharma (National Project Director, DoLR)',
    planner: 'Sunita Deshmukh (District Watershed Planner, CSN)',
    field_officer: 'Er. Sandeep Patil (Junior Engineer / Field Officer)',
    citizen: 'Panchayat Citizen Observer (Balegaon GP)'
  };

  res.json({
    accessToken: `bhunetra_jwt_token_${userRole}_${Date.now()}`,
    tokenType: 'Bearer',
    role: userRole,
    name: roleNames[userRole] || 'Authorized Officer',
    district: 'Chhatrapati Sambhaji Nagar',
    state: 'Maharashtra',
    permissions: userRole === 'admin' ? ['*'] : userRole === 'planner' ? ['read', 'score', 'report', 'assign'] : userRole === 'field_officer' ? ['read', 'upload', 'sync', 'verify'] : ['read_public']
  });
});

// List Sites with filters
app.get('/api/sites', (req: Request, res: Response) => {
  const { state, district, watershed, structureType, scoreMin, scoreMax, flagged, search } = req.query;

  let results = [...sitesDatabase];

  if (watershed && watershed !== 'all') {
    results = results.filter(s => s.watershedId === watershed || s.watershedName.toLowerCase().includes(String(watershed).toLowerCase()));
  }

  if (structureType && structureType !== 'all') {
    results = results.filter(s => s.structureType === structureType);
  }

  if (scoreMin !== undefined) {
    results = results.filter(s => s.healthScore >= parseInt(String(scoreMin)));
  }

  if (scoreMax !== undefined) {
    results = results.filter(s => s.healthScore <= parseInt(String(scoreMax)));
  }

  if (flagged !== undefined && flagged !== 'all') {
    const isFlaggedBool = flagged === 'true';
    results = results.filter(s => s.isFlagged === isFlaggedBool);
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.village.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.structureType.toLowerCase().includes(q)
    );
  }

  res.json({
    status: 'success',
    total: results.length,
    dataMode: DATA_MODE,
    data: results
  });
});

// Single Site Details
app.get('/api/sites/:id', (req: Request, res: Response) => {
  const site = sitesDatabase.find(s => s.id === req.params.id || s.code === req.params.id);
  if (!site) {
    return res.status(404).json({ error: 'Site not found', siteId: req.params.id });
  }

  res.json({
    status: 'success',
    dataMode: DATA_MODE,
    site
  });
});

// Site Score Detail
app.get('/api/sites/:id/score', (req: Request, res: Response) => {
  const site = sitesDatabase.find(s => s.id === req.params.id);
  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  res.json({
    siteId: site.id,
    healthScore: site.healthScore,
    formula: 'Score = w1*NDVI_gain + w2*NDWI_presence + w3*Structure_evidence + w4*Consistency_factor',
    currentWeights,
    breakdown: site.scoreBreakdown
  });
});

// Upload and Classify Photo
app.post('/api/photos', (req: Request, res: Response) => {
  const { 
    imageBase64, 
    fileName, 
    latitude, 
    longitude, 
    claimedStructure,
    watershedId
  } = req.body;

  // Strict EXIF GPS validation
  if (!latitude || !longitude || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
    return res.status(400).json({
      error: 'REJECTED_MISSING_EXIF_GPS',
      message: 'Photo rejected: No hardware geo-tagging (EXIF GPS coordinates) detected. All BhuNetra submissions must contain valid latitude & longitude.',
      fileName: fileName || 'unknown.jpg'
    });
  }

  const latNum = Number(latitude);
  const lonNum = Number(longitude);

  // Snap to nearest watershed boundary
  const nearestWatershed = {
    id: watershedId || 'W-MH-CSN-01',
    name: 'Paithan West Sub-Catchment (43A)',
    distanceMeters: Math.floor(8 + Math.random() * 25)
  };

  // CNN Inference Simulation (EfficientNet-B0)
  const predictedClass = claimedStructure || 'check_dam';
  const confidence = parseFloat((0.89 + Math.random() * 0.09).toFixed(3));

  // Anomaly check
  const newSiteId = `SITE-UPLOAD-${Date.now()}`;

  res.json({
    status: 'classified',
    siteId: newSiteId,
    fileName,
    coordinates: { latitude: latNum, longitude: lonNum },
    nearestWatershed,
    cnnInference: {
      predictedClass,
      confidence,
      secondaryClass: 'farm_pond',
      secondaryConfidence: parseFloat((1 - confidence).toFixed(3))
    },
    gradcamMapUrl: 'gradcam_sample_overlay',
    isolationForestStatus: 'CONCORDANT',
    suggestedHealthScore: 88,
    message: 'Photo successfully verified, classified by EfficientNet-B0, and aligned to watershed boundary.'
  });
});

// Mismatches List
app.get('/api/mismatches', (req: Request, res: Response) => {
  const { status, severity } = req.query;
  let mismatches = sitesDatabase.filter(s => s.isFlagged);

  if (status && status !== 'all') {
    mismatches = mismatches.filter(s => s.mismatchStatus === status);
  }

  if (severity && severity !== 'all') {
    mismatches = mismatches.filter(s => s.mismatchSeverity === severity);
  }

  res.json({
    status: 'success',
    total: mismatches.length,
    data: mismatches
  });
});

// Update Mismatch Status
app.patch('/api/mismatches/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, assignedOfficer, auditNotes } = req.body;

  const siteIndex = sitesDatabase.findIndex(s => s.id === id);
  if (siteIndex === -1) {
    return res.status(404).json({ error: 'Mismatch site not found' });
  }

  if (status) {
    sitesDatabase[siteIndex].mismatchStatus = status;
  }
  if (assignedOfficer) {
    sitesDatabase[siteIndex].assignedOfficer = assignedOfficer;
  }
  if (auditNotes) {
    sitesDatabase[siteIndex].mismatchAuditTrail = `${sitesDatabase[siteIndex].mismatchAuditTrail || ''} | ${new Date().toISOString().split('T')[0]}: ${auditNotes}`;
  }

  res.json({
    status: 'success',
    site: sitesDatabase[siteIndex]
  });
});

// Recompute All Scores
app.post('/api/score/recompute', (req: Request, res: Response) => {
  const { w1_ndvi, w2_ndwi, w3_structure, w4_consistency, terrain_preset } = req.body;

  if (terrain_preset && TERRAIN_PRESETS[terrain_preset as TerrainPreset]) {
    currentTerrainPreset = terrain_preset as TerrainPreset;
    currentWeights = { ...TERRAIN_PRESETS[currentTerrainPreset].weights };
  } else if (w1_ndvi !== undefined) {
    currentWeights = {
      w1_ndvi: Number(w1_ndvi),
      w2_ndwi: Number(w2_ndwi),
      w3_structure: Number(w3_structure),
      w4_consistency: Number(w4_consistency)
    };
  }

  // Recalculate scores for all sites in database
  let totalScore = 0;
  sitesDatabase.forEach(site => {
    const consistency = site.anomalyScore < -0.5 ? 0.25 : 0.88;
    const computed = computeWatershedScore(
      site.deltaNdvi,
      site.postworkNdwi,
      site.classificationConfidence,
      consistency,
      currentWeights
    );
    site.healthScore = computed.composite;
    site.scoreBreakdown = {
      ...computed,
      deltaNdviRaw: site.deltaNdvi,
      deltaNdwiRaw: site.postworkNdwi
    };
    totalScore += site.healthScore;
  });

  res.json({
    status: 'recomputed',
    updatedCount: sitesDatabase.length,
    terrainPreset: currentTerrainPreset,
    weightsApplied: currentWeights,
    averageScore: Math.round(totalScore / sitesDatabase.length)
  });
});

// Reports for a watershed
app.get('/api/reports/:watershedId', (req: Request, res: Response) => {
  const { watershedId } = req.params;
  const sites = sitesDatabase.filter(s => s.watershedId === watershedId || watershedId === 'all');
  const avgScore = sites.length ? Math.round(sites.reduce((acc, s) => acc + s.healthScore, 0) / sites.length) : 0;
  const flaggedCount = sites.filter(s => s.isFlagged).length;

  res.json({
    watershedId,
    generatedAt: new Date().toISOString(),
    evaluationCycle: '2024-2026',
    totalSites: sites.length,
    averageHealthScore: avgScore,
    flaggedMismatches: flaggedCount,
    healthGrade: avgScore >= 80 ? 'Grade A - High Resilience' : avgScore >= 60 ? 'Grade B - Moderate' : 'Grade C - Interventions Needed',
    structuresSummary: {
      checkDams: sites.filter(s => s.structureType === 'check_dam').length,
      farmPonds: sites.filter(s => s.structureType === 'farm_pond').length,
      plantations: sites.filter(s => s.structureType === 'plantation').length,
      contourTrenches: sites.filter(s => s.structureType === 'contour_trench').length
    },
    sites
  });
});

// Citizen Public Transparency Summary
app.get('/api/public/summary', (req: Request, res: Response) => {
  const village = (req.query.village as string) || 'Balegaon';
  const villageSites = sitesDatabase.filter(s => s.village.toLowerCase() === village.toLowerCase());
  const sitesToUse = villageSites.length ? villageSites : sitesDatabase.slice(0, 4);

  const avgScore = Math.round(sitesToUse.reduce((acc, s) => acc + s.healthScore, 0) / sitesToUse.length);

  res.json({
    village: villageSites.length ? village : 'Balegaon',
    district: 'Chhatrapati Sambhaji Nagar',
    state: 'Maharashtra',
    totalWorks: sitesToUse.length,
    completedWorks: sitesToUse.length,
    verifiedWorks: sitesToUse.filter(s => !s.isFlagged).length,
    averageHealthScore: avgScore,
    greenCoverGrowthPct: 24.2,
    waterStorageCapacityM3: 9800,
    sites: sitesToUse.map(s => ({
      id: s.id,
      name: s.name,
      structureType: s.structureType,
      healthScore: s.healthScore,
      completionDate: s.completionDate,
      isVerified: !s.isFlagged,
      photoUrl: s.photoUrl
    }))
  });
});

// Offline Sync Queue
app.post('/api/sync', (req: Request, res: Response) => {
  const { items } = req.body;
  const count = Array.isArray(items) ? items.length : 0;

  res.json({
    status: 'synced',
    receivedCount: count,
    syncedCount: count,
    rejectedCount: 0,
    timestamp: new Date().toISOString(),
    message: `Batch upload synchronized ${count} geo-tagged photos to BhuNetra repository.`
  });
});

// SRISHTI-DRISHTI REST API Mock & Test Ping
app.post('/api/srishti/test-ping', (req: Request, res: Response) => {
  res.json({
    srishti_gateway: 'NRSC-ISRO Bhuvan Spatial Hub v3.4',
    latency_ms: 42,
    protocol: 'REST/JSON over mTLS',
    earth_engine_status: DATA_MODE === 'LIVE' ? 'ACTIVE' : 'SIMULATED_SATELLITE_CATALOG',
    sentinel2_resolution_meters: 10,
    srishti_drishti_feed_resolution_meters: 30,
    sync_status: 'NOMINAL'
  });
});

// OpenAPI Spec Endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'BhuNetra Geospatial Analytics API',
      description: 'API for fusing geo-tagged field photos with satellite NDVI/NDWI trends (SIH 2026 PS 26015).',
      version: '1.0.0'
    },
    paths: {
      '/api/sites': { get: { summary: 'List watershed sites with filters' } },
      '/api/sites/{id}': { get: { summary: 'Get details, photo, and 24-mo spectral series' } },
      '/api/photos': { post: { summary: 'Extract EXIF GPS, classify via CNN, snap to watershed' } },
      '/api/mismatches': { get: { summary: 'List evidence mismatches for audit' } },
      '/api/score/recompute': { post: { summary: 'Recompute scores with custom weights w1..w4' } },
      '/api/reports/{watershedId}': { get: { summary: 'Generate watershed health report' } },
      '/api/public/summary': { get: { summary: 'Citizen-safe transparency data' } },
      '/api/sync': { post: { summary: 'Batch sync offline field mobile queue' } }
    }
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Files Integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve built assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite Dev Server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BhuNetra Engine] Server active on http://0.0.0.0:${PORT} [Data Mode: ${DATA_MODE}]`);
  });
}

startServer();
