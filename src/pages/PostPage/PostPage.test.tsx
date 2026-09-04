import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import PostPage from './PostPage';
import routes from '../../routes/route';

function renderPostPage() {
  const router = createMemoryRouter(
    [
      {
        path: routes.POST,
        element: <PostPage />,
      },
    ],
    { initialEntries: [routes.POST] },
  );

  render(<RouterProvider router={router} />);
}

describe('PostPage', () => {
  it('renders the post list', async () => {
    renderPostPage();

    expect(
      screen.getByRole('heading', { level: 1, name: '게시글' }),
    ).toHaveClass('sr-only');
    expect(document.body).not.toHaveTextContent(
      '내가 공부하고 만든 것들에 대한 기록들.',
    );
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute('content', '내가 공부하고 만든 것들에 대한 기록들.');
    expect(screen.getByText(/총 \d+건의 게시물/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /효율적인 Android CI 구축/ }),
    ).toBeInTheDocument();
  });

  it('filters the list by the selected category', async () => {
    const user = userEvent.setup();
    renderPostPage();

    const all = screen.getByRole('button', { name: '전체' });
    const philosophy = screen.getByRole('button', { name: '철학' });
    expect(all).toHaveAttribute('aria-pressed', 'true');

    await user.click(philosophy);

    expect(philosophy).toHaveAttribute('aria-pressed', 'true');
    expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('총 1건의 게시물')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /하이데거/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /효율적인 Android CI 구축/ }),
    ).not.toBeInTheDocument();

    await user.click(all);

    expect(
      screen.getByRole('link', { name: /효율적인 Android CI 구축/ }),
    ).toBeInTheDocument();
  });
});
