import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  Info,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import RiskBadge from './RiskBadge';
import FeatureBreakdown from './FeatureBreakdown';

export default function ScanResultCard({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const isPhishing = result.prediction?.toLowerCase() === 'phishing';
  const confidence = result.confidence || 95.0;
  const isHighRisk = result.risk_level?.toLowerCase() === 'high';

  const copyUrl = () => {
    navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`mt-8 rounded-2xl p-6 lg:p-8 transition-all duration-500 border ${
      isPhishing 
        ? 'bg-gradient-to-b from-rose-950/40 via-cyber-card to-cyber-card border-rose-500/40 shadow-red-glow' 
        : 'bg-gradient-to-b from-emerald-950/30 via-cyber-card to-cyber-card border-emerald-500/40 shadow-green-glow'
    }`}>
      {/* Top Banner Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl border ${
            isPhishing 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {isPhishing ? (
              <ShieldAlert className="w-10 h-10 animate-bounce" />
            ) : (
              <ShieldCheck className="w-10 h-10" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                isPhishing ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isPhishing ? 'PHISHING WEBSITE DETECTED' : 'LEGITIMATE WEBSITE DETECTED'}
              </span>
              <RiskBadge level={result.risk_level} size="lg" />
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isPhishing 
                ? 'High probability of social engineering, credential harvesting, or domain spoofing.' 
                : 'URL structure aligns with authentic web standards and verified service patterns.'}
            </p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-cyber-border flex items-center gap-4 min-w-[200px] justify-between">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
              ML Confidence
            </span>
            <span className="text-2xl font-black font-mono text-white">
              {confidence}%
            </span>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isPhishing ? 'text-rose-500' : 'text-emerald-400'}
                strokeDasharray={`${confidence}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-slate-300">
              {Math.round(confidence)}%
            </span>
          </div>
        </div>
      </div>

      {/* Scanned URL Information */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-cyber-border/80 font-mono text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          {result.url.startsWith('https') ? (
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-slate-400 shrink-0">Analyzed Target:</span>
          <span className="text-slate-100 font-semibold truncate select-all">{result.url}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>
      </div>

      {/* Security Advisory & Recommendations */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-cyber-cyan" />
          Security Advisories & Guidance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(result.recommendations || []).map((tip, idx) => (
            <div 
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                isPhishing 
                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-200' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-300'
              }`}
            >
              <div className={`mt-0.5 p-1 rounded-full ${isPhishing ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isPhishing ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              </div>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Analysis Breakdown */}
      <FeatureBreakdown features={result.features} />

      {/* Metadata Footer */}
      <div className="mt-6 pt-4 border-t border-cyber-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Security Engine: <strong className="text-slate-200 font-mono">PhishShield AI Core</strong></span>
          {result.source && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
              {result.source}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Scanned: <span className="text-slate-300 font-mono">{new Date(result.scanned_at || Date.now()).toLocaleTimeString()}</span></span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-400 border border-slate-700">
            Non-Intrusive Lexical Analysis
          </span>
        </div>
      </div>
    </div>
  );
}
