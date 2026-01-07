import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { instituteService } from '../services/instituteService';
import { Zap, ArrowLeft, Search, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopicData {
    hasMaterial: boolean;
    hasQuestions: boolean;
    questionCount?: number;
}

const StudentApplyTopics = () => {
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [curriculum, setCurriculum] = useState<Record<string, Record<string, TopicData>>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Get all institutions
                const insts = await instituteService.getAllInstitutes();
                setInstitutions(insts);

                if (insts.length > 0) {
                    setSelectedInstitution(insts[0].id);
                    const questionMap = await questionService.getQuestionCurriculum(insts[0].id);

                    const newCurriculum: Record<string, Record<string, TopicData>> = {};
                    Object.entries(questionMap).forEach(([subject, topics]) => {
                        newCurriculum[subject] = {};
                        (topics as string[]).forEach(topic => {
                            newCurriculum[subject][topic] = {
                                hasMaterial: false,
                                hasQuestions: true
                            };
                        });
                    });
                    setCurriculum(newCurriculum);
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
            const questionMap = await questionService.getQuestionCurriculum(instId);
            const newCurriculum: Record<string, Record<string, TopicData>> = {};
            Object.entries(questionMap).forEach(([subject, topics]) => {
                newCurriculum[subject] = {};
                (topics as string[]).forEach(topic => {
                    newCurriculum[subject][topic] = {
                        hasMaterial: false,
                        hasQuestions: true
                    };
                });
            });
            setCurriculum(newCurriculum);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p className="font-medium">Loading practice sets...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8">
                <Link to="/student/home" className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm mb-4 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Apply Mode</h1>
                        <p className="text-slate-500">Select a topic to practice questions and track your accuracy.</p>
                    </div>
                </div>
            </div>

            {/* Institution Selector */}
            {institutions.length > 1 && (
                <div className="mb-6">
                    <select
                        value={selectedInstitution}
                        onChange={(e) => handleInstitutionChange(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-8 flex items-center gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search for topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all font-medium"
                    />
                </div>
            </div>

            {Object.keys(curriculum).length === 0 && (
                <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                    No practice questions available yet.
                </div>
            )}

            {/* Topics Grid */}
            <div className="grid gap-8">
                {Object.entries(curriculum)
                    .filter(([subject, topics]) =>
                        subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        Object.keys(topics).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map(([subject, topics], subjectIdx) => (
                        <motion.div
                            key={subject}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: subjectIdx * 0.1 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-1 bg-primary-600 rounded-full"></div>
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{subject}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(topics)
                                    .filter(([topic]) =>
                                        topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        subject.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map(([topic, data]) => (
                                        <button
                                            key={topic}
                                            disabled={!data.hasQuestions}
                                            onClick={() => navigate(`/student/learn/${selectedInstitution}/apply/${encodeURIComponent(topic)}`)}
                                            className={`group bg-white p-6 rounded-2xl border shadow-sm text-left transition-all ${data.hasQuestions
                                                ? 'border-slate-200 hover:border-primary-300 hover:shadow-md cursor-pointer'
                                                : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                                                }`}
                                        >
                                            <h3 className={`font-bold mb-2 transition-colors ${data.hasQuestions
                                                ? 'text-slate-900 group-hover:text-primary-600'
                                                : 'text-slate-400'
                                                }`}>
                                                {topic}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-medium ${data.hasQuestions ? 'text-primary-600' : 'text-slate-400'
                                                    }`}>
                                                    {data.hasQuestions ? 'Practice Available' : 'No Questions'}
                                                </span>
                                                {data.hasQuestions && (
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </motion.div>
                    ))}
            </div>
        </Layout>
    );
};

export default StudentApplyTopics;
