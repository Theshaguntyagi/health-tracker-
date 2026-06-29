import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Flame, Award, Scale, Flame as Burner, Droplet, 
  Moon, Footprints, Plus, ChevronDown, ChevronUp, Check, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { profile, getDailyTotals, getDailyHealthScore, getStreak, addWater, addActivity, addWeight, weights, setActiveTab } = useData();
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  
  // State for quick logging
  const [quickWeight, setQuickWeight] = useState('');
  const [quickSteps, setQuickSteps] = useState('');
  const [showWeightSuccess, setShowWeightSuccess] = useState(false);
  const [showStepsSuccess, setShowStepsSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const totals = getDailyTotals(today);
  const healthScore = getDailyHealthScore(today);
  const streak = getStreak();
  const goals = profile?.dailyGoals || { calories: 2000, protein: 140, water: 3000, sleep: 8, steps: 10000 };

  const currentWeight = weights[0]?.weight || profile?.startWeight || 100;
  const targetWeight = profile?.targetWeight || 80;
  const startWeight = profile?.startWeight || 100;
  const totalToLose = startWeight - targetWeight;
  const lostSoFar = Math.max(0, startWeight - currentWeight);
  const weightProgressPercent = Math.min(100, Math.round((lostSoFar / totalToLose) * 100));

  // BMI Calculation
  const heightInMeters = (profile?.height || 180) / 100;
  const bmi = Math.round((currentWeight / (heightInMeters * heightInMeters)) * 10) / 10;
  
  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-sky-400' };
    if (val < 25) return { label: 'Normal', color: 'text-brand-400' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-rose-400' };
  };
  const bmiCat = getBMICategory(bmi);

  const handleQuickWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWeight || isNaN(parseFloat(quickWeight))) return;
    await addWeight({
      date: today,
      weight: parseFloat(quickWeight),
      notes: 'Quick log from dashboard'
    });
    setQuickWeight('');
    setShowWeightSuccess(true);
    setTimeout(() => setShowWeightSuccess(false), 2000);
  };

  const handleQuickStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSteps || isNaN(parseInt(quickSteps))) return;
    await addActivity({
      date: today,
      type: 'walking',
      name: 'Daily Steps',
      duration: Math.round(parseInt(quickSteps) / 120), // rough estimate of duration
      steps: parseInt(quickSteps),
      caloriesBurned: Math.round(parseInt(quickSteps) * 0.04) // ~0.04 kcal per step
    });
    setQuickSteps('');
    setShowStepsSuccess(true);
    setTimeout(() => setShowStepsSuccess(false), 2000);
  };

  // Nutrition percentages
  const calPercent = Math.min(100, Math.round((totals.calories / goals.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / goals.protein) * 100));
  const waterPercent = Math.min(100, Math.round((totals.water / goals.water) * 100));
  const sleepPercent = Math.min(100, Math.round((totals.sleep / goals.sleep) * 100));
  const stepsPercent = Math.min(100, Math.round((totals.steps / goals.steps) * 100));

  // 3D Card Hover Transition
  const hover3D = {
    y: -6,
    rotateX: 2,
    rotateY: -2,
    z: 10,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(34, 197, 94, 0.1)'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            Hey <span className="text-gradient-brand">{profile?.name || 'there'}</span>!
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Let's make today count toward your {targetWeight}kg goal.
          </p>
        </div>
        
        {/* Streak Counter */}
        <motion.div 
          whileHover={{ scale: 1.05, rotateY: 5 }}
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.08)]"
        >
          <div className="relative">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">STREAK</div>
            <div className="text-lg font-black text-amber-350 -mt-1">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
          </div>
        </motion.div>
      </div>

      {/* 2. Top Grid: Health Score and Weight Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Health Score Card */}
        <motion.div 
          whileHover={hover3D}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="lg:col-span-7 glass-card-3d shadow-neon-brand p-6 flex flex-col justify-between cursor-default"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-450" /> Daily Health Score
              </h2>
              <button 
                onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showScoreBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 py-2">
              {/* Circular Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-800/80"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - healthScore / 100)}
                    strokeLinecap="round"
                    className="text-brand-500"
                    initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - healthScore / 100) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-100">{healthScore}</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Score</span>
                </div>
              </div>

              {/* Message */}
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-black text-gradient-brand">
                  {healthScore >= 90 ? 'Phenomenal Day! 🌟' :
                   healthScore >= 75 ? 'Great Choices! 👍' :
                   healthScore >= 50 ? 'Steady Progress 🏋️' :
                   'Log your activities! 📝'}
                </h3>
                <p className="text-sm text-slate-450 leading-relaxed">
                  {healthScore >= 90 ? "You've met almost all your targets today. Keep this momentum going!" :
                   healthScore >= 75 ? "You're doing great. A little extra water or a brief walk will push you to perfect." :
                   healthScore >= 50 ? "You've logged some items. Focus on hitting your protein and step targets next." :
                   "Begin logging your meals, water, steps, and sleep to see your health score generate."}
                </p>
              </div>
            </div>
          </div>

          {/* Collapsible Breakdown */}
          <AnimatePresence>
            {showScoreBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-slate-800/40 mt-4 pt-4 space-y-3"
              >
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Score Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/20 p-2.5 rounded-xl">
                    <span className="text-slate-400">Calorie Target</span>
                    <span className={`font-black ${totals.calories <= goals.calories && totals.calories > 0 ? 'text-brand-450' : 'text-rose-450'}`}>
                      {totals.calories > 0 ? `${calPercent}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/20 p-2.5 rounded-xl">
                    <span className="text-slate-400">Protein (Goal: {goals.protein}g)</span>
                    <span className={`font-black ${proteinPercent >= 100 ? 'text-brand-450' : 'text-amber-455'}`}>
                      {totals.protein}g ({proteinPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/20 p-2.5 rounded-xl">
                    <span className="text-slate-400">Water (Goal: {goals.water}ml)</span>
                    <span className={`font-black ${waterPercent >= 100 ? 'text-brand-450' : 'text-amber-455'}`}>
                      {totals.water}ml ({waterPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/20 p-2.5 rounded-xl">
                    <span className="text-slate-400">Steps (Goal: {goals.steps})</span>
                    <span className={`font-black ${stepsPercent >= 100 ? 'text-brand-450' : 'text-amber-455'}`}>
                      {totals.steps.toLocaleString()} ({stepsPercent}%)
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Weight Journey Card */}
        <motion.div 
          whileHover={{ ...hover3D, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.15)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="lg:col-span-5 glass-card-3d shadow-neon-ai p-6 flex flex-col justify-between cursor-default"
        >
          <div>
            <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-ai-450" /> Weight Loss Journey
            </h2>

            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-3xl font-black text-slate-100">
                  {currentWeight} <span className="text-xs font-medium text-slate-500">kg</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">Current Weight</div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-black text-ai-450">
                  {targetWeight} <span className="text-xs font-medium">kg</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">Goal Weight</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden mb-4 p-[1px] border border-slate-800/40">
              <motion.div 
                className="bg-gradient-to-r from-ai-500 to-brand-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${weightProgressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/40 border border-slate-800/25 p-3 rounded-xl">
              <div>
                <div className="text-sm font-black text-slate-300">{lostSoFar.toFixed(1)} kg</div>
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Lost</div>
              </div>
              <div className="border-x border-slate-800/60">
                <div className="text-sm font-black text-slate-300">{(currentWeight - targetWeight).toFixed(1)} kg</div>
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Remaining</div>
              </div>
              <div>
                <div className="text-sm font-black text-slate-300">{bmi}</div>
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                  BMI: <span className={`font-black ${bmiCat.color}`}>{bmiCat.label}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('weight')}
            className="w-full mt-4 text-[11px] text-center font-black text-ai-400 hover:text-ai-300 transition-colors py-2 border border-dashed border-ai-500/20 hover:border-ai-500/40 rounded-xl"
          >
            View Weight Analysis & Prediction →
          </button>
        </motion.div>
      </div>

      {/* 3. Daily Goals Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Calories Card */}
        <motion.div 
          whileHover={{ y: -6, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(34, 197, 94, 0.1)' }}
          className="glass-card-3d p-5 space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-brand-400">
              <Burner className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full tracking-wider">Nutrition</span>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-slate-100">{totals.calories}</span>
              <span className="text-xs text-slate-500 font-medium">/ {goals.calories} kcal</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800/30">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${calPercent}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-450 font-medium mt-3">
              <span>Protein: <strong className="text-slate-300">{totals.protein}g / {goals.protein}g</strong></span>
              <span>Left: <strong className="text-brand-400">{Math.max(0, goals.calories - totals.calories)} kcal</strong></span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('food')}
            className="w-full text-xs font-black text-brand-400 hover:text-brand-300 transition-colors text-left"
          >
            + Log Food Intake
          </button>
        </motion.div>

        {/* Water Card */}
        <motion.div 
          whileHover={{ y: -6, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(14, 165, 233, 0.1)' }}
          className="glass-card-3d p-5 space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
              <Droplet className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full tracking-wider">Hydration</span>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-slate-100">{(totals.water / 1000).toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-medium">/ {(goals.water / 1000).toFixed(1)} L</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800/30">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: `${waterPercent}%` }} />
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => addWater(250)}
                className="flex-1 text-[10px] bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-400 font-extrabold py-1.5 rounded-lg transition-colors"
              >
                +250ml
              </button>
              <button 
                onClick={() => addWater(500)}
                className="flex-1 text-[10px] bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 text-sky-400 font-extrabold py-1.5 rounded-lg transition-colors"
              >
                +500ml
              </button>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('water')}
            className="w-full text-xs font-black text-sky-400 hover:text-sky-300 transition-colors text-left"
          >
            View Hydration →
          </button>
        </motion.div>

        {/* Steps Card */}
        <motion.div 
          whileHover={{ y: -6, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(245, 158, 11, 0.1)' }}
          className="glass-card-3d p-5 space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
              <Footprints className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full tracking-wider">Activity</span>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-slate-100">{totals.steps.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">/ {goals.steps.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800/30">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stepsPercent}%` }} />
            </div>
            <div className="text-xs text-slate-450 font-medium mt-3">
              Active Burn: <strong className="text-slate-300">{totals.caloriesBurned} kcal</strong>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('activity')}
            className="w-full text-xs font-black text-amber-400 hover:text-amber-300 transition-colors text-left"
          >
            View Activities →
          </button>
        </motion.div>

        {/* Sleep Card */}
        <motion.div 
          whileHover={{ y: -6, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(168, 85, 247, 0.1)' }}
          className="glass-card-3d p-5 space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full tracking-wider">Recovery</span>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-slate-100">{totals.sleep}</span>
              <span className="text-xs text-slate-500 font-medium">/ {goals.sleep} hrs</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800/30">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${sleepPercent}%` }} />
            </div>
            <div className="text-xs text-slate-450 font-medium mt-3">
              Quality: <strong className="text-slate-300">Sleep well! 🛌</strong>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('sleep')}
            className="w-full text-xs font-black text-purple-400 hover:text-purple-300 transition-colors text-left"
          >
            Log Sleep Details →
          </button>
        </motion.div>

      </div>

      {/* 4. Quick Logging Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Quick Weight Log */}
        <div className="glass-card-3d p-5">
          <h3 className="text-sm font-extrabold text-slate-250 mb-3 flex items-center gap-2">
            <Scale className="w-4.5 h-4.5 text-ai-450" /> Log Weight Entry
          </h3>
          <form onSubmit={handleQuickWeightSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                placeholder="Weight in kg (e.g. 98.4)"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                className="w-full input-3d pr-10 text-sm"
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">kg</span>
            </div>
            <button 
              type="submit"
              className="btn-3d-ai text-xs py-2 px-5"
            >
              {showWeightSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showWeightSuccess ? 'Logged' : 'Add'}
            </button>
          </form>
        </div>

        {/* Quick Steps Log */}
        <div className="glass-card-3d p-5">
          <h3 className="text-sm font-extrabold text-slate-250 mb-3 flex items-center gap-2">
            <Footprints className="w-4.5 h-4.5 text-brand-450" /> Log Steps Walked
          </h3>
          <form onSubmit={handleQuickStepsSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Steps (e.g. 8500)"
                value={quickSteps}
                onChange={(e) => setQuickSteps(e.target.value)}
                className="w-full input-3d pr-10 text-sm"
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">steps</span>
            </div>
            <button 
              type="submit"
              className="btn-3d-brand text-xs py-2 px-5"
            >
              {showStepsSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showStepsSuccess ? 'Logged' : 'Add'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
