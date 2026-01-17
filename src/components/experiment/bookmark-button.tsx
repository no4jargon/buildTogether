'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/components/ui/utils';

type Props = {
  publicId: string;
  initialBookmarked?: boolean;
  className?: string;
};

export const BookmarkButton = ({
  publicId,
  initialBookmarked = false,
  className
}: Props) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const toggleBookmark = async () => {
    if (saving) return;
    setSaving(true);
    const response = await fetch('/api/bookmarks', {
      method: bookmarked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId })
    });
    const payload = await response.json();
    setSaving(false);

    if (response.status === 401) {
      toast('Sign in required to bookmark experiments.');
      return;
    }

    if (!payload.ok) {
      toast(payload.error?.message ?? 'Unable to update bookmark.');
      return;
    }

    setBookmarked(!bookmarked);
  };

  return (
    <Button
      type="button"
      variant={bookmarked ? 'secondary' : 'ghost'}
      className={cn('px-3 py-1 text-xs', className)}
      onClick={toggleBookmark}
      disabled={saving}
    >
      {saving ? 'Saving...' : bookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  );
};
