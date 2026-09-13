"use client";

import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Badge, Toast } from "@/components/ui";

type ActivityView = "downloads" | "redownloads" | "refunds" | "reviews" | "responses";

type Props = { view: ActivityView; storefrontName: string };

const config = {
  downloads: { title: "Download Activity", description: "Track downloads of your digital products.", action: "Export", search: "Search downloads...", headers: ["Date", "Customer", "Product", "License Key", "IP Address", "Location (IP)", "Actions"] },
  redownloads: { title: "Re-download Requests", description: "Manage customer requests to re-download their purchased products.", action: "Export", search: "Search requests...", headers: ["Request ID", "Date", "Customer", "Product", "License Key", "Status", "Actions"] },
  refunds: { title: "Refund Requests", description: "Review and manage refund requests from customers.", action: "Export", search: "Search refunds...", headers: ["Request ID", "Date", "Customer", "Product", "Amount", "Reason", "Status", "Actions"] },
  reviews: { title: "Customer Reviews", description: "See what customers are saying about your products.", action: "Export", search: "Search reviews...", headers: ["Customer", "Product", "Rating", "Review", "Date", "Actions"] },
  responses: { title: "My Responses", description: "Manage your responses to customer reviews.", action: "Export", search: "Search responses...", headers: ["Review", "Product", "Your Response", "Replied On", "Actions"] },
} as const;

const data = {
  downloads: [
    ["May 22, 2025 11:20 AM", "John Doe", "Stock Photo Bundle", "XXXX-XXXX-XXXX-6Q1R", "103.45.67.89", "New York, USA"],
    ["May 20, 2025 03:15 PM", "Alex Johnson", "React Components", "XXXX-XXXX-XXXX-7K8L", "104.28.19.33", "London, UK"],
    ["May 18, 2025 09:40 AM", "Sarah Miller", "Laravel API Mastery", "XXXX-XXXX-XXXX-1PML", "192.168.33.42", "Berlin, Germany"],
    ["May 17, 2025 02:35 PM", "Mike Wilson", "UI/UX Design Kit", "XXXX-XXXX-XXXX-7Q2H", "101.32.45.67", "Tokyo, Japan"],
    ["May 16, 2025 10:15 AM", "Emma Davis", "Video Course Pack", "XXXX-XXXX-XXXX-6F4V", "203.15.12.55", "Sydney, Australia"],
  ],
  redownloads: [
    ["#REQ-1021", "May 22, 2025 10:30 AM", "john.doe@email.com", "Stock Photo Bundle", "XXXX-XXXX-XXXX-6Q1R", "Approved"],
    ["#REQ-1020", "May 21, 2025 04:45 PM", "alex@studio.com", "React Components", "XXXX-XXXX-XXXX-7K8L", "Pending"],
    ["#REQ-1019", "May 19, 2025 11:10 AM", "sarah.design@gmail.com", "Laravel API Mastery", "XXXX-XXXX-XXXX-1PML", "Approved"],
    ["#REQ-1018", "May 18, 2025 03:40 PM", "mike@design.com", "UI/UX Design Kit", "XXXX-XXXX-XXXX-7Q2H", "Approved"],
    ["#REQ-1017", "May 17, 2025 09:20 AM", "emma@agency.com", "Video Course Pack", "XXXX-XXXX-XXXX-6F4V", "Rejected"],
  ],
  refunds: [
    ["#REF-1008", "May 22, 2025 01:45 PM", "john.doe@email.com", "Stock Photo Bundle", "$39.00", "Purchased by mistake", "Pending"],
    ["#REF-1007", "May 20, 2025 04:10 PM", "alex@studio.com", "React Components", "$49.00", "Not as described", "Approved"],
    ["#REF-1006", "May 18, 2025 09:40 AM", "sarah.design@gmail.com", "Laravel API Mastery", "$42.00", "Technical issue", "Rejected"],
    ["#REF-1005", "May 17, 2025 02:25 PM", "mike@design.com", "UI/UX Design Kit", "$59.00", "Found a better alternative", "Pending"],
    ["#REF-1004", "May 15, 2025 11:50 AM", "emma@agency.com", "Video Course Pack", "$79.00", "Duplicate purchase", "Approved"],
  ],
  reviews: [
    ["John Doe", "Stock Photo Bundle", "★★★★★", "Excellent quality photos! Exactly what I needed for my project.", "May 22, 2025"],
    ["Alex Johnson", "React Components", "★★★★★", "Great components, well documented and easy to integrate.", "May 20, 2025"],
    ["Sarah Miller", "Laravel API Mastery", "★★★★☆", "Very helpful course, learned a lot.", "May 18, 2025"],
    ["Mike Wilson", "UI/UX Design Kit", "★★★★★", "Best design kit I have used.", "May 17, 2025"],
    ["Emma Davis", "Video Course Pack", "★★★★☆", "Good content overall, some sections could be deeper.", "May 15, 2025"],
  ],
  responses: [
    ["John Doe", "Stock Photo Bundle", "Thank you so much, John! I am glad the photos work well for your project.", "May 22, 2025 11:45 AM"],
    ["Alex Johnson", "React Components", "Thanks Alex! I appreciate your support and feedback.", "May 20, 2025 03:30 PM"],
    ["Sarah Miller", "Laravel API Mastery", "Thank you Sarah! I am happy the course helped.", "May 18, 2025 10:20 AM"],
    ["Mike Wilson", "UI/UX Design Kit", "Thanks Mike. Glad you liked the design organization.", "May 17, 2025 03:00 PM"],
    ["Emma Davis", "Video Course Pack", "Thanks Emma! I will expand those sections in the next update.", "May 15, 2025 12:05 PM"],
  ],
} as const;

