export interface PostMeta {
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
}

export interface Post {
  meta: PostMeta;
  content: string;
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

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

  const description =
    typeof fields.description === 'string' && fields.description
      ? fields.description
      : excerpt(content);
  const tags = Array.isArray(fields.tags) ? fields.tags : [];
  const draft = fields.draft === 'true';

  return {
    meta: { title, description, date, tags, draft },
    content: content.trim(),
  };
}
