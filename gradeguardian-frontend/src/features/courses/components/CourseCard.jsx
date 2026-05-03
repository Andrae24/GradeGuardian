import React from 'react';
import { Target } from 'lucide-react';

// Added a fallback check: if courseId is missing, it will try to use id as a backup
export const CourseCard = ({ id, name, units, progress, color, bg, courseId }) => {
  
  // Try to find the pending goal using the numeric courseId first, then the string id
  const storageKey = `pendingGoal_${courseId || id}`;
  const pendingGoal = JSON.parse(localStorage.getItem(storageKey));

  return (
    <div className="bg-[#161B22] p-5 rounded-xl border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group relative">
      
      {/* STATUS BADGES - Positioned at the top for visibility */}
      <div className="flex gap-2 mb-3 min-h-[24px]">
        {pendingGoal && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-[9px] font-black uppercase tracking-widest border border-violet-500/30 animate-pulse">
            <Target size={12} /> Target Pending
          </span>
        )}
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Dynamic color for Course Code (e.g., WWW) */}
          <p className={`${color} text-[10px] font-bold uppercase tracking-wider`}>{id}</p>
          <h4 className="text-white font-bold transition-colors">{name}</h4>
        </div>
        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded font-bold">{units} Units</span>
      </div>

      <div className="space-y-2 mt-6">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
          <p className="text-slate-500">Weight Progress</p>
          <p className={color}>{progress}%</p>
        </div>
        <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`${bg} h-full rounded-full transition-all duration-700 ease-out`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};