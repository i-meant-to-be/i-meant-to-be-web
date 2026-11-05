import {
  IoLogoGithub,
  IoGlobeSharp,
  IoLogoGooglePlaystore,
  IoLogoAndroid,
} from 'react-icons/io5';
import Tag from '../../../components/Tag';
import IconButton from '../../../components/IconButton';

export interface PortfolioEntryTitleProps {
  id: string;
  title: string;
  logoSrc?: string;
  logoAlt?: string;
  formFactors?: ('Android' | 'Web')[];
  projectLinks?: { github?: string; homepage?: string; playStore?: string };
}

const FORM_FACTORS = {
  Android: { color: 'teal', icon: IoLogoAndroid },
  Web: { color: 'indigo', icon: IoGlobeSharp },
} as const;

export default function PortfolioEntryTitle(props: PortfolioEntryTitleProps) {
  const {
    id,
    title,
    logoSrc,
    logoAlt = `${title} 로고`,
    formFactors = [],
    projectLinks,
  } = props;
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
                  <Icon size="1em" aria-hidden="true" className="shrink-0" />
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
  );
}
