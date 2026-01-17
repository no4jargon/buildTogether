import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type ExperimentSummary = {
  publicId: string;
  title: string;
  problemStatement: string;
  maturityStage: string;
  lastActivityAt: string;
};

type Props = {
  experiment: ExperimentSummary;
  hrefPrefix?: string;
};

export const ExperimentCard = ({ experiment, hrefPrefix = '' }: Props) => {
  const lastActivity = new Date(experiment.lastActivityAt);
  const relative = formatDistanceToNow(lastActivity, { addSuffix: true });

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link
          className="text-lg font-semibold text-white"
          href={`${hrefPrefix}/experiments/${experiment.publicId}`}
        >
          {experiment.title}
        </Link>
        <Badge>{experiment.maturityStage}</Badge>
      </div>
      <p className="text-sm text-slate-300">
        {experiment.problemStatement}
      </p>
      <div className="text-xs text-slate-400" title={lastActivity.toISOString()}>
        Last activity {relative}
      </div>
    </Card>
  );
};
