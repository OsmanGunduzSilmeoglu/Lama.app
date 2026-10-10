import React, { useState, useRef } from 'react';
import { Course, DAYS_OF_WEEK, calculateAllowedAbsenceHours, calculateCourseAbsentHours } from '../types';
import { Clock, Calendar, Trash2, MapPin, Pencil, Check, X, AlertCircle, CheckCircle2, Circle, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  currentAcademicWeek: number;
  termWeeks?: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Course>) => void;
  // New props for selection mode
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  onLongPress?: (id: string) => void;
  onOpenNotes?: (course: Course) => void;
  t: (key: string) => string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  currentAcademicWeek,
  termWeeks = 14,
  onDelete,
  onUpdate,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onLongPress,
  onOpenNotes,
  t
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Long press refs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggered = useRef(false);

  // Fallbacks for dynamic hour/percentage attendance
  const weeklyHours = course.weeklyHours || 3;
  const absencePercentage = course.absencePercentage || 30;
  
  // Calculate allowed absence hours & current absence hours
  const allowedAbsentHours = course.allowedAbsences > 0 
    ? course.allowedAbsences 
    : calculateAllowedAbsenceHours(weeklyHours, absencePercentage, termWeeks);

  const currentAbsentHours = calculateCourseAbsentHours(course);
  const absenceRatio = allowedAbsentHours > 0 ? currentAbsentHours / allowedAbsentHours : 0;
  const remainingHours = Math.max(0, allowedAbsentHours - currentAbsentHours);
  const isExceeded = currentAbsentHours > allowedAbsentHours;
  const isCritical = absenceRatio >= 0.8 || isExceeded;
  const isWarning = absenceRatio >= 0.5 && !isCritical;
  
  const statusColor = isExceeded 
    ? 'text-red-600 dark:text-red-400' 
    : isCritical 
    ? 'text-red-500 dark:text-red-400' 
    : isWarning 
    ? 'text-orange-500' 
    : 'text-green-500';

  const progressBg = isExceeded 
    ? 'bg-red-600' 
    : isCritical 
    ? 'bg-red-500' 
    : isWarning 
    ? 'bg-orange-500' 
    : 'bg-green-500';

  const cardBorderColor = isCritical 
    ? 'border-red-200 dark:border-red-900/50' 
    : 'border-white/60 dark:border-gray-700/50';

  // Local state for editing form
  const [editForm, setEditForm] = useState({
    courseName: course.courseName,
    day: course.day,
    time: course.time,
    classroom: course.classroom || '',
    weeklyHours: course.weeklyHours || 3,
    absencePercentage: course.absencePercentage || 30
  });

  // --- Interaction Logic ---

  const handleTouchStart = () => {
    if (isSelectionMode) return;
    isLongPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      if (onLongPress) onLongPress(course.id);
    }, 500);
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

  const handleCardClick = () => {
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
      weeklyHours: course.weeklyHours || 3,
      absencePercentage: course.absencePercentage || 30
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
    if (editForm.courseName && editForm.day && editForm.time && editForm.weeklyHours > 0) {
      const newAllowedHours = calculateAllowedAbsenceHours(
        editForm.weeklyHours, 
        editForm.absencePercentage, 
        termWeeks
      );

      onUpdate(course.id, {
        courseName: editForm.courseName,
        day: editForm.day,
        time: editForm.time,
        classroom: editForm.classroom,
        weeklyHours: editForm.weeklyHours,
        absencePercentage: editForm.absencePercentage,
        allowedAbsences: newAllowedHours,
        isIncomplete: false
      });
      setIsEditing(false);
    }
  };

  // --- Hızlı Döngü (Quick Cycle Attendance Logic) ---
  const toggleWeekStatus = (e: React.MouseEvent, week: number) => {
    e.stopPropagation();
    
    const currentVal = course.attendanceLog?.[week] ?? null;
    const wHours = course.weeklyHours || 3;

    // Determine current absent hours in this week
    let currentAbsent: number | null = null;
    if (typeof currentVal === 'number') {
      currentAbsent = currentVal;
    } else if (currentVal === 'present') {
      currentAbsent = 0;
    } else if (currentVal === 'absent') {
      currentAbsent = wHours;
    }

    // Cycle: null (boş) -> 0 (tam katıldım) -> 1 (1 saat kaçtı) -> ... -> wHours (hepsi kaçtı) -> null
    let nextAbsent: number | null = null;
    if (currentAbsent === null) {
      nextAbsent = 0; // 1. Tık: Tam katılım
    } else if (currentAbsent < wHours) {
      nextAbsent = currentAbsent + 1; // 2, 3... Tık: +1 saat devamsızlık
    } else {
      nextAbsent = null; // Sıfırla (Temizle)
    }

    const updatedLog = { ...(course.attendanceLog || {}) };
    if (nextAbsent === null) {
      delete (updatedLog as any)[week];
    } else {
      updatedLog[week] = nextAbsent;
    }

    // Recalculate total absences
    let newTotalAbsence = 0;
    Object.values(updatedLog).forEach(val => {
      if (typeof val === 'number') newTotalAbsence += val;
      else if (val === 'absent') newTotalAbsence += wHours;
    });

    onUpdate(course.id, {
      attendanceLog: updatedLog,
      currentAbsences: newTotalAbsence
    });
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      
      onClick={handleCardClick}
      className={`group relative overflow-hidden transition-all duration-300 mb-5 p-6 rounded-[2rem] border ${
        course.isIncomplete 
          ? 'border-red-400 dark:border-red-500' 
          : isSelected 
          ? 'border-indigo-500 ring-2 ring-indigo-500 dark:border-indigo-400' 
          : cardBorderColor
      } ${
        isEditing 
          ? 'ring-4 ring-indigo-500/20 scale-[1.02] cursor-default bg-white dark:bg-gray-800' 
          : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer'
      } ${isSelectionMode ? 'scale-95' : ''}`}
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

        {/* Action Buttons - Only show Save/Cancel when editing */}
        {!isSelectionMode && isEditing && (
          <div className="flex gap-2 shrink-0">
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
          </div>
        )}

        {/* Notebook Button at the Top-Right Corner */}
        {!isSelectionMode && !isEditing && (
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenNotes) onOpenNotes(course);
              }}
              className="tour-notes-btn cursor-pointer relative p-2.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40 transition-all active:scale-90 shadow-2xs group/note"
              title="Ders Not Defteri"
            >
              <BookOpen size={18} className="group-hover/note:scale-110 transition-transform" />
              {course.weeklyNotes && Object.values(course.weeklyNotes).some(n => typeof n === 'string' && n.trim().length > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-gray-800 animate-pulse" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-5 relative z-10">
        {isEditing ? (
          <div className="flex flex-col gap-3 mt-1" onClick={stopProp}>
            <div className="flex flex-wrap gap-2">
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
                  type="text"
                  inputMode="numeric"
                  value={editForm.time}
                  onChange={(e) => {
                    let raw = e.target.value;
                    let val = raw.replace(/[^\d]/g, '');
                    if (val.length > 4) val = val.slice(0, 4);

                    if (val.length >= 2) {
                      let h = parseInt(val.slice(0, 2));
                      if (h > 23) val = '23' + val.slice(2);
                    }
                    if (val.length >= 4) {
                      let m = parseInt(val.slice(2, 4));
                      if (m > 59) val = val.slice(0, 2) + '59';
                    }

                    let formatted = val;
                    if (val.length === 2 && raw.endsWith(':')) {
                      formatted = val + ':';
                    } else if (val.length > 2) {
                      formatted = val.slice(0, 2) + ':' + val.slice(2);
                    } else if (val.length === 2 && raw.length > editForm.time.length) {
                      formatted = val + ':';
                    }
                    setEditForm({...editForm, time: formatted});
                  }}
                  className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none font-bold py-1 w-[4.5rem]"
                  placeholder="09:30"
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  title="Lütfen geçerli bir saat girin (Örn: 09:30)"
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

            {/* Editing: Weekly Hours & Percentage */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Ders Saati</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setEditForm({...editForm, weeklyHours: h})}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                        editForm.weeklyHours === h 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {h}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Sınır Kuralı</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditForm({...editForm, absencePercentage: 30})}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      editForm.absencePercentage === 30 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    %30
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({...editForm, absencePercentage: 20})}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      editForm.absencePercentage === 20 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    %20
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-600/30">
              <Calendar size={14} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{t(course.day)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-600/30">
              <Clock size={14} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{course.time}</span>
            </div>

            {course.classroom && (
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{course.classroom}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendance Metric Bar */}
      <div className="mb-2 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider font-extrabold block">
              {t('attendance')}
            </span>
          </div>

          <div className="text-right">
            <span className={`${statusColor} font-black text-xl leading-none`}>
              {currentAbsentHours} <span className="text-xs text-gray-400 font-bold">/ {allowedAbsentHours} Saat</span>
            </span>
          </div>
        </div>
        
        {/* Modern Pill Progress Bar */}
        <div className="h-5 w-full bg-gray-100/80 dark:bg-gray-700/40 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5 relative">
          <div className="absolute top-0 left-[25%] h-full w-[1px] bg-white/30 z-10"></div>
          <div className="absolute top-0 left-[50%] h-full w-[1px] bg-white/30 z-10"></div>
          <div className="absolute top-0 left-[75%] h-full w-[1px] bg-white/30 z-10"></div>
          
          <div 
            className={`h-full ${progressBg} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${Math.min(absenceRatio * 100, 100)}%` }}
          />
        </div>

        {/* Dynamic Status / Remaining Info */}
        <div className="flex justify-between items-center text-[11px] font-bold mt-2">
          <span className={isExceeded ? 'text-red-500 font-black' : isCritical ? 'text-red-400 font-extrabold' : 'text-gray-500 dark:text-gray-400'}>
            {isExceeded 
              ? `🚨 Devamsızlık Sınırı ${currentAbsentHours - allowedAbsentHours} Saat Aşıldı!` 
              : `Kalan Hak: ${remainingHours} Saat (%${Math.round(absenceRatio * 100)} kullanıldı)`}
          </span>
          <span className={`${statusColor} font-extrabold text-xs`}>
            {isExceeded ? 'Kaldın' : isCritical ? '⚠️ Kritik' : isWarning ? '⚡ Dikkat' : '🎉 Güvende'}
          </span>
        </div>
      </div>
      
      {/* Grid History Section */}
      {showDetails && !isEditing && !isSelectionMode && (
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/50 animate-fade-in transition-colors relative z-10">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {termWeeks} Haftalık Oturum Takibi
            </h4>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold">
              1 tık: Tam • 2 tık: Kısmi • 3 tık: Yok
            </span>
          </div>
          
          {/* Week Grid (7 columns for 14 weeks = clean 2 rows) */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 mb-3">
            {Array.from({ length: termWeeks }, (_, i) => i + 1).map((week) => {
              const status = course.attendanceLog?.[week];
              const isCurrent = week === currentAcademicWeek;
              const wHours = course.weeklyHours || 3;

              let currentAbsent: number | null = null;
              if (typeof status === 'number') currentAbsent = status;
              else if (status === 'present') currentAbsent = 0;
              else if (status === 'absent') currentAbsent = wHours;

              let bgClass = "bg-gray-50/80 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700";
              let content: React.ReactNode = <span className="text-xs font-bold">{week}</span>;
              let tooltip = `${week}. Hafta (İşlenmedi)`;

              if (currentAbsent === 0) {
                // Tam Katılım
                bgClass = "bg-green-100/90 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30 shadow-sm";
                content = <Check size={15} strokeWidth={3.5} />;
                tooltip = `${week}. Hafta: Tam Katılım (${wHours}/${wHours} saat)`;
              } else if (currentAbsent !== null && currentAbsent < wHours) {
                // Kısmi Katılım
                const attended = wHours - currentAbsent;
                bgClass = "bg-amber-100/90 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30 shadow-sm";
                content = (
                  <span className="text-[11px] font-black tracking-tight leading-none">
                    {attended}/{wHours}
                  </span>
                );
                tooltip = `${week}. Hafta: ${currentAbsent} saat devamsızlık (${attended}/${wHours} katılım)`;
              } else if (currentAbsent === wHours) {
                // Tam Devamsızlık
                bgClass = "bg-red-100/90 dark:bg-red-900/40 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/30 shadow-sm";
                content = <X size={15} strokeWidth={3.5} />;
                tooltip = `${week}. Hafta: Tam Devamsızlık (${wHours} saat)`;
              }

              if (isCurrent) {
                bgClass += " ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900 scale-105 z-10 font-black";
                if (currentAbsent === null) {
                  bgClass = "bg-white dark:bg-gray-700 text-indigo-600 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900";
                }
              }

              return (
                <button
                  key={week}
                  onClick={(e) => toggleWeekStatus(e, week)}
                  className={`h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${bgClass}`}
                  title={tooltip}
                >
                  {content}
                </button>
              );
            })}
          </div>

          {/* Helper Legend */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold mb-5 px-1 bg-gray-50/50 dark:bg-gray-800/30 py-2 rounded-xl border border-gray-100 dark:border-gray-700/30">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Tam ({weeklyHours}/{weeklyHours})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Kısmi (Örn: 2/{weeklyHours})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Yok ({weeklyHours} saat)
            </span>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleEditClick}
              className="cursor-pointer flex-1 py-3.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 group/edit border border-indigo-100 dark:border-indigo-800/30"
            >
              <Pencil size={18} className="group-hover/edit:rotate-12 transition-transform" />
              {t('edit')}
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course.id);
              }}
              className="cursor-pointer flex-1 py-3.5 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 group/del border border-red-100 dark:border-red-900/20"
            >
              <Trash2 size={18} className="group-hover/del:rotate-12 transition-transform" />
              {t('deleteCourse')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};