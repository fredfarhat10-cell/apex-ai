import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AuraState } from '../types';
import { BrainCircuit, Sparkles, CloudRain, Zap, Coffee, Moon, Sun } from 'lucide-react';

const auraConfig: { [key in AuraState]: { icon: React.ReactNode; color: string; } } = {
  Neutral: { icon: <Sun size={18} />, color: 'text-apex-gray' },
  Focused: { icon: <BrainCircuit size={18} />, color: 'text-blue-400' },
  Creative: { icon: <Sparkles size={18} />, color: 'text-purple-400' },
  Stressed: { icon: <CloudRain size={18} />, color: 'text-red-400' },
  Energized: { icon: <Zap size={18} />, color: 'text-yellow-400' },
  Tired: { icon: <Moon size={18} />, color: 'text-indigo-400' },
};

const AuraIndicator: React.FC = () => {
  const { aura, updateState } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSelectAura = (newAura: AuraState) => {
    updateState('aura', newAura);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative mb-4" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-md bg-apex-dark border border-gray-700 hover:border-gray-600 transition-colors"
      >
        <div className="flex items-center gap-2">
            <span className={auraConfig[aura].color}>
                {auraConfig[aura].icon}
            </span>
            <span className="text-sm font-medium text-apex-light">Aura</span>
        </div>
        <span className={`text-sm font-semibold ${auraConfig[aura].color}`}>{aura}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-apex-dark border border-gray-700 rounded-lg shadow-2xl p-2 z-10 animate-fadeIn">
          <div className="grid grid-cols-3 gap-1">
            {(Object.keys(auraConfig) as AuraState[]).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectAura(key)}
                className={`flex flex-col items-center justify-center p-2 rounded-md hover:bg-apex-darker transition-colors ${aura === key ? 'bg-apex-primary/20' : ''}`}
                title={key}
              >
                <span className={`${auraConfig[key].color} mb-1`}>{auraConfig[key].icon}</span>
                <span className="text-xs text-apex-gray">{key}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraIndicator;
