import React, { useState, useEffect } from 'react';
import { X, Plus, CheckCircle, ListPlus, Trash2, GitMerge } from 'lucide-react';

export const AddAssessmentForm = ({ isOpen, onClose, onSubmit, periodName = 'Midterm', autoFillCSScore = 0 }) => {
  const [assessmentName, setAssessmentName] = useState('');
  const [weight, setWeight] = useState('');
  
  // Standard Mode States
  const [score, setScore] = useState('');
  const [totalPoints, setTotalPoints] = useState('100');

  // Modes
  const [isBatchMode, setIsBatchMode] = useState(false); 
  const [isSplitMode, setIsSplitMode] = useState(false); 
  
  const [batchItems, setBatchItems] = useState([{ id: 1, score: '', total: '100' }]);
  // Updated Split Items to include score and total
  const [splitItems, setSplitItems] = useState([{ id: 1, name: '', subWeight: '', score: '0', total: '100' }]);

  useEffect(() => {
    if (!isBatchMode && !isSplitMode && assessmentName.trim().toUpperCase() === 'CLASS STANDING' && autoFillCSScore > 0) {
      setScore(autoFillCSScore.toFixed(1));
      setTotalPoints('100');
    }
  }, [assessmentName, autoFillCSScore, isBatchMode, isSplitMode]);

  if (!isOpen) return null;

  const addItem = (type) => {
    if (type === 'batch') setBatchItems([...batchItems, { id: Date.now(), score: '', total: '100' }]);
    else setSplitItems([...splitItems, { id: Date.now(), name: '', subWeight: '', score: '0', total: '100' }]);
  };

  const removeItem = (type, id) => {
    if (type === 'batch' && batchItems.length > 1) setBatchItems(batchItems.filter(i => i.id !== id));
    if (type === 'split' && splitItems.length > 1) setSplitItems(splitItems.filter(i => i.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSplitMode) {
      const totalCategoryWeight = parseFloat(weight) || 0;
      splitItems.forEach(item => {
        const actualWeight = (parseFloat(item.subWeight) / 100) * totalCategoryWeight;
        onSubmit({
          name: item.name || assessmentName,
          weight: actualWeight,
          score: parseFloat(item.score) || 0,
          total: parseFloat(item.total) || 100,
          period: periodName.toUpperCase(),
        });
      });
    } 
    else if (isBatchMode) {
      const finalScore = batchItems.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);
      const finalTotal = batchItems.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
      onSubmit({
        name: assessmentName,
        weight: parseFloat(weight) || 0,
        score: finalScore,
        total: finalTotal || 100,
        period: periodName.toUpperCase(),
      });
    } 
    else {
      onSubmit({
        name: assessmentName,
        weight: parseFloat(weight) || 0,
        score: parseFloat(score) || 0,
        total: parseFloat(totalPoints) || 100,
        period: periodName.toUpperCase(),
      });
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setAssessmentName(''); setWeight(''); setScore(''); setTotalPoints('100');
    setIsBatchMode(false); setIsSplitMode(false);
    setBatchItems([{ id: 1, score: '', total: '100' }]);
    setSplitItems([{ id: 1, name: '', subWeight: '', score: '0', total: '100' }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#161B22] rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="px-8 pt-8 pb-4 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
               <Plus size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Add {periodName} Grade</h2>
               <p className="text-slate-500 text-xs mt-0.5">Input your specific assessment details.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-all"><X size={24} /></button>
        </div>

        <div className="overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
          <form id="assessment-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assessment/Category Name</label>
              <input required type="text" value={assessmentName} onChange={(e) => setAssessmentName(e.target.value)} placeholder="e.g. Major Exams" className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-violet-600 outline-none transition-all font-semibold" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Total Weight (%)</label>
              <div className="relative">
                <input required type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 60" className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold text-lg focus:ring-2 focus:ring-violet-600 outline-none transition-all" />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-lg">%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <ToggleButton icon={<ListPlus size={16}/>} label="Group Scores" sublabel="Sum Quizzes, Seatworks, Activities, and etc" isActive={isBatchMode} onClick={() => {setIsBatchMode(!isBatchMode); setIsSplitMode(false);}} />
                <ToggleButton icon={<GitMerge size={16}/>} label="Split Weights" sublabel="Syllabus Mode" isActive={isSplitMode} onClick={() => {setIsSplitMode(!isSplitMode); setIsBatchMode(false);}} />
            </div>

            {isSplitMode ? (
              <div className="space-y-4 bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl">
                 <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sub-Assessments</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase italic">Leave score 0 for future exams</p>
                 </div>
                 {splitItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-[#0B0E14] p-3 rounded-xl border border-slate-800/50">
                        <div className="col-span-5">
                            <input placeholder="Name" value={item.name} onChange={(e) => setSplitItems(splitItems.map(i => i.id === item.id ? {...i, name: e.target.value} : i))} className="w-full bg-transparent text-white text-xs font-bold outline-none" required/>
                        </div>
                        <div className="col-span-2 flex items-center gap-1 border-l border-slate-800 pl-2">
                             <input type="number" placeholder="W%" value={item.subWeight} onChange={(e) => setSplitItems(splitItems.map(i => i.id === item.id ? {...i, subWeight: e.target.value} : i))} className="w-full bg-transparent text-blue-400 text-xs font-black outline-none" required/>
                             <span className="text-[8px] text-slate-600">%</span>
                        </div>
                        <div className="col-span-4 flex items-center gap-1 border-l border-slate-800 pl-2">
                             <input type="number" placeholder="Score" value={item.score} onChange={(e) => setSplitItems(splitItems.map(i => i.id === item.id ? {...i, score: e.target.value} : i))} className="w-full bg-transparent text-white text-xs outline-none" required/>
                             <span className="text-slate-600">/</span>
                             <input type="number" placeholder="Total" value={item.total} onChange={(e) => setSplitItems(splitItems.map(i => i.id === item.id ? {...i, total: e.target.value} : i))} className="w-full bg-transparent text-white text-xs outline-none" required/>
                        </div>
                        <div className="col-span-1 flex justify-end">
                            <button type="button" onClick={() => removeItem('split', item.id)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                        </div>
                    </div>
                 ))}
                 <button type="button" onClick={() => addItem('split')} className="w-full py-2 border border-dashed border-slate-700 rounded-xl text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">+ Add Sub-Assessments</button>
              </div>
            ) : isBatchMode ? (
                <div className="space-y-3 bg-violet-500/5 border border-violet-500/20 p-5 rounded-2xl">
                    {batchItems.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center">
                            <input type="number" placeholder="Score" value={item.score} onChange={(e) => setBatchItems(batchItems.map(i => i.id === item.id ? {...i, score: e.target.value} : i))} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none" required/>
                            <span className="text-slate-600">/</span>
                            <input type="number" placeholder="Total" value={item.total} onChange={(e) => setBatchItems(batchItems.map(i => i.id === item.id ? {...i, total: e.target.value} : i))} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none" required/>
                            <button type="button" onClick={() => removeItem('batch', item.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addItem('batch')} className="w-full py-2 border border-dashed border-slate-700 rounded-xl text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">+ Add Score</button>
                </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Score</label>
                    <input required type="number" step="any" value={score} onChange={(e) => setScore(e.target.value)} className={`w-full bg-[#0B0E14] border rounded-2xl py-4 px-6 font-bold text-lg outline-none transition-all ${assessmentName.trim().toUpperCase() === 'CLASS STANDING' && autoFillCSScore > 0 ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-800 text-white'}`} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Total Points</label>
                    <input required type="number" value={totalPoints} onChange={(e) => setTotalPoints(e.target.value)} className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl py-4 px-6 text-white font-bold text-lg outline-none transition-all" />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="px-8 pb-8 pt-4 shrink-0 bg-[#161B22] border-t border-slate-800/50">
          <button form="assessment-form" type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98]">Save Assessment</button>
        </div>
      </div>
    </div>
  );
};

const ToggleButton = ({ icon, label, sublabel, isActive, onClick }) => (
    <button type="button" onClick={onClick} className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-1 ${isActive ? 'bg-violet-600 border-violet-500 text-white' : 'bg-[#0B0E14] border-slate-800 text-slate-500 hover:border-slate-600'}`}>
        {icon}
        <p className="text-[11px] font-black uppercase tracking-tighter mt-1">{label}</p>
        <p className={`text-[9px] font-medium ${isActive ? 'text-violet-200' : 'text-slate-600'}`}>{sublabel}</p>
    </button>
);