import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProfileIntro from './ProfileIntro';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('ProfileIntro external links', () => {
  it('labels the contact link Mail and uses the configured email as its destination', () => {
    vi.stubEnv('VITE_CONTACT_EMAIL', 'developer@example.com');

    render(<ProfileIntro />);

    expect(screen.getByRole('link', { name: 'Mail' })).toHaveAttribute(
      'href',
      'mailto:developer@example.com',
    );
  });

  it('omits the contact link when no email is configured', () => {
    vi.stubEnv('VITE_CONTACT_EMAIL', undefined);

    const { container } = render(<ProfileIntro />);

    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('renders an interactive GitHub link when its environment URL is configured', () => {
    vi.stubEnv('VITE_GITHUB_PROFILE_URL', 'https://github.com/example');

    render(<ProfileIntro />);

    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link).toHaveClass('hover:underline', 'hover:text-indigo-enhanced');
  });

  it('renders non-interactive text when the GitHub URL is missing', () => {
    vi.stubEnv('VITE_GITHUB_PROFILE_URL', undefined);

    render(<ProfileIntro />);

    expect(
      screen.queryByRole('link', { name: 'GitHub' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('GitHub').tagName).toBe('SPAN');
    expect(screen.getByText('GitHub')).not.toHaveClass('hover:underline');
  });
});
