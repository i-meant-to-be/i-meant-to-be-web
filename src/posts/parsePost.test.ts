import { describe, expect, it } from 'vitest';
import { parsePost } from './parsePost';

describe('parsePost', () => {
  it('parses frontmatter fields and trims content', () => {
    const raw = `---
title: 제목
description: 설명
date: 2025-01-01
tags: [태그1, 태그2]
---

본문입니다.
`;

    const post = parsePost(raw);

    expect(post.meta).toEqual({
      title: '제목',
      description: '설명',
      date: '2025-01-01',
      tags: ['태그1', '태그2'],
    });
    expect(post.content).toBe('본문입니다.');
  });

  it('falls back to an excerpt when description is missing', () => {
    const raw = `---
title: 제목
date: 2025-01-01
---

첫 문단입니다.

두번째 문단.
`;

    const post = parsePost(raw);

    expect(post.meta.description).toBe('첫 문단입니다.');
  });

  it('throws when required fields are missing', () => {
    const raw = `---
description: 설명
---

본문
`;

    expect(() => parsePost(raw)).toThrow();
  });

  it('throws when there is no frontmatter block', () => {
    expect(() => parsePost('그냥 본문')).toThrow();
  });

  it('throws when date is not in YYYY-MM-DD format', () => {
    const raw = `---
title: 제목
date: 2025/01/01
---

본문
`;

    expect(() => parsePost(raw)).toThrow();
  });

  it('throws when date is not a real calendar date', () => {
    const raw = `---
title: 제목
date: 2025-02-30
---

본문
`;

    expect(() => parsePost(raw)).toThrow();
  });
});
