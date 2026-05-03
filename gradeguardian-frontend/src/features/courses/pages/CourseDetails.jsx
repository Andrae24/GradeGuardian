import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, GraduationCap, CheckCircle, GitBranch, PieChart, Target, X, Lock, Unlock, AlertCircle
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
  
  // --- CONFIGURATION: Dynamic API URL for Production/Local ---
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const [assessments, setAssessments] = useState([]);
  const [courseInfo, setCourseInfo] = useState({
    title: "Loading...",
    code: "...",
    units: 0,
    midtermGrade: null,
    finalGrade: null,
    midtermWeight: 50,
    finalWeight: 50
  });
  const [activeView, setActiveView] = useState('MIDTERM');
  const [showCongrats, setShowCongrats] = useState(false);
  const [showFailure, setShowFailure] = useState(false);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [pendingGoal, setPendingGoal] = useState(JSON.parse(localStorage.getItem(`pendingGoal_${id}`)) || null);
  const [needsAttention, setNeedsAttention] = useState(localStorage.getItem(`attention_${id}`) === 'true');
  const [manualMS, setManualMS] = useState(JSON.parse(localStorage.getItem(`manualMS_${id}`)) || null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const [syncedData, setSyncedData] = useState(null);

  const midtermStatus = localStorage.getItem(`course_status_${id}`);
  const isFinalsUnlocked = midtermStatus === 'PASSED' || midtermStatus === 'FAILED';

  useEffect(() => {
    setSyncedData(null);
  }, [activeView, assessments.length]);

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
          midtermWeight: data.midtermWeight || 50,
          finalWeight: data.finalWeight || 50
        });
      }

      const assessmentsRes = await fetch(`${API_BASE_URL}/api/assessments/course/${id}`);
      if (assessmentsRes.ok) {
        const assessmentsData = await assessmentsRes.json();
        setAssessments(assessmentsData);
      }
    } catch (error) { console.error("Error fetching data:", error); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const currentViewAssessments = assessments.filter(item => item.period === activeView);

  const rawCSContribution = currentViewAssessments
    .filter(a => a.name.toUpperCase() === 'CLASS STANDING 1' || a.name.toUpperCase() === 'CLASS STANDING 2')
    .reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) * curr.weight : 0), 0);

  const rawExamContribution = currentViewAssessments
    .filter(a => a.name.toUpperCase() === 'PRELIM EXAM' || a.name.toUpperCase() === 'PRE-FINAL EXAM' || a.name.toUpperCase() === 'PREFINAL EXAM')
    .reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) * curr.weight : 0), 0);

  const rawMajorExamContribution = currentViewAssessments
    .filter(a => a.name.toUpperCase() === 'MIDTERM EXAM' || a.name.toUpperCase() === 'FINAL EXAM')
    .reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total) * curr.weight : 0), 0);

  const calculateMS = () => {
    if (manualMS !== null) return parseFloat(manualMS);
    return rawCSContribution + rawExamContribution;
  };

  const midtermScoreMS = calculateMS();
  
  const validNames = ['CLASS STANDING 1', 'CLASS STANDING 2', 'PRELIM EXAM', 'PRE-FINAL EXAM', 'PREFINAL EXAM', 'MIDTERM EXAM', 'FINAL EXAM'];
  const totalWeightUsed = currentViewAssessments
    .filter(item => validNames.includes(item.name.toUpperCase()))
    .reduce((acc, item) => acc + (item.weight || 0), 0);

  const contribution = rawCSContribution + rawExamContribution + rawMajorExamContribution;

  const isMidtermFinalized = activeView === 'MIDTERM' && courseInfo.midtermGrade && (midtermStatus === 'PASSED' || midtermStatus === 'FAILED');
  const isFinalsFinalized = activeView === 'FINALS' && courseInfo.finalGrade;
  const isShowingOfficialDBGrade = isMidtermFinalized || isFinalsFinalized;

  const displayContrib = syncedData ? syncedData.contrib : contribution;
  const displayWeight = syncedData ? syncedData.weight : totalWeightUsed;

  const displayGPA = syncedData 
    ? (displayContrib > 0 ? transmuteToGPA(displayContrib) : "1.0")
    : (contribution > 0 
        ? transmuteToGPA(contribution) 
        : (isShowingOfficialDBGrade && currentViewAssessments.length > 0
            ? Number(activeView === 'MIDTERM' ? courseInfo.midtermGrade : courseInfo.finalGrade).toFixed(1)
            : "0.0"));

  const currentStatus = syncedData
    ? (displayContrib >= 60 ? "Passing" : "Failing")
    : (contribution > 0 
        ? (contribution >= 60 ? "Passing" : "Failing") 
        : (isShowingOfficialDBGrade && currentViewAssessments.length > 0
            ? (parseFloat(displayGPA) >= 3.0 ? "Passing" : "Failing")
            : "Failing"));

  const handleSaveExamResult = async (examData) => {
    const newWeight = parseFloat(examData.weight);
    const totalPotentialWeight = totalWeightUsed + newWeight;

    if (totalPotentialWeight > 100) {
      alert(`⚠️ Weight Limit Exceeded! Current: ${totalWeightUsed}%. Max 100%.`);
      return;
    }

    const actualScorePercentage = (examData.score / examData.total) * 100;
    const requiredScore = pendingGoal?.requiredScore;

    if (requiredScore && actualScorePercentage >= requiredScore) {
      alert(`⚠️ Your result meets your target. If you passed, click "YES" instead.`);
      return;
    }

    try {
      const payload = { ...examData, course: { id: parseInt(id) } };
      const response = await fetch(`${API_BASE_URL}/api/assessments/course/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedRaw = contribution + ((examData.score / examData.total) * examData.weight);
        const actualGpa = transmuteToGPA(updatedRaw);
        resolveGoal(false, actualGpa);
        fetchData();
        setIsResultModalOpen(false);
      }
    } catch (error) { console.error("Error saving exam result:", error); }
  };

  const handlePeriodSelection = async (period, manualData = null) => {
    if (period === 'FINALS' && !isFinalsUnlocked && manualData === null) {
        alert("🔒 Milestone Locked: Resolve Midterm target first.");
        return;
    }
    
    setSelectedPeriod(period);
    setIsPeriodModalOpen(false);

    if (manualData !== null) {
      const { raw, gpa } = typeof manualData === 'object' ? manualData : { raw: manualData, gpa: manualData };
      setManualMS(raw);
      localStorage.setItem(`manualMS_${id}`, JSON.stringify(raw));
      localStorage.setItem(`course_status_${id}`, 'PASSED');
      setActiveView('FINALS');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#FFFFFF'] });

      try {
        await fetch(`${API_BASE_URL}/api/courses/${id}/finalize`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ midtermGrade: gpa, progress: 50 })
        });
        fetchData();
      } catch (err) { console.error("Manual sync failed:", err); }
    } else {
      setActiveView(period);
    }
    
    setTimeout(() => setIsEntryModalOpen(true), 150);
  };

  const resolveGoal = async (didAchieve, calculatedGrade = null) => {
    const targetGrade = pendingGoal?.targetGrade || "1.0";
    const currentPeriod = pendingGoal?.period || activeView;
    const examName = pendingGoal?.examName || (currentPeriod === 'FINALS' ? 'FINAL Exam' : 'MIDTERM Exam');
    const requiredScore = pendingGoal?.requiredScore || 0;
    const isFinals = currentPeriod === 'FINALS';

    setPendingGoal(null);
    localStorage.removeItem(`pendingGoal_${id}`);

    if (didAchieve) {
      const remainingWeight = 100 - totalWeightUsed;
      const weightToSave = remainingWeight > 0 ? remainingWeight : 0;
      const scoreToSave = parseFloat(requiredScore) || 0;

      try {
        const assessmentPayload = {
          name: examName,
          weight: weightToSave,
          score: scoreToSave, 
          total: 100,
          period: currentPeriod.toUpperCase(),
          course: { id: parseInt(id) }
        };
        
        await fetch(`${API_BASE_URL}/api/assessments/course/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentPayload)
        });
      } catch (err) {
        console.error("Failed to auto-save achieved assessment:", err);
      }
    }

    const finalGradeToSave = didAchieve ? targetGrade : (calculatedGrade !== null ? calculatedGrade : "1.0");

    try {
      const payload = {
        progress: isFinals ? 100 : 50,
        [isFinals ? 'finalGrade' : 'midtermGrade']: finalGradeToSave,
        isGwaEligible: isFinals
      };

      const response = await fetch(`${API_BASE_URL}/api/courses/${id}/finalize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (didAchieve) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#8B5CF6', '#10B981', '#FFFFFF'] });
          setNeedsAttention(false);
          localStorage.removeItem(`attention_${id}`);
          if (!isFinals) localStorage.setItem(`course_status_${id}`, 'PASSED');
          setShowCongrats(true);
          setTimeout(() => setShowCongrats(false), 5000);
        } else {
          setNeedsAttention(true);
          setShowFailure(true);
          localStorage.setItem(`attention_${id}`, 'true');
          if (!isFinals) localStorage.setItem(`course_status_${id}`, 'FAILED');
          setTimeout(() => setShowFailure(false), 5000);
        }
        await fetchData();
      }
    } catch (error) { console.error("Database sync error:", error); }
  };

  const handleSaveTarget = (examName, requiredScore, period, targetGrade) => {
    const goalData = { examName, requiredScore, period, targetGrade, updatedAt: Date.now() };
    setPendingGoal({...goalData});
    localStorage.setItem(`pendingGoal_${id}`, JSON.stringify(goalData));
  };

  const handleAssessmentSubmit = async (formData) => {
    const newWeight = parseFloat(formData.weight);
    if (totalWeightUsed + newWeight > 100) {
      alert(`⚠️ Weight Error: Cannot exceed 100%. Currently at ${totalWeightUsed}%.`);
      return;
    }
    try {
      const payload = { ...formData, period: selectedPeriod, course: { id: parseInt(id) } };
      const response = await fetch(`${API_BASE_URL}/api/assessments/course/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) { setIsEntryModalOpen(false); fetchData(); }
    } catch (error) { console.error("Save error:", error); }
  };

  const handleDeleteAssessment = async (assessmentId, assessmentName) => {
    if (window.confirm(`Remove "${assessmentName}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}`, { method: 'DELETE' });
        if (response.ok) fetchData();
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div className="bg-[#0B0E14] min-h-screen text-slate-100 font-sans pb-20">
      <AnimatePresence>
        {showCongrats && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4 text-center">
            <div className="bg-emerald-600 text-white px-8 py-6 rounded-[2.5rem] shadow-2xl border-4 border-white/20">
              <CheckCircle size={40} className="mx-auto mb-3" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Nice Work!</h2>
              <p className="font-bold text-sm mt-2 opacity-90">{activeView === 'MIDTERM' ? 'Midterm achieved. Next phase unlocked.' : 'Course complete!'}</p>
            </div>
          </motion.div>
        )}

        {showFailure && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed bottom-10 right-10 z-[200] p-1">
            <div className="bg-red-600 text-white px-8 py-6 rounded-[2rem] shadow-2xl border-4 border-white/10 flex items-center gap-4">
              <AlertCircle size={32} />
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">Target Missed</h2>
                <p className="font-bold text-[10px] mt-1 opacity-90 uppercase tracking-widest leading-none">Status set to failing.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8 max-w-6xl mx-auto space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-4xl font-black text-white tracking-tight italic uppercase">{courseInfo.title}</h2>
            <p className="text-lg text-slate-400 font-medium">Code: <span className="text-white font-sans">{courseInfo.code}</span></p>
          </motion.div>
          <button onClick={() => setIsPeriodModalOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 text-white font-black uppercase text-xs tracking-widest shadow-xl hover:brightness-110 transition-all active:scale-95">
            <Plus size={18} /> Add Assessment
          </button>
        </header>

        {pendingGoal && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-violet-600/10 border border-violet-500/30 p-5 rounded-3xl flex flex-wrap justify-between items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg"><Target className="text-white" size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Active Target</p>
                <p className="text-white font-bold text-lg">Need <span className="text-violet-400 font-sans">{pendingGoal.requiredScore}%</span> on {pendingGoal.examName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#0B0E14] p-2 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 px-3 italic">Achieved?</span>
              <button onClick={() => resolveGoal(true)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all active:scale-95">YES</button>
              <button onClick={() => setIsResultModalOpen(true)} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-all active:scale-95">NO</button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-center">
          <div className="flex bg-[#161B22] p-1.5 rounded-[2rem] border border-slate-800 shadow-2xl">
            {['MIDTERM', 'FINALS'].map((p) => {
              const isLocked = p === 'FINALS' && !isFinalsUnlocked;
              return (
                <button key={p}
                  onClick={() => {
                      if (isLocked) alert("🔒 Section Locked.");
                      else setActiveView(p);
                  }}
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
            <MetricCard
              index={0}
              title="GPA"
              value={displayGPA}
              icon={<GraduationCap size={24}/>}
              color={parseFloat(displayGPA) < 3.0 ? "text-red-500" : "text-violet-400"}
            />
            <MetricCard
              index={1}
              title="Status"
              value={currentStatus}
              icon={currentStatus === "Passing" ? <CheckCircle size={24}/> : <X size={24}/>}
              color={currentStatus === "Passing" ? "text-emerald-500" : "text-red-500"}
            />
            <MetricCard index={2} title="Units" value={courseInfo.units || "3"} icon={<GitBranch size={24}/>} color="text-white" />
            <MetricCard 
              index={3} 
              title="Weight" 
              value={`${displayWeight}%`} 
              icon={<PieChart size={24}/>} 
              color={displayWeight > 100 ? "text-red-500" : "text-emerald-400"} 
            />
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#161B22] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-800 bg-white/[0.02] flex justify-between items-center"><h4 className="text-lg font-black text-white uppercase tracking-tighter italic">{activeView} Assessments</h4></div>
          <div className="overflow-x-auto text-center font-sans">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-slate-800/50 bg-white/[0.01]">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Weight</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Score</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Contribution</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence>
                  {currentViewAssessments.length > 0 ? currentViewAssessments.map((item, index) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item.id || index} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5 text-white font-bold text-center font-sans">{item.name}</td>
                      <td className="px-8 py-5 text-slate-400 font-bold text-center">{item.weight}%</td>
                      <td className="px-8 py-5 text-white font-black text-center">{item.score}/{item.total}</td>
                      <td className="px-8 py-5 text-violet-400 font-black text-center text-lg">+{((item.score / item.total) * item.weight).toFixed(1)}%</td>
                      <td className="px-8 py-5 text-right font-sans">
                        <button onClick={() => handleDeleteAssessment(item.id, item.name)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 font-sans"><Trash2 size={16} /></button>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-500 italic font-medium">No assessments recorded.</td></tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-12 block relative">
          {(activeView === 'MIDTERM' || isFinalsUnlocked) && (
              <GradeProjector
                key={`${activeView}-projector`}
                initialCS1={rawCSContribution.toFixed(1)}
                initialPE={rawExamContribution.toFixed(1)}
                totalWeightUsed={totalWeightUsed}
                activePeriodProp={activeView}
                onSaveTarget={handleSaveTarget}
              />
          )}
        </div>

        <RecordResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          onSave={handleSaveExamResult}
          period={activeView}
          remainingWeight={100 - totalWeightUsed} 
        />

        <PeriodSelectionModal isOpen={isPeriodModalOpen} onClose={() => setIsPeriodModalOpen(false)} onSelect={handlePeriodSelection} isMidtermComplete={isFinalsUnlocked} />
        <AddAssessmentForm isOpen={isEntryModalOpen} periodName={selectedPeriod} onClose={() => setIsEntryModalOpen(false)} onSubmit={handleAssessmentSubmit} />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, index }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.1 }} className="bg-[#161B22] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-violet-500/30 transition-all">
    <div className="absolute top-0 right-0 p-6 opacity-5 text-white group-hover:scale-110 group-hover:opacity-20 transition-all font-sans">{icon}</div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 font-sans">{title}</p>
    <h3 className={`text-4xl font-black italic tracking-tighter ${color} font-sans`}>{value}</h3>
  </motion.div>
);

export default CourseDetails;