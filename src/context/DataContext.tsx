import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService, initFirebase } from '../services/db';
import { aiService } from '../services/ai';

import type { 
  UserProfile, WeightEntry, FoodEntry, WaterEntry, SleepEntry, 
  ActivityEntry, HealthRecord, AIReport, ChatMessage, AppSettings 
} from '../types';

interface DataContextType {
  profile: UserProfile | null;
  weights: WeightEntry[];
  foods: FoodEntry[];
  water: WaterEntry[];
  sleep: SleepEntry[];
  activities: ActivityEntry[];
  records: HealthRecord[];
  reports: AIReport[];
  messages: ChatMessage[];
  settings: AppSettings;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  addWeight: (entry: Omit<WeightEntry, 'id'>) => Promise<void>;
  deleteWeight: (id: string) => Promise<void>;
  addFood: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  addWater: (amount: number, date?: string) => Promise<void>;
  deleteWater: (id: string) => Promise<void>;
  addSleep: (entry: Omit<SleepEntry, 'id'>) => Promise<void>;
  deleteSleep: (id: string) => Promise<void>;
  addActivity: (entry: Omit<ActivityEntry, 'id'>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addRecord: (entry: Omit<HealthRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  generateAIReport: (type: 'daily' | 'weekly' | 'monthly', date: string) => Promise<AIReport>;
  sendChatMessage: (content: string) => Promise<void>;
  clearChat: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  getDailyTotals: (date: string) => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
    sleep: number;
    steps: number;
    caloriesBurned: number;
  };
  getDailyHealthScore: (date: string) => number;
  getStreak: () => number;
  resetAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBTZd_WEFXT25AVmI3svr5eH4rg6DEKPG8",
  authDomain: "health-tracker-c8ad4.firebaseapp.com",
  projectId: "health-tracker-c8ad4",
  storageBucket: "health-tracker-c8ad4.firebasestorage.app",
  messagingSenderId: "365428695993",
  appId: "1:365428695993:web:0d375d70b6b1ca6cdc8c68"
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  storageMode: 'firebase',
  firebaseConfig: DEFAULT_FIREBASE_CONFIG,
  aiMode: import.meta.env.VITE_OPENAI_API_KEY ? 'api' : 'local',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  geminiApiKey: '',
  cfWorkerUrl: ''
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    const envOpenAiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (saved) {
      const parsed = JSON.parse(saved);
      let changed = false;
      
      // Force update if they have the old placeholder configuration
      if (!parsed.firebaseConfig || parsed.firebaseConfig.projectId === 'ai-health-tracker-demo' || parsed.firebaseConfig.apiKey.includes('Dummy')) {
        parsed.firebaseConfig = DEFAULT_FIREBASE_CONFIG;
        parsed.storageMode = 'firebase';
        changed = true;
      }
      
      // Automatically load the environment OpenAI key if not already set
      if (!parsed.openaiApiKey && envOpenAiKey) {
        parsed.openaiApiKey = envOpenAiKey;
        parsed.aiMode = 'api';
        changed = true;
      }
      
      if (changed) {
        localStorage.setItem('app_settings', JSON.stringify(parsed));
      }
      return parsed;
    }
    return DEFAULT_SETTINGS;
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [water, setWater] = useState<WaterEntry[]>([]);
  const [sleep, setSleep] = useState<SleepEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const isFirebase = settings.storageMode === 'firebase' && settings.firebaseConfig !== null;

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        if (isFirebase && settings.firebaseConfig) {
          const success = initFirebase(settings.firebaseConfig);
          if (!success) {
            console.warn("Firebase initialization failed, staying in local mode.");
          }
        }

        // Initialize clean empty data if it's the first time
        const hasInitialized = localStorage.getItem('has_initialized_data');
        if (!hasInitialized && !isFirebase) {
          const defaultProfile = {
            name: 'User',
            age: 30,
            height: 175,
            startWeight: 100,
            targetWeight: 80,
            dailyGoals: {
              calories: 2000,
              protein: 140,
              water: 3000,
              sleep: 8,
              steps: 10000
            }
          };
          localStorage.setItem('user_profile', JSON.stringify(defaultProfile));
          localStorage.setItem('weight_entries', JSON.stringify([]));
          localStorage.setItem('food_entries', JSON.stringify([]));
          localStorage.setItem('water_entries', JSON.stringify([]));
          localStorage.setItem('sleep_entries', JSON.stringify([]));
          localStorage.setItem('activity_entries', JSON.stringify([]));
          localStorage.setItem('health_records', JSON.stringify([]));
          localStorage.setItem('ai_reports', JSON.stringify([]));
          localStorage.setItem('chat_messages', JSON.stringify([]));
          localStorage.setItem('has_initialized_data', 'true');
        }

        const userProfile = await dbService.getUserProfile(isFirebase);
        const weightEntries = await dbService.getWeightEntries(isFirebase);
        const foodEntries = await dbService.getFoodEntries(isFirebase);
        const waterEntries = await dbService.getWaterEntries(isFirebase);
        const sleepEntries = await dbService.getSleepEntries(isFirebase);
        const activityEntries = await dbService.getActivityEntries(isFirebase);
        const healthRecords = await dbService.getHealthRecords(isFirebase);
        const aiReports = await dbService.getAIReports(isFirebase);
        const chatMessages = await dbService.getChatMessages(isFirebase);

        setProfile(userProfile || {
          name: 'User',
          age: 30,
          height: 175,
          startWeight: 100,
          targetWeight: 80,
          dailyGoals: {
            calories: 2000,
            protein: 140,
            water: 3000,
            sleep: 8,
            steps: 10000
          }
        });
        setWeights(weightEntries);
        setFoods(foodEntries);
        setWater(waterEntries);
        setSleep(sleepEntries);
        setActivities(activityEntries);
        setRecords(healthRecords);
        setReports(aiReports);
        setMessages(chatMessages);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [settings.storageMode, settings.firebaseConfig]);

