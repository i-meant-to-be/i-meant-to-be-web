import GithubSlugger from 'github-slugger';

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

const HEADING_PATTERN = /^(#{1,6})\s+(.+?)\s*#*$/;
const MAX_TOC_DEPTH = 3;

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
}

/**
 * rehype-slug가 렌더링 시 부여하는 id와 값이 어긋나지 않도록, 같은 슬러그 생성기(github-slugger)를
 * 문서 순서대로 모든 제목(레벨 무관)에 적용한 뒤 1~3레벨만 목차 대상으로 남긴다.
 */
export function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inCodeBlock = false;

  for (const line of content.split(/\r?\n/)) {
    if (/^```/.test(line.trim())) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(HEADING_PATTERN);
    if (!match) continue;

    const depth = match[1].length;
    const text = stripInlineMarkdown(match[2]);
    const slug = slugger.slug(text);

    if (depth <= MAX_TOC_DEPTH) {
      headings.push({ depth, text, slug });
    }
  }

  return headings;
}
