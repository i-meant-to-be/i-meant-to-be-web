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
      draft: false,
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

  it('treats draft: true as a draft post', () => {
    const raw = `---
title: 제목
date: 2025-01-01
draft: true
---

본문
`;

    expect(parsePost(raw).meta.draft).toBe(true);
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
});
