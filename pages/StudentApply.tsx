import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    XCircle,
    ArrowRight,
    HelpCircle,
    Loader2,
    Timer,
    Flame,
    Trophy
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '@/context/AuthContext';
import { questionService } from '../services/questionService';
import { studentService } from '../services/studentService';
import { Question } from '../types';

const StudentApply = () => {
    const { univId, topic } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (univId && topic) {
                setLoading(true);
                try {
                    const data = await questionService.getQuestionsByTopic(univId, decodeURIComponent(topic));
                    setQuestions(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [univId, topic]);

    useEffect(() => {
        let interval: any;
        if (!loading && questions.length > 0 && currentIdx < questions.length) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [loading, currentIdx, questions.length]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (selectedOption === null || !user) return;

        const currentQ = questions[currentIdx];
        const correct = selectedOption === currentQ.correctAnswer;
        setIsCorrect(correct);
        setIsSubmitted(true);

        if (correct) {
            setScore(s => s + 1);
            setStreak(s => {
                const newStreak = s + 1;
                if (newStreak > maxStreak) setMaxStreak(newStreak);
                return newStreak;
            });
        } else {
            setStreak(0);
        }

        try {
            await studentService.recordAttempt(
                user.id,
                currentQ.id,
                selectedOption,
                correct,
                currentQ.subject,
                currentQ.topic
            );
        } catch (e: any) {
            console.error("Failed to record attempt:", e.message);
        }
    };

    const handleNext = () => {
        setSelectedOption(null);
        setIsSubmitted(false);
        setIsCorrect(false);
        setCurrentIdx(p => p + 1);
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p className="font-medium">Curating your practice set...</p>
                </div>
            </Layout>
        );
    }

    if (questions.length === 0) {
        return (
            <Layout>
                <div className="p-12 text-center max-w-md mx-auto mt-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <HelpCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">No Questions Found</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">We couldn't find any practice questions for "{decodeURIComponent(topic || '')}" at the moment.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                    >
                        Go Back
                    </button>
                </div>
            </Layout>
        )
    }

    const isFinished = currentIdx >= questions.length;

    if (isFinished) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto py-12 px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        <div className="bg-slate-900 p-12 text-center text-white relative">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10"
                            >
                                <div className="w-24 h-24 bg-primary-400 text-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-xl">
                                    <Trophy size={48} />
                                </div>
                                <h2 className="text-4xl font-black mb-2 tracking-tight">Well Done!</h2>
                                <p className="text-slate-400 font-medium">Topic: {decodeURIComponent(topic || '')}</p>
                            </motion.div>
                        </div>

                        <div className="p-12">
                            <div className="grid grid-cols-3 gap-6 mb-12">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                                    <p className="text-3xl font-black text-slate-900">{Math.round((score / questions.length) * 100)}%</p>
                                </div>
                                <div className="text-center border-x border-slate-100 px-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Time</p>
                                    <p className="text-3xl font-black text-slate-900">{formatTime(seconds)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Best Streak</p>
                                    <p className="text-3xl font-black text-primary-500">{maxStreak}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => navigate(`/student/university/${univId}`)}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                                >
                                    BACK TO CURRICULUM
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentIdx(0);
                                        setScore(0);
                                        setIsSubmitted(false);
                                        setSeconds(0);
                                        setStreak(0);
                                        setMaxStreak(0);
                                    }}
                                    className="w-full py-5 border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                                >
                                    RESTART SESSION
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        )
    }

    const currentQ = questions[currentIdx];

    return (
        <Layout>
            <div className="max-w-4xl mx-auto pt-4 pb-20">
                <div className="flex items-center justify-between mb-8 px-2 md:px-0">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => {
                                if (window.confirm('Quit this session? Progress will not be saved.')) {
                                    navigate(`/student/university/${univId}`);
                                }
                            }}
                            className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all group"
                        >
                            <XCircle size={20} />
                        </button>

                        <div className="hidden sm:flex items-center gap-4 py-1.5 px-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 border-r border-slate-100 pr-4">
                                <Timer size={16} className="text-primary-500" />
                                <span className="font-mono font-bold text-slate-700">{formatTime(seconds)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Flame size={16} className={streak > 0 ? "text-primary-500 animate-pulse" : "text-slate-300"} />
                                <span className={`font-bold ${streak > 0 ? "text-slate-900" : "text-slate-400"}`}>{streak}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right mr-3 hidden md:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Progress</p>
                            <p className="text-sm font-bold text-slate-900">{currentIdx + 1} of {questions.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg">
                            {currentIdx + 1}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white p-8 md:p-14 rounded-[2.5rem] shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden relative"
                        >
                            <div className="flex items-center gap-2 mb-8">
                                <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-primary-100">
                                    {currentQ.topic}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{currentQ.subject}</span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 leading-tight mb-12">
                                {currentQ.text}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map((opt, idx) => {
                                    let statusClass = "bg-white border-slate-200 text-slate-700 hover:border-slate-900 hover:shadow-md";

                                    if (isSubmitted) {
                                        if (idx === currentQ.correctAnswer) {
                                            statusClass = "bg-green-50 border-green-500 text-green-900 shadow-lg shadow-green-500/10";
                                        } else if (idx === selectedOption) {
                                            statusClass = "bg-red-50 border-red-500 text-red-900 shadow-lg shadow-red-500/10";
                                        } else {
                                            statusClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                                        }
                                    } else if (selectedOption === idx) {
                                        statusClass = "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={isSubmitted}
                                            onClick={() => setSelectedOption(idx)}
                                            className={`group text-left p-6 md:p-8 rounded-3xl border-2 transition-all duration-200 flex items-center justify-between gap-4 h-full ${statusClass}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${selectedOption === idx && !isSubmitted ? 'bg-primary-500 text-white border-primary-600' :
                                                    isSubmitted && idx === currentQ.correctAnswer ? 'bg-green-500 text-white border-green-400' :
                                                        'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white border-slate-100'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="font-bold leading-relaxed">{opt}</span>
                                            </div>
                                            {isSubmitted && idx === currentQ.correctAnswer && (
                                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                                                    <CheckCircle size={18} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <motion.div
                        initial={false}
                        className="mt-8 flex items-center justify-between gap-6"
                    >
                        <div className="flex-1">
                            <AnimatePresence mode="wait">
                                {isSubmitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`flex items-start gap-4 p-6 rounded-3xl border-2 ${isCorrect ? 'bg-green-50 border-green-100 text-green-900' : 'bg-red-50 border-red-100 text-red-900'}`}
                                    >
                                        <div className={`p-2 rounded-2xl ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
                                            {isCorrect ? <CheckCircle size={24} /> : <HelpCircle size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-xs uppercase tracking-widest mb-1">{isCorrect ? 'Victory!' : 'Keep Going!'}</p>
                                            <p className="text-[15px] font-medium leading-relaxed opacity-95">
                                                {currentQ.explanation || (isCorrect ? "Perfectly calculated!" : "Review the concept in Understand mode.")}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="shrink-0 self-end">
                            {!isSubmitted ? (
                                <button
                                    disabled={selectedOption === null}
                                    onClick={handleSubmit}
                                    className="h-16 px-12 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-500 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-primary-500/20 active:scale-95"
                                >
                                    CONFIRM
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="h-16 px-12 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 active:scale-95 group"
                                >
                                    {currentIdx + 1 === questions.length ? 'FINISH' : 'NEXT'}
                                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentApply;