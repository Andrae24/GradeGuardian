import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, GraduationCap, CheckCircle, GitBranch, PieChart, Target, X, Lock, Unlock, AlertCircle, FastForward, Info, GitMerge, ListPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import { PeriodSelectionModal } from "../../grades/components/PeriodSelectionModal";
import { AddAssessmentForm } from "../../grades/components/AddAssessmentForm";
import { GradeProjector } from "../../grades/components/GradeProjector";
import { RecordResultModal } from "./RecordResultModal";
import { transmuteToGPA } from "../../../utils/gradeCalculations";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const [assessments, setAssessments] = useState([]);
  const [courseInfo, setCourseInfo] = useState({
    title: "Loading...",
    code: "...",
    units: 0,
    midtermGrade: null,
    finalGrade: null,
    midtermWeight: 40, 
    finalWeight: 60    
  });
  const [activeView, setActiveView] = useState('MIDTERM');
  const [showCongrats, setShowCongrats] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [pendingGoal, setPendingGoal] = useState(JSON.parse(localStorage.getItem(`pendingGoal_${id}`)) || null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const midtermStatus = localStorage.getItem(`course_status_${id}`);
  const isFinalsUnlocked = midtermStatus === 'PASSED' || midtermStatus === 'FAILED' || courseInfo.midtermGrade !== null;

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const courseRes = await fetch(`${API_BASE_URL}/api/courses/${id}`);
      if (courseRes.ok) {
        const data = await courseRes.json();
        setCourseInfo({
          title: data.title,
          code: data.courseCode,
          units: data.units,
          midtermGrade: data.midtermGrade,
          finalGrade: data.finalGrade,
          midtermWeight: 40,
          finalWeight: 60
        });
      }
      const assessmentsRes = await fetch(`${API_BASE_URL}/api/assessments/course/${id}`);
      if (assessmentsRes.ok) setAssessments(await assessmentsRes.json());
    } catch (error) { console.error("Error fetching data:", error); }
  };

  const currentViewAssessments = assessments
    .filter(item => item.period === activeView)
    .sort((a, b) => a.id - b.id);

  const isMajorExam = (name) => {
    if (!name) return false;
    const n = name.trim().toUpperCase();
    return ['PRELIM EXAM', 'MIDTERM EXAM', 'PREFINAL EXAM', 'FINAL EXAM'].includes(n);
  };
  
  const isCS = (name) => name && name.trim().toUpperCase() === 'CLASS STANDING';

  const pendingCSScore = currentViewAssessments
    .filter(a => !isMajorExam(a.name) && !isCS(a.name))
    .reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) * curr.weight : 0), 0);

  const rawCSContribution = currentViewAssessments
    .filter(a => isCS(a.name))
    .reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) * curr.weight : 0), 0);

  const rawExamContribution = currentViewAssessments
    .filter(a => isMajorExam(a.name))
    .reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) * curr.weight : 0), 0);

  const contribution = rawCSContribution + rawExamContribution;
  
  const displayWeight = currentViewAssessments
    .filter(a => isCS(a.name) || isMajorExam(a.name))
    .reduce((acc, item) => acc + (item.weight || 0), 0);

  const rawFinalsGpa = courseInfo.finalGrade || (contribution > 0 ? transmuteToGPA(contribution) : "0.0");

  // FIXED NO ROUND UP/FLOOR MATH ENGINE ENGINE BLOCKS BELOW:
  const getCalculatedDisplayGpa = () => {
    if (activeView === 'MIDTERM') {
      return courseInfo.midtermGrade || (contribution > 0 ? transmuteToGPA(contribution) : "0.0");
    } else {
      // If we have an explicitly logged database final grade, use it directly
      if (courseInfo.finalGrade) return courseInfo.finalGrade;

      // If we are evaluating tentative finals grades alongside midterms, calculate the weighted average without flooring
      if (courseInfo.midtermGrade && rawFinalsGpa !== "0.0") {
        const midVal = parseFloat(courseInfo.midtermGrade);
        const finVal = parseFloat(rawFinalsGpa);
        const overallCalculatedGrade = (midVal * (courseInfo.midtermWeight / 100)) + (finVal * (courseInfo.finalWeight / 100));
        
        // Return exact value string down to 1 decimal place safely
        return overallCalculatedGrade.toFixed(1);
      }
      return rawFinalsGpa;
    }
  };

  const displayGPA = getCalculatedDisplayGpa();
  const currentStatus = (displayGPA !== "0.0" && parseFloat(displayGPA) >= 3.0) ? "Passing" : "Failing";

  const handlePeriodSelection = async (period, manualData = null) => {
    const gradeValue = manualData && typeof manualData === 'object' ? manualData.gpa : manualData;
    const isUnlockingAction = gradeValue !== null && gradeValue !== undefined;

    if (period === 'FINALS' && isUnlockingAction) {
      try {
        const payload = {
          progress: 50,
          midtermGrade: gradeValue.toString(),
          isGwaEligible: false
        };
        const response = await fetch(`${API_BASE_URL}/api/courses/${id}/finalize`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const status = parseFloat(gradeValue) >= 3.0 ? 'PASSED' : 'FAILED';
          localStorage.setItem(`course_status_${id}`, status);

          await fetchData(); 
          setActiveView('FINALS');
          setIsPeriodModalOpen(false);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          
          setTimeout(() => {
            setIsEntryModalOpen(true);
          }, 300); 

          return;
        }
      } catch (error) { console.error("Unlock error:", error); }
      return;
    }

    if (period === 'FINALS' && !isFinalsUnlocked && !isUnlockingAction) {
        alert("🔒 Milestone Locked: Resolve Midterm grade first.");
        return;
    }

    setIsPeriodModalOpen(false);
    setActiveView(period);
    
    setTimeout(() => {
      setIsEntryModalOpen(true);
    }, 300);
  };

  const handleSaveTarget = (examName, requiredScore, period, targetGrade) => {
    const goalData = { examName, requiredScore, period, targetGrade, updatedAt: Date.now() };
    setPendingGoal({...goalData});
    localStorage.setItem(`pendingGoal_${id}`, JSON.stringify(goalData));
  };

  const resolveGoal = async (didAchieve, calculatedGrade = null) => {
    const targetGrade = pendingGoal?.targetGrade || "1.0";
    const currentPeriod = pendingGoal?.period || activeView;
    const examName = pendingGoal?.examName || (currentPeriod === 'FINALS' ? 'FINAL Exam' : 'MIDTERM Exam');
    const isFinals = currentPeriod === 'FINALS';

    const finalScore = didAchieve ? parseFloat(pendingGoal.requiredScore) : (calculatedGrade?.score || 0);
    
    let finalGPAValue;
    if (didAchieve) {
      finalGPAValue = targetGrade; 
    } else {
      const addedContribution = (calculatedGrade && calculatedGrade.total > 0) 
        ? (calculatedGrade.score / calculatedGrade.total) * calculatedGrade.weight 
        : 0;
      
      const newTotalContribution = contribution + addedContribution;
      finalGPAValue = transmuteToGPA(newTotalContribution);
    }

    setPendingGoal(null);
    localStorage.removeItem(`pendingGoal_${id}`);

    try {
      const assessmentPayload = {
        name: examName,
        weight: 100 - displayWeight,
        score: finalScore, 
        total: 100,
        period: currentPeriod.toUpperCase(),
        course: { id: parseInt(id) }
      };
      await fetch(`${API_BASE_URL}/api/assessments/course/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentPayload)
      });
      
      const finalizePayload = {
        progress: isFinals ? 100 : 50,
        [isFinals ? 'finalGrade' : 'midtermGrade']: finalGPAValue.toString(),
        isGwaEligible: isFinals
      };
      await fetch(`${API_BASE_URL}/api/courses/${id}/finalize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalizePayload)
      });

      if (isFinals && courseInfo.midtermGrade) {
        const midVal = parseFloat(courseInfo.midtermGrade);
        const finVal = parseFloat(finalGPAValue);
        const overallGPA = (midVal * (courseInfo.midtermWeight / 100)) + (finVal * (courseInfo.finalWeight / 100));
        localStorage.setItem(`course_status_${id}`, overallGPA >= 3.0 ? 'PASSED' : 'FAILED');
      } else {
        localStorage.setItem(`course_status_${id}`, parseFloat(finalGPAValue) >= 3.0 ? 'PASSED' : 'FAILED');
      }

      if (didAchieve) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      fetchData();
    } catch (err) { console.error("Resolution Error:", err); }
  };

  const handleAssessmentSubmit = async (formData) => {
    try {
      const payload = { ...formData, period: activeView, course: { id: parseInt(id) } };
      const response = await fetch(`${API_BASE_URL}/api/assessments/course/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) { setIsEntryModalOpen(false); fetchData(); }
    } catch (error) { console.error("Save error:", error); }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (window.confirm(`Are you sure you want to delete this assessment?`)) {
      await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="bg-[#0B0E14] min-h-screen text-slate-100 font-sans pb-20">
      <div className="p-8 max-w-6xl mx-auto space-y-10">
        
        <header className="flex flex-wrap items-end justify-between gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-4xl font-black text-white tracking-tight italic uppercase">{courseInfo.title}</h2>
            <p className="text-lg text-slate-400 font-medium italic">Code: <span className="text-white font-sans not-italic">{courseInfo.code}</span></p>
          </motion.div>
          
          <div className="flex flex-wrap gap-3">
            {!isFinalsUnlocked && (
              <button 
                onClick={() => {
                  const manualGrade = prompt("Enter your official Midterm GPA (e.g., 3.0 or 2.5):");
                  if (manualGrade && !isNaN(parseFloat(manualGrade))) {
                    handlePeriodSelection('FINALS', { gpa: parseFloat(manualGrade).toFixed(1) });
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#161B22] border border-slate-800 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-800 hover:text-white transition-all shadow-xl"
              >
                <FastForward size={16} /> Skip to Finals
              </button>
            )}

            <button onClick={() => setIsPeriodModalOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 text-white font-black uppercase text-xs tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">
              <Plus size={18} /> Add Assessment
            </button>
          </div>
        </header>

        <AnimatePresence>
          {pendingGoal && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="bg-violet-600/10 border border-violet-500/30 p-5 rounded-3xl flex flex-wrap justify-between items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg"><Target className="text-white" size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Active Target</p>
                  <p className="text-white font-bold text-lg">Need <span className="text-violet-400">{pendingGoal.requiredScore}%</span> on {pendingGoal.examName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0B0E14] p-2 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 px-3 italic">Did you hit this target?</span>
                <button onClick={() => resolveGoal(true)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all active:scale-95">YES</button>
                <button onClick={() => setIsResultModalOpen(true)} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-all active:scale-95">NO</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center">
          <div className="flex bg-[#161B22] p-1.5 rounded-[2rem] border border-slate-800 shadow-2xl">
            {['MIDTERM', 'FINALS'].map((p) => {
              const isLocked = p === 'FINALS' && !isFinalsUnlocked;
              return (
                <button key={p}
                  title={isLocked ? "Add your Midterm grade first to unlock Finals" : `Switch to ${p}`}
                  onClick={() => { if (!isLocked) setActiveView(p); }}
                  className={`px-12 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 flex items-center gap-2
                    ${activeView === p ? 'bg-violet-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}
                    ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {p === 'MIDTERM' ? 'Midterm' : 'Finals'}
                  {isLocked ? <Lock size={14} /> : (p === 'FINALS' && <Unlock size={14} className="text-emerald-500" />)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard index={0} title={activeView === 'FINALS' ? "Overall GPA" : "GPA"} value={displayGPA} icon={<GraduationCap size={24}/>} color={parseFloat(displayGPA) < 3.0 ? "text-red-500" : "text-violet-400"} />
          <MetricCard index={1} title="Status" value={currentStatus} icon={currentStatus === "Passing" ? <CheckCircle size={24}/> : <X size={24}/>} color={currentStatus === "Passing" ? "text-emerald-500" : "text-red-500"} />
          <MetricCard index={2} title="Units" value={courseInfo.units || "3"} icon={<GitBranch size={24}/>} color="text-white" />
          <MetricCard index={3} title="Weight Tracked" value={`${displayWeight}%`} icon={<PieChart size={24}/>} color="text-emerald-400" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-start gap-6 shadow-xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/30">
            <Info size={28} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Grade Tracking Pro-Tips</h3>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Master your syllabus with these two modes:</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#0B0E14]/60 p-4 rounded-2xl border border-slate-800/50 group hover:border-violet-500/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <ListPlus size={18} className="text-violet-400" />
                  <p className="text-xs font-black text-white uppercase italic">Batch Grouping</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Perfect for <strong>Quizzes, Seatworks, Activities, and etc</strong>. Use the toggle to add multiple scores; the app sums them up into one entry automatically.</p>
              </div>
              
              <div className="bg-[#0B0E14]/60 p-4 rounded-2xl border border-slate-800/50 group hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <GitMerge size={18} className="text-blue-400" />
                  <p className="text-xs font-black text-white uppercase italic">Syllabus Split</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Perfect for <strong>Major Exams</strong>. Enter the category weight (e.g., 60%) and split it into Pre-final/Final slots easily.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-medium">
                <strong>Magic Sync:</strong> To see your final result, add an assessment named exactly <span className="text-emerald-400 font-black">"Class Standing"</span> to auto-fill your grade!
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#161B22] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-800 bg-white/[0.02] flex justify-between items-center">
            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">{activeView} Assessments</h4>
          </div>
          <div className="overflow-x-auto text-center">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800/50 bg-white/[0.01]">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Weight</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Score</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">GPA Contribution</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {currentViewAssessments.length > 0 ? currentViewAssessments.map((item) => {
                  const specialMatch = isCS(item.name) || isMajorExam(item.name);
                  return (
                    <tr key={item.id} className={`transition-colors group border-l-4 ${specialMatch ? 'bg-violet-600/10 border-violet-500 hover:bg-violet-600/20' : 'bg-[#161B22] border-slate-700 hover:bg-white/[0.02]'}`}>
                      <td className={`px-8 py-5 text-center ${specialMatch ? 'text-violet-400 font-black' : 'text-slate-300 font-bold'}`}>{item.name}</td>
                      <td className={`px-8 py-5 text-center ${specialMatch ? 'text-violet-300 font-black' : 'text-slate-400 font-bold'}`}>{item.weight}%</td>
                      <td className={`px-8 py-5 text-center ${specialMatch ? 'text-white font-black' : 'text-white font-bold'}`}>{item.score}/{item.total}</td>
                      <td className={`px-8 py-5 text-center text-lg ${specialMatch ? 'text-violet-400 font-black' : 'text-emerald-400 font-bold'}`}>+{( (item.score / item.total) * item.weight ).toFixed(1)}%</td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => handleDeleteAssessment(item.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                        <PieChart size={32} className="text-slate-500" />
                        <p className="text-slate-400 font-medium">No assessments yet. Click <strong>Add Assessment</strong> above to start tracking!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-12">
          <GradeProjector
            initialCS1={rawCSContribution.toFixed(1)}
            initialPE={rawExamContribution.toFixed(1)}
            totalWeightUsed={displayWeight}
            activePeriodProp={activeView}
            onSaveTarget={handleSaveTarget}
            isFinalized={activeView === 'MIDTERM' ? !!courseInfo.midtermGrade : !!courseInfo.finalGrade}
          />
        </div>

        <RecordResultModal 
          isOpen={isResultModalOpen} 
          onClose={() => setIsResultModalOpen(false)} 
          onSave={(manualGrade) => resolveGoal(false, manualGrade)} 
          period={activeView} 
          remainingWeight={100 - displayWeight}
        />
        <PeriodSelectionModal isOpen={isPeriodModalOpen} onClose={() => setIsPeriodModalOpen(false)} onSelect={handlePeriodSelection} isMidtermComplete={isFinalsUnlocked} />
        
        <AddAssessmentForm 
          isOpen={isEntryModalOpen} 
          periodName={activeView} 
          onClose={() => setIsEntryModalOpen(false)} 
          onSubmit={handleAssessmentSubmit} 
          autoFillCSScore={pendingCSScore} 
          />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, index }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.1 }} className="bg-[#161B22] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-violet-500/30 transition-all">
    <div className="absolute top-0 right-0 p-6 opacity-5 text-white group-hover:scale-110 group-hover:opacity-20 transition-all">{icon}</div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
    <h3 className={`text-4xl font-black italic tracking-tighter ${color}`}>{value}</h3>
  </motion.div>
);

export default CourseDetails;