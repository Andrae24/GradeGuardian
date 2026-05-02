import React from 'react';

export const StatCard = ({ label, value, trend, icon, color = "text-emerald-500" }) => {
  return (
    <div className="bg-[#161B22] p-6 rounded-[2rem] border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <div className="p-2 bg-[#0B0E14] rounded-lg border border-slate-800">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
      {/* This color prop now controls the 'Missed targets!' text color */}
      <p className={`${color} text-[10px] mt-2 font-bold uppercase tracking-wide`}>
        {trend}
      </p>
    </div>
  );
};