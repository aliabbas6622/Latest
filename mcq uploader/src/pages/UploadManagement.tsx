import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    Plus, Trash2, Save, CheckCircle, ChevronRight, Image as ImageIcon,
    ArrowLeft, Sigma, AlertTriangle, Loader2, UploadCloud, Download,
    FileSpreadsheet, AlertCircle, RefreshCw, Eye, List, ShieldAlert,
    ArrowRight, CheckSquare, FileWarning, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { SUBJECTS } from '../../constants';
import { dbService } from '../services/dbService';
import { Option, MCQ } from '../../types';
import { convertGoogleDriveLink, generateTemplate, parseExcelFile, validateAndTransformExcelData, ExcelValidationError } from '../../utils/excelHelper';
import MathText from '../components/MathText';
import Skeleton from '../components/Skeleton';
import SymbolKeyboard from '../components/SymbolKeyboard';

interface FormValues {
    subject: string;
    topic: string;
    question: string;
    image_url: string;
    options: { text: string; is_correct: boolean }[];
    explanation: string;
    explanation_image_url: string;
    university_id: string;
}

// Helper component for Image Preview
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
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Mode toggle: 'single' or 'bulk'
    const [mode, setMode] = useState<'single' | 'bulk'>(isEditMode ? 'single' : 'single');

    // Single Upload States
    const [successMsg, setSuccessMsg] = useState('');
    const [dailyCount, setDailyCount] = useState(0);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [institutes, setInstitutes] = useState<{ id: string; name: string }[]>([]);

    // Bulk Upload States
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

    // Symbol Keyboard State
    const [showSymbols, setShowSymbols] = useState(false);
    const [activeField, setActiveField] = useState<{ name: string; element: HTMLTextAreaElement | HTMLInputElement } | null>(null);

    const { register, control, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            subject: '',
            topic: '',
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options"
    });

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [instData, questionData] = await Promise.all([
                    dbService.getInstitutes(),
                    isEditMode && id ? dbService.getQuestion(id) : Promise.resolve(null)
                ]);

                setInstitutes(instData);

                if (questionData) {
                    setMode('single'); // Force single mode on edit
                    reset({
                        subject: questionData.subject,
                        topic: questionData.topic,
                        question: questionData.question,
                        image_url: questionData.image_url || '',
                        options: questionData.options.map(o => ({ text: o.text, is_correct: o.is_correct })),
                        explanation: questionData.explanation,
                        explanation_image_url: questionData.explanation_image_url || '',
                        university_id: questionData.university_id || 'all'
                    });
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, isEditMode, reset]);

    // Single Upload Watchers
    const watchSubject = watch('subject');
    const watchImageUrl = watch('image_url');
    const watchExplanationImageUrl = watch('explanation_image_url');
    const watchQuestion = watch('question');
    const watchExplanation = watch('explanation');
    const watchOptions = watch('options');

    const availableTopics = SUBJECTS.find(s => s.value === watchSubject)?.topics || [];

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
            if (converted !== currentVal) {
                setValue(field, converted);
            }
        }
    };

    const handleInsertSymbol = (symbol: string) => {
        if (!activeField) return;
        const { name, element } = activeField;
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const value = watch(name as any) || '';

        // Check if we are already inside a math block ($...$)
        const textBefore = value.substring(0, start);
        const textAfter = value.substring(end);

        // Count $ symbols before to see if we are in an open block
        const dollarCountBefore = (textBefore.match(/\$/g) || []).length;
        const isInsideMath = dollarCountBefore % 2 !== 0;

        let symbolToInsert = symbol;
        if (!isInsideMath) {
            // If it's a complex symbol like \frac or \sum, it definitely needs $
            // If it's a simple greek letter, it also needs $ for rendering
            symbolToInsert = `$${symbol}$`;
        }

        const newValue = value.substring(0, start) + symbolToInsert + value.substring(end);
        setValue(name as any, newValue);

        // Set focus back and move cursor
        setTimeout(() => {
            element.focus();
            const newCursorPos = start + symbolToInsert.length;
            element.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const onSingleSubmit = async (data: FormValues) => {
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
                university_id: data.university_id,
            };

            if (isEditMode && id) {
                await dbService.updateQuestion(id, formattedData);
                setSuccessMsg('Question updated successfully! Redirecting...');
                setTimeout(() => navigate('/bank'), 1500);
            } else {
                await dbService.insertQuestion(formattedData);
                setDailyCount(prev => prev + 1);
                setSuccessMsg('Question saved successfully!');
                reset({
                    subject: data.subject,
                    topic: data.topic,
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
            alert(isEditMode ? 'Failed to update question' : 'Failed to save question');
        }
    };

    // Bulk Upload Handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const processFile = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setIsProcessing(true);
        try {
            const jsonData = await parseExcelFile(uploadedFile);
            const { valid, errors } = validateAndTransformExcelData(jsonData);
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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) processFile(droppedFile);
            else alert("Please upload an Excel file.");
        }
    };

    const handleBulkImport = async () => {
        if (validQuestions.length === 0) return;
        const criticalErrors = validationErrors.filter(e => e.type === 'error');
        if (criticalErrors.length > 0) {
            const confirm = window.confirm(`Skip ${criticalErrors.length} errors and import ${validQuestions.length} valid questions?`);
            if (!confirm) return;
        }
        setIsProcessing(true);
        try {
            const questionsWithUniv = validQuestions.map(q => ({ ...q, university_id: bulkUniversityId }));
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
            <div className="max-w-4xl mx-auto pb-20 space-y-8">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <div className="space-y-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Dynamic Header & Toggle */}
            <div className="mb-10">
                {!isEditMode && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Upload <span className="text-teal-600">Questions</span></h2>
                            <p className="text-slate-500 font-medium mt-1">Choose your preferred method to add content.</p>
                        </div>

                        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner relative w-full md:w-[320px]">
                            <motion.div
                                className="absolute bg-white shadow-md rounded-xl h-[calc(100%-12px)] z-0"
                                style={{ width: 'calc(50% - 6px)' }}
                                animate={{ x: mode === 'single' ? 0 : '100%' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <button
                                onClick={() => setMode('single')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${mode === 'single' ? 'text-teal-700' : 'text-slate-400'}`}
                            >
                                <Plus size={14} /> Single
                            </button>
                            <button
                                onClick={() => setMode('bulk')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${mode === 'bulk' ? 'text-teal-700' : 'text-slate-400'}`}
                            >
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
                    <motion.div key="single" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-4xl mx-auto">
                        {successMsg && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 overflow-hidden">
                                <div className="bg-teal-50 border border-teal-100 text-teal-800 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-sm">
                                    <CheckCircle className="w-6 h-6 text-teal-600" />
                                    <span className="font-bold">{successMsg}</span>
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSingleSubmit)} className="space-y-8">
                            {/* Classification */}
                            <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Target Institute</label>
                                    <select {...register('university_id')} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 appearance-none">
                                        <option value="all">Global (All)</option>
                                        {institutes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Subject</label>
                                    <select {...register('subject', { required: true })} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 appearance-none">
                                        <option value="">Select Subject</option>
                                        {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Topic</label>
                                    <select {...register('topic', { required: true })} disabled={!watchSubject} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 appearance-none">
                                        <option value="">Select Topic</option>
                                        {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </section>

                            {/* Question Content */}
                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowSymbols(!showSymbols)}
                                                className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest transition-all ${showSymbols ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
                                            >
                                                Ω Symbols
                                            </button>
                                            <span className="text-[9px] font-black text-teal-600/50 uppercase tracking-widest italic">LaTeX Active</span>
                                        </div>
                                    </div>
                                    <textarea
                                        {...register('question', { required: true })}
                                        onFocus={(e) => setActiveField({ name: 'question', element: e.target })}
                                        rows={4}
                                        placeholder="Type question here..."
                                        className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500/20 transition-all resize-none shadow-inner"
                                    />

                                    {watchQuestion && (watchQuestion.includes('$') || watchQuestion.includes('\\') || watchQuestion.toLowerCase().includes('<mcq_img>')) && (
                                        <div className="mt-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-x-auto">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Live Math Preview</p>
                                            <MathText imageUrl={watchImageUrl}>{watchQuestion}</MathText>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={14} /> Question Image URL</label>
                                        <input {...register('image_url')} onBlur={() => handleUrlBlur('image_url')} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20" placeholder="https://..." />
                                        <ImagePreview url={watchImageUrl} label="Question" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={14} /> Explanation Image URL</label>
                                        <input {...register('explanation_image_url')} onBlur={() => handleUrlBlur('explanation_image_url')} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20" placeholder="https://..." />
                                        <ImagePreview url={watchExplanationImageUrl} label="Explanation" />
                                    </div>
                                </div>
                            </section>

                            {/* Options */}
                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><CheckCircle className="text-teal-600" /> Options</h3>
                                    <button type="button" onClick={() => append({ text: '', is_correct: false })} disabled={fields.length >= 6} className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-all disabled:opacity-30">Add Option</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="relative group">
                                            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${watch(`options.${index}.is_correct`) ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-50/50 border-slate-100 hover:border-teal-200'}`}>
                                                <input type="radio" checked={watch(`options.${index}.is_correct`)} onChange={() => handleCorrectSelection(index)} className="w-5 h-5 accent-teal-600 cursor-pointer" />
                                                <input
                                                    {...register(`options.${index}.text` as const, { required: true })}
                                                    onFocus={(e) => setActiveField({ name: `options.${index}.text`, element: e.target })}
                                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                    className="bg-transparent border-none flex-1 text-sm font-bold text-slate-700 outline-none"
                                                />
                                                {fields.length > 2 && <button type="button" onClick={() => remove(index)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Explanation */}
                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <div className="space-y-2 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Step-by-Step Explanation</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowSymbols(!showSymbols)}
                                            className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest transition-all ${showSymbols ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
                                        >
                                            Ω Symbols
                                        </button>
                                    </div>
                                    <textarea
                                        {...register('explanation', { required: true })}
                                        onFocus={(e) => setActiveField({ name: 'explanation', element: e.target })}
                                        rows={3}
                                        placeholder="Explain how to solve..."
                                        className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                            </section>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-3 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {isEditMode ? 'Update Question' : 'Save To Database'}
                                </button>
                                {!isEditMode && <button type="button" onClick={() => reset()} className="px-10 bg-slate-100 text-slate-400 py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 hover:text-slate-600 transition-all">Clear</button>}
                            </div>

                            {/* Symbol Keyboard Popover */}
                            <AnimatePresence>
                                {showSymbols && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setShowSymbols(false)}
                                            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[90] sm:hidden"
                                        />
                                        <div className="fixed sm:top-24 sm:right-10 bottom-0 left-0 right-0 z-[100] w-full sm:max-w-sm pointer-events-none">
                                            <div className="pointer-events-auto">
                                                <SymbolKeyboard
                                                    onInsert={handleInsertSymbol}
                                                    onClose={() => setShowSymbols(false)}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div key="bulk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Bulk Upload Main Area */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 text-left">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Target Institution</h4>
                                    <select value={bulkUniversityId} onChange={(e) => setBulkUniversityId(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 appearance-none">
                                        <option value="all">Global (All)</option>
                                        {institutes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-4 text-left">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Options</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {['includeImages', 'includeExplanationImages', 'includeSubtopics'].map(key => (
                                            <label key={key} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" checked={templateConfig[key as keyof typeof templateConfig]} onChange={(e) => setTemplateConfig({ ...templateConfig, [key]: e.target.checked })} className="w-4 h-4 accent-teal-600" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-600 transition-colors">{key.replace('include', '')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {!file ? (
                                <div
                                    className={`border-4 border-dashed rounded-[3rem] min-h-[400px] flex flex-col items-center justify-center transition-all cursor-pointer bg-white group p-8 text-center ${dragActive ? 'border-teal-400 bg-teal-50/30' : 'border-slate-100 hover:border-teal-200 hover:bg-slate-50/50'}`}
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                                >
                                    <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                                    <div className="bg-teal-50 p-8 rounded-full mb-6 group-hover:scale-110 transition-all">
                                        <UploadCloud className="w-12 h-12 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Drop your Excel report here</h3>
                                    <p className="text-slate-400 font-medium">Click to browse your workstation (.xlsx, .xls)</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px] text-left">
                                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"><FileSpreadsheet className="text-teal-600" /></div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm truncate max-w-[300px]">{file.name}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setFile(null)} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 transition-all"><X size={20} /></button>
                                    </div>

                                    <div className="flex border-b border-slate-100">
                                        {['report', 'preview'].map(tab => (
                                            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}>
                                                {tab === 'report' ? (validationErrors.length > 0 ? 'Validation Alerts' : 'Health Check') : `Live Preview (${validQuestions.length})`}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                                        {activeTab === 'report' ? (
                                            <div className="space-y-6">
                                                <div className={`p-6 rounded-3xl border flex items-center gap-4 ${validationErrors.some(e => e.type === 'error') ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100'}`}>
                                                    {validationErrors.some(e => e.type === 'error') ? <AlertCircle className="text-red-500" /> : <CheckCircle className="text-teal-600" />}
                                                    <div>
                                                        <h4 className={`font-black text-sm uppercase tracking-widest ${validationErrors.some(e => e.type === 'error') ? 'text-red-700' : 'text-teal-700'}`}>
                                                            {validationErrors.some(e => e.type === 'error') ? 'Structural Failures' : 'Clean Bill of Health'}
                                                        </h4>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Found {validationErrors.length} notices for review.</p>
                                                    </div>
                                                </div>
                                                {validationErrors.map((err, idx) => (
                                                    <div key={idx} className={`p-4 rounded-2xl border flex items-center gap-4 bg-white ${err.type === 'error' ? 'border-red-100' : 'border-amber-100'}`}>
                                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${err.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>Row {err.row}</span>
                                                        <span className="text-xs font-bold text-slate-600 italic leading-snug">{err.message}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-3xl border border-slate-100 overflow-x-auto shadow-sm">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                                        <tr>
                                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Index</th>
                                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Question Details</th>
                                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Taxonomy</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {validQuestions.slice(0, 50).map((q, i) => (
                                                            <tr key={i} className="hover:bg-slate-50/30">
                                                                <td className="px-6 py-4 font-black text-slate-200 text-xs">#{i + 1}</td>
                                                                <td className="px-6 py-4"><p className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed">{q.question}</p></td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">{q.subject}</span>
                                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">{q.topic}</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-white border-t border-slate-50">
                                        <button onClick={handleBulkImport} disabled={validQuestions.length === 0 || isProcessing} className="w-full py-5 bg-teal-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-3 disabled:opacity-50">
                                            {isProcessing ? <Loader2 className="animate-spin" /> : <UploadCloud size={16} />}
                                            Import {validQuestions.length} Valid Questions
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bulk Sidebar */}
                        <div className="lg:col-span-4 space-y-6 text-left">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <h3 className="text-xl font-black text-slate-800">Quick Tools</h3>
                                <div className="space-y-3">
                                    <button onClick={() => window.open('https://docs.google.com/spreadsheets/u/0/', '_blank')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-teal-100 hover:bg-white transition-all group">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-600 transition-colors">Open Sheets</span>
                                        <RefreshCw size={16} className="text-slate-300 group-hover:text-teal-600 transition-all" />
                                    </button>
                                    <button onClick={() => generateTemplate(templateConfig)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-teal-100 hover:bg-white transition-all group">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-600 transition-colors">Download Template</span>
                                        <Download size={16} className="text-slate-300 group-hover:text-teal-600 transition-all" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-teal-600 p-8 rounded-[2.5rem] shadow-lg shadow-teal-600/10 text-white space-y-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black mb-2 flex items-center gap-3"><HelpCircle size={20} /> Pro Tips</h3>
                                    <ul className="space-y-4">
                                        {[
                                            { l: 'Template First', d: 'Always use our latest CSV structure.' },
                                            { l: 'Math Magic', d: 'Use LaTeX ($...$) for formulas.' },
                                            { l: 'Cloud Sync', d: 'Images must be public URLs.' }
                                        ].map((tip, i) => (
                                            <li key={i}>
                                                <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest leading-none mb-1">{tip.l}</p>
                                                <p className="text-xs font-bold leading-relaxed opacity-80">{tip.d}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <AlertTriangle size={150} className="absolute -right-12 -bottom-12 text-white/10" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadManagement;
