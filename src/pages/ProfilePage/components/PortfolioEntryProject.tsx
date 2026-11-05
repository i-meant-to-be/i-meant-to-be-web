import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IoFlameSharp } from 'react-icons/io5';
import Callout from '../../../components/Callout';
import TextButton from '../../../components/TextButton';

export interface PortfolioEntryProjectProps {
  id: string;
  projectIndex?: number;
  summary: string;
  contributions: {
    title: string;
    description: string;
    evidenceLinks?: { title: string; url: string }[];
  }[];
  achievements?: string[];
}

const CALLOUT_CONTENT_GAP_CLASS_NAME = 'gap-3 md:gap-4';
const CALLOUT_COLORS = ['indigo', 'rose', 'amber', 'teal'] as const;
const CONTRIBUTION_MARKDOWN_CLASS_NAME =
  'mt-3 space-y-4 md:mt-4 md:space-y-6 [&_code]:rounded [&_code]:bg-on-cream-enhanced/5 [&_code]:px-1 [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:bg-on-cream-enhanced/5 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-indigo [&_a]:underline';

export default function PortfolioEntryProject(
  props: PortfolioEntryProjectProps,
) {
  const {
    id,
    projectIndex = 0,
    summary,
    contributions,
    achievements = [],
  } = props;
  return (
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
  );
}
