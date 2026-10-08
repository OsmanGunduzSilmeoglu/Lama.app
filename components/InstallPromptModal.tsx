import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

export const InstallPromptModal: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const hasDismissed = localStorage.getItem('installPromptDismissed') === 'true';

    if (!isStandalone && !hasDismissed) {
      // Detect OS
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType('ios');
      } else if (/android/.test(userAgent)) {
        setDeviceType('android');
      }
      
      // Delay prompt slightly so it's not jarring on first load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-overlay border border-gray-100 dark:border-gray-700 p-5 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 relative z-10 pr-8">
          <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-100 dark:border-yellow-900/30">
            <img src="/pwa-192x192.jpg" alt="Logo" className="w-10 h-10 rounded-xl" />
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
              Uygulamayı Yükleyin
            </h3>
            
            {deviceType === 'ios' ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Kolay erişim için: Alttaki <Share size={14} className="inline mx-1 text-indigo-500" /> <b>Paylaş</b> ikonuna dokunun ve <PlusSquare size={14} className="inline mx-1 text-indigo-500" /> <b>Ana Ekrana Ekle</b>'yi seçin.
              </p>
            ) : deviceType === 'android' ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Kolay erişim için tarayıcı menüsünden <Download size={14} className="inline mx-1 text-indigo-500" /> <b>Uygulamayı Yükle</b> veya <b>Ana Ekrana Ekle</b> seçeneğine dokunun.
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Daha iyi bir deneyim için tarayıcınızın menüsünden uygulamayı cihazınıza yükleyebilirsiniz.
              </p>
            )}
            
            <button 
              onClick={handleDismiss}
              className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
