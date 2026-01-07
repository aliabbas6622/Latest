import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileSpreadsheet, PlusCircle, BookOpen, ChevronDown, ChevronUp, Mail, ExternalLink, HelpCircle, AlertCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  {
    category: 'General',
    question: 'How do I reset my password?',
    answer: 'Currently, this is a demo admin console. In a production environment, you would click "Forgot Password" on the login screen or contact the system administrator.'
  },
  {
    category: 'Questions',
    question: 'Can I restore a deleted question?',
    answer: 'No, once a question is deleted from the Question Bank, it is permanently removed from the database. We recommend double-checking before deleting.'
  },
  {
    category: 'Upload',
    question: 'Why is my Excel file upload failing?',
    answer: 'Common reasons include: changing header names in the template, missing required fields (Question, Options A/B, Explanation), or using an invalid file format (must be .xlsx or .xls).'
  },
  {
    category: 'Upload',
    question: 'What happens if I upload duplicate questions?',
    answer: 'The system currently generates a new unique ID for every imported question. It does not automatically check for duplicates based on text content.'
  },
  {
    category: 'Questions',
    question: 'Is there a limit to the number of questions?',
    answer: 'There is no hard limit on the number of questions you can add to the bank, but performance may vary with extremely large datasets (10,000+ items) in this web view.'
  }
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-5xl mx-auto space-y-10 pb-20"
    >
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-4xl font-extrabold font-heading text-textMain tracking-tight">How can we help you?</h2>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-textMain placeholder-gray-400 shadow-soft focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium outline-none"
          />
        </div>
      </div>

      {/* Quick Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GuideCard 
          icon={<PlusCircle className="w-6 h-6" />}
          title="Manual Entry"
          description="Learn how to add single questions with custom options and explanations."
          link="/add"
          linkText="Go to Add Question"
        />
        <GuideCard 
          icon={<FileSpreadsheet className="w-6 h-6" />}
          title="Bulk Upload"
          description="Download the template and strict formatting rules for Excel imports."
          link="/upload"
          linkText="Go to Bulk Upload"
        />
        <GuideCard 
          icon={<BookOpen className="w-6 h-6" />}
          title="Managing Content"
          description="Search, filter, edit, and delete existing questions in the bank."
          link="/bank"
          linkText="Go to Question Bank"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold font-heading text-textMain flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-teal-800" />
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-textSecondary font-medium">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:border-primary/30 hover:shadow-soft">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-primary/20"
                  >
                    <span className="font-bold text-textMain text-lg">{faq.question}</span>
                    <span className={`p-2 rounded-full transition-colors ${openFaqIndex === index ? 'bg-primary/20 text-teal-900' : 'text-gray-400'}`}>
                      {openFaqIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaqIndex === index && (
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
                        <div className="px-6 py-4 text-textSecondary font-medium leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact/Support Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primaryHover p-8 rounded-2xl shadow-xl shadow-primary/10 text-teal-950 relative overflow-hidden border border-primary/20">
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-heading mb-2">Need more help?</h3>
              <p className="text-teal-900/80 text-sm mb-6 font-medium">Our support team is available Mon-Fri, 9am - 5pm EST.</p>
              
              <button className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/40 p-3.5 rounded-xl text-center text-sm font-bold text-teal-950 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary">
                <Mail className="w-4 h-4" />
                Contact Support
              </button>
            </div>
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/20 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 rounded-full bg-teal-900/5 blur-xl"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
            <h4 className="font-bold text-textMain mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Quick Tips
            </h4>
            <ul className="space-y-3 text-sm text-textSecondary font-medium">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                Always backup your data before bulk deletions.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                Check Excel template headers carefully.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                Use the "Clear Form" button to reset the manual entry page quickly.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GuideCard = ({ icon, title, description, link, linkText }: { icon: React.ReactNode, title: string, description: string, link: string, linkText: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-teal-800 mb-4 group-hover:scale-110 transition-transform duration-300 ring-4 ring-primary/5">
      {icon}
    </div>
    <h3 className="text-xl font-bold font-heading text-textMain mb-2">{title}</h3>
    <p className="text-textSecondary text-sm font-medium mb-6 flex-1">{description}</p>
    <a 
      href={`#${link}`} 
      className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:text-teal-950 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md px-1 -ml-1"
    >
      {linkText} <ExternalLink className="w-3 h-3" />
    </a>
  </div>
);

export default HelpCenter;