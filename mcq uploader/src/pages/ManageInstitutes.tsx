import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Building2, Globe, Mail, Loader2, Search, Save as SaveIcon, X, Settings, BookOpen, ChevronRight as ChevronIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBJECTS } from '../../constants';

const ManageInstitutes = () => {
    const [institutes, setInstitutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
    const [selectedInst, setSelectedInst] = useState<any>(null);
    const [editCurriculum, setEditCurriculum] = useState<any>({});

    // Form state
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await dbService.getAllInstitutesFull();
            setInstitutes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setIsSaving(true);
        try {
            const { error } = await dbService.createInstitute(name, domain, email);
            if (error) throw error;

            // Success
            setName('');
            setDomain('');
            setEmail('');
            setIsAddOpen(false);
            load();
        } catch (err: any) {
            alert('Failed to add institute: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this institute? This may affect linked questions.')) return;

        try {
            const { error } = await dbService.deleteInstitute(id);
            if (error) throw error;
            load();
        } catch (err: any) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const handleOpenCurriculum = (inst: any) => {
        setSelectedInst(inst);
        setEditCurriculum(inst.curriculum || {});
        setIsCurriculumOpen(true);
    };

    const toggleSubject = (subjValue: string) => {
        const newCurr = { ...editCurriculum };
        if (newCurr[subjValue]) {
            delete newCurr[subjValue];
        } else {
            const subj = SUBJECTS.find(s => s.value === subjValue);
            newCurr[subjValue] = subj?.topics || [];
        }
        setEditCurriculum(newCurr);
    };

    const toggleTopic = (subjValue: string, topic: string) => {
        const newCurr = { ...editCurriculum };
        if (!newCurr[subjValue]) newCurr[subjValue] = [];

        if (newCurr[subjValue].includes(topic)) {
            newCurr[subjValue] = newCurr[subjValue].filter((t: string) => t !== topic);
            if (newCurr[subjValue].length === 0) delete newCurr[subjValue];
        } else {
            newCurr[subjValue] = [...newCurr[subjValue], topic];
        }
        setEditCurriculum(newCurr);
    };

    const handleSaveCurriculum = async () => {
        if (!selectedInst) return;
        setIsSaving(true);
        try {
            const { error } = await dbService.updateCurriculum(selectedInst.id, editCurriculum);
            if (error) throw error;
            setIsCurriculumOpen(false);
            load();
        } catch (err: any) {
            alert('Failed to save curriculum: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = institutes.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-textMain tracking-tight">Manage Institutions</h2>
                    <p className="text-textSecondary mt-2 text-base md:text-lg">Add and manage authorized universities.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-teal-950 px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} /> Add University
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-border flex items-center gap-4 shadow-soft">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or domain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <div className="hidden sm:block text-sm font-bold text-teal-800 bg-primary/20 px-4 py-2 rounded-full">
                    {filtered.length} Universities
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 size={40} className="animate-spin mb-4 text-primary" />
                    <p className="font-bold">Loading institutions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filtered.map((inst) => (
                            <motion.div
                                key={inst.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-2xl border border-border shadow-soft hover:shadow-md transition-all relative group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenCurriculum(inst)}
                                        className="p-2 text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Manage Curriculum"
                                    >
                                        <Settings size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(inst.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete University"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-teal-900 border border-primary/20 shadow-inner">
                                        <Building2 size={28} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-textMain text-lg truncate leading-tight">{inst.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-teal-800 bg-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {inst.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-textSecondary bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <Globe size={16} className="text-primary flex-shrink-0" />
                                        <span className="font-medium truncate">{inst.domain || 'No domain'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-textSecondary bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <Mail size={16} className="text-primary flex-shrink-0" />
                                        <span className="font-medium truncate">{inst.official_email || 'No email'}</span>
                                    </div>
                                    <button
                                        onClick={() => handleOpenCurriculum(inst)}
                                        className="w-full flex items-center justify-between text-xs font-bold text-teal-800 bg-primary/10 hover:bg-primary/20 p-3 rounded-xl border border-primary/10 transition-all group/btn"
                                    >
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={14} />
                                            Curriculum Mapping
                                        </div>
                                        <ChevronIcon size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>ID: {inst.id.split('-')[0]}...</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                        Active
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-teal-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-extrabold text-textMain font-heading tracking-tight">Add University</h2>
                                    <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>
                                <form onSubmit={handleAdd} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-textSecondary mb-2 uppercase tracking-widest">University Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Stanford University"
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none font-medium transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-textSecondary mb-2 uppercase tracking-widest">Domain (Optional)</label>
                                        <input
                                            type="text"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            placeholder="e.g. stanford.edu"
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none font-medium transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-textSecondary mb-2 uppercase tracking-widest">Official Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@stanford.edu"
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none font-medium transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddOpen(false)}
                                            className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving || !name}
                                            className="flex-[1.5] px-8 py-4 bg-primary text-teal-950 rounded-2xl font-bold hover:bg-primaryHover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <SaveIcon size={18} />}
                                            Save University
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Curriculum Modal */}
            <AnimatePresence>
                {isCurriculumOpen && selectedInst && (
                    <div className="fixed inset-0 bg-teal-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-textMain font-heading tracking-tight">Content Mapping</h2>
                                        <p className="text-sm text-textSecondary mt-1 font-medium">{selectedInst.name}</p>
                                    </div>
                                    <button onClick={() => setIsCurriculumOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                    {SUBJECTS.map((subj) => (
                                        <div key={subj.value} className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!editCurriculum[subj.value]}
                                                        onChange={() => toggleSubject(subj.value)}
                                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    <span className="font-bold text-textMain uppercase tracking-wide text-sm">{subj.label}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                                                {subj.topics.map((topic) => (
                                                    <label key={topic} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${editCurriculum[subj.value]?.includes(topic) ? 'bg-primary/20 border-primary/30 text-teal-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 opacity-60'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={editCurriculum[subj.value]?.includes(topic)}
                                                            onChange={() => toggleTopic(subj.value, topic)}
                                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-xs font-bold">{topic}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 pt-8 mt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsCurriculumOpen(false)}
                                        className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveCurriculum}
                                        disabled={isSaving}
                                        className="flex-[1.5] px-8 py-4 bg-primary text-teal-950 rounded-2xl font-bold hover:bg-primaryHover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <SaveIcon size={18} />}
                                        Apply Curriculum
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageInstitutes;
