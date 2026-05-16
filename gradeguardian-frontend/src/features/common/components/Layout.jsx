import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, GraduationCap, 
  Settings as SettingsIcon, LogOut, Calculator 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NavItem } from './NavItem';

export const Layout = () => {
  const navigate = useNavigate();

  const handleLogOut = () => {
    // --- SELECTIVE CLEAR LOGIC ---
    Object.keys(localStorage).forEach(key => {
      const isPendingGoal = key.startsWith('pendingGoal_');
      const isCourseStatus = key.startsWith('course_status_');
      
      // If it's NOT one of those, it's safe to remove
      if (!isPendingGoal && !isCourseStatus) {
        localStorage.removeItem(key);
      }
    });
    
    navigate('/login'); 
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07090E] text-slate-100 font-sans relative selection:bg-violet-500/40">
      {/* Cinematic Ambient Ambient Light Point Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[45%] bg-violet-600/[0.03] rounded-full blur-[130px] pointer-events-none"></div>

      {/* Premium Re-designed Sidebar Component Container */}
      <aside className="w-64 bg-[#11141D] border-r border-slate-900 flex flex-col justify-between py-8 px-5 z-20 shrink-0 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-violet-600/[0.01] to-transparent pointer-events-none"></div>
        
        <div className="space-y-10 relative z-10">
          {/* Logo Header Wrapper */}
          <div className="flex items-center gap-3.5 px-2 relative group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="bg-violet-600 p-2.5 rounded-xl flex items-center justify-center text-white relative z-10 shadow-lg shadow-violet-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h1 className="text-white text-base font-black uppercase tracking-tight italic leading-none">Grade Guardian</h1>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.25em] mt-1.5">Night Owl Edition</p>
            </div>
          </div>

          {/* Navigation Elements Menu Stack */}
          <nav className="space-y-1.5 pt-2">
            <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" to="/dashboard" />
            <NavItem icon={<GraduationCap size={18}/>} label="Academic Overview" to="/grades-overview" />
            <NavItem icon={<Calculator size={18}/>} label="GWA Hub" to="/gwa-calculator" />
            <NavItem icon={<SettingsIcon size={18}/>} label="Settings" to="/settings" />
          </nav>
        </div>

        {/* System Exit Sidebar Drawer Footer */}
        <div className="pt-6 border-t border-slate-900 mt-auto relative z-10">
          <motion.button 
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogOut}
            className="flex w-full items-center gap-3.5 px-4 py-3.5 rounded-xl text-red-500 hover:text-red-400 bg-red-500/[0.02] hover:bg-red-500/5 border border-red-500/0 hover:border-red-500/10 font-black uppercase tracking-wider text-[10px] transition-all"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Viewport Workspace Terminal Canvas */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#07090E] custom-scrollbar relative z-10">
        <div className="pb-24"> 
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};