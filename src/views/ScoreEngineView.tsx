import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Info, 
  Mountain, 
  SunMedium, 
  Waves, 
  ArrowRight 
} from 'lucide-react';
import { ScoreWeights, TerrainPreset } from '../types';
import { TERRAIN_PRESETS } from '../data/seedData';

interface ScoreEngineViewProps {
  currentWeights: ScoreWeights;
  currentPreset: TerrainPreset;
  onRecompute: (weights: ScoreWeights, preset: TerrainPreset) => Promise<void>;
  onNavigateToDashboard: () => void;
}

export const ScoreEngineView: React.FC<ScoreEngineViewProps> = ({
  currentWeights,
  currentPreset,
  onRecompute,
  onNavigateToDashboard
}) => {
  const [weights, setWeights] = useState<ScoreWeights>(currentWeights);
  const [selectedPreset, setSelectedPreset] = useState<TerrainPreset>(currentPreset);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [lastRecomputeTime, setLastRecomputeTime] = useState<string | null>(null);

  const totalWeight = parseFloat(
    (weights.w1_ndvi + weights.w2_ndwi + weights.w3_structure + weights.w4_consistency).toFixed(2)
  );

  const handleSelectPreset = (preset: TerrainPreset) => {
    setSelectedPreset(preset);
    setWeights({ ...TERRAIN_PRESETS[preset].weights });
  };

  const handleSliderChange = (key: keyof ScoreWeights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseFloat(value.toFixed(2))
    }));
  };

  const handleTriggerRecompute = async () => {
    setIsRecomputing(true);
    try {
      await onRecompute(weights, selectedPreset);
      setLastRecomputeTime(new Date().toLocaleTimeString());
    } finally {
      setIsRecomputing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 p-4 sm:p-8 space-y-8">
      
      {/* 1. Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Explainable Scoring Engine · Formula Calibration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Watershed Health Score Engine
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Tune multi-criteria evaluation weights or switch terrain presets to recompute the composite 0–100 Watershed Health Score across all 25 district sites.
          </p>
        </div>

        {lastRecomputeTime && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>Recomputed at {lastRecomputeTime}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Preset Selector & Formula Specs */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Terrain Presets Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 block pb-1 border-b border-slate-800">
              Select Terrain Preset
            </span>

            {/* Preset 1: Semi-Arid */}
            <button
              onClick={() => handleSelectPreset('semi_arid')}
              className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedPreset === 'semi_arid'
                  ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs text-amber-300">
                <SunMedium className="w-4 h-4" />
                <span>Semi-Arid Basin</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Prioritizes surface water retention (NDWI 35%) and percolation structures.
              </p>
            </button>

            {/* Preset 2: Hilly */}
            <button
              onClick={() => handleSelectPreset('hilly')}
              className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedPreset === 'hilly'
                  ? 'bg-purple-950/40 border-purple-500/80 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs text-purple-300">
                <Mountain className="w-4 h-4" />
                <span>Hilly Escarpment / Ridge</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Emphasizes slope vegetation gain (NDVI 40%) and continuous contour trenches.
              </p>
            </button>

            {/* Preset 3: Coastal */}
            <button
              onClick={() => handleSelectPreset('coastal')}
              className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedPreset === 'coastal'
                  ? 'bg-teal-950/40 border-teal-500/80 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs text-teal-300">
                <Waves className="w-4 h-4" />
                <span>Coastal & Delta Alluvial</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Focuses on surface drainage indices (NDWI 40%) and soil moisture balance.
              </p>
            </button>
          </div>

          {/* Formula Specification Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 text-xs">
            <span className="font-mono uppercase text-slate-400 block pb-1 border-b border-slate-800 text-[11px]">
              Mathematical Model
            </span>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-teal-300 leading-relaxed">
              Score = w₁·NDVI + w₂·NDWI + w₃·Structure + w₄·Consistency
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every site score maps transparently to these 4 normalized components (0–100), ensuring auditability for MoRD and district administrations without black-box opacity.
            </p>
          </div>

        </div>

        {/* Right Column: Live Weight Sliders & Live Action */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Criterion Weights Configuration</h2>
              <p className="text-xs text-slate-400 mt-0.5">Drag sliders to adjust relative factor weighting</p>
            </div>

            {/* Sum indicator */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Sum of Weights:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                totalWeight === 1.0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {totalWeight.toFixed(2)} / 1.00
              </span>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="space-y-6">
            
            {/* Slider 1: w1 NDVI Gain */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-emerald-400">w₁: Vegetation Gain (NDVI Delta)</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">Measures biomass increase post-plantation/bunding</span>
                </div>
                <span className="font-mono text-base font-bold text-emerald-300">{weights.w1_ndvi.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={weights.w1_ndvi}
                onChange={(e) => handleSliderChange('w1_ndvi', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Slider 2: w2 NDWI Presence */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-sky-400">w₂: Surface Water Retention (NDWI)</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">Detects standing water reservoirs and stream retention</span>
                </div>
                <span className="font-mono text-base font-bold text-sky-300">{weights.w2_ndwi.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={weights.w2_ndwi}
                onChange={(e) => handleSliderChange('w2_ndwi', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Slider 3: w3 Structure Evidence */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-purple-400">w₃: Structural Presence (CNN Confidence)</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">EfficientNet-B0 visual identification confidence</span>
                </div>
                <span className="font-mono text-base font-bold text-purple-300">{weights.w3_structure.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={weights.w3_structure}
                onChange={(e) => handleSliderChange('w3_structure', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Slider 4: w4 Consistency Factor */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-amber-400">w₄: Multi-Year Temporal Consistency</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">Penalizes erratic seasonal spikes and flash anomalies</span>
                </div>
                <span className="font-mono text-base font-bold text-amber-300">{weights.w4_consistency.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.w4_consistency}
                onChange={(e) => handleSliderChange('w4_consistency', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => handleSelectPreset(selectedPreset)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to {TERRAIN_PRESETS[selectedPreset].name} Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTriggerRecompute}
                disabled={isRecomputing}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>{isRecomputing ? 'Recomputing 25 Sites...' : 'Recompute All Scores (Live API)'}</span>
              </button>

              <button
                onClick={onNavigateToDashboard}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
