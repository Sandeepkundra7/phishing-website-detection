import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertOctagon, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function FeatureBreakdown({ features }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!features) return null;

  const featureItems = [
    {
      name: 'IP Address as Host',
      value: features.having_ip_address ? 'Detected (High Risk)' : 'Standard Hostname',
      isAnomaly: Boolean(features.having_ip_address),
      detail: 'Attackers frequently use direct IP addresses to bypass domain reputation engines.'
    },
    {
      name: 'URL Character Length',
      value: `${features.url_length || 0} chars`,
      isAnomaly: (features.url_length || 0) > 75,
      detail: features.url_length > 75 ? 'Abnormally long URL (>75 chars) used to conceal payload target.' : 'Normal length.'
    },
    {
      name: 'Subdomain Depth',
      value: `${features.sub_domain_count || 0} level(s)`,
      isAnomaly: (features.sub_domain_count || 0) > 2,
      detail: 'Multiple nested subdomains frequently impersonate institutional sub-branches.'
    },
    {
      name: 'SSL / Protocol State',
      value: features.ssl_state || 'Standard',
      isAnomaly: typeof features.ssl_state === 'string' && features.ssl_state.includes('HTTP (Insecure)'),
      detail: 'Phishing attacks often lack verified HTTPS transport layers.'
    },
    {
      name: 'Domain Prefix-Suffix Hyphen',
      value: features.prefix_suffix_hyphen ? 'Present (-)' : 'None',
      isAnomaly: Boolean(features.prefix_suffix_hyphen),
      detail: 'Hyphens in domains (e.g., paypal-verification) indicate typosquatting.'
    },
    {
      name: 'At (@) Symbol Redirection',
      value: features.having_at_symbol ? 'Detected (@)' : 'None',
      isAnomaly: Boolean(features.having_at_symbol),
      detail: 'Browsers ignore characters preceding @, masking malicious destination.'
    },
    {
      name: 'Suspicious TLD Extension',
      value: features.suspicious_tld ? 'Detected (.xyz/.top/etc)' : 'Standard TLD',
      isAnomaly: Boolean(features.suspicious_tld),
      detail: 'High correlation with cheap or disposable domains used in burst phishing.'
    },
    {
      name: 'URL Shortener Service',
      value: features.shortening_service ? 'Shortened URL' : 'Direct URL',
      isAnomaly: Boolean(features.shortening_service),
      detail: 'URL shorteners (bit.ly, tinyurl) mask final redirect locations.'
    },
    {
      name: 'HTTPS Token in Domain Name',
      value: features.https_in_domain ? 'Present in Domain' : 'Proper Location',
      isAnomaly: Boolean(features.https_in_domain),
      detail: 'Deceptively placing "https" inside hostname to trick visual inspection.'
    },
    {
      name: 'Security Keyword Triggers',
      value: features.suspicious_keywords_found > 0 ? `${features.suspicious_keywords_found} keyword(s)` : 'None detected',
      isAnomaly: (features.suspicious_keywords_found || 0) > 0,
      detail: features.matched_keywords && features.matched_keywords.length > 0 
        ? `Keywords: ${features.matched_keywords.join(', ')}` 
        : 'No deceptive authentication keywords found.'
    }
  ];

  return (
    <div className="cyber-card rounded-xl p-5 border border-cyber-border mt-6">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              Extracted URL Lexical & Structural Features
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                10 Scored Indicators
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Heuristic patterns extracted and vectorized for machine learning classification.
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-cyber-border/70">
          {featureItems.map((item, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-lg border transition-all text-sm ${
                item.isAnomaly 
                  ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60' 
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-300 text-xs">{item.name}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  item.isAnomaly ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {item.isAnomaly ? <AlertOctagon className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {item.value}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
