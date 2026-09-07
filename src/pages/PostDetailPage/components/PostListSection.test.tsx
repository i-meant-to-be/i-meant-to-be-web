import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { PostWithId } from '../../../posts';
import PostListSection from './PostListSection';

const posts: PostWithId[] = [
  {
    id: '0001-test-post',
    meta: {
      title: '두 줄까지만 표시할 게시물 제목',
      description: '설명',
      date: '2026-09-07',
      category: '개발',
      tags: [],
    },
    content: '본문',
  },
];

describe('PostListSection', () => {
  it('clamps titles and only shows dates on desktop', () => {
    render(
      <MemoryRouter>
        <PostListSection posts={posts} />
      </MemoryRouter>,
    );

    expect(screen.getByText(posts[0].meta.title)).toHaveClass(
      'min-w-0',
      'line-clamp-2',
    );
    expect(screen.getByText('2026년 9월 7일')).toHaveClass(
      'hidden',
      'md:inline',
    );
  });
});
