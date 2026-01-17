'use client';

import { useEffect, useState } from 'react';

export type Contributor = {
  id: string;
  role: string;
  weeklyHours: string;
  personalRisk: string | null;
  user: { name: string };
};

type Props = {
  publicId: string;
};

export const Contributors = ({ publicId }: Props) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);

  const loadContributors = async () => {
    const response = await fetch(`/api/experiments/${publicId}/contributors`);
    const data = await response.json();
    if (data.ok) {
      setContributors(data.data);
    }
  };

  useEffect(() => {
    void loadContributors();
  }, [publicId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contributors</h3>
      <div className="space-y-2">
        {contributors.map((contributor) => (
          <div
            key={contributor.id}
            className="rounded-md border border-slate-800 p-3"
          >
            <p className="text-sm font-semibold text-slate-100">
              {contributor.user.name}
            </p>
            <p className="text-xs text-slate-400">
              {contributor.role} · {contributor.weeklyHours} hrs/week
            </p>
            {contributor.personalRisk && (
              <p className="text-xs text-slate-400">
                Personal risk: {contributor.personalRisk}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
