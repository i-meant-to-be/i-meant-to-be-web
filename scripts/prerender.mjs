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

function renderPage(routePath) {
  const { html, head } = render(routePath);
  return (
    template
      .replace(ROOT_PLACEHOLDER, `<div id="root">${html}</div>`)
      // 템플릿의 정적 <title>은 라우트별 태그로 대체된다.
      .replace(/\s*<title>[^<]*<\/title>/, '')
      .replace('</head>', `  ${head}\n  </head>`)
  );
}

const paths = getPaths();

for (const routePath of paths) {
  write(outputPathFor(routePath), renderPage(routePath));
}

// Vercel은 루트의 404.html을 없는 정적 경로의 응답 본문으로 사용하고
// 상태 코드는 404로 유지한다. 색인·일반 프리렌더 경로에는 포함하지 않는다.
write(path.join(distDir, '404.html'), renderPage('/404'));

write(path.join(distDir, 'sitemap.xml'), getSitemapXml());
write(path.join(distDir, 'rss.xml'), getRssXml());

console.log(
  `prerendered ${paths.length} pages and 404.html, plus sitemap.xml and rss.xml.`,
);
