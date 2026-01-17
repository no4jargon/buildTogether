import Link from 'next/link';

const manifesto = [
  'Most people who want to build something new do not fail because they lack ideas, skill, or intent.',
  'They fail because building something new introduces risk. Risk to income, to time, to relationships, to self image. Choosing stability in the face of that risk is rational.',
  'We were in the same place.',
  'We realized that the problem was not fear of work, but fear of irreversible commitment. Building one big thing demands belief before evidence. Most people never get past that step.',
  'Our answer was simple. Treat every venture as an experiment. Reduce irreversibility. Run multiple experiments in parallel. Cap downside. Compound learning.',
  'But experimentation alone is not enough.',
  'The real failure mode we kept running into was accountability. Ideas multiplied, anxiety grew, and group projects slowly decayed. Responsibility diffused, communication thinned, and unfinished work began to damage confidence and relationships.',
  'This protocol exists to solve that.',
  'The Build Together Protocol is a shared system for collaboration. It makes ownership explicit, effort visible, decisions clear, and progress legible. It is designed for people who want to build without gambling their lives on a single bet.',
  'This is not about hustle or hero founders. It is about disciplined collaboration under uncertainty.',
  'Build together, or not at all.'
];

export default function LandingPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Build Together Protocol v0
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Build experiments together without chaos.
          </h1>
          <p className="text-lg text-slate-300">
            A protocol for making ownership explicit, effort visible, and
            progress legible.
          </p>
        </header>
        <div className="flex flex-wrap gap-4">
          <Link
            className="rounded-md bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-400"
            href="/api/auth/signin"
          >
            Sign in
          </Link>
          <Link
            className="rounded-md border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 hover:border-slate-400"
            href="/experiments"
          >
            View public experiments
          </Link>
        </div>
        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-200">
          <h2 className="text-xl font-semibold text-white">Manifesto</h2>
          {manifesto.map((line) => (
            <p key={line} className="leading-relaxed">
              {line}
            </p>
          ))}
        </section>
      </div>
    </main>
  );
}
