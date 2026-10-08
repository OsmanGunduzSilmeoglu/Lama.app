import React from'react';
import { Button } from'./Button';
import { X, Moon, Sun, Trash2, RotateCcw } from'lucide-react';

interface SettingsModalProps {
 isOpen: boolean;
 onClose: () => void;
 isDarkMode: boolean;
 toggleDarkMode: () => void;
 onResetApp: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
 isOpen, 
 onClose, 
 isDarkMode, 
 toggleDarkMode, 
 onResetApp 
}) => {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 animate-fade-in">
 <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-xl animate-scale-up relative transition-colors duration-300">
 <button 
 onClick={onClose}
 className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
 >
 <X size={24} />
 </button>

 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Ayarlar</h2>
 
 <div className="space-y-6">
 {/* Dark Mode Toggle */}
 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
 {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
 </div>
 <div>
 <h3 className="font-bold text-gray-700 dark:text-gray-200">Görünüm</h3>
 <p className="text-xs text-gray-500 dark:text-gray-400">
 {isDarkMode ?'Karanlık Mod' :'Aydınlık Mod'}
 </p>
 </div>
 </div>
 
 <button 
 onClick={toggleDarkMode}
 className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${isDarkMode ?'bg-indigo-500' :'bg-gray-300'}`}
 >
 <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-sm ${isDarkMode ?'left-6' :'left-1'}`} />
 </button>
 </div>

 <hr className="border-gray-100 dark:border-gray-700" />

 {/* Reset App */}
 <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
 <h3 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
 <RotateCcw size={16} />
 Uygulamayı Sıfırla
 </h3>
 <p className="text-xs text-red-400 dark:text-red-300 mb-4 leading-relaxed">
 Tüm ders kayıtları ve devamsızlık verileri kalıcı olarak silinecektir. Bu işlem geri alınamaz.
 </p>
 <Button 
 variant="danger" 
 fullWidth 
 onClick={onResetApp}
 className="dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
 >
 Verileri Temizle ve Sıfırla
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
};