import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ScanHistoryPage from './pages/ScanHistoryPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'dashboard' | 'history'

  return (
    <AuthProvider>
      <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col relative overflow-x-hidden cyber-grid selection:bg-cyber-cyan selection:text-slate-950">
        {/* Ambient Top Glow Orbs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed top-1/3 right-10 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Global Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page Views */}
        <main className="flex-grow">
          {activeTab === 'scanner' && <HomePage setActiveTab={setActiveTab} />}
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'history' && <ScanHistoryPage setActiveTab={setActiveTab} />}
        </main>

        {/* Global Auth Modal */}
        <AuthModal />

        {/* Global Cybersecurity Footer */}
        <Footer />
      </div>
    </AuthProvider>
  );
}
