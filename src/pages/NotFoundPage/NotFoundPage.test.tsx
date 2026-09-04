import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import routeObjects from '../../routes/routes';

describe('NotFoundPage', () => {
  it('renders for an unknown route and links back to valid pages', () => {
    const router = createMemoryRouter(routeObjects, {
      initialEntries: ['/no-such-page'],
    });

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '페이지를 찾을 수 없어요.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '홈으로 돌아가기' }),
    ).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('link', { name: '게시글 목록으로 돌아가기' }),
    ).toHaveAttribute('href', '/post');
  });
});
