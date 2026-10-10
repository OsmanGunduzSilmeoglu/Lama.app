import React, { useState } from 'react';
import { DAYS_OF_WEEK, calculateAllowedAbsenceHours } from '../types';
import { Button } from './Button';
import { X, Clock, Sparkles } from 'lucide-react';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (course: { 
    name: string; 
    day: string; 
    time: string; 
    limit: number; 
    classroom: string;
    weeklyHours: number;
    absencePercentage: number;
  }) => void;
  termWeeks?: number;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  termWeeks = 14
}) => {
  const [name, setName] = useState('');
  const [day, setDay] = useState(DAYS_OF_WEEK[0]);
  const [time, setTime] = useState('');
  const [classroom, setClassroom] = useState('');

  // Haftalık ders saati (Varsayılan hafızadan veya 3)
  const [weeklyHours, setWeeklyHours] = useState<number>(() => {
    const saved = localStorage.getItem('defaultWeeklyHours');
    return saved ? parseInt(saved, 10) : 3;
  });

  // Devamsızlık yüzdesi (Bir defa seçilince hafızada tutulur, sonrakilerde otomatik gelir)
  const [absencePercentage, setAbsencePercentage] = useState<number>(() => {
    const saved = localStorage.getItem('defaultAbsencePercentage');
    return saved ? parseInt(saved, 10) : 30;
  });

  const [isCustomPercentage, setIsCustomPercentage] = useState<boolean>(() => {
    const saved = localStorage.getItem('defaultAbsencePercentage');
    return saved ? (saved !== '30' && saved !== '20') : false;
  });

  if (!isOpen) return null;

  const handlePercentageChange = (pct: number) => {
    setAbsencePercentage(pct);
    setIsCustomPercentage(false);
    localStorage.setItem('defaultAbsencePercentage', String(pct));
  };

  const handleWeeklyHoursChange = (hours: number) => {
    setWeeklyHours(hours);
    localStorage.setItem('defaultWeeklyHours', String(hours));
  };

  const calculatedAllowedHours = calculateAllowedAbsenceHours(weeklyHours, absencePercentage, termWeeks);
  const totalCourseHours = weeklyHours * termWeeks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && day && time) {
      onAdd({
        name,
        day,
        time,
        classroom,
        limit: calculatedAllowedHours,
        weeklyHours,
        absencePercentage
      });

      // Reset form
      setName('');
      setDay(DAYS_OF_WEEK[0]);
      setTime('');
      setClassroom('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-xl scale-100 animate-scale-up relative transition-colors duration-300 my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-5 tracking-tight">Yeni Ders Ekle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Ders Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-semibold placeholder-gray-400 text-sm"
              placeholder="Örn: Matematik"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Gün</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-semibold text-sm cursor-pointer"
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d} className="dark:bg-gray-800">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Başlangıç Saati</label>
              <input
                type="text"
                inputMode="numeric"
                value={time}
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
                  } else if (val.length === 2 && raw.length > time.length) {
                    formatted = val + ':';
                  }
                  setTime(formatted);
                }}
                className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-semibold text-sm placeholder-gray-400"
                placeholder="Örn: 09:30"
                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                title="Lütfen geçerli bir saat girin (Örn: 09:30)"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Sınıf (İsteğe Bağlı)</label>
            <input
              type="text"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              maxLength={8}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-semibold placeholder-gray-400 text-sm"
              placeholder="Örn: B-204"
            />
          </div>

          {/* Haftalık Ders/Oturum Saati Seçimi */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 flex items-center justify-between">
              <span>Günde / Blokta Kaç Saat Ders Var?</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{weeklyHours} Saat</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleWeeklyHoursChange(hours)}
                  className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
                    weeklyHours === hours
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-gray-50 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {hours} Saat
                </button>
              ))}
            </div>
          </div>

          {/* Devamsızlık Yüzdesi Seçimi */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 flex items-center justify-between">
              <span>Devamsızlık Kuralı (%)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">%{absencePercentage}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePercentageChange(30)}
                className={`py-2 px-1 text-center rounded-xl font-bold text-xs transition-all border ${
                  !isCustomPercentage && absencePercentage === 30
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-gray-50 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Teorik (%30)
              </button>
              <button
                type="button"
                onClick={() => handlePercentageChange(20)}
                className={`py-2 px-1 text-center rounded-xl font-bold text-xs transition-all border ${
                  !isCustomPercentage && absencePercentage === 20
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-gray-50 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Uygulama (%20)
              </button>
              <button
                type="button"
                onClick={() => setIsCustomPercentage(true)}
                className={`py-2 px-1 text-center rounded-xl font-bold text-xs transition-all border ${
                  isCustomPercentage
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-gray-50 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Özel %
              </button>
            </div>

            {isCustomPercentage && (
              <div className="mt-2.5 flex items-center gap-2 animate-fade-in">
                <span className="text-xs font-bold text-gray-400">%</span>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={absencePercentage}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(90, parseInt(e.target.value) || 0));
                    setAbsencePercentage(val);
                    localStorage.setItem('defaultAbsencePercentage', String(val));
                  }}
                  className="w-24 px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-bold text-sm outline-none"
                  placeholder="30"
                  autoFocus
                />
                <span className="text-xs text-gray-400 font-medium">oranında devamsızlık hakkı</span>
              </div>
            )}
          </div>

          {/* Otomatik Hesaplama Rozeti */}
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="text-xs flex-1">
              <div className="flex justify-between items-center font-bold text-indigo-900 dark:text-indigo-200">
                <span>Hesaplanan Devamsızlık Hakkı:</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{calculatedAllowedHours} Saat</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {termWeeks} hafta × {weeklyHours} saat = toplam {totalCourseHours} saat ders üzerinden
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth className="py-3.5 text-base shadow-indigo-500/25">
              Dersi Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};