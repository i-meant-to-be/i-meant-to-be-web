import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Seo from './Seo';

describe('Seo', () => {
  it('hoists the route metadata into document.head', () => {
    render(<Seo path="/music" />);

    expect(document.title).toBe('음악 | imeanttobe');
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://imeantto.be/music');
    expect(
      document.head
        .querySelector('meta[property="og:type"]')
        ?.getAttribute('content'),
    ).toBe('website');
  });
});
