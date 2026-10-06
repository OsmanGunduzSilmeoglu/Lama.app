import React from 'react';
import { Button } from './Button';
import { HelpCircle } from 'lucide-react';

interface AttendanceCheckModalProps {
  isOpen: boolean;
  courseName: string;
  onYes: () => void;
  onNo: () => void;
  t: (key: string) => string;
}

export const AttendanceCheckModal: React.FC<AttendanceCheckModalProps> = ({ isOpen, courseName, onYes, onNo, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center animate-bounce-soft transition-colors duration-300">
        <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
          <HelpCircle size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('courseTime')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{courseName}</span> {t('didYouAttend')}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={onNo} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">{t('no')}</Button>
          <Button variant="primary" onClick={onYes}>{t('yes')}</Button>
        </div>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-4">{t('absentNote')}</p>
      </div>
    </div>
  );
};