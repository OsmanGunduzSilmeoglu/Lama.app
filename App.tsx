import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Course, DAYS_OF_WEEK, NotificationState, TermArchive } from './types';
import { CourseCard } from './components/CourseCard';
import { AttendanceCheckModal } from './components/AttendanceCheckModal';
import { Sidebar } from './components/Sidebar';
import { ConfirmModal } from './components/ConfirmModal';
import { WeekSelectionModal } from './components/WeekSelectionModal';
import { WeeklyScheduleModal } from './components/WeeklyScheduleModal';
import { AddCourseModal } from './components/AddCourseModal';
import { CourseDetailModal } from './components/CourseDetailModal';
import { EndTermModal } from './components/EndTermModal';
import { RecordsModal } from './components/RecordsModal';
import { CalendarDays, Plus, History, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, tr, es, de, fr } from 'date-fns/locale';
import { translations } from './translations';
import { useNextClassTimer } from './hooks/useNextClassTimer';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Robust Base64 Encoded SVG Logo (Lama Face)
const LAMA_LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIgZmlsbD0iIzYzNjZmMSIvPjxwYXRoIGQ9Ik0xODYgMTQwIFExNjYgODAgMjI2IDEyMCBMMjU2IDE4MCBMMjg2IDEyMCBRMzQ2IDgwIDMyNiAxNDAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTg2IiB5PSIxODAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMjIwIiByeD0iNzAiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMjMxIiBjeT0iMjgwIiByPSIxOCIgZmlsbD0iIzFlMjkzYiIvPjxjaXJjbGUgY3g9IjI4MSIgY3k9IjI4MCIgcj0iMTgiIGZpbGw9IiMxZTI5M2IiLz48ZWxsaXBzZSBjeD0iMjU2IiBjeT0iMzMwIiByeD0iNDAiIHJ5PSIzMCIgZmlsbD0iI2UwZTdmZiIvPjxwYXRoIGQ9Ik0yNTYgMzMwIHYyMCBxMCAxNSAtMTUgMTUgbTE1IC0xNSBxMCAxNSAxNSAxNSIgc3Ryb2tlPSIjMWUyOTNiIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==";

