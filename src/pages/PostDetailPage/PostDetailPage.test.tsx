import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import PostDetailPage from './PostDetailPage';
import routes from '../../routes/route';

function renderAt(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: routes.POST_DETAIL,
        element: <PostDetailPage />,
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(<RouterProvider router={router} />);
}

describe('PostDetailPage', () => {
  it('renders an existing post', () => {
    renderAt('/post/0001-hello-world');

    expect(
      screen.getByRole('heading', { name: '첫 번째 포스트' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/테스트용 포스트입니다/)).toBeInTheDocument();
  });

  it('shows a not-found message for an unknown id', () => {
    renderAt('/post/does-not-exist');

    expect(
      screen.getByRole('heading', { name: /찾을 수 없어요/ }),
    ).toBeInTheDocument();
  });
});
