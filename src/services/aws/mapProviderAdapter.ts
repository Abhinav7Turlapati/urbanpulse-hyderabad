import { AwsIntegrationConfig, MapStyleKey } from '../../types';

export interface MapStyleOption {
  key: MapStyleKey;
  name: string;
  provider: 'Amazon Location Service' | 'OpenGIS / Carto' | 'OpenStreetMap';
  description: string;
  requiresAws: boolean;
  getStyleUrl: (config?: AwsIntegrationConfig) => string;
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    key: 'carto-dark',
    name: 'Cyber Dark (Default)',
    provider: 'OpenGIS / Carto',
    description: 'High-contrast dark geospatial theme optimized for smart-city overlays and glowing markers.',
    requiresAws: false,
    getStyleUrl: () => 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  },
  {
    key: 'carto-voyager',
    name: 'Navigation Light',
    provider: 'OpenGIS / Carto',
    description: 'Detailed street-level road topology and municipal boundaries.',
    requiresAws: false,
    getStyleUrl: () => 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  },
  {
    key: 'osm-standard',
    name: 'OpenStreetMap Standard',
    provider: 'OpenStreetMap',
    description: 'Direct global OpenStreetMap raster tile server with standard cartography.',
    requiresAws: false,
    getStyleUrl: () => {
      // Return a basic style spec for OSM raster
      return {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      } as any;
    }
  },
  {
    key: 'aws-location-esri-dark',
    name: 'Amazon Location: Esri Dark Gray',
    provider: 'Amazon Location Service',
    description: 'Official AWS Esri vector style powered by Amazon Location Service (ap-south-1).',
    requiresAws: true,
    getStyleUrl: (config?: AwsIntegrationConfig) => {
      const region = config?.region || 'ap-south-1';
      const mapName = config?.mapName || 'UrbanPulseHyderabadMap';
      const apiKey = config?.apiKey || '';
      return `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`;
    }
  },
  {
    key: 'aws-location-here-explore',
    name: 'Amazon Location: HERE Explore',
    provider: 'Amazon Location Service',
    description: 'Enterprise HERE Technologies vector tiles rendered through Amazon Location Service.',
    requiresAws: true,
    getStyleUrl: (config?: AwsIntegrationConfig) => {
      const region = config?.region || 'ap-south-1';
      const mapName = config?.mapName || 'UrbanPulseHereMap';
      const apiKey = config?.apiKey || '';
      return `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`;
    }
  }
];

export class MapProviderAdapter {
  private currentStyleKey: MapStyleKey = 'carto-dark';
  private awsConfig: AwsIntegrationConfig;

  constructor(awsConfig: AwsIntegrationConfig) {
    this.awsConfig = awsConfig;
    // If AWS is configured and enabled, we can default to AWS style
    if (this.awsConfig.enabled && this.awsConfig.apiKey) {
      this.currentStyleKey = 'aws-location-esri-dark';
    }
  }

  public updateAwsConfig(config: AwsIntegrationConfig): void {
    this.awsConfig = config;
  }

  public setStyle(styleKey: MapStyleKey): void {
    this.currentStyleKey = styleKey;
  }

  public getSelectedStyle(): MapStyleOption {
    return MAP_STYLES.find(s => s.key === this.currentStyleKey) || MAP_STYLES[0];
  }

  public getStyleUrl(): string | object {
    const style = this.getSelectedStyle();
    if (style.requiresAws && (!this.awsConfig.apiKey || !this.awsConfig.enabled)) {
      console.warn(`[MapProviderAdapter] Style ${style.name} requires AWS credentials. Falling back to default dark style.`);
      return MAP_STYLES[0].getStyleUrl();
    }
    return style.getStyleUrl(this.awsConfig);
  }

  public getAvailableStyles(): MapStyleOption[] {
    return MAP_STYLES;
  }

  public isUsingAws(): boolean {
    return this.getSelectedStyle().requiresAws && Boolean(this.awsConfig.apiKey);
  }
}
