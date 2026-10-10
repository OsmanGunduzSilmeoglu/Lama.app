import React, { useState } from 'react';
import { X, Calculator, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface GradeComponent {
  id: string;
  name: string;
  weight: string;
  score: string;
}

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose, t }) => {
  const [components, setComponents] = useState<GradeComponent[]>([
    { id: '1', name: t('midterm') || 'Vize', weight: '40', score: '' },
    { id: '2', name: t('final') || 'Final', weight: '60', score: '' }
  ]);

  if (!isOpen) return null;

  const handleAddComponent = () => {
    setComponents([...components, { id: Math.random().toString(), name: '', weight: '', score: '' }]);
  };

  const handleUpdateComponent = (id: string, field: keyof GradeComponent, value: string) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length > 1) {
      setComponents(components.filter(c => c.id !== id));
    }
  };

  const totalWeight = components.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);
  
  let currentAverage = 0;
  components.forEach(c => {
    if (c.score !== '' && c.weight !== '') {
      currentAverage += (parseFloat(c.score) * (parseFloat(c.weight) || 0)) / 100;
    }
  });

  const emptyComponents = components.filter(c => c.score === '');
  let neededScoreInfo = null;

  if (emptyComponents.length === 1 && totalWeight === 100) {
    const emptyComp = emptyComponents[0];
    const weight = parseFloat(emptyComp.weight);
    if (weight > 0) {
      const neededPoints = 50 - currentAverage;
      let requiredScore = (neededPoints / weight) * 100;
      requiredScore = Math.max(0, requiredScore);
      neededScoreInfo = {
        name: emptyComp.name || '?',
        score: Math.ceil(requiredScore)
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-xl animate-scale-up overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2 tracking-tight">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-500">
                <Calculator size={20} />
              </div>
              {t('gradeCalculator') || 'Not Hesaplayıcı'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                {t('evaluationCriteria') || 'Değerlendirme Kriterleri'}
              </h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${totalWeight === 100 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                {t('totalWeight') || 'Toplam Ağırlık'}: %{totalWeight}
              </span>
            </div>

            <div className="space-y-3">
              {components.map((comp, index) => (
                <div key={comp.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{t('name') || 'İsim'}</label>
                    <input 
                      type="text" 
                      value={comp.name}
                      onChange={(e) => handleUpdateComponent(comp.id, 'name', e.target.value)}
                      placeholder={t('name') || 'İsim'}
                      className="w-full bg-white dark:bg-gray-800 text-sm py-2 px-3 rounded-xl border-none outline-none text-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase ml-1">Ağırlık(%)</label>
                    <input 
                      type="number" 
                      value={comp.weight}
                      onChange={(e) => handleUpdateComponent(comp.id, 'weight', e.target.value)}
                      placeholder="%"
                      className="w-full bg-white dark:bg-gray-800 text-sm py-2 px-3 rounded-xl border-none outline-none text-center font-bold text-indigo-600 dark:text-indigo-400 shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{t('score') || 'Not'}</label>
                    <input 
                      type="number" 
                      value={comp.score}
                      onChange={(e) => handleUpdateComponent(comp.id, 'score', e.target.value)}
                      placeholder="-"
                      className="w-full bg-white dark:bg-gray-800 text-sm py-2 px-3 rounded-xl border-none outline-none text-center font-bold text-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveComponent(comp.id)}
                    disabled={components.length <= 1}
                    className="mt-5 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddComponent}
              className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> {t('addCriterion') || 'Kriter Ekle'}
            </button>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-[1.5rem] space-y-4 border border-indigo-100 dark:border-indigo-900/30">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{t('currentAverage') || 'Mevcut Ortalama'}</p>
              <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {currentAverage.toFixed(1)}
              </div>
            </div>

            {totalWeight === 100 && neededScoreInfo && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-indigo-100/50 dark:border-indigo-800/50 text-center animate-fade-in">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Geçmek için (Ort ≥ 50)
                </p>
                <div className="text-gray-800 dark:text-gray-200 font-medium">
                  <span className="font-bold text-indigo-500">{neededScoreInfo.name}</span> sınavından <span className="font-black text-xl text-red-500">{neededScoreInfo.score}</span> alman gerekiyor.
                </div>
              </div>
            )}
            
            {totalWeight !== 100 && (
              <div className="text-center text-xs font-bold text-orange-500 dark:text-orange-400">
                {t('weightWarning') || 'Toplam ağırlık %100 olmalıdır.'}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
