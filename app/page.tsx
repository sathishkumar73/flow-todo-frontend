import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">Flow Todo</h1>
        <p className="mt-4 text-lg text-neutral-500">
          A minimal todo app that only ever shows your top&nbsp;10 tasks.
          Stay focused. Get things done.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/sign-in"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm hover:opacity-90 transition"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
          >
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
