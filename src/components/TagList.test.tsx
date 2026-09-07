import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TagList from './TagList';

describe('TagList', () => {
  it.each([
    ['개발', 'bg-indigo', 'bg-indigo/10', 'text-indigo'],
    ['철학', 'bg-teal', 'bg-teal/10', 'text-teal'],
  ] as const)(
    'renders the %s category and tags with their colors',
    (category, categoryColor, tagBackground, tagColor) => {
      render(<TagList category={category} tags={['세부 태그']} />);

      expect(screen.getByText(category)).toHaveClass(
        categoryColor,
        'text-cream',
      );
      expect(screen.getByText('세부 태그')).toHaveClass(
        tagBackground,
        tagColor,
      );
    },
  );
});
