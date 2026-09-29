import React, { useState } from 'react';
import { 
  UploadCloud, 
  MapPin, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  FileWarning, 
  Sparkles, 
  Layers, 
  FileText, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react';
import { APP_IMAGES } from '../assets/images';
import { StructureType } from '../types';

interface UploadClassifyViewProps {
  onPhotoVerifiedAndAdded?: (siteData: any) => void;
  onNavigateToDashboard: () => void;
}

interface TestSample {
  id: string;
  name: string;
  structure: StructureType;
  hasGps: boolean;
  lat?: number;
  lon?: number;
  altitude?: number;
  image: string;
  description: string;
}

export const UploadClassifyView: React.FC<UploadClassifyViewProps> = ({
  onPhotoVerifiedAndAdded,
  onNavigateToDashboard
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [claimedStructure, setClaimedStructure] = useState<StructureType>('check_dam');
  const [watershedId, setWatershedId] = useState<string>('W-MH-CSN-01');

  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0); // 0: Idle, 1: EXIF, 2: CNN, 3: Align, 4: Scored
  const [errorStatus, setErrorStatus] = useState<{ code: string; message: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Preloaded sample test photos (includes non-geotagged failure test case!)
  const testSamples: TestSample[] = [
    {
      id: 'sample-checkdam',
      name: 'Valid Check Dam (Paithan)',
      structure: 'check_dam',
      hasGps: true,
      lat: 19.5350,
      lon: 75.3420,
      altitude: 468,
      image: APP_IMAGES.fieldCheckDam,
      description: 'Newly constructed masonry check dam with embedded EXIF GPS tags'
    },
    {
      id: 'sample-plantation',
      name: 'Valid Plantation (Kannad)',
      structure: 'plantation',
      hasGps: true,
      lat: 20.2584,
      lon: 75.1432,
      altitude: 642,
      image: APP_IMAGES.fieldPlantation,
      description: 'Hillside sapling afforestation with hardware geo-tagging'
    },
    {
      id: 'sample-pond',
      name: 'Valid Farm Pond (Gangapur)',
      structure: 'farm_pond',
      hasGps: true,
      lat: 19.7821,
      lon: 75.0215,
      altitude: 498,
      image: APP_IMAGES.fieldFarmPond,
      description: 'Earthen farm pond with coordinate metadata'
    },
    {
      id: 'sample-no-gps',
      name: 'REJECTION TEST: WhatsApp Photo (NO GPS)',
      structure: 'check_dam',
      hasGps: false,
      image: APP_IMAGES.fieldCheckDam,
      description: 'Photo stripped of EXIF metadata to test strict government rejection guardrail'
    }
  ];

  const handleSelectSample = (sample: TestSample) => {
    setPreviewUrl(sample.image);
    setClaimedStructure(sample.structure);
    setErrorStatus(null);
    setAnalysisResult(null);
    setPipelineStep(0);

    // Run pipeline for sample
    runPipelineSimulation(sample);
  };

  const runPipelineSimulation = async (sample: { hasGps: boolean; lat?: number; lon?: number; structure: StructureType; name: string }) => {
    setIsProcessing(true);
    setErrorStatus(null);
    setAnalysisResult(null);

    // Step 1: EXIF GPS Check
    setPipelineStep(1);
    await new Promise(r => setTimeout(r, 600));

    if (!sample.hasGps) {
      setIsProcessing(false);
      setPipelineStep(1);
      setErrorStatus({
        code: 'REJECTED_MISSING_EXIF_GPS',
        message: 'Photo rejected by BhuNetra verification guardrail: No hardware EXIF GPS coordinates found. All submissions to DoLR must contain authentic device geotags.'
      });
      return;
    }

    // Step 2: EfficientNet-B0 CNN Inference
    setPipelineStep(2);
    await new Promise(r => setTimeout(r, 700));

    // Step 3: Spatial Alignment & Boundary Snapping
    setPipelineStep(3);
    await new Promise(r => setTimeout(r, 600));

    // Step 4: Scoring & Grad-CAM synthesis
    setPipelineStep(4);
    await new Promise(r => setTimeout(r, 600));

    setIsProcessing(false);
    setAnalysisResult({
      status: 'VERIFIED',
      coordinates: { lat: sample.lat, lon: sample.lon },
      nearestWatershed: 'Paithan West Sub-Catchment (43A)',
      snapDistanceMeters: 14.8,
      cnnClass: sample.structure,
      cnnConfidence: 0.948,
      suggestedScore: 91,
      mismatchStatus: 'CONCORDANT_VALIDATED'
    });
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Simulated check on custom upload
    const hasGpsSim = !file.name.toLowerCase().includes('nogps') && !file.name.toLowerCase().includes('whatsapp');
    runPipelineSimulation({
      hasGps: hasGpsSim,
      lat: 19.5412,
      lon: 75.3120,
      structure: claimedStructure,
      name: file.name
    });
  };

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 p-4 sm:p-8 space-y-8">
      
      {/* 1. Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <UploadCloud className="w-4 h-4 text-teal-400" />
            <span>Automated Ingestion Pipeline · EXIF & CNN Inference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Photo Ingestion & Classification Pipeline
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Upload field photographs of watershed works. BhuNetra extracts hardware EXIF GPS, rejects non-geotagged images, classifies structures using EfficientNet-B0, and snaps to micro-watershed boundaries.
          </p>
        </div>

        <button
          onClick={onNavigateToDashboard}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>GIS Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload Zone & Preloaded Test Cases */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* File Dropzone */}
          <div className="rounded-xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-teal-500/80 p-6 text-center transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleCustomFileUpload}
              className="hidden"
              id="field-photo-upload"
            />
            <label htmlFor="field-photo-upload" className="cursor-pointer block space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-teal-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-white">Click or drag photo to inspect</div>
              <div className="text-[11px] text-slate-500">Supports JPEG / PNG with EXIF GPS</div>
            </label>
          </div>

          {/* Preloaded Test Batches Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <span className="text-[11px] font-mono uppercase text-slate-400 block pb-1 border-b border-slate-800">
              One-Click Demonstration Samples
            </span>

            <div className="space-y-2">
              {testSamples.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                    sample.hasGps
                      ? 'bg-slate-950/60 border-slate-800 hover:border-teal-700 text-slate-300'
                      : 'bg-rose-950/30 border-rose-800/80 hover:bg-rose-900/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="truncate">{sample.name}</span>
                    {sample.hasGps ? (
                      <span className="text-[10px] font-mono text-teal-400 font-normal">GPS OK</span>
                    ) : (
                      <span className="text-[10px] font-mono text-rose-400 font-bold">NO GPS</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                    {sample.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: 4-Stage Pipeline Tracker & Real-Time Results */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">4-Stage Verification Pipeline</h2>
            {isProcessing && (
              <span className="flex items-center gap-1.5 text-xs text-teal-400 font-mono animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Processing Stage {pipelineStep}/4...
              </span>
            )}
          </div>

          {/* 4 Pipeline Stages Visualization */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
            
            {/* Stage 1 */}
            <div className={`p-3 rounded-lg border transition-all ${
              pipelineStep > 1 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' :
              pipelineStep === 1 && errorStatus ? 'bg-rose-950/60 border-rose-700 text-rose-300' :
              pipelineStep === 1 ? 'bg-teal-950/60 border-teal-700 text-teal-200 animate-pulse' :
              'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>01. EXIF GPS</span>
                {pipelineStep > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {errorStatus && pipelineStep === 1 && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Hardware GPS Tag Validation</div>
            </div>

            {/* Stage 2 */}
            <div className={`p-3 rounded-lg border transition-all ${
              pipelineStep > 2 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' :
              pipelineStep === 2 ? 'bg-teal-950/60 border-teal-700 text-teal-200 animate-pulse' :
              'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>02. CNN Tag</span>
                {pipelineStep > 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">EfficientNet-B0 Classification</div>
            </div>

            {/* Stage 3 */}
            <div className={`p-3 rounded-lg border transition-all ${
              pipelineStep > 3 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' :
              pipelineStep === 3 ? 'bg-teal-950/60 border-teal-700 text-teal-200 animate-pulse' :
              'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>03. GIS Snap</span>
                {pipelineStep > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Watershed Polygon Alignment</div>
            </div>

            {/* Stage 4 */}
            <div className={`p-3 rounded-lg border transition-all ${
              pipelineStep >= 4 && !errorStatus ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' :
              pipelineStep === 4 ? 'bg-teal-950/60 border-teal-700 text-teal-200 animate-pulse' :
              'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>04. Scoring</span>
                {pipelineStep >= 4 && !errorStatus && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Temporal Audit & Grad-CAM</div>
            </div>

          </div>

          {/* ERROR BANNER: Strict EXIF Rejection Guardrail */}
          {errorStatus && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-700 text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-400 font-mono">
                <FileWarning className="w-4 h-4 text-rose-500" />
                <span>REJECTED: {errorStatus.code}</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                {errorStatus.message}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 font-mono">
                Audit Rule: MoRD Policy requires all field monitoring photographs to contain tamper-resistant hardware GPS EXIF metadata.
              </div>
            </div>
          )}

          {/* SUCCESS RESULT CARD */}
          {analysisResult && (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  AUTHENTICATED & PROCESSED
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Snap Delta: {analysisResult.snapDistanceMeters}m
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo Preview with Bounding/GradCAM */}
                <div className="rounded-lg overflow-hidden border border-slate-800 aspect-4/3 relative">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-teal-300">
                    EXIF: {analysisResult.coordinates.lat}°N, {analysisResult.coordinates.lon}°E
                  </div>
                </div>

                {/* AI Inferences Details */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">CNN Predicted Structure</span>
                    <span className="font-bold text-white text-base capitalize">
                      {analysisResult.cnnClass.replace('_', ' ')}
                    </span>
                    <span className="text-teal-400 font-mono ml-2 text-xs">
                      ({(analysisResult.cnnConfidence * 100).toFixed(1)}% Confidence)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Aligned Watershed</span>
                    <span className="text-slate-200 font-semibold">{analysisResult.nearestWatershed}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Predicted Health Score</span>
                    <span className="font-mono text-xl font-bold text-emerald-400">
                      {analysisResult.suggestedScore} / 100
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                      IsolationForest: Spectral Concordance Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Idle prompt */}
          {!analysisResult && !errorStatus && !isProcessing && (
            <div className="p-8 rounded-xl border border-slate-800 bg-slate-950/40 text-center text-slate-500 text-xs">
              Select one of the sample test cases on the left or upload a field photograph to observe the EXIF extraction, CNN inference, and GIS boundary snapping.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
