import React, { useState } from 'react';
import { Search, Loader2, Globe, Shield, Sparkles, AlertCircle, RefreshCw, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UrlScanner({ onScan, isScanning }) {
  const { user, openAuthModal } = useAuth();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const sampleUrls = [
    { label: 'Google Search', url: 'https://www.google.com/search?q=machine+learning', type: 'legit' },
    { label: 'GitHub Login', url: 'https://github.com/login', type: 'legit' },
    { label: 'Suspicious IP Host', url: 'http://192.168.1.45/account/update.php', type: 'phish' },
    { label: 'Spoofed Brand (.xyz)', url: 'http://paypal-security-verification.xyz/login', type: 'phish' },
    { label: 'Deep Nested Subdomain', url: 'http://secure.banking.portal.login-verify.tk/auth', type: 'phish' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Enforce authentication
    if (!user) {
      setError('Authentication required: Please sign in or register to scan URLs.');
      openAuthModal('login');
      return;
    }

    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError('Please enter a website URL to analyze.');
      return;
    }

    if (!cleanUrl.includes('.') || cleanUrl.length < 4) {
      setError('Invalid URL format. Please enter a valid domain or web address.');
      return;
    }

    setError('');
    onScan(cleanUrl);
  };

  const loadSample = (sampleUrl) => {
    if (!user) {
      setError('Authentication required: Please sign in or register to scan URLs.');
      openAuthModal('login');
      return;
    }
    setUrl(sampleUrl);
    setError('');
    onScan(sampleUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="cyber-card p-6 md:p-8 rounded-2xl border border-cyber-border/80 shadow-cyan-glow/20 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyber-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-cyber-cyan text-xs font-mono tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>AI Neural Inference Engine</span>
            </div>
            {user ? (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Authorized: <strong>{user.username}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>Login Required to Scan</span>
              </div>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Scan Suspicious Website URL
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Input any suspicious link to evaluate its lexical indicators, domain spoofing patterns, and zero-day phishing characteristics.
          </p>

          {/* Unauthenticated Security Banner */}
          {!user && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sign in with your analyst account to scan URLs and automatically store results in your dashboard.</span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-lg bg-cyber-cyan text-slate-950 font-bold text-xs shrink-0 hover:bg-cyan-400 transition"
              >
                Sign In Now
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-5 h-5 text-cyber-cyan" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder={user ? "Enter URL to inspect (e.g. http://paypal-verify-account.xyz/login)" : "Sign in to unlock URL scanning..."}
                className="w-full pl-12 pr-36 py-4 rounded-xl bg-slate-900/90 border border-cyber-border focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/30 text-white placeholder-slate-500 font-mono text-sm transition shadow-inner"
                disabled={isScanning}
              />
              <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                <button
                  type="submit"
                  disabled={isScanning}
                  className="h-full px-6 rounded-lg bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Analyzing...</span>
                    </>
                  ) : !user ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Scan</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Scan URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-xs mt-2 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Quick Test Samples */}
          <div className="mt-6 pt-5 border-t border-cyber-border/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-cyber-cyan" />
                One-Click Test Samples:
              </span>
              <span className="text-[11px] text-slate-500">
                {user ? "Click any sample to test detection instantly" : "Sign in required to execute test samples"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleUrls.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(sample.url)}
                  disabled={isScanning}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-mono flex items-center gap-1.5 ${
                    sample.type === 'legit'
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/40'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-400 hover:bg-rose-900/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sample.type === 'legit' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Safe Browsing Policy Reminder */}
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-cyber-cyan shrink-0" />
            <span>
              Zero-Trust Architecture: URLs are scanned lexically without opening live outbound sockets or executing scripts.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
