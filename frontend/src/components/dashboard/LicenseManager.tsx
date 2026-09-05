"use client";

import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import { Badge, Toast } from "@/components/ui";

type LicenseView = "types" | "rules" | "keys" | "activations" | "revoked";

type LicenseManagerProps = {
  view: LicenseView;
  storefrontName: string;
};

const viewConfig = {
  types: { title: "License Types", description: "Create and manage different types of licenses for your digital products.", action: "Add License Type", icon: "type" },
  rules: { title: "License Rules", description: "Define rules and restrictions for how licenses can be used.", action: "Add Rule", icon: "settings" },
  keys: { title: "License Keys", description: "Generate, view and manage license keys for your products.", action: "Generate Keys", icon: "key" },
  activations: { title: "License Activations", description: "Track and monitor all license activations.", action: "", icon: "shield-check" },
  revoked: { title: "Revoked Licenses", description: "View and manage revoked or deactivated licenses.", action: "", icon: "shield-minus" },
} as const;

const rows = {
  types: [
    ["Personal License", "For personal use only. Non-commercial.", "Lifetime", "1 Device", "Active"],
    ["Commercial License", "For commercial use and client projects.", "Lifetime", "5 Devices", "Active"],
    ["Extended License", "Extended usage for multiple clients and projects.", "Lifetime", "Unlimited", "Active"],
    ["Educational License", "For educational institutions and students.", "1 Year", "1 Device", "Active"],
    ["Enterprise License", "For large organizations with custom terms.", "Lifetime", "Unlimited", "Active"],
  ],
  rules: [
    ["No Redistribution", "All Licenses", "Restriction", "Users cannot redistribute or resell the product.", "Active"],
    ["No Modification", "All Licenses", "Restriction", "Users cannot modify or reverse engineer the files.", "Active"],
    ["Require Internet Check", "Standard, Extended", "Validation", "License must be validated online.", "Active"],
    ["Device Limit Enforcement", "All Licenses", "Limitation", "Enforce maximum number of devices allowed.", "Active"],
    ["Expiration Enforcement", "Time Limited", "Limitation", "License expires after a specified date.", "Active"],
  ],
  keys: [
    ["XXXX-XXXX-XXXX-7Q8K", "Laravel API Mastery", "Personal License", "Active", "john.doe@email.com", "May 21, 2025"],
    ["XXXX-XXXX-XXXX-4Z2M", "UI/UX Design Kit", "Commercial License", "Active", "design@studio.com", "May 20, 2025"],
    ["XXXX-XXXX-XXXX-9P3L", "React Components", "Extended License", "Unactivated", "-", "-"],
    ["XXXX-XXXX-XXXX-2QYN", "Video Course Pack", "Educational License", "Active", "student@email.com", "May 18, 2025"],
    ["XXXX-XXXX-XXXX-5C1B", "Stock Photo Bundle", "Personal License", "Revoked", "-", "May 16, 2025"],
  ],
  activations: [
    ["XXXX-XXXX-XXXX-6Q1R", "Laravel API Mastery", "john.doe@email.com", "Windows 11 / Chrome", "New York, USA", "May 21, 2025"],
    ["XXXX-XXXX-XXXX-4Z2M", "UI/UX Design Kit", "design@studio.com", "macOS / Safari", "London, UK", "May 20, 2025"],
    ["XXXX-XXXX-XXXX-9P3L", "React Components", "alex@email.com", "Windows 10 / Edge", "Berlin, Germany", "May 19, 2025"],
    ["XXXX-XXXX-XXXX-2QYN", "Video Course Pack", "student@email.com", "Android 14 / Chrome", "Tokyo, Japan", "May 18, 2025"],
    ["XXXX-XXXX-XXXX-6Q1R", "Stock Photo Bundle", "marketing@agency.com", "iOS 17 / Safari", "Sydney, Australia", "May 17, 2025"],
  ],
  revoked: [
    ["XXXX-XXXX-XXXX-6Q1R", "Stock Photo Bundle", "Personal License", "NourChomrong", "Payment dispute", "May 22, 2025 11:20 AM", "Revoked"],
    ["XXXX-XXXX-XXXX-7K8L", "React Components", "Extended License", "NourChomrong", "Violation of license terms", "May 20, 2025 03:15 PM", "Revoked"],
    ["XXXX-XXXX-XXXX-1PML", "Laravel API Mastery", "Commercial License", "NourChomrong", "Fraudulent activity", "May 18, 2025 09:40 AM", "Revoked"],
    ["XXXX-XXXX-XXXX-7Q2H", "UI/UX Design Kit", "Personal License", "NourChomrong", "Manual revocation", "May 15, 2025 02:30 PM", "Revoked"],
    ["XXXX-XXXX-XXXX-6F4V", "Video Course Pack", "Educational License", "NourChomrong", "Exceeded device limit", "May 12, 2025 10:10 AM", "Revoked"],
  ],
} as const;

