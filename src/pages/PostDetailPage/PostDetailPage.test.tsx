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
    renderAt('/post/0003-efficient-ci-with-github-actions-jetpack-compose');

    expect(
      screen.getByRole('heading', {
        name: '효율적인 Android CI 구축 w/ GitHub Actions - Jetpack Compose',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/보통 프로젝트를 위해 GitHub 저장소를 파면/)).toBeInTheDocument();
  });

  it('renders a table of contents whose links resolve to real heading ids', () => {
    renderAt('/post/0003-efficient-ci-with-github-actions-jetpack-compose');

    const tocLink = screen.getByRole('link', { name: '들어가기' });
    const href = tocLink.getAttribute('href');
    expect(href).toMatch(/^#/);

    const heading = document.getElementById(href!.slice(1));
    expect(heading).not.toBeNull();
    expect(heading).toHaveTextContent('들어가기');
  });

  it('shows a not-found message for an unknown id', () => {
    renderAt('/post/does-not-exist');

    expect(
      screen.getByRole('heading', { name: /찾을 수 없어요/ }),
    ).toBeInTheDocument();
  });
});
