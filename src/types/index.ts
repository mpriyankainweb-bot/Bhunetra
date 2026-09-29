export type UserRole = 'admin' | 'planner' | 'field_officer' | 'citizen';

export type TerrainPreset = 'semi_arid' | 'hilly' | 'coastal';

export type StructureType =
  | 'check_dam'
  | 'farm_pond'
  | 'plantation'
  | 'contour_trench'
  | 'water_body'
  | 'degraded_land';

export type MismatchSeverity = 'critical' | 'high' | 'medium' | 'low';

export type MismatchStatus = 'Open' | 'Assigned' | 'Verified' | 'Resolved';

export type DataMode = 'DEMO' | 'LIVE';

export interface ScoreWeights {
  w1_ndvi: number;
  w2_ndwi: number;
  w3_structure: number;
  w4_consistency: number;
}

export interface TimeSeriesPoint {
  date: string;
  monthLabel: string;
  ndvi: number;
  ndwi: number;
  soilMoistureIndex: number;
  rainfallMm: number;
}

export interface ScoreBreakdown {
  ndvi_gain: number;          // 0 - 100
  ndwi_presence: number;      // 0 - 100
  structure_evidence: number; // 0 - 100
  consistency_factor: number; // 0 - 100
  composite: number;          // 0 - 100
  deltaNdviRaw: number;
  deltaNdwiRaw: number;
}

export interface WatershedSite {
  id: string;
  code: string;
  name: string;
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  watershedId: string;
  watershedName: string;
  terrainType: TerrainPreset;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  structureType: StructureType;
  sanctionedDate: string;
  completionDate: string;
  budgetInrLakhs: number;
  mgnregaWorkId: string;
  implementingAgency: string;

  // ML & Classification
  photoUrl: string;
  gradcamUrl?: string;
  satelliteBeforeUrl?: string;
  satelliteAfterUrl?: string;
  classificationLabel: StructureType;
  classificationConfidence: number; // 0 - 1.0
  secondaryLabel?: string;
  secondaryConfidence?: number;

  // Remote Sensing Metrics
  baselineNdvi: number;
  postworkNdvi: number;
  deltaNdvi: number;
  baselineNdwi: number;
  postworkNdwi: number;
  deltaNdwi: number;

  // Scoring
  healthScore: number; // 0 - 100
  scoreBreakdown: ScoreBreakdown;

  // Mismatch & Audit
  isFlagged: boolean;
  mismatchSeverity?: MismatchSeverity;
  mismatchStatus?: MismatchStatus;
  mismatchReason?: string;
  mismatchAuditTrail?: string;
  assignedOfficer?: string;
  anomalyScore: number; // -1.0 to 1.0 (Isolation Forest metric)

  // 24 Months Time Series
  timeseries: TimeSeriesPoint[];
}

export interface OfflineSyncItem {
  id: string;
  tempId: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  imagePreview: string; // base64 / blob
  fileName: string;
  fileSizeBytes: number;
  claimedStructure: StructureType;
  villageName: string;
  watershedId: string;
  officerName: string;
  notes: string;
  voiceNoteTranscript?: string;
  syncStatus: 'queued' | 'syncing' | 'synced' | 'rejected';
  rejectionReason?: string;
  processedResult?: {
    siteId: string;
    cnnPredicted: StructureType;
    confidence: number;
    score: number;
    isFlagged: boolean;
  };
}

export interface FilterState {
  state: string;
  district: string;
  watershed: string;
  structureType: string;
  scoreRange: [number, number];
  flaggedOnly: boolean;
  searchQuery: string;
}

export interface PublicSummary {
  village: string;
  district: string;
  totalWorks: number;
  completedWorks: number;
  verifiedWorks: number;
  averageHealthScore: number;
  greenCoverGrowthPct: number;
  waterStorageCapacityM3: number;
  sites: Array<{
    id: string;
    name: string;
    structureType: StructureType;
    healthScore: number;
    completionDate: string;
    isVerified: boolean;
    photoUrl: string;
  }>;
}
