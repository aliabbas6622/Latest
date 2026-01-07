import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type LearningMode = 'UNDERSTAND' | 'APPLY' | 'NEUTRAL';

interface ModeContextType {
    mode: LearningMode;
    isUnderstand: boolean;
    isApply: boolean;
    setMode: (mode: LearningMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mode, setModeState] = useState<LearningMode>('NEUTRAL');

    useEffect(() => {
        const path = location.pathname;

        if (path.includes('/understand/')) {
            setModeState('UNDERSTAND');
        } else if (path.includes('/apply/')) {
            setModeState('APPLY');
        } else {
            setModeState('NEUTRAL');
        }
    }, [location.pathname]);

    const setMode = (newMode: LearningMode) => {
        if (newMode === mode) return;

        // Try to preserve context (univId, topic/materialId) when switching
        const pathParts = location.pathname.split('/');
        // Format: /student/learn/:univId/understand/:materialId or /student/learn/:univId/apply/:topic
        if (pathParts[2] === 'learn') {
            const univId = pathParts[3];
            const currentItem = pathParts[5]; // materialId or topic

            if (newMode === 'APPLY' && mode === 'UNDERSTAND') {
                // Topic usually doesn't match materialId, but in our case 
                // StudentCurriculum suggests we encode topic in URL
                // We'll try to fallback or stay if we can't map perfectly
                navigate(`/student/learn/${univId}/apply/${currentItem}`);
            } else if (newMode === 'UNDERSTAND' && mode === 'APPLY') {
                // From Apply to Understand: We might not have the materialId directly
                // For now, go back to curriculum or first material if we knew it
                // Better implementation: individual pages handle this or we store 'lastUnderstand'
                navigate(`/student/university/${univId}`);
            } else if (newMode === 'NEUTRAL') {
                navigate(`/student/university/${univId}`);
            }
        } else {
            setModeState(newMode);
        }
    };

    return (
        <ModeContext.Provider value={{
            mode,
            isUnderstand: mode === 'UNDERSTAND',
            isApply: mode === 'APPLY',
            setMode
        }}>
            {children}
        </ModeContext.Provider>
    );
};

export const useMode = () => {
    const context = useContext(ModeContext);
    if (context === undefined) {
        throw new Error('useMode must be used within a ModeProvider');
    }
    return context;
};
