import React from 'react';
import { Button } from './Button';
import { X, Archive, CalendarDays, Trash2, ChevronRight, Clock } from 'lucide-react';
import { TermArchive } from '../types';
import { format } from 'date-fns';

interface RecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  archives: TermArchive[];
  onLoad: (archive: TermArchive) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({ 
    isOpen, 
    onClose, 
    archives, 
    onLoad, 
    onDelete, 
    t 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-[80vh] rounded-[2rem] p-6 shadow-2xl animate-scale-up relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-2xl">
                    <Archive size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">{t('recordsTitle')}</h2>
             </div>
             <button 
                onClick={onClose}
                className="p-2 text-gray-300 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {archives.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <Archive size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noRecords')}</p>
                </div>
            ) : (
                archives.map(archive => (
                    <div 
                        key={archive.id} 
                        className="group bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 p-4 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden"
                        onClick={() => onLoad(archive)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">{archive.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <CalendarDays size={12} />
                                        <span>{format(new Date(archive.date), 'dd.MM.yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{archive.courses.length} Ders</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                                <ChevronRight size={24} />
                            </div>
                        </div>

                        {/* Delete Action (Top Right, slightly hidden until hover usually, but keeping simple here) */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(archive.id);
                            }}
                            className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors z-10"
                            title={t('deleteRecord')}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};