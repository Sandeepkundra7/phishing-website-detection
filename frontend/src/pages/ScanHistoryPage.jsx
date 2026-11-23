import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Filter, 
  ExternalLink, 
  AlertOctagon, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Layers,
  X,
  RefreshCw,
  Lock,
  Database
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FeatureBreakdown from '../components/FeatureBreakdown';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ScanHistoryPage({ setActiveTab }) {
  const { user, openAuthModal } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('all'); // all | phishing | legitimate | high_risk
  const [selectedScan, setSelectedScan] = useState(null);

  const loadHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getScanHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this scan record from your PostgreSQL history?")) {
      await api.deleteScan(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedScan?.id === id) {
        setSelectedScan(null);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all your scanning history from the database? This cannot be undone.")) {
      await api.clearHistory();
      setHistory([]);
      setSelectedScan(null);
    }
  };

  // If not authenticated, show sign-in gate
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="cyber-card max-w-md w-full p-8 rounded-2xl border border-cyber-border text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan mx-auto flex items-center justify-center mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Scan History Protected
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Please sign in to inspect your previously analyzed URLs, examine feature matrices, and audit your personal scan records.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] transition"
          >
            Sign In to View History
          </button>
        </div>
      </div>
    );
  }

  // Filter logic
  const filtered = history.filter(item => {
    const matchesSearch = item.url.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterVerdict === 'phishing') return item.prediction === 'Phishing';
    if (filterVerdict === 'legitimate') return item.prediction === 'Legitimate';
    if (filterVerdict === 'high_risk') return item.risk_level === 'High';
    return true;
  });

  const getSafeFeatures = (item) => {
    if (!item || !item.features) return null;
    if (typeof item.features === 'string') {
      try {
        return JSON.parse(item.features);
      } catch {
        return null;
      }
    }
    return item.features;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-cyber-border">
        <div>
          <div className="flex items-center gap-2 text-cyber-cyan text-xs font-mono uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Audit & Scan Logs</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Historical Scan Registry</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyber-border text-slate-300">
              User: {user.username}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit log of URLs analyzed under your account, complete with extracted feature matrices and classification outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadHistory}
            className="p-2.5 rounded-xl bg-slate-900 border border-cyber-border text-slate-300 hover:text-white transition"
            title="Refresh Scan Log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyber-cyan' : ''}`} />
          </button>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 text-rose-400 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4 text-cyber-cyan" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your scanned URLs or domains..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyber-border focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-xs text-white placeholder-slate-500 font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Scans' },
            { id: 'phishing', label: 'Phishing Only' },
            { id: 'legitimate', label: 'Legitimate Only' },
            { id: 'high_risk', label: 'High Risk Only' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterVerdict(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterVerdict === pill.id
                  ? 'bg-cyber-cyan text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-cyber-border'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="mt-6 cyber-card rounded-2xl border border-cyber-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/60 border-b border-cyber-border text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-6">Analyzed Website URL</th>
                <th className="py-3.5 px-4">Verdict</th>
                <th className="py-3.5 px-4">Risk Severity</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Scan Timestamp</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40 text-slate-300">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedScan(item)}
                    className="hover:bg-slate-900/50 cursor-pointer transition group"
                  >
                    <td className="py-4 px-6 max-w-sm sm:max-w-md truncate text-white font-medium group-hover:text-cyber-cyan transition">
                      <div className="flex items-center gap-2">
                        {item.prediction === 'Phishing' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span className="truncate">{item.url}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        item.prediction === 'Phishing' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <RiskBadge level={item.risk_level} size="sm" />
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-100">
                      {item.confidence}%
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {new Date(item.scanned_at || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedScan(item); }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyber-cyan border border-cyber-border text-xs transition"
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                          title="Delete entry from PostgreSQL"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <p className="text-sm">No scanning records match the current filter criteria.</p>
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="mt-3 text-xs text-cyber-cyan font-mono hover:underline"
                    >
                      Scan a website now →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className={`p-2.5 rounded-xl border ${
                selectedScan.prediction === 'Phishing' 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {selectedScan.prediction === 'Phishing' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    {selectedScan.prediction.toUpperCase()} SCAN REPORT
                  </h3>
                  <RiskBadge level={selectedScan.risk_level} size="md" />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Logged on {new Date(selectedScan.scanned_at || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-cyber-border font-mono text-xs text-slate-200 break-all select-all mb-6">
              {selectedScan.url}
            </div>

            <FeatureBreakdown features={getSafeFeatures(selectedScan)} />

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
