import React, { useMemo } from 'react';
import katex from 'katex';
import { normalizeLatex, sanitizeMathForKatex } from '../lib/mathUtils';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = React.memo(({ content, className = "", inline = true }) => {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // 1. Normalize the entire text (AI may have mixed Bengali/English/Malformed LaTeX)
    const normalizedText = normalizeLatex(content);

    // 2. Identify math segments
    // Matches $...$, $$...$$, \(...\), \[...\], and optionally labeled \begin{env}...\end{env}
    const envs = 'align\\*?|alignat\\*?|alignedat|cases|matrix|pmatrix|vmatrix|bmatrix|Bmatrix|Vmatrix|gather\\*?|multline\\*?|split|aligned|smallmatrix|array';
    /** Sync label pattern with mathUtils.ts - robust matching for labeled environments */
    const labelPattern = '(?:[\\w\\s\\(\\)\\{\\}\\[\\]=<>+\\-\\*/\\.,_\\^\\!\\$]*?\\s*[=<>\\!\\:]\\s*)?';
    const envPattern = `\\$*\\s*${labelPattern}\\\\begin\\{(?:${envs})\\}[\\s\\S]*?\\\\end\\{(?:${envs})\\}\\s*\\$*`;
    const splitRegex = new RegExp(`(\\$\\$[\\s\\S]*?\\$\\$|\\$[\\s\\S]*?\\$|\\\\\\(.*?\\\\\\)|\\\\\\[[\\s\\S]*?\\\\\\]|${envPattern})`, 'g');
    const segments = normalizedText.split(splitRegex);

    return segments.map((segment, index) => {
      if (!segment) return null;
      
      let math = '';
      let isDisplay = false;

      if (segment.startsWith('$$') && segment.endsWith('$$') && segment.length > 4) {
        math = segment.slice(2, -2);
        isDisplay = true;
      } else if (segment.startsWith('$') && segment.endsWith('$') && segment.length > 2) {
        math = segment.slice(1, -1);
        isDisplay = false;
      } else if (segment.startsWith('\\(') && segment.endsWith('\\)')) {
        math = segment.slice(2, -2);
        isDisplay = false;
      } else if (segment.startsWith('\\[') && segment.endsWith('\\]')) {
        math = segment.slice(2, -2);
        isDisplay = true;
      } else if (segment.includes('\\begin{') && segment.includes('\\end{')) {
        math = segment;
        // Only force display mode if it has explicit display delimiters or explicit center-only environments
        isDisplay = segment.startsWith('$$') || 
                    segment.startsWith('\\[') || 
                    segment.includes('\\begin{align') || 
                    segment.includes('\\begin{gather');
      } else if (
        ((segment.includes('\\') && !segment.match(/[A-Z]:\\/)) || 
        segment.includes('\\begin') ||
        segment.includes('\\left') ||
        segment.includes('\\right') ||
        segment.includes('\\\\') ||
        segment.includes('{}^{') ||
        segment.includes('|') ||
        segment.includes('^') ||
        segment.includes('_') ||
        segment.includes('&') ||
        (segment.includes('=') && segment.match(/[a-zA-Z0-9\(\)]\s*=\s*/)) ||
        segment.match(/[a-zA-Z0-9]\s*[-+*/]\s*[a-zA-Z0-9]/)) &&
        (segment.match(/[\u0980-\u09FF]/g) || []).length < 25 // Heuristic: math-heavy segments
      ) {
        // Heuristic: If it looks like orphaned math that wasn't wrapped, try rendering it as inline
        math = segment.trim();
        // Use display mode for larger environments or manual newlines
        isDisplay = segment.includes('\\\\') || 
                    segment.includes('\\begin{') ||
                    segment.includes('\\[');
        
        // Clean up any remaining leading/trailing dollars that might have survived normalization
        while (math.startsWith('$')) math = math.slice(1).trim();
        while (math.endsWith('$')) math = math.slice(0, -1).trim();
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
            className={`math-container ${isDisplay ? 'block my-1 overflow-x-auto overflow-y-hidden max-w-full' : 'inline-block align-middle mx-0.5'}`}
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
});

export default MathRenderer;
