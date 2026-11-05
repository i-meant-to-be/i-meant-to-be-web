import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import routeObjects from '../../routes/routes';

describe('ProfilePage', () => {
  it('renders the profile and resume projects through the shared route definition', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const router = createMemoryRouter(routeObjects, {
      initialEntries: ['/profile'],
    });

    render(<RouterProvider router={router} />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('select-text');
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      within(main)
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['소개', '프로젝트', '사용 기술', '관련 교육·활동']);
    expect(
      within(main)
        .getAllByRole('article')
        .map(
          (article) =>
            within(article).getByRole('heading', { level: 3 }).textContent,
        ),
    ).toEqual([
      'Hilit 하일릿',
      'Consensus 컨센서스',
      'Debate Timer 디베이트 타이머',
    ]);
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(
      '강시운',
    );
    expect(within(main).getByText('Shawn Kang')).toBeInTheDocument();
    expect(
      within(main).queryByRole('heading', { name: '직장 경력' }),
    ).not.toBeInTheDocument();
    expect(within(main).getAllByRole('heading', { level: 4 })).toHaveLength(4);
    const projects = within(screen.getByRole('region', { name: '프로젝트' }));
    expect(
      projects.queryByText(/작성하세요|작성용 틀|평균 x줄/),
    ).not.toBeInTheDocument();
    expect(projects.getAllByRole('link')).toHaveLength(10);
    expect(
      projects.getByRole('link', { name: 'Windows 포팅 저장소' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/debate-timer/debate-timer-fe-win',
    );
    const schools = within(screen.getByRole('region', { name: '학교' }));
    expect(
      schools
        .getAllByRole('listitem')
        .map((item) => item.querySelector('p')?.textContent),
    ).toEqual([
      '중앙대학교 서울캠퍼스 창의ICT공과대학 소프트웨어학부',
      '중앙대학교 서울캠퍼스 인문대학 철학과',
      '춘천고등학교',
    ]);
    const activities = within(screen.getByRole('region', { name: '활동' }));
    const activitiesList = activities.getByRole('list', { name: '활동 목록' });
    expect(
      Array.from(activitiesList.children).map(
        (item) => item.querySelector('p')?.textContent,
      ),
    ).toEqual(['YAPP 제28기', '과학기술정보통신부 AI/SW마에스트로 제13기']);
    expect(activities.getByText('Android 개발자로 참여').tagName).toBe('LI');
    expect(activities.getByText('데모데이 우수상 수상').tagName).toBe('LI');
    expect(activities.getByText('Flutter 개발자로 참여').tagName).toBe('LI');
    expect(main.querySelector('a[href="#"]')).toBeNull();
    expect(document.title).toBe('프로필 | imeanttobe');
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, follow',
    );
  });
});
