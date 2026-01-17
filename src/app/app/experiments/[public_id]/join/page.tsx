'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

export default function JoinExperimentPage({
  params
}: {
  params: { public_id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [why, setWhy] = useState('');
  const [weekOnePlan, setWeekOnePlan] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const response = await fetch(
      `/api/experiments/${params.public_id}/interest-requests`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          why,
          weekOnePlan,
          weeklyHours: Number(weeklyHours)
        })
      }
    );
    const data = await response.json();
    if (!data.ok) {
      setError(data.error.message);
      return;
    }
    toast('Interest request submitted.');
    router.push(`/app/experiments/${params.public_id}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Join experiment</h1>
      <div className="space-y-4">
        <Textarea
          rows={3}
          placeholder="Why this experiment?"
          value={why}
          onChange={(event) => setWhy(event.target.value)}
        />
        <Textarea
          rows={3}
          placeholder="What would you try in week one?"
          value={weekOnePlan}
          onChange={(event) => setWeekOnePlan(event.target.value)}
        />
        <Input
          type="number"
          step="0.5"
          placeholder="Weekly hours"
          value={weeklyHours}
          onChange={(event) => setWeeklyHours(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <Button onClick={handleSubmit} disabled={!why || !weekOnePlan}>
        Submit request
      </Button>
    </div>
  );
}
