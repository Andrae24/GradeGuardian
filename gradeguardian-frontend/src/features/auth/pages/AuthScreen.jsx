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
  // States: 'auth' (login/signup), 'forgot', 'verify', 'reset'
  const [stage, setStage] = useState('auth'); 
  
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

  // --- STEP 2: FORGOT PASSWORD HANDLERS ---
  
  // 1. Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) setStage('verify');
      else setErrorMsg("Email not found.");
    } catch (err) { setErrorMsg("Server error."); }
    finally { setIsLoading(false); }
  };

  // 2. Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      if (res.ok) setStage('reset');
      else setErrorMsg("Invalid or expired code.");
    } catch (err) { setErrorMsg("Server error."); }
    finally { setIsLoading(false); }
  };

  // 3. Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/reset-password', {
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

  // Original Submit Handler (Login/Signup)
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
      const response = await fetch(`http://localhost:8080${endpoint}`, {
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
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 font-sans text-slate-100">
      <motion.div 
        layout
        className="w-full max-w-md bg-[#161B22] rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden relative"
      >
        {/* Night Owl Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 blur-[100px] rounded-full" />
        
        <div className="p-8 text-center border-b border-slate-800/50">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-600/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Grade Guardian</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Night Owl Edition</p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* STAGE: LOGIN / SIGNUP */}
            {stage === 'auth' && (
              <motion.div 
                key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-xl font-black text-white italic uppercase mb-6">
                  {isLogin ? 'Welcome back! 👋' : 'Get Started 🚀'}
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {errorMsg && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-center">{errorMsg}</div>}
                  
                  {!isLogin && (
                    <InputGroup label="Full Name" icon={<User size={18}/>} name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Andrae Lapis" />
                  )}
                  
                  <InputGroup label="Email Address" icon={<Mail size={18}/>} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@university.edu" />
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                      {isLogin && <button type="button" onClick={() => setStage('forgot')} className="text-[10px] font-black text-violet-400 hover:text-violet-300 uppercase">Forgot?</button>}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
                      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] border border-slate-800 rounded-xl focus:border-violet-600 outline-none text-slate-200 transition-all" />
                    </div>
                  </div>

                  {!isLogin && (
                    <InputGroup label="Confirm Password" icon={<Lock size={18}/>} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                  )}

                  <SubmitButton isLoading={isLoading} text={isLogin ? 'Sign In' : 'Create Account'} />
                </form>

                <div className="mt-8 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 text-sm font-bold">
                    {isLogin ? "New here? " : "Joined already? "} 
                    <span className="text-violet-400 hover:underline">{isLogin ? 'Sign Up' : 'Log In'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE: FORGOT PASSWORD (EMAIL) */}
            {stage === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <button onClick={() => setStage('auth')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"><ChevronLeft size={16}/> Back</button>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-black text-white italic uppercase">Forgot Password?</h2>
                  <p className="text-slate-500 text-sm font-medium">No worries. We'll send a code to your email.</p>
                </div>
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <InputGroup label="Email Address" icon={<Mail size={18}/>} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
                  <SubmitButton isLoading={isLoading} text="Send Recovery Code" icon={<Key size={18}/>} />
                </form>
              </motion.div>
            )}

            {/* STAGE: VERIFY OTP */}
            {stage === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-black text-white italic uppercase">Verify Email</h2>
                  <p className="text-slate-500 text-sm font-medium">Enter the 6-digit code sent to <br/><span className="text-violet-400">{formData.email}</span></p>
                </div>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <input name="otp" type="text" maxLength={6} value={formData.otp} onChange={handleChange} placeholder="0 0 0 0 0 0" className="w-full bg-[#0B0E14] border-2 border-slate-800 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.3em] text-violet-400 focus:border-violet-600 outline-none transition-all" />
                  <SubmitButton isLoading={isLoading} text="Verify Code" icon={<CheckCircle size={18}/>} />
                  <button type="button" onClick={handleRequestOTP} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white flex items-center justify-center gap-2"><RefreshCw size={12}/> Resend Code</button>
                </form>
              </motion.div>
            )}

            {/* STAGE: RESET PASSWORD */}
            {stage === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-xl font-black text-white italic uppercase text-center">New Password</h2>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <InputGroup label="New Password" icon={<Lock size={18}/>} name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="••••••••" />
                  <InputGroup label="Confirm New Password" icon={<Lock size={18}/>} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                  <SubmitButton isLoading={isLoading} text="Update Password" color="bg-emerald-600 hover:bg-emerald-500" />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-[#0B0E14]/50 p-4 text-center border-t border-slate-800/50">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 Grade Guardian. Built for Students.</p>
        </div>
      </motion.div>
    </div>
  );
}

// Reusable Components for cleaner code
const InputGroup = ({ label, icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-violet-500 transition-colors">{icon}</div>
      <input {...props} className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] border border-slate-800 rounded-xl focus:border-violet-600 outline-none text-slate-200 placeholder-slate-700 transition-all font-medium" />
    </div>
  </div>
);

const SubmitButton = ({ isLoading, text, icon, color = "bg-violet-600 hover:bg-violet-500" }) => (
  <button 
    type="submit" disabled={isLoading}
    className={`w-full py-3.5 ${color} disabled:opacity-50 text-white font-black uppercase italic tracking-tighter rounded-xl flex items-center justify-center gap-2 transition-all mt-4 shadow-xl active:scale-95`}
  >
    {isLoading ? 'Processing...' : text}
    {!isLoading && (icon || <ArrowRight size={18} />)}
  </button>
);