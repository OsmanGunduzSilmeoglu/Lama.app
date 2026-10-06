import React, { useState } from 'react';
import { DAYS_OF_WEEK } from '../types';
import { Button } from './Button';
import { X } from 'lucide-react';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (course: { name: string; day: string; time: string; limit: number; classroom: string }) => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [day, setDay] = useState(DAYS_OF_WEEK[0]);
  const [time, setTime] = useState('');
  const [limit, setLimit] = useState<string>('');
  const [classroom, setClassroom] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && day && time && limit) {
      onAdd({
        name,
        day,
        time,
        limit: parseInt(limit, 10),
        classroom
      });
      // Reset form
      setName('');
      setDay(DAYS_OF_WEEK[0]);
      setTime('');
      setLimit('');
      setClassroom('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl scale-100 animate-scale-up relative transition-colors duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Yeni Ders Ekle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 ml-1">Ders Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium placeholder-gray-400"
              placeholder="Örn: Matematik"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 ml-1">Gün</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium appearance-none"
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 ml-1">Saat</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium [color-scheme:light] dark:[color-scheme:dark]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 ml-1">Sınıf</label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                maxLength={8}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium placeholder-gray-400"
                placeholder="Örn: Z-01"
              />
              <div className="text-right text-[10px] text-gray-400 mt-1 mr-1">{classroom.length}/8</div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 ml-1">Devamsızlık Hakkı</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                        setLimit('');
                        return;
                    }
                    const numVal = parseInt(val, 10);
                    if (numVal > 15) {
                        setLimit('15');
                    } else if (numVal < 1) {
                        // Allow typing so user can correct, but min attribute handles validation on submit
                        setLimit(val);
                    } else {
                        setLimit(val);
                    }
                }}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-medium placeholder-gray-400"
                placeholder="Maks: 15"
                min="1"
                max="15"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth>Ekle</Button>
          </div>
        </form>
      </div>
    </div>
  );
};