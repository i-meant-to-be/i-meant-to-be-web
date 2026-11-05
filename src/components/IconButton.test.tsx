import { render, screen } from '@testing-library/react';
import { IoLogoGithub } from 'react-icons/io5';
import { describe, expect, it } from 'vitest';
import IconButton from './IconButton';

describe('IconButton', () => {
  it.each([undefined, ''])('omits an icon without a destination (%s)', (url) => {
    const { container } = render(
      <IconButton label="GitHub" icon={IoLogoGithub} url={url} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps a named external link and its decorative SVG when configured', () => {
    render(
      <IconButton
        label="GitHub"
        icon={IoLogoGithub}
        url="https://github.com/example"
      />,
    );
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
