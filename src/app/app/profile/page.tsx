import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Profile</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-300">Name</p>
        <p className="text-lg text-white">{session?.user.name}</p>
        <p className="mt-3 text-sm text-slate-300">Email</p>
        <p className="text-lg text-white">{session?.user.email}</p>
      </div>
    </div>
  );
}
