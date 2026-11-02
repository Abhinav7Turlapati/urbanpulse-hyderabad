import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Activity, 
  ExternalLink, 
  Copy, 
  Check, 
  Building2, 
  ShieldCheck, 
  Compass,
  Database
} from 'lucide-react';
import { InfrastructureFeature } from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';

interface FacilityDetailModalProps {
  feature: InfrastructureFeature | null;
  onClose: () => void;
  onFlyTo: (coords: [number, number]) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  feature,
  onClose,
  onFlyTo
}) => {
  const [copied, setCopied] = useState(false);

  if (!feature) return null;

  const props = feature.properties;
  const [lng, lat] = feature.geometry.coordinates;
  const catColor = CATEGORY_COLORS[props.category]?.hex || '#06B6D4';
  const catBadge = CATEGORY_COLORS[props.category]?.twBadge || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 bg-cyber-navy/95 backdrop-blur-2xl border-l border-cyber-border shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-cyber-border flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: catColor }}
            />
            <span className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${catBadge}`}>
              {props.subcategory}
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {props.status || 'Active'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">
            {props.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Coordinates card */}
        <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">GPS Coordinates</div>
              <div className="font-mono text-xs text-slate-200">
                {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyCoords}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Copy coordinates"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Location & Address */}
        <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Address & Locality</div>
              <p className="text-xs text-slate-200 leading-relaxed mt-0.5">{props.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2 border-t border-cyber-border/60">
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex justify-between w-full text-xs">
              <span className="text-slate-400">District / Zone:</span>
              <span className="font-semibold text-slate-200">{props.district}</span>
            </div>
          </div>
        </div>

        {/* Hospital Specialities if present */}
        {props.specialities && (
          <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Specialities & Services</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {props.specialities}
            </p>
          </div>
        )}

        {/* Phone Contact if present */}
        {props.phone && (
          <div className="bg-cyber-surface/90 border border-cyber-border rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Phone Contact</div>
                <div className="text-xs font-mono text-slate-200">{props.phone}</div>
              </div>
            </div>
            <a
              href={`tel:${props.phone}`}
              className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              Call
            </a>
          </div>
        )}

        {/* Data Source & Provenance */}
        <div className="bg-cyber-card/60 border border-cyber-border/80 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">Data Source & Attribution</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {props.source}
          </p>
          <div className="text-[10px] text-slate-400 pt-1 font-mono">
            Unique ID: {props.id}
          </div>
        </div>
      </div>

      {/* Footer Navigation Actions */}
      <div className="p-4 border-t border-cyber-border bg-cyber-surface/90 flex items-center gap-2">
        <button
          onClick={() => onFlyTo([lng, lat])}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-colors"
        >
          <Compass className="w-4 h-4" />
          Focus on Map
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          title="Open in Google Maps"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <a
          href={osmUrl}
          target="_blank"
          rel="noreferrer"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          title="Open in OpenStreetMap"
        >
          <MapPin className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
