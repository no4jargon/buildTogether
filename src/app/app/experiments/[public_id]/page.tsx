import { ExperimentDetail } from '@/components/experiment/experiment-detail';

export default function ExperimentDetailPage({
  params
}: {
  params: { public_id: string };
}) {
  return <ExperimentDetail publicId={params.public_id} showJoinLink />;
}
