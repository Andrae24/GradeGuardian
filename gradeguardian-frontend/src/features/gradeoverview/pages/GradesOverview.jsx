import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, AlertCircle, 
  CheckCircle2, ArrowUpRight, GraduationCap 
} from 'lucide-react';

const GradesOverview = () => {
  const [courses, setCourses] = useState([]);
  const userEmail = localStorage.getItem('userEmail');

  // CONFIGURATION: Dynamic API URL for Production/Local
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // --- SECURE POST FETCH LOGIC ---
  useEffect(() => {
    const fetchActiveGrades = async () => {
      if (!userEmail) return;

      try {
        // Updated to use API_BASE_URL
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

  // Calculate "Live GWA" for active semester
  const calculateLiveGWA = () => {
    let totalPoints = 0;
    let totalUnits = 0;

    courses.forEach(c => {
      const mid = parseFloat(c.midtermGrade) || 0;
      const fin = parseFloat(c.finalGrade) || 0;
      
      // Dynamic weighting calculation
      const mw = (c.midtermWeight || 50) / 100;
      const fw = (c.finalWeight || 50) / 100;
      const avg = (mid * mw) + (fin * fw);
      
      if (avg > 0) {
        totalPoints += (avg * (c.units || 0));
        totalUnits += (c.units || 0);
      }
    });

    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-10 w-full">
        
        {/* Header */}
        <header>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Academic Overview</h2>
          <p className="text-slate-500 font-medium">Real-time performance tracking for the current term.</p>
        </header>

        {/* Live GWA Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-violet-600 to-indigo-700 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
              <GraduationCap size={180} />
            </div>
            <div className="relative z-10 space-y-6">
              <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Term GWA</span>
              <h1 className="text-8xl font-black tracking-tighter italic leading-none">
                {calculateLiveGWA()}
              </h1>
              <div className="flex gap-4 items-center text-white/80 font-bold italic">
                <TrendingUp size={20} /> On track for Latin Honors
              </div>
            </div>
          </motion.div>

          <div className="bg-[#161B22] border border-slate-800 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center">
            <BarChart3 size={48} className="text-violet-500 mb-4" />
            <h3 className="text-white font-black uppercase text-xl italic">Units Logged</h3>
            <p className="text-5xl font-black text-white mt-2">
              {courses.reduce((sum, c) => sum + (c.units || 0), 0)}
            </p>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Total Load</p>
          </div>
        </div>

        {/* Detailed List */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            Current Subject Standings <ArrowUpRight size={20} className="text-violet-500" />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => {
              const mid = parseFloat(course.midtermGrade) || 0;
              const fin = parseFloat(course.finalGrade) || 0;
              
              const mw = (course.midtermWeight || 50) / 100;
              const fw = (course.finalWeight || 50) / 100;
              const avg = (mid * mw) + (fin * fw);

              const savedStatus = localStorage.getItem(`course_status_${course.id}`);
              const isFinalized = savedStatus === 'PASSED';

              return (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#161B22] p-8 rounded-[2.5rem] border border-slate-800 hover:border-violet-500/50 transition-all shadow-xl group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-white font-black uppercase italic text-lg leading-tight group-hover:text-violet-400 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{course.courseCode}</p>
                    </div>
                    {isFinalized ? (
                      <CheckCircle2 size={24} className="text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    ) : (
                      <AlertCircle size={24} className="text-amber-500" />
                    )}
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-800/50 pt-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Running GPA</p>
                      <p className="text-3xl font-black text-white italic tracking-tighter">{avg > 0 ? avg.toFixed(2) : "N/A"}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isFinalized ? 'text-emerald-500' : 'text-amber-500'}`}>
                         {isFinalized ? 'Secure' : 'Pending'}
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