export default function LicenseManager({ view, storefrontName }: LicenseManagerProps) {
  const config = viewConfig[view];
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(false);
  const filteredRows = useMemo(() => rows[view].filter((row) => row.join(" ").toLowerCase().includes(search.trim().toLowerCase())), [search, view]);
  const headers = view === "types" ? ["License Type", "Description", "Duration", "Max Devices", "Status", "Actions"] : view === "rules" ? ["Rule Name", "Applies To", "Rule Type", "Description", "Status", "Actions"] : view === "keys" ? ["License Key", "Product", "License Type", "Status", "Activated By", "Activated On", "Actions"] : view === "activations" ? ["License Key", "Product", "Activated By", "Device / Browser", "Location (IP)", "Activated On", "Actions"] : ["License Key", "Product", "License Type", "Revoked By", "Reason", "Revoked On", "Status", "Actions"];

  return <div className="mx-auto w-full max-w-[1400px]">
    {notice && <Toast variant="success" message={`${config.title} action completed for ${storefrontName}.`} onClose={() => setNotice(false)} />}
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{config.title}</h1><p className="mt-1 text-sm text-muted">{config.description}</p></div>{config.action && <button type="button" onClick={() => setNotice(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"><PublicIcon name="add" className="h-3.5 w-3.5" /> {config.action}</button>}</header>
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-divider px-5 py-4 sm:px-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-sm font-bold text-heading">{config.title}</h2><label className="relative sm:w-64"><span className="sr-only">Search {config.title}</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className="h-9 w-full rounded-lg border border-border-control pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary" /></label></div>{(view === "keys" || view === "activations" || view === "revoked") && <div className="flex flex-wrap gap-2"><Filter label="All Products" /><Filter label="All License Types" /><Filter label={view === "keys" ? "All Statuses" : "All Time"} /></div>}</div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-surface-muted text-[10px] text-muted"><tr>{headers.map((header) => <th key={header} className="px-5 py-3 font-medium">{header}</th>)}</tr></thead><tbody>{filteredRows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="border-t border-divider text-body transition hover:bg-surface-hover">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="max-w-[240px] px-5 py-3 text-[10px] text-body">{(cell === "Active" || cell === "Revoked" || cell === "Unactivated") ? <Badge tone={cell === "Active" ? "success" : cell === "Revoked" ? "danger" : "warning"}>{cell}</Badge> : cell}</td>)}<td className="px-5 py-3 text-right"><button type="button" aria-label={`More actions for ${row[0]}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button></td></tr>)}</tbody></table>{filteredRows.length === 0 && <p className="px-6 py-12 text-center text-sm text-muted">No matching records.</p>}</div><footer className="flex flex-col gap-3 border-t border-divider px-6 py-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between"><span>Showing {filteredRows.length} of {rows[view].length} records</span><div className="flex items-center gap-1"><button type="button" aria-label="Previous page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted-faint"><PublicIcon name="left" className="h-3 w-3" /></button><button type="button" className="grid h-7 w-7 place-items-center rounded-md bg-primary text-white">1</button><button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted">2</button><button type="button" aria-label="Next page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted"><PublicIcon name="right" className="h-3 w-3" /></button></div></footer></section>
  </div>;
}

function Filter({ label }: { label: string }) { return <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-border-control bg-white px-3 py-2 text-[10px] font-medium text-body hover:bg-surface-control">{label}<PublicIcon name="down" className="h-3 w-3" /></button>; }
