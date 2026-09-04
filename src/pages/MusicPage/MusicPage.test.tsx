import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import routes from '../../routes/route';
import MusicPage from './MusicPage';

describe('MusicPage', () => {
  it('renders its heading, description, and purpose-specific video title', () => {
    const router = createMemoryRouter(
      [{ path: routes.MUSIC, element: <MusicPage /> }],
      { initialEntries: [routes.MUSIC] },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('heading', { level: 1, name: '음악' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('내가 좋아하는 음악을 모아둔 곳.'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('음악 플레이리스트 YouTube 영상'),
    ).toBeInTheDocument();
  });
});
