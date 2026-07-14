import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HeaderButton from './HeaderButton';

describe('HeaderButton', () => {
  it('uses a filled style when selected', () => {
    const markup = renderToStaticMarkup(
      <HeaderButton onSelected={true}>selected</HeaderButton>,
    );

    expect(markup).toContain('bg-indigo');
    expect(markup).toContain('text-cream');
    expect(markup).not.toContain('border-indigo');
  });

  it('uses an outlined style when not selected', () => {
    const markup = renderToStaticMarkup(
      <HeaderButton onSelected={false}>not selected</HeaderButton>,
    );

    expect(markup).toContain('border-4');
    expect(markup).toContain('border-indigo');
    expect(markup).toContain('bg-transparent');
    expect(markup).toContain('text-indigo');
  });
});
