import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import routes from '../routes/route';
import Header from './Header';

const cases = [
  { label: '홈', path: routes.ROOT },
  { label: '게시글', path: routes.POST },
  { label: '음악', path: routes.MUSIC },
];

describe('Header', () => {
  it.each(cases)('selects the $label link at $path', ({ label, path }) => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={[path]}>
        <Header />
      </MemoryRouter>,
    );
    const links = markup.match(/<a\b[^>]*>/g) ?? [];
    const selectedLink = links.find((link) =>
      link.includes(`aria-label="${label}"`),
    );

    expect(links).toHaveLength(cases.length);
    expect(selectedLink).toContain('aria-current="page"');
    expect(
      links.filter((link) => link.includes('aria-current="page"')),
    ).toHaveLength(1);
  });
});
