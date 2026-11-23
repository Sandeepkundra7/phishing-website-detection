import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Lock, 
  ArrowRight, 
  Search, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import UrlScanner from '../components/UrlScanner';
import ScanResultCard from '../components/ScanResultCard';
import SecurityTips from '../components/SecurityTips';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function HomePage({ setActiveTab }) {
  const { user, openAuthModal } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (url) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const [result] = await Promise.all([
        api.scanUrl(url),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      setScanResult(result);
    } catch (err) {
      console.error("Scan error:", err);
      if (err.message && err.message.includes('Authentication')) {
        openAuthModal('login');
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>Real-Time Neural Heuristic Detection Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          AI-Based Phishing Website Detection <br />
          <span className="bg-gradient-to-r from-cyber-cyan via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Using Machine Learning
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Safeguard users against credential harvesting, deceptive lookalike domains, and zero-day social engineering attacks through algorithmic URL feature extraction and ensemble classification.
        </p>

        {/* Key Benchmark Highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyber-border">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>96.8% Model Accuracy</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyber-border">
            <Cpu className="w-4 h-4 text-cyber-cyan" />
            <span>High-Precision AI Engine</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyber-border">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Zero Outbound Payload Risk</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <UrlScanner onScan={handleScan} isScanning={isScanning} />

      {/* Live Scan Results */}
      {scanResult && <ScanResultCard result={scanResult} />}

      {/* 3-Step Detection Pipeline */}
      <div className="mt-20 pt-16 border-t border-cyber-border/60">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-cyber-cyan">
            Detection Pipeline
          </span>
          <h3 className="text-2xl font-bold text-white mt-2">
            How The AI System Identifies Phishing Sites
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cyber-card rounded-2xl p-6 border border-cyber-border relative">
            <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center font-mono font-bold mb-4">
              01
            </div>
            <h4 className="text-base font-semibold text-white mb-2">
              Lexical & Structural Extraction
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstructs the target URL into 16+ mathematical indicators including entropy, IP host indicators, '@' symbols, subdomain nesting, prefix-suffix hyphens, and suspicious TLD patterns.
            </p>
          </div>

          <div className="cyber-card rounded-2xl p-6 border border-cyber-border relative">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-bold mb-4">
              02
            </div>
            <h4 className="text-base font-semibold text-white mb-2">
              AI Vector Classification
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Feeds normalized feature vectors through our trained cybersecurity classification engine to reliably discern authentic web domains from malicious spoofing attempts.
            </p>
          </div>

          <div className="cyber-card rounded-2xl p-6 border border-cyber-border relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold mb-4">
              03
            </div>
            <h4 className="text-base font-semibold text-white mb-2">
              Risk Scoring & Actionable Advisory
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Produces a definitive prediction (Phishing vs Legitimate), confidence probability metric, risk severity rating (Low/Medium/High), and threat mitigation guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Security Awareness Tips */}
      <SecurityTips />
    </div>
  );
}
