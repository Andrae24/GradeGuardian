import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Bell, CheckCircle, BarChart3, 
  Clock, AlertTriangle, Plus, AlertCircle, Trash2, LayoutGrid, ArrowRight, X, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { StatCard } from "../components/StatCard";
import { AddCourseModal } from "../../courses/components/AddCourseModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || "Student");
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const [searchTerm, setSearchTerm] = useState("");

  const [metrics, setMetrics] = useState({ 
    pending: 0, 
    attention: 0,
    passed: 0 
  });

  const fetchCourses = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/my-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }) 
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("❌ Failed to connect to backend:", error);
    }
  };

  const updateMetrics = () => {
    let pendingCount = 0;
    let attentionCount = 0;
    let passedCount = 0;

    courses.forEach(course => {
      const mid = parseFloat(course.midtermGrade) || 0;
      const fin = parseFloat(course.finalGrade) || 0;
      const mw = (course.midtermWeight || 50) / 100;
      const fw = (course.finalWeight || 50) / 100;

      const isFinalized = course.finalGrade !== null && course.finalGrade !== undefined && course.finalGrade !== "";
      
      let avg = 0;
      if (mid > 0 && fin > 0) {
        avg = Math.floor(((mid * mw) + (fin * fw)) * 10) / 10;
      } else if (mid > 0) {
        avg = mid;
      }

      if (isFinalized) {
        if (avg >= 3.0) passedCount++;
        else attentionCount++; 
      }

      const hasPendingGoal = localStorage.getItem(`pendingGoal_${course.id}`);
      if (hasPendingGoal) pendingCount++;
    });

    setMetrics({ pending: pendingCount, attention: attentionCount, passed: passedCount });
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { updateMetrics(); }, [courses]);
  useEffect(() => {
    window.addEventListener('focus', updateMetrics);
    return () => window.removeEventListener('focus', updateMetrics);
  }, [courses]);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let totalActiveUnits = 0;
  let totalGradePoints = 0;
  let totalPassedUnits = 0;

  courses.forEach(course => {
    const mid = parseFloat(course.midtermGrade) || 0;
    const fin = parseFloat(course.finalGrade) || 0;
    const mw = (course.midtermWeight || 50) / 100;
    const fw = (course.finalWeight || 50) / 100;

    let avg = 0;
    if (mid > 0 && fin > 0) avg = Math.floor(((mid * mw) + (fin * fw)) * 10) / 10;
    else if (mid > 0) avg = mid;

    if (avg > 0) {
      totalGradePoints += (avg * parseInt(course.units || 0));
      totalActiveUnits += parseInt(course.units || 0);
    }

    const isFinalized = course.finalGrade !== null && course.finalGrade !== undefined && course.finalGrade !== "";
    if (isFinalized && avg >= 3.0) totalPassedUnits += parseInt(course.units || 0);
  });

  const averageGPA = totalActiveUnits > 0 ? (totalGradePoints / totalActiveUnits).toFixed(2) : "3.00";
  const gpaLabel = totalActiveUnits > 0 ? "Current GWA" : "Min. Target";
  const totalUnits = courses.reduce((sum, course) => sum + parseInt(course.units || 0), 0);

  const handleAddCourse = async () => {
    await fetchCourses(); 
    setIsModalOpen(false);
  };

  const handleDeleteCourse = async (e, courseId, courseTitle) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Permanently remove "${courseTitle}"?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, { method: 'DELETE' });
      if (response.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        localStorage.removeItem(`pendingGoal_${courseId}`);
      }
    } catch (error) { console.error("Delete Error:", error); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07090E] text-slate-100 font-sans relative selection:bg-violet-500/40">
      {/* Cinematic Ambient Mesh Blurs */}
      <div className="absolute top-[-8%] left-[-5%] w-[45%] h-[45%] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[30%] w-[40%] h-[40%] bg-indigo-600/[0.02] rounded-full blur-[140px] pointer-events-none"></div>

      <main className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto w-full space-y-12">
          
          {/* Header Dashboard Area */}
          <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 pb-6 border-b border-slate-900">
            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]"></div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.25em]">Session Live</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight italic uppercase leading-none">
                Welcome back, {userName}!
              </h2>
              <p className="text-slate-400 text-sm font-medium">Here's your real-time academic overview for the current term.</p>
            </motion.div>
            
            <div className="flex gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#11141D] border-slate-900 text-slate-200 pl-11 pr-4 py-3 rounded-2xl focus:ring-1 focus:ring-violet-500/50 w-72 outline-none border transition-all font-semibold text-xs tracking-wide shadow-inner" 
                  placeholder="Search courses..." 
                  type="text" 
                />
              </div>
            </div>
          </header>

          {/* Stats Analytics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard label="Courses Passed" value={metrics.passed.toString()} trend="Eligible for GWA" icon={<CheckCircle className="text-emerald-500" size={20}/>} />
             <StatCard label="Total Units" value={totalUnits.toString()} trend="Current load" icon={<BarChart3 className="text-violet-500" size={20}/>} />
             <StatCard label="Pending Goals" value={metrics.pending.toString()} trend={metrics.pending > 0 ? "Exams awaiting results" : "All caught up"} icon={<Clock className="text-amber-500" size={20}/>} />
             <StatCard label="Needs Attention" value={metrics.attention.toString()} trend={metrics.attention > 0 ? "Missed targets!" : "Goals clear"} icon={<AlertTriangle size={18} className={metrics.attention > 0 ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-emerald-500"} />} color={metrics.attention > 0 ? "text-red-500" : "text-emerald-500"} />
          </div>

          {/* Layout Break Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left Hand: Course Deck Layout */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-900">
                <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Current Enrolled Courses</h3>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all border border-violet-500/10 shadow-lg shadow-violet-600/5"
                >
                  <Plus size={14} /> Add Course
                </motion.button>
              </div>

              <AnimatePresence mode='wait'>
                {filteredCourses.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                    className="py-24 flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-[3.5rem] bg-[#11141D]/30"
                  >
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 text-slate-500 border border-slate-800/60 shadow-xl">
                      <LayoutGrid size={28} className="text-slate-400" />
                    </div>
                    <h4 className="text-white font-black uppercase italic text-lg tracking-tight">
                      {searchTerm ? "No Matches Found" : "No Courses Enrolled"}
                    </h4>
                    <p className="text-slate-500 text-xs mt-2 font-medium">
                      {searchTerm ? `No results found for "${searchTerm}"` : "Add your first subject to start tracking your progress metrics."}
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredCourses.map((course, index) => {
                        const mid = parseFloat(course.midtermGrade) || 0;
                        const fin = parseFloat(course.finalGrade) || 0;
                        const isFinalized = course.finalGrade !== null && course.finalGrade !== undefined && course.finalGrade !== "";
                        
                        let cardStatus = 'PENDING';
                        if (isFinalized) {
                          const mw = (course.midtermWeight || 50) / 100;
                          const fw = (course.finalWeight || 50) / 100;
                          const avg = Math.floor(((mid * mw) + (fin * fw)) * 10) / 10;
                          cardStatus = avg >= 3.0 ? 'PASSED' : 'FAILED';
                        }

                        const hasPendingGoal = localStorage.getItem(`pendingGoal_${course.id}`);
                        const displayProgress = cardStatus === 'PASSED' ? 100 : (course.progress || 0);

                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4, border: '1px solid rgba(139, 92, 246, 0.25)' }}
                            transition={{ delay: index * 0.04, type: 'spring', stiffness: 100 }}
                            className="relative block h-full group"
                          >
                            {/* Course Delete Button */}
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleDeleteCourse(e, course.id, course.title)}
                              className="absolute top-5 right-5 anonymity-layer z-20 p-2 bg-red-500/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                            >
                              <Trash2 size={13} />
                            </motion.button>

                            <Link to={`/course/${course.id}`} className="block h-full">
                              <div className="bg-[#11141D] p-8 rounded-[2.5rem] border border-slate-900 transition-all h-full shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-600/[0.01] to-transparent pointer-events-none group-hover:from-violet-600/[0.03] transition-all duration-500"></div>
                                
                                <div>
                                  <div className="flex flex-wrap gap-2 mb-5">
                                    {cardStatus === 'PASSED' && (
                                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle size={10} /> Passed
                                      </div>
                                    )}
                                    {cardStatus === 'FAILED' && (
                                      <div className="bg-red-500/10 text-red-400 border border-red-500/10 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-red-600/5">
                                        <X size={10} /> Failed Target
                                      </div>
                                    )}
                                    {hasPendingGoal && (
                                      <div className="bg-orange-500/10 text-orange-400 border border-orange-500/10 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.05)]">
                                        <Target size={10} /> Target Pending
                                      </div>
                                    )}

                                    <div className="bg-[#07090E] text-slate-500 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border border-slate-900/80">
                                      {course.midtermWeight}/{course.finalWeight} Wt
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <p className={`${course.color || 'text-violet-500'} text-[10px] font-black uppercase tracking-[0.2em]`}>{course.courseCode}</p>
                                    <h4 className="text-white font-black text-xl leading-snug group-hover:text-violet-400 transition-colors duration-300">{course.title}</h4>
                                  </div>
                                </div>
                                
                                <div className="space-y-4 mt-8">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                      <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">Weight Progress</span>
                                      <p className={`text-xs font-black leading-none ${course.color || 'text-violet-500'}`}>{displayProgress}%</p>
                                    </div>
                                    <div className="w-full bg-[#07090E] h-1.5 rounded-full overflow-hidden border border-slate-900">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${displayProgress}%` }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        className={`${course.bg || 'bg-violet-600'} h-full rounded-full`} 
                                      ></motion.div>
                                    </div>
                                  </div>

                                  <div className="pt-4 border-t border-slate-900/60 flex justify-between items-center text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                    <span>{course.units} Credit Units</span>
                                    <div className="flex items-center gap-1 text-violet-500 font-black text-[9px] uppercase tracking-wider group-hover:text-violet-400 transition-colors">
                                      Open Deck <ArrowRight size={11} className="transform group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Hand: Term Summary performance Circle */}
            <div className="space-y-6 w-full">
              <h3 className="text-lg font-black text-white uppercase tracking-tight italic ml-2">Performance</h3>
              <motion.div 
                whileHover={{ y: -4, border: '1px solid rgba(139, 92, 246, 0.2)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/grades-overview')}
                className="bg-[#11141D] p-10 rounded-[3rem] border border-slate-900 text-center relative overflow-hidden shadow-2xl border-t-violet-500/10 cursor-pointer group transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/[0.01] rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center bg-[#07090E] border-8 border-slate-900/60 mb-8 shadow-inner relative group-hover:border-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/5 animate-pulse"></div>
                    <p className="text-4xl font-black text-white tracking-tighter italic leading-none">{averageGPA}</p>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none mt-1.5">
                      {gpaLabel}
                    </p>
                  </div>
                  <h4 className="text-white font-black text-xl uppercase italic group-hover:text-violet-400 transition-colors duration-300">Goal Status</h4>
                  <p className="text-slate-400 text-xs mt-3 font-medium leading-relaxed max-w-xs">
                    {totalActiveUnits > 0 
                      ? `You've secured ${totalPassedUnits} out of ${totalUnits} active load units. Tap to forecast honors brackets eligibility.`
                      : "Finish logging class weights to generate your term analytics dashboard."}
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-violet-500 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    View Detailed Analytics <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddCourse} />
    </div>
  );
};

export default Dashboard;