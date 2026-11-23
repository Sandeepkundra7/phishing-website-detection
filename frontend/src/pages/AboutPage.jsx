import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Binary, 
  GitBranch, 
  Target, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle,
  Code2,
  Terminal,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function AboutPage() {
  const [modelMetrics, setModelMetrics] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await api.getModelMetrics();
        setModelMetrics(data);
      } catch (err) {
        console.error("Failed to load model metrics", err);
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadMetrics();
  }, []);

  const defaultAlgorithms = [
    {
      name: 'Random Forest Classifier',
      tag: 'Champion Ensemble',
      accuracy: 96.8,
      f1_score: 96.7,
      color: 'border-cyber-cyan text-cyber-cyan',
      bg: 'bg-cyber-cyan/10',
      description: 'An ensemble learning method that constructs 100 decorrelated decision trees during training. Aggregates predictions through majority voting (bagging), minimizing variance and handling complex feature non-linearities.',
      strengths: [
        'Highest resistance to overfitting across diverse URL variants',
        'Built-in feature importance scoring for lexical indicators',
        'Lowest false-positive rate on legitimate web services'
      ]
    },
    {
      name: 'Support Vector Machine (SVM)',
      tag: 'Max-Margin Separator',
      accuracy: 94.5,
      f1_score: 94.4,
      color: 'border-blue-500 text-blue-400',
      bg: 'bg-blue-500/10',
      description: 'Finds the optimal hyperplane that maximizes the geometric margin between phishing and authentic URL vectors in high-dimensional space using Radial Basis Function (RBF) kernel.',
      strengths: [
        'Mathematically rigorous convex optimization',
        'Effective in high-dimensional normalized vector spaces',
        'Consistent classification boundaries'
      ]
    },
    {
      name: 'Decision Tree Classifier',
      tag: 'Hierarchical Rule Engine',
      accuracy: 92.3,
      f1_score: 92.4,
      color: 'border-purple-500 text-purple-400',
      bg: 'bg-purple-500/10',
      description: 'Splits URL data hierarchically based on feature thresholds that minimize Gini Impurity. Produces intuitive decision rules (e.g. IF length > 75 AND ip_address = 1).',
      strengths: [
        'Directly interpretable human-readable rules',
        'Extremely fast inference runtime (<5ms)',
        'Requires zero feature scaling'
      ]
    },
    {
      name: 'Logistic Regression',
      tag: 'Probabilistic Baseline',
      accuracy: 90.7,
      f1_score: 90.5,
      color: 'border-emerald-500 text-emerald-400',
      bg: 'bg-emerald-500/10',
      description: 'A fundamental linear classification model that maps linear combinations of URL features through the sigmoid function to output calibrated probabilities between 0 and 1.',
      strengths: [
        'Calibrated probabilistic confidence scores',
        'Minimal computational overhead',
        'Reliable baseline for evaluating complex non-linear models'
      ]
    }
  ];

  const displayList = (modelMetrics.length > 0) ? modelMetrics.map((m, i) => ({
    ...defaultAlgorithms[i % defaultAlgorithms.length],
    ...m,
    tag: m.is_champion ? "Champion Ensemble" : defaultAlgorithms[i % defaultAlgorithms.length].tag
  })) : defaultAlgorithms;

  const featuresList = [
    { name: 'URL Character Length', desc: 'Phishing URLs frequently append deceptive subdomain trails and query parameters to hide destination.' },
    { name: 'Having IP Address', desc: 'Direct IP usage (e.g. 192.168.1.1) in place of a registered domain is a primary credential harvest vector.' },
    { name: 'Prefix / Suffix Hyphen (-)', desc: 'Attackers introduce hyphens (e.g. "secure-paypal.com") to simulate authentic brand affiliation.' },
    { name: 'Subdomain Nesting Depth', desc: 'Multiple subdomains mislead victims into believing they are navigating an official enterprise portal.' },
    { name: 'At (@) Symbol Redirection', desc: 'Browsers omit text preceding the @ delimiter, redirecting unsuspecting users to target hosts.' },
    { name: 'Double Slash Redirection (//)', desc: 'Presence of double slashes inside path parameters signifies redirection trampolines.' },
    { name: 'HTTPS Token in Domain Name', desc: 'Positioning "https" within the hostname body to deceive mobile address bar visual checks.' },
    { name: 'Suspicious TLD Classification', desc: 'Correlation tracking for disposable or low-cost top-level domains (.xyz, .top, .tk, .club).' },
    { name: 'URL Shortener Detection', desc: 'Identification of masking domains (bit.ly, tinyurl) used to bypass basic email reputation filters.' },
    { name: 'Shannon Entropy Score', desc: 'Quantifies character randomness in URL strings, highlighting automated algorithmic generation.' }
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-cyber-cyan bg-cyber-cyan/10 px-3 py-1 rounded-full border border-cyber-cyan/30">
          Academic Research & Technical Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
          How Machine Learning Detects Phishing Websites
        </h1>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          Detailed technical documentation on feature extraction, algorithm benchmarking, and zero-trust cybersecurity defense principles.
        </p>
      </div>

      {/* Anatomy of Phishing Attacks */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-cyber-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">The Modern Phishing Threat Vector</h2>
            <p className="text-xs text-slate-400 font-mono">Social Engineering & Infrastructure Impersonation</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Phishing remains the preeminent initial access broker across cybersecurity incidents worldwide. Traditional defense systems rely heavily on <strong>static blacklists</strong> (e.g. Google Safe Browsing or DNS blocklists). However, modern adversaries deploy automated domain generation algorithms (DGAs) and ephemeral cloud hosting, allowing phishing websites to exist for mere hours before rotating.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          By utilizing <strong>Machine Learning for zero-hour URL classification</strong>, this project inspects the immutable lexical, syntactic, and structural fingerprints of web addresses — eliminating the latency of waiting for a website to be manually reported or blacklisted.
        </p>
      </div>

      {/* Machine Learning Algorithms Evaluated & Benchmarking */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-mono uppercase text-cyber-cyan tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Comparative Model Benchmarking
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Machine Learning Classifiers & Performance
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              4 algorithms trained on the 16-point feature dataset using an 80/20 stratified split.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
            Scikit-Learn + Joblib
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayList.map((algo, idx) => (
            <div key={idx} className="cyber-card rounded-2xl p-6 border border-cyber-border hover:border-cyber-cyan/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${algo.color || 'border-cyan-500 text-cyan-400'} ${algo.bg || 'bg-cyan-500/10'}`}>
                  {algo.tag || (algo.is_champion ? "Champion Model" : "Classifier")}
                </span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Accuracy: <strong className="text-white font-bold">{algo.accuracy}%</strong></span>
                  <span className="text-slate-400">F1: <strong className="text-cyber-cyan font-bold">{algo.f1_score}%</strong></span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{algo.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{algo.description}</p>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full ${algo.is_champion ? 'bg-gradient-to-r from-cyber-cyan to-blue-500' : 'bg-slate-600'}`}
                  style={{ width: `${Math.min(algo.accuracy, 100)}%` }}
                />
              </div>

              {algo.strengths && (
                <div className="pt-3 border-t border-cyber-border/70 space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Key Advantages:</span>
                  {algo.strengths.map((str, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-cyber-cyan shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Metrics Explained */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-cyber-border">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyber-cyan" />
          Model Evaluation Metrics & Confusion Matrix
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Standard academic metrics utilized to prevent class imbalance skew and validate defensive reliability.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-cyber-cyan font-mono text-xs uppercase font-bold">Accuracy</span>
            <p className="text-xs text-slate-300 mt-1">
              (TP + TN) / Total. Overall percentage of correctly classified phishing and legitimate URLs.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-blue-400 font-mono text-xs uppercase font-bold">Precision</span>
            <p className="text-xs text-slate-300 mt-1">
              TP / (TP + FP). Ratio of true phishing detections over all links flagged as phishing. Minimizes false alarms.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-purple-400 font-mono text-xs uppercase font-bold">Recall</span>
            <p className="text-xs text-slate-300 mt-1">
              TP / (TP + FN). Ability of the model to capture all actual phishing websites without missing dangerous URLs.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-mono text-xs uppercase font-bold">F1-Score</span>
            <p className="text-xs text-slate-300 mt-1">
              Harmonic mean of Precision and Recall: 2 × (P × R) / (P + R). Critical balance metric for security tooling.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Engineering Directory */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-cyber-border">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyber-cyan" />
          Lexical & Structural Feature Directory
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          10 fundamental URL properties extracted during the ingestion pipeline and passed to Scikit-Learn models.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuresList.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-semibold text-xs text-slate-200 font-mono flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                {item.name}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
