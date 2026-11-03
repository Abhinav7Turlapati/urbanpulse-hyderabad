import React, { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  InfrastructureFeature, 
  InfrastructureGeoJSON, 
  FilterState, 
  ViewportStats, 
  MapStyleKey 
} from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';

interface InteractiveMapProps {
  data: InfrastructureGeoJSON;
  filterState: FilterState;
  styleKey: MapStyleKey;
  styleUrl: string | object;
  selectedFeature: InfrastructureFeature | null;
  onSelectFeature: (feature: InfrastructureFeature | null) => void;
  onViewportChange: (stats: ViewportStats) => void;
  onMapLoaded?: (map: maplibregl.Map) => void;
}

const HYDERABAD_CENTER: [number, number] = [78.4867, 17.3850];
const HYDERABAD_DEFAULT_ZOOM = 11;

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  data,
  filterState,
  styleUrl,
  selectedFeature,
  onSelectFeature,
  onViewportChange,
  onMapLoaded
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const clustersEnabledRef = useRef<boolean>(filterState.showClusters);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Compute filtered GeoJSON based on filterState
  const getFilteredGeoJSON = useCallback((): InfrastructureGeoJSON => {
    if (!data || !data.features) {
      return { type: 'FeatureCollection', name: 'Empty', features: [] };
    }

    const filteredFeatures = data.features.filter(feature => {
      const props = feature.properties || ({} as any);

      // 1. Category filter
      if (!filterState.categories[props.category]) {
        return false;
      }

      // 2. Subcategory filter
      if (filterState.subcategories.length > 0 && !filterState.subcategories.includes(props.subcategory)) {
        return false;
      }

      // 3. District filter
      if (filterState.district !== 'all' && props.district?.toLowerCase() !== filterState.district.toLowerCase()) {
        return false;
      }

      // 4. Search query
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesName = props.name?.toLowerCase().includes(query);
        const matchesAddr = props.address?.toLowerCase().includes(query);
        const matchesSubcat = props.subcategory?.toLowerCase().includes(query);
        const matchesDistrict = props.district?.toLowerCase().includes(query);
        if (!matchesName && !matchesAddr && !matchesSubcat && !matchesDistrict) {
          return false;
        }
      }

      return true;
    });

    return {
      type: 'FeatureCollection',
      name: 'Filtered_Infrastructure',
      features: filteredFeatures
    };
  }, [data, filterState]);

  // Update viewport stats whenever map moves
  const updateViewportStats = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    try {
      const bounds = map.getBounds();
      const currentFiltered = getFilteredGeoJSON().features;

      const categoryBreakdown: Record<string, number> = {
        healthcare: 0,
        transit: 0,
        emergency: 0,
        environment: 0,
        civic: 0
      };

      let visibleCount = 0;

      currentFiltered.forEach(feat => {
        const [lng, lat] = feat.geometry.coordinates;
        if (bounds.contains([lng, lat])) {
          visibleCount++;
          categoryBreakdown[feat.properties.category] = (categoryBreakdown[feat.properties.category] || 0) + 1;
        }
      });

      onViewportChange({
        visibleCount,
        totalCount: currentFiltered.length,
        categoryBreakdown: categoryBreakdown as any,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        }
      });
    } catch (e) {
      // Map may not be ready yet
    }
  }, [getFilteredGeoJSON, onViewportChange]);

  // Helper to add or update layers and sources
  const setupLayers = useCallback((map: maplibregl.Map, geojson: InfrastructureGeoJSON) => {
    // 1. Manage source
    const source = map.getSource('hyderabad-infra') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojson as any);
    } else {
      map.addSource('hyderabad-infra', {
        type: 'geojson',
        data: geojson as any,
        cluster: filterState.showClusters,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
    }

    // Manage heatmap source (separate unclustered source for smooth continuous density)
    const heatSource = map.getSource('hyderabad-heat-src') as maplibregl.GeoJSONSource;
    if (heatSource) {
      heatSource.setData(geojson as any);
    } else {
      map.addSource('hyderabad-heat-src', {
        type: 'geojson',
        data: geojson as any,
        cluster: false
      });
    }

    // 2. Add Heatmap Layer
    if (!map.getLayer('hyderabad-heatmap')) {
      map.addLayer({
        id: 'hyderabad-heatmap',
        type: 'heatmap',
        source: 'hyderabad-heat-src',
        maxzoom: 16,
        layout: {
          visibility: filterState.showHeatmap ? 'visible' : 'none'
        },
        paint: {
          // Increase weight for emergency and hospitals
          'heatmap-weight': [
            'match',
            ['get', 'category'],
            'healthcare', 1.3,
            'emergency', 1.2,
            'transit', 1.0,
            0.8
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 0.8,
            15, 2.5
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.15, 'rgba(6, 182, 212, 0.3)',
            0.35, 'rgba(16, 185, 129, 0.6)',
            0.65, 'rgba(245, 158, 11, 0.8)',
            0.9, 'rgba(244, 63, 94, 0.95)',
            1.0, 'rgba(255, 255, 255, 1)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, filterState.heatmapRadius * 0.7,
            14, filterState.heatmapRadius * 1.5
          ],
          'heatmap-opacity': filterState.showHeatmap ? 0.75 : 0
        }
      });
    }

    // 3. Add Cluster Circles Layer
    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'hyderabad-infra',
        filter: ['has', 'point_count'],
        layout: {
          visibility: filterState.showClusters ? 'visible' : 'none'
        },
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#06B6D4', // cyan (<15)
            15, '#10B981', // emerald (15-40)
            40, '#F59E0B', // amber (40-80)
            80, '#F43F5E'  // rose (80+)
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            15, 24,
            40, 30,
            80, 36
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.9
        }
      });
    }

    // 4. Cluster Count Label Layer
    if (!map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'hyderabad-infra',
        filter: ['has', 'point_count'],
        layout: {
          visibility: filterState.showClusters ? 'visible' : 'none',
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 13
        },
        paint: {
          'text-color': '#FFFFFF'
        }
      });
    }

    // 5. Unclustered Individual Points Layer
    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'hyderabad-infra',
        filter: filterState.showClusters ? ['!', ['has', 'point_count']] : ['all'],
        layout: {
          visibility: filterState.showPoints ? 'visible' : 'none'
        },
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            'healthcare', CATEGORY_COLORS.healthcare.hex,
            'transit', CATEGORY_COLORS.transit.hex,
            'emergency', CATEGORY_COLORS.emergency.hex,
            'environment', CATEGORY_COLORS.environment.hex,
            'civic', CATEGORY_COLORS.civic.hex,
            '#38BDF8'
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 5.5,
            14, 8,
            17, 12
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.95
        }
      });
    }

    // 6. Selected Point Highlight Ring Layer
    if (!map.getLayer('selected-point-ring')) {
      map.addLayer({
        id: 'selected-point-ring',
        type: 'circle',
        source: 'hyderabad-infra',
        filter: ['==', ['get', 'id'], 'none'],
        paint: {
          'circle-color': 'transparent',
          'circle-radius': 16,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#38BDF8',
          'circle-opacity': 1
        }
      });
    }
  }, [filterState]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const isSupported = typeof (maplibregl as any).supported === 'function' 
        ? (maplibregl as any).supported() 
        : true;

      if (!isSupported) {
        console.warn('[UrbanPulse Map] WebGL not supported in current environment.');
        setWebglSupported(false);
        return;
      }

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl as any,
        center: HYDERABAD_CENTER,
        zoom: HYDERABAD_DEFAULT_ZOOM,
        pitch: 30, // 30-degree isometric pitch for a modern 3D look
        bearing: 0,
        maxBounds: [
          [77.7, 16.8], // Southwest
          [79.2, 17.9]  // Northeast
        ],
        attributionControl: false
      });

      // Add navigation controls in bottom-right corner to preserve floating top bar
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
      map.addControl(new maplibregl.FullscreenControl(), 'bottom-right');
      map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      mapRef.current = map;

      map.on('load', () => {
        setupLayers(map, getFilteredGeoJSON());
        updateViewportStats();
        if (onMapLoaded) {
          onMapLoaded(map);
        }
      });

      map.on('moveend', updateViewportStats);
      map.on('zoomend', updateViewportStats);

    // Click on Clusters -> Expand
    map.on('click', 'clusters', async (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length) return;
      const clusterId = features[0].properties.cluster_id;
      const source = map.getSource('hyderabad-infra') as maplibregl.GeoJSONSource;
      const geom = features[0].geometry as any;

      if (!source || !geom) return;

      const easeToZoom = (zoomLevel: number) => {
        map.easeTo({
          center: geom.coordinates,
          zoom: Math.min(zoomLevel + 0.5, 17),
          duration: 600
        });
      };

      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        if (typeof zoom === 'number') {
          easeToZoom(zoom);
        }
      } catch (err) {
        // Fallback: zoom by 2 levels towards cluster
        map.easeTo({
          center: geom.coordinates,
          zoom: map.getZoom() + 2,
          duration: 500
        });
      }
    });

    // Cursor pointer on clusters
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });

    // Click on Unclustered Points -> Select & Popup
    map.on('click', 'unclustered-point', (e) => {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0] as unknown as InfrastructureFeature;
      const props = feature.properties;
      const geom = feature.geometry as any;

      onSelectFeature(feature);

      // Open MapLibre Popup
      if (popupRef.current) {
        popupRef.current.remove();
      }

      const catColor = CATEGORY_COLORS[props.category]?.hex || '#06B6D4';

      const popupHtml = `
        <div class="text-left font-sans">
          <div class="flex items-center gap-1.5 mb-1.5">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${catColor};"></span>
            <span class="text-xs font-semibold tracking-wide uppercase text-slate-300">${props.subcategory}</span>
          </div>
          <h4 class="font-bold text-base text-white leading-snug mb-1">${props.name}</h4>
          <p class="text-xs text-slate-400 mb-2.5 line-clamp-2">${props.address}</p>
          <div class="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>District: <strong class="text-slate-200">${props.district}</strong></span>
            <span class="text-emerald-400 font-mono font-medium">${props.status}</span>
          </div>
        </div>
      `;

      popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
        .setLngLat(geom.coordinates)
        .setHTML(popupHtml)
        .addTo(map);

      map.easeTo({
        center: geom.coordinates,
        offset: [0, -40],
        duration: 500
      });
    });

    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });
    } catch (err) {
      console.warn('[UrbanPulse Map] WebGL error caught:', err);
      setWebglSupported(false);
    }

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Watch for styleUrl changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Check if style changed
    const currentStyle = map.getStyle();
    if (currentStyle && styleUrl) {
      map.setStyle(styleUrl as any);
      map.once('style.load', () => {
        setupLayers(map, getFilteredGeoJSON());
        updateViewportStats();
      });
    }
  }, [styleUrl, setupLayers, getFilteredGeoJSON, updateViewportStats]);

  // Watch for filter / data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const filtered = getFilteredGeoJSON();

    // If cluster toggle changed, we need to rebuild source
    if (clustersEnabledRef.current !== filterState.showClusters) {
      clustersEnabledRef.current = filterState.showClusters;
      // Re-initialize layers with new cluster setting
      if (map.getLayer('clusters')) map.removeLayer('clusters');
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
      if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
      if (map.getLayer('selected-point-ring')) map.removeLayer('selected-point-ring');
      if (map.getLayer('hyderabad-heatmap')) map.removeLayer('hyderabad-heatmap');
      if (map.getSource('hyderabad-infra')) map.removeSource('hyderabad-infra');
      if (map.getSource('hyderabad-heat-src')) map.removeSource('hyderabad-heat-src');

      setupLayers(map, filtered);
    } else {
      // Just update GeoJSON data smoothly
      const source = map.getSource('hyderabad-infra') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(filtered as any);
      }
      const heatSource = map.getSource('hyderabad-heat-src') as maplibregl.GeoJSONSource;
      if (heatSource) {
        heatSource.setData(filtered as any);
      }

      // Update layer visibility
      if (map.getLayer('clusters')) {
        map.setLayoutProperty('clusters', 'visibility', filterState.showClusters ? 'visible' : 'none');
      }
      if (map.getLayer('cluster-count')) {
        map.setLayoutProperty('cluster-count', 'visibility', filterState.showClusters ? 'visible' : 'none');
      }
      if (map.getLayer('unclustered-point')) {
        map.setLayoutProperty('unclustered-point', 'visibility', filterState.showPoints ? 'visible' : 'none');
        map.setFilter('unclustered-point', filterState.showClusters ? ['!', ['has', 'point_count']] : ['all']);
      }
      if (map.getLayer('hyderabad-heatmap')) {
        map.setLayoutProperty('hyderabad-heatmap', 'visibility', filterState.showHeatmap ? 'visible' : 'none');
        map.setPaintProperty('hyderabad-heatmap', 'heatmap-opacity', filterState.showHeatmap ? 0.8 : 0);
        map.setPaintProperty('hyderabad-heatmap', 'heatmap-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, filterState.heatmapRadius * 0.7,
          14, filterState.heatmapRadius * 1.5
        ]);
      }
    }

    updateViewportStats();
  }, [filterState, getFilteredGeoJSON, setupLayers, updateViewportStats]);

  // Highlight selected feature
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('selected-point-ring')) return;

    if (selectedFeature) {
      map.setFilter('selected-point-ring', ['==', ['get', 'id'], selectedFeature.properties.id]);
    } else {
      map.setFilter('selected-point-ring', ['==', ['get', 'id'], 'none']);
      if (popupRef.current) {
        popupRef.current.remove();
      }
    }
  }, [selectedFeature]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!webglSupported && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cyber-navy/95 p-6 text-center">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white mb-1">WebGL Acceleration Notice</h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
            WebGL is not active in this browser mode. Enable hardware acceleration in your browser settings to render the 3D map canvas. The full sidebar directory, KPI analytics, and data tools remain operational.
          </p>
          <div className="text-[11px] font-mono text-cyan-300 bg-cyber-surface/90 px-3 py-1.5 rounded-lg border border-cyber-border">
            Hyderabad Coordinates: 17.3850° N, 78.4867° E | 578 Verified Records
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
