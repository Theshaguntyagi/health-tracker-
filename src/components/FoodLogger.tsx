import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { aiService, FOOD_PRESETS } from '../services/ai';
import type { MealType, FoodEntry } from '../types';
import { 
  Apple, Brain, Trash2, Camera, Sparkles, Check, Sliders, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FoodLogger: React.FC = () => {
  const { foods, addFood, deleteFood, profile, getDailyTotals, settings } = useData();
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  
  // Input methods
  const [logMethod, setLogMethod] = useState<'text' | 'image'>('text');
  
  // Text log states
  const [textInput, setTextInput] = useState('');
  
  // Image log states
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // AI Output Review states
  const [aiResult, setAiResult] = useState<Partial<FoodEntry> | null>(null);
  const [editMacros, setEditMacros] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const totals = getDailyTotals(today);
  const goals = profile?.dailyGoals || { calories: 2000, protein: 140, water: 3000, sleep: 8, steps: 10000 };

  // Calculate macro percentages
  const calPercent = Math.min(100, (totals.calories / goals.calories) * 100);
  const proteinPercent = Math.min(100, (totals.protein / goals.protein) * 100);
  
  // Ideal ratios for weight loss (e.g., 35% Protein, 40% Carbs, 25% Fat)
  const totalMacros = totals.protein + totals.carbs + totals.fat || 1;
  const pRatio = Math.round((totals.protein / totalMacros) * 100);
  const cRatio = Math.round((totals.carbs / totalMacros) * 100);
  const fRatio = Math.round((totals.fat / totalMacros) * 100);

  // Group foods by meal type
  const mealFoods = {
    breakfast: foods.filter(f => f.date === today && f.mealType === 'breakfast'),
    lunch: foods.filter(f => f.date === today && f.mealType === 'lunch'),
    snack: foods.filter(f => f.date === today && f.mealType === 'snack'),
    dinner: foods.filter(f => f.date === today && f.mealType === 'dinner')
  };

  const getMealTotals = (meal: MealType) => {
    const list = mealFoods[meal];
    return {
      calories: list.reduce((sum, f) => sum + f.calories, 0),
      protein: list.reduce((sum, f) => sum + f.protein, 0)
    };
  };

  // Trigger AI Text Analysis
  const handleTextAnalyze = async () => {
    if (!textInput.trim()) return;
    setAnalyzing(true);
    try {
      const result = await aiService.analyzeFood(
        { text: textInput },
        { aiMode: settings.aiMode, openaiApiKey: settings.openaiApiKey, geminiApiKey: settings.geminiApiKey }
      );
      setAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Trigger AI Image Preset Selection
  const handlePresetSelect = async (presetId: string) => {
    setSelectedPresetId(presetId);
    setCustomImage(null);
    setAnalyzing(true);
    
    const preset = FOOD_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // Simulate network delay for local/real AI
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    try {
      const result = await aiService.analyzeFood(
        { imageUrl: preset.imageUrl },
        { aiMode: settings.aiMode, openaiApiKey: settings.openaiApiKey, geminiApiKey: settings.geminiApiKey }
      );
      setAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle local file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setCustomImage(base64String);
      setSelectedPresetId(null);
      setAnalyzing(true);

      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2500));

      try {
        const result = await aiService.analyzeFood(
          { imageUrl: base64String },
          { aiMode: settings.aiMode, openaiApiKey: settings.openaiApiKey, geminiApiKey: settings.geminiApiKey }
        );
        setAiResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFood = async () => {
    if (!aiResult) return;
    
    await addFood({
      date: today,
      mealType: activeMeal,
      description: aiResult.description || 'Unknown Food',
      imageUrl: aiResult.imageUrl,
      calories: Number(aiResult.calories) || 0,
      protein: Number(aiResult.protein) || 0,
      carbs: Number(aiResult.carbs) || 0,
      fat: Number(aiResult.fat) || 0,
      fiber: Number(aiResult.fiber) || 0,
      sugar: Number(aiResult.sugar) || 0,
      sodium: Number(aiResult.sodium) || 0
    });

    // Reset logging panel
    setAiResult(null);
    setTextInput('');
    setSelectedPresetId(null);
    setCustomImage(null);
    setEditMacros(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
          <Apple className="w-8 h-8 text-brand-500" /> AI Food Logger
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Log meals using natural text or image uploads. Our AI estimates macros instantly.
        </p>
      </div>

      {/* Grid: Nutrition Summary & Logging panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Logging Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card p-6">
            {/* Header / Tabs */}
            <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-4 mb-4">
              <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                <button
                  onClick={() => { setLogMethod('text'); setAiResult(null); }}
                  className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                    logMethod === 'text' 
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Type Meal
                </button>
                <button
                  onClick={() => { setLogMethod('image'); setAiResult(null); }}
                  className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                    logMethod === 'image' 
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  AI Image Scan
                </button>
              </div>

              {/* Target Meal Selector */}
              <select
                value={activeMeal}
                onChange={(e) => setActiveMeal(e.target.value as MealType)}
                className="bg-slate-100 dark:bg-slate-800/60 border-none text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Evening Snack</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            {/* Input States */}
            <AnimatePresence mode="wait">
              {/* 1. Text Input Method */}
              {logMethod === 'text' && !aiResult && (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <textarea
                    placeholder="Type what you ate today (e.g. '2 Chapatis, 1 cup curd, a bowl of dal, 100g salad')"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full glass-input h-28 resize-none text-sm"
                  />
                  <button
                    onClick={handleTextAnalyze}
                    disabled={analyzing || !textInput.trim()}
                    className="w-full glass-btn-ai py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="w-5 h-5" /> {analyzing ? 'Analyzing Nutrition...' : 'Analyze with AI'}
                  </button>
                </motion.div>
              )}

              {/* 2. Image Input Method */}
              {logMethod === 'image' && !aiResult && (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Preset Presets Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Test with Quick Presets</label>
                    <div className="grid grid-cols-5 gap-2">
                      {FOOD_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handlePresetSelect(p.id)}
                          disabled={analyzing}
                          className="group relative h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 focus:outline-none"
                        >
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-[9px] text-white font-bold text-center px-1 leading-none">{p.name.split(' ')[0]}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-brand-500/40 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={analyzing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-full text-slate-400 mb-2">
                      <Camera className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Upload Meal Photo</span>
                    <span className="text-xs text-slate-400 mt-0.5">Drag & drop or tap to select</span>
                  </div>
                </motion.div>
              )}

              {/* 3. AI Scanner/Analyzing Overlay */}
              {analyzing && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center space-y-4"
                >
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Glowing outer rings */}
                    <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 border-4 border-brand-500/40 rounded-full animate-pulse" />
                    <div className="p-5 bg-brand-500 text-white rounded-full">
                      <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    {/* Scanning Laser Line (For visual interest) */}
                    <div className="absolute left-0 right-0 h-1 bg-brand-400 shadow-md shadow-brand-400/80 rounded-full animate-bounce" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">AI Vision Scanning</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Identifying food items and estimating macros...</p>
                  </div>
                </motion.div>
              )}

              {/* 4. AI Result Review & Save */}
              {aiResult && !analyzing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Photo Preview if preset or uploaded */}
                  {(selectedPresetId || customImage) && (
                    <div className="h-40 rounded-2xl overflow-hidden relative border border-slate-200/40 dark:border-slate-800/40">
                      <img 
                        src={customImage || FOOD_PRESETS.find(p => p.id === selectedPresetId)?.imageUrl} 
                        alt="Food" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm py-1 px-3 rounded-xl text-[10px] font-bold text-brand-400 uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Scanned
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400 uppercase">Food Name / Description</label>
                      <button
                        onClick={() => setEditMacros(!editMacros)}
                        className="text-xs text-brand-500 hover:text-brand-600 font-bold flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5" /> {editMacros ? 'View Summary' : 'Tweak Macros'}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={aiResult.description || ''}
                      onChange={(e) => setAiResult(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full glass-input text-sm font-semibold"
                    />
                  </div>

                  {/* Summary of Macros */}
                  {!editMacros ? (
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/10 py-3 rounded-2xl">
                        <div className="text-lg font-extrabold text-emerald-500">{aiResult.calories}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Kcal</div>
                      </div>
                      <div className="bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/10 py-3 rounded-2xl">
                        <div className="text-lg font-extrabold text-indigo-500">{aiResult.protein}g</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Protein</div>
                      </div>
                      <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/10 py-3 rounded-2xl">
                        <div className="text-lg font-extrabold text-amber-500">{aiResult.carbs}g</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Carbs</div>
                      </div>
                      <div className="bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/10 py-3 rounded-2xl">
                        <div className="text-lg font-extrabold text-rose-500">{aiResult.fat}g</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Fat</div>
                      </div>
                      <div className="bg-teal-500/10 dark:bg-teal-500/5 border border-teal-500/10 py-3 rounded-2xl">
                        <div className="text-lg font-extrabold text-teal-500">{aiResult.fiber}g</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Fiber</div>
                      </div>
                    </div>
                  ) : (
                    /* Slider Macro Editors */
                    <div className="space-y-4 bg-slate-50/60 dark:bg-slate-900/45 border border-slate-200/30 dark:border-slate-800/20 p-4 rounded-2xl">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                          <span>Calories</span>
                          <span>{aiResult.calories} kcal</span>
                        </div>
                        <input 
                          type="range" min="0" max="1500" step="10"
                          value={aiResult.calories || 0}
                          onChange={(e) => setAiResult(prev => ({ ...prev, calories: Number(e.target.value) }))}
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                          <span>Protein</span>
                          <span>{aiResult.protein} g</span>
                        </div>
                        <input 
                          type="range" min="0" max="150" step="1"
                          value={aiResult.protein || 0}
                          onChange={(e) => setAiResult(prev => ({ ...prev, protein: Number(e.target.value) }))}
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                          <span>Carbohydrates</span>
                          <span>{aiResult.carbs} g</span>
                        </div>
                        <input 
                          type="range" min="0" max="250" step="1"
                          value={aiResult.carbs || 0}
                          onChange={(e) => setAiResult(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-300">
                          <span>Fat</span>
                          <span>{aiResult.fat} g</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="1"
                          value={aiResult.fat || 0}
                          onChange={(e) => setAiResult(prev => ({ ...prev, fat: Number(e.target.value) }))}
                          className="w-full accent-rose-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Warning on High Sodium/Sugar */}
                  {((aiResult.sugar || 0) > 15 || (aiResult.sodium || 0) > 800) && (
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        {aiResult.sugar && aiResult.sugar > 15 ? 'High sugar. Try to limit simple sugars to avoid energy crashes. ' : ''}
                        {aiResult.sodium && aiResult.sodium > 800 ? 'High sodium. This may cause temporary water retention on the scale.' : ''}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setAiResult(null)}
                      className="flex-1 glass-btn-secondary"
                    >
                      Re-scan
                    </button>
                    <button
                      onClick={handleSaveFood}
                      className="flex-1 glass-btn-primary"
                    >
                      <Check className="w-4 h-4" /> Save to {activeMeal}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Nutrition Progress & Goal tracking */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Goals Ring Card */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Nutrition Progress</h2>
            
            <div className="space-y-4">
              {/* Calories Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <span>Calories</span>
                  <span>{totals.calories} / {goals.calories} kcal</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${calPercent}%` }} />
                </div>
              </div>

              {/* Protein Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <span>Protein</span>
                  <span>{totals.protein}g / {goals.protein}g</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${proteinPercent}%` }} />
                </div>
              </div>

              {/* Macro Ratios (Pie chart feel via stacked bar) */}
              {totals.calories > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Energy Balance Ratio</div>
                  <div className="w-full h-4 rounded-lg overflow-hidden flex">
                    <div className="bg-indigo-500 h-full" style={{ width: `${pRatio}%` }} title={`Protein: ${pRatio}%`} />
                    <div className="bg-amber-500 h-full" style={{ width: `${cRatio}%` }} title={`Carbs: ${cRatio}%`} />
                    <div className="bg-rose-500 h-full" style={{ width: `${fRatio}%` }} title={`Fat: ${fRatio}%`} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> Protein {pRatio}%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" /> Carbs {cRatio}%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full" /> Fat {fRatio}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logged Meal History lists */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Logged Meals Today</h2>
            
            {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((meal) => {
              const list = mealFoods[meal];
              const mealTotals = getMealTotals(meal);

              return (
                <div key={meal} className="border-b border-slate-100 dark:border-slate-800/60 last:border-none pb-3 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">{meal}</h3>
                    <span className="text-xs text-slate-500">
                      {mealTotals.calories > 0 ? `${mealTotals.calories} kcal • ${mealTotals.protein}g protein` : 'No logs'}
                    </span>
                  </div>

                  {list.length > 0 ? (
                    <div className="space-y-1.5">
                      {list.map((food) => (
                        <div key={food.id} className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2 rounded-xl text-sm">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="font-semibold text-slate-700 dark:text-slate-200 truncate">{food.description}</div>
                            <div className="text-[11px] text-slate-400 flex gap-2 mt-0.5">
                              <span>P: {food.protein}g</span>
                              <span>C: {food.carbs}g</span>
                              <span>F: {food.fat}g</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{food.calories} kcal</span>
                            <button 
                              onClick={() => deleteFood(food.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
