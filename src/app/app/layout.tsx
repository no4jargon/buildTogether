import Link from 'next/link';
import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';

export default async function AppLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link className="text-lg font-semibold text-white" href="/app/experiments">
            Build Together
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="/app/experiments">Experiments</Link>
            <Link href="/app/profile">Profile</Link>
            <Link href="/api/auth/signout">Sign out</Link>
          </nav>
        </div>
      </header>
      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
