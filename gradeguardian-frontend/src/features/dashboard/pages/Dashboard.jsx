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
    <div className="flex h-screen overflow-hidden bg-[#0B0E14] text-slate-100 font-sans relative">
      <main className="flex-1 overflow-y-auto p-8 relative z-0">
        <div className="max-w-[1400px] mx-auto w-full">
          
          <header className="flex justify-between items-center mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">
                Welcome back, {userName}!
              </h2>
              <p className="text-slate-400 font-medium mt-1">Here's your academic overview for the semester.</p>
            </motion.div>
            <div className="flex gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#161B22] border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-violet-600 w-64 outline-none border transition-all font-medium text-sm" 
                  placeholder="Search courses..." 
                  type="text" 
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
             <StatCard label="Courses Passed" value={metrics.passed.toString()} trend="Eligible for GWA" icon={<CheckCircle className="text-emerald-500"/>} />
             <StatCard label="Total Units" value={totalUnits.toString()} trend="Current load" icon={<BarChart3 className="text-violet-500"/>} />
             <StatCard label="Pending Goals" value={metrics.pending.toString()} trend={metrics.pending > 0 ? "Exams awaiting results" : "All caught up"} icon={<Clock className="text-amber-500"/>} />
             <StatCard label="Needs Attention" value={metrics.attention.toString()} trend={metrics.attention > 0 ? "Missed targets!" : "Goals clear"} icon={<AlertTriangle size={18} className={metrics.attention > 0 ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-emerald-500"} />} color={metrics.attention > 0 ? "text-red-500" : "text-emerald-500"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Current Enrolled Courses</h3>
                <button onClick={() => setIsModalOpen(true)} className="bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-violet-500/20">
                  <Plus size={14} /> Add Course
                </button>
              </div>

              <AnimatePresence mode='wait'>
                {filteredCourses.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-[#161B22]/10"
                  >
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-600 border border-slate-700 shadow-xl">
                      <LayoutGrid size={40} />
                    </div>
                    <h4 className="text-white font-black uppercase italic text-xl">
                      {searchTerm ? "No Matches Found" : "No Courses Enrolled"}
                    </h4>
                    <p className="text-slate-500 text-sm mt-2">
                      {searchTerm ? `No results for "${searchTerm}"` : "Add your first subject to start tracking your progress."}
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link to={`/course/${course.id}`} className="group relative block h-full">
                              <button 
                                onClick={(e) => handleDeleteCourse(e, course.id, course.title)}
                                className="absolute top-4 right-4 z-10 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                              >
                                <Trash2 size={14} />
                              </button>

                              <div className="bg-[#161B22] p-7 rounded-[2.5rem] border border-slate-800 group-hover:border-violet-500/50 transition-all h-full shadow-2xl relative overflow-hidden">
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {cardStatus === 'PASSED' && (
                                    <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                      <CheckCircle size={10} /> Passed
                                    </div>
                                  )}
                                  {cardStatus === 'FAILED' && (
                                    <div className="bg-red-600 text-white border border-red-500/20 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-red-600/20">
                                      <X size={10} /> Failed Target
                                    </div>
                                  )}
                                  
                                  {/* TARGET PENDING BADGE - NOW IN ORANGE */}
                                  {hasPendingGoal && (
                                    <div className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.1)]">
                                      <Target size={10} /> Target Pending
                                    </div>
                                  )}

                                  <div className="bg-slate-800 text-slate-400 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-700">
                                    {course.midtermWeight}/{course.finalWeight}
                                  </div>
                                </div>

                                <div className="mb-2">
                                  <p className={`${course.color || 'text-violet-500'} text-[10px] font-black uppercase tracking-[0.2em] mb-1`}>{course.courseCode}</p>
                                  <h4 className="text-white font-black text-xl leading-tight group-hover:text-violet-400 transition-colors">{course.title}</h4>
                                </div>
                                
                                <div className="space-y-3 mt-10">
                                  <div className="flex justify-between items-end">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Weight Progress</span>
                                    <p className={`text-xs font-black ${course.color || 'text-violet-500'}`}>{displayProgress}%</p>
                                  </div>
                                  <div className="w-full bg-[#0B0E14] h-2 rounded-full overflow-hidden border border-slate-800">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${displayProgress}%` }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                      className={`${course.bg || 'bg-violet-600'} h-full rounded-full`} 
                                    ></motion.div>
                                  </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-800/50 flex justify-between items-center text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                  <span>{course.units} Units</span>
                                  <div className="flex items-center gap-1.5 text-violet-500 font-black">Open Details <BarChart3 size={12} /></div>
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

            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Performance</h3>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/grades-overview')}
                className="bg-[#161B22] p-10 rounded-[3.5rem] border border-slate-800 text-center relative overflow-hidden shadow-2xl border-t-violet-500/20 cursor-pointer group transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center bg-[#0B0E14] border-8 border-slate-800/50 mb-8 shadow-inner relative group-hover:border-violet-500/30 transition-all">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/10 animate-pulse"></div>
                    <p className="text-4xl font-black text-white tracking-tighter italic">{averageGPA}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mt-1">
                      {gpaLabel}
                    </p>
                  </div>
                  <h4 className="text-white font-black text-xl uppercase italic group-hover:text-violet-400 transition-colors">Goal Status</h4>
                  <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
                    {totalActiveUnits > 0 
                      ? `You've secured ${totalPassedUnits} out of ${totalUnits} units. Tap to view your honors eligibility.`
                      : "Finish your assessments to calculate your official GPA."}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-violet-500 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                    View Detailed Breakdown <ArrowRight size={12} />
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