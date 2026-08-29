import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(rootDir, 'src', 'posts', 'content');
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');

const SITE_URL = 'https://imeantto.be';
const STATIC_PATHS = ['/', '/post', '/music'];

function isDraft(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return false;
  const draftLine = match[1].match(/^draft:\s*(.*?)\s*$/m);
  if (!draftLine) return false;
  return draftLine[1].replace(/^["']|["']$/g, '') === 'true';
}

function getPostPaths() {
  return readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
    .filter((file) => !isDraft(readFileSync(path.join(postsDir, file), 'utf-8')))
    .map((file) => `/post/${file.replace(/\.md$/, '')}`);
}

const urls = [...STATIC_PATHS, ...getPostPaths()];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${SITE_URL}${url}</loc>\n  </url>`).join('\n')}
</urlset>
`;

writeFileSync(sitemapPath, xml);
console.log(`sitemap.xml generated with ${urls.length} URLs.`);
