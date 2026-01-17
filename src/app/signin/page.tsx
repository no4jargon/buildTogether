import Link from 'next/link';

const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

async function getCsrfToken() {
  try {
    const response = await fetch(`${baseUrl}/api/auth/csrf`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      return '';
    }
    const data = (await response.json()) as { csrfToken?: string };
    return data.csrfToken ?? '';
  } catch {
    return '';
  }
}

export default async function SignInPage() {
  const csrfToken = await getCsrfToken();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Build Together Protocol
          </p>
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-300">
            Use your email to receive a magic link.
          </p>
        </header>
        <form
          className="flex flex-col gap-4"
          method="post"
          action="/api/auth/signin/email"
        >
          <input name="csrfToken" type="hidden" value={csrfToken} />
          <label className="text-sm text-slate-200" htmlFor="email">
            Email address
          </label>
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            id="email"
            name="email"
            placeholder="you@company.com"
            required
            type="email"
          />
          <button
            className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
            type="submit"
          >
            Email me a sign-in link
          </button>
        </form>
        {!csrfToken ? (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Email sign-in is temporarily unavailable. Check your server
            configuration and try again.
          </p>
        ) : null}
        <div className="text-sm text-slate-400">
          <Link className="text-sky-400 hover:text-sky-300" href="/">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
