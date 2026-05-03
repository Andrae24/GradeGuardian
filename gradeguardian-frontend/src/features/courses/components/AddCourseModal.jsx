import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const AddCourseModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [units, setUnits] = useState('3');
  const [selectedColor, setSelectedColor] = useState(0);
  
  // CONFIGURATION: Dynamic API URL for Production/Local
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // NEW: State for Dynamic Weighting Scheme
  const [weighting, setWeighting] = useState('50-50');
  const [error, setError] = useState('');

  const colors = [
    { bg: 'bg-indigo-500', hex: '#6366f1', text: 'text-indigo-500' },
    { bg: 'bg-emerald-500', hex: '#10b981', text: 'text-emerald-500' },
    { bg: 'bg-rose-500', hex: '#f43f5e', text: 'text-rose-500' },
    { bg: 'bg-amber-500', hex: '#f59e0b', text: 'text-amber-500' },
    { bg: 'bg-sky-500', hex: '#0ea5e9', text: 'text-sky-500' },
    { bg: 'bg-fuchsia-500', hex: '#d946ef', text: 'text-fuchsia-500' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    
    const userEmail = localStorage.getItem('userEmail');

    // Convert dropdown string to actual weight values
    const midtermW = weighting === '50-50' ? 50 : 40;
    const finalW = weighting === '50-50' ? 50 : 60;

    const coursePayload = {
      courseCode: code.toUpperCase(), 
      title: name,                    
      units: parseInt(units),         
      userEmail: userEmail,
      color: colors[selectedColor].text,
      bg: colors[selectedColor].bg,
      // Sending weights to the backend
      midtermWeight: midtermW,
      finalWeight: finalW
    };

    try {
      // Updated to use API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/courses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursePayload),
      });

      const data = await response.json();

      if (response.status === 409) {
        setError(data.error); 
        return;
      }

      if (response.ok) {
        onAdd(data);
        // Reset form
        setName('');
        setCode('');
        setUnits('3');
        setWeighting('50-50');
        setSelectedColor(0);
        setError('');
        onClose();
      } else {
        setError(data.error || "Server error during course persistence");
      }
    } catch (error) {
      setError("Network error. Make sure your Spring Boot backend is active.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Add Course</h2>
            <p className="text-slate-400 text-sm mt-1">Initialize your course settings and targets.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Course Information</h3>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300" htmlFor="course-name">Course Name</label>
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none py-2 px-3" 
                id="course-name" 
                placeholder="e.g. Advanced Web Development" 
                type="text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300" htmlFor="course-code">Course Code</label>
                <input 
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none py-2 px-3" 
                  id="course-code" 
                  placeholder="IT 311" 
                  type="text"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300" htmlFor="units">Units</label>
                <select 
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:ring-violet-500 focus:border-violet-500 transition-all outline-none py-2 px-3" 
                  id="units"
                >
                  <option value="1">1 Unit</option>
                  <option value="2">2 Units</option>
                  <option value="3">3 Units</option>
                  <option value="4">4 Units</option>
                  <option value="5">5 Units</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300" htmlFor="weighting">Grading Scheme</label>
              <select 
                value={weighting}
                onChange={(e) => setWeighting(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:ring-violet-500 focus:border-violet-500 transition-all outline-none py-2 px-3" 
                id="weighting"
              >
                <option value="50-50">50% Midterm / 50% Finals</option>
                <option value="40-60">40% Midterm / 60% Finals</option>
              </select>
              <p className="text-[10px] text-slate-500 italic mt-1 leading-tight px-1">
                Major subjects at CIT-U often weigh Finals at 60%.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Appearance</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Color Coding</label>
              <div className="flex flex-wrap gap-3">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(idx)}
                    className={`w-8 h-8 rounded-full ${color.bg} ring-offset-2 ring-offset-[#1e293b] transition-all
                      ${selectedColor === idx ? 'ring-2 ring-violet-500 scale-110' : 'hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all"
            >
              Add Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};