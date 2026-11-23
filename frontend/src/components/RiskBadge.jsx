import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskBadge({ level, size = 'md' }) {
  const normalized = (level || 'Low').toLowerCase();

  const configs = {
    high: {
      label: 'High Risk',
      bg: 'bg-rose-950/60 border-rose-500/50 text-rose-400',
      dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
      icon: ShieldAlert
    },
    medium: {
      label: 'Medium Risk',
      bg: 'bg-amber-950/60 border-amber-500/50 text-amber-400',
      dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
      icon: AlertTriangle
    },
    low: {
      label: 'Low Risk',
      bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400',
      dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      icon: ShieldCheck
    }
  };

  const config = configs[normalized] || configs.low;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs font-semibold gap-2',
    lg: 'px-4 py-1.5 text-sm font-bold gap-2.5'
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]} backdrop-blur-sm`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${config.dot}`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  );
}
