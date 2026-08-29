import { describe, expect, it } from 'vitest';
import { collectRefs, checkRef } from './check-post-images.mjs';

describe('collectRefs', () => {
  it('collects markdown and html image refs with line numbers', () => {
    const body = ['![a](/posts/x/a.png)', '', '<img src="/posts/x/b.png">'].join(
      '\n',
    );
    expect(collectRefs(body)).toEqual([
      { url: '/posts/x/a.png', line: 1 },
      { url: '/posts/x/b.png', line: 3 },
    ]);
  });

  it('skips image syntax inside fenced code blocks', () => {
    const body = [
      '## 예시',
      '```markdown',
      '![샘플](/posts/does-not-exist/missing.png)',
      '```',
      '![진짜](/posts/real/img.png)',
    ].join('\n');
    expect(collectRefs(body)).toEqual([
      { url: '/posts/real/img.png', line: 5 },
    ]);
  });

  it('handles tilde fences and longer fence markers', () => {
    const body = ['~~~', '![x](/nope.png)', '~~~', '````', '![y](/nope.png)', '````'].join(
      '\n',
    );
    expect(collectRefs(body)).toEqual([]);
  });

  it('strips a link title and angle brackets from the url', () => {
    expect(collectRefs('![a](</posts/x/a.png>)')).toEqual([
      { url: '/posts/x/a.png', line: 1 },
    ]);
    expect(collectRefs('![a](/posts/x/a.png "제목")')).toEqual([
      { url: '/posts/x/a.png', line: 1 },
    ]);
  });
});

describe('checkRef', () => {
  it('rejects external hotlinks', () => {
    expect(checkRef('https://velog.velcdn.com/x.png')).toMatch(/핫링크/);
    expect(checkRef('//cdn.example.com/x.png')).toMatch(/핫링크/);
  });

  it('rejects non-absolute paths', () => {
    expect(checkRef('./x.png')).toMatch(/절대경로/);
    expect(checkRef('x.png')).toMatch(/절대경로/);
  });

  it('flags an absolute path with no matching public file', () => {
    expect(checkRef('/posts/does-not-exist/missing.png')).toMatch(/존재하지 않음/);
  });

  it('passes data uris', () => {
    expect(checkRef('data:image/png;base64,iVBORw0KGgo=')).toBeNull();
  });
});
