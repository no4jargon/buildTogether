'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

export type ActionItem = {
  id: string;
  description: string;
  status: string;
  ownerUserId: string | null;
};

type Member = {
  id: string;
  name: string;
};

type Props = {
  publicId: string;
  canManage: boolean;
  members: Member[];
};

const statuses = ['open', 'in_progress', 'done'];

export const ActionItems = ({ publicId, canManage, members }: Props) => {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [description, setDescription] = useState('');
  const [ownerUserId, setOwnerUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadItems = async () => {
    const response = await fetch(`/api/experiments/${publicId}/action-items`);
    const data = await response.json();
    if (data.ok) {
      setItems(data.data);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [publicId]);

  const grouped = useMemo(() => {
    return statuses.reduce<Record<string, ActionItem[]>>((acc, status) => {
      acc[status] = items.filter((item) => item.status === status);
      return acc;
    }, {});
  }, [items]);

  const handleCreate = async () => {
    setError(null);
    const response = await fetch(`/api/experiments/${publicId}/action-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        ownerUserId: ownerUserId || null
      })
    });
    const data = await response.json();
    if (!data.ok) {
      setError(data.error.message);
      return;
    }
    setDescription('');
    setOwnerUserId('');
    toast('Action item created.');
    void loadItems();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/experiments/${publicId}/action-items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    toast('Action item updated.');
    void loadItems();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Action items</h3>
      {canManage ? (
        <div className="space-y-2">
          <Input
            placeholder="Describe the action item"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Select
            value={ownerUserId}
            onChange={(event) => setOwnerUserId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button onClick={handleCreate} disabled={!description.trim()}>
            Add action item
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Only contributors can manage action items.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {statuses.map((status) => (
          <div key={status} className="rounded-md border border-slate-800 p-3">
            <h4 className="mb-2 text-sm font-semibold uppercase text-slate-400">
              {status.replace('_', ' ')}
            </h4>
            <div className="space-y-2">
              {grouped[status]?.map((item) => (
                <div key={item.id} className="rounded border border-slate-700 p-2">
                  <p className="text-sm text-slate-200">{item.description}</p>
                  {canManage && (
                    <Select
                      className="mt-2"
                      value={item.status}
                      onChange={(event) =>
                        handleStatusChange(item.id, event.target.value)
                      }
                    >
                      {statuses.map((option) => (
                        <option key={option} value={option}>
                          {option.replace('_', ' ')}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
