import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    Plus, Trash2, Save, CheckCircle, ChevronRight, Image as ImageIcon,
    ArrowLeft, Sigma, AlertTriangle, Loader2, UploadCloud, Download,
    FileSpreadsheet, AlertCircle, RefreshCw, Eye, List, ShieldAlert,
    ArrowRight, CheckSquare, FileWarning, HelpCircle, X
} from 'lucide-react';
import { motion as motionOriginal, AnimatePresence } from 'framer-motion';
const motion = motionOriginal as any;
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Option, MCQ } from '../../types';
import * as XLSX from 'xlsx';
import { convertGoogleDriveLink, generateTemplate, parseExcelFile, validateAndTransformExcelData, ExcelValidationError } from '../../utils/excelHelper';
import { useAuth } from '../context/AuthContext';
import MathText from '../components/MathText';
import Skeleton from '../components/Skeleton';
import SymbolKeyboard from '../components/SymbolKeyboard';

interface FormValues {
    subject: string;
    topic: string;
    topicId: string;
    question: string;
    image_url: string;
    options: { text: string; is_correct: boolean }[];
    explanation: string;
    explanation_image_url: string;
    university_id: string;
}

const ImagePreview = ({ url, label }: { url: string; label: string }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setError(false);
        setLoading(true);
    }, [url]);

    if (!url) return null;
    const displayUrl = convertGoogleDriveLink(url);

    return (
        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 inline-block w-full max-w-md">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{label} Preview</p>
            {error ? (
                <div className="h-32 flex flex-col items-center justify-center text-red-400 bg-red-50 rounded-lg border border-red-100 p-4 text-center">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-bold">Unable to load image.</span>
                    <span className="text-[10px] mt-1">Check the URL or permissions.</span>
                </div>
            ) : (
                <div className="relative min-h-[100px] bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    )}
                    <img
                        src={displayUrl}
                        alt="Preview"
                        className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => setLoading(false)}
                        onError={() => { setLoading(false); setError(true); }}
                    />
                </div>
            )}
        </div>
    );
};

