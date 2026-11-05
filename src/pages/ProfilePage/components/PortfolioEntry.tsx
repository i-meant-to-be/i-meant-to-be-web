import { useState } from 'react';
import clsx from 'clsx';
import {
  IoCalendarSharp,
  IoPeopleSharp,
  IoLayersSharp,
  IoPersonSharp,
  IoLogoGithub,
  IoGlobeSharp,
  IoLogoGooglePlaystore,
} from 'react-icons/io5';
import TextButton from '../../../components/TextButton';
import IconButton from '../../../components/IconButton';

const FIELD_CONTENT_CLASS_NAME = 'mt-2 md:mt-2';
const LEFT_COLUMN_SECTION_GAP_CLASS_NAME = 'gap-12 md:gap-16';
const GENERAL_INFO_ITEM_GAP_CLASS_NAME = 'space-y-4 md:space-y-6';

interface PortfolioEntryProps {
  id: string;
  title: string;
  logoSrc?: string;
  logoAlt?: string;
  projectLinks?: {
    github?: string;
    homepage?: string;
    playStore?: string;
  };
  period: string;
  team: string;
  technologies?: string[];
  achievements?: string[];
  context: string;
  role: string;
  contributions: {
    title: string;
    problem: string;
    action: string;
    result: string;
    verification?: string;
  }[];
  evidenceLinks?: { label: string; url: string }[];
}

export default function PortfolioEntry(props: PortfolioEntryProps) {
  const {
    id,
    title,
    logoSrc,
    logoAlt = `${title} 로고`,
    projectLinks,
    period,
    team,
    technologies = [],
    achievements = [],
    context,
    role,
    contributions,
    evidenceLinks = [],
  } = props;

  const [isStackExpanded, setIsStackExpanded] = useState(false);

  const visibleTechnologies = isStackExpanded
    ? technologies
    : technologies.slice(0, 3);
  const visibleProjectLinks = [
    { label: 'GitHub 저장소', url: projectLinks?.github, icon: IoLogoGithub },
    { label: '홈 페이지', url: projectLinks?.homepage, icon: IoGlobeSharp },
    {
      label: 'Play 스토어',
      url: projectLinks?.playStore,
      icon: IoLogoGooglePlaystore,
    },
  ].filter((link) => link.url);

  const handleStackToggle = () => setIsStackExpanded((expanded) => !expanded);

  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid min-w-0 gap-6 border-t border-on-cream/20 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:gap-10 md:py-8"
    >
      <header
        className={clsx(
          'min-w-0 flex flex-col',
          LEFT_COLUMN_SECTION_GAP_CLASS_NAME,
        )}
      >
        {/* 타이틀 영역 */}
        <div>
          {logoSrc && (
            <img
              src={logoSrc}
              alt={logoAlt}
              width={80}
              height={80}
              className="mb-4 size-16 rounded-full object-cover md:mb-6 md:size-20"
            />
          )}
          <h3
            id={`${id}-title`}
            className="text-lg font-bold text-on-cream-enhanced md:text-xl"
          >
            {title}
          </h3>
          <p className="mt-2 text-sm md:mt-3 md:text-sm">{context}</p>
          {visibleProjectLinks.length > 0 && (
            <nav
              aria-label={`${title} 프로젝트 링크`}
              className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm md:mt-4 md:gap-x-4 md:gap-y-2 md:text-sm"
            >
              {visibleProjectLinks.map((link) => (
                <IconButton
                  key={link.label}
                  label={link.label}
                  url={link.url}
                  icon={link.icon}
                  className="size-4 md:size-6"
                />
              ))}
            </nav>
          )}
        </div>
        {/* 일반 설명 영역 */}
        <div>
          <dl
            className={clsx(
              'text-sm md:text-sm',
              GENERAL_INFO_ITEM_GAP_CLASS_NAME,
            )}
          >
            <div>
              <dt className="flex items-center gap-1 font-bold md:gap-2">
                <IoCalendarSharp
                  size="1em"
                  aria-hidden="true"
                  className="shrink-0"
                />
                기간
              </dt>
              <dd className={FIELD_CONTENT_CLASS_NAME}>{period}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 font-bold md:gap-2">
                <IoPeopleSharp
                  size="1em"
                  aria-hidden="true"
                  className="shrink-0"
                />
                팀 구성
              </dt>
              <dd className={FIELD_CONTENT_CLASS_NAME}>{team}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 font-bold md:gap-2">
                <IoPersonSharp
                  size="1em"
                  aria-hidden="true"
                  className="shrink-0"
                />
                역할
              </dt>
              <dd className={FIELD_CONTENT_CLASS_NAME}>{role}</dd>
            </div>
          </dl>
        </div>
        {/* 스택 영역 */}
        {technologies.length > 0 && (
          <div className="text-sm md:text-sm">
            <p className="flex items-center gap-1 font-bold md:gap-2">
              <IoLayersSharp
                size="1em"
                aria-hidden="true"
                className="shrink-0"
              />
              스택
            </p>
            <ul
              id={`${id}-stack`}
              className="mt-2 list-disc space-y-1 pl-5 md:mt-3 md:space-y-2 md:pl-6"
            >
              {visibleTechnologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
            {technologies.length > 3 && (
              <button
                type="button"
                aria-expanded={isStackExpanded}
                aria-controls={`${id}-stack`}
                onClick={handleStackToggle}
                className="mt-2 cursor-pointer text-indigo underline-offset-4 transition-colors hover:text-indigo-enhanced hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current md:mt-3"
              >
                {isStackExpanded ? '↑ 접기' : '↓ 더 보기'}
              </button>
            )}
          </div>
        )}
      </header>
      <div className="min-w-0 space-y-6 md:space-y-8">
        {contributions.map((contribution, index) => (
          <section key={index} aria-labelledby={`${id}-contribution-${index}`}>
            <h4
              id={`${id}-contribution-${index}`}
              className="text-base font-bold text-on-cream-enhanced md:text-lg"
            >
              {contribution.title}
            </h4>
            <dl className="mt-3 space-y-3 md:mt-4 md:space-y-4">
              <div>
                <dt className="font-bold">문제</dt>
                <dd>{contribution.problem}</dd>
              </div>
              <div>
                <dt className="font-bold">판단 이유와 조치</dt>
                <dd>{contribution.action}</dd>
              </div>
              <div>
                <dt className="font-bold">확인한 결과</dt>
                <dd>{contribution.result}</dd>
              </div>
              {contribution.verification && (
                <div>
                  <dt className="font-bold">검증 조건</dt>
                  <dd>{contribution.verification}</dd>
                </div>
              )}
            </dl>
          </section>
        ))}
        {evidenceLinks.length > 0 && (
          <nav aria-label={`${title} 근거 자료`}>
            <p className="font-bold">근거</p>
            <ul className="mt-2 flex flex-wrap gap-3 md:mt-3 md:gap-4">
              {evidenceLinks.map((link) => (
                <li key={link.url}>
                  <TextButton text={link.label} url={link.url} />
                </li>
              ))}
            </ul>
          </nav>
        )}
        {achievements.length > 0 && (
          <div>
            <p className="font-bold">프로젝트 성과</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 md:mt-3 md:space-y-2 md:pl-6">
              {achievements.map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
