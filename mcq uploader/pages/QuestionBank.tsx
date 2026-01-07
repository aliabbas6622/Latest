import React, { useEffect, useState, useCallback, useRef } from 'react';
import { dbService } from '../services/dbService';
import { MCQ } from '../types';
import { SUBJECTS } from '../constants';
import { Search, Trash2, ChevronDown, ChevronUp, CheckCircle, Image as ImageIcon, Edit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MathText from '../components/MathText';

const PAGE_SIZE = 15;

const QuestionBank = () => {
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(0);
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this question?')) {
      await dbService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
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

  const hasMore = questions.length < totalCount;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
           <h2 className="text-3xl font-extrabold font-heading text-textMain">Question Bank</h2>
           <p className="text-textSecondary mt-2 font-medium">Manage and review your question database.</p>
        </div>
        <div className="text-sm font-bold text-teal-900 bg-primary/20 px-4 py-2 rounded-lg border border-primary/30 shadow-sm self-start md:self-auto">
          Showing <span className="text-teal-950 font-extrabold">{questions.length}</span> of {totalCount} questions
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
          <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-textSecondary font-medium">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"
          >
            <p className="text-textSecondary font-medium">No questions found matching your filters.</p>
            <button 
                onClick={() => {setSearch(''); setFilterSubject('All');}}
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
                          <MathText>{q.question}</MathText>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-1 flex-shrink-0">
                      <button onClick={(e) => handleEdit(q.id, e)} className="p-2.5 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => handleDelete(q.id, e)} className="p-2.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" title="Delete">
                        <Trash2 className="w-5 h-5" />
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
                              {q.image_url && (
                                <div className="mb-4">
                                  <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Question Image</p>
                                  <img src={q.image_url} alt="Question Reference" className="rounded-lg border border-gray-200 max-h-60 object-contain bg-white w-full" />
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
                                      <MathText>{q.explanation}</MathText>
                                  </div>
                                  {q.explanation_image_url && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                      <img src={q.explanation_image_url} alt="Explanation Reference" className="rounded-lg border border-gray-200 max-h-48 object-contain bg-gray-50 mx-auto max-w-full" />
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