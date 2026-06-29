import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line 
} from 'recharts';
import { Moon, Calendar, Plus, Trash2, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SleepTracker: React.FC = () => {
  const { sleep, addSleep, deleteSleep, profile } = useData();
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [bedTime, setBedTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState<number>(4);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const goals = profile?.dailyGoals || { calories: 2000, protein: 140, water: 3000, sleep: 8, steps: 10000 };

  // Calculate sleep duration helper
  const calculateDuration = (bed: string, wake: string): number => {
    const [bedH, bedM] = bed.split(':').map(Number);
    const [wakeH, wakeM] = wake.split(':').map(Number);

    let diffMin = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
    if (diffMin < 0) {
      // Overnight sleep
      diffMin += 24 * 60;
    }
    return Math.round((diffMin / 60) * 100) / 100;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(bedTime, wakeTime);

    await addSleep({
      date: dateInput,
      startTime: bedTime,
      endTime: wakeTime,
      duration,
      quality
    });

    setShowLogModal(false);
    setQuality(4);
  };

  // 1. Prepare 7-day chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(dateStr => {
    const log = sleep.find(s => s.date === dateStr);
    return {
      date: new Date(dateStr).toLocaleDateString('default', { weekday: 'short' }),
      Hours: log ? log.duration : 0,
      Quality: log ? log.quality : 0
    };
  });

  // Averages
  const avgHours = sleep.length > 0
    ? Math.round((sleep.reduce((sum, s) => sum + s.duration, 0) / sleep.length) * 10) / 10
    : 0;
  
  const avgQuality = sleep.length > 0
    ? Math.round((sleep.reduce((sum, s) => sum + s.quality, 0) / sleep.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Moon className="w-8 h-8 text-indigo-500" /> Sleep Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track sleep duration and quality. Sleep is vital for hormone regulation and fat loss.
          </p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="glass-btn-primary"
        >
          <Plus className="w-5 h-5" /> Log Sleep
        </button>
      </div>

      {/* Stats and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stats Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 text-center space-y-2">
            <Clock className="w-8 h-8 text-indigo-500 mx-auto" />
            <div className="text-3xl font-black text-slate-800 dark:text-white">{avgHours} hrs</div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Average Sleep Duration</div>
            <div className="text-xs text-slate-400">Target: {goals.sleep} hrs</div>
          </div>

          <div className="glass-card p-6 text-center space-y-2">
            <div className="flex justify-center text-amber-400">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star 
                  key={idx} 
                  className={`w-5 h-5 ${idx < Math.round(avgQuality) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                />
              ))}
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{avgQuality} / 5</div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Average Sleep Quality</div>
            <div className="text-xs text-slate-400">Based on your ratings</div>
          </div>
        </div>

        {/* Chart Column */}
        <div className="lg:col-span-8 glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">7-Day Sleep Trends</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit="h" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '16px',
                    border: 'none',
                    color: 'white',
                    fontSize: '12px'
                  }} 
                />
                <Bar yAxisId="left" dataKey="Hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Quality" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Sleep Logs History */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Sleep Logs</h2>
        
        <div className="overflow-x-auto">
          {sleep.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 uppercase font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Sleep Time</th>
                  <th className="py-3 px-4">Wake Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Quality</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-700 dark:text-slate-300">
                {sleep.sort((a, b) => b.date.localeCompare(a.date)).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(s.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">{s.startTime}</td>
                    <td className="py-3.5 px-4">{s.endTime}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{s.duration} hrs</td>
                    <td className="py-3.5 px-4">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < s.quality ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => deleteSleep(s.id)}
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
              No sleep logs found. Click "Log Sleep" to log your recovery!
            </div>
          )}
        </div>
      </div>

      {/* Log Sleep Modal */}
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
                <Moon className="w-5.5 h-5.5 text-indigo-500" /> Log Sleep Recovery
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Bed Time</label>
                    <input
                      type="time"
                      required
                      value={bedTime}
                      onChange={(e) => setBedTime(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Wake Time</label>
                    <input
                      type="time"
                      required
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Sleep Quality</label>
                  <div className="flex justify-center gap-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starValue = idx + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuality(starValue)}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 transition-transform active:scale-95 ${
                              starValue <= quality 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
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
