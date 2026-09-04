import { describe, expect, it } from 'vitest';
import { CATEGORIES, parsePost } from './parsePost';

describe('parsePost', () => {
  it('parses frontmatter fields and trims content', () => {
    const raw = `---
title: 제목
description: 설명
date: 2025-01-01
category: 개발
tags: [태그1, 태그2]
---

본문입니다.
`;

    const post = parsePost(raw);

    expect(post.meta).toEqual({
      title: '제목',
      description: '설명',
      date: '2025-01-01',
      category: '개발',
      tags: ['태그1', '태그2'],
    });
    expect(post.content).toBe('본문입니다.');
  });

  it('falls back to an excerpt when description is missing', () => {
    const raw = `---
title: 제목
date: 2025-01-01
category: 개발
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

  it('parses a valid updated date', () => {
    const post = parsePost(`---
title: 제목
date: 2025-01-01
updated: 2025-02-03
category: 개발
---

본문
`);

    expect(post.meta.updated).toBe('2025-02-03');
  });

  it.each(['2025/02/03', '2025-02-30'])(
    'throws when updated is not a valid date: %s',
    (updated) => {
      expect(() =>
        parsePost(`---
title: 제목
date: 2025-01-01
updated: ${updated}
---

본문
`),
      ).toThrow('"updated" must be a valid YYYY-MM-DD date');
    },
  );

  it('throws when category is missing', () => {
    expect(() =>
      parsePost(`---
title: 제목
date: 2025-01-01
---

본문
`),
    ).toThrow('missing required field "category"');
  });

  it('throws when category is not one of the allowed values', () => {
    expect(() =>
      parsePost(`---
title: 제목
date: 2025-01-01
category: 잡담
---

본문
`),
    ).toThrow(`"category" must be one of: ${CATEGORIES.join(', ')}`);
  });

  it('throws when updated is earlier than date', () => {
    expect(() =>
      parsePost(`---
title: 제목
date: 2025-02-03
updated: 2025-02-02
---

본문
`),
    ).toThrow('"updated" must not be earlier than "date"');
  });
});
