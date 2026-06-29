import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { dbService } from '../services/db';
import { Camera, Plus, Trash2, Calendar, LayoutGrid, Sliders, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProgressPhotos: React.FC = () => {
  const { isFirebase } = useData() as any; // check if firebase is active
  const [photos, setPhotos] = useState<{ id: string, type: 'front' | 'side' | 'back', url: string, date: string }[]>([]);
  const [activeAngle, setActiveAngle] = useState<'front' | 'side' | 'back'>('front');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Form states
  const [uploadAngle, setUploadAngle] = useState<'front' | 'side' | 'back'>('front');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);

  // Load photos
  const loadPhotos = async () => {
    const list = await dbService.getProgressPhotos(!!isFirebase);
    setPhotos(list);
  };

  useEffect(() => {
    loadPhotos();
  }, [isFirebase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Helper to load presets for testing
  const handleLoadPreset = (presetUrl: string) => {
    setImageFile(presetUrl);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;

    const id = `photo_${Date.now()}`;
    await dbService.saveProgressPhoto(id, uploadAngle, imageFile, photoDate, !!isFirebase);
    
    setImageFile(null);
    setShowUploadModal(false);
    loadPhotos();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      await dbService.deleteProgressPhoto(id, !!isFirebase);
      loadPhotos();
    }
  };

  // Filter photos by active angle
  const anglePhotos = photos
    .filter(p => p.type === activeAngle)
    .sort((a, b) => a.date.localeCompare(b.date)); // Oldest first for comparison

  const beforePhoto = anglePhotos[0];
  const afterPhoto = anglePhotos.length > 1 ? anglePhotos[anglePhotos.length - 1] : null;

  // Mock presets to let the user test out the comparison slider instantly
  const mockPresets = [
    { name: 'Preset Shape A', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60' },
    { name: 'Preset Shape B', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Camera className="w-8 h-8 text-indigo-500" /> Progress Photos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Compare visual changes over time. Muscle gain and fat loss aren't always visible on the scale!
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="glass-btn-primary"
        >
          <Plus className="w-5 h-5" /> Upload Photo
        </button>
      </div>

      {/* Angle Selector Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-700/20 max-w-md">
        {(['front', 'side', 'back'] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => setActiveAngle(angle)}
            className={`flex-1 text-sm capitalize py-2.5 rounded-xl font-bold transition-all ${
              activeAngle === angle 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {angle} View
          </button>
        ))}
      </div>

      {/* Comparison Slider Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* The Drag Slider Container */}
        <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" /> Before vs. After Slider
          </h2>

          {beforePhoto && afterPhoto ? (
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-inner group select-none">
              {/* Before Photo (Left/Background) */}
              <img 
                src={beforePhoto.url} 
                alt="Before" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-white uppercase z-10 border border-white/10">
                Before: {new Date(beforePhoto.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              {/* After Photo (Right/Foreground, Clipped) */}
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img 
                  src={afterPhoto.url} 
                  alt="After" 
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div className="absolute top-4 right-4 bg-brand-500/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-white uppercase z-10 border border-brand-400/20">
                After: {new Date(afterPhoto.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              {/* Invisible Slider Input representing the drag divider */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPosition} 
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />

              {/* Slider Divider Line & Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-15"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Sliders className="w-4 h-4 text-indigo-500 rotate-90" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col items-center justify-center text-center p-6">
              <Camera className="w-12 h-12 text-slate-400 mb-2" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Need More Photos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                You need to upload at least **two** photos under the **{activeAngle} view** to activate the sliding comparison.
              </p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="mt-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                + Upload First Photo
              </button>
            </div>
          )}
        </div>

        {/* Right: History Grid */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-indigo-500" /> Photo Timeline
            </h2>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {anglePhotos.length > 0 ? (
                [...anglePhotos].reverse().map((p) => (
                  <div key={p.id} className="flex gap-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 p-2.5 rounded-xl text-sm items-center">
                    <img src={p.url} alt="Thumbnail" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-wider">{p.type} View</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(p.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 dark:text-slate-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No photos uploaded for this angle.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-4 text-[11px] text-slate-400 italic">
            Tip: Take your progress photos under the same lighting and at the same time of day (preferably fasted in the morning) for the most accurate comparison.
          </div>
        </div>

      </div>

      {/* Upload Photo Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
            />
            
            <motion.div 
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Camera className="w-5.5 h-5.5 text-indigo-500" /> Upload Progress Photo
              </h3>
              
              <form onSubmit={handleUpload} className="space-y-4">
                
                {/* Angle Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">View Angle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['front', 'side', 'back'] as const).map((angle) => (
                      <button
                        key={angle}
                        type="button"
                        onClick={() => setUploadAngle(angle)}
                        className={`text-xs capitalize py-2 rounded-xl font-bold border transition-all ${
                          uploadAngle === angle 
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {angle}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Date Taken</label>
                    <input
                      type="date"
                      required
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                {/* File Upload / Camera Trigger */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Select Image Source</label>
                  
                  {/* Preset Quick Loader for testing */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {mockPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLoadPreset(preset.url)}
                        className="text-[10px] bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-500 border border-indigo-500/10 py-2 rounded-xl font-semibold"
                      >
                        Use {preset.name}
                      </button>
                    ))}
                  </div>

                  {imageFile ? (
                    <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img src={imageFile} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-500/40 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Choose Image File</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => { setShowUploadModal(false); setImageFile(null); }}
                    className="flex-1 glass-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!imageFile}
                    className="flex-1 glass-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Photo
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
