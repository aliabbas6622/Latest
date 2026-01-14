import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Zap,
    ArrowLeft,
    Clock,
    Target,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { materialService } from '../services/materialService';
import { questionService } from '../services/questionService';
import { StudyMaterial, Question } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';

const StudentTopicPage = () => {
    const { univId, topicId } = useParams();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'LEARN' | 'PRACTICE'>('LEARN');
    const [loading, setLoading] = useState(true);
    const [material, setMaterial] = useState<StudyMaterial | null>(null);
    const [questionCount, setQuestionCount] = useState(0);

    useEffect(() => {
        const load = async () => {
            if (!topicId) return;
            setLoading(true);
            try {
                // Fetch material for this topic
                const mats = await materialService.getAllMaterials();
                const topicMat = mats.find(m => m.topicId === topicId);
                setMaterial(topicMat || null);

                // Check questions count
                const questions = await questionService.getQuestionsByTopicId(topicId);
                setQuestionCount(questions.length);

                // Default to Practice if no material but has questions
                if (!topicMat && questions.length > 0) {
                    setMode('PRACTICE');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [topicId]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p className="font-medium">Preparing your topic session...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-8 px-6">
                {/* Header with Navigation and Mode Tabs */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest mb-6 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Curriculum
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {material?.topic || 'Topic Practice'}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">{material?.subject || 'Question Bank'}</p>
                    </div>

                    <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
                        <button
                            onClick={() => setMode('LEARN')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'LEARN' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BookOpen size={18} />
                            UNDERSTAND
                        </button>
                        <button
                            onClick={() => setMode('PRACTICE')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'PRACTICE' ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Zap size={18} />
                            APPLY
                            {questionCount > 0 && (
                                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${mode === 'PRACTICE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {questionCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {mode === 'LEARN' ? (
                        <motion.div
                            key="learn"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                        >
                            {material ? (
                                <div className="p-8 md:p-14">
                                    <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
                                        <h2 className="text-3xl font-black text-slate-900 mb-8 font-serif leading-tight">
                                            {material.title}
                                        </h2>
                                        <MarkdownRenderer content={material.content} />

                                        {material.summary && (
                                            <div className="mt-16 p-8 bg-primary-50 rounded-3xl border border-primary-100">
                                                <h4 className="text-primary-900 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <CheckCircle2 size={18} />
                                                    Quick Review
                                                </h4>
                                                <div className="text-primary-800 text-[15px] font-medium leading-relaxed">
                                                    {material.summary}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-16 flex justify-center">
                                            <button
                                                onClick={() => setMode('PRACTICE')}
                                                className="group flex flex-col items-center gap-4"
                                            >
                                                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-primary-600 transition-all">
                                                    <Zap size={28} />
                                                </div>
                                                <span className="text-sm font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">
                                                    Ready to Practice?
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                                        <BookOpen size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Detailed content coming soon!</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">We're currently perfecting the conceptual guide for this topic. Why not jump straight into practice?</p>
                                    <button
                                        onClick={() => setMode('PRACTICE')}
                                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                                    >
                                        JUMP TO PRACTICE
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="practice"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {questionCount > 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
                                    <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                        <Clock size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Practice Session Ready</h3>
                                    <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
                                        Test your understanding with {questionCount} curated questions for this topic.
                                        Accuracy and speed are the keys to success.
                                    </p>
                                    <button
                                        onClick={() => navigate(`/student/learn/${univId}/apply/${material?.topic || topicId}`)}
                                        className="bg-primary-600 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl shadow-primary-500/30 hover:bg-primary-500 hover:-translate-y-1 transition-all active:scale-95 text-lg"
                                    >
                                        START PRACTICE NOW
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                                        <AlertCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Practice set in the oven...</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mb-0 font-medium leading-relaxed">
                                        Our content team is curating high-quality MCQs for this topic. Check back soon!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default StudentTopicPage;
