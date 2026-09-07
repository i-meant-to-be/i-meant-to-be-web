import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ScrollToTop', () => {
  it('scrolls to the top when the pathname changes but not for a hash change', async () => {
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    const router = createMemoryRouter(
      [
        {
          element: <ScrollToTop />,
          children: [
            { path: '/first', element: <div>First page</div> },
            { path: '/second', element: <div>Second page</div> },
          ],
        },
      ],
      { initialEntries: ['/first'] },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    await act(() => router.navigate('/second'));
    expect(scrollTo).toHaveBeenCalledTimes(2);

    await act(() => router.navigate('/second#section'));
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });
});
