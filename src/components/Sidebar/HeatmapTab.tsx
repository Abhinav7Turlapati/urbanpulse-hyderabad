import React from 'react';
import { Flame, Sliders, Info, MapPin, Activity, Train, ShieldAlert } from 'lucide-react';
import { FilterState, CategoryType } from '../../types';

interface HeatmapTabProps {
  filterState: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  categoryCounts: Record<string, number>;
}

export const HeatmapTab: React.FC<HeatmapTabProps> = ({
  filterState,
  onFilterChange,
  categoryCounts
}) => {
  const isolateCategory = (cat: CategoryType) => {
    onFilterChange(prev => ({
      ...prev,
      showHeatmap: true,
      categories: {
        healthcare: cat === 'healthcare',
        transit: cat === 'transit',
        emergency: cat === 'emergency',
        environment: cat === 'environment',
        civic: cat === 'civic'
      }
    }));
  };

  const showAllForHeatmap = () => {
    onFilterChange(prev => ({
      ...prev,
      showHeatmap: true,
      categories: {
        healthcare: true,
        transit: true,
        emergency: true,
        environment: true,
        civic: true
      }
    }));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Heatmap Master Toggle */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-cyber-surface to-cyber-navy border border-rose-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Density Heatmap Layer</div>
            <div className="text-[11px] text-slate-400">Kernel Density Estimation (KDE)</div>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filterState.showHeatmap}
            onChange={(e) => onFilterChange(prev => ({ ...prev, showHeatmap: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
        </label>
      </div>

      {/* Heatmap Tuning Controls */}
      {filterState.showHeatmap && (
        <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              Heatmap Calibration
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time WebGL</span>
          </div>

          {/* Radius Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Smoothing Radius</span>
              <span className="font-mono text-cyan-400">{filterState.heatmapRadius} px</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              value={filterState.heatmapRadius}
              onChange={(e) => onFilterChange(prev => ({ ...prev, heatmapRadius: Number(e.target.value) }))}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Precise (15px)</span>
              <span>Smooth Aggregated (60px)</span>
            </div>
          </div>

          {/* Heatmap Spectrum Preview */}
          <div className="space-y-1 pt-2 border-t border-cyber-border/60">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Spectral Density Gradient</span>
              <span className="text-white font-mono">0.0 → 1.0</span>
            </div>
            <div className="h-3 rounded-lg w-full bg-gradient-to-r from-cyan-500 via-emerald-400 via-amber-400 to-rose-500 shadow-sm" />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Sparse Node</span>
              <span>Moderate Cluster</span>
              <span>Hyper-Dense Hub</span>
            </div>
          </div>
        </div>
      )}

      {/* Isolate by Infrastructure Sector */}
      <div className="bg-cyber-surface/80 border border-cyber-border rounded-xl p-4 space-y-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300">
          Focus Heatmap on Sector
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => isolateCategory('healthcare')}
            className="p-2 rounded-lg bg-cyber-navy border border-emerald-500/30 hover:border-emerald-500 text-left transition-colors flex items-center gap-2"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="font-medium text-slate-200 text-xs">Healthcare</div>
              <div className="text-[10px] text-slate-400">{categoryCounts.healthcare || 0} facilities</div>
            </div>
          </button>

          <button
            onClick={() => isolateCategory('transit')}
            className="p-2 rounded-lg bg-cyber-navy border border-cyan-500/30 hover:border-cyan-500 text-left transition-colors flex items-center gap-2"
          >
            <Train className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="font-medium text-slate-200 text-xs">Transit</div>
              <div className="text-[10px] text-slate-400">{categoryCounts.transit || 0} nodes</div>
            </div>
          </button>

          <button
            onClick={() => isolateCategory('emergency')}
            className="p-2 rounded-lg bg-cyber-navy border border-rose-500/30 hover:border-rose-500 text-left transition-colors flex items-center gap-2"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <div className="font-medium text-slate-200 text-xs">Emergency</div>
              <div className="text-[10px] text-slate-400">{categoryCounts.emergency || 0} stations</div>
            </div>
          </button>

          <button
            onClick={showAllForHeatmap}
            className="p-2 rounded-lg bg-cyber-navy border border-purple-500/30 hover:border-purple-500 text-left transition-colors flex items-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <div className="font-medium text-slate-200 text-xs">Combined</div>
              <div className="text-[10px] text-slate-400">All 578 records</div>
            </div>
          </button>
        </div>
      </div>

      {/* Spatial Intelligence Insights */}
      <div className="bg-cyber-surface/60 border border-cyber-border rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
          <Info className="w-4 h-4 text-cyan-400" />
          Spatial Intelligence Findings
        </div>

        <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed list-disc list-inside">
          <li>
            <strong className="text-white">Healthcare Hotspots:</strong> Heavy concentration in central Hyderabad (Osmania, Gandhi, Nampally) and Punjagutta/Banjara corridor, with primary health clinics (UPHCs) dispersing into LB Nagar, Kukatpally, and Malkajgiri.
          </li>
          <li>
            <strong className="text-white">Transit Multimodality:</strong> Ameerpet, Secunderabad, and MGBS display optimal multi-modal transfer indices linking Metro, MMTS, and state bus terminals.
          </li>
          <li>
            <strong className="text-white">Emergency Response Reach:</strong> Police stations exhibit uniform spatial distribution across GHMC jurisdiction, with highest density around Old City and administrative sectors.
          </li>
        </ul>
      </div>
    </div>
  );
};

