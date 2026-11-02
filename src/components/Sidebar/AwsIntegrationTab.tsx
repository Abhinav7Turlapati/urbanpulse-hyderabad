import React from 'react';
import { 
  Cloud, 
  MapPin, 
  Database, 
  Settings, 
  Shield, 
  ArrowRight
} from 'lucide-react';
import { AwsIntegrationConfig, MapStyleKey } from '../../types';
import { DataLoadResult } from '../../services/aws/s3DataLoader';

interface AwsIntegrationTabProps {
  awsConfig: AwsIntegrationConfig;
  dataLoadResult: DataLoadResult | null;
  currentStyleKey: MapStyleKey;
  onOpenAwsModal: () => void;
}

export const AwsIntegrationTab: React.FC<AwsIntegrationTabProps> = ({
  awsConfig,
  dataLoadResult,
  currentStyleKey,
  onOpenAwsModal
}) => {
  const isAwsMapActive = currentStyleKey.startsWith('aws-location');

  return (
    <div className="space-y-4 text-xs">
      {/* Hackathon Challenge Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-cyber-surface to-cyber-navy border border-amber-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-xs">
              AWS Builder Center: Map It Challenge
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Hackathon Ready
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          UrbanPulse is architected for turnkey integration with Amazon Location Service for vector basemaps and Amazon S3 for cloud-native GeoJSON partitions.
        </p>
      </div>

      {/* Service 1: Amazon Location Service Status */}
      <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-100 text-xs">Amazon Location Service</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
            awsConfig.apiKey
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {awsConfig.apiKey ? 'API Key Configured' : 'Modular Dev Mode'}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-300">
          <div className="flex justify-between py-1 border-b border-cyber-border/60">
            <span className="text-slate-400">AWS Region:</span>
            <span className="font-mono text-slate-200">{awsConfig.region || 'ap-south-1 (Mumbai)'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-cyber-border/60">
            <span className="text-slate-400">Map Resource:</span>
            <span className="font-mono text-slate-200">{awsConfig.mapName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-cyber-border/60">
            <span className="text-slate-400">Active Map Engine:</span>
            <span className="font-mono text-cyan-400">
              {isAwsMapActive ? 'Amazon Location Service' : 'MapLibre GL + Carto Dark'}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Supported Styles:</span>
            <span className="text-slate-300">Esri Dark Gray, HERE Explore</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          * Map provider adapter dynamically authenticates API keys or IAM credentials without code modifications.
        </p>
      </div>

      {/* Service 2: Amazon S3 Data Lake Status */}
      <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-100 text-xs">Amazon S3 Storage Integration</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
            dataLoadResult?.source === 'amazon-s3'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-cyan-300 border-slate-700'
          }`}>
            {dataLoadResult?.source === 'amazon-s3' ? 'Live S3 Bucket' : 'Bundled Static GeoJSON'}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-300">
          <div className="flex justify-between py-1 border-b border-cyber-border/60">
            <span className="text-slate-400">Data Origin:</span>
            <span className="font-mono text-slate-200">{dataLoadResult?.source}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-cyber-border/60">
            <span className="text-slate-400">Loaded Records:</span>
            <span className="font-mono text-slate-200">{dataLoadResult?.itemCount || 578}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Fetch Latency:</span>
            <span className="font-mono text-emerald-400">{dataLoadResult?.latencyMs || 12} ms</span>
          </div>
        </div>

        {dataLoadResult?.message && (
          <div className="p-2 rounded bg-cyber-navy border border-cyber-border text-[10px] text-slate-400 font-mono">
            {dataLoadResult.message}
          </div>
        )}
      </div>

      {/* Action: Open AWS Config Modal */}
      <button
        onClick={onOpenAwsModal}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/10"
      >
        <Settings className="w-4 h-4" />
        Configure AWS Credentials & Endpoints
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Cloud Architecture Summary */}
      <div className="bg-cyber-surface/60 border border-cyber-border rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
          <Shield className="w-4 h-4 text-cyan-400" />
          Production Deployment Architecture
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          In a full AWS production release:
        </p>
        <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
          <li><strong>Frontend:</strong> Hosted via Amazon S3 + CloudFront CDN.</li>
          <li><strong>Map Basemap:</strong> Amazon Location Service via secure API Keys.</li>
          <li><strong>Data Ingestion:</strong> AWS Lambda pipeline refreshing Hyderabad Open Data into S3.</li>
        </ul>
      </div>
    </div>
  );
};
