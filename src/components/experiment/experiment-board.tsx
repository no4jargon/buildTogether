'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ExperimentCard } from './experiment-card';
import { ExperimentFilters } from './experiment-filters';

export type ExperimentListItem = {
  publicId: string;
  title: string;
  problemStatement: string;
  maturityStage: string;
  lastActivityAt: string;
};

type Props = {
  apiPath: string;
  hrefPrefix?: string;
  baseParams?: Record<string, string>;
};

export const ExperimentBoard = ({ apiPath, hrefPrefix, baseParams }: Props) => {
  const [items, setItems] = useState<ExperimentListItem[]>([]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadItems = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      const params = new URLSearchParams(baseParams ?? {});
      if (search) params.set('q', search);
      if (stage !== 'all') params.set('stage', stage);
      if (!reset && cursor) params.set('cursor', cursor);
      const response = await fetch(`${apiPath}?${params.toString()}`);
      const data = await response.json();
      if (data.ok) {
        setItems((prev) => (reset ? data.data.items : [...prev, ...data.data.items]));
        setCursor(data.data.nextCursor ?? null);
        setHasMore(Boolean(data.data.nextCursor));
      }
      setLoading(false);
    },
    [apiPath, baseParams, cursor, loading, search, stage]
  );

  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    void loadItems(true);
  }, [search, stage, loadItems]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        void loadItems();
      }
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadItems]);

  return (
    <div className="space-y-6">
      <ExperimentFilters
        search={search}
        stage={stage}
        onSearchChange={setSearch}
        onStageChange={setStage}
      />
      <div className="space-y-4">
        {items.map((experiment) => (
          <ExperimentCard
            key={experiment.publicId}
            experiment={experiment}
            hrefPrefix={hrefPrefix}
          />
        ))}
      </div>
      <div ref={loaderRef} className="h-10" />
      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      {!hasMore && !loading && (
        <p className="text-sm text-slate-500">No more experiments.</p>
      )}
    </div>
  );
};
