import PortfolioEntryTitle, {
  type PortfolioEntryTitleProps,
} from './PortfolioEntryTitle';
import PortfolioEntryInfo, {
  type PortfolioEntryInfoProps,
} from './PortfolioEntryInfo';
import PortfolioEntryProject, {
  type PortfolioEntryProjectProps,
} from './PortfolioEntryProject';

interface PortfolioEntryProps
  extends
    PortfolioEntryTitleProps,
    PortfolioEntryInfoProps,
    PortfolioEntryProjectProps {}

export default function PortfolioEntry(props: PortfolioEntryProps) {
  const { id } = props;
  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid min-w-0 gap-6 border-t border-on-cream/20 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:gap-10 md:py-8"
    >
      <header className="min-w-0 flex flex-col gap-4 md:gap-16">
        <PortfolioEntryTitle {...props} />
        <PortfolioEntryInfo {...props} />
      </header>
      <PortfolioEntryProject {...props} />
    </article>
  );
}
