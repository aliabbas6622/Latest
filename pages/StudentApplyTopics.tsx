import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { instituteService } from '../services/instituteService';
import { Zap, ArrowLeft, Search, Loader2, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentApplyTopics = () => {
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
                    <p className="font-medium">Preparing practice arena...</p>
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
                            Apply <span className="text-amber-600">Mode</span>
                            <Zap className="text-amber-500 hidden sm:block fill-amber-500" size={28} />
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Challenge yourself with adaptive practice sessions.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {institutions.length > 1 && (
                            <select
                                value={selectedInstitution}
                                onChange={(e) => handleInstitutionChange(e.target.value)}
                                className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
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
                                placeholder="Search practice sets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-slate-600 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {filteredSubjects.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Activity size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Arena is empty</h3>
                        <p className="text-slate-400 font-medium mt-2">No practice sets matching "{searchTerm}"</p>
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
                                                className="group bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-amber-400 hover:shadow-xl hover:shadow-amber-600/5 transition-all text-left flex flex-col justify-between h-full relative overflow-hidden"
                                            >
                                                <div className="relative z-10">
                                                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                        <Activity size={20} />
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-700 transition-colors mb-2 leading-tight">
                                                        {topic.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Adaptive Practice</span>
                                                    </div>
                                                </div>
                                                <div className="mt-8 flex items-center justify-between relative z-10">
                                                    <div className="text-amber-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        Enter Arena <ChevronRight size={16} className="group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>

                                                {/* Decorative background intensity */}
                                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
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

export default StudentApplyTopics;
