import { AwsIntegrationConfig, InfrastructureGeoJSON } from '../../types';
import localData from '../../data/hyderabad_infrastructure.geojson';

export interface DataLoadResult {
  data: InfrastructureGeoJSON;
  source: 'amazon-s3' | 'local-static-asset';
  url: string;
  latencyMs: number;
  itemCount: number;
  status: 'success' | 'fallback' | 'error';
  message?: string;
}

export class S3DataLoader {
  private config: AwsIntegrationConfig;

  constructor(config: AwsIntegrationConfig) {
    this.config = config;
  }

  public updateConfig(config: AwsIntegrationConfig): void {
    this.config = config;
  }

  public async loadInfrastructureData(): Promise<DataLoadResult> {
    const startTime = performance.now();

    // 1. If S3 integration is enabled and configured, attempt to fetch from Amazon S3
    if (this.config.s3Enabled && this.config.s3BucketUrl) {
      const fullUrl = this.config.s3BucketUrl.endsWith('/')
        ? `${this.config.s3BucketUrl}${this.config.s3DatasetPath}`
        : `${this.config.s3BucketUrl}/${this.config.s3DatasetPath}`;

      try {
        console.log(`[S3DataLoader] Fetching GeoJSON from Amazon S3: ${fullUrl}`);
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/geo+json, application/json'
          }
        });

        if (response.ok) {
          const s3GeoJson: InfrastructureGeoJSON = await response.json();
          const latencyMs = Math.round(performance.now() - startTime);
          return {
            data: s3GeoJson,
            source: 'amazon-s3',
            url: fullUrl,
            latencyMs,
            itemCount: s3GeoJson.features?.length || 0,
            status: 'success',
            message: `Successfully loaded ${s3GeoJson.features?.length || 0} features from Amazon S3 bucket.`
          };
        } else {
          console.warn(`[S3DataLoader] S3 request returned status ${response.status}. Falling back to bundled assets.`);
        }
      } catch (err: any) {
        console.warn(`[S3DataLoader] Failed to fetch from Amazon S3 (${err.message}). Falling back to local dataset.`);
      }
    }

    // 2. Fallback to local high-performance static GeoJSON asset
    try {
      const response = await fetch('/data/hyderabad_infrastructure.geojson');
      if (response.ok) {
        const localGeoJson: InfrastructureGeoJSON = await response.json();
        const latencyMs = Math.round(performance.now() - startTime);
        return {
          data: localGeoJson,
          source: 'local-static-asset',
          url: '/data/hyderabad_infrastructure.geojson',
          latencyMs,
          itemCount: localGeoJson.features?.length || 0,
          status: this.config.s3Enabled ? 'fallback' : 'success',
          message: this.config.s3Enabled
            ? 'Amazon S3 endpoint unreachable. Loaded from local fallback dataset.'
            : 'Loaded from local high-performance GeoJSON dataset.'
        };
      }
    } catch (e) {
      console.warn('[S3DataLoader] Static fetch failed, using bundled import:', e);
    }

    // 3. Fallback to statically imported bundle
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      data: localData as unknown as InfrastructureGeoJSON,
      source: 'local-static-asset',
      url: 'bundled:hyderabad_infrastructure.geojson',
      latencyMs,
      itemCount: (localData as any).features?.length || 0,
      status: 'success',
      message: 'Loaded from pre-compiled local bundle.'
    };
  }
}
