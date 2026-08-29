import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(rootDir, 'src', 'posts', 'content');
const publicDir = path.join(rootDir, 'public');

const MARKDOWN_IMAGE = /!\[[^\]]*\]\(([^)]+)\)/g;
const HTML_IMAGE = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;

/** `(url "title")` 형태에서 url만, 감싸는 <> 제거, 쿼리/해시 제거 */
function cleanUrl(raw) {
  let url = raw.trim();
  const spaceIndex = url.search(/\s/);
  if (spaceIndex !== -1) url = url.slice(0, spaceIndex);
  if (url.startsWith('<') && url.endsWith('>')) url = url.slice(1, -1);
  return url;
}

function collectRefs(body) {
  const refs = [];
  const lines = body.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of [MARKDOWN_IMAGE, HTML_IMAGE]) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        refs.push({ url: cleanUrl(match[1]), line: index + 1 });
      }
    }
  });
  return refs;
}

function checkRef(url) {
  if (url.startsWith('data:')) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
    return '외부 이미지 핫링크 금지 (posts.md §4-4) — 내려받아 public/posts/<id>/ 에 저장';
  }
  if (!url.startsWith('/')) {
    return '상대경로는 런타임에 해석되지 않음 (posts.md §4-3) — /posts/... 절대경로를 쓸 것';
  }
  const filePath = path.join(publicDir, decodeURIComponent(url.split(/[?#]/)[0]));
  if (!existsSync(filePath)) {
    return `public${url} 파일이 존재하지 않음`;
  }
  return null;
}

const errors = [];
let checked = 0;

for (const file of readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
  const body = readFileSync(path.join(postsDir, file), 'utf-8');
  for (const ref of collectRefs(body)) {
    checked += 1;
    const problem = checkRef(ref.url);
    if (problem) {
      errors.push(`  ${file}:${ref.line}  ${ref.url}\n    → ${problem}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`게시물 이미지 참조 ${errors.length}건 오류:\n${errors.join('\n')}`);
  process.exit(1);
}

console.log(`check-post-images: 이미지 참조 ${checked}건 확인, 문제 없음.`);
