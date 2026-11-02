import React from 'react';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Download, 
  FileCode
} from 'lucide-react';
import metadataJson from '../../data/metadata.json';
import { DataCatalogMetadata } from '../../types';

export const TransparencyTab: React.FC = () => {
  const meta = metadataJson as unknown as DataCatalogMetadata;

  const handleDownloadGeoJSON = () => {
    const link = document.createElement('a');
    link.href = '/data/hyderabad_infrastructure.geojson';
    link.download = 'UrbanPulse_Hyderabad_Infrastructure.geojson';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Integrity Badge */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-white text-xs">
            100% Real Geographical Open Data
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
            UrbanPulse strictly consumes publicly available, official GIS datasets. Zero synthetic or fabricated coordinates are used. All points are validated against the Hyderabad Metropolitan Region bounding box.
          </p>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Verified Datasets Catalog ({meta.sources?.length || 8})
          </span>
          <span className="font-mono text-cyan-400 font-bold">{meta.total_records} Records</span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {meta.sources?.map((src, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-cyber-navy/80 border border-cyber-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{src.dataset_name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">
                  {src.records} pts
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Source: <strong className="text-slate-300">{src.source}</strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-cyber-border/60">
                <span>License: {src.license}</span>
                <a
                  href={src.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                >
                  Source URL
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations Section */}
      <div className="bg-cyber-surface/80 border border-cyber-border rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
          <AlertCircle className="w-4 h-4" />
          Data Boundaries & Limitations
        </div>
        <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed list-disc list-inside">
          {meta.limitations?.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>

      {/* Attribution & Export */}
      <div className="bg-cyber-surface/60 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Legal Attribution:</strong> {meta.attribution}
        </div>

        <div className="pt-2 border-t border-cyber-border flex items-center justify-between gap-2">
          <button
            onClick={handleDownloadGeoJSON}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download GeoJSON
          </button>

          <a
            href="https://github.com/Lakeer-org/hyderabad-open-gis-data"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            Lakeer Repo
          </a>
        </div>
      </div>
    </div>
  );
};
