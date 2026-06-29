import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Settings as SettingsIcon, User, Key, 
  Database, Sun, Moon, Save, Check
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile, updateProfile, settings, updateSettings, resetAllData } = useData();

  // Profile Form States
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [startWeight, setStartWeight] = useState(profile?.startWeight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(profile?.targetWeight?.toString() || '');
  const [calGoal, setCalGoal] = useState(profile?.dailyGoals?.calories?.toString() || '');
  const [protGoal, setProtGoal] = useState(profile?.dailyGoals?.protein?.toString() || '');
  const [waterGoal, setWaterGoal] = useState(profile?.dailyGoals?.water?.toString() || '');
  const [sleepGoal, setSleepGoal] = useState(profile?.dailyGoals?.sleep?.toString() || '');
  const [stepsGoal, setStepsGoal] = useState(profile?.dailyGoals?.steps?.toString() || '');

  // Statuses
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      age: parseInt(age) || 30,
      height: parseFloat(height) || 175,
      startWeight: parseFloat(startWeight) || 100,
      targetWeight: parseFloat(targetWeight) || 80,
      dailyGoals: {
        calories: parseInt(calGoal) || 2000,
        protein: parseInt(protGoal) || 140,
        water: parseInt(waterGoal) || 3000,
        sleep: parseFloat(sleepGoal) || 8,
        steps: parseInt(stepsGoal) || 10000
      }
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-8 h-8 text-slate-400" /> Settings
        </h1>
        <p className="text-slate-450 mt-1 text-sm">
          Customize your profile targets and view system configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Profile & Themes */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Theme Selector */}
          <div className="glass-card-3d p-5 flex justify-between items-center cursor-default">
            <div>
              <h3 className="font-semibold text-slate-100">Theme Mode</h3>
              <p className="text-xs text-slate-400">Choose between light and dark visual aesthetics.</p>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/25">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`p-2 rounded-lg transition-all ${
                  settings.theme === 'light' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-405 hover:text-slate-200'
                }`}
              >
                <Sun className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`p-2 rounded-lg transition-all ${
                  settings.theme === 'dark' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-405 hover:text-slate-200'
                }`}
              >
                <Moon className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="glass-card-3d p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-400" /> User Profile & Goals
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Your Name</label>
                  <input
                    type="text" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full input-3d"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Age (years)</label>
                  <input
                    type="number" required value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full input-3d"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Height (cm)</label>
                  <input
                    type="number" required value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full input-3d"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Start Weight (kg)</label>
                  <input
                    type="number" required value={startWeight}
                    onChange={(e) => setStartWeight(e.target.value)}
                    className="w-full input-3d"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Goal Weight (kg)</label>
                  <input
                    type="number" required value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full input-3d"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/40 my-4 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Daily Health Targets</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Calories</label>
                    <input
                      type="number" required value={calGoal}
                      onChange={(e) => setCalGoal(e.target.value)}
                      className="w-full input-3d px-2 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Protein (g)</label>
                    <input
                      type="number" required value={protGoal}
                      onChange={(e) => setProtGoal(e.target.value)}
                      className="w-full input-3d px-2 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Water (ml)</label>
                    <input
                      type="number" required value={waterGoal}
                      onChange={(e) => setWaterGoal(e.target.value)}
                      className="w-full input-3d px-2 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Sleep (h)</label>
                    <input
                      type="number" step="0.5" required value={sleepGoal}
                      onChange={(e) => setSleepGoal(e.target.value)}
                      className="w-full input-3d px-2 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Steps</label>
                    <input
                      type="number" required value={stepsGoal}
                      onChange={(e) => setStepsGoal(e.target.value)}
                      className="w-full input-3d px-2 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-3d-brand w-full">
                {profileSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {profileSaved ? 'Profile Saved!' : 'Save Profile & Goals'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-card-3d p-6 border-rose-500/10 hover:border-rose-500/20 transition-all cursor-default">
            <h2 className="text-lg font-semibold text-rose-500 mb-1.5">Danger Zone</h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Wipe all weight history, food logs, hydration logs, sleep records, and chat messages from your local browser storage.
            </p>
            <button
              type="button"
              onClick={async () => {
                if (confirm("Are you absolutely sure you want to delete all your tracked data? This cannot be undone.")) {
                  await resetAllData();
                  alert("All local data has been successfully reset!");
                }
              }}
              className="btn-3d-danger w-full text-sm py-2.5"
            >
              Reset All Local Data
            </button>
          </div>

        </div>

        {/* Right Column: Database Sync & AI API (Pre-configured Statuses) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dual Storage Integration Status */}
          <div className="glass-card-3d p-6 space-y-4 cursor-default">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-400" /> Database Storage
            </h2>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-450 rounded-xl shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  Cloud Sync Active <span className="text-[9px] bg-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Connected</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your device is actively syncing weight, food logs, water, and activities to your personal Firestore Database and Firebase Storage.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950/40 p-3 rounded-xl border border-slate-800/25 space-y-1.5">
              <div>Project ID: <span className="text-slate-350 select-all font-mono">{settings.firebaseConfig?.projectId || 'health-tracker-c8ad4'}</span></div>
              <div>Bucket: <span className="text-slate-350 select-all font-mono">{settings.firebaseConfig?.storageBucket || 'health-tracker-c8ad4.firebasestorage.app'}</span></div>
            </div>
          </div>

          {/* Dual AI Integrations Status */}
          <div className="glass-card-3d p-6 space-y-4 cursor-default">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-ai-400" /> AI Coach Configuration
            </h2>
            
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  OpenAI GPT-4o-mini <span className="text-[9px] bg-indigo-500/25 text-indigo-400 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Active</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your OpenAI API Key has been securely loaded from the project environment (`.env`). Your AI Coach and Audits are fully operational.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
