import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import PostPage from './PostPage';
import routes from '../../routes/route';

describe('PostPage', () => {
  it('renders the post list', async () => {
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

    expect(
      screen.getByRole('link', { name: /효율적인 Android CI 구축/ }),
    ).toBeInTheDocument();
  });
});
