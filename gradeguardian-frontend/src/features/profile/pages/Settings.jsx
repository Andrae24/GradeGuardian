import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Menu, Search, Bell, Award, Sparkles, Sliders, Hash, 
  Moon, Shield, Lock, UserCheck, ChevronRight, LogOut, 
  AlertCircle, Edit3, Camera, GraduationCap, BarChart3, HelpCircle, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // CONFIGURATION: Dynamic API URL for Production/Local
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // --- Dynamic Stats State ---
  const [stats, setStats] = useState({ gwa: "0.00", units: 0, honorTitle: "Technologian" });
  const [userName, setUserName] = useState(localStorage.getItem('userName') || "Student");
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [highestYearCard, setHighestYearCard] = useState("1st Year Standing");
  
  const storedPic = localStorage.getItem('userPhoto');
  const [profilePic, setProfilePic] = useState(
    (storedPic && storedPic !== "null" && storedPic !== "") 
    ? storedPic 
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`
  );

  // --- Modal States ---
  const [isUploading, setIsUploading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const [editName, setEditName] = useState(userName);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  // --- DYNAMIC DATA FETCHING (CIT-U GRADUATION HANDBOOK ALIGNED) ---
  useEffect(() => {
    if (!userEmail) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      try {
        // 1. Fetch all user courses to run master graduation GWA calculations
        const res = await fetch(`${API_BASE_URL}/api/courses/my-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
        
        // 2. Fetch saved semester cards to determine the highest generated year tier
        const semRes = await fetch(`${API_BASE_URL}/api/semesters/my-semesters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });

        let calculatedHighestYear = "1st Year Standing";

        if (semRes.ok) {
          const semesterCards = await semRes.json();
          if (Array.isArray(semesterCards) && semesterCards.length > 0) {
            let maxTier = 1;

            semesterCards.forEach(sem => {
              const label = (sem.yearLevel || sem.year_level || "").toLowerCase();
              if (label.includes("4th") && maxTier < 4) { maxTier = 4; calculatedHighestYear = "4th Year Standing"; }
              else if (label.includes("3rd") && maxTier < 3) { maxTier = 3; calculatedHighestYear = "3rd Year Standing"; }
              else if (label.includes("2nd") && maxTier < 2) { maxTier = 2; calculatedHighestYear = "2nd Year Standing"; }
            });
          }
        }
        setHighestYearCard(calculatedHighestYear);

        if (res.ok) {
          const courses = await res.json();
          let grandTotalGradePoints = 0;
          let grandTotalUnits = 0;

          // --- MASTER GRADUATION HIERARCHY LOOP ---
          courses.forEach(c => {
            const mid = parseFloat(c.midtermGrade) || 0;
            const fin = parseFloat(c.finalGrade) || 0;
            const mw = (c.midtermWeight || 50) / 100;
            const fw = (c.finalWeight || 50) / 100;
            
            let courseAverage = 0;
            if (mid > 0 && fin > 0) {
              const rawAvg = (mid * mw) + (fin * fw);
              const avgStr = rawAvg.toString();
              if (avgStr.includes('.')) {
                const parts = avgStr.split('.');
                courseAverage = parseFloat(parts[0] + '.' + parts[1].substring(0, 1));
              } else {
                courseAverage = rawAvg;
              }
            } else if (mid > 0) {
              courseAverage = mid;
            }
            
            if (courseAverage > 0) {
              grandTotalGradePoints += (courseAverage * (c.units || 0));
              grandTotalUnits += (c.units || 0);
            }
          });

          const graduationGWA = grandTotalUnits > 0 ? (grandTotalGradePoints / grandTotalUnits) : 0;
          
          // --- STRICT CUMULATIVE HONOR EVALUATION (PAGE 36 CRITERIA) ---
          let title = "Technologian";
          if (graduationGWA >= 4.800 && graduationGWA <= 5.000) {
            title = "Summa Cum Laude";
          } else if (graduationGWA >= 4.600 && graduationGWA <= 4.799) {
            title = "Magna Cum Laude";
          } else if (graduationGWA >= 4.400 && graduationGWA <= 4.599) {
            title = "Cum Laude";
          } else {
            title = grandTotalUnits >= 70 ? "Junior Student" : "Technologian";
          }

          // --- CHARACTER-BASED TWO-DECIMAL TRUNCATION ---
          const gwaString = graduationGWA.toString();
          let truncatedTwoDecimals = "0.00";
          
          if (gwaString.includes('.')) {
            const parts = gwaString.split('.');
            const wholeNumber = parts[0];
            const decimals = parts[1];
            const clippedDecimals = decimals.substring(0, 2);
            truncatedTwoDecimals = parseFloat(wholeNumber + '.' + clippedDecimals).toFixed(2);
          } else {
            truncatedTwoDecimals = graduationGWA.toFixed(2);
          }

          setStats({
            gwa: truncatedTwoDecimals, 
            units: grandTotalUnits,
            honorTitle: title
          });
        }
      } catch (err) {
        console.error("Failed to load graduation settings stats:", err);
      }
    };
    fetchStats();
  }, [userEmail, navigate, API_BASE_URL]);

  // --- HANDLERS ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords do not match!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: userEmail, 
            currentPassword: passwordData.current, 
            newPassword: passwordData.new 
        }),
      });
      if (response.ok) {
        alert("Password updated successfully!");
        setShowPasswordModal(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        const result = await response.json();
        alert(result.error || "Failed to update password");
      }
    } catch (error) { alert("Server connection error."); }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', userEmail);
    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/upload-photo`, {
        method: 'POST', body: formData, 
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userPhoto', data.photoUrl);
        setProfilePic(data.photoUrl);
        alert("Photo updated!");
      }
    } catch (error) { console.error(error); } 
    finally { setIsUploading(false); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, newName: editName }),
      });
      if (response.ok) {
        localStorage.setItem('userName', editName);
        setUserName(editName);
        setShowEditProfileModal(false);
        alert("Profile Updated!");
      }
    } catch (error) { alert("Error updating profile"); }
  };

  const handleLogout = () => {
    Object.keys(localStorage).forEach(key => {
      const isPendingGoal = key.startsWith('pendingGoal_');
      const isCourseStatus = key.startsWith('course_status_');
      if (!isPendingGoal && !isCourseStatus) {
        localStorage.removeItem(key);
      }
    });
    navigate('/auth');
  };

  const isHonor = stats.honorTitle.includes('Laude');

  return (
    <div className="flex min-h-screen bg-[#07090E] text-slate-300 font-sans selection:bg-violet-500/40 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 custom-scrollbar">
        {/* Header Block Layout */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-900 bg-[#07090E]/60 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_12px_#8b5cf6]"></div>
            <h2 className="text-white font-black italic uppercase tracking-wider text-xl">System Settings</h2>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800/60 pl-5 pr-2 py-1.5 rounded-full backdrop-blur-md">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white tracking-tight leading-none mb-1">{userName}</p>
              <p className="text-[9px] text-violet-400 uppercase font-black tracking-widest">{stats.honorTitle}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-violet-500/80 overflow-hidden shadow-inner flex items-center justify-center">
              <img src={profilePic} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="max-w-[1300px] w-full mx-auto p-10 space-y-12 pb-24">
          
          {/* Enhanced Profile Hero Banner */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 rounded-[3rem] border border-slate-800/80 bg-gradient-to-r from-[#111622] to-[#161B26] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/[0.03] rounded-full blur-3xl group-hover:bg-violet-600/[0.05] transition-all duration-700"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left w-full md:w-auto">
              <div className="relative cursor-pointer group/avatar" onClick={() => fileInputRef.current.click()}>
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full blur-md opacity-40 group-hover/avatar:opacity-80 transition-opacity duration-300"></div>
                <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-[#1c2333] shadow-2xl overflow-hidden relative z-10">
                  <img src={profilePic} alt="" className={`w-full h-full object-cover transition-all duration-300 ${isUploading ? 'opacity-20 animate-pulse' : 'group-hover/avatar:scale-105 group-hover/avatar:opacity-40'}`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 bg-black/50 text-white">
                    <Camera size={26} className="transform translate-y-2 group-hover/avatar:translate-y-0 transition-transform duration-300" />
                    <span className="text-[9px] font-black uppercase mt-1.5 tracking-wider">Upload</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-violet-400 font-black uppercase tracking-[0.25em]">Authenticated Profile</p>
                  <h1 className="text-4xl font-black text-white tracking-tight italic uppercase leading-none">{userName}</h1>
                </div>
                {/* --- FIXED: CARD-DEPENDENT PROGRESS MILESTONE BADGES --- */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
                  <span className="text-[9px] font-black text-slate-300 bg-slate-800/60 border border-slate-700/50 px-4 py-2 rounded-xl border-l-2 border-l-violet-500 flex items-center gap-2 uppercase tracking-wider shadow-sm">
                    <User size={13} className="text-violet-400" /> {highestYearCard}
                  </span>
                  <span className="text-[9px] font-black text-violet-400 bg-violet-500/10 px-4 py-2 rounded-xl border border-violet-500/20 flex items-center gap-2 uppercase tracking-wider shadow-sm">
                    <BarChart3 size={13} /> Active Load
                  </span>
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEditProfileModal(true)} 
              className="w-full md:w-auto bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-violet-600/20 flex items-center justify-center gap-2 relative z-10"
            >
              <Edit3 size={15} /> Edit Profile
            </motion.button>
          </motion.section>

          {/* Core Stat Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox title="Graduation GWA" value={stats.gwa} sub="2-Decimals" icon={<GraduationCap size={24} className="text-emerald-400" />} colorClass="border-l-emerald-500" />
            <StatBox title="Total Units Earned" value={stats.units} sub="/ 120 Load" icon={<BarChart3 size={24} className="text-blue-400" />} colorClass="border-l-blue-500" />
            <StatBox 
              title="Predicted Graduation Standing" 
              value={stats.honorTitle} 
              icon={<Sparkles size={24} className="text-violet-400" />} 
              highlight={isHonor} 
              colorClass={isHonor ? "border-l-violet-500" : "border-l-slate-700"}
            />
          </div>

          {/* Double Column Settings Body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Management Segment */}
            <motion.section initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2.5 text-slate-500 ml-2">
                <Shield className="text-violet-500" size={16} /> Account Security
              </h2>
              <div className="bg-[#11141D] rounded-[2.5rem] border border-slate-900 overflow-hidden shadow-xl">
                <SecurityBtn label="Change Password" icon={<Lock size={18} className="text-violet-400"/>} onClick={() => setShowPasswordModal(true)} />
                <SecurityBtn label="Privacy Policy" icon={<UserCheck size={18} className="text-emerald-400"/>} onClick={() => setShowPrivacyModal(true)} />
                <SecurityBtn label="About Grade Guardian" icon={<Hash size={18} className="text-blue-400"/>} onClick={() => setShowAboutModal(true)} />
              </div>
            </motion.section>

            {/* University FAQ Guide */}
            <motion.section initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2.5 text-slate-500 ml-2">
                <HelpCircle className="text-emerald-500" size={16} /> Grade Guardian FAQ
              </h2>
              <div className="bg-[#11141D] rounded-[2.5rem] border border-slate-900 p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/[0.01] rounded-full blur-2xl pointer-events-none"></div>
                <FAQItem q="How are Graduation Honors calculated?" a="Via single grand pool: Sum of (Grade * Units) ÷ Total Units logged across all years." />
                <FAQItem q="Does it follow the 75% residency rule?" a="Yes. Forecast targets track matching university constraints directly." />
              </div>
            </motion.section>
          </div>

          {/* System Environment Footer Drawer */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">App Version 2.4.1 (Stable Build)</p>
            <button onClick={() => setShowLogoutModal(true)} className="text-red-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-red-400 transition-colors bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-5 py-2.5 rounded-xl">
                <LogOut size={14} /> Log Out System
            </button>
          </div>
        </div>
      </main>

      {/* --- ALL SYSTEM MODALS --- */}
      <AnimatePresence>
        {showEditProfileModal && (
          <Modal title="Edit Profile" onClose={() => setShowEditProfileModal(false)}>
              <form onSubmit={handleUpdateProfile} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required className="w-full bg-[#07090E] border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-violet-600 font-medium transition-all" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditProfileModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 transition-colors font-black uppercase text-[10px] text-slate-300">Cancel</button>
                  <button type="submit" className="flex-[2] bg-violet-600 hover:bg-violet-500 transition-colors py-4 rounded-2xl font-black uppercase text-[10px] text-white shadow-lg shadow-violet-600/10">Save Changes</button>
                </div>
              </form>
          </Modal>
        )}

        {showPasswordModal && (
          <Modal title="Security Update" onClose={() => setShowPasswordModal(false)}>
            <form onSubmit={handlePasswordChange} className="space-y-4 text-left">
              <PassInput label="Current Password" value={passwordData.current} onChange={(v) => setPasswordData({...passwordData, current: v})} />
              <PassInput label="New Password" value={passwordData.new} onChange={(v) => setPasswordData({...passwordData, new: v})} />
              <PassInput label="Confirm New Password" value={passwordData.confirm} onChange={(v) => setPasswordData({...passwordData, confirm: v})} />
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 transition-colors font-black uppercase text-[10px] text-slate-300">Cancel</button>
                <button type="submit" className="flex-[2] bg-violet-600 hover:bg-violet-500 transition-colors py-4 rounded-2xl font-black uppercase text-[10px] text-white shadow-lg shadow-violet-600/10">Update Now</button>
              </div>
            </form>
          </Modal>
        )}

        {showPrivacyModal && (
          <Modal title="Data Privacy" onClose={() => setShowPrivacyModal(false)}>
            <div className="text-left space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <PrivacySection title="Data Use" desc="We process your grades solely to calculate your GWA and Honor standing local to this device and your secure account." />
              <PrivacySection title="CIT-U Logic" desc="All calculations follow the official CIT-U Student Handbook criteria (Summa, Magna, Cum Laude)." />
              <PrivacySection title="Security" desc="Your account is protected by encrypted password hashing. We never sell or share your academic data." />
            </div>
            <button onClick={() => setShowPrivacyModal(false)} className="w-full mt-8 bg-slate-800 hover:bg-slate-700/80 transition-colors py-4 rounded-2xl font-black uppercase text-[10px] text-slate-300">Close Privacy Policy</button>
          </Modal>
        )}

        {showAboutModal && (
          <Modal title="Grade Guardian" onClose={() => setShowAboutModal(false)}>
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-5 bg-violet-600/10 rounded-[2rem] border border-violet-500/20 shadow-xl shadow-violet-600/5 relative group">
                  <div className="absolute inset-0 bg-violet-500/20 rounded-[2rem] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <GraduationCap size={44} className="text-violet-500 relative z-10" />
                </div>
              </div>
              <div className="space-y-1.5 text-center">
                <h4 className="text-white font-black uppercase italic text-xl tracking-tight leading-none">Night Owl Edition</h4>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Version 2.4.1 Stable</p>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed px-2 text-center">
                Grade Guardian is a specialized academic management engine designed for Technologians. 
                It provides real-time GWA tracking and honor forecasting based on official university criteria.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <div className="bg-[#07090E] p-4 rounded-2xl border border-slate-900 flex justify-between items-center text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Developer</span>
                  <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest">Andrae Louise Lapis</span>
                </div>
                <div className="bg-[#07090E] p-4 rounded-2xl border border-slate-900 flex justify-between items-center text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Framework</span>
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">React + Spring Boot</span>
                </div>
              </div>
              <button onClick={() => setShowAboutModal(false)} className="w-full mt-4 bg-slate-800 hover:bg-slate-700/80 transition-colors py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white">Close System Info</button>
            </div>
          </Modal>
        )}

        {showLogoutModal && (
          <Modal title="System Exit" onClose={() => setShowLogoutModal(false)}>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed text-center">Terminate your current session? Your GWA targets and banners will be preserved on this device.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 transition-colors font-black uppercase text-[10px] text-slate-300">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 transition-colors text-white font-black uppercase text-[10px] shadow-lg shadow-red-600/10">Log Out</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- DESIGN-SYSTEM COMPONENT ELEMENTS ---
const StatBox = ({ title, value, sub, icon, highlight, colorClass }) => {
  const valueStyling = highlight
    ? 'text-lg sm:text-xl font-black text-violet-400 uppercase tracking-tight' 
    : 'text-4xl font-black text-white italic tracking-tighter';     

  return (
    <motion.div 
      whileHover={{ y: -4, border: '1px solid rgba(139, 92, 246, 0.2)' }}
      className={`bg-[#11141D] p-8 rounded-[2.5rem] border border-slate-900 shadow-xl relative overflow-hidden group h-full flex flex-col justify-between border-l-4 ${colorClass} transition-all duration-300`}
    >
      <div className="absolute -top-2 -right-2 p-5 bg-slate-900/40 rounded-full opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-300">
        {icon}
      </div>
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`${valueStyling} transition-colors duration-300`}>{value}</h3>
          {(sub && !highlight) && (
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{sub}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SecurityBtn = ({ label, icon, onClick }) => (
  <button onClick={onClick} className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/[0.015] transition-all group border-b border-slate-900 last:border-none text-left">
    <div className="flex items-center gap-4 text-slate-400 group-hover:text-white transition-colors">
      <div className="p-2.5 bg-slate-900 border border-slate-800/40 rounded-xl group-hover:border-slate-700/60 transition-all">
        {icon}
      </div>
      <span className="text-sm font-black uppercase tracking-tight text-slate-300 group-hover:text-white">{label}</span>
    </div>
    <ChevronRight size={16} className="text-slate-700 transform group-hover:translate-x-1 group-hover:text-violet-400 transition-all" />
  </button>
);

const FAQItem = ({ q, a }) => (
  <div className="group space-y-1.5 border-b border-slate-900/60 pb-4 last:border-none last:pb-0">
    <p className="text-white font-black text-xs uppercase italic group-hover:text-emerald-400 transition-colors leading-tight flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-60"></div> {q}
    </p>
    <p className="text-slate-500 text-[11px] font-medium leading-relaxed pl-3.5">{a}</p>
  </div>
);

const PrivacySection = ({ title, desc }) => (
  <div className="space-y-1.5 border-b border-slate-900 pb-4 last:border-none last:pb-0">
    <h4 className="text-violet-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
      <span className="w-1 h-3 bg-violet-500 rounded-full"></span> {title}
    </h4>
    <p className="text-slate-400 text-xs leading-relaxed font-medium pl-3">{desc}</p>
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="bg-[#11141D] border border-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500"></div>
      <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-8">{title}</h3>
      {children}
    </motion.div>
  </motion.div>
);

const PassInput = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input type="password" required className="w-full bg-[#07090E] border border-slate-800 rounded-xl px-4 py-3.5 text-white font-medium outline-none focus:ring-1 focus:ring-violet-500/50 transition-all" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default Settings;