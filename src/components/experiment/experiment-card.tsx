import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BookmarkButton } from './bookmark-button';
import { cn } from '@/components/ui/utils';

type ExperimentSummary = {
  publicId: string;
  title: string;
  problemStatement: string;
  maturityStage: string;
  lastActivityAt: string;
  isBookmarked?: boolean;
};

type Props = {
  experiment: ExperimentSummary;
  hrefPrefix?: string;
  size?: 'default' | 'compact';
  className?: string;
};

const sizeStyles = {
  default: {
    container: 'gap-3',
    title: 'text-lg',
    summary: 'text-sm',
    meta: 'text-xs'
  },
  compact: {
    container: 'gap-2',
    title: 'text-base',
    summary: 'text-xs',
    meta: 'text-[11px]'
  }
};

export const ExperimentCard = ({
  experiment,
  hrefPrefix = '',
  size = 'default',
  className
}: Props) => {
  const lastActivity = new Date(experiment.lastActivityAt);
  const relative = formatDistanceToNow(lastActivity, { addSuffix: true });
  const styles = sizeStyles[size];

  return (
    <Card className={cn('flex flex-col', styles.container, className)}>
      <div className="flex items-center justify-between">
        <Link
          className={cn(styles.title, 'font-semibold text-white')}
          href={`${hrefPrefix}/experiments/${experiment.publicId}`}
        >
          {experiment.title}
        </Link>
        <div className="flex items-center gap-2">
          <BookmarkButton
            publicId={experiment.publicId}
            initialBookmarked={experiment.isBookmarked}
          />
          <Badge>{experiment.maturityStage}</Badge>
        </div>
      </div>
      <p className={cn(styles.summary, 'text-slate-300')}>
        {experiment.problemStatement}
      </p>
      <div
        className={cn(styles.meta, 'text-slate-400')}
        title={lastActivity.toISOString()}
      >
        Last activity {relative}
      </div>
    </Card>
  );
};
