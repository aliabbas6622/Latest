import React, { useEffect, useState } from 'react';
import { materialService } from '../services/materialService';
import { StudyMaterial } from '../../types';
import { Edit2, Trash2, Search, Plus, Filter, FileText, UploadCloud, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion as motionOriginal, AnimatePresence } from 'framer-motion';
const motion = motionOriginal as any;

const LearningContentList = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        setLoading(true);
        try {
            const data = await materialService.getAllMaterials();
            setMaterials(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this content?')) {
            try {
                await materialService.deleteMaterial(id);
                loadMaterials();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const filtered = materials.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.topic.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: materials.length,
        subjects: new Set(materials.map(m => m.subject)).size,
        topics: new Set(materials.map(m => m.topic)).size,
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="flex justify-between items-end">
                    <div className="space-y-3">
                        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
                        <div className="h-6 w-48 bg-slate-100 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2rem]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black font-heading text-slate-800 tracking-tight">Content <span className="text-primary">Library</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Design and manage high-quality learning modules.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/content/add?mode=upload')}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm group"
                    >
                        <UploadCloud size={18} className="group-hover:scale-110 transition-transform" /> Bulk Import
                    </button>
                    <button
                        onClick={() => navigate('/content/add')}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Create Lesson
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Materials', value: stats.total, icon: FileText, color: 'text-blue-500' },
                    { label: 'Active Subjects', value: stats.subjects, icon: BookOpen, color: 'text-teal-500' },
                    { label: 'Unique Topics', value: stats.topics, icon: Filter, color: 'text-indigo-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={24} />
                <input
                    type="text"
                    placeholder="Search by title, subject or topic..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-[2rem] pl-16 pr-8 py-5 text-slate-700 font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm placeholder:text-slate-300"
                />
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filtered.map((material, idx) => (
                        <motion.div
                            key={material.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(`/content/edit/${material.id}`)}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 relative overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-primary/10 transition-colors duration-500" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-4 py-1.5 rounded-full bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {material.subject}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/content/edit/${material.id}`); }}
                                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(material.id, e)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-primary transition-colors">
                                    {material.title}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                                    {material.summary || "Explore the core concepts of " + material.topic + " in this detailed lesson."}
                                </p>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-100 text-[10px] font-black text-slate-500 px-3 py-1 rounded-lg uppercase tracking-wider">
                                            {material.topic}
                                        </div>
                                    </div>
                                    <div className="text-primary group-hover:translate-x-1 transition-transform">
                                        <ArrowLeft className="rotate-180" size={20} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">No matching content</h3>
                        <p className="text-slate-400 font-medium mt-2">Try adjusting your search or create a new lesson.</p>
                        <button
                            onClick={() => setSearch('')}
                            className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningContentList;
