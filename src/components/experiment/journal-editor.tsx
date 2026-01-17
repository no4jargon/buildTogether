'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

export type JournalEntry = {
  id: string;
  weekStartDate: string;
  workedOn: string;
  learned: string;
  blockers: string;
  assetsCreated: string;
  user: { name: string };
};

type Props = {
  publicId: string;
  canWrite: boolean;
  weekStartDate: string;
};

export const JournalEditor = ({
  publicId,
  canWrite,
  weekStartDate
}: Props) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [workedOn, setWorkedOn] = useState('');
  const [learned, setLearned] = useState('');
  const [blockers, setBlockers] = useState('');
  const [assetsCreated, setAssetsCreated] = useState('');
  const { toast } = useToast();

  const loadEntries = async () => {
    const response = await fetch(`/api/experiments/${publicId}/journals?limit=10`);
    const data = await response.json();
    if (data.ok) {
      setEntries(data.data);
    }
  };

  useEffect(() => {
    void loadEntries();
  }, [publicId]);

  const handleSave = async () => {
    const response = await fetch(
      `/api/experiments/${publicId}/journals/${weekStartDate}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workedOn, learned, blockers, assetsCreated })
      }
    );
    const data = await response.json();
    if (data.ok) {
      toast('Journal saved.');
      void loadEntries();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Weekly journal</h3>
      {canWrite ? (
        <div className="space-y-2">
          <Textarea
            rows={2}
            placeholder="What did you work on?"
            value={workedOn}
            onChange={(event) => setWorkedOn(event.target.value)}
          />
          <Textarea
            rows={2}
            placeholder="What did you learn?"
            value={learned}
            onChange={(event) => setLearned(event.target.value)}
          />
          <Textarea
            rows={2}
            placeholder="Blockers?"
            value={blockers}
            onChange={(event) => setBlockers(event.target.value)}
          />
          <Textarea
            rows={2}
            placeholder="Assets created"
            value={assetsCreated}
            onChange={(event) => setAssetsCreated(event.target.value)}
          />
          <Button onClick={handleSave}>Save journal</Button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Only contributors can write journals.
        </p>
      )}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-md border border-slate-800 p-3">
            <p className="text-xs text-slate-400">
              Week of {entry.weekStartDate} · {entry.user.name}
            </p>
            <p className="text-sm text-slate-200">Worked on: {entry.workedOn}</p>
            <p className="text-sm text-slate-200">Learned: {entry.learned}</p>
            <p className="text-sm text-slate-200">Blockers: {entry.blockers}</p>
            <p className="text-sm text-slate-200">
              Assets: {entry.assetsCreated}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