  // Save Settings
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('app_settings', JSON.stringify(updated));

    // If switching to Firebase, run sync
    if (newSettings.storageMode === 'firebase' && updated.firebaseConfig) {
      setLoading(true);
      try {
        initFirebase(updated.firebaseConfig);
        await dbService.syncLocalDataToFirebase();
        console.log("Sync complete!");
      } catch (err) {
        console.error("Failed to sync data to Firebase:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // --- CRUD OPERATIONS ---

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await dbService.saveUserProfile(newProfile, isFirebase);
  };

  const addWeight = async (entry: Omit<WeightEntry, 'id'>) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: `w_${Date.now()}`
    };
    setWeights(prev => [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    await dbService.saveWeightEntry(newEntry, isFirebase);
  };

  const deleteWeight = async (id: string) => {
    setWeights(prev => prev.filter(w => w.id !== id));
    await dbService.deleteWeightEntry(id, isFirebase);
  };

  const addFood = async (entry: Omit<FoodEntry, 'id'>) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: `f_${Date.now()}`
    };
    setFoods(prev => [...prev, newEntry]);
    await dbService.saveFoodEntry(newEntry, isFirebase);
  };

  const deleteFood = async (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
    await dbService.deleteFoodEntry(id, isFirebase);
  };

  const addWater = async (amount: number, dateStr?: string) => {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const newEntry: WaterEntry = {
      id: `h2o_${Date.now()}`,
      date: today,
      amount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWater(prev => [...prev, newEntry]);
    await dbService.saveWaterEntry(newEntry, isFirebase);
  };

  const deleteWater = async (id: string) => {
    setWater(prev => prev.filter(w => w.id !== id));
    await dbService.deleteWaterEntry(id, isFirebase);
  };

  const addSleep = async (entry: Omit<SleepEntry, 'id'>) => {
    const newEntry: SleepEntry = {
      ...entry,
      id: `s_${Date.now()}`
    };
    setSleep(prev => [...prev, newEntry]);
    await dbService.saveSleepEntry(newEntry, isFirebase);
  };

  const deleteSleep = async (id: string) => {
    setSleep(prev => prev.filter(s => s.id !== id));
    await dbService.deleteSleepEntry(id, isFirebase);
  };

  const addActivity = async (entry: Omit<ActivityEntry, 'id'>) => {
    const newEntry: ActivityEntry = {
      ...entry,
      id: `a_${Date.now()}`
    };
    setActivities(prev => [...prev, newEntry]);
    await dbService.saveActivityEntry(newEntry, isFirebase);
  };

  const deleteActivity = async (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    await dbService.deleteActivityEntry(id, isFirebase);
  };

  const addRecord = async (entry: Omit<HealthRecord, 'id'>) => {
    const newEntry: HealthRecord = {
      ...entry,
      id: `hr_${Date.now()}`
    };
    setRecords(prev => [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    await dbService.saveHealthRecord(newEntry, isFirebase);
  };

  const deleteRecord = async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    await dbService.deleteHealthRecord(id, isFirebase);
  };

  // --- AI ACTIONS ---

  const generateAIReport = async (type: 'daily' | 'weekly' | 'monthly', date: string): Promise<AIReport> => {
    const reportData = {
      weights,
      foods,
      water,
      sleep,
      activities,
      goals: profile?.dailyGoals || { calories: 2000, protein: 140, water: 3000, sleep: 8, steps: 10000 }
    };
    
    const report = await aiService.generateReport(type, date, reportData, {
      aiMode: settings.aiMode,
      openaiApiKey: settings.openaiApiKey,
      geminiApiKey: settings.geminiApiKey
    });

    setReports(prev => [report, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    await dbService.saveAIReport(report, isFirebase);
    return report;
  };

  const sendChatMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    await dbService.saveChatMessage(userMessage, isFirebase);

    const history = [...messages, userMessage];
    const logs = { profile, weights, foods, water, sleep, activities };

    const aiResponseContent = await aiService.getChatCoachResponse(content, history, logs, {
      aiMode: settings.aiMode,
      openaiApiKey: settings.openaiApiKey,
      geminiApiKey: settings.geminiApiKey
    });

    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponseContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);
    await dbService.saveChatMessage(assistantMessage, isFirebase);
  };

  const clearChat = async () => {
    setMessages([]);
    await dbService.clearChatMessages(isFirebase);
  };

  // --- CALCULATION HELPERS ---

  const getDailyTotals = (date: string) => {
    const dayFoods = foods.filter(f => f.date === date);
    const dayWater = water.filter(w => w.date === date);
    const daySleep = sleep.filter(s => s.date === date);
    const dayActivities = activities.filter(a => a.date === date);

    return {
      calories: dayFoods.reduce((sum, f) => sum + f.calories, 0),
      protein: dayFoods.reduce((sum, f) => sum + f.protein, 0),
      carbs: dayFoods.reduce((sum, f) => sum + f.carbs, 0),
      fat: dayFoods.reduce((sum, f) => sum + f.fat, 0),
      fiber: dayFoods.reduce((sum, f) => sum + f.fiber, 0),
      water: dayWater.reduce((sum, w) => sum + w.amount, 0),
      sleep: daySleep.reduce((sum, s) => sum + s.duration, 0),
      steps: dayActivities.reduce((sum, a) => sum + (a.steps || 0), 0),
      caloriesBurned: dayActivities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0)
    };
  };

  const getDailyHealthScore = (date: string): number => {
    const totals = getDailyTotals(date);
    const goals = profile?.dailyGoals || { calories: 2000, protein: 140, water: 3000, sleep: 8, steps: 10000 };
    
    // If absolutely nothing is logged for the day, score is 0
    const hasLogs = foods.some(f => f.date === date) || 
                    water.some(w => w.date === date) || 
                    sleep.some(s => s.date === date) || 
                    activities.some(a => a.date === date);
                    
    if (!hasLogs) return 0;

    let score = 100;

    // 1. Calorie Deficit (Goal for weight loss)
    // Overeating cuts score. Under-eating too much also cuts slightly.
    if (totals.calories > 0) {
      const calDiff = totals.calories - goals.calories;
      if (calDiff > 0) {
        // Overeating: subtract 1 point for every 20 calories over
        score -= Math.min(25, Math.round(calDiff / 20));
      } else if (calDiff < -800) {
        // Starvation deficit: subtract 10 points
        score -= 10;
      }
    } else {
      score -= 15; // No food logged
    }

    // 2. Protein Intake
    if (goals.protein > 0) {
      const proteinPercent = Math.min(1, totals.protein / goals.protein);
      score -= Math.round((1 - proteinPercent) * 20); // up to -20 points
    }

    // 3. Water Intake
    if (goals.water > 0) {
      const waterPercent = Math.min(1, totals.water / goals.water);
      score -= Math.round((1 - waterPercent) * 15); // up to -15 points
    }

    // 4. Steps
    if (goals.steps > 0) {
      const stepsPercent = Math.min(1, totals.steps / goals.steps);
      score -= Math.round((1 - stepsPercent) * 15); // up to -15 points
    }

    // 5. Sleep
    if (goals.sleep > 0) {
      const sleepPercent = Math.min(1, totals.sleep / goals.sleep);
      score -= Math.round((1 - sleepPercent) * 15); // up to -15 points
    }

    return Math.max(10, Math.min(100, score));
  };

  // Calculates the current consecutive day streak of logging
  const getStreak = (): number => {
    const loggedDates = new Set<string>();
    foods.forEach(f => loggedDates.add(f.date));
    water.forEach(w => loggedDates.add(w.date));
    sleep.forEach(s => loggedDates.add(s.date));
    activities.forEach(a => loggedDates.add(a.date));
    weights.forEach(w => loggedDates.add(w.date));

    if (loggedDates.size === 0) return 0;

    const sortedDates = Array.from(loggedDates).sort((a, b) => b.localeCompare(a));
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If the user hasn't logged today or yesterday, streak is 0
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let currentCheck = new Date(sortedDates[0]);

    while (true) {
      const checkStr = currentCheck.toISOString().split('T')[0];
      if (loggedDates.has(checkStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const resetAllData = async () => {
    localStorage.clear();
    // Keep current settings (so they don't have to re-configure Firebase or OpenAI keys!)
    localStorage.setItem('app_settings', JSON.stringify(settings));
    localStorage.setItem('has_initialized_data', 'true');
    
    setProfile({
      name: 'User',
      age: 30,
      height: 175,
      startWeight: 100,
      targetWeight: 80,
      dailyGoals: {
        calories: 2000,
        protein: 140,
        water: 3000,
        sleep: 8,
        steps: 10000
      }
    });
    setWeights([]);
    setFoods([]);
    setWater([]);
    setSleep([]);
    setActivities([]);
    setRecords([]);
    setReports([]);
    setMessages([]);
  };

  return (
    <DataContext.Provider value={{
      profile,
      weights,
      foods,
      water,
      sleep,
      activities,
      records,
      reports,
      messages,
      settings,
      loading,
      activeTab,
      setActiveTab,
      updateProfile,
      addWeight,
      deleteWeight,
      addFood,
      deleteFood,
      addWater,
      deleteWater,
      addSleep,
      deleteSleep,
      addActivity,
      deleteActivity,
      addRecord,
      deleteRecord,
      generateAIReport,
      sendChatMessage,
      clearChat,
      updateSettings,
      getDailyTotals,
      getDailyHealthScore,
      getStreak,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
