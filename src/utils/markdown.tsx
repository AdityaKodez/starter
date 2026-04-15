import { memo } from "react";
import ReactMarkdown from "react-markdown";

export const MarkdownRenderer = memo(({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => {
          void node;
          return <h1 className="text-2xl font-semibold tracking-tight" {...props} />;
        },
        h2: ({ node, ...props }) => {
          void node;
          return <h2 className="text-xl font-semibold tracking-tight" {...props} />;
        },
        h3: ({ node, ...props }) => {
          void node;
          return <h3 className="text-lg font-semibold tracking-tight" {...props} />;
        },
        p: ({ node, ...props }) => {
          void node;
          return <p className="text-sm leading-7 text-foreground/90" {...props} />;
        },
        ul: ({ node, ...props }) => {
          void node;
          return <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/90" {...props} />;
        },
        ol: ({ node, ...props }) => {
          void node;
          return <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground/90" {...props} />;
        },
        li: ({ node, ...props }) => {
          void node;
          return <li className="pl-1" {...props} />;
        },
        blockquote: ({ node, ...props }) => {
          void node;
          return <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground" {...props} />;
        },
        strong: ({ node, ...props }) => {
          void node;
          return <strong className="font-semibold text-foreground" {...props} />;
        },
        code: ({ node, ...props }) => {
          void node;
          return <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem]" {...props} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
})


MarkdownRenderer.displayName = "MarkdownRenderer";