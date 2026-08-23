"use client";

export default function CreatorError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-[#e8eaf2] bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-orange-50 text-xl text-primary">!</div>
        <h1 className="mt-4 text-lg font-bold text-[#111b40]">Creator dashboard could not load</h1>
        <p className="mt-2 text-sm leading-6 text-[#66718e]">Something went wrong while loading this page. Try again.</p>
        <button type="button" onClick={() => reset()} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e65d00]">
          Try again
        </button>
      </section>
    </div>
  );
}