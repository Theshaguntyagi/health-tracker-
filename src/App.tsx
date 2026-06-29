import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Dashboard } from './components/Dashboard';
import { WeightTracker } from './components/WeightTracker';
import { FoodLogger } from './components/FoodLogger';
import { WaterTracker } from './components/WaterTracker';
import { SleepTracker } from './components/SleepTracker';
import { ActivityTracker } from './components/ActivityTracker';
import { ProgressPhotos } from './components/ProgressPhotos';
import { HealthRecords } from './components/HealthRecords';
import { AIReports } from './components/AIReports';
import { AIChatCoach } from './components/AIChatCoach';
import { Settings } from './components/Settings';
import { 
  LayoutDashboard, Scale, Apple, Droplet, Moon, 
  Dumbbell, Camera, Heart, Sparkles, MessageSquare, 
  Settings as SettingsIcon, Menu, X, Flame, Sun, Moon as DarkIcon, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Login } from './components/Login';

const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, getStreak, settings, updateSettings, user, loading, signOut } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const streak = getStreak();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'weight', label: 'Weight Tracker', icon: Scale },
    { id: 'food', label: 'AI Food Logger', icon: Apple },
    { id: 'water', label: 'Water Tracker', icon: Droplet },
    { id: 'sleep', label: 'Sleep Tracker', icon: Moon },
    { id: 'activity', label: 'Activity Tracker', icon: Dumbbell },
    { id: 'photos', label: 'Progress Photos', icon: Camera },
    { id: 'records', label: 'Health Records', icon: Heart },
    { id: 'reports', label: 'AI Reports', icon: Sparkles },
    { id: 'chat', label: 'AI Chat Coach', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Render active component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'weight': return <WeightTracker />;
      case 'food': return <FoodLogger />;
      case 'water': return <WaterTracker />;
      case 'sleep': return <SleepTracker />;
      case 'activity': return <ActivityTracker />;
      case 'photos': return <ProgressPhotos />;
      case 'records': return <HealthRecords />;
      case 'reports': return <AIReports />;
      case 'chat': return <AIChatCoach />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-455">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const activeLabel = navItems.find(item => item.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark transition-colors duration-300 flex">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 h-screen p-6 justify-between z-20">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-xl shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Health</span>
              <span className="font-black text-brand-500 text-lg tracking-tight">AI</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/15'
                      : 'text-slate-550 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/40 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                  {item.id === 'reports' && (
                    <span className="absolute right-2 top-2.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-500 text-sm">
              S
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">Shagun</div>
              <div className="text-[9px] text-slate-450 mt-0.5 font-bold uppercase tracking-wider">Goal: 80kg</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
              className="p-2 bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 border border-slate-200/40 dark:border-slate-700/30 text-slate-500 dark:text-slate-400 rounded-xl transition-all"
              title="Toggle Theme"
            >
              {settings.theme === 'light' ? <DarkIcon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={signOut}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & BOTTOM NAV */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/45 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-black text-slate-850 dark:text-white text-base tracking-tight">{activeLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {streak}d
            </div>
            
            {/* More Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-250/20 text-slate-600 dark:text-slate-300 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8 overflow-y-auto max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Tab Bar (Quick Access 5 main tabs) */}
        <nav className="lg:hidden sticky bottom-0 border-t border-slate-200/50 dark:border-slate-800/40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-lg flex justify-between items-center pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] px-4 z-20 shadow-xl">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'weight', label: 'Weight', icon: Scale },
            { id: 'food', label: 'Food', icon: Apple },
            { id: 'chat', label: 'Coach', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center flex-1 py-1"
              >
                <Icon className={`w-5 h-5 transition-all ${isActive ? 'text-brand-500 scale-110' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-brand-500' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. MOBILE FULL DRAWER MENU (For other trackers) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div 
              className="relative w-80 max-w-xs h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-6 flex flex-col justify-between z-10"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-500" />
                    <span className="font-black text-slate-800 dark:text-white">More Trackers</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/15'
                            : 'text-slate-550 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/40 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-slate-250/20 pt-4 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Theme</span>
                <button
                  onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200/50 p-2 rounded-xl text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xs font-bold"
                >
                  {settings.theme === 'light' ? <DarkIcon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <Navigation />
    </DataProvider>
  );
}
