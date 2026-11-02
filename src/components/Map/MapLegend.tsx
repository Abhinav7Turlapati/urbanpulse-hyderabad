import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { CategoryType, FilterState } from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';

interface MapLegendProps {
  filterState: FilterState;
  categoryCounts: Record<string, number>;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  filterState,
  categoryCounts
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 left-4 z-10 pointer-events-auto">
      <div className="bg-cyber-surface/90 backdrop-blur-md border border-cyber-border rounded-xl shadow-2xl p-2.5 max-w-[260px] text-xs">
        <div 
          className="flex items-center justify-between cursor-pointer select-none font-semibold text-slate-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            Map Legend
          </span>
          <button className="text-slate-400 hover:text-white">
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="mt-2.5 flex flex-col gap-2 pt-2 border-t border-cyber-border/70">
            {/* Categories */}
            <div className="flex flex-col gap-1.5">
              {(Object.keys(CATEGORY_COLORS) as CategoryType[]).map((cat) => {
                const meta = CATEGORY_COLORS[cat];
                const count = categoryCounts[cat] || 0;
                return (
                  <div key={cat} className="flex items-center justify-between text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: meta.hex }}
                      />
                      <span>{meta.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Heatmap Legend */}
            {filterState.showHeatmap && (
              <div className="pt-2 border-t border-cyber-border/60">
                <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                  <span>Heatmap Density</span>
                  <span className="text-rose-400 font-mono">Kernel Density</span>
                </div>
                <div className="h-2 rounded-full w-full bg-gradient-to-r from-cyan-500 via-emerald-400 via-amber-400 to-rose-500 opacity-90" />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            )}

            {/* Clusters Legend */}
            {filterState.showClusters && (
              <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Cluster Sizes:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block text-[8px] text-black text-center font-bold">1</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-400 inline-block text-[8px] text-black text-center font-bold">15</span>
                  <span className="w-5 h-5 rounded-full bg-rose-500 inline-block text-[8px] text-white text-center font-bold">80</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
