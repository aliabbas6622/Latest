import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { instituteService } from '../services/instituteService';
import { BookOpen, ArrowLeft, Search, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentUnderstandTopics = () => {
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [curriculum, setCurriculum] = useState<Record<string, { id: string, name: string }[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const insts = await instituteService.getAllInstitutes();
                setInstitutions(insts);

                if (insts.length > 0) {
                    const defaultInst = insts[0].id;
                    setSelectedInstitution(defaultInst);
                    const curriculumMap = await questionService.getQuestionCurriculum(defaultInst);
                    setCurriculum(curriculumMap);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleInstitutionChange = async (instId: string) => {
        setSelectedInstitution(instId);
        setLoading(true);
        try {
            const curriculumMap = await questionService.getQuestionCurriculum(instId);
            setCurriculum(curriculumMap);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubjects = Object.entries(curriculum).filter(([subject, topics]) =>
        subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topics.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p className="font-medium">Discovering topics...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <Link to="/student/home" className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Return Home
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Understand <span className="text-primary-600">Mode</span>
                            <Sparkles className="text-primary-500 hidden sm:block" size={28} />
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Master concepts through structured conceptual guides.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {institutions.length > 1 && (
                            <select
                                value={selectedInstitution}
                                onChange={(e) => handleInstitutionChange(e.target.value)}
                                className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm shadow-slate-200/50"
                            >
                                {institutions.map(inst => (
                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                ))}
                            </select>
                        )}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search curriculum..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-600 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {filteredSubjects.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Quiet in the library...</h3>
                        <p className="text-slate-400 font-medium mt-2">No topics found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {filteredSubjects.map(([subject, topics], subjectIdx) => (
                            <motion.div
                                key={subject}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: subjectIdx * 0.05 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{subject}</h2>
                                    <div className="flex-1 h-px bg-slate-100"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {topics
                                        .filter(topic =>
                                            topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            subject.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((topic) => (
                                            <button
                                                key={topic.id}
                                                onClick={() => navigate(`/student/learn/${selectedInstitution}/topic/${topic.id}`)}
                                                className="group bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary-400 hover:shadow-xl hover:shadow-primary-600/5 transition-all text-left flex flex-col justify-between h-full relative overflow-hidden"
                                            >
                                                <div className="relative z-10">
                                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors mb-2 leading-tight">
                                                        {topic.name}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Structured Concept Guide
                                                    </p>
                                                </div>
                                                <div className="mt-8 flex items-center justify-between relative z-10">
                                                    <div className="bg-slate-50 text-slate-400 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                                                        Start Learning
                                                    </div>
                                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                                </div>

                                                {/* Decorative element */}
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity translate-x-12 -translate-y-12"></div>
                                            </button>
                                        ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentUnderstandTopics;
