'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { ExperimentCard } from '@/components/experiment/experiment-card';

type BookmarkExperiment = {
  publicId: string;
  title: string;
  problemStatement: string;
  maturityStage: string;
  lastActivityAt: string;
};

type BookmarkResponse = {
  items: BookmarkExperiment[];
};

export const BookmarkMarquee = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedOut, setIsSignedOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadBookmarks = async () => {
      try {
        const response = await fetch('/api/bookmarks', {
          signal: controller.signal
        });

        if (response.status === 401) {
          setIsSignedOut(true);
          return;
        }

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as BookmarkResponse;
        setBookmarks(data.items ?? []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setBookmarks([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();

    return () => {
      controller.abort();
    };
  }, []);

  const marqueeItems = useMemo(() => {
    if (bookmarks.length === 0) {
      return [];
    }

    return [...bookmarks, ...bookmarks];
  }, [bookmarks]);

  if (isLoading) {
    return (
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-200">
        <h2 className="text-xl font-semibold text-white">Bookmarked experiments</h2>
        <p className="text-sm text-slate-400">Loading your bookmarks…</p>
      </section>
    );
  }

  if (isSignedOut || bookmarks.length === 0) {
    return (
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-200">
        <h2 className="text-xl font-semibold text-white">Bookmarked experiments</h2>
        <p className="text-sm text-slate-400">
          Sign in to see bookmarks or browse the latest public experiments.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400"
            href="/api/auth/signin"
          >
            Sign in
          </Link>
          <Link
            className="rounded-md border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-slate-400"
            href="/experiments"
          >
            View public experiments
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Bookmarked experiments</h2>
        <Link className="text-xs font-semibold text-sky-300 hover:text-sky-200" href="/experiments">
          Browse all
        </Link>
      </div>
      <div className="group overflow-hidden">
        <div className="marquee flex w-max gap-4 pr-4">
          {marqueeItems.map((bookmark, index) => (
            <ExperimentCard
              key={`${bookmark.publicId}-${index}`}
              experiment={bookmark}
              size="compact"
              className="min-w-[230px] max-w-[260px]"
              hrefPrefix=""
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Hover to pause the scroll.
      </p>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee {
          animation: marquee 40s linear infinite;
        }

        .group:hover .marquee {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
