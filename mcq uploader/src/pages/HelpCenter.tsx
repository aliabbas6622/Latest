import React from 'react';
import { HelpCircle, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';

const HelpCenter = () => {
    const categories = [
        {
            title: 'Getting Started',
            icon: <BookOpen className="w-6 h-6 text-primary" />,
            items: [
                'How to upload questions',
                'Bulk upload formats (XLXS)',
                'Understanding Subject vs Topic'
            ]
        },
        {
            title: 'Institutional Management',
            icon: <ExternalLink className="w-6 h-6 text-primary" />,
            items: [
                'Adding new universities',
                'Managing domains and emails',
                'Bulk question assignment'
            ]
        },
        {
            title: 'Support',
            icon: <MessageSquare className="w-6 h-6 text-primary" />,
            items: [
                'Contact platform admin',
                'Reporting bugs',
                'Feature requests'
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="border-b border-border pb-6">
                <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-textMain tracking-tight">Help Center</h2>
                <p className="text-textSecondary mt-2 text-base md:text-lg">Find answers and get support for the Admin Console.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-border shadow-soft space-y-4">
                        <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-2">
                            {cat.icon}
                        </div>
                        <h3 className="text-xl font-bold font-heading text-textMain">{cat.title}</h3>
                        <ul className="space-y-3">
                            {cat.items.map((item, j) => (
                                <li key={j} className="flex items-center gap-3 text-sm text-textSecondary font-medium group cursor-pointer hover:text-teal-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-teal-900 to-teal-800 p-8 md:p-12 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 space-y-6">
                    <div className="max-w-2xl">
                        <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4">Still need help?</h3>
                        <p className="text-teal-50/70 text-lg leading-relaxed">
                            If you couldn't find what you were looking for, our technical support team is available to assist you with any issues regarding the MCQ Uploader or University Management.
                        </p>
                    </div>
                    <button className="bg-white text-teal-950 px-8 py-4 rounded-2xl font-bold hover:bg-teal-50 transition-all shadow-lg flex items-center gap-2">
                        <HelpCircle size={20} /> Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
