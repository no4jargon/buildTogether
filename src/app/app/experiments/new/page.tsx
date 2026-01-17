'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

const stages = ['idea', 'active', 'validation', 'paused', 'archived'];

export default function NewExperimentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    problemStatement: '',
    solutionDirection: '',
    hypothesis: '',
    falsificationCriteria: '',
    maturityStage: 'idea',
    privacy: 'public',
    currentStatus: ''
  });
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };
  };

  const handleSubmit = async () => {
    setError(null);
    const response = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    if (!payload.ok) {
      setError(payload.error.message);
      return;
    }
    toast('Experiment created.');
    router.push(`/app/experiments/${payload.data.publicId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Create experiment</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Title</label>
          <Input value={form.title} onChange={updateField('title')} />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Current status</label>
          <Input
            value={form.currentStatus}
            onChange={updateField('currentStatus')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Problem statement</label>
          <Textarea
            rows={3}
            value={form.problemStatement}
            onChange={updateField('problemStatement')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Solution direction</label>
          <Textarea
            rows={3}
            value={form.solutionDirection}
            onChange={updateField('solutionDirection')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Hypothesis</label>
          <Textarea
            rows={2}
            value={form.hypothesis}
            onChange={updateField('hypothesis')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Falsification criteria</label>
          <Textarea
            rows={2}
            value={form.falsificationCriteria}
            onChange={updateField('falsificationCriteria')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Stage</label>
          <Select value={form.maturityStage} onChange={updateField('maturityStage')}>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Privacy</label>
          <Select value={form.privacy} onChange={updateField('privacy')}>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
            <option value="private">Private</option>
          </Select>
        </div>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <Button onClick={handleSubmit} disabled={!form.title || !form.problemStatement}>
        Create experiment
      </Button>
    </div>
  );
}
