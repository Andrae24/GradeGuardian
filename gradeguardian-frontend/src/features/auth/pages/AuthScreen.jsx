import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, User, ArrowRight, ShieldCheck, 
  Key, CheckCircle, ChevronLeft, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthScreen() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [stage, setStage] = useState('auth'); 
  
  // CONFIGURATION: Dynamic Backend Entry URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FORGOT PASSWORD HANDLERS ---
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) setStage('verify');
      else setErrorMsg("Email not found.");
    } catch (err) { setErrorMsg("Server error."); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      if (res.ok) setStage('reset');
      else setErrorMsg("Invalid or expired code.");
    } catch (err) { setErrorMsg("Server error."); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          newPassword: formData.newPassword 
        }),
      });
      if (res.ok) {
        alert("Password reset successful!");
        setStage('auth');
        setIsLogin(true);
      }
    } catch (err) { setErrorMsg("Reset failed."); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || "An error occurred.");
      } else {
        if (isLogin) {
          localStorage.setItem("userId", data.id);
          localStorage.setItem("userName", data.name);
          localStorage.setItem("userEmail", data.email);
          localStorage.setItem("userPhoto", data.photoUrl || ""); 
          localStorage.setItem("isLoggedIn", "true");
          navigate('/dashboard');
        } else {
          setIsLogin(true);
          setStage('auth');
        }
      }
    } catch (error) { setErrorMsg("Backend Connection Error."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6 font-sans text-slate-100 relative overflow-hidden">
      {/* Cinematic Studio Light Overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        layout
        className="w-full max-w-md bg-[#11141D] rounded-[2.5rem] shadow-2xl border border-slate-900 overflow-hidden relative backdrop-blur-xl"
      >
        {/* Fine Header Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-600 to-indigo-600" />
        
        <div className="p-8 text-center border-b border-slate-900/60 pt-10">
          <div className="relative inline-block group mb-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center relative z-10 shadow-lg shadow-violet-600/20">
              <ShieldCheck size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">Grade Guardian</h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.25em] mt-1.5">Night Owl Edition</p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {stage === 'auth' && (
              <motion.div 
                key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-black text-white italic uppercase tracking-wide">
                  {isLogin ? 'Welcome back! 👋' : 'Get Started 🚀'}
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="text-red-400 text-xs bg-red-500/5 p-3.5 rounded-xl border border-red-500/10 text-center font-bold uppercase tracking-wide">
                      {errorMsg}
                    </div>
                  )}
                  
                  {!isLogin && (
                    <InputGroup label="Full Name" icon={<User size={16}/>} name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Andrae Lapis" />
                  )}
                  
                  <InputGroup label="Email Address" icon={<Mail size={16}/>} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@university.edu" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                      {isLogin && (
                        <button type="button" onClick={() => setStage('forgot')} className="text-[9px] font-black text-violet-400 hover:text-violet-300 uppercase tracking-wider transition-colors">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-violet-500 transition-colors">
                        <Lock size={16} />
                      </div>
                      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 bg-[#07090E] border border-slate-900 rounded-xl focus:ring-1 focus:ring-violet-500/40 outline-none text-slate-200 transition-all text-sm font-semibold" />
                    </div>
                  </div>

                  {!isLogin && (
                    <InputGroup label="Confirm Password" icon={<Lock size={16}/>} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                  )}

                  <SubmitButton isLoading={isLoading} text={isLogin ? 'Sign In' : 'Create Account'} />
                </form>

                <div className="text-center pt-2">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 text-xs font-bold tracking-wide transition-colors">
                    {isLogin ? "New here? " : "Joined already? "} 
                    <span className="text-violet-400 hover:text-violet-300 font-black uppercase tracking-wider">{isLogin ? 'Sign Up' : 'Log In'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {stage === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <button onClick={() => setStage('auth')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-[9px] font-black uppercase tracking-widest">
                  <ChevronLeft size={14}/> Back
                </button>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-white italic uppercase tracking-wide">Forgot Password?</h2>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">No worries. Enter your registered email below and we'll transmit a secure verification recovery code.</p>
                </div>
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <InputGroup label="Email Address" icon={<Mail size={16}/>} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
                  <SubmitButton isLoading={isLoading} text="Send Recovery Code" icon={<Key size={16}/>} />
                </form>
              </motion.div>
            )}

            {stage === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-lg font-black text-white italic uppercase tracking-wide">Verify Identity</h2>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">Provide the 6-digit verification sequence forwarded to <br/><span className="text-violet-400 font-semibold">{formData.email}</span></p>
                </div>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <input name="otp" type="text" maxLength={6} value={formData.otp} onChange={handleChange} placeholder="000000" className="w-full bg-[#07090E] border border-slate-900 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.25em] text-violet-400 focus:ring-1 focus:ring-violet-500/40 outline-none transition-all font-mono shadow-inner" />
                  <SubmitButton isLoading={isLoading} text="Verify Token" icon={<CheckCircle size={16}/>} />
                  <button type="button" onClick={handleRequestOTP} className="w-full text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"><RefreshCw size={11}/> Resend Code</button>
                </form>
              </motion.div>
            )}

            {stage === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h2 className="text-lg font-black text-white italic uppercase tracking-wide text-center">New Credentials</h2>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <InputGroup label="New Password" icon={<Lock size={16}/>} name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="••••••••" />
                  <InputGroup label="Confirm New Password" icon={<Lock size={16}/>} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                  <SubmitButton isLoading={isLoading} text="Update Password" color="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/5" />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-[#07090E]/40 p-4 text-center border-t border-slate-900/60 backdrop-blur-md">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">© 2026 Grade Guardian. Engineered for Excellence.</p>
        </div>
      </motion.div>
    </div>
  );
}

const InputGroup = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-violet-500 transition-colors">{icon}</div>
      <input {...props} className="w-full pl-11 pr-4 py-3.5 bg-[#07090E] border border-slate-900 rounded-xl focus:ring-1 focus:ring-violet-500/40 outline-none text-slate-200 placeholder-slate-800 transition-all text-sm font-semibold shadow-inner" />
    </div>
  </div>
);

const SubmitButton = ({ isLoading, text, icon, color = "bg-violet-600 hover:bg-violet-500 shadow-violet-600/5" }) => (
  <motion.button 
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    type="submit" disabled={isLoading}
    className={`w-full py-4 ${color} disabled:opacity-50 text-white font-black uppercase italic tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-xl active:scale-95`}
  >
    {isLoading ? 'Processing...' : text}
    {!isLoading && (icon || <ArrowRight size={15} />)}
  </motion.button>
);