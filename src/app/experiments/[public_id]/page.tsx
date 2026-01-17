import { getServerSession } from 'next-auth';

import { ExperimentDetail } from '@/components/experiment/experiment-detail';
import { authOptions } from '@/lib/auth';

export default async function PublicExperimentDetailPage({
  params
}: {
  params: { public_id: string };
}) {
  const session = await getServerSession(authOptions);
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <ExperimentDetail
          publicId={params.public_id}
          showJoinLink={Boolean(session?.user)}
        />
      </div>
    </main>
  );
}
