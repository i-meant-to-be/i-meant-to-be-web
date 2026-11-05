import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import PortfolioEntry from './PortfolioEntry';

describe('PortfolioEntry', () => {
  const entry = {
    id: 'example',
    title: '프로젝트',
    period: '개발 기간',
    team: '개인',
    context: '프로젝트 설명',
    role: '개발',
    contributions: [],
  };

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

  it('expands and collapses stacks independently for each entry', async () => {
    const user = userEvent.setup();
    render(
      <>
        <PortfolioEntry
          {...entry}
          technologies={['Kotlin', 'Compose', 'KMP', 'Gradle']}
        />
        <PortfolioEntry
          {...entry}
          id="second"
          title="다른 프로젝트"
          technologies={['React', 'TypeScript', 'Vite', 'Vitest']}
        />
      </>,
    );

    const first = within(screen.getByRole('article', { name: '프로젝트' }));
    const second = within(
      screen.getByRole('article', { name: '다른 프로젝트' }),
    );
    const toggle = first.getByRole('button', { name: '↓ 더 보기' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'example-stack');
    expect(first.getAllByRole('listitem')).toHaveLength(3);
    expect(first.queryByText('Gradle')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(first.getByText('Gradle')).toBeInTheDocument();
    expect(first.getByRole('button', { name: '↑ 접기' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(second.queryByText('Vitest')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(first.queryByText('Gradle')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([
    { technologies: [] },
    { technologies: ['Kotlin'] },
    { technologies: ['Kotlin', 'Compose', 'KMP'] },
  ])(
    'does not show a toggle for a stack of at most three items: $technologies',
    ({ technologies }) => {
      render(<PortfolioEntry {...entry} technologies={technologies} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
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

  it('renders independent career and project content using the same component', () => {
    render(
      <>
        <PortfolioEntry
          id="career"
          title="직장 예시"
          period="재직 기간"
          team="소속 팀"
          technologies={['Kotlin', 'Jetpack Compose']}
          achievements={['팀 프로젝트 성과']}
          context="서비스 맥락"
          role="담당 기능"
          contributions={[
            {
              title: '직장 기여',
              problem: '재현한 오류',
              action: '원인을 분석하고 수정',
              result: '오류 재현되지 않음',
              verification: '회귀 테스트',
            },
          ]}
          evidenceLinks={[
            { label: '구현 PR', url: 'https://example.com/pull/1' },
          ]}
        />
        <PortfolioEntry
          id="project"
          title="프로젝트 예시"
          period="개발 기간"
          team="개인"
          context="학습 과제"
          role="기능 구현"
          contributions={[
            {
              title: '프로젝트 기여',
              problem: '실험할 동작',
              action: '원리를 적용',
              result: '로컬 동작 확인',
            },
          ]}
          evidenceLinks={[]}
        />
      </>,
    );

    const career = within(screen.getByRole('article', { name: '직장 예시' }));
    const project = within(
      screen.getByRole('article', { name: '프로젝트 예시' }),
    );
    expect(career.getByText('회귀 테스트')).toBeInTheDocument();
    expect(career.getByText('Kotlin').tagName).toBe('LI');
    expect(career.getByText('Jetpack Compose').tagName).toBe('LI');
    expect(career.getByText('팀 프로젝트 성과')).toBeInTheDocument();
    expect(career.getByRole('link', { name: '구현 PR' })).toHaveAttribute(
      'href',
      'https://example.com/pull/1',
    );
    expect(project.getByText('로컬 동작 확인')).toBeInTheDocument();
    expect(project.queryByText('직장 기여')).not.toBeInTheDocument();
    expect(project.queryByText('검증 조건')).not.toBeInTheDocument();
    expect(project.queryByText('진행 상태')).not.toBeInTheDocument();
    expect(project.queryByText('프로젝트 성과')).not.toBeInTheDocument();
    expect(project.queryByRole('navigation')).not.toBeInTheDocument();
    const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
