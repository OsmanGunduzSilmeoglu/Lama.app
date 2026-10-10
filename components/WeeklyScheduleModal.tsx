import React, { useState, useRef } from'react';
import { Course, DAYS_OF_WEEK } from'../types';
import { X, MapPin, Pencil } from'lucide-react';
import { Button } from'./Button';
import { CourseDetailModal } from'./CourseDetailModal';

interface WeeklyScheduleModalProps {
 isOpen: boolean;
 onClose: () => void;
 courses: Course[];
 onAdd: (course: { name: string; day: string; time: string; limit: number; classroom: string; isRoutine?: boolean }) => void;
 onDelete: (id: string) => void;
 onUpdate: (id: string, data: Partial<Course>) => void;
 t: (key: string) => string;
}

export const WeeklyScheduleModal: React.FC<WeeklyScheduleModalProps> = ({ isOpen, onClose, courses, onAdd, onDelete, onUpdate, t }) => {
 // Local state for Quick Add Modal
 const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
 const [selectedDay, setSelectedDay] = useState<string | null>(null);
 
 // Detail Modal State - Now using ID for Single Source of Truth
 const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
 
 // Derive the actual course object from the fresh courses list
 const selectedCourseForDetail = courses.find(c => c.id === selectedCourseId) || null;

 // Quick Add Form States
 const [newItemName, setNewItemName] = useState('');
 const [newItemTime, setNewItemTime] = useState('');
 const [newItemLocation, setNewItemLocation] = useState('');

 // Long press timer ref & interaction flags
 const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const isLongPressTriggered = useRef(false);

 if (!isOpen) return null;

 // Helper to sort courses by time
 const getCoursesForDay = (day: string) => {
 return courses
 .filter(c => c.day === day)
 .sort((a, b) => (a.time ||'').localeCompare(b.time ||''));
 };

 const handleOpenQuickAdd = (day: string) => {
 setSelectedDay(day);
 setNewItemName('');
 setNewItemTime('');
 setNewItemLocation('');
 setIsQuickAddOpen(true);
 };

 const handleQuickAddSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (selectedDay && newItemName) {
 onAdd({
 name: newItemName,
 day: selectedDay,
 time: newItemTime, // Optional, can be empty string
 classroom: newItemLocation, // Optional
 limit: 0, // Default to 0 for routines (implies no tracking needed)
 isRoutine: true // Flag as routine so it doesn't show on home screen
 });
 setIsQuickAddOpen(false);
 }
 };

 // --- Interaction Logic (Tap vs Long Press) ---
 const handleTouchStart = (id: string) => {
 isLongPressTriggered.current = false;
 timerRef.current = setTimeout(() => {
 isLongPressTriggered.current = true;
 // Trigger delete confirmation via the parent handler
 if (navigator.vibrate) navigator.vibrate(50);
 onDelete(id);
 }, 600); // 600ms hold time
 };

 const handleTouchEnd = () => {
 if (timerRef.current) {
 clearTimeout(timerRef.current);
 timerRef.current = null;
 }
 };

 const handleTouchMove = () => {
 // If user scrolls, cancel the long press
 if (timerRef.current) {
 clearTimeout(timerRef.current);
 timerRef.current = null;
 }
 };
 
 const handleCourseClick = (courseId: string) => {
 // Only open details if long press was NOT triggered
 if (!isLongPressTriggered.current) {
 setSelectedCourseId(courseId);
 }
 // Reset flag
 isLongPressTriggered.current = false;
 };

 return (
 <>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/50 animate-fade-in">
 <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-[90vh] sm:rounded-3xl shadow-xl flex flex-col relative overflow-hidden animate-scale-up border border-gray-200 dark:border-gray-800">
 
 {/* Header */}
 <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 shrink-0">
 <div>
 <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white tracking-tight">{t('weeklySchedule')}</h2>
 <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium">
 {t('holdToDelete')}
 </p>
 </div>
 <button 
 onClick={onClose}
 className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
 >
 <X size={24} />
 </button>
 </div>

 {/* Scrollable Grid Content */}
 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
 {DAYS_OF_WEEK.map((day) => {
 const daysCourses = getCoursesForDay(day);
 const isWeekend = day ==='Cumartesi' || day ==='Pazar';

 return (
 <div key={day} className="bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden flex flex-col h-fit shadow-sm hover:shadow-md transition-shadow group/day">
 {/* Day Header */}
 <div className={`px-5 py-3 font-bold text-sm flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 transition-colors ${
 isWeekend
 ?'bg-orange-50/50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400' 
 :'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400'
 }`}>
 <span className="tracking-wide uppercase text-xs">{t(day)}</span>
 <button 
 onClick={() => handleOpenQuickAdd(day)}
 className="p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all text-current opacity-60 hover:opacity-100 active:scale-95"
 title={t('addToSchedule')}
 >
 <Pencil size={14} />
 </button>
 </div>

 {/* Course List within the Day Card */}
 <div className="p-3 flex flex-col gap-2 min-h-[60px]">
 {daysCourses.length > 0 ? (
 daysCourses.map(course => (
 <div 
 key={course.id} 
 // Long Press Handlers
 onTouchStart={() => handleTouchStart(course.id)}
 onTouchEnd={handleTouchEnd}
 onTouchMove={handleTouchMove}
 onMouseDown={() => handleTouchStart(course.id)} // For desktop testing
 onMouseUp={handleTouchEnd}
 onMouseLeave={handleTouchEnd}
 // Click Handler for Details
 onClick={() => handleCourseClick(course.id)}
 className={`flex items-center gap-3 p-3 rounded-2xl transition-all border border-transparent select-none active:scale-95 duration-200 cursor-pointer shadow-sm ${course.isRoutine ?'bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20' :'bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md'}`}
 >
 {course.time ? (
 <div className="flex flex-col items-center justify-center min-w-[3.2rem] text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 py-1.5 px-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
 <span>{course.time}</span>
 </div>
 ) : (
 <div className="min-w-[0.5rem] h-8 w-1.5 bg-gray-200 dark:bg-gray-700 rounded-full ml-1"></div>
 )}
 
 <div className="flex-1 min-w-0">
 <div className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate leading-tight flex justify-between items-center">
 <span>{course.courseName}</span>
 {(course.midtermScore !== undefined || course.finalScore !== undefined) && (
 <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1 shrink-0" title="Notlar Girildi" />
 )}
 </div>
 {course.classroom && (
 <div className="flex items-center gap-1 text-[10px] text-indigo-500 dark:text-indigo-400 mt-1 font-semibold">
 <MapPin size={10} />
 <span>{course.classroom}</span>
 </div>
 )}
 </div>
 </div>
 ))
 ) : (
 <div 
 onClick={() => handleOpenQuickAdd(day)}
 className="py-6 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl border border-dashed border-transparent hover:border-gray-200 dark:hover:border-gray-700"
 >
 <span className="text-xs font-medium">{t('empty')}</span>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>

 {/* Quick Add Modal Overlay */}
 {isQuickAddOpen && (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
 <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] p-6 shadow-xl animate-scale-up relative">
 <button 
 onClick={() => setIsQuickAddOpen(false)}
 className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
 >
 <X size={24} />
 </button>
 
 <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{t('addToSchedule')}</h3>
 <p className="text-sm text-indigo-500 dark:text-indigo-400 font-bold mb-6">{selectedDay && t(selectedDay)}</p>

 <form onSubmit={handleQuickAddSubmit} className="space-y-4">
 <div>
 <input
 type="text"
 value={newItemName}
 onChange={(e) => setNewItemName(e.target.value)}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium placeholder-gray-400"
 placeholder={t('activityName')}
 required
 autoFocus
 />
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <input
 type="text"
 value={newItemTime}
 onChange={(e) => {
   let val = e.target.value.replace(/[^\d:]/g, '');
   if (val.length === 2 && !val.includes(':') && newItemTime.length < val.length) {
     val += ':';
   }
   if (val.length > 5) val = val.slice(0, 5);
   setNewItemTime(val);
 }}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium"
 placeholder="09:30"
 pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
 title="Lütfen geçerli bir saat girin (Örn: 09:30)"
 />
 <input
 type="text"
 value={newItemLocation}
 onChange={(e) => setNewItemLocation(e.target.value)}
 maxLength={8}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium placeholder-gray-400"
 placeholder={t('location')}
 />
 </div>

 <div className="pt-2">
 <Button type="submit" fullWidth>{t('add')}</Button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Course Detail / Exam Modal */}
 <CourseDetailModal 
 isOpen={!!selectedCourseForDetail}
 onClose={() => setSelectedCourseId(null)}
 course={selectedCourseForDetail}
 onUpdate={onUpdate}
 t={t}
 />
 </>
 );
};