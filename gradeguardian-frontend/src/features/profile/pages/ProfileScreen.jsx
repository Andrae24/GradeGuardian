import React, { useState } from 'react';
import { User, Settings, Moon, LogOut, ChevronRight, Shield, Award, BookOpen, Layers, Zap, Bell, Lock } from 'lucide-react';

export default function ProfileScreen({ onLogout }) {
  const user = {
    name: "Alex Calingasan",
    course: "BSIT - 3rd Year",
    stats: {
      gpa: "1.25",
      units: 86,
      standing: "Junior"
    }
  };

  const [isGpaSystem, setIsGpaSystem] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNotifsOn, setIsNotifsOn] = useState(true);

  return (
    // Global Background: Deep Midnight with a subtle gradient at the bottom
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 pb-24 relative overflow-hidden">

      {/* Decorative Background Blob (Glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* --- 1. Hero Section (Glassmorphism) --- */}
      <div className="relative pt-14 pb-8 px-6 z-10">
        <div className="flex flex-col items-center text-center">

          {/* Avatar with Animated Glow Ring */}
          <div className="relative mb-5 group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative w-28 h-28 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center overflow-hidden">
               {/* Fallback Icon */}
               <Shield size={48} className="text-violet-400" />
            </div>
            {/* Edit Badge */}
            <div className="absolute bottom-1 right-1 bg-slate-700 border-2 border-slate-900 p-1.5 rounded-full text-white shadow-sm">
                <Settings size={14} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
          <p className="text-slate-400 text-sm font-medium mt-1 mb-5">{user.course}</p>

          {/* Achievement Badges */}
          <div className="flex gap-3">
             <Badge label="Dean's Lister" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" icon={<Award size={12}/>} />
             <Badge label="Scholar" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" icon={<BookOpen size={12}/>} />
          </div>
        </div>
      </div>

      {/* --- 2. Stats Cards (Floating) --- */}
      <div className="px-6 mb-8 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
             value={user.stats.gpa} label="Current GPA"
             icon={<Award size={16} />}
             accent="text-emerald-400" bg="bg-emerald-500/5" border="border-emerald-500/20"
          />
          <StatCard
             value={user.stats.units} label="Units Earned"
             icon={<Layers size={16} />}
             accent="text-violet-400" bg="bg-violet-500/5" border="border-violet-500/20"
          />
          <StatCard
             value={user.stats.standing} label="Standing"
             icon={<User size={16} />}
             accent="text-blue-400" bg="bg-blue-500/5" border="border-blue-500/20"
          />
        </div>
      </div>

      {/* --- 3. Settings Menu --- */}
      <div className="px-6 space-y-8 relative z-10">

        {/* Group: Preferences */}
        <SettingsGroup title="Preferences">
          <MenuItem
            icon={<Settings size={18} />}
            label="Grading Format"
            subLabel="How grades are displayed"
            rightElement={
              <Toggle
                isActive={isGpaSystem}
                labelOn="GPA" labelOff="%"
                onToggle={() => setIsGpaSystem(!isGpaSystem)}
              />
            }
          />
           <MenuItem
            icon={<Bell size={18} />}
            label="Notifications"
            rightElement={
              <Toggle isActive={isNotifsOn} onToggle={() => setIsNotifsOn(!isNotifsOn)} />
            }
          />
          <MenuItem
            icon={<Moon size={18} />}
            label="Dark Mode"
            rightElement={
              <Toggle isActive={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} locked />
            }
          />
        </SettingsGroup>

        {/* Group: Account */}
        <SettingsGroup title="Account Security">
          <MenuItem
            icon={<Lock size={18} />}
            label="Change Password"
            rightElement={<ChevronRight size={18} className="text-slate-600" />}
          />
          <MenuItem
            icon={<Shield size={18} />}
            label="Privacy Policy"
            rightElement={<ChevronRight size={18} className="text-slate-600" />}
          />
        </SettingsGroup>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full group relative overflow-hidden rounded-2xl p-[1px] focus:outline-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-slate-900 rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors group-hover:bg-slate-800">
             <LogOut size={20} className="text-red-500 group-hover:text-red-400 transition-colors" />
             <span className="font-bold text-red-500 group-hover:text-red-400 transition-colors">Log Out</span>
          </div>
        </button>

        <p className="text-center text-xs text-slate-600 pb-4">Grade Guardian v1.0.0 • Build 2026</p>

      </div>
    </div>
  );
}

// --- Enhanced Sub-Components ---

function Badge({ label, color, bg, border, icon }) {
  return (
    <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border backdrop-blur-md ${bg} ${border} shadow-sm`}>
      <span className={color}>{icon}</span>
      <span className={`text-xs font-bold ${color}`}>{label}</span>
    </div>
  )
}

function StatCard({ value, label, icon, accent, bg, border }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border backdrop-blur-sm bg-slate-800/40 border-slate-700/50 shadow-lg hover:border-slate-600 transition-all group`}>
       <div className={`mb-2 p-2 rounded-full ${bg} ${border} ${accent} group-hover:scale-110 transition-transform duration-300`}>
         {icon}
       </div>
       <span className="text-lg font-bold text-white mb-0.5">{value}</span>
       <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{label}</span>
    </div>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">{title}</h3>
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden divide-y divide-slate-700/50 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, subLabel, rightElement }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors cursor-pointer active:bg-slate-700/50">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-800 rounded-xl text-slate-400 border border-slate-700 shadow-sm">
          {icon}
        </div>
        <div>
           <div className="font-semibold text-slate-200 text-sm">{label}</div>
           {subLabel && <div className="text-xs text-slate-500 mt-0.5">{subLabel}</div>}
        </div>
      </div>
      <div>{rightElement}</div>
    </div>
  );
}

function Toggle({ isActive, onToggle, labelOn, labelOff, locked }) {
  return (
    <button
      onClick={!locked ? onToggle : undefined}
      className={`relative w-12 h-7 rounded-full transition-all duration-300 flex items-center border ${isActive ? 'bg-violet-600 border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-slate-700 border-slate-600'} ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`absolute left-1 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-300 transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></span>

      {/* Tiny text inside the toggle track */}
      {labelOn && labelOff && (
        <span className={`absolute text-[9px] font-bold transition-opacity duration-300 ${isActive ? 'left-2 opacity-0' : 'right-1.5 text-slate-400 opacity-100'}`}>
          {labelOff}
        </span>
      )}
      {labelOn && labelOff && (
         <span className={`absolute text-[9px] font-bold transition-opacity duration-300 ${isActive ? 'left-1.5 text-violet-100 opacity-100' : 'right-2 opacity-0'}`}>
           {labelOn}
         </span>
      )}
    </button>
  );
}