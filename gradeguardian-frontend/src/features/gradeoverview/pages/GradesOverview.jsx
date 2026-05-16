import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, AlertCircle, 
  CheckCircle2, ArrowUpRight, GraduationCap, XCircle
} from 'lucide-react';

const GradesOverview = () => {
  const [courses, setCourses] = useState([]);
  const userEmail = localStorage.getItem('userEmail');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const fetchActiveGrades = async () => {
      if (!userEmail) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/my-courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: userEmail }) 
        });
        
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        } else {
          console.error("Grades Fetch Failed:", res.status);
          setCourses([]); 
        }
      } catch (err) { 
        console.error("Network error:", err); 
        setCourses([]); 
      }
    };
    
    fetchActiveGrades();
  }, [userEmail, API_BASE_URL]);

  const calculateLiveGWA = () => {
    let totalPoints = 0;
    let totalUnits = 0;

    courses.forEach(c => {
      const mid = parseFloat(c.midtermGrade) || 0;
      const fin = parseFloat(c.finalGrade) || 0;
      
      const mw = (c.midtermWeight || 50) / 100;
      const fw = (c.finalWeight || 50) / 100;
      
      // Calculate running average and truncate cleanly to 1 decimal place character-wise (e.g., 4.85 -> 4.8)
      let avg = 0;
      if (mid > 0 && fin > 0) {
        const rawAvg = (mid * mw) + (fin * fw);
        const avgStr = rawAvg.toString();
        if (avgStr.includes('.')) {
          const parts = avgStr.split('.');
          avg = parseFloat(parts[0] + '.' + parts[1].substring(0, 1));
        } else {
          avg = rawAvg;
        }
      } else if (mid > 0) {
        avg = mid;
      }
      
      if (avg > 0) {
        totalPoints += (avg * (c.units || 0));
        totalUnits += (c.units || 0);
      }
    });

    if (totalUnits > 0) {
      const rawGwa = totalPoints / totalUnits; // 50.1 / 12 = 4.175
      const gwaString = rawGwa.toString();
      
      // --- FIXED: CHARACTER-BASED TWO-DECIMAL TRUNCATION (NO ROUNDING UP) ---
      if (gwaString.includes('.')) {
        const parts = gwaString.split('.');
        const wholeNumber = parts[0];
        const decimals = parts[1];
        
        // Strictly clip up to 2 decimal positions, then use format for padding layout structures
        const clippedDecimals = decimals.substring(0, 2);
        return parseFloat(wholeNumber + '.' + clippedDecimals).toFixed(2);
      } else {
        return rawGwa.toFixed(2);
      }
    }
    
    return "0.00";
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-10 font-sans relative overflow-hidden">
      {/* Cinematic Ambient Background Illumination */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/[0.02] rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto space-y-12 w-full relative z-10">
        
        {/* Section Header Block */}
        <header className="space-y-2 pb-6 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]"></div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.25em]">Live Analytics</span>
          </div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tight">Academic Overview</h2>
          <p className="text-slate-400 text-sm font-medium">Real-time performance tracking for the current active term.</p>
        </header>

        {/* Top Summary Cards Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-violet-600 to-indigo-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-violet-500/20"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.07] group-hover:scale-105 group-hover:opacity-10 transition-all duration-700 pointer-events-none">
              <GraduationCap size={220} />
            </div>
            <div className="relative z-10 space-y-8">
              <span className="bg-white/15 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">Active Term GWA</span>
              <h1 className="text-8xl font-black tracking-tighter italic leading-none text-white">
                {calculateLiveGWA()}
              </h1>
              <div className="flex gap-3 items-center text-white/90 font-bold italic text-sm tracking-wide">
                <TrendingUp size={18} className="text-emerald-400" /> On track for Graduation Honors
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#11141D] border border-slate-900 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group border-b-4 border-b-violet-500"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-600/[0.01] to-transparent pointer-events-none"></div>
            <div className="p-4 bg-slate-900 border border-slate-800/60 text-violet-400 rounded-2xl mb-4 group-hover:bg-violet-600/10 group-hover:text-violet-400 transition-all duration-300">
              <BarChart3 size={28} />
            </div>
            <h3 className="text-slate-400 font-black uppercase text-sm tracking-wider">Units Logged</h3>
            <p className="text-6xl font-black text-white italic tracking-tighter mt-3 leading-none">
              {courses.reduce((sum, c) => sum + (c.units || 0), 0)}
            </p>
            <p className="text-slate-600 font-black uppercase text-[9px] tracking-widest mt-4 bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-800/40">Total Load</p>
          </motion.div>
        </div>

        {/* Current Subject Standings Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2.5 ml-2">
            Current Subject Standings <ArrowUpRight size={18} className="text-violet-500" />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => {
              const mid = parseFloat(course.midtermGrade) || 0;
              const fin = parseFloat(course.finalGrade) || 0;
              
              const mw = (course.midtermWeight || 50) / 100;
              const fw = (course.finalWeight || 50) / 100;
              
              let avg = 0;
              if (mid > 0 && fin > 0) {
                const rawAvg = (mid * mw) + (fin * fw);
                const avgStr = rawAvg.toString();
                if (avgStr.includes('.')) {
                  const parts = avgStr.split('.');
                  avg = Math.floor(parseFloat(parts[0] + '.' + parts[1].substring(0, 1)) * 10) / 10;
                } else {
                  avg = rawAvg;
                }
              } else if (mid > 0) {
                avg = mid;
              }

              const isFinalized = course.finalGrade !== null && course.finalGrade !== undefined && course.finalGrade !== "";
              
              let statusText = 'Pending';
              let statusColor = 'text-amber-400 bg-amber-500/5 border-amber-500/10';
              let StatusIcon = AlertCircle;

              if (isFinalized) {
                if (avg >= 3.0) {
                  statusText = 'Secure';
                  statusColor = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]';
                  StatusIcon = CheckCircle2;
                } else {
                  statusText = 'Failed';
                  statusColor = 'text-red-400 bg-red-500/5 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.05)]';
                  StatusIcon = XCircle;
                }
              }

              return (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4, border: '1px solid rgba(139, 92, 246, 0.25)' }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 100 }}
                  className="bg-[#11141D] p-8 rounded-[2.5rem] border border-slate-900 shadow-xl group transition-all duration-350 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="space-y-1.5">
                      <h4 className="text-white font-black uppercase italic text-lg leading-snug group-hover:text-violet-400 transition-colors duration-300">
                        {course.title}
                      </h4>
                      <p className="text-slate-500 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
                        <span>{course.courseCode}</span>
                        <span className="text-slate-700 font-normal">•</span>
                        <span className="text-slate-400 font-bold">{course.units || 3} Units</span>
                      </p>
                    </div>
                    <div className={`p-2 rounded-xl border ${statusColor.split(' ')[1]} ${statusColor.split(' ')[2]} flex items-center justify-center text-current`}>
                      <StatusIcon size={18} className={statusColor.split(' ')[0]} />
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-900 pt-5">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Running GPA</p>
                      <p className="text-3xl font-black text-white italic tracking-tighter leading-none pt-1">
                        {avg > 0 ? avg.toFixed(1) : "N/A"}
                      </p>
                    </div>
                    <div className="text-right space-y-1.5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</p>
                       <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${statusColor}`}>
                         {statusText}
                       </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesOverview;