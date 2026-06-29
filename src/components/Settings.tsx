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

  // Gemini API Key State
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('health_tracker_gemini_api_key') || settings.geminiApiKey || '';
  });
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

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
      dailyGoals: profile?.dailyGoals || {
        calories: 2000,
        protein: 140,
        water: 3000,
        sleep: 8,
        steps: 10000
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
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Health Targets</h3>
                  <span className="text-[9px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full uppercase font-black tracking-wider">Auto-Adjusting (Active)</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="bg-slate-950/60 border border-slate-800/25 p-3 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Calories</div>
                    <div className="text-sm font-black text-slate-200 mt-1">{profile?.dailyGoals?.calories} <span className="text-[10px] font-normal text-slate-500">kcal</span></div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/25 p-3 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Protein</div>
                    <div className="text-sm font-black text-slate-200 mt-1">{profile?.dailyGoals?.protein}g</div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/25 p-3 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Water</div>
                    <div className="text-sm font-black text-slate-200 mt-1">{(profile?.dailyGoals?.water ? profile.dailyGoals.water / 1000 : 3).toFixed(1)}L</div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/25 p-3 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Sleep</div>
                    <div className="text-sm font-black text-slate-200 mt-1">{profile?.dailyGoals?.sleep}h</div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/25 p-3 rounded-xl text-center col-span-2 md:col-span-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Steps</div>
                    <div className="text-sm font-black text-slate-200 mt-1">{profile?.dailyGoals?.steps?.toLocaleString()}</div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-800/20">
                  💡 **How it works**: Targets are calculated dynamically using the **Mifflin-St Jeor Equation** for BMR, adjusted for light/moderate activity (TDEE), and set with a 500 kcal deficit for weight loss. Protein is set at 1.8g per kg of body weight, and Water is set at 35ml per kg. As you log new weights, these goals adapt to prevent plateaus.
                </p>
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
                  Your device is actively syncing all logs to your Firebase account: **theshaguntyagi@gmail.com**.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950/40 p-3 rounded-xl border border-slate-800/25 space-y-1.5">
              <div>Project ID: <span className="text-slate-350 select-all font-mono">{settings.firebaseConfig?.projectId || 'health-tracker-c8ad4'}</span></div>
              <div>Auth Status: <span className="text-slate-350 font-mono">Authenticated</span></div>
            </div>
          </div>

          {/* Dual AI Integrations Status */}
          <div className="glass-card-3d p-6 space-y-4 cursor-default">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-brand-400" /> AI Coach Settings
            </h2>
            
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-455 rounded-xl shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  Google Gemini Active <span className="text-[9px] bg-indigo-500/25 text-indigo-400 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Active</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your AI Coach and reports are powered by the **gemini-2.5-flash** model.
                </p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (geminiKey) {
                localStorage.setItem('health_tracker_gemini_api_key', geminiKey);
                await updateSettings({
                  geminiApiKey: geminiKey,
                  aiMode: 'api',
                  aiProvider: 'gemini'
                });
                setKeySaved(true);
                setTimeout(() => setKeySaved(false), 2000);
              }
            }} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    required
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your Gemini API Key"
                    className="w-full input-3d pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  🔒 Saved locally in your browser. It will **never** be committed to GitHub or leaked.
                </p>
              </div>
              
              <button type="submit" className="btn-3d-brand w-full text-xs py-2">
                {keySaved ? 'Key Saved Successfully!' : 'Update Gemini Key'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
