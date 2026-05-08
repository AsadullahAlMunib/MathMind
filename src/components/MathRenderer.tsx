import React, { useMemo } from 'react';
import katex from 'katex';
import { normalizeLatex, sanitizeMathForKatex } from '../lib/mathUtils';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "", inline = true }) => {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // 1. Normalize the entire text (AI may have mixed Bengali/English/Malformed LaTeX)
    const normalizedText = normalizeLatex(content);

    // 2. Identify math segments
    // Matches $...$, $$...$$, \(...\), \[...\]
    const segments = normalizedText.split(/(\$\$.*?\$\$|\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\])/g);

    return segments.map((segment, index) => {
      let math = '';
      let isDisplay = false;

      if (segment.startsWith('$$') && segment.endsWith('$$')) {
        math = segment.slice(2, -2);
        isDisplay = true;
      } else if (segment.startsWith('$') && segment.endsWith('$')) {
        math = segment.slice(1, -1);
        isDisplay = false;
      } else if (segment.startsWith('\\(') && segment.endsWith('\\)')) {
        math = segment.slice(2, -2);
        isDisplay = false;
      } else if (segment.startsWith('\\[') && segment.endsWith('\\]')) {
        math = segment.slice(2, -2);
        isDisplay = true;
      } else {
        // Plain text segment
        return <span key={index}>{segment}</span>;
      }

      if (!math.trim()) return null;

      try {
        const sanitizedMath = sanitizeMathForKatex(math);
        const html = katex.renderToString(sanitizedMath, {
          throwOnError: false,
          displayMode: isDisplay,
          strict: false,
          trust: true
        });

        return (
          <span 
            key={index} 
            className={`math-container ${isDisplay ? 'block my-4 overflow-x-auto overflow-y-hidden max-w-full' : 'inline-block mx-0.5'}`}
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        );
      } catch (error) {
        console.error('KaTeX rendering error:', error, 'for math:', math);
        return (
          <span key={index} className="px-1 py-0.5 bg-rose-500/10 text-rose-500 rounded font-mono text-xs">
            {segment}
          </span>
        );
      }
    });
  }, [content]);

  const Wrapper = inline ? 'span' : 'div';

  return (
    <Wrapper className={`math-renderer leading-relaxed ${className}`}>
      {renderedContent}
    </Wrapper>
  );
};

export default MathRenderer;
