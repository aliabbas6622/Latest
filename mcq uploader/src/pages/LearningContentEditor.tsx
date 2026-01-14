import React, { useState, useEffect } from 'react';
import { StudyMaterial } from '../../types';
import MarkdownRenderer from '../components/MarkdownRenderer';
import SymbolKeyboard from '../components/SymbolKeyboard';
import { materialService } from '../services/materialService';
import { Save, Keyboard, Eye, EyeOff, BookOpen, ArrowLeft, UploadCloud, Download, X, FileText, CheckCircle, AlertCircle, Trash2, Edit, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Removing legacy any cast as we are now on React 19 compatible types

const LearningContentEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const query = new URLSearchParams(window.location.search);
    const mode = query.get('mode');

    const [formData, setFormData] = useState<Partial<StudyMaterial>>({
        subject: '',
        topic: '',
        title: '',
        content: '',
        summary: '',
        universityId: 'univ-1'
    });

    const [showPreview, setShowPreview] = useState(true);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);
    const [activeTab, setActiveTab] = useState<'write' | 'upload'>(mode === 'upload' && !id ? 'upload' : 'write');

    // Bulk Upload State
    const [uploadQueue, setUploadQueue] = useState<{ id: string; title: string; subject: string; topic: string; summary: string; content: string; file: File }[]>([]);
    const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
    const [isBulkSaving, setIsBulkSaving] = useState(false);

    useEffect(() => {
        if (id) {
            loadMaterial(id);
        }
    }, [id]);

    const loadMaterial = async (materialId: string) => {
        try {
            const data = await materialService.getMaterialById(materialId);
            if (data) {
                setFormData(data);
                if (data.content) setShowPreview(true);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load material");
        } finally {
            setIsLoading(false);
        }
    };

    const insertText = (textToInsert: string, isMath: boolean = true) => {
        const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content || '';

        // Wrap in $ only if isMath is true
        const finalInsert = isMath ? `$${textToInsert}$ ` : textToInsert;

        const newText = text.substring(0, start) + finalInsert + text.substring(end);
        setFormData({ ...formData, content: newText });

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + finalInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);

            // Ensure the cursor is visible
            const lineHeight = 20; // approximate
            const lines = text.substring(0, newCursorPos).split('\n').length;
            textarea.scrollTop = (lines * lineHeight) - (textarea.clientHeight / 2);
        }, 0);
    };

    const handleInsertSymbol = (symbol: string) => insertText(symbol, true);

    const handleFileUpload = () => {
        // Simulating file upload by asking for URL since we don't have a backend bucket ready yet
        // In a real app, this would open a file picker, upload to Supabase Storage, and get the URL
        const url = window.prompt("Enter the URL of the file or image (e.g. from Google Drive):");
        if (url) {
            const isImage = url.match(/\.(jpeg|jpg|gif|png)$/) != null;
            const markdown = isImage ? `\n![Image](${url})\n` : `\n[Download Attachment](${url})\n`;
            insertText(markdown, false);
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            if (id) {
                await materialService.updateMaterial(id, formData);
            } else {
                await materialService.createMaterial(formData as any);
            }
            navigate('/content');
        } catch (error: any) {
            console.error(error);
            alert("Failed to save content: " + (error.message || "Unknown error"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading editor...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/content')} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="font-bold text-lg text-gray-800">
                        {id ? 'Edit Content' : 'New Content'}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showPreview ? 'bg-primary/10 text-primary' : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {showPreview ? <><Eye size={16} /> Preview On</> : <><EyeOff size={16} /> Preview Off</>}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </div>

            {/* Mode Tabs */}
            {!id && (
                <div className="flex border-b border-gray-200 bg-gray-50/50">
                    <button
                        onClick={() => setActiveTab('write')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'write' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Write Content
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'upload' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Upload File (Markdown)
                    </button>
                </div>
            )}

            {/* Split View */}
            {activeTab === 'write' ? (
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Pane */}
                    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showPreview ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
                        {/* Metadata Fields */}
                        <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50 border-b border-gray-100">
                            <input
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="Subject (e.g. Mathematics)"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            />
                            <input
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="Topic (e.g. Calculus)"
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            />
                            <input
                                className="col-span-2 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none font-bold text-lg text-gray-700"
                                placeholder="Content Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Markdown Editor */}
                        <div className="flex-1 relative flex flex-col bg-white">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                <span>Markdown Source</span>
                                <button
                                    onClick={handleFileUpload}
                                    className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white transition-all hover:text-primary hover:shadow-sm"
                                >
                                    <UploadCloud size={14} /> Attach File
                                </button>
                                <button
                                    onClick={() => setShowKeyboard(!showKeyboard)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded hover:bg-white transition-all ${showKeyboard ? 'text-primary bg-white shadow-sm' : ''}`}
                                >
                                    <Keyboard size={14} /> Symbols
                                </button>
                            </div>
                            <textarea
                                id="markdown-editor"
                                className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed text-gray-800"
                                placeholder="# Start writing your content here..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />

                            {/* Summary Field */}
                            <div className="p-4 border-t border-gray-200 bg-amber-50/50">
                                <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                                    <BookOpen size={14} /> Quick Summary
                                </label>
                                <textarea
                                    className="w-full p-3 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                                    rows={2}
                                    placeholder="The core concept is..."
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                />
                            </div>

                            {/* Floating Keyboard Overlay */}
                            <AnimatePresence>
                                {showKeyboard && (
                                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
                                            onClick={() => setShowKeyboard(false)}
                                        />
                                        <SymbolKeyboard
                                            onInsert={handleInsertSymbol}
                                            onClose={() => setShowKeyboard(false)}
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Preview Pane */}
                    {showPreview && (
                        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
                            <div className="bg-gray-50 px-6 py-2 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold flex justify-between">
                                <span>Live Preview</span>
                                <span>Student View</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                                <h1 className="text-4xl font-serif font-black text-slate-900 mb-8">{formData.title || "Untitled Content"}</h1>
                                <MarkdownRenderer content={formData.content || ''} />
                                {formData.summary && (
                                    <div className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/10">
                                        <h5 className="font-bold text-primary mb-2 uppercase text-xs tracking-wider">Final Conclusion</h5>
                                        <p className="text-primary/80 italic">{formData.summary}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col">
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar Queue */}
                        <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={16} className="text-primary" /> Import Queue
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{uploadQueue.length} files pending</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {uploadQueue.map((item) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={item.id}
                                            onClick={() => setSelectedQueueId(item.id)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer group relative ${selectedQueueId === item.id
                                                ? 'bg-primary/10 border-primary border-2 shadow-sm'
                                                : 'bg-white border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className={`font-bold text-sm truncate ${selectedQueueId === item.id ? 'text-primary' : 'text-slate-700'}`}>
                                                        {item.title}
                                                    </p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">
                                                        {item.subject || 'Missing Subject'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUploadQueue(prev => prev.filter(q => q.id !== item.id));
                                                        if (selectedQueueId === item.id) setSelectedQueueId(null);
                                                    }}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            {(!item.subject || !item.topic) && (
                                                <div className="mt-2 flex items-center gap-1 text-amber-500 font-black text-[8px] uppercase tracking-widest">
                                                    <AlertCircle size={10} /> Needs Config
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {uploadQueue.length === 0 && (
                                    <div className="py-20 text-center px-4">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <UploadCloud size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">Your queue is empty.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <input
                                    type="file"
                                    id="bulk-file-upload"
                                    multiple
                                    className="hidden"
                                    accept=".md,.markdown,.txt"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        files.forEach(file => {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const text = ev.target?.result as string;
                                                const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
                                                const match = text.match(frontmatterRegex);
                                                let content = text;
                                                let meta: any = {};

                                                if (match) {
                                                    content = text.replace(frontmatterRegex, '');
                                                    const lines = match[1].split(/\r?\n/);
                                                    lines.forEach(line => {
                                                        const idx = line.indexOf(':');
                                                        if (idx !== -1) {
                                                            const key = line.substring(0, idx).trim().toLowerCase();
                                                            const val = line.substring(idx + 1).trim();
                                                            if (key) meta[key] = val;
                                                        }
                                                    });
                                                }

                                                const newItem = {
                                                    id: crypto.randomUUID(),
                                                    title: meta.title || file.name.replace('.md', ''),
                                                    subject: meta.subject || '',
                                                    topic: meta.topic || '',
                                                    summary: meta.summary || '',
                                                    content,
                                                    file
                                                };
                                                setUploadQueue(prev => [...prev, newItem]);
                                                if (uploadQueue.length === 0) setSelectedQueueId(newItem.id);
                                            };
                                            reader.readAsText(file);
                                        });
                                    }}
                                />
                                <button
                                    onClick={() => document.getElementById('bulk-file-upload')?.click()}
                                    className="w-full py-3 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add Files
                                </button>
                            </div>
                        </div>

                        {/* Detail/Edit Area */}
                        <div className="flex-1 bg-white flex flex-col">
                            {selectedQueueId ? (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800">Review Lesson</h2>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Editing item from queue</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => {
                                                    const item = uploadQueue.find(q => q.id === selectedQueueId);
                                                    if (item) {
                                                        setFormData({
                                                            title: item.title,
                                                            subject: item.subject,
                                                            topic: item.topic,
                                                            summary: item.summary,
                                                            content: item.content,
                                                            universityId: 'univ-1'
                                                        });
                                                        setActiveTab('write');
                                                    }
                                                }}
                                                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Edit size={14} /> Full Edit
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lesson Title</label>
                                                <input
                                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
                                                    value={uploadQueue.find(q => q.id === selectedQueueId)?.title || ''}
                                                    onChange={e => {
                                                        const newVal = e.target.value;
                                                        setUploadQueue(prev => prev.map(q => q.id === selectedQueueId ? { ...q, title: newVal } : q));
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                                <input
                                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all border-2 border-transparent focus:border-primary/20"
                                                    placeholder="e.g. Mathematics"
                                                    value={uploadQueue.find(q => q.id === selectedQueueId)?.subject || ''}
                                                    onChange={e => {
                                                        const newVal = e.target.value;
                                                        setUploadQueue(prev => prev.map(q => q.id === selectedQueueId ? { ...q, subject: newVal } : q));
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Quick Summary</label>
                                            <textarea
                                                rows={2}
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                                value={uploadQueue.find(q => q.id === selectedQueueId)?.summary || ''}
                                                onChange={e => {
                                                    const newVal = e.target.value;
                                                    setUploadQueue(prev => prev.map(q => q.id === selectedQueueId ? { ...q, summary: newVal } : q));
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Content Preview (Markdown)</label>
                                            <div className="w-full p-8 bg-slate-50 rounded-[2rem] text-sm text-slate-400 font-mono line-clamp-6 opacity-60">
                                                {uploadQueue.find(q => q.id === selectedQueueId)?.content.substring(0, 500)}...
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 border-t border-slate-100 flex justify-end">
                                        <button
                                            onClick={async () => {
                                                setIsBulkSaving(true);
                                                try {
                                                    const materialsToSave = uploadQueue.map(item => ({
                                                        title: item.title,
                                                        subject: item.subject,
                                                        topic: item.topic || 'General',
                                                        summary: item.summary,
                                                        content: item.content,
                                                        universityId: 'univ-1'
                                                    }));
                                                    await (materialService as any).bulkCreateMaterials(materialsToSave);
                                                    setUploadQueue([]);
                                                    setSelectedQueueId(null);
                                                    alert(`Imported ${materialsToSave.length} lessons!`);
                                                    navigate('/content');
                                                } catch (e: any) {
                                                    alert("Import failed: " + e.message);
                                                } finally {
                                                    setIsBulkSaving(false);
                                                }
                                            }}
                                            disabled={uploadQueue.length === 0 || isBulkSaving || uploadQueue.some(q => !q.subject)}
                                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {isBulkSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <CheckCircle size={18} />}
                                            Import All ({uploadQueue.length} items)
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                                    <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-primary/20">
                                        <UploadCloud size={64} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Markdown Import <span className="text-primary">Studio</span></h2>
                                    <p className="text-slate-500 max-w-md mx-auto mt-4 font-medium leading-relaxed">
                                        Select multiple files or drag them into the queue. We'll automatically parse your metadata for a seamless import.
                                    </p>
                                    <div className="mt-10 flex gap-4">
                                        <button
                                            onClick={() => document.getElementById('bulk-file-upload')?.click()}
                                            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Select Files
                                        </button>
                                        <button
                                            onClick={() => {
                                                const template = `---\ntitle: Sample Lesson\nsubject: Mathematics\ntopic: Algebra\nsummary: This is a brief summary of the lesson.\n---\n\n# Main Heading\n\nStart writing your content here.`;
                                                const blob = new Blob([template], { type: 'text/markdown' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a'); a.href = url; a.download = 'template.md'; a.click();
                                            }}
                                            className="bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                                        >
                                            <Download size={18} /> Template
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningContentEditor;
