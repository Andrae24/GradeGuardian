import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavItem = ({ icon, label, to }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:translate-x-0.5 border ${
          isActive 
            ? 'bg-violet-600/10 border-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/5' 
            : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
        }`
      }
    >
      {/* Icon Wrapper for Custom Sizing Uniformity */}
      <div className="flex items-center justify-center shrink-0">
        {icon}
      </div> 
      <span className="leading-none pt-[1px]">{label}</span>
    </NavLink>
  );
};