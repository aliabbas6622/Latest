import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

interface PremiumAlertProps {
    type: AlertType;
    title?: string;
    description: string;
    onClose?: () => void;
    isVisible?: boolean;
}

const alertConfig = {
    success: {
        bg: 'bg-[#1a4731]', // Deep green from design
        border: 'bg-[#2e7d32]',
        icon: CheckCircle,
        textColor: 'text-white',
        iconColor: 'text-green-400'
    },
    info: {
        bg: 'bg-[#1e3a8a]', // Deep blue from design
        border: 'bg-[#2563eb]',
        icon: Info,
        textColor: 'text-white',
        iconColor: 'text-blue-400'
    },
    warning: {
        bg: 'bg-[#78350f]', // Deep amber from design
        border: 'bg-[#d97706]',
        icon: AlertTriangle,
        textColor: 'text-white',
        iconColor: 'text-amber-400'
    },
    error: {
        bg: 'bg-[#7f1d1d]', // Deep red from design
        border: 'bg-[#dc2626]',
        icon: XCircle,
        textColor: 'text-white',
        iconColor: 'text-red-400'
    }
};

const PremiumAlert: React.FC<PremiumAlertProps> = ({ type, title, description, onClose, isVisible = true }) => {
    const config = alertConfig[type];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative overflow-hidden ${config.bg} rounded-xl shadow-2xl flex items-stretch border-none min-w-[320px] max-w-md group`}
                >
                    {/* 3D Left Border Bar */}
                    <div className={`w-3 ${config.border} shrink-0 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]`}></div>

                    <div className="p-4 flex gap-4 items-start w-full pr-10">
                        <div className={`${config.iconColor} p-1 rounded-lg shrink-0`}>
                            <Icon size={22} />
                        </div>
                        <div className="flex-1">
                            {title && <h4 className={`font-black tracking-tight ${config.textColor} mb-0.5`}>{title}</h4>}
                            <p className={`text-sm ${config.textColor} opacity-90 leading-relaxed font-medium`}>
                                {description}
                            </p>
                        </div>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X size={16} />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PremiumAlert;
