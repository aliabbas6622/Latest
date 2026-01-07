import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { instituteService } from '../services/instituteService';
import { University } from '../types';
import { BookOpen, Zap, ArrowLeft, Layers, Info, Loader2, Search } from 'lucide-react';

const StudentCurriculum = () => {
    const { univId } = useParams();
    const navigate = useNavigate();
    const [university, setUniversity] = useState<University | undefined>();
    const [curriculum, setCurriculum] = useState<Record<string, Record<string, { hasMaterial: boolean, hasQuestions: boolean, materialId?: string }>>>({});

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const load = async () => {
            if (univId) {
                setLoading(true);
                try {
                    // Fetch real university details
                    const univData = await instituteService.getInstituteById(univId);
                    if (univData) {
                        // Map Institution to University interface
                        setUniversity({
                            id: univData.id,
                            name: univData.name,
                            location: 'Location TBD', // These fields could be added to DB if needed
                            unlockedForIds: []
                        });
                    }


                    const questionMap = await questionService.getQuestionCurriculum(univId);

                    // Transform to the expected structure
                    const newCurriculum: any = {};
                    Object.entries(questionMap).forEach(([subject, topics]) => {
                        newCurriculum[subject] = {};
                        topics.forEach(topic => {
                            newCurriculum[subject][topic] = {
                                hasMaterial: false, // Placeholder until materialService
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
            }
        };
        load();
    }, [univId]);

    if (loading) return <Layout><div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400"><Loader2 size={40} className="animate-spin mb-4" />Loading curriculum...</div></Layout>;

    return (
        <Layout>
            <div className="mb-8">
                <Link to="/student/dashboard" className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm mb-4">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">{university?.name}</h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                    Choose your learning path. <span className="font-semibold text-primary-600">Understand</span> for concepts and examples. <span className="font-semibold text-amber-600">Apply</span> for active practice and feedback.
                </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-8 flex items-center gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search for topics or subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
                    />
                </div>
            </div>

            {Object.keys(curriculum).length === 0 && (
                <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                    No content available for this university yet.
                </div>
            )}

            <div className="grid gap-10">
                {Object.entries(curriculum)
                    .filter(([subject, topics]) =>
                        subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        Object.keys(topics).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map(([subject, topics]) => (
                        <div key={subject}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-1 bg-slate-900 rounded-full"></div>
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{subject}</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(topics)
                                    .filter(([topic]) =>
                                        topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        subject.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map(([topic, available]) => (
                                        <div key={topic} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
                                            {/* Topic Label */}
                                            <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 flex flex-col justify-center">
                                                <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-600 transition-colors">{topic}</h3>
                                                <div className="mt-2 flex gap-2">
                                                    {available.hasMaterial && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                                                    {available.hasQuestions && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                                                {/* Understand Action */}
                                                <div className="p-6 flex flex-col items-start justify-between hover:bg-primary-50/30 transition-all duration-300 group/u">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 rounded-lg bg-primary-100 text-primary-600 group-hover/u:bg-primary-600 group-hover/u:text-white transition-all">
                                                                <BookOpen size={18} />
                                                            </div>
                                                            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Understand Mode</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Master concepts with study materials and examples.</p>
                                                    </div>

                                                    {available.hasMaterial ? (
                                                        <button
                                                            onClick={() => navigate(`/student/learn/${univId}/understand/${available.materialId}`)}
                                                            className="w-full py-2.5 rounded-xl border-2 border-primary-200 bg-white text-primary-700 font-bold hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all text-sm shadow-sm"
                                                        >
                                                            Start Reading
                                                        </button>
                                                    ) : (
                                                        <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold text-center border border-slate-200">
                                                            COMING SOON
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Apply Action */}
                                                <div className="p-6 flex flex-col items-start justify-between hover:bg-amber-50/30 transition-all duration-300 group/a">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 group-hover/a:bg-amber-500 group-hover/a:text-white transition-all">
                                                                <Zap size={18} />
                                                            </div>
                                                            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Apply Mode</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Solve MCQs and track your accuracy with drills.</p>
                                                    </div>

                                                    {available.hasQuestions ? (
                                                        <button
                                                            onClick={() => navigate(`/student/learn/${univId}/apply/${encodeURIComponent(topic)}`)}
                                                            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-amber-500 hover:text-slate-900 transition-all shadow-md text-sm border border-slate-900 hover:border-amber-400"
                                                        >
                                                            Practice Now
                                                        </button>
                                                    ) : (
                                                        <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold text-center border border-slate-200">
                                                            NO QUESTIONS
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
            </div>
        </Layout>
    );
};

export default StudentCurriculum;