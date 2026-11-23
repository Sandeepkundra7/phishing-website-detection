import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  AlertTriangle, 
  Layers, 
  Clock, 
  ExternalLink, 
  Activity, 
  RefreshCw, 
  Lock, 
  User, 
  Trash2, 
  BarChart3
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import RiskBadge from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DashboardPage({ setActiveTab }) {
  const { user, openAuthModal } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sumData = await api.getDashboardSummary();
      setSummary(sumData);
    } catch (err) {
      console.error("Dashboard data load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (user) loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleDeleteScan = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Remove this scan from your personal history?")) {
      await api.deleteScan(id);
      loadData();
    }
  };

  // If user is not authenticated, show modern sign-in required gate
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="cyber-card max-w-md w-full p-8 rounded-2xl border border-cyber-border text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan mx-auto flex items-center justify-center mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Analyst Sign-In Required
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Your personal security dashboard is protected. Sign in with your analyst credentials to view your scanned URLs and threat analytics.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] transition"
          >
            Sign In to Access Dashboard
          </button>
          <div className="mt-4 pt-4 border-t border-cyber-border/70 text-xs text-slate-500">
            Don't have an account? <button onClick={() => openAuthModal('register')} className="text-cyber-cyan hover:underline">Register now</button>
          </div>
        </div>
      </div>
    );
  }

  const total = summary?.total_scanned ?? 0;
  const phishing = summary?.phishing_detected ?? 0;
  const legit = summary?.legitimate_detected ?? 0;
  const highRisk = summary?.high_risk_detected ?? 0;
  const phishPct = total > 0 ? ((phishing / total) * 100).toFixed(1) : "0.0";
  const legitPct = total > 0 ? ((legit / total) * 100).toFixed(1) : "0.0";
  const lowRisk = summary?.risk_distribution?.low ?? legit;
  const medRisk = summary?.risk_distribution?.medium ?? 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-cyber-border">
        <div>
          <div className="flex items-center gap-2 text-cyber-cyan text-xs font-mono uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Personal Threat Intelligence Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Security Dashboard</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyber-border text-slate-300">
              Analyst: {user.username}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry and scanning analytics saved to your personal security account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-cyber-border text-slate-300 hover:text-white transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyber-cyan' : ''}`} />
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition"
          >
            <Globe className="w-4 h-4" />
            <span>Scan New URL</span>
          </button>
        </div>
      </div>

      {/* Account Info Pill */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-cyber-border flex items-center text-xs font-mono">
        <div className="flex items-center gap-3 text-slate-300">
          <User className="w-4 h-4 text-cyber-cyan" />
          <span>Active Session: <strong className="text-white">{user.username}</strong> ({user.email})</span>
        </div>
      </div>

      {/* Top 4 Personal Metric Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="URLs Scanned By You"
          value={total.toLocaleString()}
          icon={Globe}
          color="cyan"
          subtitle="Total websites evaluated"
        />
        <StatsCard
          title="Phishing Targets Detected"
          value={phishing.toLocaleString()}
          icon={ShieldAlert}
          color="red"
          change={`${phishPct}% of your scans`}
          subtitle="Malicious links flagged"
        />
        <StatsCard
          title="Legitimate Verified Sites"
          value={legit.toLocaleString()}
          icon={ShieldCheck}
          color="green"
          change={`${legitPct}% of your scans`}
          subtitle="Authentic safe domains"
        />
        <StatsCard
          title="High-Risk Security Alerts"
          value={highRisk.toLocaleString()}
          icon={AlertTriangle}
          color="yellow"
          subtitle="Critical risk score > 65%"
        />
      </div>

      {/* Charts Section: Threat Distribution & Risk Breakdown */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Distribution Donut */}
        <div className="cyber-card rounded-2xl p-6 border border-cyber-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyber-cyan" />
              Your Threat Ratio Breakdown
            </h3>
            <span className="text-xs font-mono text-slate-400">Total Scans: {total}</span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Proportion of malicious phishing sites versus clean web domains in your scan logs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  className="text-slate-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                />
                {total > 0 && (
                  <>
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      className="text-emerald-500"
                      strokeWidth="4"
                      strokeDasharray={`${legitPct}, 100`}
                      stroke="currentColor"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      className="text-rose-500"
                      strokeWidth="4"
                      strokeDasharray={`${phishPct}, 100`}
                      strokeDashoffset={`-${legitPct}`}
                      stroke="currentColor"
                      fill="none"
                    />
                  </>
                )}
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black font-mono text-white block">
                  {phishPct}%
                </span>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">
                  Threat Ratio
                </span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-200 font-medium">Legitimate Domains</span>
                  </div>
                  <span className="font-mono font-bold text-white">{legit} ({legitPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${legitPct}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-200 font-medium">Phishing Targets</span>
                  </div>
                  <span className="font-mono font-bold text-rose-400">{phishing} ({phishPct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${phishPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Severity Distribution Bar Visualizer */}
        <div className="cyber-card rounded-2xl p-6 border border-cyber-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyber-cyan" />
              Risk Severity Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Avg Conf: <strong className="text-cyber-cyan font-bold">{summary?.average_confidence ?? 0}%</strong>
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Categorization of your analyzed targets based on evaluated threat scores.
          </p>

          <div className="space-y-4 my-2">
            {/* Low Risk */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Low Risk (&lt;35% score)
                </span>
                <span className="font-bold text-white">{lowRisk} scans ({total > 0 ? ((lowRisk/total)*100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${total > 0 ? (lowRisk/total)*100 : 0}%` }} />
              </div>
            </div>

            {/* Medium Risk */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Medium Risk (35% - 65% score)
                </span>
                <span className="font-bold text-white">{medRisk} scans ({total > 0 ? ((medRisk/total)*100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${total > 0 ? (medRisk/total)*100 : 0}%` }} />
              </div>
            </div>

            {/* High Risk */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  High Risk (&gt;65% score)
                </span>
                <span className="font-bold text-white">{highRisk} scans ({total > 0 ? ((highRisk/total)*100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${total > 0 ? (highRisk/total)*100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Recent Scanning Activity Table */}
      <div className="mt-10 cyber-card rounded-2xl p-6 border border-cyber-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyber-cyan" />
              Your Recent Scanned URLs
            </h3>
            <p className="text-xs text-slate-400">
              URLs analyzed and recorded under your personal security account.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-cyber-cyan hover:underline font-mono flex items-center gap-1"
          >
            <span>View Full History</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Website URL</th>
                <th className="pb-3 px-4">Verdict</th>
                <th className="pb-3 px-4">Risk Severity</th>
                <th className="pb-3 px-4">Confidence</th>
                <th className="pb-3 px-4">Timestamp</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/50 text-slate-300">
              {(summary?.recent_activity && summary.recent_activity.length > 0) ? (
                summary.recent_activity.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 pr-4 max-w-xs truncate text-white font-semibold">
                      {item.url}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.prediction === 'Phishing' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={item.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {item.confidence}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(item.scanned_at || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button
                        onClick={(e) => handleDeleteScan(item.id, e)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                        title="Delete scan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-sans">
                    <p className="text-sm">You haven't scanned any websites yet.</p>
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="mt-3 text-xs text-cyber-cyan font-mono hover:underline inline-flex items-center gap-1"
                    >
                      Scan your first website now →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
