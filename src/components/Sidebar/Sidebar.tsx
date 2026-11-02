import React, { useState } from 'react';
import { 
  BarChart3, 
  Compass, 
  Flame, 
  Database, 
  Cloud, 
  ChevronLeft, 
  ChevronRight, 
  Activity,
  Layers
} from 'lucide-react';
import { 
  InfrastructureFeature, 
  FilterState, 
  ViewportStats, 
  AwsIntegrationConfig, 
  MapStyleKey,
  CategoryType
} from '../../types';
import { DataLoadResult } from '../../services/aws/s3DataLoader';
import { AnalyticsTab } from './AnalyticsTab';
import { ExploreTab } from './ExploreTab';
import { HeatmapTab } from './HeatmapTab';
import { TransparencyTab } from './TransparencyTab';
import { AwsIntegrationTab } from './AwsIntegrationTab';

interface SidebarProps {
  features: InfrastructureFeature[];
  filterState: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  viewportStats: ViewportStats;
  totalRecords: number;
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
  selectedFeature: InfrastructureFeature | null;
  onSelectFeature: (feature: InfrastructureFeature) => void;
  onFlyTo: (coords: [number, number]) => void;
  awsConfig: AwsIntegrationConfig;
  dataLoadResult: DataLoadResult | null;
  currentStyleKey: MapStyleKey;
  onOpenAwsModal: () => void;
}

type TabKey = 'analytics' | 'explore' | 'heatmap' | 'transparency' | 'aws';

export const Sidebar: React.FC<SidebarProps> = ({
  features,
  filterState,
  onFilterChange,
  viewportStats,
  totalRecords,
  categoryCounts,
  subcategoryCounts,
  onSelectFeature,
  onFlyTo,
  awsConfig,
  dataLoadResult,
  currentStyleKey,
  onOpenAwsModal
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('analytics');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'explore', label: 'Directory', icon: <Compass className="w-4 h-4" />, badge: `${features.length}` },
    { key: 'heatmap', label: 'Heatmap', icon: <Flame className="w-4 h-4" /> },
    { key: 'transparency', label: 'Data Sources', icon: <Database className="w-4 h-4" /> },
    { key: 'aws', label: 'AWS Cloud', icon: <Cloud className="w-4 h-4 text-amber-400" /> }
  ];

  return (
    <div
      className={`relative z-30 h-full flex flex-col bg-cyber-navy/95 backdrop-blur-2xl border-r border-cyber-border shadow-2xl transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-full sm:w-[420px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-cyber-border flex items-center justify-between shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 shrink-0">
              <Activity className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-cyber-navy animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight truncate">
                  UrbanPulse
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                  HYDERABAD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Smart City Geospatial Intelligence
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-cyber-border/80 px-2 py-1.5 bg-cyber-surface/60 shrink-0 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (isCollapsed) setIsCollapsed(false);
              }}
              title={tab.label}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-cyber-card text-white border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              } ${isCollapsed ? 'w-full justify-center px-0' : ''}`}
            >
              {tab.icon}
              {!isCollapsed && <span>{tab.label}</span>}
              {!isCollapsed && tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      {!isCollapsed ? (
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'analytics' && (
            <AnalyticsTab
              viewportStats={viewportStats}
              totalRecords={totalRecords}
              categoryCounts={categoryCounts}
              subcategoryCounts={subcategoryCounts}
              onSelectCategory={(cat: CategoryType) => {
                onFilterChange(prev => ({
                  ...prev,
                  categories: {
                    healthcare: cat === 'healthcare',
                    transit: cat === 'transit',
                    emergency: cat === 'emergency',
                    environment: cat === 'environment',
                    civic: cat === 'civic'
                  }
                }));
                setActiveTab('explore');
              }}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreTab
              features={features}
              filterState={filterState}
              onFilterChange={onFilterChange}
              onSelectFeature={onSelectFeature}
              onFlyTo={onFlyTo}
            />
          )}

          {activeTab === 'heatmap' && (
            <HeatmapTab
              filterState={filterState}
              onFilterChange={onFilterChange}
              categoryCounts={categoryCounts}
            />
          )}

          {activeTab === 'transparency' && <TransparencyTab />}

          {activeTab === 'aws' && (
            <AwsIntegrationTab
              awsConfig={awsConfig}
              dataLoadResult={dataLoadResult}
              currentStyleKey={currentStyleKey}
              onOpenAwsModal={onOpenAwsModal}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-2 text-slate-500 text-xs gap-3">
          <Layers className="w-5 h-5 text-slate-600" />
          <span className="[writing-mode:vertical-rl] tracking-widest text-[10px] uppercase font-mono">
            UrbanPulse
          </span>
        </div>
      )}

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-cyber-border bg-cyber-surface/70 shrink-0 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">578 Records Loaded</span>
          </div>
          <button
            onClick={onOpenAwsModal}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 text-[10px]"
          >
            AWS Integration Ready
          </button>
        </div>
      )}
    </div>
  );
};

