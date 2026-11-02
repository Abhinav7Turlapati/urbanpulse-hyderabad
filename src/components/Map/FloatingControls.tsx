import React, { useState } from 'react';
import maplibregl from 'maplibre-gl';
import { 
  Layers, 
  Flame, 
  MapPin, 
  Compass, 
  Box, 
  Search, 
  X, 
  SlidersHorizontal,
  Cloud,
  Check
} from 'lucide-react';
import { FilterState, MapStyleKey, CategoryType, AwsIntegrationConfig } from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';
import { MAP_STYLES } from '../../services/aws/mapProviderAdapter';

interface FloatingControlsProps {
  mapInstance: maplibregl.Map | null;
  filterState: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  currentStyleKey: MapStyleKey;
  onStyleChange: (styleKey: MapStyleKey) => void;
  awsConfig: AwsIntegrationConfig;
  onOpenAwsModal: () => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  mapInstance,
  filterState,
  onFilterChange,
  currentStyleKey,
  onStyleChange,
  awsConfig,
  onOpenAwsModal
}) => {
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);

  // Quick reset to Hyderabad center
  const handleResetCenter = () => {
    if (!mapInstance) return;
    mapInstance.flyTo({
      center: [78.4867, 17.3850],
      zoom: 11,
      pitch: is3DMode ? 35 : 0,
      bearing: 0,
      duration: 1200
    });
  };

  // Toggle 3D isometric pitch
  const handleToggle3D = () => {
    if (!mapInstance) return;
    const next3D = !is3DMode;
    setIs3DMode(next3D);
    mapInstance.easeTo({
      pitch: next3D ? 45 : 0,
      duration: 600
    });
  };

  // Toggle Category
  const toggleCategory = (cat: CategoryType) => {
    onFilterChange(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [cat]: !prev.categories[cat]
      }
    }));
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col gap-2.5">
      {/* Top Bar: Search, Quick Category Filters, and AWS Pill */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Search Bar */}
        <div className="pointer-events-auto flex items-center bg-cyber-surface/90 backdrop-blur-md border border-cyber-border rounded-xl px-3 py-2 shadow-xl shadow-black/40 min-w-[280px] max-w-[360px] flex-1">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search hospitals, metro, police..."
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none w-full"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, searchQuery: '' }))}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1.5 bg-cyber-surface/80 backdrop-blur-md border border-cyber-border/80 rounded-xl p-1 shadow-lg">
          {(Object.keys(CATEGORY_COLORS) as CategoryType[]).map((cat) => {
            const active = filterState.categories[cat];
            const meta = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  active 
                    ? `${meta.twBadge} shadow-sm font-semibold` 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 opacity-60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: meta.hex }}
                />
                <span className="capitalize">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Controls: AWS Badge, Layers, Styles, Tilt, Reset */}
        <div className="pointer-events-auto flex items-center gap-2 ml-auto">
          {/* AWS Service Pill */}
          <button
            onClick={onOpenAwsModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md shadow-lg transition-all ${
              awsConfig.apiKey
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25'
                : 'bg-cyber-surface/90 border-cyber-border text-slate-300 hover:text-amber-400 hover:border-amber-500/40'
            }`}
            title="Configure Amazon Location Service & AWS S3"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AWS Architecture</span>
            <span className={`w-2 h-2 rounded-full ${awsConfig.apiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </button>

          {/* Layer Toggles Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLayersDropdown(!showLayersDropdown);
                setShowStyleDropdown(false);
              }}
              className={`p-2 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
                showLayersDropdown || filterState.showHeatmap
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-cyber-surface/90 border-cyber-border text-slate-300 hover:text-white hover:bg-cyber-card'
              }`}
              title="Map Overlays & Heatmap"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showLayersDropdown && (
              <div className="absolute right-0 top-11 w-64 bg-cyber-surface/95 backdrop-blur-xl border border-cyber-border rounded-xl p-3 shadow-2xl shadow-black/70 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    Layer Visibility
                  </span>
                  <button 
                    onClick={() => setShowLayersDropdown(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Clusters Toggle */}
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    Marker Clustering
                  </span>
                  <input
                    type="checkbox"
                    checked={filterState.showClusters}
                    onChange={(e) => onFilterChange(prev => ({ ...prev, showClusters: e.target.checked }))}
                    className="rounded bg-cyber-navy border-cyber-border text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Heatmap Toggle */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-cyber-border/60">
                  <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      Density Heatmap
                    </span>
                    <input
                      type="checkbox"
                      checked={filterState.showHeatmap}
                      onChange={(e) => onFilterChange(prev => ({ ...prev, showHeatmap: e.target.checked }))}
                      className="rounded bg-cyber-navy border-cyber-border text-rose-500 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {filterState.showHeatmap && (
                    <div className="pl-5 pt-1.5 flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Heatmap Radius</span>
                        <span className="font-mono text-cyan-300">{filterState.heatmapRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="55"
                        value={filterState.heatmapRadius}
                        onChange={(e) => onFilterChange(prev => ({ ...prev, heatmapRadius: Number(e.target.value) }))}
                        className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Points Toggle */}
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer pt-1 border-t border-cyber-border/60">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Individual Markers
                  </span>
                  <input
                    type="checkbox"
                    checked={filterState.showPoints}
                    onChange={(e) => onFilterChange(prev => ({ ...prev, showPoints: e.target.checked }))}
                    className="rounded bg-cyber-navy border-cyber-border text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Map Style Selector Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStyleDropdown(!showStyleDropdown);
                setShowLayersDropdown(false);
              }}
              className={`p-2 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
                showStyleDropdown
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-cyber-surface/90 border-cyber-border text-slate-300 hover:text-white hover:bg-cyber-card'
              }`}
              title="Change Map Style"
            >
              <Compass className="w-4 h-4" />
            </button>

            {showStyleDropdown && (
              <div className="absolute right-0 top-11 w-72 bg-cyber-surface/95 backdrop-blur-xl border border-cyber-border rounded-xl p-2.5 shadow-2xl shadow-black/70 flex flex-col gap-1.5">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-cyber-border/70 pb-2">
                  Map Provider & Basemap Style
                </div>
                {MAP_STYLES.map((style) => {
                  const isSelected = currentStyleKey === style.key;
                  return (
                    <button
                      key={style.key}
                      onClick={() => {
                        onStyleChange(style.key);
                        setShowStyleDropdown(false);
                      }}
                      className={`text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                        isSelected 
                          ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40' 
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {style.name}
                          {style.requiresAws && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono">
                              AWS
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {style.description}
                        </p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3D Tilt Toggle */}
          <button
            onClick={handleToggle3D}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
              is3DMode
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-cyber-surface/90 border-cyber-border text-slate-400 hover:text-white'
            }`}
            title="Toggle 3D Perspective Tilt"
          >
            <Box className="w-4 h-4" />
          </button>

          {/* Center Hyderabad Button */}
          <button
            onClick={handleResetCenter}
            className="p-2 rounded-xl bg-cyber-surface/90 border border-cyber-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 backdrop-blur-md shadow-lg transition-all"
            title="Reset Hyderabad View"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
