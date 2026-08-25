import { describe, expect, it } from 'vitest';
import { extractHeadings } from './extractHeadings';

describe('extractHeadings', () => {
  it('extracts headings up to depth 3 with slugs', () => {
    const content = `
## 제목 A

문단.

### 제목 B

#### 제목 C (제외되어야 함)

## 제목 A
`;

    expect(extractHeadings(content)).toEqual([
      { depth: 2, text: '제목 A', slug: '제목-a' },
      { depth: 3, text: '제목 B', slug: '제목-b' },
      { depth: 2, text: '제목 A', slug: '제목-a-1' },
    ]);
  });

  it('ignores headings inside fenced code blocks', () => {
    const content = `
## 진짜 제목

\`\`\`md
# 코드 블럭 안의 가짜 제목
\`\`\`
`;

    expect(extractHeadings(content)).toEqual([
      { depth: 2, text: '진짜 제목', slug: '진짜-제목' },
    ]);
  });

  it('strips inline markdown from heading text', () => {
    const content = '## **굵은** 제목과 `코드`';

    expect(extractHeadings(content)).toEqual([
      { depth: 2, text: '굵은 제목과 코드', slug: '굵은-제목과-코드' },
    ]);
  });

  it('returns an empty list when there are no headings', () => {
    expect(extractHeadings('그냥 문단입니다.')).toEqual([]);
  });
});
