import React, { useState } from 'react';
import { PeriodSelectionModal } from '../../../components/PeriodSelectionModal';
import { GradeProjector } from '../GradeProjector';
import { ChevronLeft } from 'lucide-react'; // Added for the back button

const Grades = () => {
  // 1. Manage which 'view' the student sees
  const [view, setView] = useState('selection'); // Default state

  // 2. Handler: Normalize the string to lowercase immediately
  const handlePeriodSelect = (period) => {
    const normalized = period.toLowerCase(); 
    setView(normalized); // Set view to 'midterm' or 'finals'
  };

  return (
    <div className="flex h-screen bg-[#0B0E14] text-slate-200">
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* --- VIEW 1: Selection Modal --- */}
        {view === 'selection' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-md">
            <PeriodSelectionModal 
              isOpen={true} 
              onSelect={handlePeriodSelect}
              onClose={() => {}} 
            />
          </div>
        )}

        {/* --- VIEW 2 & 3: Grade Projector --- */}
        {(view === 'midterm' || view === 'finals') && (
          <div className="flex-1 overflow-y-auto p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button */}
            <button 
              onClick={() => setView('selection')}
              className="mb-8 text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest group"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Selection
            </button>

            {/* The Projector UI */}
            <GradeProjector period={view} />
          </div>
        )}

      </main>
    </div>
  );
};

export default Grades;