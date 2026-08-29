import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(rootDir, 'src', 'posts', 'content');
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');

const SITE_URL = 'https://imeantto.be';
const STATIC_PATHS = ['/', '/post', '/music'];

function getPostPaths() {
  return readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
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
