import React from'react';
import { Button } from'./Button';
import { X, Moon, Sun, RotateCcw, Info, Globe, Archive, Save, ArrowLeft } from'lucide-react';

interface SidebarProps {
 isOpen: boolean;
 onClose: () => void;
 isDarkMode: boolean;
 toggleDarkMode: () => void;
 onResetApp: () => void;
 currentLanguage: string;
 onLanguageChange: (lang: string) => void;
 
 // New props for Archive functionality
 onOpenEndTerm: () => void;
 onOpenRecords: () => void;
 isViewingArchive: boolean;
 onExitArchive: () => void;
 
 t: (key: string) => string;
}

export const Sidebar: React.FC<SidebarProps> = ({
 isOpen,
 onClose,
 isDarkMode,
 toggleDarkMode,
 onResetApp,
 currentLanguage,
 onLanguageChange,
 onOpenEndTerm,
 onOpenRecords,
 isViewingArchive,
 onExitArchive,
 t
}) => {
 
 const languages = [
 { code:'tr', name:'Türkçe', flag:'🇹🇷' },
 { code:'en', name:'English', flag:'🇺🇸' },
 { code:'es', name:'Español', flag:'🇪🇸' },
 { code:'de', name:'Deutsch', flag:'🇩🇪' },
 { code:'fr', name:'Français', flag:'🇫🇷' }
 ];

 return (
 <>
 {/* Backdrop */}
 <div 
 className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ?'opacity-100' :'opacity-0 pointer-events-none'}`}
 onClick={onClose}
 />

 {/* Sidebar Panel */}
 <div 
 className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 z-[70] shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ?'translate-x-0' :'-translate-x-full'}`}
 >
 {/* Header */}
 <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
 <div>
 <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{t('menu')}</h2>
 <p className="text-xs text-gray-400 font-bold">Lama Attendance</p>
 </div>
 <button 
 onClick={onClose}
 className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
 >
 <X size={24} />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6 space-y-8">
 
 {/* Archive / Term Management Section */}
 <div className="space-y-3">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('dataManagement')}</h3>
 
 {isViewingArchive ? (
 <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 animate-pulse">
 <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">{t('archiveMode')}</p>
 <Button 
 fullWidth 
 onClick={() => {
 onExitArchive();
 onClose();
 }}
 className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-none text-sm py-2"
 >
 <ArrowLeft size={16} className="mr-2" />
 {t('backToCurrent')}
 </Button>
 </div>
 ) : (
 <>
 <button 
 onClick={() => {
 onOpenEndTerm();
 onClose();
 }}
 className="w-full p-4 bg-white dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
 >
 <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full group-hover:scale-110 transition-transform">
 <Save size={20} />
 </div>
 <span className="font-bold text-gray-700 dark:text-gray-200">{t('endTerm')}</span>
 </button>

 <button 
 onClick={() => {
 onOpenRecords();
 onClose();
 }}
 className="w-full p-4 bg-white dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
 >
 <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full group-hover:scale-110 transition-transform">
 <Archive size={20} />
 </div>
 <span className="font-bold text-gray-700 dark:text-gray-200">{t('records')}</span>
 </button>
 </>
 )}
 </div>

 {/* Appearance Section */}
 <div>
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{t('appearance')}</h3>
 <div 
 onClick={toggleDarkMode}
 className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl cursor-pointer active:scale-95 transition-all"
 >
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-full ${isDarkMode ?'bg-indigo-900/50 text-indigo-400' :'bg-orange-100 text-orange-500'}`}>
 {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
 </div>
 <div>
 <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm">
 {isDarkMode ? t('darkMode') : t('lightMode')}
 </h4>
 </div>
 </div>
 
 <div className={`w-10 h-6 rounded-full transition-colors duration-300 relative ${isDarkMode ?'bg-indigo-500' :'bg-gray-300'}`}>
 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-sm ${isDarkMode ?'left-5' :'left-1'}`} />
 </div>
 </div>
 </div>

 {/* Language Section */}
 <div>
 <div className="flex items-center gap-2 mb-3 ml-1">
 <Globe size={14} className="text-gray-400" />
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('language')}</h3>
 </div>
 <div className="grid grid-cols-2 gap-3">
 {languages.map(lang => (
 <button
 key={lang.code}
 onClick={() => onLanguageChange(lang.code)}
 className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
 currentLanguage === lang.code
 ?'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-sm'
 :'bg-white border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
 }`}
 >
 <span className="text-xl">{lang.flag}</span>
 <span className={`text-sm font-bold ${
 currentLanguage === lang.code ?'text-indigo-600 dark:text-indigo-400' :'text-gray-600 dark:text-gray-400'
 }`}>
 {lang.name}
 </span>
 </button>
 ))}
 </div>
 </div>

 {/* Data Reset Section */}
 {!isViewingArchive && (
 <div>
 <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
 <div className="flex items-start gap-3 mb-3">
 <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full shrink-0">
 <RotateCcw size={18} />
 </div>
 <div>
 <h4 className="font-bold text-red-600 dark:text-red-400 text-sm">{t('resetTitle')}</h4>
 <p className="text-xs text-red-400 dark:text-red-300/70 mt-1 leading-snug">
 {t('sidebarResetDesc')}
 </p>
 </div>
 </div>
 <Button 
 variant="danger" 
 fullWidth 
 onClick={onResetApp}
 className="py-2 text-sm dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 shadow-none"
 >
 {t('sidebarResetBtn')}
 </Button>
 </div>
 </div>
 )}

 </div>

 {/* Footer */}
 <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
 <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
 <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
 Fikirlerinizi bekliyoruz 💡
 </p>
 <a 
 href="mailto:osmangunduzsilmeoglu@gmail.com"
 className="text-indigo-500 dark:text-indigo-400 text-xs font-medium hover:underline block break-all"
 >
 osmangunduzsilmeoglu@gmail.com
 </a>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-semibold">
 <Info size={14} />
 <span>{t('version')} 1.1.0</span>
 </div>
 <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
 by Osman Gündüz Silmeoğlu
 </p>
 </div>
 </div>
 </div>
 </>
 );
};