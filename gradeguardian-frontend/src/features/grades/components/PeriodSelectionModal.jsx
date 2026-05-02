import React, { useState } from 'react';
import { X, TrendingUp, GraduationCap, CalendarDays, Award, ArrowRight, Lock } from 'lucide-react';
// Import the utility to convert GPA (3.0) to raw points (60)
import { transmuteGPAtoRaw } from '../../../utils/gradeCalculations';

export const PeriodSelectionModal = ({ isOpen, onClose, onSelect, isMidtermComplete }) => {
  const [step, setStep] = useState('select'); // 'select' or 'manualMS'
  const [manualMS, setManualMS] = useState('');

  if (!isOpen) return null;

  const handleFinalsClick = () => {
    if (isMidtermComplete) {
      onSelect('FINALS');
      setStep('select');
    } else {
      setStep('manualMS');
    }
  };

  const handleConfirmManual = () => {
    // 1. Validate GPA range (1.0 to 5.0)
    const gpaValue = parseFloat(manualMS);
    if (!manualMS || isNaN(gpaValue) || gpaValue < 1.0 || gpaValue > 5.0) {
      return alert("Please enter a valid Midterm Grade (e.g., 1.0 to 5.0).");
    }
    
    // 2. CONVERT GPA TO RAW POINTS for the math engine
    // This turns 3.0 into 60.0 so the Bridge math works correctly
    const rawMidtermPoints = transmuteGPAtoRaw(gpaValue);
    
    // 3. REVISED: Pass BOTH values back
    // We pass an object so CourseDetails can use raw points for math 
    // and the gpaValue for the Database save.
    onSelect('FINALS', {
      raw: rawMidtermPoints,
      gpa: gpaValue
    });

    setStep('select'); 
    setManualMS(''); // Clear input
  };

  const handleClose = () => {
    setStep('select');
    setManualMS('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="w-full max-w-[480px] rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent p-[1px] shadow-2xl">
        <div className="flex flex-col gap-8 rounded-[2.4rem] bg-[#1c2128] p-8 lg:p-10 border border-white/5 relative overflow-hidden">
          
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-[80px]"></div>

          {step === 'select' ? (
            <>
              <div className="flex flex-col gap-3 text-center relative z-10">
                <h1 className="text-3xl font-black leading-tight text-white lg:text-4xl tracking-tight uppercase italic">
                  Select Period
                </h1>
                <p className="text-slate-400 text-base font-medium">
                  Which period would you like to calculate?
                </p>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <button 
                  onClick={() => onSelect('MIDTERM')}
                  className="group relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl bg-violet-600 px-6 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-600/20"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-20">
                    <TrendingUp size={120} className="text-white -rotate-12" />
                  </div>
                  <div className="relative flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CalendarDays size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-black tracking-widest text-white uppercase italic">MIDTERM</span>
                  </div>
                </button>

                <button 
                  onClick={handleFinalsClick}
                  className="group relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl bg-teal-500 px-6 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-500/20"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-20">
                    <GraduationCap size={120} className="text-black -rotate-12" />
                  </div>
                  <div className="relative flex items-center gap-4">
                    <div className="bg-black/10 p-2 rounded-lg">
                      {isMidtermComplete ? <Award size={24} className="text-[#0B0E14]" /> : <Lock size={24} className="text-[#0B0E14]" />}
                    </div>
                    <span className="text-xl font-black tracking-widest text-[#0B0E14] uppercase italic">FINALS</span>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 relative z-10 animate-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto text-teal-500 mb-2">
                <GraduationCap size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Unlock Finals</h3>
                <p className="text-slate-400 text-sm leading-relaxed px-4">
                  To bridge into Finals, please enter your current <span className="text-teal-400 font-bold">Midterm Grade</span> (e.g., 3.0, 2.5).
                </p>
              </div>
              
              <div className="bg-[#0B0E14]/50 border border-slate-700 rounded-[2.5rem] p-8 flex flex-col items-center gap-2 shadow-inner">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target GPA Value</label>
                <input 
                  autoFocus
                  type="number" 
                  step="0.1"
                  placeholder="3.0" 
                  className="bg-transparent text-white font-black text-5xl outline-none w-full text-center placeholder:opacity-20"
                  value={manualMS}
                  onChange={(e) => setManualMS(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmManual}
                  className="w-full py-4 bg-teal-500 text-[#0B0E14] font-black rounded-2xl shadow-lg shadow-teal-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
                >
                  Unlock & Continue <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => setStep('select')}
                  className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-2 relative z-10">
            <button 
              onClick={handleClose}
              className="flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold text-slate-400 transition-all hover:text-white hover:bg-white/5"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};