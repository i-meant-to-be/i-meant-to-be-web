import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(rootDir, 'dist');
const serverEntry = path.join(rootDir, 'dist-ssr', 'entry-server.js');

const { render, getPaths, getSitemapXml, getRssXml } = await import(
  pathToFileURL(serverEntry).href
);

const template = readFileSync(path.join(distDir, 'index.html'), 'utf-8');
const ROOT_PLACEHOLDER = '<div id="root"></div>';

if (!template.includes(ROOT_PLACEHOLDER)) {
  throw new Error(
    `dist/index.html does not contain "${ROOT_PLACEHOLDER}" — prerender cannot inject markup.`,
  );
}

function outputPathFor(routePath) {
  return routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, routePath.slice(1), 'index.html');
}

function write(filePath, contents) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
}

const paths = getPaths();

for (const routePath of paths) {
  const { html, head } = render(routePath);
  const page = template
    .replace(ROOT_PLACEHOLDER, `<div id="root">${html}</div>`)
    // 템플릿의 정적 <title>은 라우트별 태그로 대체된다.
    .replace(/\s*<title>[^<]*<\/title>/, '')
    .replace('</head>', `  ${head}\n  </head>`);

  write(outputPathFor(routePath), page);
}

write(path.join(distDir, 'sitemap.xml'), getSitemapXml());
write(path.join(distDir, 'rss.xml'), getRssXml());

console.log(
  `prerendered ${paths.length} pages, plus sitemap.xml and rss.xml.`,
);
