import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Evet", 
  cancelText = "Vazgeç",
  isDanger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 transition-all relative">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-500' : 'bg-indigo-100 text-indigo-500'}`}>
          <AlertTriangle size={24} />
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
          {message}
        </p>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            fullWidth
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {cancelText}
          </Button>
          <Button 
            variant={isDanger ? "danger" : "primary"} 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};