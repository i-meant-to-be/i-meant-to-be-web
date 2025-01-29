import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './HomePage';
import '@testing-library/jest-dom';

describe('HomePage', () => {
  it('checks button content', async () => {
    render(<HomePage />);

    expect(screen.getByRole('button', { name: '강시운' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '소프트웨어' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '커피' })).toBeInTheDocument();
  });
});
