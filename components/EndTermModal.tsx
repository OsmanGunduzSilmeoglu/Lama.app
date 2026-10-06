import React, { useState } from 'react';
import { Button } from './Button';
import { X, Save } from 'lucide-react';

interface EndTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  t: (key: string) => string;
}

export const EndTermModal: React.FC<EndTermModalProps> = ({ isOpen, onClose, onSave, t }) => {
  const [termName, setTermName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (termName.trim()) {
      onSave(termName);
      setTermName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl">
                <Save size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">{t('saveTermTitle')}</h2>
            </div>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            {t('saveTermDesc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 rounded-2xl transition-all outline-none text-gray-800 dark:text-white font-bold placeholder-gray-400"
              placeholder={t('termNamePlaceholder')}
              required
              autoFocus
            />
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none">
                {t('saveBtn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};