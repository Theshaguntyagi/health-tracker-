import React from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { Droplet, Trash2, Plus, Award, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export const WaterTracker: React.FC = () => {
  const { water, addWater, deleteWater, profile } = useData();

  const today = new Date().toISOString().split('T')[0];
  const goals = profile?.dailyGoals || { calories: 2000, protein: 140, water: 3000, sleep: 8, steps: 10000 };

  // Calculate today's water
  const todayLogs = water.filter(w => w.date === today);
  const todayTotal = todayLogs.reduce((sum, w) => sum + w.amount, 0);
  const waterPercent = Math.min(100, (todayTotal / goals.water) * 100);

  // 1. Prepare 7-day chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(dateStr => {
    const dayLogs = water.filter(w => w.date === dateStr);
    const dayTotal = dayLogs.reduce((sum, w) => sum + w.amount, 0);
    return {
      date: new Date(dateStr).toLocaleDateString('default', { weekday: 'short' }),
      Amount: dayTotal / 1000, // convert to Liters
      Goal: goals.water / 1000
    };
  });

  // Calculate stats
  const averageWater = water.length > 0
    ? Math.round(water.reduce((sum, w) => sum + w.amount, 0) / new Set(water.map(w => w.date)).size)
    : 0;

  // 3D Card Hover Effect
  const hover3D = {
    y: -6,
    rotateX: 2,
    rotateY: -2,
    z: 10,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(14, 165, 233, 0.15)'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2.5">
          <Droplet className="w-8 h-8 text-sky-400" /> Water Tracker
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Stay hydrated to boost fat metabolism and reduce water retention bloat.
        </p>
      </div>

      {/* Grid: SVG Animation and Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: SVG Bottle Animation */}
        <motion.div 
          whileHover={hover3D}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="lg:col-span-5 glass-card-3d shadow-neon-water p-6 flex flex-col items-center justify-center space-y-6 cursor-default"
        >
          <h2 className="text-lg font-semibold text-slate-100 self-start">Hydration Cylinder</h2>

          {/* 3D Glass Cylinder */}
          <div className="relative w-44 h-80 border-[3px] border-slate-700/80 rounded-[36px] overflow-hidden bg-slate-950/60 flex flex-col justify-end shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_10px_25px_rgba(0,0,0,0.9)]">
            
            {/* 3D Glass Cylindrical Highlights */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/5 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none z-20" />

            {/* Cylinder Top Bevel */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-850/60 border-b border-white/5 rounded-t-[33px] z-30 pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]" />

            {/* Water Wave Fill */}
            <motion.div 
              className="w-[250%] h-[125%] bg-gradient-to-t from-sky-650 to-sky-400 absolute left-1/2 -translate-x-1/2 rounded-[42%] water-wave opacity-90 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
              style={{ bottom: `calc(${waterPercent}% - 120%)` }}
              animate={{ bottom: `calc(${waterPercent}% - 120%)` }}
              transition={{ type: 'spring', damping: 15 }}
            />

            {/* Percentage Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <span className="text-4xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">{Math.round(waterPercent)}%</span>
              <span className="text-xs font-bold text-slate-350 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] mt-1">{(todayTotal / 1000).toFixed(2)}L / {(goals.water / 1000).toFixed(1)}L</span>
            </div>
          </div>

          {/* Quick Logging Buttons */}
          <div className="grid grid-cols-4 gap-2.5 w-full">
            {[250, 500, 750, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 font-black py-3 rounded-2xl transition-all active:scale-95 flex flex-col items-center text-xs gap-1 shadow-md shadow-sky-950/10 select-none"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                {amount >= 1000 ? '1.0 L' : `${amount}ml`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right: History Chart & Stats */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ y: -4 }}
              className="glass-card-3d p-4 text-center cursor-default"
            >
              <Compass className="w-5 h-5 text-sky-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-250">{(averageWater / 1000).toFixed(1)} L</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Daily Average</div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -4 }}
              className="glass-card-3d p-4 text-center cursor-default"
            >
              <Award className="w-5 h-5 text-brand-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-250">
                {todayTotal >= goals.water ? 'Goal Met! 🎉' : `${Math.max(0, goals.water - todayTotal)}ml left`}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Today's Status</div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -4 }}
              className="glass-card-3d p-4 text-center cursor-default"
            >
              <Droplet className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-250">
                {water.filter(w => w.date === today).length} logs
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Log Count</div>
            </motion.div>
          </div>

          {/* 7-Day Chart */}
          <motion.div 
            whileHover={hover3D}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-card-3d p-6 cursor-default"
          >
            <h2 className="text-lg font-semibold text-slate-100 mb-4">7-Day Hydration History</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit="L" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="Amount" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

      </div>

      {/* Today's Logs */}
      <div className="glass-card-3d p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Today's Hydration Log</h2>
        {todayLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayLogs.map((w) => (
              <div key={w.id} className="flex justify-between items-center bg-slate-950/40 border border-slate-800/40 px-4 py-3 rounded-2xl text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{w.amount} ml</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{w.timestamp}</div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteWater(w.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            No water logged yet today. Use the quick add buttons above to start drinking!
          </div>
        )}
      </div>
    </div>
  );
};