const UploadManagement = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [mode, setMode] = useState<'single' | 'bulk'>(isEditMode ? 'single' : 'single');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [institutes, setInstitutes] = useState<{ id: string; name: string }[]>([]);
    const [curriculum, setCurriculum] = useState<any[]>([]);
    const [availableTopics, setAvailableTopics] = useState<any[]>([]);

    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ExcelValidationError[]>([]);
    const [validQuestions, setValidQuestions] = useState<Omit<MCQ, 'id' | 'created_at'>[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'report' | 'preview'>('report');
    const [bulkUniversityId, setBulkUniversityId] = useState('all');
    const [templateConfig, setTemplateConfig] = useState({
        includeImages: true,
        includeExplanationImages: true,
        includeSubtopics: true
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showSymbols, setShowSymbols] = useState(false);
    const [activeField, setActiveField] = useState<{ name: string; element: HTMLTextAreaElement | HTMLInputElement } | null>(null);

    const isRestricted = !user?.can_upload && user?.role !== 'SUPER_ADMIN';

    const { register, control, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            subject: '',
            topic: '',
            topicId: '',
            question: '',
            image_url: '',
            options: [
                { text: '', is_correct: false },
                { text: '', is_correct: false }
            ],
            explanation: '',
            explanation_image_url: '',
            university_id: 'all'
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "options" });

    const watchSubject = watch('subject');
    const watchTopicId = watch('topicId');
    const watchImageUrl = watch('image_url');
    const watchExplanationImageUrl = watch('explanation_image_url');
    const watchQuestion = watch('question');

    useEffect(() => {
        const loadInitial = async () => {
            setIsLoading(true);
            try {
                const [instData, curriculumData, qData] = await Promise.all([
                    dbService.getInstitutes(),
                    dbService.getCurriculum(),
                    isEditMode && id ? dbService.getQuestion(id) : Promise.resolve(null)
                ]);

                setInstitutes(instData);
                setCurriculum(curriculumData);

                if (qData) {
                    setMode('single');
                    reset({
                        subject: qData.subject,
                        topic: qData.topic,
                        topicId: qData.topicId,
                        question: qData.question,
                        image_url: qData.image_url || '',
                        options: qData.options.map(o => ({ text: o.text, is_correct: o.is_correct })),
                        explanation: qData.explanation,
                        explanation_image_url: qData.explanation_image_url || '',
                        university_id: qData.university_id || 'all'
                    });

                    const sub = curriculumData.find((s: any) => s.name === qData.subject);
                    if (sub) setAvailableTopics(sub.topics || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitial();
    }, [id, isEditMode, reset]);

    useEffect(() => {
        if (watchSubject && curriculum.length > 0) {
            const sub = curriculum.find((s: any) => s.name === watchSubject);
            setAvailableTopics(sub ? sub.topics : []);
        }
    }, [watchSubject, curriculum]);

    const handleSubjectChange = (subjectName: string) => {
        setValue('subject', subjectName);
        setValue('topic', '');
        setValue('topicId', '');
    };

    const handleTopicChange = (topId: string) => {
        const top = availableTopics.find(t => t.id === topId);
        if (top) {
            setValue('topicId', topId);
            setValue('topic', top.name);
        }
    };

    const handleCorrectSelection = (index: number) => {
        const currentOptions = watch('options');
        const updatedOptions = currentOptions.map((opt, i) => ({
            ...opt,
            is_correct: i === index
        }));
        setValue('options', updatedOptions);
    };

    const handleUrlBlur = (field: 'image_url' | 'explanation_image_url') => {
        const currentVal = watch(field);
        if (currentVal) {
            const converted = convertGoogleDriveLink(currentVal);
            if (converted !== currentVal) setValue(field, converted);
        }
    };

    const handleInsertSymbol = (symbol: string) => {
        if (!activeField) return;
        const { name, element } = activeField;
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const value = watch(name as any) || '';
        const symbolToInsert = `$${symbol}$ `;

        const newValue = value.substring(0, start) + symbolToInsert + value.substring(end);
        setValue(name as any, newValue);

        setTimeout(() => {
            element.focus();
            const newCursorPos = start + symbolToInsert.length;
            element.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const onSingleSubmit = async (data: FormValues) => {
        if (!data.topicId) {
            alert("Please select a topic first.");
            return;
        }
        const hasCorrect = data.options.some(o => o.is_correct);
        if (!hasCorrect) {
            alert("Please mark one option as the correct answer.");
            return;
        }

        try {
            const formattedData = {
                question: data.question,
                image_url: convertGoogleDriveLink(data.image_url) || null,
                options: data.options.map(o => ({ ...o, id: crypto.randomUUID() })) as Option[],
                explanation: data.explanation,
                explanation_image_url: convertGoogleDriveLink(data.explanation_image_url) || null,
                subject: data.subject,
                topic: data.topic,
                topicId: data.topicId,
                university_id: data.university_id === 'all' ? null : data.university_id,
            };

            if (isEditMode && id) {
                await dbService.updateQuestion(id, formattedData);
                setSuccessMsg('Question updated successfully! Redirecting...');
                setTimeout(() => navigate('/bank'), 1500);
            } else {
                await dbService.insertQuestion(formattedData);
                setSuccessMsg('Question saved successfully!');
                reset({
                    subject: data.subject,
                    topic: data.topic,
                    topicId: data.topicId,
                    question: '',
                    image_url: '',
                    options: [{ text: '', is_correct: false }, { text: '', is_correct: false }],
                    explanation: '',
                    explanation_image_url: '',
                    university_id: data.university_id
                });
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            console.error(err);
            alert('Operation failed. Check permissions.');
        }
    };

    // Bulk (Simplified for now, will still use Excel but might need mapping logic later)
    const processFile = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setIsProcessing(true);
        try {
            const jsonData = await parseExcelFile(uploadedFile);
            const validTopicIds = new Set(curriculum.flatMap((s: any) => s.topics.map((t: any) => t.id)));
            const { valid, errors } = validateAndTransformExcelData(jsonData, validTopicIds);
            setValidQuestions(valid);
            setValidationErrors(errors);
            setActiveTab(errors.length === 0 && valid.length > 0 ? 'preview' : 'report');
        } catch (err) {
            console.error(err);
            alert("Error parsing file.");
            setFile(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportCurriculum = () => {
        const rows = curriculum.flatMap((s: any) =>
            s.topics.map((t: any) => ({
                'Subject Name': s.name,
                'Topic Name': t.name,
                'Topic ID': t.id
            }))
        );
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Curriculum");
        XLSX.writeFile(wb, "Aptivo_Curriculum_Reference.xlsx");
    };

    const handleBulkImport = async () => {
        if (!user?.can_upload && user?.role !== 'SUPER_ADMIN') {
            alert("Security Violation: You do not have permission to upload content.");
            return;
        }
        if (validQuestions.length === 0) return;
        setIsProcessing(true);
        try {
            const questionsWithUniv = validQuestions.map(q => ({
                ...q,
                university_id: bulkUniversityId === 'all' ? null : bulkUniversityId
            }));
            await dbService.bulkInsertQuestions(questionsWithUniv as MCQ[]);
            alert(`Imported ${validQuestions.length} questions!`);
            navigate('/bank');
        } catch (err) {
            console.error(err);
            alert("Import failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto pb-20 space-y-8 min-h-screen pt-10">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <div className="space-y-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (isRestricted) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <ShieldAlert size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Access <span className="text-red-500">Restricted</span></h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                    Your account does not have permission to upload or edit content. Please contact a Super Admin to request access.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="mb-10">
                {!isEditMode && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Upload <span className="text-teal-600">Questions</span></h2>
                            <p className="text-slate-500 font-medium mt-1">Structured curriculum integration active.</p>
                        </div>
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner relative w-full md:w-[320px]">
                            <motion.div
                                className="absolute bg-white shadow-md rounded-xl h-[calc(100%-12px)] z-0"
                                style={{ width: 'calc(50% - 6px)' }}
                                animate={{ x: mode === 'single' ? 0 : '100%' }}
                            />
                            <button onClick={() => setMode('single')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${mode === 'single' ? 'text-teal-700' : 'text-slate-400'}`}>
                                <Plus size={14} /> Single
                            </button>
                            <button onClick={() => setMode('bulk')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${mode === 'bulk' ? 'text-teal-700' : 'text-slate-400'}`}>
                                <UploadCloud size={14} /> Bulk
                            </button>
                        </div>
                    </div>
                )}
                {isEditMode && (
                    <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
                        <div>
                            <button onClick={() => navigate('/bank')} className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-teal-600 mb-2 uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> Back</button>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Edit <span className="text-teal-600">Question</span></h2>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {mode === 'single' ? (
                    <motion.div key="single" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto">
                        {successMsg && (
                            <div className="mb-8 bg-teal-50 border border-teal-100 text-teal-800 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-sm">
                                <CheckCircle className="w-6 h-6 text-teal-600" />
                                <span className="font-bold">{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSingleSubmit)} className="space-y-8">
                            <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Target Institute</label>
                                    <select {...register('university_id')} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 appearance-none">
                                        <option value="all">Global (All)</option>
                                        {institutes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Subject</label>
                                    <select
                                        {...register('subject', { required: true })}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 appearance-none"
                                    >
                                        <option value="">Select Subject</option>
                                        {curriculum.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Topic</label>
                                    <select
                                        {...register('topicId', { required: true })}
                                        onChange={(e) => handleTopicChange(e.target.value)}
                                        disabled={!watchSubject}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 appearance-none"
                                    >
                                        <option value="">Select Topic</option>
                                        {availableTopics.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/curriculum')} // Assuming this route exists or we create it
                                        className="mt-6 text-[9px] font-black text-teal-600 hover:underline uppercase tracking-widest"
                                    >
                                        Manage Topics
                                    </button>
                                </div>
                            </section>

                            {/* Rest of the form remains similar but connects to topicId */}
                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                                        <button type="button" onClick={() => setShowSymbols(!showSymbols)} className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest transition-all ${showSymbols ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}>Ω Symbols</button>
                                    </div>
                                    <textarea {...register('question', { required: true })} onFocus={(e) => setActiveField({ name: 'question', element: e.target })} rows={4} className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500/20" />
                                    {watchQuestion && <MathText imageUrl={watchImageUrl}>{watchQuestion}</MathText>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><ImageIcon size={14} className="inline mr-1" /> Image URL</label>
                                        <input {...register('image_url')} onBlur={() => handleUrlBlur('image_url')} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-700" />
                                        <ImagePreview url={watchImageUrl} label="Question" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><ImageIcon size={14} className="inline mr-1" /> Explanation Image</label>
                                        <input {...register('explanation_image_url')} onBlur={() => handleUrlBlur('explanation_image_url')} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-700" />
                                        <ImagePreview url={watchExplanationImageUrl} label="Explanation" />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-800">Options</h3>
                                    <button type="button" onClick={() => append({ text: '', is_correct: false })} disabled={fields.length >= 6} className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Add Option</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${watch(`options.${index}.is_correct`) ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <input type="radio" checked={watch(`options.${index}.is_correct`)} onChange={() => handleCorrectSelection(index)} className="w-5 h-5 accent-teal-600" />
                                            <input {...register(`options.${index}.text` as const, { required: true })} onFocus={(e) => setActiveField({ name: `options.${index}.text`, element: e.target })} className="bg-transparent border-none flex-1 text-sm font-bold text-slate-700 outline-none" placeholder={`Option ${String.fromCharCode(65 + index)}`} />
                                            {fields.length > 2 && <button type="button" onClick={() => remove(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Explanation</label>
                                <textarea {...register('explanation', { required: true })} onFocus={(e) => setActiveField({ name: 'explanation', element: e.target })} rows={3} className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 text-slate-700 font-medium mt-2" />
                            </section>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {isEditMode ? 'Update Question' : 'Save To Database'}
                                </button>
                                {!isEditMode && <button type="button" onClick={() => reset()} className="px-10 bg-slate-100 text-slate-400 py-5 rounded-3xl font-black text-sm uppercase tracking-widest">Clear</button>}
                            </div>

                            {showSymbols && (
                                <div className="fixed top-24 right-10 z-[100] w-full max-w-sm">
                                    <SymbolKeyboard onInsert={handleInsertSymbol} onClose={() => setShowSymbols(false)} />
                                </div>
                            )}
                        </form>
                    </motion.div>
                ) : (
                    <motion.div key="bulk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        {/* Bulk Upload Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Drop Zone */}
                                <div
                                    onDragOver={(e: any) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={(e: any) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative group h-72 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${dragActive ? 'bg-teal-50 border-teal-400' : 'bg-white border-slate-100 hover:border-teal-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls" onChange={(e: any) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <UploadCloud size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800">Drop Excel here</h3>
                                        <p className="text-slate-400 text-sm font-medium mt-1">or click to browse your library</p>
                                    </div>
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
                                            <span className="font-black text-slate-800 uppercase tracking-widest text-xs">Vetting Questions...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Results Area */}
                                {(validQuestions.length > 0 || validationErrors.length > 0) && (
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                                        <div className="flex border-b border-slate-50">
                                            <button onClick={() => setActiveTab('report')} className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'report' ? 'text-teal-600 bg-teal-50/50' : 'text-slate-400 hover:text-slate-600'}`}>Validation Report ({validationErrors.length})</button>
                                            <button onClick={() => setActiveTab('preview')} className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'text-teal-600 bg-teal-50/50' : 'text-slate-400 hover:text-slate-600'}`}>Ready to Import ({validQuestions.length})</button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-8 text-left">
                                            {activeTab === 'report' ? (
                                                <div className="space-y-4">
                                                    {validationErrors.length === 0 ? (
                                                        <div className="text-center py-10">
                                                            <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                                                            <h4 className="font-black text-slate-800">No issues found!</h4>
                                                            <p className="text-slate-400 text-sm">Switch to preview to import.</p>
                                                        </div>
                                                    ) : (
                                                        validationErrors.map((err, i) => (
                                                            <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${err.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                                                {err.type === 'error' ? <ShieldAlert size={20} /> : <FileWarning size={20} />}
                                                                <div>
                                                                    <div className="text-xs font-black uppercase tracking-widest mb-1">Row {err.row}</div>
                                                                    <div className="text-sm font-bold">{err.message}</div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {validQuestions.map((q, i) => (
                                                        <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="px-2 py-1 bg-white text-teal-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-teal-100">{q.subject}</span>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{q.topic}</span>
                                                            </div>
                                                            <p className="text-slate-800 font-bold leading-relaxed">{q.question}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {validQuestions.length > 0 && activeTab === 'preview' && (
                                            <div className="p-8 bg-slate-50 border-t border-slate-100">
                                                <button onClick={handleBulkImport} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10">Confirm & Save {validQuestions.length} Questions</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-8">
                                <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Assignment Institute</label>
                                    <select
                                        value={bulkUniversityId}
                                        onChange={(e) => setBulkUniversityId(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 appearance-none"
                                    >
                                        <option value="all">Global (All)</option>
                                        {institutes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </section>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left">
                                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 leading-tight">Preparation <span className="text-teal-600">Toolkit</span></h3>
                                    <p className="text-slate-400 text-sm font-medium mt-2 mb-8">Follow our structural requirements to ensure successful bulk imports.</p>

                                    <div className="space-y-4 text-left">
                                        <button onClick={() => generateTemplate(templateConfig)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-teal-100 hover:bg-white transition-all group">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-600 transition-colors text-left">Download Template</span>
                                            <Download size={16} className="text-slate-300 group-hover:text-teal-600 transition-all" />
                                        </button>
                                        <button onClick={handleExportCurriculum} className="w-full flex items-center justify-between p-4 bg-teal-50/50 rounded-2xl border border-teal-100 hover:border-teal-300 hover:bg-white transition-all group">
                                            <span className="text-xs font-black text-teal-600 uppercase tracking-widest transition-colors text-left">Export Curriculum IDs</span>
                                            <FileSpreadsheet size={16} className="text-teal-400 group-hover:text-teal-600 transition-all" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Strict Mode Active</h4>
                                            <p className="text-xs font-bold text-amber-700/80 leading-relaxed">Fuzzy matching has been disabled. Every row must include a valid <b>Topic ID</b> from our curriculum to be accepted.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadManagement;
