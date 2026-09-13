"use client";

export default function CreatorError({
  reset,
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message ?? "";
  const isCreatorNotFound = /creator( profile)? (could not be found|not found)|creator.*not found/i.test(message);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl border border-[#e8eaf2] bg-white p-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-2xl text-primary">!</div>
        <h1 className="mt-6 text-2xl font-bold text-[#111b40] sm:text-3xl">
          {isCreatorNotFound ? "Creator could not be found" : "Creator dashboard could not load"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#66718e]">
          {isCreatorNotFound
            ? "This creator profile is missing or unavailable right now."
            : "Something went wrong while loading this page. Try again."}
        </p>
        <button type="button" onClick={() => reset()} className="mt-7 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-[#e65d00]">
          Try again
        </button>
      </section>
    </div>
  );
}