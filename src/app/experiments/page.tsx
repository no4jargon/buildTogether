import Link from 'next/link';

import { ExperimentBoard } from '@/components/experiment/experiment-board';

export default function PublicExperimentsPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Public experiments</h1>
            <p className="text-sm text-slate-400">
              Explore what teams are testing right now.
            </p>
          </div>
          <Link className="text-sm text-slate-300" href="/">
            Back to home
          </Link>
        </div>
        <ExperimentBoard apiPath="/api/experiments" baseParams={{ privacy: 'public' }} />
      </div>
    </main>
  );
}
