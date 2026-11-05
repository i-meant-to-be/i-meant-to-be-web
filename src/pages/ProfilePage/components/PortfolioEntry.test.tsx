import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PortfolioEntry from './PortfolioEntry';

describe('PortfolioEntry', () => {
  const entry = {
    id: 'example',
    title: '프로젝트',
    period: '개발 기간',
    team: '개인',
    context: '프로젝트 설명',
    summary: '프로젝트 요약',
    contributions: [],
  };

  it('renders contribution Markdown as semantic paragraphs, code, emphasis and links', () => {
    render(
      <PortfolioEntry
        {...entry}
        contributions={[
          {
            title: 'Markdown 기여',
            description:
              '**성과**와 `Dispatchers.IO`\n\n[검증 자료](https://example.com)\n\n```kotlin\nval count = 10\n```',
          },
        ]}
      />,
    );
    const contribution = within(
      screen.getByRole('region', { name: 'Markdown 기여' }),
    );
    expect(contribution.getByText('성과').tagName).toBe('STRONG');
    expect(contribution.getByText('Dispatchers.IO').tagName).toBe('CODE');
    expect(contribution.getByRole('link', { name: '검증 자료' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
    expect(contribution.getByText('val count = 10').closest('pre')).not.toBeNull();
    expect(contribution.getByText('성과').closest('p')).not.toContainElement(
      contribution.getByRole('link'),
    );
  });

  it('renders only configured project links in the fixed category order', () => {
    const { rerender } = render(
      <PortfolioEntry
        {...entry}
        projectLinks={{
          playStore: 'https://play.google.com/store/apps/details?id=example',
          homepage: 'https://example.com',
          github: 'https://github.com/example/project',
        }}
      />,
    );

    const links = within(
      screen.getByRole('navigation', { name: '프로젝트 프로젝트 링크' }),
    ).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'GitHub 저장소',
      '홈 페이지',
      'Play 스토어',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://github.com/example/project',
      'https://example.com',
      'https://play.google.com/store/apps/details?id=example',
    ]);

    rerender(
      <PortfolioEntry
        {...entry}
        projectLinks={{ homepage: 'https://example.com' }}
      />,
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: '홈 페이지' })).toBeInTheDocument();

    rerender(<PortfolioEntry {...entry} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows at most three major stacks without an expand button', () => {
    render(
      <PortfolioEntry
        {...entry}
        technologies={['KMP', 'KSP', 'NDK', 'Gradle']}
      />,
    );
    expect(screen.getByText('주요 스택')).toBeInTheDocument();
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['KMP', 'KSP', 'NDK']);
    expect(screen.queryByText('Gradle')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('역할')).not.toBeInTheDocument();
  });

  it.each([
    [0, 'indigo'],
    [1, 'rose'],
    [2, 'amber'],
    [3, 'teal'],
    [4, 'indigo'],
  ])(
    'uses %s project index to select %s callout color',
    (projectIndex, color) => {
      render(
        <PortfolioEntry {...entry} projectIndex={projectIndex as number} />,
      );
      expect(screen.getByText('프로젝트 요약').closest('.p-4')).toHaveClass(
        'bg-' + color + '/(--callout-background-opacity)',
      );
    },
  );

  it('renders an optional round logo and omits it when absent', () => {
    const { rerender } = render(
      <PortfolioEntry {...entry} logoSrc="/profile/logos/example.png" />,
    );
    expect(screen.getByRole('img', { name: '프로젝트 로고' })).toHaveAttribute(
      'src',
      '/profile/logos/example.png',
    );
    expect(screen.getByRole('img')).toHaveClass('rounded-full');

    rerender(<PortfolioEntry {...entry} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows one project callout at the top of the right column and keeps evidence with its contribution', () => {
    render(
      <PortfolioEntry
        {...entry}
        contributions={[
          {
            title: '첫 번째 기여',
            description: '첫 번째 설명',
            evidenceLinks: [
              { title: '구현 PR', url: 'https://example.com/pull/1' },
              { title: '설계 문서', url: 'https://example.com/docs' },
            ],
          },
          { title: '두 번째 기여', description: '두 번째 설명' },
          {
            title: '세 번째 기여',
            description: '세 번째 설명',
            evidenceLinks: [],
          },
        ]}
      />,
    );

    const article = screen.getByRole('article', { name: '프로젝트' });
    const callout = screen.getByText('프로젝트 요약').closest('.p-4');
    expect(screen.getAllByText('프로젝트 요약')).toHaveLength(1);
    expect(article.lastElementChild?.firstElementChild).toBe(callout);
    const first = within(screen.getByRole('region', { name: '첫 번째 기여' }));
    expect(first.getByRole('heading')).toHaveClass('font-bold');
    expect(first.getByText('첫 번째 설명')).toBeInTheDocument();
    expect(first.getByRole('link', { name: '구현 PR' })).toHaveAttribute(
      'href',
      'https://example.com/pull/1',
    );
    expect(first.getByRole('link', { name: '설계 문서' })).toHaveAttribute(
      'href',
      'https://example.com/docs',
    );
    expect(first.queryByText('근거')).not.toBeInTheDocument();
    for (const title of ['두 번째 기여', '세 번째 기여']) {
      const contribution = within(screen.getByRole('region', { name: title }));
      expect(contribution.queryByRole('link')).not.toBeInTheDocument();
      expect(contribution.queryByText('근거')).not.toBeInTheDocument();
    }
    const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
