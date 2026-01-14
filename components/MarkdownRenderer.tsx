import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    return (
        <div className={twMerge("prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary-600 hover:prose-a:text-primary-700", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-sm" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-slate-50 border-b border-slate-200" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold text-slate-700" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-slate-100 last:border-0" {...props} />,
                    code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <div className="relative group">
                                <div className="absolute top-2 right-2 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {match[1]}
                                </div>
                                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto !m-0 !mt-2 !mb-2">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        ) : (
                            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                            </code>
                        );
                    },
                    img: ({ node, ...props }) => (
                        <img
                            className="rounded-xl border border-slate-200 shadow-sm max-h-[400px] w-auto mx-auto my-6"
                            loading="lazy"
                            {...props}
                        />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-primary-500 pl-4 py-1 italic text-slate-600 bg-slate-50 rounded-r-lg my-4" {...props} />
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
