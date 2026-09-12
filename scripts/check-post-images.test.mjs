import { describe, expect, it } from 'vitest';
import { collectRefs, checkRef } from './check-post-images.mjs';

describe('collectRefs', () => {
  it('collects markdown and html image refs with line numbers', () => {
    const body = ['![a](/post/x/a.png)', '', '<img src="/post/x/b.png">'].join(
      '\n',
    );
    expect(collectRefs(body)).toEqual([
      { url: '/post/x/a.png', line: 1 },
      { url: '/post/x/b.png', line: 3 },
    ]);
  });

  it('skips image syntax inside fenced code blocks', () => {
    const body = [
      '## 예시',
      '```markdown',
      '![샘플](/post/does-not-exist/missing.png)',
      '```',
      '![진짜](/post/real/img.png)',
    ].join('\n');
    expect(collectRefs(body)).toEqual([
      { url: '/post/real/img.png', line: 5 },
    ]);
  });

  it('handles tilde fences and longer fence markers', () => {
    const body = ['~~~', '![x](/nope.png)', '~~~', '````', '![y](/nope.png)', '````'].join(
      '\n',
    );
    expect(collectRefs(body)).toEqual([]);
  });

  it('strips a link title and angle brackets from the url', () => {
    expect(collectRefs('![a](</post/x/a.png>)')).toEqual([
      { url: '/post/x/a.png', line: 1 },
    ]);
    expect(collectRefs('![a](/post/x/a.png "제목")')).toEqual([
      { url: '/post/x/a.png', line: 1 },
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

  it('rejects absolute paths outside the post route', () => {
    expect(checkRef('/posts/x.png')).toMatch(/\/post\/<id>/);
  });

  it('flags an absolute path with no matching public file', () => {
    expect(checkRef('/post/does-not-exist/missing.png')).toMatch(/존재하지 않음/);
  });

  it('passes data uris', () => {
    expect(checkRef('data:image/png;base64,iVBORw0KGgo=')).toBeNull();
  });
});
