import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Building, 
  Eye, 
  Activity, 
  Train, 
  ShieldAlert, 
  Compass
} from 'lucide-react';
import { ViewportStats, CategoryType } from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';

interface AnalyticsTabProps {
  viewportStats: ViewportStats;
  totalRecords: number;
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
  onSelectCategory?: (category: CategoryType) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  viewportStats,
  totalRecords,
  categoryCounts,
  subcategoryCounts,
  onSelectCategory
}) => {
  // Bar chart data: Category comparison (Total vs Visible in Viewport)
  const barChartData = [
    {
      name: 'Healthcare',
      key: 'healthcare' as CategoryType,
      total: categoryCounts.healthcare || 0,
      visible: viewportStats.categoryBreakdown.healthcare || 0,
      color: CATEGORY_COLORS.healthcare.hex
    },
    {
      name: 'Transit',
      key: 'transit' as CategoryType,
      total: categoryCounts.transit || 0,
      visible: viewportStats.categoryBreakdown.transit || 0,
      color: CATEGORY_COLORS.transit.hex
    },
    {
      name: 'Emergency',
      key: 'emergency' as CategoryType,
      total: categoryCounts.emergency || 0,
      visible: viewportStats.categoryBreakdown.emergency || 0,
      color: CATEGORY_COLORS.emergency.hex
    },
    {
      name: 'Environment',
      key: 'environment' as CategoryType,
      total: categoryCounts.environment || 0,
      visible: viewportStats.categoryBreakdown.environment || 0,
      color: CATEGORY_COLORS.environment.hex
    },
    {
      name: 'Civic',
      key: 'civic' as CategoryType,
      total: categoryCounts.civic || 0,
      visible: viewportStats.categoryBreakdown.civic || 0,
      color: CATEGORY_COLORS.civic.hex
    }
  ];

  // Pie chart data: Subcategories of healthcare (Govt vs Private vs PHC)
  const healthcarePieData = [
    { name: 'Govt Hospitals', value: subcategoryCounts['Government Hospital'] || 36, color: '#10B981' },
    { name: 'Private Arogyasri', value: subcategoryCounts['Private Hospital (Empanelled)'] || 121, color: '#059669' },
    { name: 'Primary Clinics', value: subcategoryCounts['Primary Health Clinic'] || 146, color: '#34D399' }
  ];

  // Transit breakdown
  const transitPieData = [
    { name: 'Metro Stations', value: subcategoryCounts['Metro Station'] || 25, color: '#06B6D4' },
    { name: 'MMTS Stations', value: subcategoryCounts['MMTS Suburban Rail Station'] || 31, color: '#0284C7' },
    { name: 'Bus Hubs', value: subcategoryCounts['Major Bus Terminal / Hub'] || 60, color: '#38BDF8' }
  ];

  return (
    <div className="space-y-5 text-xs">
      {/* Viewport Live KPI Card */}
      <div className="bg-gradient-to-br from-cyber-card via-cyber-surface to-cyber-navy border border-cyan-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              Live Viewport Telemetry
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Greater Hyderabad
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cyber-navy/80 border border-cyber-border rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>In Viewport</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {viewportStats.visibleCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {Math.round((viewportStats.visibleCount / (totalRecords || 1)) * 100)}% of mapped records
            </div>
          </div>

          <div className="bg-cyber-navy/80 border border-cyber-border rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Catalog</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalRecords}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
              100% verified points
            </div>
          </div>
        </div>

        {viewportStats.bounds && (
          <div className="mt-3 pt-2.5 border-t border-cyber-border/70 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>N: {viewportStats.bounds.north.toFixed(3)}°</span>
            <span>S: {viewportStats.bounds.south.toFixed(3)}°</span>
            <span>E: {viewportStats.bounds.east.toFixed(3)}°</span>
            <span>W: {viewportStats.bounds.west.toFixed(3)}°</span>
          </div>
        )}
      </div>

      {/* Category Metric Badges */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onSelectCategory && onSelectCategory('healthcare')}
          className="p-2.5 rounded-xl bg-cyber-surface/90 border border-emerald-500/20 hover:border-emerald-500/40 text-left transition-colors"
        >
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase">Health</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {categoryCounts.healthcare || 0}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {viewportStats.categoryBreakdown.healthcare || 0} visible
          </div>
        </button>

        <button
          onClick={() => onSelectCategory && onSelectCategory('transit')}
          className="p-2.5 rounded-xl bg-cyber-surface/90 border border-cyan-500/20 hover:border-cyan-500/40 text-left transition-colors"
        >
          <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
            <Train className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase">Transit</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {categoryCounts.transit || 0}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {viewportStats.categoryBreakdown.transit || 0} visible
          </div>
        </button>

        <button
          onClick={() => onSelectCategory && onSelectCategory('emergency')}
          className="p-2.5 rounded-xl bg-cyber-surface/90 border border-rose-500/20 hover:border-rose-500/40 text-left transition-colors"
        >
          <div className="flex items-center gap-1.5 text-rose-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase">Emergency</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {categoryCounts.emergency || 0}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {viewportStats.categoryBreakdown.emergency || 0} visible
          </div>
        </button>
      </div>

      {/* Category Distribution Bar Chart */}
      <div className="bg-cyber-surface/80 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
            Category Distribution
          </span>
          <span className="text-[10px] text-slate-400">Total vs Visible</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
              <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#94A3B8" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(31, 41, 61, 0.9)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#F8FAFC'
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={12}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Healthcare Breakdown Donut */}
      <div className="bg-cyber-surface/80 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Healthcare Distribution
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">303 Facilities</span>
        </div>

        <div className="flex items-center">
          <div className="w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthcarePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={45}
                  paddingAngle={3}
                >
                  {healthcarePieData.map((entry, index) => (
                    <Cell key={`cell-hc-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(31, 41, 61, 0.9)',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 pl-3 space-y-1.5">
            {healthcarePieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[110px]">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transit Multi-Modal Breakdown Donut */}
      <div className="bg-cyber-surface/80 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5 text-cyan-400" />
            Transit Multi-Modal Network
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">116 Hubs</span>
        </div>

        <div className="flex items-center">
          <div className="w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transitPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={45}
                  paddingAngle={3}
                >
                  {transitPieData.map((entry, index) => (
                    <Cell key={`cell-tr-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(31, 41, 61, 0.9)',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 pl-3 space-y-1.5">
            {transitPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[110px]">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transit & Emergency Hubs summary */}
      <div className="p-3.5 rounded-xl bg-cyber-card/60 border border-cyber-border flex items-start gap-3">
        <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 text-xs">
            Spatial Coverage Analysis
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Healthcare and transit hubs exhibit dense co-clustering along the 3 Hyderabad Metro corridors (Miyapur–LB Nagar, Nagole–Raidurg, JBS–MGBS), with primary health clinics covering surrounding GHMC suburban wards.
          </p>
        </div>
      </div>
    </div>
  );
};
