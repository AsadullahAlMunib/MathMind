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
      } else {
        // Plain text segment
        return <span key={index}>{segment}</span>;
      }

      if (!math.trim()) return null;

      try {
        const sanitizedMath = sanitizeMathForKatex(math);
        
        // Attempt strict KaTeX parse check
        const html = katex.renderToString(sanitizedMath, {
          throwOnError: true,
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
        console.warn('KaTeX strict render failed, falling back to clean math text:', math, error);
        
        // Formats KaTeX-math commands to raw readable mathematical symbols
        const plainMathText = math
          .replace(/\\text\{([^{}]+)\}/g, '$1')
          .replace(/\\times/g, ' × ')
          .replace(/\\div/g, ' ÷ ')
          .replace(/\\pm/g, ' ± ')
          .replace(/\\le/g, ' ≤ ')
          .replace(/\\ge/g, ' ≥ ')
          .replace(/\\sqrt\{([^{}]+)\}/g, '√$1')
          .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1/$2)')
          .replace(/\\frac\s*(\d)\s*(\d)/g, '($1/$2)')
          .replace(/\\frac\s*([a-zA-Z])\s*([a-zA-Z])/g, '($1/$2)')
          .replace(/\\int/g, '∫')
          .replace(/\\pi/g, 'π')
          .replace(/\\sin/g, 'sin')
          .replace(/\\cos/g, 'cos')
          .replace(/\\tan/g, 'tan')
          .replace(/\^\{([^{}]+)\}/g, '^$1')
          .replace(/\_\{([^{}]+)\}/g, '_$1')
          .replace(/[\{\}]/g, ''); // strip remaining braces
          
        return (
          <span 
            key={index} 
            className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded font-mono text-xs inline-block"
            title="Simplified equation view"
          >
            {plainMathText}
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
