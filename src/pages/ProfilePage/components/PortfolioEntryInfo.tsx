import clsx from 'clsx';
import {
  IoCalendarSharp,
  IoPeopleSharp,
  IoDocumentTextSharp,
  IoLayersSharp,
} from 'react-icons/io5';

export interface PortfolioEntryInfoProps {
  id: string;
  context: string;
  period: string;
  team: string;
  technologies?: string[];
}

const FIELD_CONTENT_CLASS_NAME = 'min-w-0 md:mt-2';
const GENERAL_INFO_ITEM_GAP_CLASS_NAME = 'space-y-2 md:space-y-6';
const GENERAL_INFO_ROW_CLASS_NAME =
  'grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-x-2 md:block';

export default function PortfolioEntryInfo(props: PortfolioEntryInfoProps) {
  const { id, context, period, team, technologies = [] } = props;
  const visibleTechnologies = technologies.slice(0, 3);
  return (
    <div>
      <dl
        className={clsx('text-sm md:text-sm', GENERAL_INFO_ITEM_GAP_CLASS_NAME)}
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
            <IoPeopleSharp size="1em" aria-hidden="true" className="shrink-0" />
            팀 구성
          </dt>
          <dd className={FIELD_CONTENT_CLASS_NAME}>{team}</dd>
        </div>
        <div className={GENERAL_INFO_ROW_CLASS_NAME}>
          <dt className="flex items-center gap-1 font-bold md:gap-2">
            <IoLayersSharp size="1em" aria-hidden="true" className="shrink-0" />
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
  );
}
