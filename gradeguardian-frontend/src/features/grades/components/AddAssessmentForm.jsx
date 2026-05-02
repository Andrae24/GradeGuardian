import React, { useState } from 'react';
import { X, Plus, Calculator, CheckCircle, BrainCircuit } from 'lucide-react';

export const AddAssessmentForm = ({ isOpen, onClose, onSubmit, periodName = 'Midterm' }) => {
  const [assessmentName, setAssessmentName] = useState('');
  const [weight, setWeight] = useState('');
  const [score, setScore] = useState('');
  const [totalPoints, setTotalPoints] = useState('100');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      name: assessmentName,
      weight: parseFloat(weight) || 0,
      score: parseFloat(score) || 0,
      total: parseFloat(totalPoints) || 100,
      period: periodName.toUpperCase(),
    };

    onSubmit(payload);
    
    // Reset Form
    setAssessmentName('');
    setWeight('');
    setScore('');
    setTotalPoints('100');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#161B22] rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden">
        
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
               <Plus size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white tracking-tight">Add {periodName} Grade</h2>
               <p className="text-slate-500 text-xs mt-0.5">Input your specific assessment details.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assessment Name</label>
            <input 
              required type="text" value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              placeholder="e.g. My Custom Exam"
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-violet-600 outline-none transition-all font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Weight (Period %)</label>
            <div className="relative">
              <input 
                required type="number" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 20"
                className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold text-lg focus:ring-2 focus:ring-violet-600 outline-none transition-all"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-lg">%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Score</label>
                <input 
                    required type="number" value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold text-lg outline-none transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Total Points</label>
                <input 
                    required type="number" value={totalPoints}
                    onChange={(e) => setTotalPoints(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold text-lg outline-none transition-all"
                />
            </div>
          </div>

          <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98]">
            Save Grade
          </button>
        </form>
      </div>
    </div>
  );
};