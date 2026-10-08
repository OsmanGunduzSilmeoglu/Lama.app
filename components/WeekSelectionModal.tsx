import React, { useState } from'react';
import { Button } from'./Button';
import { Calendar } from'lucide-react';

interface WeekSelectionModalProps {
 isOpen: boolean;
 onConfirm: (week: number) => void;
 t: (key: string) => string;
}

export const WeekSelectionModal: React.FC<WeekSelectionModalProps> = ({ isOpen, onConfirm, t }) => {
 const [selectedWeek, setSelectedWeek] = useState<number>(1);

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/40 animate-fade-in">
 <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-8 shadow-xl text-center animate-scale-up transition-colors duration-300">
 <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
 <Calendar size={32} />
 </div>
 
 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('whichWeek')}</h2>
 <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
 {t('weekSelectionDesc')}
 </p>

 <div className="mb-8 relative">
 <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
 {selectedWeek}. <span className="text-lg font-medium text-gray-400">{t('week')}</span>
 </div>
 <input 
 type="range" 
 min="1" 
 max="16" 
 value={selectedWeek} 
 onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-gray-700"
 />
 <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
 <span>1</span>
 <span>8</span>
 <span>16</span>
 </div>
 </div>

 <Button variant="primary" fullWidth onClick={() => onConfirm(selectedWeek)}>
 {t('continue')}
 </Button>
 </div>
 </div>
 );
};