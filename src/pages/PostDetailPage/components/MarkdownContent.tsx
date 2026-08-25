import clsx from 'clsx';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import './highlight.css';

interface MarkdownContentProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 text-3xl font-bold break-keep first:mt-0 md:mt-12 md:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 text-2xl font-bold break-keep md:mt-10 md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-xl font-bold break-keep md:mt-8 md:text-2xl">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 break-keep leading-[1.8] md:mt-6 md:text-lg">
      {children}
    </p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-indigo underline hover:text-indigo-enhanced"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-1 pl-6 md:mt-6 md:space-y-2 md:pl-8">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-1 pl-6 md:mt-6 md:space-y-2 md:pl-8">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="break-keep md:text-lg">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-4 border-indigo/40 pl-4 text-on-cream/80 md:mt-6 md:pl-6 md:text-lg">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto bg-on-cream-enhanced/5 p-4 text-sm md:mt-6 md:p-6 md:text-base">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    if (!className) {
      return (
        <code className="rounded bg-on-cream-enhanced/5 px-1.5 py-0.5 font-mono text-sm md:px-2 md:py-1 md:text-base">
          {children}
        </code>
      );
    }
    return (
      <code className={clsx('font-mono text-sm md:text-base', className)}>
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto md:mt-6">
      <table className="w-full border-collapse text-sm md:text-base">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-on-cream/20 px-3 py-2 text-left font-bold md:px-4 md:py-3">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-on-cream/20 px-3 py-2 md:px-4 md:py-3">
      {children}
    </td>
  ),
  hr: () => <hr className="mt-8 border-on-cream/20 md:mt-10" />,
};

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
