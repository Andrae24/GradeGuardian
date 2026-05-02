import React from 'react';

export const CourseCard = ({ id, name, units, progress, color, bg }) => {
  return (
    // I also changed the hover border to a neutral slate so it doesn't clash with your custom colors!
    <div className="bg-[#161B22] p-5 rounded-xl border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* 🛠️ FIX: Replaced the hardcoded 'text-violet-500' with our dynamic '{color}' prop */}
          <p className={`${color} text-[10px] font-bold uppercase tracking-wider`}>{id}</p>
          <h4 className="text-white font-bold transition-colors">{name}</h4>
        </div>
        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">{units} Units</span>
      </div>
      <div className="space-y-2 mt-6">
        <div className="flex justify-between text-xs font-medium">
          <p className="text-slate-400">Current Progress</p>
          <p className={color}>{progress}%</p>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className={`${bg} h-full rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};