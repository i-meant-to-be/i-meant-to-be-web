export const CATEGORIES = ['개발', '철학'] as const;

export type Category = (typeof CATEGORIES)[number];

export interface PostMeta {
  title: string;
  description: string;
  date: string;
  updated?: string;
  /** 태그의 상위 분류. 게시글 목록의 필터 기준이다. */
  category: Category;
  tags: string[];
}

export interface Post {
  meta: PostMeta;
  content: string;
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isCategory(value: unknown): value is Category {
  return (CATEGORIES as readonly unknown[]).includes(value);
}

function excerpt(content: string): string {
  const firstParagraph = content
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .find((block) => block.length > 0 && !block.startsWith('#'));

  if (!firstParagraph) return '';
  return firstParagraph.length > 120
    ? `${firstParagraph.slice(0, 120)}...`
    : firstParagraph;
}

function parseFrontmatterValue(raw: string): string | string[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter((item) => item.length > 0);
  }
  return trimmed.replace(/^["']|["']$/g, '');
}

export function parsePost(raw: string): Post {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) {
    throw new Error(
      'Post is missing a frontmatter block (--- ... --- at the top of the file).',
    );
  }

  const [, frontmatterBlock, content] = match;
  const fields: Record<string, string | string[]> = {};

  for (const line of frontmatterBlock.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    fields[key] = parseFrontmatterValue(value);
  }

  const title = fields.title;
  const date = fields.date;
  if (typeof title !== 'string' || !title) {
    throw new Error('Post frontmatter is missing required field "title".');
  }
  if (typeof date !== 'string' || !date) {
    throw new Error('Post frontmatter is missing required field "date".');
  }
  if (!isValidDate(date)) {
    throw new Error('Post frontmatter "date" must be a valid YYYY-MM-DD date.');
  }

  const updated = fields.updated;
  if (updated !== undefined) {
    if (typeof updated !== 'string' || !isValidDate(updated)) {
      throw new Error(
        'Post frontmatter "updated" must be a valid YYYY-MM-DD date.',
      );
    }
    if (updated < date) {
      throw new Error(
        'Post frontmatter "updated" must not be earlier than "date".',
      );
    }
  }

  const category = fields.category;
  if (typeof category !== 'string' || !category) {
    throw new Error('Post frontmatter is missing required field "category".');
  }
  if (!isCategory(category)) {
    throw new Error(
      `Post frontmatter "category" must be one of: ${CATEGORIES.join(', ')}.`,
    );
  }

  const description =
    typeof fields.description === 'string' && fields.description
      ? fields.description
      : excerpt(content);
  const tags = Array.isArray(fields.tags) ? fields.tags : [];

  return {
    meta: {
      title,
      description,
      date,
      ...(updated ? { updated } : {}),
      category,
      tags,
    },
    content: content.trim(),
  };
}
