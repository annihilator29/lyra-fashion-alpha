'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface BlogPostContentProps {
  content: string;
}

export function BlogPostContent({ content }: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize syntax highlighting on mount and when content changes
  useEffect(() => {
    if (contentRef.current) {
      // Find all code blocks and apply syntax highlighting
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        const element = block as HTMLElement;
        const result = hljs.highlightAuto(element.textContent || '');
        element.innerHTML = result.value;
      });
    }
  }, [content]);

  return (
    <div ref={contentRef} className="prose prose-lg prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mb-4 mt-8 font-playfair text-3xl font-bold text-gray-900">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="mb-3 mt-6 font-playfair text-2xl font-bold text-gray-900">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-2 mt-4 font-playfair text-xl font-bold text-gray-900">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-primary underline hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-primary/20 bg-gray-50 py-3 pl-6 pr-4 italic text-gray-700">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            
            if (isInline) {
              return (
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800">
                  {children}
                </code>
              );
            }

            // Extract language from className (e.g., "language-javascript")
            const language = className?.replace('language-', '') || '';
            
            return (
              <pre className="my-6 overflow-x-auto rounded-lg bg-gray-900 p-4">
                <code className={`language-${language} hljs`}>
                  {children}
                </code>
              </pre>
            );
          },
          img: ({ src, alt }) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={alt || ''}
              className="my-6 rounded-lg"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
