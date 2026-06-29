export interface DailyGoals {
  calories: number;
  protein: number; // in grams
  water: number; // in ml
  sleep: number; // in hours
  steps: number;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  startWeight: number; // in kg (default 100)
  targetWeight: number; // in kg (default 80)
  dailyGoals: DailyGoals;
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  description: string;
  imageUrl?: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
}

export interface WaterEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // ml
  timestamp: string; // ISO string or HH:MM
}

export interface SleepEntry {
  id: string;
  date: string; // YYYY-MM-DD (the date they woke up)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // hours
  quality: number; // 1 to 5 stars
}

export interface ActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'walking' | 'running' | 'workout' | 'other';
  name: string; // e.g., "Evening Jog", "Leg Day"
  duration: number; // minutes
  steps: number; // number of steps (if applicable)
  caloriesBurned: number;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  waist?: number; // cm (optional)
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  bloodSugar?: number; // mg/dL
  vitaminD?: number; // ng/mL
  vitaminB12?: number; // pg/mL
  cholesterol?: number; // mg/dL
  hbA1c?: number; // %
}

export interface AIReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: string; // YYYY-MM-DD (or week-ending date)
  title: string;
  score: number; // 0-100 Health Score
  summary: string;
  positives: string[];
  mistakes: string[];
  recommendations: string[];
  habitsDetected?: string[];
  statsSummary?: {
    weightChange?: number;
    avgCalories?: number;
    avgProtein?: number;
    avgWater?: number;
    avgSleep?: number;
    avgSteps?: number;
    consistencyScore?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  storageMode: 'local' | 'firebase';
  firebaseConfig: FirebaseConfig | null;
  aiMode: 'local' | 'api';
  openaiApiKey: string;
  geminiApiKey: string;
  cfWorkerUrl: string;
}
