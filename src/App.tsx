import React, { useState, useEffect, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { 
  InfrastructureGeoJSON, 
  InfrastructureFeature, 
  FilterState, 
  ViewportStats, 
  MapStyleKey,
  AwsIntegrationConfig
} from './types';
import localData from './data/hyderabad_infrastructure.geojson';
import metadataJson from './data/metadata.json';
import { getSavedAwsConfig, saveAwsConfig } from './services/aws/awsConfig';
import { MapProviderAdapter } from './services/aws/mapProviderAdapter';
import { S3DataLoader, DataLoadResult } from './services/aws/s3DataLoader';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { FloatingControls } from './components/Map/FloatingControls';
import { MapLegend } from './components/Map/MapLegend';
import { Sidebar } from './components/Sidebar/Sidebar';
import { FacilityDetailModal } from './components/Modals/FacilityDetailModal';
import { AwsConfigModal } from './components/Modals/AwsConfigModal';

export const App: React.FC = () => {
  // AWS Configuration
  const [awsConfig, setAwsConfig] = useState<AwsIntegrationConfig>(getSavedAwsConfig);
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);

  // Adapters
  const mapAdapter = useMemo(() => new MapProviderAdapter(awsConfig), [awsConfig]);
  const s3Loader = useMemo(() => new S3DataLoader(awsConfig), [awsConfig]);

  // Map Style state
  const [currentStyleKey, setCurrentStyleKey] = useState<MapStyleKey>('carto-dark');
  const [styleUrl, setStyleUrl] = useState<string | object>(() => mapAdapter.getStyleUrl());

  // GeoJSON Data
  const [infraData, setInfraData] = useState<InfrastructureGeoJSON>(localData as unknown as InfrastructureGeoJSON);
  const [dataLoadResult, setDataLoadResult] = useState<DataLoadResult | null>(null);

  // Filter & Layer state
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    categories: {
      healthcare: true,
      transit: true,
      emergency: true,
      environment: true,
      civic: true
    },
    subcategories: [],
    district: 'all',
    showClusters: true,
    showHeatmap: false,
    showPoints: true,
    heatmapRadius: 30,
    heatmapIntensity: 1.0
  });

  // Selected feature
  const [selectedFeature, setSelectedFeature] = useState<InfrastructureFeature | null>(null);

  // Map Instance
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  // Viewport Stats
  const [viewportStats, setViewportStats] = useState<ViewportStats>({
    visibleCount: (localData as any).features?.length || 578,
    totalCount: (localData as any).features?.length || 578,
    categoryBreakdown: {
      healthcare: (metadataJson as any).category_counts?.healthcare || 303,
      transit: (metadataJson as any).category_counts?.transit || 116,
      emergency: (metadataJson as any).category_counts?.emergency || 86,
      environment: (metadataJson as any).category_counts?.environment || 63,
      civic: (metadataJson as any).category_counts?.civic || 10
    }
  });

  // Load Data (via S3 or local fallback)
  const loadData = useCallback(async () => {
    try {
      const result = await s3Loader.loadInfrastructureData();
      setDataLoadResult(result);
      if (result.data && result.data.features) {
        setInfraData(result.data);
      }
    } catch (e) {
      console.error('Failed to load infrastructure data', e);
    }
  }, [s3Loader]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Style Change
  const handleStyleChange = (key: MapStyleKey) => {
    setCurrentStyleKey(key);
    mapAdapter.setStyle(key);
    setStyleUrl(mapAdapter.getStyleUrl());
  };

  // Fly to coordinate helper
  const handleFlyTo = (coords: [number, number]) => {
    if (!mapInstance) return;
    mapInstance.flyTo({
      center: coords,
      zoom: 15,
      pitch: 40,
      duration: 1000
    });
  };

  // Update AWS configuration
  const handleSaveAwsConfig = (updated: AwsIntegrationConfig) => {
    setAwsConfig(updated);
    saveAwsConfig(updated);
    mapAdapter.updateAwsConfig(updated);
    s3Loader.updateConfig(updated);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-navy text-slate-100 font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        features={infraData.features || []}
        filterState={filterState}
        onFilterChange={setFilterState}
        viewportStats={viewportStats}
        totalRecords={infraData.features?.length || 578}
        categoryCounts={(metadataJson as any).category_counts || {}}
        subcategoryCounts={(metadataJson as any).subcategory_counts || {}}
        selectedFeature={selectedFeature}
        onSelectFeature={setSelectedFeature}
        onFlyTo={handleFlyTo}
        awsConfig={awsConfig}
        dataLoadResult={dataLoadResult}
        currentStyleKey={currentStyleKey}
        onOpenAwsModal={() => setIsAwsModalOpen(true)}
      />

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 h-full w-full overflow-hidden">
        {/* Floating Controls Overlay (Top) */}
        <FloatingControls
          mapInstance={mapInstance}
          filterState={filterState}
          onFilterChange={setFilterState}
          currentStyleKey={currentStyleKey}
          onStyleChange={handleStyleChange}
          awsConfig={awsConfig}
          onOpenAwsModal={() => setIsAwsModalOpen(true)}
        />

        {/* MapLibre GL Interactive Map */}
        <InteractiveMap
          data={infraData}
          filterState={filterState}
          styleKey={currentStyleKey}
          styleUrl={styleUrl}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
          onViewportChange={setViewportStats}
          onMapLoaded={setMapInstance}
        />

        {/* Floating Map Legend (Bottom-Left) */}
        <MapLegend
          filterState={filterState}
          categoryCounts={viewportStats.categoryBreakdown}
        />
      </div>

      {/* Slide-out Facility Detail Modal */}
      <FacilityDetailModal
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onFlyTo={handleFlyTo}
      />

      {/* AWS Integration & Architecture Modal */}
      <AwsConfigModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
        config={awsConfig}
        onSaveConfig={handleSaveAwsConfig}
        onReloadData={loadData}
      />
    </div>
  );
};

export default App;
