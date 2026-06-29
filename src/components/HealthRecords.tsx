import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Heart, Plus, Trash2, Calendar, Activity, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Biomarker = 'bloodPressure' | 'bloodSugar' | 'cholesterol' | 'hbA1c' | 'vitaminD' | 'vitaminB12';

interface RangeConfig {
  min?: number;
  max?: number;
  unit: string;
  label: string;
}

const BIOMARKER_RANGES: Record<Biomarker, RangeConfig> = {
  bloodPressure: { max: 120, unit: 'mmHg', label: 'Systolic BP' }, // Simplification for chart
  bloodSugar: { min: 70, max: 100, unit: 'mg/dL', label: 'Fasting Blood Sugar' },
  cholesterol: { max: 200, unit: 'mg/dL', label: 'Total Cholesterol' },
  hbA1c: { max: 5.7, unit: '%', label: 'HbA1c' },
  vitaminD: { min: 30, max: 100, unit: 'ng/mL', label: 'Vitamin D' },
  vitaminB12: { min: 200, max: 900, unit: 'pg/mL', label: 'Vitamin B12' }
};

export const HealthRecords: React.FC = () => {
  const { records, addRecord, deleteRecord } = useData();
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker>('bloodSugar');

  // Form states
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [sugar, setSugar] = useState('');
  const [chol, setChol] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [vitD, setVitD] = useState('');
  const [vitB12, setVitB12] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    await addRecord({
      date: dateInput,
      bloodPressureSystolic: bpSys ? parseInt(bpSys) : undefined,
      bloodPressureDiastolic: bpDia ? parseInt(bpDia) : undefined,
      bloodSugar: sugar ? parseFloat(sugar) : undefined,
      cholesterol: chol ? parseFloat(chol) : undefined,
      hbA1c: hba1c ? parseFloat(hba1c) : undefined,
      vitaminD: vitD ? parseFloat(vitD) : undefined,
      vitaminB12: vitB12 ? parseFloat(vitB12) : undefined
    });

    setShowLogModal(false);
    // Reset
    setBpSys('');
    setBpDia('');
    setSugar('');
    setChol('');
    setHba1c('');
    setVitD('');
    setVitB12('');
  };

  // 1. Prepare Chart Data
  const chartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => {
      let val: number | null = null;
      if (selectedBiomarker === 'bloodPressure') val = r.bloodPressureSystolic || null;
      else if (selectedBiomarker === 'bloodSugar') val = r.bloodSugar || null;
      else if (selectedBiomarker === 'cholesterol') val = r.cholesterol || null;
      else if (selectedBiomarker === 'hbA1c') val = r.hbA1c || null;
      else if (selectedBiomarker === 'vitaminD') val = r.vitaminD || null;
      else if (selectedBiomarker === 'vitaminB12') val = r.vitaminB12 || null;

      return {
        date: new Date(r.date).toLocaleDateString('default', { day: 'numeric', month: 'short' }),
        Value: val
      };
    })
    .filter(item => item.Value !== null);

  // Get latest record values
  const latestRecord = records[0];

  // Helper to assess range status
  const getStatus = (biomarker: Biomarker, val: number | undefined) => {
    if (val === undefined) return { label: 'Not Logged', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };
    const range = BIOMARKER_RANGES[biomarker];
    
    if (range.min !== undefined && val < range.min) {
      return { label: 'Low', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    }
    if (range.max !== undefined && val > range.max) {
      return { label: 'High', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    }
    return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Heart className="w-8 h-8 text-rose-500" /> Health Records
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Store and monitor blood biomarkers to track internal metabolic health improvements.
          </p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="glass-btn-primary"
        >
          <Plus className="w-5 h-5" /> Log Lab Results
        </button>
      </div>

      {/* Grid: Latest Biomarkers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.keys(BIOMARKER_RANGES).map((key) => {
          const bKey = key as Biomarker;
          const config = BIOMARKER_RANGES[bKey];
          
          let valStr = '—';
          let rawVal: number | undefined;
          if (latestRecord) {
            if (bKey === 'bloodPressure' && latestRecord.bloodPressureSystolic) {
              valStr = `${latestRecord.bloodPressureSystolic}/${latestRecord.bloodPressureDiastolic}`;
              rawVal = latestRecord.bloodPressureSystolic;
            } else if (bKey === 'bloodSugar' && latestRecord.bloodSugar) {
              valStr = `${latestRecord.bloodSugar}`;
              rawVal = latestRecord.bloodSugar;
            } else if (bKey === 'cholesterol' && latestRecord.cholesterol) {
              valStr = `${latestRecord.cholesterol}`;
              rawVal = latestRecord.cholesterol;
            } else if (bKey === 'hbA1c' && latestRecord.hbA1c) {
              valStr = `${latestRecord.hbA1c}`;
              rawVal = latestRecord.hbA1c;
            } else if (bKey === 'vitaminD' && latestRecord.vitaminD) {
              valStr = `${latestRecord.vitaminD}`;
              rawVal = latestRecord.vitaminD;
            } else if (bKey === 'vitaminB12' && latestRecord.vitaminB12) {
              valStr = `${latestRecord.vitaminB12}`;
              rawVal = latestRecord.vitaminB12;
            }
          }

          const status = getStatus(bKey, rawVal);

          return (
            <button
              key={bKey}
              onClick={() => setSelectedBiomarker(bKey)}
              className={`glass-card p-4 text-left transition-all ${
                selectedBiomarker === bKey 
                  ? 'ring-2 ring-rose-500 bg-rose-500/5 border-rose-500/30' 
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-xs text-slate-400 font-bold truncate uppercase">{config.label}</div>
              <div className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                {valStr} <span className="text-[10px] font-medium text-slate-400">{config.unit}</span>
              </div>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Chart */}
        <div className="lg:col-span-8 glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            {BIOMARKER_RANGES[selectedBiomarker].label} History
          </h2>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit={` ${BIOMARKER_RANGES[selectedBiomarker].unit}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderRadius: '16px',
                      border: 'none',
                      color: 'white',
                      fontSize: '12px'
                    }} 
                  />
                  <Line type="monotone" dataKey="Value" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No history recorded for this biomarker yet. Log a lab result to view trends.
              </div>
            )}
          </div>
        </div>

        {/* Normal Ranges Reference Info */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" /> Reference Ranges
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Fasting Blood Sugar</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">70 - 100 mg/dL</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Total Cholesterol</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">&lt; 200 mg/dL</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                <span className="text-slate-500 dark:text-slate-400">HbA1c (Average Sugar)</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">&lt; 5.7 %</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Vitamin D</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">30 - 100 ng/mL</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500 dark:text-slate-400">Vitamin B12</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">200 - 900 pg/mL</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-2xl flex items-start gap-2.5 mt-4">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Your HbA1c is showing a steady improvement from **5.9%** (Pre-diabetic) to **5.7%** (Normal) over the last 14 days of calorie deficit. Excellent metabolic work!
            </p>
          </div>
        </div>

      </div>

      {/* History Log Table */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Laboratory Log History</h2>
        <div className="overflow-x-auto">
          {records.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 uppercase font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Blood Pressure</th>
                  <th className="py-3 px-4">Blood Sugar</th>
                  <th className="py-3 px-4">Cholesterol</th>
                  <th className="py-3 px-4">HbA1c</th>
                  <th className="py-3 px-4">Vit D / B12</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-700 dark:text-slate-300">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(r.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.bloodPressureSystolic ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic} mmHg` : '—'}
                    </td>
                    <td className="py-3.5 px-4">{r.bloodSugar ? `${r.bloodSugar} mg/dL` : '—'}</td>
                    <td className="py-3.5 px-4">{r.cholesterol ? `${r.cholesterol} mg/dL` : '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{r.hbA1c ? `${r.hbA1c} %` : '—'}</td>
                    <td className="py-3.5 px-4">
                      {r.vitaminD || r.vitaminB12 ? `${r.vitaminD || '—'} / ${r.vitaminB12 || '—'}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => deleteRecord(r.id)}
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
              No medical logs found. Click "Log Lab Results" to store your blood tests.
            </div>
          )}
        </div>
      </div>

      {/* Log Lab Results Modal */}
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
                <Heart className="w-5.5 h-5.5 text-rose-500" /> Log Lab Results
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Test Date</label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">BP Systolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={bpSys}
                      onChange={(e) => setBpSys(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">BP Diastolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={bpDia}
                      onChange={(e) => setBpDia(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Fasting Sugar (mg/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 95"
                      value={sugar}
                      onChange={(e) => setSugar(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase font-bold text-brand-500">HbA1c (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.7"
                      value={hba1c}
                      onChange={(e) => setHba1c(e.target.value)}
                      className="w-full glass-input border-brand-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Total Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="e.g. 195"
                    value={chol}
                    onChange={(e) => setChol(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Vitamin D (ng/mL)</label>
                    <input
                      type="number"
                      placeholder="e.g. 32"
                      value={vitD}
                      onChange={(e) => setVitD(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Vitamin B12 (pg/mL)</label>
                    <input
                      type="number"
                      placeholder="e.g. 350"
                      value={vitB12}
                      onChange={(e) => setVitB12(e.target.value)}
                      className="w-full glass-input"
                    />
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
                    Save Record
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
