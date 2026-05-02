import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SemesterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [semester, setSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullReport = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      try {
        // 1. Fetch the Specific Semester Card
        const semRes = await fetch(`http://localhost:8080/api/semesters/${id}`);
        if (!semRes.ok) throw new Error("Semester not found");
        const semData = await semRes.json();
        setSemester(semData);

        // 2. Fetch all user courses via the SECURE POST endpoint
        const coursesRes = await fetch(`http://localhost:8080/api/courses/my-courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: userEmail })
        });
        
        if (coursesRes.ok) {
          const allCourses = await coursesRes.json();

          // 3. Filter to only show subjects included in this specific GWA calculation
          const filtered = allCourses.filter(c => semData.courseCodes.includes(c.courseCode));
          setCourses(filtered);
        }
      } catch (err) {
        console.error("Report generation error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullReport();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
      <p className="text-slate-400 font-black italic uppercase tracking-[0.3em] animate-pulse">Generating Report...</p>
    </div>
  );
  
  if (!semester) return null;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 p-8 font-sans">
      
      {/* Centered Layout Wrapper for 100% Zoom */}
      <div className="max-w-[1400px] mx-auto space-y-10 w-full">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group font-black uppercase text-[10px] tracking-[0.2em]"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
        </button>

        {/* Header Section */}
        <header className="flex flex-wrap justify-between items-center gap-8 bg-[#161B22] p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl"></div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3 text-violet-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
              <Calendar size={14} /> Official Record
            </div>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">
              {semester.yearLevel}
            </h2>
            <p className="text-slate-400 font-bold text-lg leading-none">{semester.term}</p>
          </div>

          <div className="bg-[#0B0E14] border-2 border-violet-500/20 p-8 rounded-[2.5rem] text-right shadow-2xl relative z-10 min-w-[200px]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final GWA</p>
            <h3 className="text-5xl font-black text-white tracking-tighter italic">
              {parseFloat(semester.gwa).toFixed(2)}
            </h3>
          </div>
        </header>

        {/* Report Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161B22] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-slate-800 bg-white/[0.01]">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Subject Breakdown</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Information</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Midterm</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Finals</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Units</th>
                  <th className="px-8 py-6 text-[10px] font-black text-violet-400 uppercase tracking-widest text-right">Avg Grade</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {courses.map((course) => {
                  const mid = parseFloat(course.midtermGrade || 0);
                  const fin = parseFloat(course.finalGrade || 0);
                  
                  // Dynamic weighting calculation based on course settings
                  const mw = (course.midtermWeight || 50) / 100;
                  const fw = (course.finalWeight || 50) / 100;
                  const average = (mid * mw) + (fin * fw);

                  return (
                    <tr key={course.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-violet-600/10 group-hover:text-violet-400 transition-all">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <p className="text-white font-black uppercase text-sm italic tracking-tight">{course.title}</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{course.courseCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center text-slate-300 font-black italic">{mid > 0 ? mid.toFixed(1) : "—"}</td>
                      <td className="px-8 py-6 text-center text-slate-300 font-black italic">{fin > 0 ? fin.toFixed(1) : "—"}</td>
                      <td className="px-8 py-6 text-center text-slate-500 font-black">{course.units}</td>
                      <td className="px-8 py-6 text-right">
                        <span className="bg-violet-600/10 text-violet-400 px-4 py-2 rounded-xl font-black text-sm border border-violet-500/10 italic">
                          {average.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {average > 0 ? (
                          average >= 3.0 ? (
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                              Pass
                            </span>
                          ) : (
                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                              Fail
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 font-black">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer Summary */}
        <div className="flex justify-center gap-10 py-10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Subjects Completed</p>
              <p className="text-white font-black text-2xl tracking-tighter italic">{semester.courseCount}</p>
           </div>
           <div className="w-[1px] h-10 bg-slate-800 mt-2"></div>
           <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Academic Status</p>
              <p className="text-emerald-500 font-black text-2xl tracking-tighter italic">Regular</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterDetails;