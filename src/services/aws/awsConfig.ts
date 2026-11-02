import { AwsIntegrationConfig } from '../../types';

// Default AWS Configuration
// Uses Vite environment variables if defined, otherwise defaults to mock/ready-to-configure state
export const DEFAULT_AWS_CONFIG: AwsIntegrationConfig = {
  enabled: Boolean(import.meta.env.VITE_AWS_LOCATION_API_KEY),
  region: import.meta.env.VITE_AWS_REGION || 'ap-south-1', // Default to AWS Mumbai region for Hyderabad
  mapName: import.meta.env.VITE_AWS_LOCATION_MAP_NAME || 'UrbanPulseHyderabadMap',
  apiKey: import.meta.env.VITE_AWS_LOCATION_API_KEY || '',
  s3BucketUrl: import.meta.env.VITE_AWS_S3_BUCKET_URL || '',
  s3DatasetPath: import.meta.env.VITE_AWS_S3_DATASET_PATH || 'datasets/hyderabad_infrastructure.geojson',
  s3Enabled: Boolean(import.meta.env.VITE_AWS_S3_BUCKET_URL),
  status: import.meta.env.VITE_AWS_LOCATION_API_KEY ? 'connected' : 'unconfigured'
};

const STORAGE_KEY = 'urbanpulse_aws_config';

export function getSavedAwsConfig(): AwsIntegrationConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_AWS_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to read AWS config from localStorage', e);
  }
  return DEFAULT_AWS_CONFIG;
}

export function saveAwsConfig(config: AwsIntegrationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AWS config', e);
  }
}

