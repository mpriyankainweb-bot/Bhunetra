import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  Maximize2, 
  Eye, 
  Search, 
  Sliders, 
  Info, 
  Activity, 
  Droplet, 
  Trees, 
  ShieldAlert 
} from 'lucide-react';
import { WatershedSite, FilterState } from '../types';

interface DashboardViewProps {
  sites: WatershedSite[];
  selectedSite: WatershedSite | null;
  onSelectSite: (site: WatershedSite) => void;
  onOpenScoreEngine: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sites,
  selectedSite,
  onSelectSite,
  onOpenScoreEngine
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    state: 'Maharashtra',
    district: 'Chhatrapati Sambhaji Nagar',
    watershed: 'all',
    structureType: 'all',
    scoreRange: [0, 100],
    flaggedOnly: false,
    searchQuery: ''
  });

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    satelliteBasemap: true,
    ndviOverlay: false,
    ndwiMask: false,
    drainageLines: true,
    watershedPolygons: true,
    structureMarkers: true
  });

  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  // Filtered Sites computation
  const filteredSites = sites.filter(site => {
    if (filters.watershed !== 'all' && site.watershedId !== filters.watershed) return false;
    if (filters.structureType !== 'all' && site.structureType !== filters.structureType) return false;
    if (site.healthScore < filters.scoreRange[0] || site.healthScore > filters.scoreRange[1]) return false;
    if (filters.flaggedOnly && !site.isFlagged) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        site.name.toLowerCase().includes(q) ||
        site.village.toLowerCase().includes(q) ||
        site.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Calculations
  const totalSitesCount = sites.length;
  const avgHealthScore = sites.length ? Math.round(sites.reduce((acc, s) => acc + s.healthScore, 0) / sites.length) : 0;
  const flaggedMismatchesCount = sites.filter(s => s.isFlagged).length;
  const classifiedPhotosCount = 142; // cumulative across time-series

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center around CSN District, Maharashtra
    const map = L.map(mapContainerRef.current, {
      center: [19.88, 75.15],
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    // Add Esri Satellite Basemap
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    polygonsLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Watershed Boundary Polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsLayerRef.current) return;
    polygonsLayerRef.current.clearLayers();

    if (!layers.watershedPolygons) return;

    // 4 Micro-Watershed Polygons
    const watershedBoundaries = [
      {
        name: 'Paithan West (43A)',
        color: '#0EA5E9',
        coords: [
          [19.46, 75.26], [19.64, 75.26], [19.64, 75.44], [19.46, 75.44]
        ] as L.LatLngExpression[]
      },
      {
        name: 'Gangapur Godavari (12B)',
        color: '#10B981',
        coords: [
          [19.70, 74.96], [19.89, 74.96], [19.89, 75.16], [19.70, 75.16]
        ] as L.LatLngExpression[]
      },
      {
        name: 'Kannad Ridge (08C)',
        color: '#A855F7',
        coords: [
          [20.18, 75.08], [20.35, 75.08], [20.35, 75.26], [20.18, 75.26]
        ] as L.LatLngExpression[]
      },
      {
        name: 'Vaijapur Dryland (21D)',
        color: '#F59E0B',
        coords: [
          [19.84, 74.75], [19.99, 74.75], [19.99, 74.96], [19.84, 74.96]
        ] as L.LatLngExpression[]
      }
    ];

    watershedBoundaries.forEach(wb => {
      const polygon = L.polygon(wb.coords, {
        color: wb.color,
        weight: 1.5,
        fillColor: wb.color,
        fillOpacity: 0.08,
        dashArray: '4, 4'
      });
      polygon.bindTooltip(wb.name, { permanent: false, direction: 'center', className: 'bg-slate-900 text-xs text-white px-2 py-1 rounded border border-slate-700' });
      polygonsLayerRef.current?.addLayer(polygon);
    });
  }, [layers.watershedPolygons]);

  // Update Markers when filteredSites or layers change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    if (!layers.structureMarkers) return;

    filteredSites.forEach(site => {
      // Score badge color
      let markerColor = '#10B981'; // Green
      if (site.healthScore < 40) markerColor = '#EF4444'; // Red
      else if (site.healthScore < 70) markerColor = '#F59E0B'; // Amber

      const isMismatch = site.isFlagged;
      const pulsingClass = isMismatch ? 'animate-ping' : '';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isMismatch ? `<div class="absolute w-8 h-8 rounded-full bg-rose-500 opacity-60 ${pulsingClass}"></div>` : ''}
            <div class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg transition-transform group-hover:scale-125" style="background-color: ${markerColor}">
              ${site.healthScore}
            </div>
            ${isMismatch ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></div>` : ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectSite(site);
      });

      // Marker Tooltip
      marker.bindTooltip(`
        <div class="p-1 font-sans text-xs">
          <strong class="text-white block">${site.name}</strong>
          <span class="text-slate-300 font-mono">${site.structureType.replace('_', ' ')} · Score: ${site.healthScore}</span>
          ${site.isFlagged ? `<span class="text-rose-400 block font-semibold">⚠️ Flagged: ${site.mismatchSeverity?.toUpperCase()}</span>` : ''}
        </div>
      `, {
        direction: 'top',
        className: 'bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-1.5 shadow-xl'
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredSites, layers.structureMarkers, onSelectSite]);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col bg-[#070E18] text-slate-100 overflow-hidden">
      
      {/* 1. TOP TELEMETRY KPI RIBBON */}
      <div className="z-20 w-full px-4 sm:px-6 py-2.5 bg-[#0B1522]/95 border-b border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* State > District > Watershed Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="text-teal-400 font-semibold">Maharashtra</span>
          <span className="text-slate-600">/</span>
          <span>Chhatrapati Sambhaji Nagar</span>
          <span className="text-slate-600">/</span>
          <select
            value={filters.watershed}
            onChange={(e) => setFilters(prev => ({ ...prev, watershed: e.target.value }))}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-teal-300 font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="all">All 4 Watersheds</option>
            <option value="W-MH-CSN-01">Paithan West (43A)</option>
            <option value="W-MH-CSN-02">Gangapur Godavari (12B)</option>
            <option value="W-MH-CSN-03">Kannad Escarpment (08C)</option>
            <option value="W-MH-CSN-04">Vaijapur Corridor (21D)</option>
          </select>
        </div>

        {/* 4 Animated KPI Cards */}
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Total Sites:</span>
            <span className="font-bold text-white text-sm tabular-nums">{totalSitesCount}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Avg Health:</span>
            <span className={`font-bold text-sm tabular-nums ${avgHealthScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {avgHealthScore}/100
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Flagged Mismatches:</span>
            <span className="font-bold text-rose-400 text-sm tabular-nums flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {flaggedMismatchesCount}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-400">CNN Classified:</span>
            <span className="font-bold text-teal-300 text-sm tabular-nums">{classifiedPhotosCount}</span>
          </div>
        </div>

        {/* Quick View Mode Toggle (Map vs List) */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-md">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeTab === 'map' ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            GIS Map
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeTab === 'list' ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Site List ({filteredSites.length})
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: MAP VIEWPORT OR LIST VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Leaflet Map Stage */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full ${activeTab === 'map' ? 'block' : 'hidden'}`}
          style={{ background: '#070D16' }}
        />

        {/* LIST VIEW (Alternative inspection mode) */}
        {activeTab === 'list' && (
          <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-[#070E18]">
            <div className="max-w-6xl mx-auto rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Site Name</th>
                    <th className="py-3 px-4">Watershed</th>
                    <th className="py-3 px-4">Structure</th>
                    <th className="py-3 px-4">Health Score</th>
                    <th className="py-3 px-4">Audit Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredSites.map(site => (
                    <tr 
                      key={site.id} 
                      onClick={() => onSelectSite(site)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-teal-300 font-medium">{site.code}</td>
                      <td className="py-3 px-4 font-semibold text-white">{site.name}</td>
                      <td className="py-3 px-4 text-slate-400">{site.watershedName.split(' ')[0]}</td>
                      <td className="py-3 px-4 text-slate-300">{site.structureType.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          site.healthScore >= 70 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          site.healthScore >= 40 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {site.healthScore} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {site.isFlagged ? (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {site.mismatchSeverity?.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verified Concordant
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. FLOATING OVERLAYS (Only on Map Tab) */}
        {activeTab === 'map' && (
          <>
            {/* Top Left: Filter Panel Collapsible */}
            <div className="absolute top-4 left-4 z-10 w-72 sm:w-80 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-2xl p-4 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-teal-400" />
                  GIS Layer & Attribute Filters
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredSites.length} of {sites.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search village, code, structure..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-8 pr-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Structure Type Filter */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Structure Type</label>
                <select
                  value={filters.structureType}
                  onChange={(e) => setFilters(prev => ({ ...prev, structureType: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-2 text-xs text-slate-200 focus:outline-hidden"
                >
                  <option value="all">All Structures</option>
                  <option value="check_dam">Check Dam (Masonry / CNB)</option>
                  <option value="farm_pond">Farm Pond (Khet Taladi)</option>
                  <option value="plantation">Afforestation / Plantation</option>
                  <option value="contour_trench">Contour Trenches (CCT)</option>
                  <option value="water_body">Percolation Tank / Water Body</option>
                </select>
              </div>

              {/* Flagged Mismatches Quick Toggle */}
              <div className="pt-1">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, flaggedOnly: !prev.flaggedOnly }))}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    filters.flaggedOnly
                      ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Show Flagged Mismatches Only
                  </span>
                  <span className="font-mono bg-rose-900/60 px-1.5 py-0.5 rounded text-[10px]">
                    {flaggedMismatchesCount}
                  </span>
                </button>
              </div>

              {/* Score Range Slider */}
              <div className="pt-2">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Score Threshold</span>
                  <span className="font-mono text-teal-300 font-bold">&ge; {filters.scoreRange[0]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.scoreRange[0]}
                  onChange={(e) => setFilters(prev => ({ ...prev, scoreRange: [Number(e.target.value), 100] }))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-teal-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Top Right: Layer Visibility Control Panel */}
            <div className="absolute top-4 right-4 z-10 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-2xl p-3.5 backdrop-blur-md space-y-2 text-xs w-56">
              <span className="font-semibold text-xs text-white block pb-1 border-b border-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                GIS Thematic Layers
              </span>

              <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <span>Satellite Basemap</span>
                <input
                  type="checkbox"
                  checked={layers.satelliteBasemap}
                  onChange={(e) => setLayers(prev => ({ ...prev, satelliteBasemap: e.target.checked }))}
                  className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <span>Watershed Polygons</span>
                <input
                  type="checkbox"
                  checked={layers.watershedPolygons}
                  onChange={(e) => setLayers(prev => ({ ...prev, watershedPolygons: e.target.checked }))}
                  className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <span>Structure Markers</span>
                <input
                  type="checkbox"
                  checked={layers.structureMarkers}
                  onChange={(e) => setLayers(prev => ({ ...prev, structureMarkers: e.target.checked }))}
                  className="rounded text-teal-500 focus:ring-0 accent-teal-500"
                />
              </label>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={onOpenScoreEngine}
                  className="w-full py-1.5 text-center text-[11px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded hover:bg-amber-900/50 transition-colors cursor-pointer"
                >
                  Tune Scoring Weights
                </button>
              </div>
            </div>

            {/* Bottom Left: Score Color Legend */}
            <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 backdrop-blur-md text-[11px] font-mono flex items-center gap-4 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>&ge; 70 Healthy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>40 - 69 Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>&lt; 40 Deficit</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse border border-white" />
                <span>Mismatch Flag</span>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
};
