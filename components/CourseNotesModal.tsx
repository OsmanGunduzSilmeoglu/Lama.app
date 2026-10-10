import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { X, BookOpen, ChevronDown, ChevronUp, Check, Trash2, Sparkles, Calendar } from 'lucide-react';

interface CourseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  termWeeks?: number;
  currentAcademicWeek?: number;
  onUpdateNotes: (courseId: string, notes: { [week: number]: string }) => void;
  t: (key: string) => string;
}

export const CourseNotesModal: React.FC<CourseNotesModalProps> = ({
  isOpen,
  onClose,
  course,
  termWeeks = 14,
  currentAcademicWeek = 1,
  onUpdateNotes,
  t
}) => {
  const [notes, setNotes] = useState<{ [week: number]: string }>({});
  const [openWeeks, setOpenWeeks] = useState<{ [week: number]: boolean }>({});
  const [lastSavedWeek, setLastSavedWeek] = useState<number | null>(null);

  // Sync state when modal opens or course changes
  useEffect(() => {
    if (isOpen && course) {
      const initialNotes = course.weeklyNotes || {};
      setNotes(initialNotes);
      
      // Default: open the current academic week, or week 1
      const defaultWeek = (currentAcademicWeek >= 1 && currentAcademicWeek <= termWeeks) 
        ? currentAcademicWeek 
        : 1;
      setOpenWeeks({ [defaultWeek]: true });
    }
  }, [isOpen, course?.id, currentAcademicWeek, termWeeks]);

  if (!isOpen || !course) return null;

  const toggleWeek = (week: number) => {
    setOpenWeeks(prev => ({
      ...prev,
      [week]: !prev[week]
    }));
  };

  const handleNoteChange = (week: number, text: string) => {
    const updated = {
      ...notes,
      [week]: text
    };
    setNotes(updated);
    setLastSavedWeek(week);
    onUpdateNotes(course.id, updated);
  };

  const handleClearWeekNote = (week: number) => {
    const updated = { ...notes };
    delete updated[week];
    setNotes(updated);
    onUpdateNotes(course.id, updated);
  };

  const expandAll = () => {
    const allOpen: { [week: number]: boolean } = {};
    for (let w = 1; w <= termWeeks; w++) {
      allOpen[w] = true;
    }
    setOpenWeeks(allOpen);
  };

  const collapseAll = () => {
    setOpenWeeks({});
  };

  // Total weeks with notes
  const totalNotesCount = Object.values(notes).filter(n => typeof n === 'string' && n.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[88vh] animate-scale-up relative transition-colors duration-300 border border-gray-100 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700/60 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight leading-tight">
                  {course.courseName}
                </h2>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  Not Defteri
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-400 font-semibold mt-0.5">
                Haftalık ders notları ve önemli hatırlatmalar ({totalNotesCount}/{termWeeks} hafta dolu)
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="px-6 py-2.5 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/40 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOpenWeeks({ [currentAcademicWeek]: true });
                const el = document.getElementById(`week-note-${currentAcademicWeek}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-95 shadow-2xs"
            >
              <Calendar size={13} />
              <span>{currentAcademicWeek}. Haftaya Git</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={expandAll}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Tümünü Aç
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>

        {/* Scrollable Accordion Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {Array.from({ length: termWeeks }, (_, i) => i + 1).map((week) => {
            const isOpen = !!openWeeks[week];
            const noteContent = notes[week] || '';
            const hasNote = noteContent.trim().length > 0;
            const isCurrent = week === currentAcademicWeek;

            return (
              <div 
                key={week}
                id={`week-note-${week}`}
                className={`rounded-2xl transition-all duration-200 border ${
                  isOpen 
                    ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/40 shadow-xs' 
                    : hasNote
                    ? 'bg-gray-50/80 dark:bg-gray-700/30 border-gray-200/80 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800/30'
                    : 'bg-white dark:bg-gray-700/20 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleWeek(week)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : hasNote
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {week}
                    </span>

                    <span className="font-extrabold text-sm text-gray-800 dark:text-white truncate">
                      {week}. Hafta
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 shrink-0">
                        Şu Anki
                      </span>
                    )}

                    {!isOpen && hasNote && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 truncate hidden sm:inline-block max-w-[150px]">
                        — {noteContent.replace(/\n/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasNote && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Not var" />
                    )}
                    <span className="text-gray-400 dark:text-gray-500">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 animate-fade-in">
                    <div className="relative">
                      <textarea
                        value={noteContent}
                        onChange={(e) => handleNoteChange(week, e.target.value)}
                        placeholder={`${week}. haftada işlenen konular, önemli sınav/vize tüyoları, ödevler...`}
                        rows={4}
                        className="w-full p-3.5 bg-white dark:bg-gray-700 border border-amber-100 dark:border-gray-600 focus:border-amber-400 dark:focus:border-amber-500 rounded-xl outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400 resize-y transition-all shadow-inner focus:ring-2 focus:ring-amber-400/20"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {hasNote ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Check size={13} strokeWidth={2.5} />
                            Otomatik kaydedildi
                          </span>
                        ) : (
                          <span>Yazmaya başladığınızda otomatik kaydedilir</span>
                        )}
                      </div>

                      {hasNote && (
                        <button
                          type="button"
                          onClick={() => handleClearWeekNote(week)}
                          className="hover:text-red-500 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Bu haftanın notunu temizle"
                        >
                          <Trash2 size={12} />
                          <span>Temizle</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-3xl flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>Tüm notlar cihazınızda güvenle saklanır.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
