import React, { useState, useEffect } from 'react';
import { StudyMaterial } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import SymbolKeyboard from '../SymbolKeyboard';
import { Save, Keyboard, Eye, EyeOff, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { topicService, Subject, Topic } from '../../services/topicService';

interface LearningContentEditorProps {
    initialData?: StudyMaterial | null;
    onSave: (data: Partial<StudyMaterial>) => Promise<void>;
    onCancel: () => void;
}

const LearningContentEditor: React.FC<LearningContentEditorProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<StudyMaterial>>({
        subject: '',
        topic: '',
        topicId: '',
        title: '',
        content: '',
        summary: '',
        universityId: 'univ-1' // Default for now
    });

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
    const [loadingCurriculum, setLoadingCurriculum] = useState(true);

    const [showPreview, setShowPreview] = useState(true);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadCurriculum = async () => {
            setLoadingCurriculum(true);
            try {
                const subs = await topicService.getAllSubjects();
                setSubjects(subs);

                if (initialData) {
                    setFormData(initialData);
                    if (initialData.subject) {
                        const sub = subs.find(s => s.name === initialData.subject);
                        if (sub) {
                            const tops = await topicService.getTopicsBySubject(sub.id);
                            setAvailableTopics(tops);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingCurriculum(false);
            }
        };
        loadCurriculum();
    }, [initialData]);

    const handleSubjectChange = async (subjectName: string) => {
        const sub = subjects.find(s => s.name === subjectName);
        setFormData({ ...formData, subject: subjectName, topic: '', topicId: '' });
        if (sub) {
            const tops = await topicService.getTopicsBySubject(sub.id);
            setAvailableTopics(tops);
        } else {
            setAvailableTopics([]);
        }
    };

    const handleTopicChange = (topicId: string) => {
        const top = availableTopics.find(t => t.id === topicId);
        if (top) {
            setFormData({ ...formData, topicId, topic: top.name });
        }
    };

    const handleInsertSymbol = (symbol: string) => {
        const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content || '';
        const toInsert = `$${symbol}$ `;

        const newText = text.substring(0, start) + toInsert + text.substring(end);
        setFormData({ ...formData, content: newText });

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + toInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.topicId) {
            alert("Please select a topic first.");
            return;
        }
        setIsSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
            alert("Failed to save content");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="font-bold text-lg text-slate-800">
                        {initialData ? 'Edit Content' : 'New Content'}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showPreview ? 'bg-primary-50 text-primary-700' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                        {showPreview ? <><Eye size={16} /> Preview On</> : <><EyeOff size={16} /> Preview Off</>}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || loadingCurriculum}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showPreview ? 'w-1/2 border-r border-slate-200' : 'w-full'}`}>
                    <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                            <select
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-700"
                                value={formData.subject}
                                onChange={e => handleSubjectChange(e.target.value)}
                                disabled={loadingCurriculum}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Topic</label>
                            <select
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-700"
                                value={formData.topicId}
                                onChange={e => handleTopicChange(e.target.value)}
                                disabled={!formData.subject || loadingCurriculum}
                            >
                                <option value="">Select Topic</option>
                                {availableTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <input
                            className="col-span-2 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-lg text-slate-700"
                            placeholder="Content Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="flex-1 relative flex flex-col">
                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider font-semibold">
                            <span>Markdown Source</span>
                            <button
                                onClick={() => setShowKeyboard(!showKeyboard)}
                                className={`flex items-center gap-2 px-3 py-1 rounded hover:bg-white transition-all ${showKeyboard ? 'text-primary-600 bg-white shadow-sm' : ''}`}
                            >
                                <Keyboard size={14} /> Symbols
                            </button>
                        </div>
                        <textarea
                            id="markdown-editor"
                            className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed text-slate-800"
                            placeholder="# Start writing your content here..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />

                        <div className="p-4 border-t border-slate-200 bg-amber-50/50">
                            <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                                <BookOpen size={14} /> Quick Summary / Key Takeaway
                            </label>
                            <textarea
                                className="w-full p-3 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                                rows={2}
                                placeholder="The core concept is..."
                                value={formData.summary}
                                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                            />
                        </div>

                        {showKeyboard && (
                            <div className="absolute bottom-6 right-6 z-50">
                                <SymbolKeyboard
                                    onInsert={handleInsertSymbol}
                                    onClose={() => setShowKeyboard(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {showPreview && (
                    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
                        <div className="bg-slate-50 px-6 py-2 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-semibold flex justify-between">
                            <span>Live Preview</span>
                            <span>Student View</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12">
                            <h1 className="text-4xl font-serif font-black text-slate-900 mb-8">{formData.title || "Untitled Content"}</h1>
                            <MarkdownRenderer content={formData.content || ''} />

                            {formData.summary && (
                                <div className="mt-12 p-6 bg-primary-50 rounded-xl border border-primary-100">
                                    <h5 className="font-bold text-primary-900 mb-2 uppercase text-xs tracking-wider">Final Conclusion</h5>
                                    <p className="text-primary-800 italic">{formData.summary}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {loadingCurriculum && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            )}
        </div>
    );
};

export default LearningContentEditor;
