import React from 'react';

export default function StatsCard({ title, value, icon: Icon, color = 'cyan', change, subtitle }) {
  const colorStyles = {
    cyan: {
      border: 'border-cyber-border hover:border-cyber-cyan/50',
      iconBg: 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]'
    },
    red: {
      border: 'border-cyber-border hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]'
    },
    green: {
      border: 'border-cyber-border hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    },
    yellow: {
      border: 'border-cyber-border hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
    },
    blue: {
      border: 'border-cyber-border hover:border-blue-500/50',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]'
    }
  };

  const style = colorStyles[color] || colorStyles.cyan;

  return (
    <div className={`cyber-card rounded-2xl p-5 border transition-all duration-300 group ${style.border} ${style.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${style.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span className="text-xs font-semibold text-emerald-400">
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
