import React from 'react';
import katex from 'katex';

interface MathTextProps {
  children: string;
  className?: string;
  block?: boolean;
}

const MathText: React.FC<MathTextProps> = ({ children, className = '', block = false }) => {
  if (!children) return null;

  // Split string by LaTeX delimiters
  // $$...$$ for block math
  // $...$ for inline math
  const parts = children.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return (
    <span className={`${className} ${block ? 'block' : ''}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block math
          const content = part.slice(2, -2);
          try {
            const html = katex.renderToString(content, { displayMode: true, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <span key={index} className="text-red-500 text-sm font-mono bg-red-50 px-1 rounded">{part}</span>;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const content = part.slice(1, -1);
          try {
            const html = katex.renderToString(content, { displayMode: false, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <span key={index} className="text-red-500 text-sm font-mono bg-red-50 px-1 rounded">{part}</span>;
          }
        } else {
          // Regular text
          return <span key={index}>{part}</span>;
        }
      })}
    </span>
  );
};

export default MathText;