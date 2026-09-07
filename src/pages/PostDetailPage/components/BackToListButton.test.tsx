import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BackToListButton from './BackToListButton';

describe('BackToListButton', () => {
  it('only shows its text on desktop while keeping an accessible name', () => {
    render(
      <MemoryRouter>
        <BackToListButton />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: '게시글 목록으로 돌아가기' }),
    ).toBeInTheDocument();
    expect(screen.getByText('목록')).toHaveClass('hidden', 'md:inline');
  });
});