export default function App() {
  // --- Lazy Initialization ---
  
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(() => {
    const saved = localStorage.getItem('isFirstLaunch');
    return saved !== 'false';
  });

  // Track if we need to show the week selector (part of onboarding 2nd step)
  const [isWeekSelectionStep, setIsWeekSelectionStep] = useState<boolean>(false);

  const [currentWeek, setCurrentWeek] = useState<number>(() => {
    const saved = localStorage.getItem('currentWeek');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load courses", e);
      return [];
    }
  });

  const [archives, setArchives] = useState<TermArchive[]>(() => {
      try {
          const saved = localStorage.getItem('archives');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  // Archive Viewing State
  const [viewingArchive, setViewingArchive] = useState<TermArchive | null>(null);

  // Selection Mode State (Multi-Select)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme !== 'light';
  });

  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('language') || 'tr';
  });

  // Translation Helper
  const t = (key: string) => {
    return translations[language]?.[key] || translations['tr'][key];
  };

  const getLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'es': return es;
      case 'de': return de;
      case 'fr': return fr;
      default: return tr;
    }
  };

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEndTermModalOpen, setIsEndTermModalOpen] = useState(false);
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);

  const [detailModalCourseId, setDetailModalCourseId] = useState<string | null>(null);

  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const [notificationState, setNotificationState] = useState<NotificationState>({
    isOpen: false,
    courseId: null,
    courseName: '',
  });

  // Derive active data source: If viewing archive, use that. Otherwise use live state.
  const activeCourses = viewingArchive ? viewingArchive.courses : courses;
  const activeWeek = viewingArchive ? viewingArchive.finalWeek : currentWeek;

  // Derive selected course for detail modal based on active source
  const selectedCourseForDetail = activeCourses.find(c => c.id === detailModalCourseId) || null;

  // --- Effects ---

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('archives', JSON.stringify(archives));
  }, [archives]);

  useEffect(() => {
    localStorage.setItem('isFirstLaunch', String(isFirstLaunch));
  }, [isFirstLaunch]);
  
  useEffect(() => {
    localStorage.setItem('currentWeek', String(currentWeek));
  }, [currentWeek]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // --- Logic ---

  const startOnboarding = () => {
    setIsFirstLaunch(false);
    setIsWeekSelectionStep(true);
  };

  const completeOnboarding = (week: number) => {
    setCurrentWeek(week);
    setIsWeekSelectionStep(false);
  };

  const handleResetApp = () => {
    localStorage.clear();
    setCourses([]);
    setArchives([]);
    setIsFirstLaunch(true);
    setIsWeekSelectionStep(false);
    setIsSidebarOpen(false);
    setIsDarkMode(true);
    setCurrentWeek(1);
    setLanguage('tr'); // Reset language
  };

  const handleClassStart = useCallback((course: Course) => {
    setNotificationState(prev => {
      if (prev.isOpen) return prev;
      return {
        isOpen: true,
        courseId: course.id,
        courseName: course.courseName
      };
    });
  }, []);

  useNextClassTimer(courses, !viewingArchive, handleClassStart);

  // --- Handlers ---

  const handleAddCourse = (data: { name: string; day: string; time: string; limit: number; classroom: string; isRoutine?: boolean }) => {
    if (viewingArchive) return; // Prevent editing in archive mode

    const newCourse: Course = {
      id: generateId(),
      courseName: data.name,
      day: data.day,
      time: data.time,
      classroom: data.classroom,
      allowedAbsences: data.limit,
      currentAbsences: 0,
      absenceDates: [],
      attendanceLog: {},
      isIncomplete: false,
      isRoutine: data.isRoutine || false
    };
    setCourses([...courses, newCourse]);
  };

  const handleUpdateCourse = (id: string, updatedData: Partial<Course>) => {
    if (viewingArchive) return; // Prevent editing in archive mode

    setCourses(prevCourses => prevCourses.map(c => 
      c.id === id ? { ...c, ...updatedData } : c
    ));
  };

  const initiateDeleteCourse = (id: string) => {
    if (viewingArchive) return; // Prevent editing in archive mode
    setCourseToDelete(id);
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseToDelete));
      setCourseToDelete(null);
    }
  };

  const handleAttendanceResponse = (attended: boolean) => {
    if (!attended && notificationState.courseId) {
       const id = notificationState.courseId;
       setCourses(prev => prev.map(c => {
         if (c.id === id) {
            const newLog = { ...(c.attendanceLog || {}), [currentWeek]: 'absent' as const };
            return {
              ...c,
              currentAbsences: c.currentAbsences + 1,
              attendanceLog: newLog
            };
         }
         return c;
       }));
    } else if (attended && notificationState.courseId) {
       const id = notificationState.courseId;
       setCourses(prev => prev.map(c => {
         if (c.id === id) {
            const newLog = { ...(c.attendanceLog || {}), [currentWeek]: 'present' as const };
            return { ...c, attendanceLog: newLog };
         }
         return c;
       }));
    }
    setNotificationState({ isOpen: false, courseId: null, courseName: '' });
  };

  // --- Selection & Bulk Actions Handlers ---

  const handleLongPressCourse = (id: string) => {
      if (viewingArchive) return;
      setIsSelectionMode(true);
      setSelectedCourseIds(prev => new Set(prev).add(id));
  };

  const handleToggleSelection = (id: string) => {
      setSelectedCourseIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          
          if (newSet.size === 0) {
              setIsSelectionMode(false);
          }
          return newSet;
      });
  };

  const handleCancelSelection = () => {
      setIsSelectionMode(false);
      setSelectedCourseIds(new Set());
  };

  const handleBulkDelete = () => {
      if (selectedCourseIds.size > 0) {
          setIsBulkDeleteConfirmOpen(true);
      }
  };

  const confirmBulkDelete = () => {
      setCourses(prev => prev.filter(c => !selectedCourseIds.has(c.id)));
      setIsBulkDeleteConfirmOpen(false);
      handleCancelSelection();
  };


  // --- Archive Handlers ---

  const handleSaveArchive = (name: string) => {
    const newArchive: TermArchive = {
        id: generateId(),
        name: name,
        date: new Date().toISOString(),
        courses: courses,
        finalWeek: currentWeek
    };
    setArchives(prev => [newArchive, ...prev]);
    
    // Clear current term data after saving
    setCourses([]);
    setCurrentWeek(1);
  };

  const handleDeleteArchive = (id: string) => {
    setArchives(prev => prev.filter(a => a.id !== id));
  };

  const handleLoadArchive = (archive: TermArchive) => {
    setViewingArchive(archive);
    setIsRecordsModalOpen(false);
  };

  // --- Views ---

  if (isFirstLaunch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-black text-white p-8 text-center transition-all duration-500 relative overflow-hidden">
        <div className="mb-10 animate-bounce-soft relative z-10">
            <img 
              src={LAMA_LOGO_URL} 
              alt="Lama Logo" 
              className="w-40 h-40 object-contain rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] bg-white/10 backdrop-blur-xl border border-white/30 p-2"
            />
        </div>
        <h1 className="text-6xl font-black mb-6 drop-shadow-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">{t('welcomeTitle')}</h1>
        <p className="text-xl text-indigo-100 max-w-sm mx-auto mb-16 leading-relaxed font-medium drop-shadow-md">
          {t('welcomeDesc')}
        </p>
        
        <button 
            onClick={startOnboarding}
            className="cursor-pointer bg-white text-indigo-700 dark:text-gray-900 px-16 py-5 rounded-2xl font-black text-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all relative z-10 mb-10 hover:shadow-[0_20px_60px_rgba(255,255,255,0.4)]"
        >
          {t('start')}
        </button>

        <div className="flex items-center justify-center gap-3 relative z-10 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
           {[
             { code: 'tr', flag: '🇹🇷' },
             { code: 'en', flag: '🇺🇸' },
             { code: 'es', flag: '🇪🇸' },
             { code: 'de', flag: '🇩🇪' },
             { code: 'fr', flag: '🇫🇷' }
           ].map((lang) => (
             <button
               key={lang.code}
               onClick={() => setLanguage(lang.code)}
               className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                 language === lang.code 
                   ? 'bg-white shadow-lg scale-110 text-2xl' 
                   : 'hover:bg-white/20 text-xl opacity-70 hover:opacity-100'
               }`}
             >
               {lang.flag}
             </button>
           ))}
        </div>
      </div>
    );
  }

  if (isWeekSelectionStep) {
    return <WeekSelectionModal isOpen={true} onConfirm={completeOnboarding} t={t} />;
  }

  // Filter courses for Home Screen (Exclude routines)
  const homeScreenCourses = activeCourses.filter(c => !c.isRoutine);

  return (
    <div className={`min-h-screen relative transition-colors duration-500 select-none overflow-hidden font-sans ${viewingArchive ? 'bg-indigo-50 dark:bg-gray-900' : ''}`}>
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 bg-[#F3F4F6] dark:bg-gray-950 transition-colors duration-500" />

      {/* Archive Mode Banner */}
      {viewingArchive && (
          <div className="fixed top-0 left-0 right-0 bg-indigo-600 text-white z-50 px-4 py-2 pt-safe-top shadow-md flex items-center justify-between animate-slide-down">
             <div className="flex items-center gap-2">
                 <History size={16} className="text-indigo-200" />
                 <span className="font-bold text-sm tracking-wide">{viewingArchive.name}</span>
             </div>
             <div className="text-xs opacity-80">{t('archiveModeDesc')}</div>
          </div>
      )}

      <div className={`p-6 pb-28 md:p-12 relative z-10 ${viewingArchive ? 'pt-24' : ''}`}>
        {/* Header - Hide specific elements in selection mode */}
        <div className={`max-w-2xl mx-auto mb-10 flex justify-between items-end pt-safe-top transition-opacity duration-300 ${isSelectionMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-5">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="relative group cursor-pointer"
                title={t('menu')}
            >
                <img 
                    src={LAMA_LOGO_URL} 
                    alt="Lama Logo" 
                    className={`w-16 h-16 object-contain rounded-[1.5rem] shadow-xl hover:scale-105 transition-transform backdrop-blur-md border ${viewingArchive ? 'bg-indigo-100 border-indigo-200' : 'bg-white/80 dark:bg-gray-800/80 border-white/60 dark:border-gray-600'}`}
                />
            </button>
            <div>
                <h1 className="text-4xl font-black text-gray-800 dark:text-white transition-colors tracking-tighter drop-shadow-sm">{t('myCourses')}</h1>
                <p className="text-indigo-600 dark:text-indigo-300 font-bold mt-1 text-sm bg-white/60 dark:bg-indigo-900/40 px-3 py-1 rounded-full w-fit backdrop-blur-sm border border-indigo-100 dark:border-indigo-800/50">
                {activeWeek}. {t('week')} • {format(new Date(), 'dd MMM', { locale: getLocale() })}
                </p>
            </div>
            </div>
        </div>

        {/* List */}
        <div className="max-w-2xl mx-auto">
            {homeScreenCourses.length === 0 ? (
            <div className="text-center py-24 opacity-80 flex flex-col items-center">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg w-32 h-32 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl border border-white/50 dark:border-gray-700/50 animate-bounce-soft">
                    <CalendarDays size={48} className="text-indigo-400 dark:text-indigo-300"/>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-bold text-xl mb-4">{t('noCourses')}</p>

                {!viewingArchive && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-white bg-indigo-500 px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-colors"
                    >
                        Manuel Ekle
                    </button>
                )}
            </div>
            ) : (
            homeScreenCourses.map(course => (
                <CourseCard 
                key={course.id} 
                course={course} 
                currentAcademicWeek={activeWeek}
                onDelete={initiateDeleteCourse}
                onUpdate={handleUpdateCourse}
                t={t}
                onOpenDetails={() => setDetailModalCourseId(course.id)} 
                // Selection Props
                isSelectionMode={isSelectionMode}
                isSelected={selectedCourseIds.has(course.id)}
                onToggleSelection={handleToggleSelection}
                onLongPress={handleLongPressCourse}
                />
            ))
            )}
        </div>

        {/* Floating Action Buttons / Selection Bar */}
        {isSelectionMode ? (
            <div className="fixed bottom-6 left-6 right-6 z-50 flex items-center justify-center animate-slide-up">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-2 pl-6 flex items-center gap-4 border border-gray-100 dark:border-gray-700 max-w-md w-full">
                    <div className="flex-1 font-bold text-gray-700 dark:text-white">
                        {selectedCourseIds.size} {t('selected')}
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={handleCancelSelection}
                            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold"
                         >
                            <X size={20} />
                         </button>
                         <button 
                            onClick={handleBulkDelete}
                            className="p-3 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 font-bold flex items-center gap-2"
                         >
                            <Trash2 size={20} />
                            <span>{t('deleteBtn')}</span>
                         </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40 items-end">
                {/* Manual Add Button - Only if not archiving */}
                {!viewingArchive && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="cursor-pointer bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:scale-110 transition-all border border-indigo-50 dark:border-gray-700 group"
                        title="Manuel Ekle"
                    >
                        <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                    </button>
                )}

                {/* Weekly Schedule Button */}
                <button 
                    onClick={() => setIsScheduleOpen(true)}
                    className="cursor-pointer bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-4 rounded-2xl shadow-[0_15px_35px_rgba(79,70,229,0.3)] hover:scale-110 transition-all active:scale-95 border border-white/10"
                    title={t('weeklySchedule')}
                >
                    <CalendarDays size={28} strokeWidth={2.5} />
                </button>
            </div>
        )}

        {/* Modals */}
        <AttendanceCheckModal 
            isOpen={notificationState.isOpen}
            courseName={notificationState.courseName}
            onYes={() => handleAttendanceResponse(true)}
            onNo={() => handleAttendanceResponse(false)}
            t={t}
        />

        <WeeklyScheduleModal
            isOpen={isScheduleOpen}
            onClose={() => setIsScheduleOpen(false)}
            courses={activeCourses}
            onAdd={handleAddCourse}
            onDelete={initiateDeleteCourse}
            onUpdate={handleUpdateCourse}
            t={t}
        />

        <AddCourseModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={(data) => {
                handleAddCourse({ ...data, isRoutine: false });
                setIsAddModalOpen(false);
            }}
        />

        <CourseDetailModal 
            isOpen={!!selectedCourseForDetail}
            onClose={() => setDetailModalCourseId(null)}
            course={selectedCourseForDetail}
            onUpdate={handleUpdateCourse}
            t={t}
        />
        
        {/* New Modals */}
        <EndTermModal 
            isOpen={isEndTermModalOpen}
            onClose={() => setIsEndTermModalOpen(false)}
            onSave={handleSaveArchive}
            t={t}
        />

        <RecordsModal 
            isOpen={isRecordsModalOpen}
            onClose={() => setIsRecordsModalOpen(false)}
            archives={archives}
            onLoad={handleLoadArchive}
            onDelete={handleDeleteArchive}
            t={t}
        />

        <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onResetApp={() => setIsResetConfirmOpen(true)}
            currentLanguage={language}
            onLanguageChange={setLanguage}
            // New props
            onOpenEndTerm={() => setIsEndTermModalOpen(true)}
            onOpenRecords={() => setIsRecordsModalOpen(true)}
            isViewingArchive={!!viewingArchive}
            onExitArchive={() => setViewingArchive(null)}
            t={t}
        />

        <ConfirmModal 
            isOpen={!!courseToDelete}
            onClose={() => setCourseToDelete(null)}
            onConfirm={confirmDeleteCourse}
            title={t('deleteTitle')}
            message={t('deleteDesc')}
            confirmText={t('deleteBtn')}
            cancelText={t('cancel')}
            isDanger={true}
        />
        
        {/* Bulk Delete Confirmation */}
        <ConfirmModal 
            isOpen={isBulkDeleteConfirmOpen}
            onClose={() => setIsBulkDeleteConfirmOpen(false)}
            onConfirm={confirmBulkDelete}
            title={t('bulkDeleteTitle')}
            message={t('bulkDeleteDesc')}
            confirmText={t('deleteBtn')}
            cancelText={t('cancel')}
            isDanger={true}
        />

        <ConfirmModal
            isOpen={isResetConfirmOpen}
            onClose={() => setIsResetConfirmOpen(false)}
            onConfirm={() => {
                handleResetApp();
                setIsResetConfirmOpen(false);
            }}
            title={t('resetTitle')}
            message={t('resetDesc')}
            confirmText={t('resetBtn')}
            cancelText={t('cancel')}
            isDanger={true}
        />
      </div>
    </div>
  );
}