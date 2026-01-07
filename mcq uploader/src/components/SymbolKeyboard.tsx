import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, FlaskConical, Atom, X, ChevronRight, Hash } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface SymbolKeyboardProps {
    onInsert: (symbol: string) => void;
    onClose: () => void;
}

const SYMBOL_SETS = {
    Maths: [
        { label: 'Greek', symbols: ['\\pi', '\\theta', '\\alpha', '\\beta', '\\gamma', '\\delta', '\\lambda', '\\omega', '\\mu', '\\sigma', '\\phi', '\\psi', '\\Phi', '\\Omega'] },
        { label: 'Operators', symbols: ['\\pm', '\\mp', '\\times', '\\div', '\\cdot', '\\approx', '\\neq', '\\leq', '\\geq', '\\infty', '\\propto', '\\nabla'] },
        { label: 'Calculus/Layout', symbols: ['\\frac{n}{d}', '\\sqrt{x}', 'x^n', 'x_n', '\\sum_{i=1}^n', '\\int', '\\lim_{x \\to \\infty}', '\\log_b x', '\\ln'] },
        { label: 'Logic/Sets', symbols: ['\\forall', '\\exists', '\\in', '\\notin', '\\subset', '\\cup', '\\cap', '\\implies', '\\iff'] }
    ],
    Physics: [
        { label: 'Variables', symbols: ['\\Delta', '\\epsilon_0', '\\mu_0', '\\rho', '\\nu', '\\tau', '\\omega', '\\lambda', '\\zeta'] },
        { label: 'Vectors/Relations', symbols: ['\\vec{v}', '\\dot{x}', '\\ddot{x}', '\\perp', '\\parallel', '\\angle', '\\degree', '\\hat{k}'] },
        { label: 'Units', symbols: ['m/s', 'm/s^2', '\\Omega', 'W', 'J', 'N', 'Pa', 'V', 'A', 'Hz'] }
    ],
    Chemistry: [
        { label: 'Reactions', symbols: ['\\rightarrow', '\\rightleftharpoons', '\\leftarrow', '\\uparrow', '\\downarrow', '\\xrightarrow{heat}', '\\xleftarrow{}'] },
        { label: 'States', symbols: ['(s)', '(l)', '(g)', '(aq)'] },
        { label: 'Structure', symbols: ['\\equiv', '\\text{pH}', '\\text{pK}_a', '[H^+]', '[OH^-]', '\\Delta H'] },
        { label: 'Subscripts', symbols: ['_2', '_3', '_4', '_a', '_b', '_x', '_{10}'] }
    ]
};

const SymbolKeyboard: React.FC<SymbolKeyboardProps> = ({ onInsert, onClose }) => {
    const [activeTab, setActiveTab] = useState<keyof typeof SYMBOL_SETS>('Maths');

    const renderSymbol = (symbol: string) => {
        // Decide if it needs latex rendering
        const isLatex = symbol.startsWith('\\') || symbol.includes('^') || symbol.includes('_') || symbol.includes('{');

        // If it's something like (s) or m/s, it might not be "latex" in the traditional sense 
        // but we might want it to look consistent. However, KaTeX is best for math.

        try {
            return (
                <span
                    className="katex-render"
                    dangerouslySetInnerHTML={{
                        __html: katex.renderToString(symbol, {
                            throwOnError: false,
                            displayMode: false
                        })
                    }}
                />
            );
        } catch (e) {
            return symbol.replace(/\\/g, '');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white/95 backdrop-blur-xl sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/50 overflow-hidden w-full sm:max-w-md flex flex-col h-[70vh] sm:h-[480px]"
        >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {(Object.keys(SYMBOL_SETS) as Array<keyof typeof SYMBOL_SETS>).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${activeTab === tab
                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 scale-105'
                                    : 'text-slate-400 hover:bg-slate-100/80'
                                }`}
                        >
                            {tab === 'Maths' && <Sigma size={14} />}
                            {tab === 'Physics' && <Atom size={14} />}
                            {tab === 'Chemistry' && <FlaskConical size={14} />}
                            {tab}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 ml-2"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Symbols Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {SYMBOL_SETS[activeTab].map((group, gIdx) => (
                    <div key={gIdx} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.label}</h4>
                            <div className="flex-1 h-px bg-gradient-to-r from-slate-100 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {group.symbols.map((symbol, sIdx) => (
                                <button
                                    key={sIdx}
                                    onClick={() => onInsert(symbol)}
                                    className="bg-white border border-slate-100/80 h-14 rounded-2xl flex items-center justify-center hover:border-teal-400/50 hover:bg-teal-50/30 hover:shadow-sm transition-all group active:scale-90 px-2 overflow-hidden"
                                    title={symbol}
                                >
                                    <div className="group-hover:scale-110 transition-transform flex items-center justify-center w-full text-slate-700">
                                        {renderSymbol(symbol)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Tip */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-600/5 rounded-full border border-teal-100">
                    <ChevronRight size={14} className="text-teal-600" />
                    <p className="text-[10px] font-black text-teal-700 uppercase tracking-wider">Click symbol to insert at cursor</p>
                </div>
            </div>
        </motion.div>
    );
};

export default SymbolKeyboard;
