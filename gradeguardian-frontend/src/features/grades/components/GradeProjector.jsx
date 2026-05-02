import React, { useState } from 'react';
import { Target, ArrowRight, Calculator, TrendingUp } from 'lucide-react';
import { transmuteGPAtoRaw } from '../../../utils/gradeCalculations';

export const GradeProjector = ({ 
  initialCS1 = 0, 
  initialPE = 0, 
  totalWeightUsed = 60, // Passed directly from the live table!
  activePeriodProp = 'MIDTERM',
  onSaveTarget
}) => {
  const [targetGPA, setTargetGPA] = useState('3.0'); 

  // --- THE NEW LOGIC: Fully dynamic based on the live table ---
  const targetRaw = transmuteGPAtoRaw(targetGPA); 
  const currentTotalContrib = parseFloat(initialCS1) + parseFloat(initialPE);
  
  // Dynamically calculate exactly how much weight is ACTUALLY left
  const examWeight = Math.max(0, 100 - parseFloat(totalWeightUsed));
  const examWeightDecimal = examWeight / 100;

  const calculateRequired = () => {
    if (examWeight <= 0) return 0;
    return Math.max(0, (targetRaw - currentTotalContrib) / examWeightDecimal);
  };

  const requiredScore = calculateRequired();
  const isImpossible = requiredScore > 100;
  const isAlreadyAchieved = currentTotalContrib >= targetRaw; 

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Live Sync Badge */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center">
         <span className="text-emerald-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
           Live Synced to Table Data
         </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161B22] p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Current Contributions
            </h4>
            
            {/* Read-Only Live Stats */}
            <div className="space-y-4">
              <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">
                <div className="flex items-center gap-3 text-slate-400"><TrendingUp size={18}/> <span className="text-[10px] font-black uppercase tracking-widest">Class Standing</span></div>
                <span className="text-white font-black">{initialCS1} pts</span>
              </div>
              <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">
                <div className="flex items-center gap-3 text-slate-400"><Calculator size={18}/> <span className="text-[10px] font-black uppercase tracking-widest">Exams</span></div>
                <span className="text-white font-black">{initialPE} pts</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50 space-y-2">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">Target Course GPA</label>
              <div className="relative group">
                <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500" size={18} />
                <input type="number" step="0.1" value={targetGPA} onChange={(e) => setTargetGPA(e.target.value)} className="w-full bg-violet-500/5 border border-violet-500/30 rounded-2xl py-4 pl-14 pr-6 text-white font-bold text-lg focus:ring-2 focus:ring-violet-600 outline-none transition-all"/>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-[#161B22] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl relative">
            <div className="px-8 py-6 border-b border-slate-800 bg-white/[0.02] flex justify-between items-center">
              <span className="text-white font-bold text-sm uppercase italic">Prediction Engine</span>
              <div className="flex gap-2"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-[#0B0E14] px-3 py-1 rounded-full border border-slate-800">{activePeriodProp} Mode</span></div>
            </div>

            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-800/50">
                <ScenarioRow label="Remaining Exam Weight" value={`${examWeight}%`} />
                <ScenarioRow label="Total Earned Points" value={`+${parseFloat(currentTotalContrib).toFixed(1)}%`} />
                <ScenarioRow label="Goal Raw Score" value={`${targetRaw.toFixed(1)}%`} highlight={true} />
                
                <tr className={`${isImpossible ? 'bg-red-500/10' : isAlreadyAchieved ? 'bg-emerald-500/10' : 'bg-violet-600/10'} transition-colors duration-500`}>
                  <td className="px-8 py-8" colSpan={2}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-black uppercase tracking-widest text-[11px]">Required on Exam</span>
                        <p className={`text-4xl font-black mt-1 ${isAlreadyAchieved ? 'text-emerald-500' : isImpossible ? 'text-red-500' : 'text-white'}`}>
                           {isAlreadyAchieved ? "SECURED" : examWeight === 0 ? "NO WEIGHT LEFT" : `${requiredScore.toFixed(1)}%`}
                        </p>
                      </div>
                      
                      {!isImpossible && !isAlreadyAchieved && examWeight > 0 && (
                        <button onClick={() => onSaveTarget(activePeriodProp === 'MIDTERM' ? 'Midterm Exam' : 'Final Exam', requiredScore.toFixed(1), activePeriodProp, targetGPA)} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-xl active:scale-95 border border-white/10">
                          SET TARGET <ArrowRight size={16}/>
                        </button>
                      )}
                      {isImpossible && <span className="text-red-500 font-black uppercase text-[10px] animate-pulse tracking-[0.2em] bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">Impossible Goal</span>}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScenarioRow = ({ label, value, highlight = false }) => (
  <tr className={`transition-colors hover:bg-white/[0.01]`}>
    <td className={`px-8 py-6 text-sm font-medium ${highlight ? 'text-violet-400 font-bold' : 'text-slate-400'}`}>{label}</td>
    <td className={`px-8 py-6 text-right font-black text-lg ${highlight ? 'text-violet-400' : 'text-white'}`}>{value}</td>
  </tr>
);