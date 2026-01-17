import Link from 'next/link';

import { ExperimentBoard } from '@/components/experiment/experiment-board';

export default function ExperimentsBoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Experiments board</h1>
          <p className="text-sm text-slate-400">
            Follow the latest activity across your experiments.
          </p>
        </div>
        <Link
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
          href="/app/experiments/new"
        >
          Create experiment
        </Link>
      </div>
      <ExperimentBoard apiPath="/api/experiments" hrefPrefix="/app" />
    </div>
  );
}
