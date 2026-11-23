import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        if (!username || !password) {
          throw new Error('Please fill in both username and password.');
        }
        await login(username, password);
      } else {
        if (!username || !email || !password) {
          throw new Error('Please fill in all registration fields.');
        }
        if (!email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        await register(username, email, password);
      }
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('analyst');
    setEmail('analyst@phishshield.internal');
    setPassword('SecurityPass2026!');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan mx-auto flex items-center justify-center mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {authMode === 'login' ? 'Security Portal Sign In' : 'Create Analyst Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'login' 
              ? 'Access your saved URL scan history and security analytics.' 
              : 'Register to monitor scanning telemetry and isolate threat URLs.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex rounded-xl bg-slate-900/80 p-1 border border-cyber-border mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              authMode === 'login' ? 'bg-cyber-cyan text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              authMode === 'register' ? 'bg-cyber-cyan text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4 text-cyber-cyan" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. security_admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-cyber-border focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-sm text-white placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4 text-cyber-cyan" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-cyber-border focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-sm text-white placeholder-slate-500 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4 text-cyber-cyan" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-cyber-border focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan text-sm text-white placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{authMode === 'login' ? 'Authorize Session' : 'Create Free Account'}</span>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill */}
        <div className="mt-4 pt-4 border-t border-cyber-border/70 text-center">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-xs text-cyber-cyan hover:underline font-mono"
          >
            ⚡ Auto-Fill Demo Credentials (Academic Evaluation)
          </button>
        </div>
      </div>
    </div>
  );
}
