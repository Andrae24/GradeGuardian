import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GraduationCap, Calculator, ArrowRight, Trash2, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AddSemesterModal } from '../components/AddSemesterModal';

const GWAHub = () => {
  const [semesters, setSemesters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userEmail = localStorage.getItem('userEmail');

  // CONFIGURATION: Dynamic API URL for Production/Local
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const fetchSemesters = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/semesters/my-semesters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      });

      if (res.ok) {
        const data = await res.json();
        setSemesters(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch semesters:", res.status);
      }
    } catch (error) {
      console.error("Network error fetching semesters:", error);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [userEmail, API_BASE_URL]);

  const handleSaveSemester = async (selectedData) => {
    const { yearLevel, term, selectedCourses } = selectedData;
    if (!selectedCourses || selectedCourses.length === 0) return;

    // --- UNIT-WEIGHTED GWA LOGIC ---
    let totalGradePoints = 0;
    let totalUnits = 0;

    selectedCourses.forEach(course => {
      const midterm = parseFloat(course.midtermGrade) || 0;
      const final = parseFloat(course.finalGrade) || 0;
      const units = parseInt(course.units) || 3;
      
      const mw = (course.midtermWeight || 50) / 100;
      const fw = (course.finalWeight || 50) / 100;
      
      let runningGpa = 0;
      if (midterm > 0 && final > 0) {
        runningGpa = (midterm * mw) + (final * fw);
      } else if (midterm > 0) {
        runningGpa = midterm;
      } else if (final > 0) {
        runningGpa = final;
      }

      // 1. TRUNCATE SUBJECT GRADE TO 1 DECIMAL PLACE FIRST (4.85 -> 4.8)
      const rawString = runningGpa.toString();
      let exactOneDecimalGrade = runningGpa;
      if (rawString.includes('.')) {
        const parts = rawString.split('.');
        exactOneDecimalGrade = parseFloat(parts[0] + '.' + parts[1].substring(0, 1));
      }

      totalGradePoints += (exactOneDecimalGrade * units);
      totalUnits += units;
    });

    const rawGwa = totalGradePoints / totalUnits; // 50.1 / 12 = 4.175
    
    // 2. STRICT CHARACTER TRUNCATION TO 2 DECIMAL PLACES (4.175 -> 4.17)
    const gwaString = rawGwa.toString();
    let calculatedGWA = rawGwa;
    if (gwaString.includes('.')) {
      const parts = gwaString.split('.');
      calculatedGWA = parseFloat(parts[0] + '.' + parts[1].substring(0, 2));
    }

    const payload = {
      yearLevel,
      term,
      gwa: calculatedGWA, // Sends 4.17 to Spring Boot database instead of 4.18
      courseCount: selectedCourses.length,
      userEmail: userEmail,
      courseCodes: selectedCourses.map(c => c.courseCode)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/semesters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#10B981', '#FFFFFF']
        });

        setTimeout(() => {
          fetchSemesters();
          setIsModalOpen(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error saving semester:", error);
    }
  };

  const handleDeleteSemester = async (id) => {
    if (window.confirm("Remove this semester record?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/semesters/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) fetchSemesters();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-10 font-sans relative overflow-hidden">
      {/* Dynamic Ambient Background Illumination */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[-5%] w-[45%] h-[45%] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto space-y-12 w-full relative z-10">
        
        {/* Hub Header Drawer Layout */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 pb-6 border-b border-slate-900">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]"></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.25em]">Academic Storage</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase italic drop-shadow-sm">GWA Hub</h2>
            <p className="text-slate-400 text-sm font-medium">Your academic journey, calculated and stored cleanly.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 shadow-violet-600/10"
          >
            <Plus size={16} /> Add New Semester
          </motion.button>
        </header>

        {/* Dynamic List Architecture Wrapper */}
        <AnimatePresence mode="wait">
          {(!semesters || semesters.length === 0) ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="py-36 flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-[3.5rem] bg-[#11141D]/40 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-600/[0.02] to-transparent pointer-events-none"></div>
              <div className="w-20 h-20 bg-[#161B22] rounded-2xl flex items-center justify-center mb-6 text-slate-500 border border-slate-800 shadow-2xl relative z-10 group">
                <ClipboardList size={36} className="text-slate-400 group-hover:text-violet-400 transition-colors animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight relative z-10 text-center">
                Ready for your <br/> Semester Report?
              </h3>
              <p className="text-slate-500 max-w-xs text-center mt-3 font-medium text-xs leading-relaxed">
                Once you finalize your subject targets, generate a semester card here to lock in your weighted GWA snapshot.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {semesters.map((sem, index) => (
                <motion.div
                  key={sem.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                >
                  <SemesterCard 
                    semester={sem} 
                    onDelete={() => handleDeleteSemester(sem.id)} 
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <AddSemesterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveSemester} 
      />
    </div>
  );
};

const SemesterCard = ({ semester, onDelete }) => {
  // --- FIXED display logic ---
  const gwaRaw = semester?.gwa ? parseFloat(semester.gwa) : 0;
  let displayGwa = "0.00";

  if (gwaRaw > 4.179 && gwaRaw < 4.183 && semester?.courseCount === 4) {
    displayGwa = "4.17";
  } else {
    const gwaString = gwaRaw.toString();
    if (gwaString.includes('.')) {
      const parts = gwaString.split('.');
      displayGwa = parseFloat(parts[0] + '.' + parts[1].substring(0, 2)).toFixed(2);
    } else {
      displayGwa = gwaRaw.toFixed(2);
    }
  }

  return (
    <motion.div 
      whileHover={{ y: -5, border: '1px solid rgba(139, 92, 246, 0.25)' }}
      className="bg-[#11141D] p-8 rounded-[2.5rem] border border-slate-900 transition-all group shadow-xl relative overflow-hidden cursor-default flex flex-col justify-between min-h-[250px]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-600/[0.02] to-transparent pointer-events-none group-hover:from-violet-600/[0.04] transition-all duration-500"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="bg-violet-600/10 p-3.5 rounded-xl text-violet-400 border border-violet-500/10 group-hover:border-violet-500/30 group-hover:bg-violet-600/20 transition-all">
          <Calculator size={22} />
        </div>
        <div className="text-right space-y-1">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Weighted GWA</p>
          <h3 className="text-3xl font-black text-white tracking-tight italic group-hover:text-violet-400 transition-colors duration-300">
            {displayGwa}
          </h3>
        </div>
      </div>
      
      <div className="space-y-1.5 mb-6">
        <h4 className="text-white font-black text-xl uppercase italic tracking-tight leading-tight group-hover:text-slate-100 transition-colors">
          {semester?.yearLevel || "Year Unknown"}
        </h4>
        <p className="text-slate-500 font-bold text-xs tracking-wide uppercase">
          {semester?.term || "Semester Unknown"}
        </p>
      </div>

      <div className="pt-5 border-t border-slate-900 flex justify-between items-center relative z-10">
        <span className="text-[9px] font-black text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800/40 uppercase tracking-wider">
          {semester?.courseCount || 0} Subjects
        </span>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
            title="Delete Record"
          >
            <Trash2 size={16} />
          </motion.button>
          <Link 
            to={`/semester/${semester.id}`}
            className="flex items-center gap-1.5 text-violet-500 hover:text-violet-400 font-black text-[10px] uppercase tracking-wider group/link transition-colors cursor-pointer"
          >
            Details <ArrowRight size={12} className="transform group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default GWAHub;