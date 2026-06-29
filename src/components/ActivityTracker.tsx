import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line, CartesianGrid 
} from 'recharts';
import { Footprints, Calendar, Plus, Trash2, Dumbbell, Award, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ActivityTracker: React.FC = () => {
  const { activities, addActivity, deleteActivity, profile } = useData();
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [type, setType] = useState<'walking' | 'running' | 'workout' | 'other'>('walking');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const goals = profile?.dailyGoals || { calories: 2000, protein: 140, water: 3000, sleep: 8, steps: 10000 };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const stepsVal = type === 'walking' || type === 'running' ? Number(stepsInput) || 0 : 0;
    
    // Auto estimate calories if empty
    let calsVal = Number(caloriesInput);
    if (!calsVal) {
      const dur = Number(duration) || 0;
      if (type === 'running') calsVal = dur * 11; // ~11 kcal/min
      else if (type === 'walking') calsVal = stepsVal ? Math.round(stepsVal * 0.04) : dur * 4; // ~4 kcal/min or 0.04 per step
      else if (type === 'workout') calsVal = dur * 6; // ~6 kcal/min
      else calsVal = dur * 5;
    }

    await addActivity({
      date: dateInput,
      type,
      name: name || (type === 'walking' ? 'Steps Walking' : type === 'running' ? 'Running Session' : type === 'workout' ? 'Strength Workout' : 'Activity'),
      duration: Number(duration) || 0,
      steps: stepsVal,
      caloriesBurned: calsVal
    });

    setShowLogModal(false);
    setName('');
    setDuration('');
    setStepsInput('');
    setCaloriesInput('');
  };

  // 1. Prepare 7-day chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(dateStr => {
    const dayLogs = activities.filter(a => a.date === dateStr);
    const stepsTotal = dayLogs.reduce((sum, a) => sum + (a.steps || 0), 0);
    const caloriesTotal = dayLogs.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
    return {
      date: new Date(dateStr).toLocaleDateString('default', { weekday: 'short' }),
      Steps: stepsTotal,
      Calories: caloriesTotal
    };
  });

  // Averages
  const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
  const totalDays = new Set(activities.map(a => a.date)).size || 1;
  const avgSteps = Math.round(totalSteps / totalDays);
  
  const totalActiveCals = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const avgActiveCals = Math.round(totalActiveCals / totalDays);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Dumbbell className="w-8 h-8 text-amber-500" /> Activity Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Log workouts and steps to increase energy expenditure and maintain a calorie deficit.
          </p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="glass-btn-primary"
        >
          <Plus className="w-5 h-5" /> Log Activity
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Footprints className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{avgSteps.toLocaleString()}</div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Average Daily Steps</div>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{avgActiveCals} kcal</div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Avg Daily Active Burn</div>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {Math.round((totalSteps / (goals.steps * totalDays)) * 100)}%
            </div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Goal Consistency</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">7-Day Activity Trends</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit=" steps" />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit=" kcal" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderRadius: '16px',
                  border: 'none',
                  color: 'white',
                  fontSize: '12px'
                }} 
              />
              <Bar yAxisId="left" dataKey="Steps" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Calories" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Logs History */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          History Logs
        </h2>
        
        <div className="overflow-x-auto">
          {activities.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 uppercase font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Steps</th>
                  <th className="py-3 px-4">Active Burn</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-700 dark:text-slate-300">
                {activities.sort((a, b) => b.date.localeCompare(a.date)).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(a.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{a.name}</td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        a.type === 'walking' ? 'bg-amber-500/10 text-amber-500' :
                        a.type === 'running' ? 'bg-rose-500/10 text-rose-500' :
                        a.type === 'workout' ? 'bg-brand-500/10 text-brand-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {a.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{a.duration} mins</td>
                    <td className="py-3.5 px-4">{a.steps ? a.steps.toLocaleString() : '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-500">{a.caloriesBurned} kcal</td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => deleteActivity(a.id)}
                        className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-slate-400 dark:text-slate-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-slate-400">
              No activities logged yet. Click "Log Activity" to add workouts or steps!
            </div>
          )}
        </div>
      </div>

      {/* Log Activity Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
            />
            
            <motion.div 
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Dumbbell className="w-5.5 h-5.5 text-amber-500" /> Log Activity
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Activity Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['walking', 'running', 'workout', 'other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`text-xs capitalize py-2.5 rounded-xl font-bold border transition-all ${
                          type === t 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Activity Name (e.g. Leg Day, Evening Run)</label>
                  <input
                    type="text"
                    placeholder="e.g. Evening Jog, Chest Workout"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 45"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Date</label>
                    <input
                      type="date"
                      required
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                {(type === 'walking' || type === 'running') && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-bold text-slate-400 uppercase">Step Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 8500"
                      value={stepsInput}
                      onChange={(e) => setStepsInput(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Calories Burned (Optional)</label>
                  <input
                    type="number"
                    placeholder="Leave empty for AI estimation"
                    value={caloriesInput}
                    onChange={(e) => setCaloriesInput(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 glass-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 glass-btn-primary"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
