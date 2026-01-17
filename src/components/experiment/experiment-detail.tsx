'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import Link from 'next/link';

import { ActionItems } from './action-items';
import { Assets } from './assets';
import { BookmarkButton } from './bookmark-button';
import { Contributors } from './contributors';
import { JournalEditor } from './journal-editor';
import { JoinRequestPanel } from './join-request-panel';
import { Scopes } from './scopes';
import { StatusLog } from './status-log';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { formatDateInput, getWeekStartDate } from '@/lib/time';

export type ExperimentDetailPayload = {
  experiment: {
    publicId: string;
    title: string;
    problemStatement: string;
    solutionDirection: string;
    hypothesis: string | null;
    falsificationCriteria: string | null;
    maturityStage: string;
    privacy: string;
    currentStatus: string;
    lastActivityAt: string;
    createdByUserId: string;
    startDate: string | null;
    reviewDate: string | null;
    isBookmarked: boolean;
  };
  scopes: Array<{
    scopeKey: string;
    scopeLabel: string;
    ownerUserId: string;
    owner: { name: string };
  }>;
  contributors: Array<{ id: string; userId: string; user: { name: string } }>;
  permissions: {
    canEditCore: boolean;
    canManageScopes: boolean;
    canManageInterestRequests: boolean;
    canManageActionItems: boolean;
    canPostStatusLog: boolean;
    canWriteJournal: boolean;
    canAddAssets: boolean;
  };
  members: Array<{ id: string; name: string }>;
  isContributor: boolean;
};

type Props = {
  publicId: string;
  showJoinLink?: boolean;
};

export const ExperimentDetail = ({ publicId, showJoinLink }: Props) => {
  const [data, setData] = useState<ExperimentDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    const response = await fetch(`/api/experiments/${publicId}`);
    const payload = await response.json();
    if (!payload.ok) {
      setError(payload.error.message);
      return;
    }
    setData(payload.data);
  };

  useEffect(() => {
    void loadData();
  }, [publicId]);

  const weekStartDate = useMemo(() => {
    return formatDateInput(getWeekStartDate(new Date()));
  }, []);

  if (error) {
    return <p className="text-sm text-rose-400">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-slate-400">Loading...</p>;
  }

  const { experiment, permissions, members } = data;

  const updateField = (field: keyof ExperimentDetailPayload['experiment']) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              experiment: {
                ...prev.experiment,
                [field]: event.target.value
              }
            }
          : prev
      );
    };
  };

  const handleSave = async () => {
    setSaving(true);
    const response = await fetch(`/api/experiments/${publicId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: experiment.title,
        problemStatement: experiment.problemStatement,
        solutionDirection: experiment.solutionDirection,
        hypothesis: experiment.hypothesis,
        falsificationCriteria: experiment.falsificationCriteria,
        maturityStage: experiment.maturityStage,
        privacy: experiment.privacy,
        currentStatus: experiment.currentStatus,
        startDate: experiment.startDate,
        reviewDate: experiment.reviewDate
      })
    });
    const payload = await response.json();
    setSaving(false);
    if (!payload.ok) {
      setError(payload.error.message);
      return;
    }
    toast('Experiment updated.');
    void loadData();
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {experiment.title}
          </h1>
          <p className="text-sm text-slate-400">
            Last activity {new Date(experiment.lastActivityAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BookmarkButton
            publicId={publicId}
            initialBookmarked={experiment.isBookmarked}
          />
          {showJoinLink && !data.isContributor && (
            <Link
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200"
              href={`/app/experiments/${publicId}/join`}
            >
              Work with this community
            </Link>
          )}
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Overview</h2>
          {permissions.canEditCore && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Title</label>
            <Input
              value={experiment.title}
              onChange={updateField('title')}
              disabled={!permissions.canEditCore}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Current status</label>
            <Input
              value={experiment.currentStatus}
              onChange={updateField('currentStatus')}
              disabled={!permissions.canEditCore}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Stage</label>
            <Select
              value={experiment.maturityStage}
              onChange={updateField('maturityStage')}
              disabled={!permissions.canEditCore}
            >
              {['idea', 'active', 'validation', 'paused', 'archived'].map(
                (stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                )
              )}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Privacy</label>
            <Select
              value={experiment.privacy}
              onChange={updateField('privacy')}
              disabled={!permissions.canEditCore}
            >
              {['public', 'restricted', 'private'].map((privacy) => (
                <option key={privacy} value={privacy}>
                  {privacy}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Problem statement</label>
            <Textarea
              rows={3}
              value={experiment.problemStatement}
              onChange={updateField('problemStatement')}
              disabled={!permissions.canEditCore}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Solution direction</label>
            <Textarea
              rows={3}
              value={experiment.solutionDirection}
              onChange={updateField('solutionDirection')}
              disabled={!permissions.canEditCore}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Hypothesis</label>
            <Textarea
              rows={2}
              value={experiment.hypothesis ?? ''}
              onChange={updateField('hypothesis')}
              disabled={!permissions.canEditCore}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Falsification criteria</label>
            <Textarea
              rows={2}
              value={experiment.falsificationCriteria ?? ''}
              onChange={updateField('falsificationCriteria')}
              disabled={!permissions.canEditCore}
            />
          </div>
        </div>
      </section>

      <Scopes publicId={publicId} canManage={permissions.canManageScopes} members={members} />
      <Contributors publicId={publicId} />
      <JoinRequestPanel publicId={publicId} canManage={permissions.canManageInterestRequests} />
      <ActionItems
        publicId={publicId}
        canManage={permissions.canManageActionItems}
        members={members}
      />
      <StatusLog publicId={publicId} canPost={permissions.canPostStatusLog} />
      <JournalEditor
        publicId={publicId}
        canWrite={permissions.canWriteJournal}
        weekStartDate={weekStartDate}
      />
      <Assets publicId={publicId} canAdd={permissions.canAddAssets} />
    </div>
  );
};
