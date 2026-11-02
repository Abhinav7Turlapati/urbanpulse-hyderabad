import { CategoryType } from '../types';

export const CATEGORY_COLORS: Record<CategoryType, {
  hex: string;
  twText: string;
  twBg: string;
  twBorder: string;
  twBadge: string;
  label: string;
}> = {
  healthcare: {
    hex: '#10B981',
    twText: 'text-emerald-400',
    twBg: 'bg-emerald-500/10',
    twBorder: 'border-emerald-500/30',
    twBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    label: 'Healthcare & Hospitals'
  },
  transit: {
    hex: '#06B6D4',
    twText: 'text-cyan-400',
    twBg: 'bg-cyan-500/10',
    twBorder: 'border-cyan-500/30',
    twBadge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    label: 'Transit & Mobility'
  },
  emergency: {
    hex: '#F43F5E',
    twText: 'text-rose-400',
    twBg: 'bg-rose-500/10',
    twBorder: 'border-rose-500/30',
    twBadge: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    label: 'Emergency & Safety'
  },
  environment: {
    hex: '#22C55E',
    twText: 'text-green-400',
    twBg: 'bg-green-500/10',
    twBorder: 'border-green-500/30',
    twBadge: 'bg-green-500/15 text-green-300 border-green-500/40',
    label: 'Environment & Parks'
  },
  civic: {
    hex: '#A855F7',
    twText: 'text-purple-400',
    twBg: 'bg-purple-500/10',
    twBorder: 'border-purple-500/30',
    twBadge: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    label: 'Civic & Education'
  }
};

export const SUBCATEGORY_COLORS: Record<string, string> = {
  'Government Hospital': '#10B981',
  'Private Hospital (Empanelled)': '#059669',
  'Primary Health Clinic': '#34D399',
  'Metro Station': '#06B6D4',
  'MMTS Suburban Rail Station': '#0284C7',
  'Major Bus Terminal / Hub': '#38BDF8',
  'Police Station': '#F43F5E',
  'Fire Station': '#FB7185',
  'Public Park & Green Space': '#22C55E',
  'Municipal Headquarters': '#A855F7',
  'Urban Planning Authority': '#9333EA',
  'Government Headquarters': '#C084FC',
  'Public University': '#8B5CF6',
  'Central University': '#7C3AED',
  'Autonomous University': '#6366F1',
  'Technical University': '#4F46E5',
  'Management Institute': '#4338CA',
  'Public Library': '#D946EF',
  'National Museum': '#E879F9'
};

export function getCategoryColor(category: CategoryType): string {
  return CATEGORY_COLORS[category]?.hex || '#94A3B8';
}

