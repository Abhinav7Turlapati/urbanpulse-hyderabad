import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  Key, 
  Database, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';
import { AwsIntegrationConfig } from '../../types';
import { saveAwsConfig } from '../../services/aws/awsConfig';

interface AwsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AwsIntegrationConfig;
  onSaveConfig: (updated: AwsIntegrationConfig) => void;
  onReloadData: () => void;
}

export const AwsConfigModal: React.FC<AwsConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onReloadData
}) => {
  const [region, setRegion] = useState(config.region || 'ap-south-1');
  const [mapName, setMapName] = useState(config.mapName || 'UrbanPulseHyderabadMap');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [s3BucketUrl, setS3BucketUrl] = useState(config.s3BucketUrl || '');
  const [s3DatasetPath, setS3DatasetPath] = useState(config.s3DatasetPath || 'datasets/hyderabad_infrastructure.geojson');
  const [s3Enabled, setS3Enabled] = useState(config.s3Enabled || false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing', message: 'Testing Amazon Location Service endpoint...' });

    if (!apiKey) {
      setTestResult({
        status: 'error',
        message: 'No AWS API Key provided. Operating in OpenGIS/MapLibre local development mode.'
      });
      return;
    }

    try {
      const url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`;
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status === 200 || res.status === 304) {
        setTestResult({
          status: 'success',
          message: 'Amazon Location Service validated successfully! Map tiles reachable.'
        });
      } else {
        setTestResult({
          status: 'error',
          message: `AWS endpoint responded with HTTP ${res.status}. Verify Map Resource Name and API Key restrictions.`
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Connection failed: ${err.message}. Ensure CORS or API Key allows requests from your host domain.`
      });
    }
  };

  const handleSave = () => {
    const updated: AwsIntegrationConfig = {
      ...config,
      region,
      mapName,
      apiKey,
      s3BucketUrl,
      s3DatasetPath,
      s3Enabled,
      enabled: Boolean(apiKey),
      status: apiKey ? 'connected' : 'unconfigured'
    };
    saveAwsConfig(updated);
    onSaveConfig(updated);
    if (s3Enabled) {
      onReloadData();
    }
    onClose();
  };

  const cloudFormationSnippet = `# AWS CloudFormation Template: Amazon Location Service & S3 Bucket for UrbanPulse
AWSTemplateFormatVersion: '2010-09-09'
Description: UrbanPulse Hyderabad Geospatial Infrastructure Backend
Resources:
  UrbanPulseMap:
    Type: AWS::Location::Map
    Properties:
      MapName: UrbanPulseHyderabadMap
      Configuration:
        Style: VectorEsriDarkGrayCanvas
      Description: Hyderabad Smart City Map Style

  UrbanPulseApiKey:
    Type: AWS::Location::APIKey
    Properties:
      KeyName: UrbanPulseApiKey
      Restrictions:
        AllowActions:
          - 'geo:GetMap*'
        AllowResources:
          - !GetAtt UrbanPulseMap.Arn

  UrbanPulseDataBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: urbanpulse-hyderabad-geodata
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders: ['*']
            AllowedMethods: [GET, HEAD]
            AllowedOrigins: ['*']
            MaxAge: 3600`;

  const copyCliCode = () => {
    navigator.clipboard.writeText(cloudFormationSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-cyber-surface border border-cyber-border rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AWS Architecture & Service Integrator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  AWS Challenge
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Amazon Location Service (Maps) + Amazon S3 (Geospatial Data Lake)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Architecture Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            apiKey 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}>
            <Shield className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <div className="font-semibold text-white mb-0.5">
                {apiKey ? 'AWS Credentials Active' : 'Modular Ready: Development Mode'}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {apiKey
                  ? 'Amazon Location Service map styles are unlocked and ready for rendering.'
                  : 'Currently rendering via MapLibre GL with Carto Dark Matter / OpenStreetMap tiles. When AWS credentials or API keys are supplied below, the Map Provider Adapter seamlessly routes vector tiles to Amazon Location Service.'}
              </p>
            </div>
          </div>

          {/* Architecture Diagram Card */}
          <div className="bg-cyber-card/70 border border-cyber-border rounded-xl p-4 space-y-3">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              End-to-End AWS Production Architecture
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-lg bg-cyber-navy border border-cyber-border flex flex-col items-center">
                <Globe className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="font-semibold text-slate-200 text-xs">Client Map Engine</span>
                <span className="text-[10px] text-slate-400 mt-0.5">MapLibre GL JS + React</span>
              </div>
              <div className="p-3 rounded-lg bg-cyber-navy border border-amber-500/40 flex flex-col items-center">
                <Cloud className="w-4 h-4 text-amber-400 mb-1" />
                <span className="font-semibold text-slate-200 text-xs">Amazon Location Service</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Esri & HERE Vector Tiles</span>
              </div>
              <div className="p-3 rounded-lg bg-cyber-navy border border-emerald-500/40 flex flex-col items-center">
                <Database className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="font-semibold text-slate-200 text-xs">Amazon S3 Storage</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Partitioned GeoJSON Lake</span>
              </div>
            </div>
          </div>

          {/* Form 1: Amazon Location Service */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              1. Amazon Location Service Configuration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">AWS Region</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="ap-south-1 (Mumbai)"
                  className="w-full bg-cyber-navy border border-cyber-border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Map Resource Name</label>
                <input
                  type="text"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  placeholder="UrbanPulseHyderabadMap"
                  className="w-full bg-cyber-navy border border-cyber-border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Amazon Location API Key (or test placeholder)
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="v1.public.ey..."
                className="w-full bg-cyber-navy border border-cyber-border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Validate AWS Endpoint
              </button>
              {testResult.status !== 'idle' && (
                <span className={`text-[11px] flex items-center gap-1.5 ${
                  testResult.status === 'success' 
                    ? 'text-emerald-400' 
                    : testResult.status === 'error' 
                    ? 'text-amber-400' 
                    : 'text-slate-400'
                }`}>
                  {testResult.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {testResult.message}
                </span>
              )}
            </div>
          </div>

          {/* Form 2: Amazon S3 Data Retrieval */}
          <div className="space-y-3 pt-3 border-t border-cyber-border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                2. Amazon S3 GeoJSON Data Storage
              </h3>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={s3Enabled}
                  onChange={(e) => setS3Enabled(e.target.checked)}
                  className="rounded bg-cyber-navy border-cyber-border text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>Enable S3 Live Fetch</span>
              </label>
            </div>

            {s3Enabled && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    S3 Bucket Public URL or CloudFront Distribution
                  </label>
                  <input
                    type="text"
                    value={s3BucketUrl}
                    onChange={(e) => setS3BucketUrl(e.target.value)}
                    placeholder="https://urbanpulse-hyderabad-geodata.s3.ap-south-1.amazonaws.com"
                    className="w-full bg-cyber-navy border border-cyber-border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Dataset Key Path
                  </label>
                  <input
                    type="text"
                    value={s3DatasetPath}
                    onChange={(e) => setS3DatasetPath(e.target.value)}
                    placeholder="datasets/hyderabad_infrastructure.geojson"
                    className="w-full bg-cyber-navy border border-cyber-border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CloudFormation Code Preview */}
          <div className="space-y-2 pt-3 border-t border-cyber-border">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                AWS Infrastructure-as-Code (CloudFormation / SAM)
              </span>
              <button
                onClick={copyCliCode}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet ? 'Copied' : 'Copy Template'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-cyber-navy border border-cyber-border text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 leading-relaxed">
              {cloudFormationSnippet}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyber-border bg-cyber-navy/80 flex items-center justify-between">
          <a
            href="https://aws.amazon.com/location/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            AWS Location Docs
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

