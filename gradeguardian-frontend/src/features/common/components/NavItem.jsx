import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavItem = ({ icon, label, to }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
          isActive 
            ? 'bg-violet-600/10 text-violet-500 font-medium' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      {icon} 
      <span>{label}</span>
    </NavLink>
  );
};