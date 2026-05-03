import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Menu, Search, Bell, Award, Sparkles, Sliders, Hash, 
  Moon, Shield, Lock, UserCheck, ChevronRight, LogOut, 
  AlertCircle, Edit3, Camera, GraduationCap, BarChart3, HelpCircle
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // CONFIGURATION: Dynamic API URL for Production/Local
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // --- Dynamic Stats State ---
  const [stats, setStats] = useState({ gwa: "0.000", units: 0, honorTitle: "Technologian" });
  const [userName, setUserName] = useState(localStorage.getItem('userName') || "Student");
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  
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

  // --- DYNAMIC DATA FETCHING (CIT-U ALIGNED) ---
  useEffect(() => {
    if (!userEmail) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/my-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
        
        if (res.ok) {
          const courses = await res.json();
          let totalGradePoints = 0;
          let totalUnits = 0;

          courses.forEach(c => {
            const mid = parseFloat(c.midtermGrade) || 0;
            const fin = parseFloat(c.finalGrade) || 0;
            const mw = (c.midtermWeight || 50) / 100;
            const fw = (c.finalWeight || 50) / 100;
            const avg = (mid * mw) + (fin * fw);
            
            if (avg > 0) {
              totalGradePoints += (avg * (c.units || 0));
              totalUnits += (c.units || 0);
            }
          });

          const calculatedGWA = totalUnits > 0 ? (totalGradePoints / totalUnits) : 0;
          
          let title = "Junior Student";
          if (calculatedGWA >= 4.800) title = "Summa Cum Laude Candidate";
          else if (calculatedGWA >= 4.600) title = "Magna Cum Laude Candidate";
          else if (calculatedGWA >= 4.400) title = "Cum Laude Candidate";
          else if (totalUnits < 70) title = "Technologian";

          setStats({
            gwa: calculatedGWA.toFixed(3), 
            units: totalUnits,
            honorTitle: title
          });
        }
      } catch (err) {
        console.error("Failed to load settings stats:", err);
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

  // --- UPDATED LOGOUT HANDLER ---
  const handleLogout = () => {
    // Loop through keys to delete session data but protect grade goals and banners
    Object.keys(localStorage).forEach(key => {
      const isPendingGoal = key.startsWith('pendingGoal_');
      const isCourseStatus = key.startsWith('course_status_');
      
      // If it's NOT a grade-tracking key, remove it
      if (!isPendingGoal && !isCourseStatus) {
        localStorage.removeItem(key);
      }
    });
    
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-300 font-sans selection:bg-violet-500/30">
      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-white font-black italic uppercase tracking-tighter text-xl">Settings</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-none mb-1">{userName}</p>
              <p className="text-[9px] text-violet-400 uppercase font-black tracking-widest">{stats.honorTitle}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-violet-600 overflow-hidden">
              <img src={profilePic} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="max-w-[1200px] w-full mx-auto p-8 space-y-10 pb-20">
          <section className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-800">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <div className="w-28 h-28 rounded-full bg-slate-700 border-4 border-violet-600/20 shadow-2xl overflow-hidden relative">
                <img src={profilePic} alt="" className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-30' : 'group-hover:opacity-50'}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white">
                  <Camera size={24} />
                  <span className="text-[9px] font-black uppercase mt-1">Change</span>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-tight">{userName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/10 flex items-center gap-2 uppercase tracking-widest"><Award size={14} /> Dean's Lister</span>
                <span className="text-[10px] font-black text-violet-400 bg-violet-500/10 px-4 py-2 rounded-xl border border-violet-500/10 flex items-center gap-2 uppercase tracking-widest"><Sparkles size={14} /> Scholar</span>
              </div>
            </div>
            <button onClick={() => setShowEditProfileModal(true)} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-violet-600/20 active:scale-95 flex items-center gap-2">
              <Edit3 size={16} /> Edit Profile
            </button>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox title="Current GWA" value={stats.gwa} icon={<GraduationCap className="text-emerald-500" />} />
            <StatBox title="Units Earned" value={stats.units} sub="/ 120" icon={<BarChart3 className="text-blue-500" />} />
            <StatBox title="Current Status" value={stats.honorTitle.split(' ')[0]} sub={stats.honorTitle.split(' ').slice(1).join(' ')} icon={<Sparkles className="text-violet-500" />} highlight />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-500 ml-2">
                <Shield className="text-violet-500" size={16} /> Account Security
              </h2>
              <div className="bg-[#161B22] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                <SecurityBtn label="Change Password" icon={<Lock size={18}/>} onClick={() => setShowPasswordModal(true)} />
                <SecurityBtn label="Privacy Policy" icon={<UserCheck size={18}/>} onClick={() => setShowPrivacyModal(true)} />
                <SecurityBtn label="About Grade Guardian" icon={<Hash size={18}/>} onClick={() => setShowAboutModal(true)} />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-500 ml-2">
                <HelpCircle className="text-emerald-500" size={16} /> Grade Guardian FAQ
              </h2>
              <div className="bg-[#161B22] rounded-[2.5rem] border border-slate-800 p-8 space-y-6 shadow-2xl">
                <FAQItem q="How are Honors calculated?" a="Based on CIT-U rules: Summa (4.8+), Magna (4.6+), and Cum Laude (4.4+)." />
                <FAQItem q="Is GWA unit-weighted?" a="Yes. Every calculation accounts for subject unit weighting automatically." />
              </div>
            </section>
          </div>

          <div className="pt-8 border-t border-slate-800 flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">App Version 2.4.1 (Stable)</p>
            <button onClick={() => setShowLogoutModal(true)} className="text-red-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-red-400 transition-colors">
                <LogOut size={16} /> Log Out System
            </button>
          </div>
        </div>
      </main>

      {showEditProfileModal && (
        <Modal title="Edit Profile" onClose={() => setShowEditProfileModal(false)}>
           <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" className="w-full bg-[#0B0E14] border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-violet-600" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-800 font-black uppercase text-[10px]">Cancel</button>
                <button type="submit" className="flex-[2] bg-violet-600 py-4 rounded-2xl font-black uppercase text-[10px] text-white">Save Changes</button>
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
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-800 font-black uppercase text-[10px]">Cancel</button>
              <button type="submit" className="flex-[2] bg-violet-600 py-4 rounded-2xl font-black uppercase text-[10px] text-white">Update Now</button>
            </div>
          </form>
        </Modal>
      )}

      {showPrivacyModal && (
        <Modal title="Data Privacy" onClose={() => setShowPrivacyModal(false)}>
          <div className="text-left space-y-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
            <PrivacySection title="Data Use" desc="We process your grades solely to calculate your GWA and Honor standing local to this device and your secure account." />
            <PrivacySection title="CIT-U Logic" desc="All calculations follow the official CIT-U Student Handbook criteria (Summa, Magna, Cum Laude)." />
            <PrivacySection title="Security" desc="Your account is protected by encrypted password hashing. We never sell or share your academic data." />
          </div>
          <button onClick={() => setShowPrivacyModal(false)} className="w-full mt-8 bg-slate-800 py-4 rounded-2xl font-black uppercase text-[10px]">Close Privacy Policy</button>
        </Modal>
      )}

      {showAboutModal && (
        <Modal title="Grade Guardian" onClose={() => setShowAboutModal(false)}>
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-5 bg-violet-600/10 rounded-[2rem] border border-violet-500/20 shadow-lg shadow-violet-600/5">
                <GraduationCap size={48} className="text-violet-500" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h4 className="text-white font-black uppercase italic text-lg tracking-tight leading-none">Night Owl Edition</h4>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Version 2.4.1 Stable</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed px-4">
              Grade Guardian is a specialized academic management engine designed for Technologians. 
              It provides real-time GWA tracking and honor forecasting.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800/50 flex justify-between items-center text-left">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Developer</span>
                <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest">Andrae Louise Lapis</span>
              </div>
              <div className="bg-[#0B0E14] p-4 rounded-2xl border border-slate-800/50 flex justify-between items-center text-left">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Framework</span>
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">React + Spring Boot</span>
              </div>
            </div>
            <button onClick={() => setShowAboutModal(false)} className="w-full mt-4 bg-slate-800 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white">Close System Info</button>
          </div>
        </Modal>
      )}

      {showLogoutModal && (
        <Modal title="System Exit" onClose={() => setShowLogoutModal(false)}>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">Terminate your current session? Your GWA targets and banners will be preserved on this device.</p>
          <div className="flex gap-4">
            <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-800 font-black uppercase text-[10px]">Cancel</button>
            <button onClick={handleLogout} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px]">Log Out</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const StatBox = ({ title, value, sub, icon, highlight }) => (
  <div className="bg-[#161B22] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">{icon}</div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className={`text-4xl font-black italic tracking-tighter ${highlight ? 'text-violet-500' : 'text-white'}`}>{value}</h3>
      {sub && <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{sub}</span>}
    </div>
  </div>
);

const SecurityBtn = ({ label, icon, onClick }) => (
  <button onClick={onClick} className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group border-b border-slate-800/50 last:border-none text-left">
    <div className="flex items-center gap-4 text-slate-400 group-hover:text-white transition-colors">{icon}<span className="text-sm font-bold">{label}</span></div>
    <ChevronRight size={18} className="text-slate-700 group-hover:text-violet-500" />
  </button>
);

const FAQItem = ({ q, a }) => (
  <div className="space-y-1"><p className="text-white font-black text-xs uppercase italic group-hover:text-emerald-400 transition-colors leading-none">{q}</p><p className="text-slate-500 text-[11px] leading-relaxed">{a}</p></div>
);

const PrivacySection = ({ title, desc }) => (
  <div className="space-y-1"><h4 className="text-violet-400 font-black text-[10px] uppercase tracking-widest">{title}</h4><p className="text-slate-400 text-xs leading-relaxed">{desc}</p></div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div className="bg-[#161B22] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center">
      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8">{title}</h3>
      {children}
    </div>
  </div>
);

const PassInput = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input type="password" required className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default Settings;