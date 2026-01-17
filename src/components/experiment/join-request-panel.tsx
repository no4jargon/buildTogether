'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

export type InterestRequest = {
  id: string;
  why: string;
  weekOnePlan: string;
  weeklyHours: string;
  status: string;
  decisionNote: string | null;
  user: { name: string; email: string };
};

type Props = {
  publicId: string;
  canManage: boolean;
};

export const JoinRequestPanel = ({ publicId, canManage }: Props) => {
  const [requests, setRequests] = useState<InterestRequest[]>([]);
  const [note, setNote] = useState('');
  const { toast } = useToast();

  const loadRequests = async () => {
    const response = await fetch(`/api/experiments/${publicId}/interest-requests`);
    const data = await response.json();
    if (data.ok) {
      setRequests(data.data);
    }
  };

  useEffect(() => {
    if (canManage) {
      void loadRequests();
    }
  }, [publicId, canManage]);

  const updateRequest = async (id: string, status: string) => {
    await fetch(`/api/experiments/${publicId}/interest-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, decisionNote: note || null })
    });
    setNote('');
    toast('Request updated.');
    void loadRequests();
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Join requests</h3>
      <Textarea
        placeholder="Decision note (optional)"
        rows={2}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="rounded-md border border-slate-800 p-3">
            <p className="text-sm font-semibold text-slate-100">
              {request.user.name} · {request.user.email}
            </p>
            <p className="text-xs text-slate-400">
              Weekly hours: {request.weeklyHours}
            </p>
            <p className="text-sm text-slate-200">Why: {request.why}</p>
            <p className="text-sm text-slate-200">
              Week one: {request.weekOnePlan}
            </p>
            <p className="text-xs text-slate-400">Status: {request.status}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={() => updateRequest(request.id, 'accepted')}>
                Accept
              </Button>
              <Button
                variant="secondary"
                onClick={() => updateRequest(request.id, 'follow_up')}
              >
                Follow up
              </Button>
              <Button
                variant="ghost"
                onClick={() => updateRequest(request.id, 'declined')}
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
