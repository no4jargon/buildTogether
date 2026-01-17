'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

export type Asset = {
  id: string;
  assetType: string;
  title: string;
  url: string | null;
  notes: string | null;
  createdAt: string;
};

type Props = {
  publicId: string;
  canAdd: boolean;
};

export const Assets = ({ publicId, canAdd }: Props) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetType, setAssetType] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const loadAssets = async () => {
    const response = await fetch(`/api/experiments/${publicId}/assets`);
    const data = await response.json();
    if (data.ok) {
      setAssets(data.data);
    }
  };

  useEffect(() => {
    void loadAssets();
  }, [publicId]);

  const handleCreate = async () => {
    const response = await fetch(`/api/experiments/${publicId}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetType,
        title,
        url: url || null,
        notes: notes || null
      })
    });
    const data = await response.json();
    if (data.ok) {
      setAssetType('');
      setTitle('');
      setUrl('');
      setNotes('');
      toast('Asset added.');
      void loadAssets();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Reusable assets</h3>
      {canAdd ? (
        <div className="space-y-2">
          <Input
            placeholder="Asset type (e.g. doc, spreadsheet)"
            value={assetType}
            onChange={(event) => setAssetType(event.target.value)}
          />
          <Input
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            placeholder="URL (optional)"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <Textarea
            rows={2}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <Button
            onClick={handleCreate}
            disabled={!assetType.trim() || !title.trim()}
          >
            Add asset
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Only contributors can add assets.
        </p>
      )}
      <div className="space-y-2">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-md border border-slate-800 p-3">
            <p className="text-sm font-semibold text-slate-100">{asset.title}</p>
            <p className="text-xs text-slate-400">{asset.assetType}</p>
            {asset.url && (
              <a className="text-sm" href={asset.url} target="_blank">
                {asset.url}
              </a>
            )}
            {asset.notes && <p className="text-sm">{asset.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
