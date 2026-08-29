---
name: imeanttobe-add-new-post
description: >
  Place an external Markdown file into this repo's blog-post conventions — id/slug,
  frontmatter, heading levels, local image migration — then validate and open a PR,
  following docs/workflows/add-new-post.md. Takes the source Markdown path as an argument.
  Use when the user invokes /imeanttobe-add-new-post <path> or asks to add / import a blog
  post from an external Markdown file.
argument-hint: <path-to-source-markdown>
---

`docs/workflows/add-new-post.md`를 처음부터 끝까지 읽고 그대로 따름. 그 문서가 유일한
기준이며 독립적으로 바뀔 수 있으므로 매번 다시 읽음 — 요약·기억에 의존하지 않음.

인자는 원본 Markdown 경로임 (예: `/imeanttobe-add-new-post C:\Post\NEW_POST.md`). 인자가
없으면 먼저 요청함.
