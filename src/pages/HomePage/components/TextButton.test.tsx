import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TextButton from './TextButton';

describe('TextButton', () => {
  it('renders an external anchor when a url is given', () => {
    render(<TextButton text="커피" url="https://example.com" />);

    const link = screen.getByRole('link', { name: '커피' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders plain inline text when no url is given', () => {
    render(<TextButton text="커피" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('커피')).toBeInTheDocument();
  });

  it('never renders a heading', () => {
    render(<TextButton text="커피" url="https://example.com" />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