export default function CreatorActivityManager({ view, storefrontName }: Props) {
  const page = config[view];
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(false);
  const visibleRows = useMemo(() => data[view].filter((row) => row.join(" ").toLowerCase().includes(search.trim().toLowerCase())), [search, view]);

  return <div className="mx-auto w-full max-w-[1400px]">
    {notice && <Toast variant="success" message={`${page.title} export is ready for ${storefrontName}.`} onClose={() => setNotice(false)} />}
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{page.title}</h1><p className="mt-1 text-sm text-muted">{page.description}</p></div><button type="button" onClick={() => setNotice(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-control bg-white px-3.5 py-2 text-xs font-semibold text-body hover:bg-surface-control"><PublicIcon name="down" className="h-3.5 w-3.5 rotate-180" /> {page.action}</button></header>
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-divider px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><h2 className="text-sm font-bold text-heading">{page.title}</h2><label className="relative sm:w-64"><span className="sr-only">{page.search}</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={page.search} className="h-9 w-full rounded-lg border border-border-control pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary" /></label></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-surface-muted text-[10px] text-muted"><tr>{page.headers.map((header) => <th key={header} className="px-5 py-3 font-medium">{header}</th>)}</tr></thead><tbody>{visibleRows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="border-t border-divider text-body transition hover:bg-surface-hover">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="max-w-[260px] px-5 py-3 text-[10px]">{cell === "Approved" || cell === "Active" ? <Badge tone="success">{cell}</Badge> : cell === "Pending" ? <Badge tone="warning">{cell}</Badge> : cell === "Rejected" || cell === "Revoked" ? <Badge tone="danger">{cell}</Badge> : cell === "★★★★★" || cell === "★★★★☆" ? <span className="font-semibold tracking-wider text-primary">{cell}</span> : cell}</td>)}<td className="px-5 py-3 text-right"><button type="button" aria-label={`More actions for ${row[0]}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button></td></tr>)}</tbody></table>{visibleRows.length === 0 && <p className="px-6 py-12 text-center text-sm text-muted">No matching records.</p>}</div><footer className="flex flex-col gap-3 border-t border-divider px-6 py-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between"><span>Showing {visibleRows.length} of {data[view].length} records</span><div className="flex items-center gap-1"><button type="button" aria-label="Previous page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted-faint"><PublicIcon name="left" className="h-3 w-3" /></button><button type="button" className="grid h-7 w-7 place-items-center rounded-md bg-primary text-white">1</button><button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted">2</button><button type="button" aria-label="Next page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted"><PublicIcon name="right" className="h-3 w-3" /></button></div></footer></section>
  </div>;
}
