import React, { useEffect, useState, useCallback, useRef } from 'react';
import { dbService } from '../services/dbService';
import { MCQ } from '../../types';
import { SUBJECTS } from '../../constants';
import { Search, Trash2, ChevronDown, ChevronUp, CheckCircle, Image as ImageIcon, Edit, Loader2, AlertTriangle, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MathText from '../components/MathText';
import Skeleton from '../components/Skeleton';
import { convertGoogleDriveLink } from '../../utils/excelHelper';

const PAGE_SIZE = 15;

const BankImage = ({ url, alt }: { url: string; alt: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [url]);

  if (!url) return null;

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 bg-red-50 p-3 rounded-lg border border-red-100 text-xs font-bold">
        <AlertTriangle className="w-4 h-4" /> Failed to load image
      </div>
    );
  }

  return (
    <div className="relative min-h-[100px] bg-white rounded-lg border border-gray-200 overflow-hidden w-full max-w-md">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      <img
        src={convertGoogleDriveLink(url)}
        alt={alt}
        className={`rounded-lg max-h-60 object-contain bg-white w-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
      />
    </div>
  );
};

const QuestionBank = () => {
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(0);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
    setQuestions([]);
    setTotalCount(0);
    loadQuestions(0, true);
  }, [debouncedSearch, filterSubject, filterTopic]);

  const loadQuestions = async (pageToLoad: number, isNewFilter: boolean) => {
    if (isNewFilter) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data, count } = await dbService.getPaginatedQuestions(pageToLoad, PAGE_SIZE, {
        search: debouncedSearch,
        subject: filterSubject,
        topic: filterTopic
      });

      setQuestions(prev => isNewFilter ? data : [...prev, ...data]);
      if (count !== null) setTotalCount(count);
    } catch (error) {
      console.error("Failed to load questions", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadQuestions(nextPage, false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const allQuestions = await dbService.getAllQuestions({
        search: debouncedSearch,
        subject: filterSubject,
        topic: filterTopic
      });

      const dataStr = JSON.stringify(allQuestions, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mcq_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(id);
  };

  const executeDelete = async () => {
    if (!showDeleteModal) return;

    setIsDeleting(true);
    try {
      await dbService.deleteQuestion(showDeleteModal);

      // Update local state on success
      setQuestions(prev => prev.filter(q => q.id !== showDeleteModal));
      setTotalCount(prev => Math.max(0, prev - 1));

      // Close modal
      setShowDeleteModal(null);
    } catch (error: any) {
      console.error("Delete failed", error);
      alert(`Failed to delete question. Please check if your user permissions allow deletion.\n\nError: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  const availableTopics = filterSubject !== 'All'
    ? SUBJECTS.find(s => s.value === filterSubject)?.topics || []
    : [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Helper to check for embedded tag
  const hasEmbeddedImage = (text: string) => /<mcq_img\s*\/?>/i.test(text);

  const hasMore = questions.length < totalCount;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 relative">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-center text-textMain mb-2">Delete Question?</h3>
                <p className="text-textSecondary text-center mb-6 text-sm">
                  Are you sure you want to delete this question? This action cannot be undone and will remove it from the database permanently.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-textMain font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-extrabold font-heading text-textMain">Question Bank</h2>
          <p className="text-textSecondary mt-2 font-medium">Manage and review your question database.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExport}
            disabled={exporting || questions.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-300 text-teal-800 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export JSON
          </button>
          <div className="text-sm font-bold text-teal-900 bg-primary/20 px-4 py-2 rounded-lg border border-primary/30 shadow-sm">
            Showing <span className="text-teal-950 font-extrabold">{questions.length}</span> of {totalCount} questions
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-border grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="relative col-span-1 md:col-span-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search questions by text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-textMain placeholder-gray-400 text-sm focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all font-medium outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterSubject}
            onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic('All'); }}
            className="w-full rounded-xl border border-gray-200 bg-white text-textMain text-sm p-3 focus:ring-4 focus:ring-primary/20 focus:border-primary cursor-pointer font-medium outline-none"
          >
            <option value="All">All Subjects</option>
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            disabled={filterSubject === 'All'}
            className="w-full rounded-xl border border-gray-200 bg-white text-textMain text-sm p-3 focus:ring-4 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100 cursor-pointer disabled:text-gray-400 font-medium outline-none"
          >
            <option value="All">All Topics</option>
            {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading && page === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-4 h-24">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"
          >
            <p className="text-textSecondary font-medium">No questions found matching your filters.</p>
            <button
              onClick={() => { setSearch(''); setFilterSubject('All'); }}
              className="mt-4 text-teal-800 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {questions.map((q) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden group ${expandedId === q.id ? 'border-primary ring-1 ring-primary/30 shadow-md' : 'border-gray-200 hover:border-primary/50 hover:shadow-hover'}`}
                >
                  <div
                    className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-start gap-5 cursor-pointer"
                    onClick={() => toggleExpand(q.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-textSecondary uppercase tracking-widest">{q.subject}</span>
                        <span className="text-gray-300 hidden sm:inline">•</span>
                        <span className="text-xs font-bold text-teal-800">{q.topic}</span>
                        {(q.image_url || q.explanation_image_url) && (
                          <span className="ml-2 flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <ImageIcon className="w-3 h-3" /> Img
                          </span>
                        )}
                      </div>
                      <div className="text-textMain font-semibold text-base md:text-lg pr-0 md:pr-8 leading-snug break-words">
                        <MathText imageUrl={q.image_url}>{q.question}</MathText>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-1 flex-shrink-0">
                      <button
                        onClick={(e) => handleEdit(q.id, e)}
                        disabled={isDeleting && showDeleteModal === q.id}
                        className="p-2.5 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-30"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(q.id, e)}
                        disabled={isDeleting && showDeleteModal === q.id}
                        className="p-2.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-100"
                        title="Delete"
                      >
                        {isDeleting && showDeleteModal === q.id ? (
                          <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                      <div className={`p-2.5 rounded-xl transition-colors ${expandedId === q.id ? 'bg-primary/20 text-teal-900' : 'text-gray-400 group-hover:text-primary'}`}>
                        {expandedId === q.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedId === q.id && (
                      <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="bg-gray-50/50 border-t border-gray-100 overflow-hidden"
                      >
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                          {/* Left Column: Options & Question Image */}
                          <div className="space-y-6">
                            {/* Only show standalone image if NOT embedded in text */}
                            {q.image_url && !hasEmbeddedImage(q.question) && (
                              <div className="mb-4">
                                <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Question Image</p>
                                <BankImage url={q.image_url} alt="Question Reference" />
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Options</p>
                              <div className="space-y-3">
                                {q.options.map((opt, i) => (
                                  <div key={i} className={`flex items-start gap-4 text-sm p-4 rounded-xl border ${opt.is_correct ? 'bg-green-50 text-green-900 border-green-200 shadow-sm' : 'bg-white text-textSecondary border-gray-200'}`}>
                                    <div className="mt-0.5 flex-shrink-0">
                                      {opt.is_correct ? <CheckCircle className="w-5 h-5 text-green-600" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-200" />}
                                    </div>
                                    <span className="font-bold w-6 text-base flex-shrink-0">{String.fromCharCode(65 + i)}.</span>
                                    <span className="font-medium break-words">
                                      <MathText>{opt.text}</MathText>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Explanation */}
                          <div>
                            <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4">Explanation</p>
                            <div className="text-sm text-textMain bg-white p-5 rounded-xl border border-gray-200 leading-relaxed shadow-sm font-medium">
                              <div className="break-words">
                                <MathText imageUrl={q.explanation_image_url}>{q.explanation}</MathText>
                              </div>
                              {q.explanation_image_url && !hasEmbeddedImage(q.explanation) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <BankImage url={q.explanation_image_url} alt="Explanation Reference" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 bg-white border border-gray-300 hover:border-primary text-textSecondary hover:text-teal-800 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      Load More Questions
                      <ChevronDown className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMore && questions.length > 0 && (
              <div className="text-center py-8 text-gray-400 text-sm font-medium uppercase tracking-wide">
                All questions loaded
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;