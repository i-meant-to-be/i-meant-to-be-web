import type { Heading } from '../../../posts/extractHeadings';

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  const minDepth = Math.min(...headings.map((heading) => heading.depth));

  return (
    <nav
      aria-label="목차"
      className="mt-8 bg-on-cream-enhanced/5 p-4 md:mt-10 md:p-8"
    >
      <p className="text-sm font-bold text-on-cream/80 md:text-base">목차</p>
      <ul className="mt-3 space-y-1 text-sm md:mt-4 md:space-y-2 md:text-sm">
        {headings.map((heading) => (
          <li
            key={heading.slug}
            style={{ paddingLeft: `${(heading.depth - minDepth) * 1}rem` }}
          >
            <a
              href={`#${heading.slug}`}
              className="break-keep text-on-cream/80 hover:text-indigo"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
