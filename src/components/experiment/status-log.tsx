'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

export type StatusLogEntry = {
  id: string;
  entry: string;
  createdAt: string;
  author: { name: string };
};

type Props = {
  publicId: string;
  canPost: boolean;
};

export const StatusLog = ({ publicId, canPost }: Props) => {
  const [entries, setEntries] = useState<StatusLogEntry[]>([]);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadEntries = async () => {
    const response = await fetch(`/api/experiments/${publicId}/status-logs`);
    const data = await response.json();
    if (data.ok) {
      setEntries(data.data);
    }
  };

  useEffect(() => {
    void loadEntries();
  }, [publicId]);

  const handleSubmit = async () => {
    setError(null);
    const response = await fetch(`/api/experiments/${publicId}/status-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry })
    });
    const data = await response.json();
    if (!data.ok) {
      setError(data.error.message);
      return;
    }
    setEntry('');
    toast('Status log added.');
    void loadEntries();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Status log</h3>
      </div>
      {canPost ? (
        <div className="space-y-2">
          <Textarea
            rows={3}
            placeholder="Add a status update..."
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button onClick={handleSubmit} disabled={!entry.trim()}>
            Add entry
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Only contributors can post.</p>
      )}
      <div className="space-y-3">
        {entries.map((log) => (
          <div key={log.id} className="rounded-md border border-slate-800 p-3">
            <p className="text-sm text-slate-200">{log.entry}</p>
            <p className="text-xs text-slate-400">
              {log.author.name} · {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
