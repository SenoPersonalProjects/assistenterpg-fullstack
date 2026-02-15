// components/compendio/ArtigoContent.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArtigoContentProps {
  conteudo: string;
}

export function ArtigoContent({ conteudo }: ArtigoContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-app-fg mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold text-app-fg mt-6 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-app-fg mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-app-fg mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside text-app-fg mb-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-app-fg mb-4 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="text-app-fg" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-app-primary" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-app-muted" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-app-surface px-1.5 py-0.5 rounded text-sm text-app-primary" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-app-surface p-4 rounded-lg overflow-x-auto mb-4" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-app-border rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-app-surface" {...props} />,
          th: ({ node, ...props }) => (
            <th className="border border-app-border px-4 py-2 text-left text-app-fg font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-app-border px-4 py-2 text-app-fg" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-app-primary pl-4 italic text-app-muted mb-4" {...props} />
          ),
        }}
      >
        {conteudo}
      </ReactMarkdown>
    </div>
  );
}
