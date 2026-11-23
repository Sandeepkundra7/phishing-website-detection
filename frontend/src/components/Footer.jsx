import React from 'react';
import { ShieldCheck, Cpu, Database, Server, Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cyber-border bg-slate-950/70 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyber-cyan" />
              <span className="text-sm font-bold text-white tracking-wider">
                AI-BASED PHISHING WEBSITE DETECTION
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A comprehensive cybersecurity full-stack application developed for advanced machine learning analysis of deceptive web targets. Utilizing 16+ lexical and structural URL attributes to identify zero-day phishing risks before user credentials can be compromised.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyber-border text-[11px] font-mono text-cyan-400">
                Threat Analysis
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyber-border text-[11px] font-mono text-emerald-400">
                URL Forensics
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyber-border text-[11px] font-mono text-blue-400">
                Zero-Day Protection
              </span>
            </div>
          </div>

          {/* Technology Architecture */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 font-mono text-xs uppercase tracking-wider">
              System Architecture
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Frontend: React + Tailwind CSS</span>
              </li>
              <li className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Backend: Python FastAPI REST</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Engine: PhishShield AI Core</span>
              </li>
            </ul>
          </div>

          {/* Safety & Academic Disclaimer */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 font-mono text-xs uppercase tracking-wider">
              Safety Protocols
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              This system executes lexical feature extraction only. It never triggers client-side JavaScript execution or opens uncontrolled HTTP sockets to suspected malware distribution points.
            </p>
            <span className="inline-block text-[11px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-1 rounded border border-cyber-cyan/20">
              AIDL Capstone Evaluation Project
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-cyber-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} PhishShield AI. Built for Academic & Cybersecurity Defense Demonstration.
          </div>
          <div className="flex items-center gap-4">
            <span>Non-Intrusive Scanning</span>
            <span>•</span>
            <span>Zero-Trust Architecture</span>
            <span>•</span>
            <span>v1.0.0 Stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
