import React from 'react';
import { ShieldAlert, Fingerprint, Eye, Lock, BellRing, KeyRound } from 'lucide-react';

export default function SecurityTips() {
  const tips = [
    {
      icon: Eye,
      title: 'Inspect Hostname Anatomy',
      description: 'Phishers use deceptive subdomains such as "paypal.com.account-update.xyz". The actual domain is the segment immediately preceding the top-level extension (.xyz), not the leading keyword.'
    },
    {
      icon: Fingerprint,
      title: 'Spot Typosquatting Tricks',
      description: 'Attackers register lookalike domains with subtle misspellings (e.g. "arnazon.com" or "g00gle.com") or homoglyph characters that appear indistinguishable at a glance.'
    },
    {
      icon: Lock,
      title: 'SSL Lock Myth',
      description: 'Free automated certificates allow over 80% of phishing sites to display a valid green HTTPS padlock. HTTPS only encrypts the wire; it does not verify site legitimacy.'
    },
    {
      icon: BellRing,
      title: 'Urgency & Coercion Flags',
      description: 'Phishing campaigns exploit manufactured panic ("Account suspended within 24 hours!", "Unauthorized login detected") to bypass logical skepticism.'
    },
    {
      icon: KeyRound,
      title: 'Never Share MFA Codes',
      description: 'Modern Reverse-Proxy phishing toolkits (like Evilginx) intercept session cookies and 2FA codes in real-time. Only enter credentials on bookmarked authentic portals.'
    },
    {
      icon: ShieldAlert,
      title: 'Zero-Trust Verification',
      description: 'When receiving an unexpected verification link via email or SMS, navigate to the organization website independently rather than following direct links.'
    }
  ];

  return (
    <div className="mt-16">
      <div className="text-center mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-cyber-cyan bg-cyber-cyan/10 px-3 py-1 rounded-full border border-cyber-cyan/30">
          Cyber Defense Awareness
        </span>
        <h3 className="text-2xl font-bold text-white mt-3">
          Recognizing Modern Phishing Vectors
        </h3>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
          Machine learning identifies mathematical URL anomalies, but human awareness provides the essential first line of perimeter defense.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tips.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <div 
              key={idx} 
              className="cyber-card rounded-2xl p-6 border border-cyber-border hover:border-cyber-cyan/40 transition duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-cyber-border flex items-center justify-center text-cyber-cyan mb-4 group-hover:scale-110 group-hover:border-cyber-cyan/50 transition">
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2 group-hover:text-cyber-cyan transition">
                {tip.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tip.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
