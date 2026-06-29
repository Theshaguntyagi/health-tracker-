import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  AreaChart, Area, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Scale, Calendar, Plus, Trash2, TrendingDown, Clock, HelpCircle, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WeightTracker: React.FC = () => {
  const { weights, addWeight, deleteWeight, profile } = useData();
  const [showLogModal, setShowLogModal] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeSubTab, setActiveSubTab] = useState<'trend' | 'bmi'>('trend');

  // Form states
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  // Interactive BMI Calculator States (initialized with profile data)
  const [calcHeight, setCalcHeight] = useState(profile?.height || 175);
  const [calcWeight, setCalcWeight] = useState(weights[0]?.weight || profile?.startWeight || 100);

  const targetWeight = profile?.targetWeight || 80;
  const startWeight = profile?.startWeight || 100;
  const currentWeight = weights[0]?.weight || startWeight;
  const currentWaist = weights[0]?.waist || 0;

  // 1. Calculate weight statistics
  const totalLost = Math.max(0, startWeight - currentWeight);
  
  // Calculate average weekly loss
  let weeklyLossRate = 0;
  let predictedWeeks = 0;
  let predictedDateStr = 'N/A';

  if (weights.length >= 2) {
    const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
    const firstEntry = sorted[0];
    const lastEntry = sorted[sorted.length - 1];
    
    const t1 = new Date(firstEntry.date).getTime();
    const t2 = new Date(lastEntry.date).getTime();
    const diffDays = Math.max(1, (t2 - t1) / (1000 * 60 * 60 * 24));
    
    const totalDiffWeight = firstEntry.weight - lastEntry.weight;
    const lossPerDay = totalDiffWeight / diffDays;
    weeklyLossRate = lossPerDay * 7;

    if (weeklyLossRate > 0.05) {
      const remainingWeight = lastEntry.weight - targetWeight;
      if (remainingWeight > 0) {
        predictedWeeks = remainingWeight / weeklyLossRate;
        const predDate = new Date();
        predDate.setDate(predDate.getDate() + Math.round(predictedWeeks * 7));
        predictedDateStr = predDate.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
      } else {
        predictedDateStr = 'Goal Reached!';
      }
    }
  }

  // 2. Prepare chart data
  const chartData = [...weights]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => ({
      date: new Date(w.date).toLocaleDateString('default', { day: 'numeric', month: 'short' }),
      Weight: w.weight,
      Waist: w.waist || null,
      Goal: targetWeight
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput || isNaN(parseFloat(weightInput))) return;

    await addWeight({
      date: dateInput,
      weight: parseFloat(weightInput),
      waist: waistInput ? parseFloat(waistInput) : undefined,
      notes: notesInput
    });

    // Sync interactive calculator values
    setCalcWeight(parseFloat(weightInput));

    // Reset and close
    setWeightInput('');
    setWaistInput('');
    setNotesInput('');
    setShowLogModal(false);
  };

  // 3D Card Hover Effect
  const hover3D = {
    y: -6,
    rotateX: 2,
    rotateY: -2,
    z: 10,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.15)'
  };

  // --- BMI & Body Comp Math ---
  const heightInMeters = calcHeight / 100;
  const computedBmi = Math.round((calcWeight / (heightInMeters * heightInMeters)) * 10) / 10;
  
  // Normal weight range for this height
  const minNormalWeight = Math.round(18.5 * heightInMeters * heightInMeters * 10) / 10;
  const maxNormalWeight = Math.round(24.9 * heightInMeters * heightInMeters * 10) / 10;
  const weightToLoseForNormal = Math.max(0, Math.round((calcWeight - maxNormalWeight) * 10) / 10);

  const getBmiDetails = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'bg-sky-500', textClass: 'text-sky-400', pct: Math.min(100, (bmiValue / 18.5) * 25) };
    if (bmiValue < 25) return { label: 'Normal Weight', color: 'bg-emerald-500', textClass: 'text-emerald-400', pct: 25 + ((bmiValue - 18.5) / 6.5) * 25 };
    if (bmiValue < 30) return { label: 'Overweight', color: 'bg-amber-500', textClass: 'text-amber-400', pct: 50 + ((bmiValue - 25) / 5) * 25 };
    return { label: 'Obese', color: 'bg-rose-500', textClass: 'text-rose-400', pct: 75 + Math.min(25, ((bmiValue - 30) / 10) * 25) };
  };

  const bmiDetails = getBmiDetails(computedBmi);

  // Waist-to-Height Ratio (WtHR)
  const wthr = currentWaist > 0 ? Math.round((currentWaist / calcHeight) * 100) / 100 : 0;
  const getWthrDetails = (ratio: number) => {
    if (ratio === 0) return { label: 'Log Waist to Calculate', color: 'text-slate-550' };
    if (ratio < 0.43) return { label: 'Extremely Slim', color: 'text-sky-400' };
    if (ratio <= 0.52) return { label: 'Healthy WtHR', color: 'text-emerald-400' };
    if (ratio <= 0.57) return { label: 'Overweight WtHR', color: 'text-amber-400' };
    return { label: 'Highly Increased Cardiovascular Risk', color: 'text-rose-450' };
  };
  const wthrDetails = getWthrDetails(wthr);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2.5">
            <Scale className="w-8 h-8 text-ai-400" /> Weight & Body Metrics
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Monitor weight trends, calculate body composition, and evaluate health risk metrics.
          </p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="btn-3d-ai text-sm py-2.5 px-5 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" /> Log Weight
        </button>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/40 max-w-sm">
        <button
          onClick={() => setActiveSubTab('trend')}
          className={`flex-1 text-xs py-2.5 rounded-xl font-black transition-all ${
            activeSubTab === 'trend' 
              ? 'bg-slate-800 text-white shadow-md shadow-black/30' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Weight Trend
        </button>
        <button
          onClick={() => setActiveSubTab('bmi')}
          className={`flex-1 text-xs py-2.5 rounded-xl font-black transition-all ${
            activeSubTab === 'bmi' 
              ? 'bg-slate-800 text-white shadow-md shadow-black/30' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          BMI & Body Comp
        </button>
      </div>

      {/* SUB TAB 1: TRENDS & CHART */}
      {activeSubTab === 'trend' && (
        <div className="space-y-6">
          {/* Grid: Statistics & Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Prediction Panel */}
            <motion.div 
              whileHover={hover3D}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="lg:col-span-4 glass-card-3d shadow-neon-ai p-6 flex flex-col justify-between space-y-4 cursor-default"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-brand-400" /> AI Prediction
                </h3>
                
                {weeklyLossRate > 0.05 ? (
                  <div className="space-y-3">
                    <div className="text-slate-400 text-sm leading-relaxed">
                      Losing an average of <strong className="text-brand-400">{weeklyLossRate.toFixed(2)} kg</strong> per week.
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Goal Date</div>
                      <div className="text-2xl font-black text-gradient-brand mt-1">{predictedDateStr}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Weeks Remaining</div>
                      <div className="text-xl font-bold text-slate-200 mt-0.5">{predictedWeeks.toFixed(1)} weeks</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-slate-400 text-sm leading-relaxed">
                      Need more data or a steady deficit to calculate your prediction.
                    </div>
                    <div className="flex items-start gap-2 bg-amber-550/5 border border-amber-500/10 p-3.5 rounded-2xl">
                      <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-400 leading-relaxed">
                        Maintain a calorie deficit of 500 kcal and log for at least 3 separate days to unlock prediction.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800/40 pt-4">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Target Goal Progress</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/35 p-[1px]">
                    <div 
                      className="bg-gradient-to-r from-ai-500 to-brand-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.round((totalLost / (startWeight - targetWeight)) * 100))}%` }} 
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {Math.min(100, Math.round((totalLost / (startWeight - targetWeight)) * 100))}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Chart Card */}
            <motion.div 
              whileHover={hover3D}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="lg:col-span-8 glass-card-3d p-6 cursor-default"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-100">Weight & Waist Trend</h2>
                
                {/* Timeframe selector */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/25">
                  {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`text-xs capitalize px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                        timeframe === t 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-205'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recharts Trend Line */}
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#94a3b8', fontSize: 10 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="left"
                        domain={['dataMin - 2', 'dataMax + 2']} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        domain={['dataMin - 5', 'dataMax + 5']} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderRadius: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '12px'
                        }} 
                      />
                      <ReferenceLine yAxisId="left" y={targetWeight} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Goal', fill: '#10b981', position: 'insideBottomRight', fontSize: 10 }} />
                      <Area yAxisId="left" type="monotone" dataKey="Weight" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                      <Line yAxisId="right" type="monotone" dataKey="Waist" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No entries logged yet. Add your weight to see your progress chart!
                  </div>
                )}
              </div>
            </motion.div>

          </div>

          {/* Weight Log History */}
          <div className="glass-card-3d p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Weight Entry History
            </h2>
            
            <div className="overflow-x-auto">
              {weights.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-bold">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4">Waist Size</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                    {weights.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {new Date(w.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-100">{w.weight} kg</td>
                        <td className="py-3.5 px-4">{w.waist ? `${w.waist} cm` : '—'}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 italic max-w-xs truncate">{w.notes || '—'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={() => deleteWeight(w.id)}
                            className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-slate-650 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-slate-550">
                  No history found. Click "Log Weight" above to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: BMI & BODY COMPOSITION */}
      {activeSubTab === 'bmi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Interactive Calculator Sliders */}
            <motion.div 
              whileHover={hover3D}
              className="lg:col-span-5 glass-card-3d p-6 space-y-6 cursor-default"
            >
              <div>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-450" /> Metric Calculator
                </h3>
                <p className="text-xs text-slate-450 mt-1">
                  Adjust sliders to evaluate potential body compositions.
                </p>
              </div>

              <div className="space-y-5">
                {/* Height Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-350 uppercase">
                    <span>Height</span>
                    <span className="text-brand-400">{calcHeight} cm</span>
                  </div>
                  <input 
                    type="range" 
                    min="140" 
                    max="220" 
                    value={calcHeight} 
                    onChange={(e) => setCalcHeight(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Weight Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-350 uppercase">
                    <span>Weight</span>
                    <span className="text-ai-400">{calcWeight} kg</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="160" 
                    step="0.5"
                    value={calcWeight} 
                    onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-ai-500"
                  />
                </div>
              </div>

              {/* Targets Summary */}
              <div className="border-t border-slate-800/40 pt-5 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Targets for {calcHeight}cm</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/40 border border-slate-800/30 p-3 rounded-2xl">
                    <span className="text-slate-450 block">Normal Weight Range</span>
                    <strong className="text-slate-200 text-sm block mt-1">{minNormalWeight} - {maxNormalWeight} kg</strong>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/30 p-3 rounded-2xl">
                    <span className="text-slate-450 block">Required Loss to Normal</span>
                    <strong className={`text-sm block mt-1 ${weightToLoseForNormal > 0 ? 'text-rose-450' : 'text-emerald-450'}`}>
                      {weightToLoseForNormal > 0 ? `${weightToLoseForNormal} kg` : 'At Normal Range! 🎉'}
                    </strong>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Visual Gauge and Risks */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* BMI Gauge Display */}
              <motion.div 
                whileHover={hover3D}
                className="glass-card-3d p-6 space-y-5 cursor-default"
              >
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-bold text-slate-100">Body Mass Index (BMI)</h3>
                  <span className={`text-3xl font-black ${bmiDetails.textClass}`}>{computedBmi}</span>
                </div>

                {/* Horizontal Gauge */}
                <div className="space-y-2.5">
                  <div className="relative w-full h-4 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800/35 p-[1px]">
                    <div className="w-1/4 h-full bg-sky-500/85" />
                    <div className="w-1/4 h-full bg-emerald-500/85 border-l border-slate-950" />
                    <div className="w-1/4 h-full bg-amber-500/85 border-l border-slate-950" />
                    <div className="w-1/4 h-full bg-rose-500/85 border-l border-slate-950" />
                    
                    {/* Gauge Marker */}
                    <motion.div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"
                      style={{ left: `calc(${bmiDetails.pct}% - 2px)` }}
                      animate={{ left: `calc(${bmiDetails.pct}% - 2px)` }}
                      transition={{ type: 'spring', stiffness: 100 }}
                    />
                  </div>
                  
                  {/* Gauge Labels */}
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">
                    <span>18.5</span>
                    <span>25.0</span>
                    <span>30.0</span>
                  </div>
                </div>

                {/* Category Card */}
                <div className="flex items-center gap-3.5 bg-slate-950/40 border border-slate-800/30 p-4 rounded-2xl">
                  <div className={`w-3.5 h-3.5 rounded-full ${bmiDetails.color} shrink-0 animate-pulse`} />
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Classification</div>
                    <div className="text-base font-black text-slate-200 mt-0.5">{bmiDetails.label}</div>
                  </div>
                </div>
              </motion.div>

              {/* Cardiometabolic Risk Analysis */}
              <motion.div 
                whileHover={hover3D}
                className="glass-card-3d p-6 space-y-4 cursor-default"
              >
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4.5 h-4.5 text-indigo-400" /> Cardiometabolic Risk Indicators
                </h3>

                <div className="space-y-3.5 text-xs text-slate-400">
                  {/* Waist-to-Height Ratio */}
                  <div className="flex justify-between items-center bg-slate-950/35 border border-slate-800/25 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Waist-to-Height Ratio</span>
                      <strong className={`text-sm block mt-1 ${wthrDetails.color}`}>{wthrDetails.label}</strong>
                    </div>
                    {wthr > 0 && <span className="text-lg font-black text-slate-200">{wthr}</span>}
                  </div>

                  {/* Combined Risk Classification */}
                  <div className="bg-slate-950/35 border border-slate-800/25 p-4 rounded-2xl space-y-2">
                    <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Disease Risk Matrix (Diabetes/Hypertension/CVD)</span>
                    <p className="text-xs text-slate-350 leading-relaxed mt-1">
                      {computedBmi >= 30 
                        ? "Based on your BMI class, your disease risk is classified as **High** to **Very High**. Sustained weight loss toward your 80kg target will significantly reduce arterial stiffness, blood glucose, and liver fat." 
                        : computedBmi >= 25 
                        ? "Based on your BMI class, your disease risk is **Increased**. Maintaining a waist circumference below 102cm (for men) is highly protective against visceral fat-induced inflammation." 
                        : "Your disease risk is **Minimal**. Keep maintaining a balanced protein-to-calorie ratio to support skeletal muscle mass."}
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      )}

      {/* Log Weight Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/65 backdrop-blur-sm" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
            />
            
            {/* Content */}
            <motion.div 
              className="relative bg-[#0b0f19] border border-slate-800/80 w-full max-w-md p-6 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Scale className="w-5.5 h-5.5 text-ai-400" /> Log Weight Entry
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="e.g. 98.4"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="w-full input-3d pr-10"
                      />
                      <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-500">kg</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Waist Size (Optional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 96"
                        value={waistInput}
                        onChange={(e) => setWaistInput(e.target.value)}
                        className="w-full input-3d pr-10"
                      />
                      <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-500">cm</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full input-3d"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Notes</label>
                  <textarea
                    placeholder="How are you feeling? Any cheat meals? Water retention?"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full input-3d h-20 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 btn-3d-secondary text-sm py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-3d-ai text-sm py-2"
                  >
                    Save Entry
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
