import React from 'react';
import katex from 'katex';
import { convertGoogleDriveLink } from '../../utils/excelHelper';

interface MathTextProps {
  children: string;
  className?: string;
  block?: boolean;
  imageUrl?: string;
}

const MathText: React.FC<MathTextProps> = ({ children, className = '', block = false, imageUrl }) => {
  if (!children || typeof children !== 'string') return null;

  // Split string by <mcq_img> tag (case insensitive, allowing optional self-closing)
  const imgTagRegex = /(<mcq_img\s*\/?>)/gi;
  const parts = children.split(imgTagRegex);

  return (
    <span className={`${className} ${block ? 'block' : ''}`}>
      {parts.map((part, index) => {
        // Check if this part is the image tag
        if (part.match(imgTagRegex)) {
          if (imageUrl) {
            return (
              <img
                key={index}
                src={convertGoogleDriveLink(imageUrl)}
                alt="Embedded Content"
                className="max-w-full h-auto my-3 rounded-lg border border-gray-200 shadow-sm block"
                style={{ maxHeight: '400px' }}
              />
            );
          }
          // If tag exists but no URL, render nothing
          return null;
        }

        // Regular text processing (LaTeX)
        // Split string by LaTeX delimiters
        // $$...$$ for block math
        // $...$ for inline math
        const latexParts = part.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
        return (
          <React.Fragment key={index}>
            {latexParts.map((subPart, subIndex) => {
              if (subPart.startsWith('$$') && subPart.endsWith('$$')) {
                // Block math
                const content = subPart.slice(2, -2);
                try {
                  const html = katex.renderToString(content, { displayMode: true, throwOnError: false });
                  return <span key={subIndex} dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) {
                  return <span key={subIndex} className="text-red-500 text-sm font-mono bg-red-50 px-1 rounded">{subPart}</span>;
                }
              } else if (subPart.startsWith('$') && subPart.endsWith('$')) {
                // Inline math
                const content = subPart.slice(1, -1);
                try {
                  const html = katex.renderToString(content, { displayMode: false, throwOnError: false });
                  return <span key={subIndex} dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) {
                  return <span key={subIndex} className="text-red-500 text-sm font-mono bg-red-50 px-1 rounded">{subPart}</span>;
                }
              } else {
                // Regular text
                return <span key={subIndex}>{subPart}</span>;
              }
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};

export default MathText;