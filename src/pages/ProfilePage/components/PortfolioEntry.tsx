import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  IoCalendarSharp,
  IoPeopleSharp,
  IoLogoGithub,
  IoGlobeSharp,
  IoLogoGooglePlaystore,
  IoFlameSharp,
  IoLogoAndroid,
  IoDocumentTextSharp,
  IoLayersSharp,
} from 'react-icons/io5';
import Callout from '../../../components/Callout';
import Tag from '../../../components/Tag';
import TextButton from '../../../components/TextButton';
import IconButton from '../../../components/IconButton';

const FIELD_CONTENT_CLASS_NAME = 'min-w-0 md:mt-2';
const LEFT_COLUMN_SECTION_GAP_CLASS_NAME = 'gap-4 md:gap-16';
const GENERAL_INFO_ITEM_GAP_CLASS_NAME = 'space-y-2 md:space-y-6';
const GENERAL_INFO_ROW_CLASS_NAME =
  'grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-2 md:block';
const CALLOUT_CONTENT_GAP_CLASS_NAME = 'gap-3 md:gap-4';
const CALLOUT_COLORS = ['indigo', 'rose', 'amber', 'teal'] as const;
const CONTRIBUTION_MARKDOWN_CLASS_NAME =
  'mt-3 space-y-4 md:mt-4 md:space-y-6 [&_code]:rounded [&_code]:bg-on-cream-enhanced/5 [&_code]:px-1 [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:bg-on-cream-enhanced/5 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-indigo [&_a]:underline';
const FORM_FACTORS = {
  Android: { color: 'teal', icon: IoLogoAndroid },
  Web: { color: 'indigo', icon: IoGlobeSharp },
} as const;

interface PortfolioEntryProps {
  id: string;
  projectIndex?: number;
  title: string;
  logoSrc?: string;
  logoAlt?: string;
  projectLinks?: {
    github?: string;
    homepage?: string;
    playStore?: string;
  };
  period: string;
  formFactors?: ('Android' | 'Web')[];
  team: string;
  technologies?: string[];
  achievements?: string[];
  context: string;
  summary: string;
  contributions: {
    title: string;
    description: string;
    evidenceLinks?: { title: string; url: string }[];
  }[];
}

export default function PortfolioEntry(props: PortfolioEntryProps) {
  const {
    id,
    projectIndex = 0,
    title,
    logoSrc,
    logoAlt = `${title} 로고`,
    projectLinks,
    period,
    formFactors = [],
    team,
    technologies = [],
    achievements = [],
    context,
    summary,
    contributions,
  } = props;

  const visibleTechnologies = technologies.slice(0, 3);
  const visibleProjectLinks = [
    { label: 'GitHub 저장소', url: projectLinks?.github, icon: IoLogoGithub },
    { label: '홈 페이지', url: projectLinks?.homepage, icon: IoGlobeSharp },
    {
      label: 'Play 스토어',
      url: projectLinks?.playStore,
      icon: IoLogoGooglePlaystore,
    },
  ].filter((link) => link.url);

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
          {formFactors.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 md:mt-4 md:gap-3">
              {formFactors.map((formFactor) => {
                const { color, icon: Icon } = FORM_FACTORS[formFactor];

                return (
                  <Tag key={formFactor} color={color}>
                    <span className="inline-flex items-center gap-1 md:gap-2">
                      <Icon
                        size="1em"
                        aria-hidden="true"
                        className="shrink-0"
                      />
                      {formFactor}
                    </span>
                  </Tag>
                );
              })}
            </div>
          )}
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
            <div className={GENERAL_INFO_ROW_CLASS_NAME}>
              <dt className="flex items-center gap-1 font-bold md:gap-2">
                <IoDocumentTextSharp
                  size="1em"
                  aria-hidden="true"
                  className="shrink-0"
                />
                설명
              </dt>
              <dd className={FIELD_CONTENT_CLASS_NAME}>{context}</dd>
            </div>
            <div className={GENERAL_INFO_ROW_CLASS_NAME}>
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
            <div className={GENERAL_INFO_ROW_CLASS_NAME}>
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
            <div className={GENERAL_INFO_ROW_CLASS_NAME}>
              <dt className="flex items-center gap-1 font-bold md:gap-2">
                <IoLayersSharp
                  size="1em"
                  aria-hidden="true"
                  className="shrink-0"
                />
                주요 스택
              </dt>
              <dd>
                <ul
                  id={`${id}-stack`}
                  className="flex flex-wrap gap-x-3 gap-y-1 md:block md:mt-3 md:list-disc md:space-y-2 md:pl-6"
                >
                  {visibleTechnologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </header>
      <div className="min-w-0 space-y-6 md:space-y-8">
        <Callout color={CALLOUT_COLORS[projectIndex % CALLOUT_COLORS.length]}>
          <div
            className={clsx('flex items-start', CALLOUT_CONTENT_GAP_CLASS_NAME)}
          >
            <IoFlameSharp
              size="1em"
              aria-hidden="true"
              className="mt-1 shrink-0"
            />
            <p className="min-w-0">{summary}</p>
          </div>
        </Callout>

        {contributions.map((contribution, index) => (
          <section key={index} aria-labelledby={`${id}-contribution-${index}`}>
            <h4
              id={`${id}-contribution-${index}`}
              className="text-base font-bold text-on-cream-enhanced md:text-lg"
            >
              {contribution.title}
            </h4>
            <div className={CONTRIBUTION_MARKDOWN_CLASS_NAME}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {contribution.description}
              </ReactMarkdown>
            </div>
            {!!contribution.evidenceLinks?.length && (
              <div className="mt-3 flex flex-wrap gap-3 md:mt-4 md:gap-4">
                {contribution.evidenceLinks.map((link) => (
                  <TextButton key={link.url} text={link.title} url={link.url} />
                ))}
              </div>
            )}
          </section>
        ))}
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
