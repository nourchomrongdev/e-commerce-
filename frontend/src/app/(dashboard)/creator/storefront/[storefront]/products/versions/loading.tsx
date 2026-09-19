function VersionHistorySkeleton() {
  return <div className="mx-auto w-full max-w-[1120px] animate-pulse"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="h-8 w-52 rounded bg-surface-muted" /><div className="mt-2 h-4 w-64 rounded bg-surface-muted" /></div><div className="h-9 w-32 rounded-lg bg-surface-muted" /></div><div className="mt-6 h-10 max-w-md rounded-lg bg-surface-muted" /><section className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"><div className="space-y-5">{[1, 2].map((item) => <div key={item} className="flex items-start gap-4 border-b border-divider pb-5 last:border-0"><span className="mt-1 h-3 w-3 rounded-full bg-surface-muted" /><div className="flex-1"><div className="h-4 w-32 rounded bg-surface-muted" /><div className="mt-2 h-3 w-64 rounded bg-surface-muted" /><div className="mt-2 h-3 w-40 rounded bg-surface-muted" /></div></div>)}</div></section></div>;
}

export default function Loading() {
  return <VersionHistorySkeleton />;
}