import React, { useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  Filter, 
  X
} from 'lucide-react';
import { InfrastructureFeature, FilterState } from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';

interface ExploreTabProps {
  features: InfrastructureFeature[];
  filterState: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onSelectFeature: (feature: InfrastructureFeature) => void;
  onFlyTo: (coords: [number, number]) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  features,
  filterState,
  onFilterChange,
  onSelectFeature,
  onFlyTo
}) => {
  // Extract unique districts and subcategories
  const { districts, subcategories } = useMemo(() => {
    const distSet = new Set<string>();
    const subcatSet = new Set<string>();
    features.forEach(f => {
      if (f.properties.district) distSet.add(f.properties.district);
      if (f.properties.subcategory) subcatSet.add(f.properties.subcategory);
    });
    return {
      districts: Array.from(distSet).sort(),
      subcategories: Array.from(subcatSet).sort()
    };
  }, [features]);

  // Filter features
  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      const p = f.properties;
      // Category check
      if (!filterState.categories[p.category]) return false;
      // Subcategory check
      if (filterState.subcategories.length > 0 && !filterState.subcategories.includes(p.subcategory)) {
        return false;
      }
      // District check
      if (filterState.district !== 'all' && p.district?.toLowerCase() !== filterState.district.toLowerCase()) {
        return false;
      }
      // Search query
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase();
        return Boolean(
          p.name?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [features, filterState]);

  const toggleSubcategory = (subcat: string) => {
    onFilterChange(prev => {
      const exists = prev.subcategories.includes(subcat);
      return {
        ...prev,
        subcategories: exists
          ? prev.subcategories.filter(s => s !== subcat)
          : [...prev.subcategories, subcat]
      };
    });
  };

  const clearSubcategoryFilters = () => {
    onFilterChange(prev => ({ ...prev, subcategories: [], district: 'all' }));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={filterState.searchQuery}
          onChange={(e) => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
          placeholder="Filter by facility name or area..."
          className="w-full bg-cyber-surface border border-cyber-border rounded-xl pl-9 pr-8 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-xs"
        />
        {filterState.searchQuery && (
          <button
            onClick={() => onFilterChange(prev => ({ ...prev, searchQuery: '' }))}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* District Selector & Active Filters */}
      <div className="flex items-center gap-2">
        <select
          value={filterState.district}
          onChange={(e) => onFilterChange(prev => ({ ...prev, district: e.target.value }))}
          className="bg-cyber-surface border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 flex-1"
        >
          <option value="all">All Districts / Zones</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {(filterState.subcategories.length > 0 || filterState.district !== 'all') && (
          <button
            onClick={clearSubcategoryFilters}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg whitespace-nowrap"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Popular Subcategory Filter Pills */}
      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
        {subcategories.slice(0, 10).map(sc => {
          const isSelected = filterState.subcategories.includes(sc);
          return (
            <button
              key={sc}
              onClick={() => toggleSubcategory(sc)}
              className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${
                isSelected 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold' 
                  : 'bg-cyber-surface/60 text-slate-400 border-cyber-border hover:border-slate-600'
              }`}
            >
              {sc}
            </button>
          );
        })}
      </div>

      {/* Result Count Header */}
      <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
        <span>Showing <strong className="text-white">{filteredFeatures.length}</strong> matching facilities</span>
        <span className="font-mono text-[10px]">Hyderabad OpenGIS</span>
      </div>

      {/* Scrollable Facility Directory List */}
      <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
        {filteredFeatures.length === 0 ? (
          <div className="p-8 text-center bg-cyber-surface/40 border border-cyber-border rounded-xl">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-medium">No locations match your filter criteria.</p>
            <p className="text-[11px] text-slate-400 mt-1">Try resetting the search or category filters.</p>
          </div>
        ) : (
          filteredFeatures.map(f => {
            const p = f.properties;
            const [lng, lat] = f.geometry.coordinates;
            const catMeta = CATEGORY_COLORS[p.category];

            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectFeature(f);
                  onFlyTo([lng, lat]);
                }}
                className="group p-3 rounded-xl bg-cyber-surface/80 border border-cyber-border hover:border-cyan-500/40 hover:bg-cyber-card cursor-pointer transition-all flex items-start justify-between gap-2.5 shadow-sm"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 shadow-sm"
                    style={{ backgroundColor: catMeta?.hex || '#06B6D4' }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {p.address}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border ${catMeta?.twBadge || 'bg-slate-800 text-slate-300'}`}>
                        {p.subcategory}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.district}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1 text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[9px] font-mono text-slate-400">
                    {lat.toFixed(2)}, {lng.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
