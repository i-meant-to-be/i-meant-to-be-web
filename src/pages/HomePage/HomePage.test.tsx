import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './HomePage';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

describe('HomePage', () => {
  it('renders highlighted names inline without extra headings', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <HomePage />,
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.getByText('강시운')).toBeInTheDocument();
    expect(screen.getByText('소프트웨어')).toBeInTheDocument();
    expect(screen.getByText('커피')).toBeInTheDocument();

    // 문단 안에 블록 레벨 heading이 끼면 검색 스니펫이 문장 중간에서 끊긴다.
    // 페이지 전체의 heading은 sr-only h1 하나뿐이어야 한다.
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });
});
