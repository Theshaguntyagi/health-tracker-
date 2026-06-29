import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { signIn } = useData();
  const [email, setEmail] = useState('theshaguntyagi@gmail.com');
  const [password, setPassword] = useState('Shaguntyagi@2003');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-dark px-4 py-12 relative overflow-hidden select-none">
      
      {/* Dynamic Background Glowing Blobs */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
        className="w-full max-w-md glass-card-3d p-10 border border-slate-800/60 shadow-2xl relative z-10"
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/25 mb-4 border border-brand-400/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome to <span className="text-gradient-brand">Health AI</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Personal Health & Weight Tracker for Shagun
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-xs text-rose-400 font-bold"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="leading-normal">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter email address"
                className="w-full input-3d pl-11 pr-4 py-3 text-sm focus:border-brand-550 transition-all duration-300"
              />
              <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter password"
                className="w-full input-3d pl-11 pr-12 py-3 text-sm focus:border-brand-550 transition-all duration-300"
              />
              <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full btn-3d-brand py-3.5 font-bold text-sm flex items-center justify-center gap-2 mt-8 disabled:opacity-50 select-none cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <Check className="w-5 h-5" />
            ) : (
              'Sign In'
            )}
            {success ? 'Success!' : loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-slate-800/40 pt-6">
          <p className="text-[11px] text-slate-500 font-medium">
            🔒 Fully encrypted sync with your personal Firestore database
          </p>
        </div>
      </motion.div>
    </div>
  );
};
