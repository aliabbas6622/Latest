import React from 'react';
import { useMode } from '../context/ModeContext';
import { BookOpen, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const ModeIndicator = () => {
    const { mode, setMode } = useMode();

    if (mode === 'NEUTRAL') return null;

    return (
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
            <button
                onClick={() => setMode('UNDERSTAND')}
                className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${mode === 'UNDERSTAND' ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                {mode === 'UNDERSTAND' && (
                    <motion.div
                        layoutId="activeMode"
                        className="absolute inset-0 bg-primary-600 rounded-full shadow-md shadow-primary-500/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <BookOpen size={14} className="relative z-10" />
                <span className="relative z-10 uppercase tracking-wider">Understand</span>
            </button>

            <button
                onClick={() => setMode('APPLY')}
                className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${mode === 'APPLY' ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
            >
                {mode === 'APPLY' && (
                    <motion.div
                        layoutId="activeMode"
                        className="absolute inset-0 bg-primary-600 rounded-full shadow-md shadow-primary-500/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Zap size={14} className="relative z-10" />
                <span className="relative z-10 uppercase tracking-wider">Apply</span>
            </button>
        </div>
    );
};

export default ModeIndicator;
