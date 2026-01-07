import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet, Download, AlertCircle, CheckCircle, FileWarning,
  AlertTriangle, X, RefreshCw, UploadCloud, Settings2, Save,
  Loader2, ShieldCheck, ChevronDown, Check
} from 'lucide-react';
import {
  generateTemplate, parseExcelFile, validateAndTransformExcelData,
  ExcelValidationError, TemplateConfig
} from '../utils/excelHelper';
import { dbService } from '../services/dbService';
import { MCQ } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<ExcelValidationError[]>([]);
  const [validQuestions, setValidQuestions] = useState<Omit<MCQ, 'id' | 'created_at'>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // New State for Institutions
  const [institutions, setInstitutions] = useState<{ id: string, name: string }[]>([]);
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>('global');

  // Template Customization State
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
    includeImages: true,
    includeExplanationImages: true,
    includeSubtopics: true
  });

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const [role, settings, insts] = await Promise.all([
          dbService.getUserRole(),
          dbService.getSystemSettings('mcq_template_config'),
          dbService.getInstitutes()
        ]);
        setUserRole(role);
        setInstitutions(insts);
        if (settings) {
          setTemplateConfig(settings);
        }
      } catch (err) {
        console.error("Failed to initialize bulk upload settings:", err);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    initPage();
  }, []);

  const handleSaveDefaultSettings = async () => {
    setIsSavingSettings(true);
    try {
      await dbService.updateSystemSettings('mcq_template_config', templateConfig);
      alert("Template defaults updated successfully!");
    } catch (err) {
      alert("Failed to save settings. Are you a Super Admin?");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    try {
      const jsonData = await parseExcelFile(uploadedFile);
      setParsedData(jsonData);
      const { valid, errors } = validateAndTransformExcelData(jsonData);

      // Inject university_id if an institute is selected
      const processedValid = valid.map(q => ({
        ...q,
        university_id: selectedInstituteId === 'global' ? null : selectedInstituteId
      }));

      setValidQuestions(processedValid);
      setValidationErrors(errors);
    } catch (err) {
      console.error(err);
      alert("Error parsing file. Please ensure it's a valid Excel file.");
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
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        processFile(droppedFile);
      } else {
        alert("Please upload an Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleImport = async () => {
    if (validQuestions.length === 0) return;

    const errors = validationErrors.filter(e => e.type === 'error');
    if (errors.length > 0) {
      alert("Please fix the errors before importing.");
      return;
    }

    setIsProcessing(true);
    try {
      await dbService.bulkInsertQuestions(validQuestions);
      alert(`Successfully imported ${validQuestions.length} questions!`);
      navigate('/bank');
    } catch (err) {
      console.error(err);
      alert("Import failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedData(null);
    setValidationErrors([]);
    setValidQuestions([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const errors = validationErrors.filter(e => e.type === 'error');
  const warnings = validationErrors.filter(e => e.type === 'warning');
  const hasErrors = errors.length > 0;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* Header Section - Inspired by Screenshot */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-textMain tracking-tight">Bulk Upload</h2>
          <p className="text-textSecondary mt-2 text-lg font-medium opacity-80">Import questions rapidly via Excel spreadsheet.</p>
        </div>
        <button
          onClick={() => generateTemplate(templateConfig)}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-textMain hover:bg-gray-50 py-3 px-6 rounded-xl text-sm font-extrabold transition-all shadow-sm active:scale-95 group"
        >
          <Download className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          Download Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Main Content Area (Left/Center) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Target Institution Picker - Matching Screenshot Layout */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">Target Institution</span>
              <p className="text-xs font-bold text-gray-400 mt-0.5">REQUIRED FOR FILTERING</p>
            </div>
            <div className="relative w-full max-w-sm">
              <select
                value={selectedInstituteId}
                onChange={(e) => setSelectedInstituteId(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-black text-textMain focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all pr-12"
              >
                <option value="global">Target All Institutions (Global)</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className={`border-3 border-dashed rounded-[40px] min-h-[420px] flex flex-col items-center justify-center transition-all cursor-pointer bg-white group focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary p-12 text-center shadow-lg shadow-gray-200/50 ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleChange}
                />
                <div className="bg-emerald-50/80 p-9 rounded-full mb-8 group-hover:scale-110 transition-all duration-700 ring-[12px] ring-emerald-50/30 group-focus:ring-primary/20 shadow-inner">
                  <UploadCloud className="w-16 h-16 text-emerald-700" />
                </div>
                <h3 className="text-3xl font-black text-textMain mb-3 tracking-tight">Drop Excel file here</h3>
                <p className="text-lg text-textSecondary font-medium mb-12 opacity-70">or click to browse (.xlsx, .xls)</p>
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="text-[11px] font-black text-gray-400 bg-gray-100/50 px-6 py-3 rounded-full border border-gray-200 uppercase tracking-widest leading-none">
                    Max size: 5MB
                  </div>
                  <div className="text-[11px] font-black text-gray-400 bg-gray-100/50 px-6 py-3 rounded-full border border-gray-200 lowercase tracking-widest leading-none">
                    .xlsx, .xls
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] border border-gray-200 shadow-2xl overflow-hidden"
              >
                {/* File Header */}
                <div className="p-10 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="bg-emerald-100 p-5 rounded-3xl flex-shrink-0 shadow-inner ring-4 ring-emerald-50">
                      <FileSpreadsheet className="w-10 h-10 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-textMain text-2xl truncate tracking-tight">{file.name}</p>
                      <p className="text-xs text-textSecondary font-black uppercase tracking-[0.2em] mt-2 opacity-60">{(file.size / 1024).toFixed(1)} KB SOURCE DATA</p>
                    </div>
                  </div>
                  <button
                    onClick={resetUpload}
                    className="flex items-center justify-center gap-2 text-sm font-black text-textSecondary hover:text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-100 px-8 py-4 rounded-2xl transition-all shadow-sm active:scale-95"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Re-upload
                  </button>
                </div>

                {/* Validation Status Banner */}
                <div className={`px-10 py-6 flex items-start gap-5 border-b ${hasErrors ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  {hasErrors ? (
                    <AlertCircle className="w-8 h-8 text-red-600 mt-1 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-emerald-600 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-black text-xl ${hasErrors ? 'text-red-900' : 'text-emerald-900'}`}>
                      {hasErrors ? 'Validation Blocked' : 'Validation Success'}
                    </h4>
                    <p className={`text-base mt-2 font-bold leading-relaxed ${hasErrors ? 'text-red-700' : 'text-emerald-700'}`}>
                      {hasErrors
                        ? `Critical errors detected in ${errors.length} rows. Please review and fix them in your spreadsheet before importing.`
                        : `All clear! ${validQuestions.length} questions are verified and ready for the bank.`}
                    </p>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="p-10 space-y-10">

                  {/* Logic for showing lists of errors/warnings remains from previous Turn */}
                  {(errors.length > 0 || warnings.length > 0) && (
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {errors.map((err, idx) => (
                        <div key={idx} className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex items-start gap-4">
                          <span className="bg-white text-red-700 font-black text-[10px] px-2 py-1 rounded-lg border border-red-100 shrink-0">ROW {err.row}</span>
                          <p className="text-sm font-bold text-red-900 leading-relaxed">{err.message}</p>
                        </div>
                      ))}
                      {warnings.map((err, idx) => (
                        <div key={idx} className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-start gap-4">
                          <span className="bg-white text-amber-700 font-black text-[10px] px-2 py-1 rounded-lg border border-amber-100 shrink-0">ROW {err.row}</span>
                          <p className="text-sm font-bold text-amber-900 leading-relaxed">{err.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-5 pt-4">
                    <button
                      onClick={handleImport}
                      disabled={hasErrors || validQuestions.length === 0 || isProcessing}
                      className="bg-primary hover:bg-primaryHover text-teal-950 px-10 py-5 rounded-[24px] font-black shadow-2xl shadow-primary/40 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all flex-[2] transform hover:-translate-y-1 active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-6 h-6 stroke-[3px]" />
                          Complete Upload
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetUpload}
                      className="border-2 border-gray-100 text-textSecondary px-10 py-5 rounded-[24px] font-black hover:bg-gray-50 hover:text-textMain transition-all flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar Area - Inspired by Screenshot */}
        <div className="lg:col-span-4 space-y-10">

          {/* Instructions Card */}
          <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-gray-100 border border-gray-100">
            <h3 className="font-extrabold text-2xl text-textMain mb-10 tracking-tight">Instructions</h3>
            <div className="space-y-10">
              {[
                { title: 'Download template', desc: 'to get the correct Excel format.' },
                { title: 'Fill in details', desc: 'One question per row.' },
                { title: 'Use LaTeX for Math:', desc: '$x^2$  $$...$$', math: true },
                { title: 'Images added as URLs', desc: 'in the designated columns.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-6">
                  <span className="text-xl font-black text-primary opacity-50 shrink-0 leading-none">{i + 1}.</span>
                  <div>
                    <p className="text-[16px] font-black text-textMain leading-snug">
                      {step.title} <span className="font-bold text-textSecondary">{i === 2 ? '' : step.desc}</span>
                    </p>
                    {step.math && (
                      <div className="mt-4 flex gap-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded-xl text-[11px] font-black border border-gray-200">$x^2$</code>
                        <code className="bg-gray-100 px-3 py-1.5 rounded-xl text-[11px] font-black border border-gray-200">$$...$$</code>
                      </div>
                    )}
                    {i === 2 && <p className="text-sm font-bold text-textSecondary mt-3 leading-relaxed opacity-70">{step.desc.replace('$x^2$  $$...$$', '')}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Super Admin Settings - Keeping your customization feature but making it premium */}
          {isSuperAdmin && (
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10">
                <div className="bg-emerald-50 font-black text-[9px] text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                  Host Mode
                </div>
              </div>

              <div className="flex items-center gap-3 mb-10">
                <div className="bg-primary/20 p-2.5 rounded-2xl">
                  <Settings2 className="w-5 h-5 text-teal-900" />
                </div>
                <h3 className="font-extrabold text-xl text-textMain tracking-tight">Global Config</h3>
              </div>

              <div className="space-y-5">
                {['Include Images', 'Include Explanations', 'Include Subtopics'].map((label, idx) => {
                  const keys = ['includeImages', 'includeExplanationImages', 'includeSubtopics'] as const;
                  const key = keys[idx];
                  return (
                    <label key={key} className="flex items-center gap-4 p-5 rounded-3xl border border-gray-50 hover:bg-gray-50 cursor-pointer group transition-all">
                      <input
                        type="checkbox"
                        checked={templateConfig[key]}
                        onChange={(e) => setTemplateConfig({ ...templateConfig, [key]: e.target.checked })}
                        className="w-6 h-6 rounded-lg border-gray-300 text-primary focus:ring-primary shadow-sm"
                      />
                      <span className="text-sm font-extrabold text-textSecondary group-hover:text-textMain">{label}</span>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleSaveDefaultSettings}
                disabled={isSavingSettings}
                className="w-full mt-10 flex items-center justify-center gap-3 bg-teal-950 text-white hover:bg-black py-5 rounded-[24px] text-sm font-black transition-all shadow-2xl active:scale-[0.98]"
              >
                {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-primary" />}
                Save Core Defaults
              </button>
            </div>
          )}

          {/* Partial Import Alert Card */}
          <div className="bg-indigo-50/40 p-10 rounded-[40px] border border-indigo-100 shadow-inner">
            <div className="flex gap-5">
              <div className="bg-indigo-100 p-3 rounded-2xl shrink-0 h-fit">
                <AlertCircle className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <h4 className="font-black text-indigo-900 text-base italic leading-none">Partial Import</h4>
                <p className="text-sm text-indigo-800 mt-4 font-bold leading-relaxed opacity-80">
                  The system will block uploads if critical errors are present. However, formatting warnings will be auto-corrected during the import process.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default BulkUpload;