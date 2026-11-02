export type CategoryType = 'healthcare' | 'transit' | 'emergency' | 'environment' | 'civic';

export interface InfrastructureProperties {
  id: string;
  name: string;
  category: CategoryType;
  subcategory: string;
  address: string;
  district: string;
  source: string;
  icon: string;
  status: string;
  coordinates: [number, number]; // [lng, lat]
  specialities?: string;
  phone?: string;
  area?: string;
  [key: string]: any;
}

export interface InfrastructureFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: InfrastructureProperties;
}

export interface InfrastructureGeoJSON {
  type: 'FeatureCollection';
  name?: string;
  crs?: any;
  bbox?: any;
  metadata?: {
    city: string;
    total_records: number;
    generated_at: string;
    categories: Record<string, number>;
    subcategories: Record<string, number>;
    bounding_box: {
      min_lng: number;
      min_lat: number;
      max_lng: number;
      max_lat: number;
    };
  };
  features: InfrastructureFeature[];
}

export interface DatasetSourceInfo {
  dataset_name: string;
  category: CategoryType;
  source: string;
  records: number;
  original_url: string;
  license: string;
  last_updated: string;
}

export interface DataCatalogMetadata {
  title: string;
  city: string;
  center: [number, number];
  default_zoom: number;
  total_records: number;
  category_counts: Record<string, number>;
  subcategory_counts: Record<string, number>;
  sources: DatasetSourceInfo[];
  limitations: string[];
  attribution: string;
}

export interface FilterState {
  searchQuery: string;
  categories: Record<CategoryType, boolean>;
  subcategories: string[];
  district: string; // 'all' or specific district
  showClusters: boolean;
  showHeatmap: boolean;
  showPoints: boolean;
  heatmapRadius: number;
  heatmapIntensity: number;
}

export type MapStyleKey = 
  | 'carto-dark' 
  | 'carto-voyager' 
  | 'osm-standard' 
  | 'aws-location-esri-dark' 
  | 'aws-location-here-explore';

export interface AwsIntegrationConfig {
  enabled: boolean;
  region: string;
  mapName: string;
  apiKey: string;
  s3BucketUrl: string;
  s3DatasetPath: string;
  s3Enabled: boolean;
  status: 'unconfigured' | 'testing' | 'connected' | 'error';
  errorMessage?: string;
}

export interface ViewportStats {
  visibleCount: number;
  totalCount: number;
  categoryBreakdown: Record<CategoryType, number>;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
