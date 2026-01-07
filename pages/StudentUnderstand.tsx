import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/mockBackend';
import { StudyMaterial } from '../types';
import { ArrowLeft, Zap, BookOpen } from 'lucide-react';

const StudentUnderstand = () => {
    const { univId, materialId } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState<StudyMaterial | undefined>();

    useEffect(() => {
        if (materialId) {
            setMaterial(db.getMaterial(materialId));
        }
    }, [materialId]);

    if (!material) return <Layout><div>Loading content...</div></Layout>;

    return (
        <Layout>


            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 pb-20">
                {/* Main Content */}
                <div className="flex-1 max-w-3xl">
                    <div className="mb-10 pt-4">
                        <button
                            onClick={() => navigate(`/student/university/${univId}`)}
                            className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm transition-colors mb-8 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Exit to Curriculum
                        </button>

                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">{material.subject} &mdash; {material.topic}</h4>
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight">{material.title}</h1>
                        </div>
                    </div>

                    <article className="bg-white p-8 md:p-14 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
                        {/* Reading Content */}
                        <div
                            className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-serif selection:bg-primary-100"
                            dangerouslySetInnerHTML={{ __html: material.content }}
                        />

                        {/* Summary Box (Bottom) */}
                        {material.summary && (
                            <div className="mt-16 p-8 bg-primary-50 rounded-2xl border border-primary-100 relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <BookOpen size={64} />
                                </div>
                                <h5 className="flex items-center gap-2 font-bold text-primary-900 mb-4 uppercase tracking-wider text-xs">
                                    <BookOpen size={16} className="text-primary-500" />
                                    Final Conclusion
                                </h5>
                                <p className="text-primary-800 italic leading-relaxed text-lg">{material.summary}</p>
                            </div>
                        )}
                    </article>

                    {/* Mobile Only Practice Button */}
                    <div className="mt-12 text-center lg:hidden">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Mastered this concept?</h3>
                        <p className="text-slate-500 mb-8">Test your speed and accuracy in Apply mode.</p>
                        <button
                            onClick={() => navigate(`/student/learn/${univId}/apply/${encodeURIComponent(material.topic)}`)}
                            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl group"
                        >
                            Start Practice Session
                            <Zap size={20} className="text-amber-400 group-hover:text-amber-900" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Info (Desktop Only) */}
                <aside className="hidden lg:block w-80 space-y-8 sticky top-28 h-fit animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
                        <h4 className="relative z-10 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Quick Review</h4>
                        <div className="relative z-10 space-y-4">
                            <p className="text-[15px] text-slate-600 leading-relaxed font-medium italic border-l-4 border-primary-500 pl-5 bg-slate-50 py-4 rounded-r-2xl">
                                {material.summary || "Focus on the core definitions and the provided examples to build a strong foundation."}
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform">
                                <Zap className="text-amber-400" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 tracking-tight">Ready to Practice?</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Solidify your understanding through active practice and instant feedback.</p>
                            <button
                                onClick={() => navigate(`/student/learn/${univId}/apply/${encodeURIComponent(material.topic)}`)}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black transition-all hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20"
                            >
                                START DRILLS <Zap size={18} fill="currentColor" />
                            </button>
                        </div>
                    </div>


                </aside>
            </div>
        </Layout>
    );
};

export default StudentUnderstand;