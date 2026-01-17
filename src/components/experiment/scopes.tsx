'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

export type Scope = {
  scopeKey: string;
  scopeLabel: string;
  ownerUserId: string;
  owner: { name: string };
};

type Member = { id: string; name: string };

type Props = {
  publicId: string;
  canManage: boolean;
  members: Member[];
};

export const Scopes = ({ publicId, canManage, members }: Props) => {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [scopeKey, setScopeKey] = useState('');
  const [scopeLabel, setScopeLabel] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadScopes = async () => {
    const response = await fetch(`/api/experiments/${publicId}`);
    const data = await response.json();
    if (data.ok) {
      setScopes(data.data.scopes);
    }
  };

  useEffect(() => {
    void loadScopes();
  }, [publicId]);

  const handleCreate = async () => {
    setError(null);
    const response = await fetch(`/api/experiments/${publicId}/scopes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scopeKey, scopeLabel, ownerUserId })
    });
    const data = await response.json();
    if (!data.ok) {
      setError(data.error.message);
      return;
    }
    setScopeKey('');
    setScopeLabel('');
    setOwnerUserId('');
    toast('Scope added.');
    void loadScopes();
  };

  const handleOwnerChange = async (key: string, newOwner: string) => {
    await fetch(`/api/experiments/${publicId}/scopes/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerUserId: newOwner })
    });
    toast('Scope updated.');
    void loadScopes();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Decision owners</h3>
      <div className="space-y-2">
        {scopes.map((scope) => (
          <div
            key={scope.scopeKey}
            className="flex flex-col gap-2 rounded-md border border-slate-800 p-3 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {scope.scopeLabel}
              </p>
              <p className="text-xs text-slate-400">{scope.scopeKey}</p>
            </div>
            <div className="text-sm text-slate-200">
              {canManage ? (
                <Select
                  value={scope.ownerUserId}
                  onChange={(event) =>
                    handleOwnerChange(scope.scopeKey, event.target.value)
                  }
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              ) : (
                scope.owner.name
              )}
            </div>
          </div>
        ))}
      </div>
      {canManage ? (
        <div className="space-y-2">
          <Input
            placeholder="Scope key (e.g. product)"
            value={scopeKey}
            onChange={(event) => setScopeKey(event.target.value)}
          />
          <Input
            placeholder="Scope label"
            value={scopeLabel}
            onChange={(event) => setScopeLabel(event.target.value)}
          />
          <Select
            value={ownerUserId}
            onChange={(event) => setOwnerUserId(event.target.value)}
          >
            <option value="">Select owner</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button
            onClick={handleCreate}
            disabled={!scopeKey || !scopeLabel || !ownerUserId}
          >
            Add scope
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Only decision owners can edit scopes.
        </p>
      )}
    </div>
  );
};
