import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    ChevronRight,
    Book,
    LayoutGrid,
    Search,
    ChevronDown,
    AlertCircle,
    Loader2
} from 'lucide-react';
import Layout from '../components/Layout';
import { topicService, Subject, Topic } from '../services/topicService';

const SuperAdminTopics = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Record<string, Topic[]>>({});
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [newSubjectName, setNewSubjectName] = useState('');
    const [newTopicName, setNewTopicName] = useState('');
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [isAddingTopic, setIsAddingTopic] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        setLoading(true);
        try {
            const data = await topicService.getAllSubjects();
            setSubjects(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTopics = async (subjectId: string) => {
        try {
            const data = await topicService.getTopicsBySubject(subjectId);
            setTopics(prev => ({ ...prev, [subjectId]: data }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return;
        try {
            await topicService.createSubject(newSubjectName);
            setNewSubjectName('');
            setIsAddingSubject(false);
            loadSubjects();
        } catch (err) {
            alert('Error adding subject. It might already exist.');
        }
    };

    const handleAddTopic = async (subjectId: string) => {
        if (!newTopicName.trim()) return;
        try {
            await topicService.createTopic(newTopicName, subjectId);
            setNewTopicName('');
            setIsAddingTopic(false);
            loadTopics(subjectId);
        } catch (err) {
            alert('Error adding topic. It might already exist in this subject.');
        }
    };

    const handleDeleteTopic = async (id: string, subjectId: string) => {
        if (!window.confirm('Are you sure? This will unlinked all content from this topic.')) return;
        try {
            await topicService.deleteTopic(id);
            loadTopics(subjectId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!window.confirm('Delete subject and all its topics?')) return;
        try {
            await topicService.deleteSubject(id);
            loadSubjects();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-10 px-6">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Curriculum Architect</h1>
                        <p className="text-slate-500 font-medium">Define subjects and topics that drive Learn and Practice modes.</p>
                    </div>
                    <button
                        onClick={() => setIsAddingSubject(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={20} />
                        ADD SUBJECT
                    </button>
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900/5 outline-none font-medium text-slate-600 transition-all shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {isAddingSubject && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-primary-50 border-2 border-primary-200 p-6 rounded-[2rem] flex flex-col gap-4 shadow-xl"
                            >
                                <div className="p-3 bg-white/50 rounded-2xl w-fit">
                                    <Book className="text-primary-600" size={24} />
                                </div>
                                <input
                                    autoFocus
                                    placeholder="Enter subject name..."
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                    className="bg-white px-4 py-3 rounded-xl border border-primary-100 outline-none font-bold text-slate-900 placeholder:text-primary-300"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddSubject}
                                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold text-sm"
                                    >
                                        SAVE
                                    </button>
                                    <button
                                        onClick={() => setIsAddingSubject(false)}
                                        className="px-4 py-3 border border-primary-100 text-primary-600 font-bold text-sm rounded-xl"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {filteredSubjects.map(subject => (
                        <motion.div
                            key={subject.id}
                            layout
                            className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl transition-all group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (selectedSubject === subject.id) {
                                            setSelectedSubject(null);
                                        } else {
                                            setSelectedSubject(subject.id);
                                            if (!topics[subject.id]) loadTopics(subject.id);
                                        }
                                    }}
                                >
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                                        {subject.name}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                        {(topics[subject.id]?.length || 0)} Topics Available
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteSubject(subject.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <AnimatePresence>
                                {selectedSubject === subject.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-2 mb-4">
                                            {topics[subject.id]?.map(topic => (
                                                <div
                                                    key={topic.id}
                                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group/item"
                                                >
                                                    <span className="font-bold text-sm text-slate-700">{topic.name}</span>
                                                    <button
                                                        onClick={() => handleDeleteTopic(topic.id, subject.id)}
                                                        className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}

                                            {isAddingTopic ? (
                                                <div className="mt-4 flex flex-col gap-2">
                                                    <input
                                                        autoFocus
                                                        placeholder="Topic name..."
                                                        value={newTopicName}
                                                        onChange={e => setNewTopicName(e.target.value)}
                                                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAddTopic(subject.id)}
                                                            className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold"
                                                        >
                                                            ADD
                                                        </button>
                                                        <button
                                                            onClick={() => setIsAddingTopic(false)}
                                                            className="px-3 py-2 text-slate-400 font-bold text-xs"
                                                        >
                                                            CANCEL
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsAddingTopic(true)}
                                                    className="w-full py-3 mt-2 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 font-bold text-xs flex items-center justify-center gap-2 hover:border-slate-200 hover:text-slate-500 transition-all"
                                                >
                                                    <Plus size={14} />
                                                    NEW TOPIC
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!selectedSubject && (
                                <button
                                    onClick={() => {
                                        setSelectedSubject(subject.id);
                                        if (!topics[subject.id]) loadTopics(subject.id);
                                    }}
                                    className="mt-auto w-full py-3 bg-slate-50 rounded-2xl text-slate-500 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                                >
                                    REVEAL TOPICS
                                    <ChevronDown size={14} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <Loader2 className="animate-spin mr-2" />
                        <span className="font-bold">Syncing Curriculum...</span>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SuperAdminTopics;
