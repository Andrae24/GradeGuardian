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

  // --- UPDATED: SECURE POST FETCH LOGIC ---
  const fetchSemesters = async () => {
    if (!userEmail) return;

    try {
      // Changed to POST to bypass URL firewall issues, matching Dashboard strategy
      const res = await fetch(`http://localhost:8080/api/semesters/my-semesters`, {
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
  }, [userEmail]);

  const handleSaveSemester = async (selectedData) => {
    const { yearLevel, term, selectedCourses } = selectedData;
    if (!selectedCourses || selectedCourses.length === 0) return;

    // --- UNIT-WEIGHTED GWA LOGIC ---
    let totalGradePoints = 0;
    let totalUnits = 0;

    selectedCourses.forEach(course => {
      // Logic adjusted for your 1.0 - 5.0 scale
      const midterm = parseFloat(course.midtermGrade) || 0;
      const final = parseFloat(course.finalGrade) || 0;
      const units = parseInt(course.units) || 3;
      
      // Dynamic weight aware calculation
      const mw = (course.midtermWeight || 50) / 100;
      const fw = (course.finalWeight || 50) / 100;
      const courseAverage = (midterm * mw) + (final * fw);

      totalGradePoints += (courseAverage * units);
      totalUnits += units;
    });

    const calculatedGWA = parseFloat((totalGradePoints / totalUnits).toFixed(2));

    const payload = {
      yearLevel,
      term,
      gwa: calculatedGWA,
      courseCount: selectedCourses.length,
      userEmail: userEmail,
      courseCodes: selectedCourses.map(c => c.courseCode)
    };

    try {
      const response = await fetch('http://localhost:8080/api/semesters', {
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
        const res = await fetch(`http://localhost:8080/api/semesters/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) fetchSemesters();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 p-8 font-sans">
      
      {/* --- LAYOUT FIX: Centered Max-Width Container --- */}
      <div className="max-w-[1400px] mx-auto space-y-10 w-full">
        
        {/* Header */}
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tight uppercase italic drop-shadow-sm">GWA Hub</h2>
            <p className="text-slate-400 font-medium">Your academic journey, calculated and stored.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95 shadow-violet-600/20"
          >
            <Plus size={20} /> Add New Semester
          </button>
        </header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {(!semesters || semesters.length === 0) ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[4rem] bg-[#161B22]/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent pointer-events-none"></div>
              <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-8 text-slate-500 border border-slate-700 shadow-2xl relative z-10">
                <ClipboardList size={48} className="animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter relative z-10 text-center">
                Ready for your <br/> Semester Report?
              </h3>
              <p className="text-slate-500 max-w-xs text-center mt-4 font-medium text-sm leading-relaxed">
                Once you finalize your subject targets, generate a semester card here to lock in your weighted GWA.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {semesters.map((sem, index) => (
                <motion.div
                  key={sem.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
      {/* --- END LAYOUT FIX --- */}
      
      <AddSemesterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveSemester} 
      />
    </div>
  );
};

const SemesterCard = ({ semester, onDelete }) => (
  <div className="bg-[#161B22] p-8 rounded-[3rem] border border-slate-800 hover:border-violet-500/50 transition-all group shadow-2xl relative overflow-hidden cursor-default">
    <div className="flex justify-between items-start mb-8">
      <div className="bg-violet-600/10 p-4 rounded-2xl text-violet-400 border border-violet-500/20">
        <Calculator size={28} />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weighted GWA</p>
        <h3 className="text-4xl font-black text-white tracking-tighter">
          {semester?.gwa ? parseFloat(semester.gwa).toFixed(2) : "0.00"}
        </h3>
      </div>
    </div>
    
    <div className="space-y-1 mb-8">
      <h4 className="text-white font-black text-2xl uppercase italic tracking-tight leading-tight">
        {semester?.yearLevel || "Year Unknown"}
      </h4>
      <p className="text-slate-500 font-bold text-sm tracking-wide">
        {semester?.term || "Semester Unknown"}
      </p>
    </div>

    <div className="pt-6 border-t border-slate-800/50 flex justify-between items-center">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {semester?.courseCount || 0} Subjects
      </span>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
          title="Delete Record"
        >
          <Trash2 size={18} />
        </button>
        <Link 
          to={`/semester/${semester.id}`}
          className="flex items-center gap-2 text-violet-500 font-black text-xs uppercase tracking-tighter hover:translate-x-1 transition-transform cursor-pointer"
        >
          Details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </div>
);

export default GWAHub;