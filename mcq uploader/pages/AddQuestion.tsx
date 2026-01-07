import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Save, X, CheckCircle, ChevronRight, PenTool, Image as ImageIcon, ExternalLink, ArrowLeft, Sigma } from 'lucide-react';
import { SUBJECTS } from '../constants';
import { dbService } from '../services/dbService';
import { Option } from '../types';
import { convertGoogleDriveLink } from '../utils/excelHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import MathText from '../components/MathText';

interface FormValues {
  subject: string;
  topic: string;
  question: string;
  image_url: string;
  options: { text: string; is_correct: boolean }[];
  explanation: string;
  explanation_image_url: string;
}

const AddQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [successMsg, setSuccessMsg] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(isEditMode);

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
      explanation_image_url: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  useEffect(() => {
    if (isEditMode && id) {
      const loadQuestion = async () => {
        try {
          const question = await dbService.getQuestion(id);
          if (question) {
            reset({
              subject: question.subject,
              topic: question.topic,
              question: question.question,
              image_url: question.image_url || '',
              options: question.options.map(o => ({ text: o.text, is_correct: o.is_correct })),
              explanation: question.explanation,
              explanation_image_url: question.explanation_image_url || ''
            });
          } else {
            alert('Question not found');
            navigate('/bank');
          }
        } catch (error) {
          console.error("Failed to load question", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadQuestion();
    }
  }, [id, isEditMode, reset, navigate]);

  const watchSubject = watch('subject');
  const watchImageUrl = watch('image_url');
  const watchExplanationImageUrl = watch('explanation_image_url');
  const watchQuestion = watch('question');
  const watchExplanation = watch('explanation');
  const watchOptions = watch('options');
  
  const availableTopics = SUBJECTS.find(s => s.value === watchSubject)?.topics || [];

  const handleCorrectSelection = (index: number) => {
    // Uncheck all others
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

  const onSubmit = async (data: FormValues) => {
    const hasCorrect = data.options.some(o => o.is_correct);
    if (!hasCorrect) {
      alert("Please mark one option as the correct answer.");
      return;
    }

    try {
      const formattedData = {
        question: data.question,
        image_url: convertGoogleDriveLink(data.image_url) || undefined,
        options: data.options.map(o => ({ ...o, id: crypto.randomUUID() })) as Option[],
        explanation: data.explanation,
        explanation_image_url: convertGoogleDriveLink(data.explanation_image_url) || undefined,
        subject: data.subject,
        topic: data.topic,
      };

      if (isEditMode && id) {
        await dbService.updateQuestion(id, formattedData);
        setSuccessMsg('Question updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/bank');
        }, 1500);
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
          explanation_image_url: ''
        });

        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert(isEditMode ? 'Failed to update question' : 'Failed to save question');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto pb-20"
    >
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-border pb-6">
        <div>
          {isEditMode && (
            <button 
              onClick={() => navigate('/bank')} 
              className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-teal-800 mb-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md px-1 -ml-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bank
            </button>
          )}
          <h2 className="text-3xl font-extrabold font-heading text-textMain">{isEditMode ? 'Edit Question' : 'Add New Question'}</h2>
          <p className="text-textSecondary mt-2 text-base font-medium flex flex-wrap items-center gap-2">
            {isEditMode ? 'Modify the details of the existing question.' : 'Fill in the details below.'}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-primary/20 px-2 py-0.5 rounded whitespace-nowrap">
               <Sigma className="w-3 h-3" /> Math Support Active
            </span>
          </p>
        </div>
        {!isEditMode && dailyCount > 0 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-bold text-teal-900 px-4 py-2 bg-primary/30 rounded-full border border-primary/40 flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <CheckCircle className="w-4 h-4" />
            {dailyCount} added today
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-teal-50 border border-primary/30 text-teal-900 px-6 py-4 rounded-xl flex items-center gap-3 shadow-md">
              <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-teal-800" />
              </div>
              <span className="font-bold text-lg">{successMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Classification */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-border group hover:border-primary/30 transition-colors duration-300">
          <h3 className="text-xl font-heading font-bold text-textMain mb-6 flex items-center gap-3">
            <span className="bg-primary/20 text-teal-900 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ring-1 ring-primary/30">1</span>
            Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-textSecondary uppercase tracking-wide">Subject *</label>
              <div className="relative">
                <select 
                  {...register('subject', { required: 'Subject is required' })}
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 p-3.5 border text-textMain bg-white transition-all cursor-pointer appearance-none font-medium outline-none"
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
              {errors.subject && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-textSecondary uppercase tracking-wide">Topic *</label>
              <div className="relative">
                <select 
                  {...register('topic', { required: 'Topic is required' })}
                  disabled={!watchSubject}
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 p-3.5 border text-textMain bg-white disabled:bg-gray-100 disabled:text-gray-400 transition-all cursor-pointer appearance-none font-medium outline-none"
                >
                  <option value="">Select Topic</option>
                  {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
              {errors.topic && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.topic.message}</p>}
            </div>
          </div>
        </section>

        {/* Section 2: Question */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-border group hover:border-primary/30 transition-colors duration-300">
          <h3 className="text-xl font-heading font-bold text-textMain mb-6 flex items-center gap-3">
            <span className="bg-primary/20 text-teal-900 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ring-1 ring-primary/30">2</span>
            Question Details
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-bold text-textSecondary uppercase tracking-wide">Question Text *</label>
                 <span className="text-[10px] text-gray-400">Use $ for inline math, $$ for block</span>
              </div>
              <textarea
                {...register('question', { 
                  required: 'Question text is required',
                  minLength: { value: 10, message: 'Minimum 10 characters required' }
                })}
                rows={4}
                placeholder="Type your question here. Example: What is $x^2$?"
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 p-4 border text-textMain placeholder:text-gray-400 bg-white transition-all text-base font-medium resize-none outline-none"
              ></textarea>
              {errors.question && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.question.message}</p>}
              
              {/* Math Preview */}
              {watchQuestion && watchQuestion.includes('$') && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 overflow-x-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Preview</p>
                    <div className="text-sm font-medium text-textMain">
                        <MathText>{watchQuestion}</MathText>
                    </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-textSecondary uppercase tracking-wide mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Image URL <span className="text-gray-400 font-normal normal-case">(Optional)</span>
              </label>
              <input 
                {...register('image_url')}
                onBlur={() => handleUrlBlur('image_url')}
                placeholder="https://example.com/image.png or Google Drive Link"
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 p-3.5 border text-textMain bg-white transition-all text-sm font-medium outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Supports direct image links or Google Drive share links</p>
              
              {watchImageUrl && (
                <div className="mt-4 p-2 bg-gray-50 rounded-xl border border-gray-200 inline-block max-w-full">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Preview</p>
                  <img 
                    src={convertGoogleDriveLink(watchImageUrl)} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg object-contain border border-gray-200 bg-white max-w-full" 
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Options */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-border group hover:border-primary/30 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
            <h3 className="text-xl font-heading font-bold text-textMain flex items-center gap-3">
                <span className="bg-primary/20 text-teal-900 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ring-1 ring-primary/30">3</span>
                Answer Options
            </h3>
            <span className="text-xs font-semibold text-textSecondary bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
                Mark correct answer
            </span>
          </div>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <motion.div 
                key={field.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group/opt"
              >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="relative flex items-center justify-center pt-3 sm:pt-0">
                        <input
                        type="radio"
                        name="correct_option"
                        checked={watch(`options.${index}.is_correct`)}
                        onChange={() => handleCorrectSelection(index)}
                        className="appearance-none h-6 w-6 rounded-full border-2 border-gray-300 checked:border-teal-600 checked:bg-primary cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0"
                        />
                        <div className="absolute pointer-events-none w-2.5 h-2.5 rounded-full bg-teal-900 opacity-0 transform scale-0 transition-all duration-200" style={{ opacity: watch(`options.${index}.is_correct`) ? 1 : 0, transform: watch(`options.${index}.is_correct`) ? 'scale(1)' : 'scale(0)' }}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                          {...register(`options.${index}.text` as const, { required: 'Option text required' })}
                          placeholder={`Option ${index + 1}`}
                          className={`w-full rounded-xl border shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 p-3.5 transition-all font-medium outline-none bg-white ${
                          watch(`options.${index}.is_correct`) 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                      />
                      {errors.options?.[index]?.text && (
                          <span className="text-red-500 text-xs font-bold block mt-1 ml-1">Required</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                      className="p-3 mt-0.5 sm:mt-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                   {/* Option Math Preview */}
                   {watchOptions[index]?.text && watchOptions[index].text.includes('$') && (
                        <div className="mt-2 ml-10 p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs text-textMain overflow-x-auto">
                            <span className="text-[9px] font-bold text-gray-400 uppercase mr-2">Preview:</span>
                            <MathText>{watchOptions[index].text}</MathText>
                        </div>
                   )}
              </motion.div>
            ))}
          </div>
          
          {fields.length < 6 && (
            <button
              type="button"
              onClick={() => append({ text: '', is_correct: false })}
              className="mt-6 flex items-center gap-2 text-sm font-bold text-teal-800 hover:text-teal-950 bg-primary/20 hover:bg-primary/30 px-5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          )}
        </section>

        {/* Section 4: Explanation */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-border group hover:border-primary/30 transition-colors duration-300">
          <h3 className="text-xl font-heading font-bold text-textMain mb-6 flex items-center gap-3">
            <span className="bg-primary/20 text-teal-900 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ring-1 ring-primary/30">4</span>
            Explanation
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-textSecondary uppercase tracking-wide mb-2">Explanation Text *</label>
              <textarea
                {...register('explanation', { 
                  required: 'Explanation is required',
                  minLength: { value: 20, message: 'Minimum 20 characters required' }
                })}
                rows={3}
                placeholder="Explain why this is the correct answer..."
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 p-4 border text-textMain placeholder:text-gray-400 bg-white transition-all text-base font-medium resize-none outline-none"
              ></textarea>
              {errors.explanation && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.explanation.message}</p>}
              
               {/* Math Preview */}
               {watchExplanation && watchExplanation.includes('$') && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 overflow-x-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Preview</p>
                    <div className="text-sm font-medium text-textMain">
                        <MathText>{watchExplanation}</MathText>
                    </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-textSecondary uppercase tracking-wide mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Explanation Image <span className="text-gray-400 font-normal normal-case">(Optional)</span>
              </label>
              <input 
                {...register('explanation_image_url')}
                onBlur={() => handleUrlBlur('explanation_image_url')}
                placeholder="https://example.com/diagram.png"
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/20 p-3.5 border text-textMain bg-white transition-all text-sm font-medium outline-none"
              />
               {watchExplanationImageUrl && (
                <div className="mt-4 p-2 bg-gray-50 rounded-xl border border-gray-200 inline-block max-w-full">
                   <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Preview</p>
                  <img 
                    src={convertGoogleDriveLink(watchExplanationImageUrl)} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg object-contain border border-gray-200 bg-white max-w-full"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-primary hover:bg-primaryHover text-teal-950 px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : <><Save className="w-5 h-5" /> {isEditMode ? 'Update Question' : 'Save Question'}</>}
          </button>
          <button
            type="button"
            onClick={() => isEditMode ? navigate('/bank') : reset()}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-textSecondary border border-gray-300 hover:bg-white hover:text-textMain hover:border-gray-400 transition-all text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            {isEditMode ? 'Cancel' : 'Clear Form'}
          </button>
        </div>

      </form>
    </motion.div>
  );
};

export default AddQuestion;