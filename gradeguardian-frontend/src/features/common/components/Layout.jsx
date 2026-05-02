import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Added useNavigate
import { 
  ShieldCheck, LayoutDashboard, GraduationCap, 
  Settings as SettingsIcon, LogOut,
  Calculator 
} from 'lucide-react';
import { NavItem } from './NavItem';

export const Layout = () => {
  const navigate = useNavigate(); // Initialize the navigate hook

  const handleLogOut = () => {
    // 1. Clear all local storage data (Grades, Targets, Goals)
    localStorage.clear();
    
    // 2. Redirect the user back to the login page (or landing page)
    navigate('/login'); 
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0E14] text-slate-100 font-sans relative">
      
      <aside className="w-64 bg-[#161B22] border-r border-slate-800 flex flex-col justify-between py-6 px-4 z-10 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-violet-600 p-2 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold leading-none">Grade Guardian</h1>
              <p className="text-slate-400 text-xs mt-1">Night Owl Edition</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" to="/dashboard" />
            <NavItem icon={<GraduationCap size={20}/>} label="Academic Overview" to="/grades-overview" />
            <NavItem icon={<Calculator size={20}/>} label="GWA Hub" to="/gwa-calculator" />
            <NavItem icon={<SettingsIcon size={20}/>} label="Settings" to="/settings" />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 mt-auto">
          {/* UPDATED: Added onClick handler */}
          <button 
            onClick={handleLogOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto bg-[#0B0E14] custom-scrollbar">
        <div className="pb-20"> 
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};