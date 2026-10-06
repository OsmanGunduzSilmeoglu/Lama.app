import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { X, Calculator, GraduationCap } from 'lucide-react';
import { Button } from './Button';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Course>) => void;
  t: (key: string) => string;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ 
  course, 
  isOpen, 
  onClose, 
  onUpdate, 
  t 
}) => {
  const [midterm, setMidterm] = useState<string>('');
  const [final, setFinal] = useState<string>('');
  
  useEffect(() => {
    if (course && isOpen) {
      setMidterm(course.midtermScore !== undefined ? course.midtermScore.toString() : '');
      setFinal(course.finalScore !== undefined ? course.finalScore.toString() : '');
    }
  }, [course, isOpen]);

  if (!isOpen || !course) return null;

  const handleSave = () => {
    const midtermVal = midterm === '' ? undefined : parseFloat(midterm);
    const finalVal = final === '' ? undefined : parseFloat(final);
    
    onUpdate(course.id, {
      midtermScore: midtermVal,
      finalScore: finalVal
    });
    onClose();
  };

  // Calculation Logic
  // Rule 1: Total = (Midterm * 0.4) + (Final * 0.6) >= 50
  // Rule 2: Final Score must be >= 50
  
  const midtermVal = parseFloat(midterm);
  const finalVal = parseFloat(final);
  
  let neededFinal: number | null = null;
  let currentAverage: number | null = null;
  let isPassed = false;
  
  if (!isNaN(midtermVal)) {
    // Calculate needed final for Average >= 50
    const neededForAverage = (50 - (midtermVal * 0.4)) / 0.6;
    
    // Apply Rule 2: Final must be at least 50 regardless of average
    neededFinal = Math.max(50, Math.ceil(neededForAverage));
    
    if (!isNaN(finalVal)) {
       currentAverage = (midtermVal * 0.4) + (finalVal * 0.6);
       // Passing Condition: Average >= 50 AND Final >= 50
       isPassed = currentAverage >= 50 && finalVal >= 50;
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl animate-scale-up overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-500">
                <GraduationCap size={20} />
              </div>
              {t('courseDetails')}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                    {t('examScores')}
                </h3>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    {course.courseName}
                </span>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {/* Midterm Input */}
                <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800/50 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                   <label className="block text-xs font-bold text-indigo-400 dark:text-indigo-300 uppercase mb-2 tracking-wider">{t('midterm')} (%40)</label>
                   <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={midterm}
                      onChange={(e) => setMidterm(e.target.value)}
                      placeholder="-"
                      className="w-full bg-transparent text-center font-black text-3xl py-1 text-gray-800 dark:text-white outline-none placeholder-gray-300"
                   />
                </div>

                {/* Final Input */}
                <div className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800/50 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm group focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                   <label className="block text-xs font-bold text-purple-400 dark:text-purple-300 uppercase mb-2 tracking-wider">{t('final')} (%60)</label>
                   <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={final}
                      onChange={(e) => setFinal(e.target.value)}
                      placeholder={neededFinal !== null ? `${neededFinal}` : "-"}
                      className="w-full bg-transparent text-center font-black text-3xl py-1 text-gray-800 dark:text-white outline-none placeholder-gray-300/50"
                   />
                </div>
             </div>
          </div>

          {/* Logic Visualization */}
          <div className="bg-gray-50/80 dark:bg-gray-700/30 p-5 rounded-[1.5rem] space-y-4 border border-gray-100 dark:border-gray-700/50">
             <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 font-bold mb-1">
               <span className="flex items-center gap-1"><Calculator size={12}/> {t('passRule')} & Final ≥ 50</span>
               <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm text-gray-600 dark:text-gray-300">{t('average')}: {currentAverage !== null ? currentAverage.toFixed(1) : '-'}</span>
             </div>
             
             {/* Visual Bar Formula */}
             <div className="h-12 w-full flex rounded-2xl overflow-hidden shadow-inner bg-gray-200 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                {/* Vize Part */}
                <div 
                  className="bg-indigo-400/20 flex items-center justify-center text-indigo-900/40 dark:text-indigo-100/30 text-[10px] font-bold transition-all duration-500 relative border-r border-dashed border-gray-400/20"
                  style={{ width: '40%' }}
                >
                  <span className="z-10 absolute top-1 left-2 opacity-50">%40</span>
                  {/* Actual Vize Score Contribution Fill */}
                  <div 
                    className="absolute bottom-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    style={{ width: !isNaN(midtermVal) ? `${midtermVal}%` : '0%' }}
                  />
                </div>
                
                {/* Final Part */}
                <div 
                   className="bg-purple-400/20 flex items-center justify-center text-purple-900/40 dark:text-purple-100/30 text-[10px] font-bold transition-all duration-500 relative"
                   style={{ width: '60%' }}
                >
                   <span className="z-10 absolute top-1 right-2 opacity-50">%60</span>
                   {/* Actual Final Score Contribution Fill (or Needed) */}
                    <div 
                    className="absolute bottom-0 left-0 h-full bg-gradient-to-r from-purple-500 to-fuchsia-600 transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    style={{ width: !isNaN(finalVal) ? `${finalVal}%` : '0%' }}
                  />
                  {/* Needed Marker if Vize exists but Final doesn't */}
                  {!isNaN(midtermVal) && isNaN(finalVal) && neededFinal !== null && (
                     <div 
                       className="absolute bottom-0 left-0 h-full border-r-2 border-red-400 bg-red-400/10 transition-all duration-500 flex items-center justify-end pr-2"
                       style={{ width: `${Math.min(100, neededFinal)}%` }}
                     >
                       <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded shadow-lg translate-x-1/2">Min {neededFinal}</span>
                     </div>
                  )}
                </div>
             </div>

             {/* Calculation Result Text */}
             {!isNaN(midtermVal) ? (
                 <div className="mt-2 text-center h-16 flex flex-col justify-center">
                    {isNaN(finalVal) ? (
                        <div className="animate-fade-in">
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">{t('neededFinal')}</p>
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{neededFinal}</span>
                        </div>
                    ) : (
                        <div className={`text-xl font-black flex flex-col items-center animate-scale-up ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                           <span className="flex items-center gap-2 text-2xl">
                                {isPassed ? (
                                    <>🎉 {t('passed')}</>
                                ) : (
                                    <>😞 {t('failed')}</>
                                )}
                           </span>
                           <span className="text-sm font-medium text-gray-400 mt-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">Ort: {currentAverage?.toFixed(1)}</span>
                           {!isPassed && finalVal < 50 && (
                               <div className="text-[10px] mt-1 text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded font-bold">Final {`<`} 50</div>
                           )}
                        </div>
                    )}
                 </div>
             ) : (
                <p className="text-center text-xs text-gray-400 italic py-4">{t('enterMidtermFirst')}</p>
             )}

          </div>

          <Button fullWidth onClick={handleSave} className="py-4 text-lg">
             {t('save')}
          </Button>

        </div>
      </div>
    </div>
  );
};