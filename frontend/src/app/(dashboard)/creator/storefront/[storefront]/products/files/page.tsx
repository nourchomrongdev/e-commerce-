"use client";

import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Toast } from "@/components/ui";

const files = [
  ["laravel-api-mastery.pdf", "Laravel API Mastery", "PDF", "2.4 MB", "May 12, 2024", "document"],
  ["chapter-1-introduction.pdf", "Laravel API Mastery", "PDF", "1.8 MB", "May 12, 2024", "document"],
  ["flutter-course-preview.mp4", "Flutter UI Design Course", "Video", "24.6 MB", "May 8, 2024", "video"],
  ["course-cover.jpg", "Flutter UI Design Course", "Image", "1.2 MB", "May 8, 2024", "image"],
  ["vue-basics.zip", "Vue.js for Beginners", "Archive", "5.6 MB", "May 6, 2024", "archive"],
  ["javascript-fundamentals.pdf", "JavaScript Fundamentals", "PDF", "3.1 MB", "May 1, 2024", "document"],
  ["database-design-guide.pdf", "Database Design Basics", "PDF", "2.7 MB", "Apr 28, 2024", "document"],
] as const;

const fileIcon = { document: "file-search-corner", video: "view", image: "view", archive: "download" } as const;

export default function StorefrontFilesPage() {
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(false);
  const filteredFiles = useMemo(() => files.filter((file) => file[0].toLowerCase().includes(search.toLowerCase()) || file[1].toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {notice && <Toast variant="success" message="File upload started successfully." onClose={() => setNotice(false)} />}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Files</h1><p className="mt-1 text-sm text-muted">Manage all files used in your products.</p></div>
        <button type="button" onClick={() => setNotice(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"><PublicIcon name="download" className="h-3.5 w-3.5" /> Upload Files</button>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard title="Storage Used" value="2.45 GB" detail="of 10 GB" progress="24.5%" icon="download" />
        <SummaryCard title="Total Files" value="24" detail="Across all products" icon="file-search-corner" />
        <SummaryCard title="File Types" value="6" detail="Documents, videos, images, etc." icon="type" />
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-divider px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><h2 className="text-sm font-bold text-heading">Product Files</h2><label className="relative sm:w-64"><span className="sr-only">Search files</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files..." className="h-9 w-full rounded-lg border border-border-control pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary" /></label></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="bg-surface-muted text-[10px] text-muted"><tr><th className="px-6 py-3 font-medium">File Name</th><th className="py-3 font-medium">Product</th><th className="py-3 font-medium">Type</th><th className="py-3 font-medium">Size</th><th className="py-3 font-medium">Uploaded At</th><th className="px-6 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{filteredFiles.map(([name, product, type, size, date, icon]) => <tr key={name} className="border-t border-divider text-body transition hover:bg-surface-hover"><td className="px-6 py-3"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-md bg-orange-50 text-primary"><PublicIcon name={fileIcon[icon]} className="h-4 w-4" /></span><span className="font-medium text-body-strong">{name}</span></div></td><td className="py-3 text-[10px] text-muted">{product}</td><td className="py-3 text-[10px] text-muted">{type}</td><td className="py-3 text-[10px] text-muted">{size}</td><td className="py-3 text-[10px] text-muted">{date}</td><td className="px-6 py-3"><div className="flex justify-end gap-2"><button type="button" aria-label={`Download ${name}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="download" className="h-3.5 w-3.5" /></button><button type="button" aria-label={`More actions for ${name}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table>{filteredFiles.length === 0 && <p className="px-6 py-12 text-center text-sm text-muted">No files match your search.</p>}</div>
        <footer className="flex flex-col gap-3 border-t border-divider px-6 py-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between"><span>Showing {filteredFiles.length} of 24 files</span><div className="flex items-center gap-1"><button type="button" aria-label="Previous page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted-faint"><PublicIcon name="left" className="h-3 w-3" /></button><button type="button" className="grid h-7 w-7 place-items-center rounded-md bg-primary text-white">1</button><button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted">2</button><button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted">3</button><button type="button" aria-label="Next page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted"><PublicIcon name="right" className="h-3 w-3" /></button></div></footer>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, detail, progress, icon }: { title: string; value: string; detail: string; progress?: string; icon: string }) { return <article className="rounded-xl border border-border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold text-muted-soft">{title}</p><span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-primary"><PublicIcon name={icon as any} className="h-4 w-4" /></span></div><div className="mt-2 flex items-end justify-between gap-2"><p className="text-xl font-bold text-heading">{value}</p><span className="text-[10px] text-muted">{progress ?? ""}</span></div><p className="mt-1 text-[10px] text-muted">{detail}</p>{progress && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-primary" style={{ width: progress }} /></div>}</article>; }
