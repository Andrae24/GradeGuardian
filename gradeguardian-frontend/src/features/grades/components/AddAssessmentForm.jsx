import React, { useState, useEffect } from 'react';
import { X, Plus, CheckCircle, ListPlus, Trash2 } from 'lucide-react';

export const AddAssessmentForm = ({ isOpen, onClose, onSubmit, periodName = 'Midterm', autoFillCSScore = 0 }) => {
  const [assessmentName, setAssessmentName] = useState('');
  const [weight, setWeight] = useState('');
  
  // Standard Mode States
  const [score, setScore] = useState('');
  const [totalPoints, setTotalPoints] = useState('100');

  // NEW: Batch Grouping Mode States
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState([{ id: 1, score: '', total: '100' }]);

  // The "Magic Listener" for Auto-Filling Class Standing
  useEffect(() => {
    if (!isBatchMode && assessmentName.trim().toUpperCase() === 'CLASS STANDING' && autoFillCSScore > 0) {
      setScore(autoFillCSScore.toFixed(1));
      setTotalPoints('100');
    }
  }, [assessmentName, autoFillCSScore, isBatchMode]);

  if (!isOpen) return null;

  // Batch Item Handlers
  const handleAddBatchItem = () => {
    setBatchItems([...batchItems, { id: Date.now(), score: '', total: '100' }]);
  };

  const handleRemoveBatchItem = (idToRemove) => {
    if (batchItems.length > 1) {
      setBatchItems(batchItems.filter(item => item.id !== idToRemove));
    }
  };

  const updateBatchItem = (id, field, value) => {
    setBatchItems(batchItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalScore = score;
    let finalTotal = totalPoints;

    // If Batch Mode is on, dynamically calculate the sums!
    if (isBatchMode) {
      finalScore = batchItems.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);
      finalTotal = batchItems.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
      
      if (finalTotal === 0) {
          alert("Total points cannot be zero.");
          return;
      }
    }

    const payload = {
      name: assessmentName,
      weight: parseFloat(weight) || 0,
      score: parseFloat(finalScore) || 0,
      total: parseFloat(finalTotal) || 100,
      period: periodName.toUpperCase(),
    };

    onSubmit(payload);
    
    // Reset Form
    setAssessmentName('');
    setWeight('');
    setScore('');
    setTotalPoints('100');
    setIsBatchMode(false);
    setBatchItems([{ id: 1, score: '', total: '100' }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#161B22] rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start shrink-0">
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

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
          <form id="assessment-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pr-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assessment Name</label>
                 {!isBatchMode && assessmentName.trim().toUpperCase() === 'CLASS STANDING' && autoFillCSScore > 0 && (
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                     <CheckCircle size={10} /> Auto-Calculated
                   </span>
                 )}
              </div>
              <input 
                required type="text" value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                placeholder="e.g. Quizzes (All)"
                className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-violet-600 outline-none transition-all font-semibold"
              />
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Weight (Period %)</label>
              <div className="relative">
                <input 
                  required type="number" value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold text-lg focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-lg">%</span>
              </div>
            </div>

            {/* NEW: Batch Mode Toggle */}
            <div className="flex items-center justify-between bg-[#0B0E14] p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <ListPlus className="text-violet-400" size={20} />
                <div>
                  <p className="text-sm font-bold text-white">Group Multiple Items?</p>
                  <p className="text-[10px] text-slate-500 font-medium">e.g. Combine 5 quizzes into one grade</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsBatchMode(!isBatchMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isBatchMode ? 'bg-violet-600' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isBatchMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Dynamic Inputs: Batch vs Standard */}
            {isBatchMode ? (
              <div className="space-y-3 bg-violet-500/5 border border-violet-500/20 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                   <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Grouped Items</label>
                   <span className="text-xs font-black text-white">
                     Sum: <span className="text-violet-400">{batchItems.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0)}</span> / {batchItems.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0)}
                   </span>
                </div>
                
                {batchItems.map((item, index) => (
                    <div key={item.id} className="flex gap-3 items-center">
                        <span className="text-xs font-bold text-slate-500 w-4">{index + 1}.</span>
                        <input type="number" step="any" placeholder="Score" value={item.score} onChange={(e) => updateBatchItem(item.id, 'score', e.target.value)} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-violet-500 transition-all" required/>
                        <span className="text-slate-600 font-black">/</span>
                        <input type="number" step="any" placeholder="Total" value={item.total} onChange={(e) => updateBatchItem(item.id, 'total', e.target.value)} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-violet-500 transition-all" required/>
                        
                        <button type="button" onClick={() => handleRemoveBatchItem(item.id)} className={`p-2 transition-all ${batchItems.length === 1 ? 'opacity-20 cursor-not-allowed text-slate-600' : 'text-slate-600 hover:text-red-500'}`} disabled={batchItems.length === 1}>
                          <Trash2 size={16}/>
                        </button>
                    </div>
                ))}
                
                <button type="button" onClick={handleAddBatchItem} className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-xs font-black tracking-widest uppercase text-slate-400 hover:text-white hover:border-slate-500 transition-all mt-2">
                   + Add Another
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Score</label>
                    <input 
                        required type="number" step="any" value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className={`w-full bg-[#0B0E14] border rounded-2xl py-4 px-6 font-bold text-lg outline-none transition-all
                          ${assessmentName.trim().toUpperCase() === 'CLASS STANDING' && autoFillCSScore > 0 
                            ? 'border-emerald-500/50 text-emerald-400' 
                            : 'border-slate-800 text-white'}`}
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
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 shrink-0 bg-[#161B22] border-t border-slate-800/50">
          <button form="assessment-form" type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98]">
            Save Assessment
          </button>
        </div>

      </div>
    </div>
  );
};