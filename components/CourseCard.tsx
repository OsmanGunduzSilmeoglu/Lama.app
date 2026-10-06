import React, { useState, useRef } from 'react';
import { Course, DAYS_OF_WEEK } from '../types';
import { Clock, Calendar, Trash2, MapPin, Pencil, Check, X, AlertCircle, GraduationCap, CheckCircle2, Circle } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  currentAcademicWeek: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Course>) => void;
  onOpenDetails?: () => void;
  // New props for selection mode
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  onLongPress?: (id: string) => void;
  t: (key: string) => string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  currentAcademicWeek,
  onDelete,
  onUpdate,
  onOpenDetails,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onLongPress,
  t
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Long press refs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggered = useRef(false);

  // Local state for editing form
  const [editForm, setEditForm] = useState({
    courseName: course.courseName,
    day: course.day,
    time: course.time,
    classroom: course.classroom || '',
    allowedAbsences: course.allowedAbsences
  });

  const absenceRatio = course.allowedAbsences > 0 ? course.currentAbsences / course.allowedAbsences : 0;
  const isCritical = absenceRatio >= 0.8;
  const isWarning = absenceRatio >= 0.5 && !isCritical;
  
  const statusColor = isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-green-500';
  const progressGradient = isCritical ? 'bg-gradient-to-r from-red-500 to-red-600' : isWarning ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500';
  const cardBorderColor = isCritical ? 'border-red-200 dark:border-red-900/50' : 'border-white/60 dark:border-gray-700/50';

  // --- Interaction Logic ---

  const handleTouchStart = () => {
    if (isSelectionMode) return; // Don't trigger long press if already in selection mode
    isLongPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
        isLongPressTriggered.current = true;
        if (navigator.vibrate) navigator.vibrate(50);
        if (onLongPress) onLongPress(course.id);
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If long press was triggered, ignore click
    if (isLongPressTriggered.current) {
        isLongPressTriggered.current = false;
        return;
    }

    if (isSelectionMode && onToggleSelection) {
        onToggleSelection(course.id);
    } else if (!isEditing) {
        setShowDetails(!showDetails);
    }
  };

  // --- Edit Logic ---

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectionMode) return;
    setEditForm({
      courseName: course.courseName,
      day: course.day,
      time: course.time,
      classroom: course.classroom || '',
      allowedAbsences: course.allowedAbsences
    });
    setIsEditing(true);
    setShowDetails(false);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editForm.courseName && editForm.day && editForm.time && editForm.allowedAbsences > 0) {
      onUpdate(course.id, {
        courseName: editForm.courseName,
        day: editForm.day,
        time: editForm.time,
        classroom: editForm.classroom,
        allowedAbsences: editForm.allowedAbsences,
        isIncomplete: false
      });
      setIsEditing(false);
    }
  };

  // Logic for toggling week status in the grid
  const toggleWeekStatus = (e: React.MouseEvent, week: number) => {
    e.stopPropagation();
    
    const currentStatus = course.attendanceLog?.[week] || null;
    let newStatus: 'present' | 'absent' | null = null;
    let absenceModifier = 0;

    if (currentStatus === null) {
        newStatus = 'present';
    } else if (currentStatus === 'present') {
        newStatus = 'absent';
        absenceModifier = 1;
    } else if (currentStatus === 'absent') {
        newStatus = null;
        absenceModifier = -1;
    }

    const updatedLog = { ...(course.attendanceLog || {}), [week]: newStatus };
    if (newStatus === null) {
        delete (updatedLog as any)[week];
    }

    onUpdate(course.id, {
        attendanceLog: updatedLog as any,
        currentAbsences: Math.max(0, course.currentAbsences + absenceModifier)
    });
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      // Touch handlers for long press
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleTouchStart} // For desktop testing
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      
      onClick={handleCardClick}
      className={`group relative overflow-hidden transition-all duration-300 mb-5 p-6 rounded-[2rem] border ${course.isIncomplete ? 'border-red-400 dark:border-red-500' : isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 dark:border-indigo-400' : cardBorderColor} ${isEditing ? 'ring-4 ring-indigo-500/20 scale-[1.02] cursor-default bg-white dark:bg-gray-800' : 'bg-gradient-to-br from-white/90 via-white/80 to-indigo-50/50 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-900/50 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:-translate-y-1 cursor-pointer'} ${isSelectionMode ? 'scale-95' : ''}`}
    >
      {/* Selection Overlay Indicator */}
      {isSelectionMode && (
          <div className="absolute top-4 right-4 z-50 transition-all duration-200">
              {isSelected ? (
                  <CheckCircle2 size={28} className="text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-900" />
              ) : (
                  <Circle size={28} className="text-gray-300 dark:text-gray-600" />
              )}
          </div>
      )}

      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      {course.isIncomplete && !isEditing && (
         <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] font-bold text-center py-0.5 animate-pulse z-20">
            ⚠ {t('incomplete')}
         </div>
      )}

      <div className={`flex justify-between items-start mb-3 relative z-10 ${course.isIncomplete ? 'mt-3' : ''}`}>
        
        {isEditing ? (
          <div className="w-full mr-4" onClick={stopProp}>
             <input
              type="text"
              value={editForm.courseName}
              onChange={(e) => setEditForm({...editForm, courseName: e.target.value})}
              className="w-full text-xl font-black bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white px-3 py-2 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              placeholder={t('editName')}
             />
          </div>
        ) : (
          <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 transition-colors pr-2 flex items-center gap-2 tracking-tight leading-none max-w-[85%]">
            {course.courseName}
            {course.isIncomplete && <AlertCircle size={20} className="text-red-500 animate-bounce" />}
          </h3>
        )}

        {/* Action Buttons - Hide in selection mode */}
        {!isSelectionMode && (
            <div className="flex gap-2 shrink-0">
            {/* Grades Button - Only show when NOT editing */}
            {!isEditing && onOpenDetails && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails();
                    }}
                    className="cursor-pointer p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all hover:scale-110 active:scale-95 shadow-sm border border-indigo-100 dark:border-indigo-800/30"
                    title="Sınavlar / Notlar"
                >
                    <GraduationCap size={20} strokeWidth={2.5} />
                </button>
            )}

            {isEditing ? (
                <>
                <button 
                    onClick={handleCancelClick}
                    className="cursor-pointer transition-all hover:scale-110 active:scale-95 p-2 rounded-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    title={t('cancel')}
                >
                    <X size={22} />
                </button>
                <button 
                    onClick={handleSaveClick}
                    className="cursor-pointer transition-all hover:scale-110 active:scale-95 p-2 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50"
                    title={t('save')}
                >
                    <Check size={22} />
                </button>
                </>
            ) : (
                <button 
                onClick={handleEditClick}
                className="cursor-pointer transition-all hover:scale-110 active:scale-95 p-2.5 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-600 dark:hover:text-gray-300"
                title={t('edit')}
                >
                <Pencil size={18} />
                </button>
            )}
            </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-5 relative z-10">
        {isEditing ? (
          <div className="flex flex-wrap gap-2 mt-1" onClick={stopProp}>
             <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-2 py-1.5 border border-gray-100 dark:border-gray-700">
               <Calendar size={14} className="text-gray-400 mr-2" />
               <select
                  value={editForm.day}
                  onChange={(e) => setEditForm({...editForm, day: e.target.value})}
                  className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none font-bold py-1 cursor-pointer"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d} className="dark:bg-gray-800">{t(d)}</option>
                  ))}
                </select>
             </div>
             
             <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-2 py-1.5 border border-gray-100 dark:border-gray-700">
               <Clock size={14} className="text-gray-400 mr-2" />
               <input
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none font-bold py-1 [color-scheme:light] dark:[color-scheme:dark]"
               />
             </div>

             <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-2 py-1.5 border border-gray-100 dark:border-gray-700 w-full sm:w-auto">
               <MapPin size={14} className="text-gray-400 mr-2" />
               <input
                type="text"
                maxLength={8}
                value={editForm.classroom}
                onChange={(e) => setEditForm({...editForm, classroom: e.target.value})}
                placeholder={t('editClass')}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none font-bold w-full sm:w-20 py-1"
               />
             </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-700/40 px-3 py-1.5 rounded-xl border border-white/40 dark:border-gray-600/30 shadow-sm backdrop-blur-sm">
              <Calendar size={14} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{t(course.day)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-700/40 px-3 py-1.5 rounded-xl border border-white/40 dark:border-gray-600/30 shadow-sm backdrop-blur-sm">
              <Clock size={14} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{course.time}</span>
            </div>

            {course.classroom && (
              <div className="flex items-center gap-1.5 bg-indigo-50/80 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm backdrop-blur-sm">
                <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{course.classroom}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-2 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider font-extrabold">{t('attendance')}</span>
          {isEditing ? (
             <div className="flex items-center gap-2" onClick={stopProp}>
                <span className="text-gray-400 text-xs">{t('right')}:</span>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={editForm.allowedAbsences}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setEditForm({...editForm, allowedAbsences: Math.min(15, Math.max(1, val))});
                    } else if (e.target.value === '') {
                        setEditForm({...editForm, allowedAbsences: 0});
                    }
                  }}
                  className={`w-12 text-center border rounded-lg py-1 text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500/20 font-bold`}
                  placeholder="?"
                />
             </div>
          ) : (
            <span className={`${statusColor} font-black text-lg leading-none`}>
              {course.currentAbsences} <span className="text-xs text-gray-300 font-bold">/ {course.allowedAbsences || '?'}</span>
            </span>
          )}
        </div>
        
        {/* Modern Pill Progress Bar */}
        <div className="h-5 w-full bg-gray-100/80 dark:bg-gray-700/40 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5 relative">
            {/* Dashed Markers for 25%, 50%, 75% */}
            <div className="absolute top-0 left-[25%] h-full w-[1px] bg-white/30 z-10"></div>
            <div className="absolute top-0 left-[50%] h-full w-[1px] bg-white/30 z-10"></div>
            <div className="absolute top-0 left-[75%] h-full w-[1px] bg-white/30 z-10"></div>
            
            <div 
                className={`h-full ${progressGradient} transition-all duration-1000 ease-out shadow-[0_2px_10px_rgba(0,0,0,0.15)] rounded-full relative`}
                style={{ width: `${Math.min(absenceRatio * 100, 100)}%` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            </div>
        </div>
      </div>
      
      {/* Grid History Section */}
      {showDetails && !isEditing && !isSelectionMode && (
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/50 animate-fade-in transition-colors relative z-10">
            <h4 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('weekTracker')}</h4>
            
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-6">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((week) => {
                    const status = course.attendanceLog?.[week];
                    const isCurrent = week === currentAcademicWeek;
                    
                    let bgClass = "bg-gray-50/80 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700";
                    let content = <span className="text-xs font-bold">{week}</span>;

                    if (status === 'present') {
                        bgClass = "bg-green-100/90 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30 shadow-sm";
                        content = <Check size={14} strokeWidth={4} />;
                    } else if (status === 'absent') {
                        bgClass = "bg-red-100/90 dark:bg-red-900/40 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/30 shadow-sm";
                        content = <X size={14} strokeWidth={4} />;
                    }

                    if (isCurrent) {
                        bgClass += " ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900 scale-110 z-10 font-black";
                        if (status === null) {
                            bgClass = "bg-white dark:bg-gray-700 text-indigo-600 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900";
                        }
                    }

                    return (
                        <button
                            key={week}
                            onClick={(e) => toggleWeekStatus(e, week)}
                            className={`h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${bgClass}`}
                            title={`${week}. Hafta`}
                        >
                            {content}
                        </button>
                    );
                })}
            </div>

            <button 
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course.id);
                }}
                className="cursor-pointer w-full py-3.5 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 group/del border border-red-100 dark:border-red-900/20"
            >
                <Trash2 size={18} className="group-hover/del:rotate-12 transition-transform" />
                {t('deleteCourse')}
            </button>
        </div>
      )}
    </div>
  );
};