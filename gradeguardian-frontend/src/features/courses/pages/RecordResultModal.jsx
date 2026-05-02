import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { X, Save, Lock } from 'lucide-react';

// --- NEW: Added remainingWeight to the props ---
export const RecordResultModal = ({ isOpen, onClose, onSave, period, remainingWeight }) => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    score: '',
    total: '100'
  });

  const [examWeight, setExamWeight] = useState(40);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: period === 'MIDTERM' ? 'MIDTERM Exam' : 'FINAL Exam',
        score: '',
        total: '100'
      });

      // --- THE FIX: Use the remaining weight math from CourseDetails! ---
      // If remainingWeight is less than 0, default to 0 to prevent negative bugs.
      setExamWeight(remainingWeight > 0 ? remainingWeight : 0);
    }
  }, [isOpen, period, remainingWeight]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      weight: examWeight,
      score: parseFloat(formData.score),
      total: parseFloat(formData.total),
      period: period.toUpperCase()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#161B22] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Record Result</h3>
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em]">{period} Phase</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assessment Name</label>
            <input 
              type="text" required
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-violet-600 transition-all font-bold"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* READ-ONLY LOCKED WEIGHT */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Exam Weight</label>
            <div className="w-full bg-[#0B0E14]/50 border border-slate-800/50 rounded-2xl px-6 py-4 text-violet-400 font-black flex justify-between items-center cursor-not-allowed">
              <span className="text-lg">{examWeight}%</span>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Lock size={12} />
                <span className="text-[9px] uppercase tracking-widest">Locked to Syllabus</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Score</label>
              <input 
                type="number" step="0.1" required placeholder="0" autoFocus
                className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-violet-600 transition-all font-bold"
                value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Points</label>
              <input 
                type="number" step="0.1" required placeholder="100"
                className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-violet-600 transition-all font-bold"
                value={formData.total} onChange={(e) => setFormData({...formData, total: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-violet-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl shadow-violet-600/20 hover:bg-violet-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Exam Result
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full mt-3 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};