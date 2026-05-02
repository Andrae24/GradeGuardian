import React, { useState, useEffect } from 'react';
import { X, Check, BookOpen, Calculator as CalcIcon } from 'lucide-react';

export const AddSemesterModal = ({ isOpen, onClose, onSave }) => {
  const [yearLevel, setYearLevel] = useState('1st Year');
  const [term, setTerm] = useState('1st Semester');
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  // --- UPDATED: SECURE POST FETCH LOGIC ---
  useEffect(() => {
    if (isOpen) {
      const fetchEligibleCourses = async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        try {
          // Changed to POST and removed email from URL to fix 404/403 errors
          const res = await fetch(`http://localhost:8080/api/courses/eligible`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail })
          });
          
          if (res.ok) {
            const data = await res.json();
            console.log("✅ Eligible Courses Loaded:", data);
            setEligibleCourses(data);
          } else {
            console.error("❌ Failed to fetch eligible courses:", res.status);
          }
        } catch (error) {
          console.error("❌ Error connecting to eligible endpoint:", error);
        }
      };
      fetchEligibleCourses();
    }
  }, [isOpen]);

  const toggleCourse = (id) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (selectedCourseIds.length === 0) return alert("Select at least one course!");
    
    const selectedData = {
      yearLevel,
      term,
      courseIds: selectedCourseIds,
      // Pass the filtered objects. The GWAHub will handle the averaging in its calculation.
      selectedCourses: eligibleCourses.filter(c => selectedCourseIds.includes(c.id))
    };
    
    onSave(selectedData);
    onClose();
    setSelectedCourseIds([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0E14]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#161B22] border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/20">
              <CalcIcon className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Configure Semester</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <SelectGroup label="Year Level" value={yearLevel} onChange={setYearLevel} options={['1st Year', '2nd Year', '3rd Year', '4th Year']} />
            <SelectGroup label="Semester" value={term} onChange={setTerm} options={['1st Semester', '2nd Semester', 'Summer']} />
          </div>

          {/* Course Picker */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              Eligible Courses ({eligibleCourses.length})
            </label>
            
            <div className="grid grid-cols-1 gap-3">
              {eligibleCourses.length > 0 ? eligibleCourses.map(course => {
                // Calculation for display (Midterm + Finals) / 2
                const mid = parseFloat(course.midtermGrade || 0);
                const fin = parseFloat(course.finalGrade || 0);
                const avgGrade = (mid + fin) / 2;

                return (
                  <div 
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex justify-between items-center ${
                      selectedCourseIds.includes(course.id) 
                      ? 'bg-violet-600/10 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
                      : 'bg-[#0B0E14] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${selectedCourseIds.includes(course.id) ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{course.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{course.courseCode}</span>
                          <span className="text-slate-700 text-[10px]">•</span>
                          <span className="text-violet-400 text-[10px] font-black uppercase">
                            Avg Grade: {avgGrade.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedCourseIds.includes(course.id) ? 'bg-violet-600 border-violet-600' : 'border-slate-700'
                    }`}>
                      {selectedCourseIds.includes(course.id) && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-16 bg-[#0B0E14] rounded-[2rem] border-2 border-dashed border-slate-800">
                  <p className="text-slate-500 text-sm italic font-medium">No finalized courses found.</p>
                  <p className="text-slate-600 text-[10px] mt-1 uppercase font-black">Achieve a Finals target to unlock them here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 bg-white/[0.01]">
          <button 
            onClick={handleSave}
            disabled={selectedCourseIds.length === 0}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] ${
                selectedCourseIds.length > 0 
                ? 'bg-violet-600 hover:bg-violet-500 text-white' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Generate Semester Card
          </button>
        </div>
      </div>
    </div>
  );
};

const SelectGroup = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-violet-600 appearance-none cursor-pointer"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
        <X size={14} className="rotate-45" />
      </div>
    </div>
  </div>
);