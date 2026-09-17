"use client";

import { useState } from "react";
import PublicIcon, { type PublicIconSidebarName } from "@/components/icons/PublicIcon";
import { Badge, MetricTile } from "@/components/ui";

type AdminSection = "users" | "roles" | "content-rights" | "activity" | "downloads" | "license-activations" | "refunds" | "dmca" | "creators" | "affiliate-program" | "reviewers" | "storefronts" | "verification" | "payouts";
type Row = readonly string[];

const pages: Record<AdminSection, { title: string; description: string; metrics: readonly [string, string, string][]; columns: readonly string[]; filters: readonly string[]; rows: readonly Row[] }> = {
  users: {
    title: "Users", description: "Manage marketplace users, roles, and account status.",
    metrics: [["Total Users", "12,458", "+12.3%"], ["Active Users", "9,842", "+10.1%"], ["Suspended Users", "320", "-2.1%"], ["New This Month", "1,245", "+6.5%"]],
    columns: ["User", "Email", "Role", "Status", "Joined Date", "Actions"], filters: ["All Roles", "All Status"],
    rows: [["Nour Chowon", "nour@example.com", "Creator", "Active", "May 11, 2025", "⋮"], ["Jane Cooper", "jane@example.com", "Customer", "Active", "May 10, 2025", "⋮"], ["Brooklyn Simmons", "brooklyn@example.com", "Creator", "Active", "May 9, 2025", "⋮"], ["Cody Fisher", "cody@example.com", "Customer", "Suspended", "May 8, 2025", "⋮"], ["Dianne Russell", "dianne@example.com", "Creator", "Active", "May 7, 2025", "⋮"]],
  },
  roles: {
    title: "Roles & Permissions", description: "Control access to marketplace features and settings.",
    metrics: [], columns: ["Role Name", "Description", "Users", "Last Updated", "Actions"], filters: [],
    rows: [["Super Admin", "Full access to all features and settings", "2", "May 12, 2025", "⋮"], ["Admin", "Manage system settings and users", "5", "May 10, 2025", "⋮"], ["Creator", "Can manage own products and sales", "1,245", "May 9, 2025", "⋮"], ["Moderator", "Can moderate content and users", "12", "May 8, 2025", "⋮"], ["Customer", "Can browse and purchase products", "9,158", "May 7, 2025", "⋮"]],
  },
  "content-rights": {
    title: "Content Rights", description: "Review ownership and usage rights across marketplace content.",
    metrics: [["Total Rights", "3,245", "+12.4%"], ["Active Rights", "2,890", "+11.1%"], ["Expired", "210", "+2.5%"], ["Revoked", "145", "-3.1%"]],
    columns: ["Content Name", "Type", "Usage Method", "Status", "Valid Until", "Actions"], filters: ["All Types", "All Status"],
    rows: [["Premium UI Kit", "Template", "UI Master", "Active", "May 11, 2026", "⋮"], ["Music Pack Vol 1", "Audio", "Sound Source", "Active", "Jun 15, 2026", "⋮"], ["3D Icon Set", "Graphics", "Design Hub", "Expired", "May 1, 2025", "⋮"], ["Video LUTs Pack", "Video", "Visual Flow", "Active", "April 20, 2026", "⋮"], ["E-book Design Guide", "E-book", "Creative Writer", "Active", "May 30, 2026", "⋮"]],
  },
  activity: {
    title: "Activity Log", description: "Monitor account and marketplace activity across the platform.", metrics: [],
    columns: ["Time", "User", "Action", "Details", "IP Address"], filters: ["All Actions", "All Users"],
    rows: [["May 11, 2025 04:45 PM", "Admin", "Login", "Admin logged in", "192.168.1.10"], ["May 11, 2025 02:02 PM", "Jane Cooper", "Updated Product", "Updated product 'Music UI Kit'", "192.168.1.21"], ["May 11, 2025 01:15 PM", "Brooklyn Simmons", "Deleted Content", "Deleted ID 'Template'", "192.168.1.15"], ["May 11, 2025 08:20 AM", "Cody Fisher", "Suspended User", "Suspended user cody@example.com", "192.168.1.30"], ["May 10, 2025 06:20 PM", "Admin", "Changed Settings", "Updated payout settings", "192.168.1.10"]],
  },
  downloads: {
    title: "Download Events", description: "Review product download activity and access locations.", metrics: [],
    columns: ["Time", "User", "Product", "Version", "IP Address", "Location"], filters: ["All Products", "All Dates"],
    rows: [["May 11, 2025 04:45 PM", "John Doe", "Premium UI Kit", "v2.0", "192.168.1.10", "London, UK"], ["May 11, 2025 02:02 PM", "Robert Fox", "Music Pack Vol 1", "v1.0", "192.168.1.21", "London, UK"], ["May 11, 2025 09:10 PM", "Wade Warren", "3D Icon Set", "v1.3", "192.168.1.1", "Toronto, Canada"], ["May 11, 2025 05:00 PM", "Dianne Russell", "Video LUTs Pack", "v1.0", "192.168.1.32", "Sydney, Australia"], ["May 11, 2025 03:30 PM", "Devan Lane", "E-book Design Guide", "v2.0", "192.168.1.55", "Berlin, Germany"]],
  },
  "license-activations": {
    title: "License Activations", description: "Track activated licenses and the devices using them.", metrics: [],
    columns: ["Time", "User", "Product", "License Key", "Status", "Device"], filters: ["All Products", "All Status"],
    rows: [["May 11, 2025 04:45 PM", "John Doe", "Premium UI Kit", "XXXX-XXXX-XXXX-1234", "Active", "Windows 11"], ["May 11, 2025 02:02 PM", "Robert Fox", "Music Pack Vol 1", "XXXX-XXXX-XXXX-3421", "Active", "Windows 10"], ["May 11, 2025 09:10 PM", "Wade Warren", "3D Icon Set", "XXXX-XXXX-XXXX-4588", "Revoked", "Windows 10"], ["May 11, 2025 05:00 PM", "Dianne Russell", "Video LUTs Pack", "XXXX-XXXX-XXXX-6671", "Active", "MacOS 14"], ["May 11, 2025 03:30 PM", "Devan Lane", "E-book Design Guide", "XXXX-XXXX-XXXX-9012", "Active", "Android 14"]],
  },
  refunds: {
    title: "Refund Requests", description: "Review and process customer refund requests.",
    metrics: [["Total Requests", "245", "+10.2%"], ["Pending", "32", "+3.1%"], ["Approved", "182", "+12.1%"], ["Rejected", "31", "-4.3%"]],
    columns: ["Request ID", "User", "Product", "Amount", "Status", "Requested At", "Actions"], filters: ["All Status"],
    rows: [["RFR-000245", "Jane Cooper", "Premium UI Kit", "$49.00", "Pending", "May 11, 2025", "⋮"], ["RFR-000244", "Robert Fox", "Music Pack Vol 1", "$29.00", "Approved", "May 10, 2025", "⋮"], ["RFR-000243", "Dianne Russell", "Video LUTs Pack", "$19.00", "Rejected", "May 10, 2025", "⋮"], ["RFR-000242", "Devan Lane", "E-book Design Guide", "$39.00", "Approved", "May 9, 2025", "⋮"], ["RFR-000241", "Cody Fisher", "3D Icon Set", "$24.00", "Pending", "May 9, 2025", "⋮"]],
  },
  dmca: {
    title: "DMCA Activity", description: "Track copyright notices, reports, and takedown activity.",
    metrics: [["Total Reports", "78", "+5.8%"], ["Pending", "12", "+1.2%"], ["Resolved", "56", "+8.3%"], ["Rejected", "10", "-4.6%"]],
    columns: ["Report ID", "Reported By", "Content", "Status", "Reported At", "Actions"], filters: ["All Status"],
    rows: [["DMCA-0078", "John Doe", "Pirated UI Kit", "Pending", "May 11, 2025", "⋮"], ["DMCA-0077", "Sarah Smith", "Music Pack Leak", "Resolved", "May 10, 2025", "⋮"], ["DMCA-0076", "Michael Johnson", "Stolen 3D Icon Pack", "Pending", "May 10, 2025", "⋮"], ["DMCA-0075", "Emily Davis", "Unauthorized Video", "Resolved", "May 9, 2025", "⋮"], ["DMCA-0074", "David Wilson", "E-book Copy", "Rejected", "May 9, 2025", "⋮"]],
  },
  creators: {
    title: "Creators", description: "Manage creators on the marketplace.", metrics: [["Total Creators", "386", "+12.4%"], ["Active Creators", "324", "+7.1%"], ["Verified Creators", "278", "+15.3%"], ["Suspended", "12", "-2.1%"]],
    columns: ["Creator", "Email", "Storefronts", "Status", "Verification", "Joined", "Actions"], filters: ["All Status", "All Verification"],
    rows: [["Jane Cooper", "jane@example.com", "2", "Active", "Verified", "May 11, 2025", "⋮"], ["Brooklyn Simmons", "brooklyn@example.com", "3", "Active", "Verified", "May 10, 2025", "⋮"], ["Cody Fisher", "cody@example.com", "1", "Active", "Pending", "May 9, 2025", "⋮"], ["Dianne Russell", "dianne@example.com", "2", "Active", "Verified", "May 7, 2025", "⋮"], ["Devon Lane", "devon@example.com", "1", "Suspended", "Rejected", "May 6, 2025", "⋮"]],
  },
  "affiliate-program": {
    title: "Affiliate Program", description: "Manage affiliates and their performance.", metrics: [["Total Affiliates", "542", "+8.6%"], ["Active Affiliates", "438", "+14.2%"], ["Total Commissions", "$12,450.75", "+22.3%"], ["Pending Payouts", "$2,340.50", "+5.8%"]],
    columns: ["Affiliate", "Email", "Tier", "Referrals", "Earnings", "Status", "Actions"], filters: ["All Status", "All Tiers"],
    rows: [["Robert Fox", "robert@example.com", "Gold", "92", "$2,450.75", "Active", "⋮"], ["Wade Warren", "wade@example.com", "Silver", "51", "$1,850.40", "Active", "⋮"], ["Esther Howard", "esther@example.com", "Bronze", "62", "$960.25", "Active", "⋮"], ["Cameron Williamson", "cameron@example.com", "Silver", "41", "$750.50", "Inactive", "⋮"], ["Guy Hawkins", "guy@example.com", "Bronze", "38", "$460.10", "Active", "⋮"]],
  },
  reviewers: {
    title: "Reviewers", description: "Manage product reviewers and their activity.", metrics: [["Total Reviewers", "128", "+2.1%"], ["Active Reviewers", "102", "+7.1%"], ["Total Reviews", "1,245", "+13.6%"], ["Pending Reviews", "23", "+4.7%"]],
    columns: ["Reviewer", "Email", "Expertise", "Reviews", "Rating", "Status", "Actions"], filters: ["All Status", "All Expertise"],
    rows: [["Adrian McCarthy", "adrian@example.com", "UI/UX, Templates", "56", "4.8", "Active", "⋮"], ["Kathryn Murphy", "kathryn@example.com", "Graphics, Icons", "42", "4.9", "Active", "⋮"], ["Bessie Cooper", "bessie@example.com", "Audio, Music", "38", "4.7", "Active", "⋮"], ["Albert Flores", "albert@example.com", "3D, Models", "36", "4.6", "Inactive", "⋮"], ["Theresa Webb", "theresa@example.com", "Cache, Software", "28", "4.8", "Active", "⋮"]],
  },
  storefronts: {
    title: "Storefronts", description: "Manage creator storefronts.", metrics: [["Total Storefronts", "812", "+15.2%"], ["Active Storefronts", "742", "+11.8%"], ["Inactive Storefronts", "58", "-3.4%"], ["Suspended", "12", "-2.1%"]],
    columns: ["Storefront", "Creator", "Category", "Products", "Status", "Created", "Actions"], filters: ["All Status", "All Categories"],
    rows: [["DesignHub", "Jane Cooper", "Templates", "124", "Active", "May 11, 2025", "⋮"], ["CodeCraft", "Brooklyn Simmons", "Code", "89", "Active", "May 10, 2025", "⋮"], ["AudioWave", "Cody Fisher", "Audio", "67", "Active", "May 9, 2025", "⋮"], ["PixelPerfect", "Dianne Russell", "Graphics", "156", "Active", "May 7, 2025", "⋮"], ["3DAssets", "Devon Lane", "3D Models", "98", "Suspended", "May 6, 2025", "⋮"]],
  },
  verification: {
    title: "Verification Requests", description: "Review and manage creator verification requests.", metrics: [["Total Requests", "245", "+10.2%"], ["Pending", "32", "+5.4%"], ["Approved", "182", "+12.1%"], ["Rejected", "31", "-3.2%"]],
    columns: ["Creator", "Email", "Requested On", "Documents", "Status", "Actions"], filters: ["All Status"],
    rows: [["Marvin McKinney", "marvin@example.com", "May 11, 2025", "2 files", "Pending", "⋮"], ["Savannah Nguyen", "savannah@example.com", "May 10, 2025", "3 files", "Pending", "⋮"], ["Leslie Alexander", "leslie@example.com", "May 9, 2025", "2 files", "Approved", "⋮"], ["Darnell Stewart", "darnell@example.com", "May 8, 2025", "3 files", "Rejected", "⋮"], ["Jacob Jones", "jacob@example.com", "May 7, 2025", "3 files", "Approved", "⋮"]],
  },
  payouts: {
    title: "Payout Information", description: "Manage creator payout settings and methods.", metrics: [["Total Payouts", "$125,430.50", "+16.8%"], ["Pending Payouts", "$12,340.75", "+3.2%"], ["Available Balance", "$8,950.20", "+9.3%"], ["This Month", "$15,230.40", "+12.4%"]],
    columns: ["Creator", "Payment Method", "Account / Email", "Available Balance", "Status", "Actions"], filters: ["All Status", "All Methods"],
    rows: [["Jane Cooper", "PayPal", "jane@example.com", "$1,240.50", "Active", "⋮"], ["Brooklyn Simmons", "Bank Transfer", "**** 4524", "$980.75", "Active", "⋮"], ["Cody Fisher", "Payoneer", "**** 9810", "$2,450.30", "Active", "⋮"], ["Dianne Russell", "Wise", "dianne@example.com", "$1,120.60", "Pending", "⋮"], ["Devon Lane", "Bank Transfer", "**** 8899", "$125.80", "Active", "⋮"]],
  },
};

const metricIcons: Record<string, PublicIconSidebarName | "user"> = {
  "Total Users": "user",
  "Active Users": "user",
  "Suspended Users": "shield-minus",
  "New This Month": "user",
  "Total Rights": "key",
  "Active Rights": "verification",
  Expired: "clock-9",
  Revoked: "shield-minus",
  "Total Requests": "receipt",
  Pending: "clock-9",
  Approved: "check",
  Rejected: "x",
  "Total Reports": "file-search-corner",
  Resolved: "check",
  "Total Creators": "store",
  "Active Creators": "store",
  "Verified Creators": "verified",
  "Total Affiliates": "user",
  "Active Affiliates": "user",
  "Total Commissions": "dollar",
  "Total Reviewers": "user",
  "Active Reviewers": "user",
  "Total Storefronts": "store",
  "Active Storefronts": "store",
  "Total Payouts": "payout",
  "Pending Payouts": "clock-9",
  "Available Balance": "wallet",
};

export default function AdminDataPage({ section }: { section: AdminSection }) {
  const config = pages[section];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const rows = config.rows.filter((row) => row.some((value) => value.toLowerCase().includes(search.toLowerCase())) && (filter === "All" || row.includes(filter)));
  return <div className="mx-auto w-full max-w-[1400px]">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">Administration</p><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{config.title}</h1><p className="mt-1 text-sm text-muted">{config.description}</p></div>{(section === "users" || section === "roles") && <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover"><PublicIcon name="add" className="h-3.5 w-3.5" /> Add {section === "users" ? "User" : "Role"}</button>}</header>
    {config.metrics.length > 0 && <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{config.metrics.map(([label, value, change]) => <MetricTile key={label} label={label} value={value} change={change} icon={<PublicIcon name={metricIcons[label] ?? "dashboard"} className="h-5 w-5" />} />)}</div>}
    <section className={`${config.metrics.length > 0 ? "mt-5" : "mt-6"} overflow-hidden rounded-2xl border border-border bg-white shadow-sm`}><div className="flex flex-col gap-3 border-b border-divider px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex flex-1 flex-wrap gap-2"><label className="relative min-w-[14rem] flex-1 sm:max-w-[18rem]"><span className="sr-only">Search {config.title}</span><PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className="h-9 w-full rounded-lg border border-border-control pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint transition focus:border-primary focus:ring-2 focus:ring-orange-100" /></label>{config.filters.map((name) => <select key={name} aria-label={name} value={filter === "All" ? "All" : filter} onChange={(event) => setFilter(event.target.value)} className="select-chevron h-9 rounded-lg border border-border-control bg-white px-3 pr-9 text-[10px] text-body outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-orange-100"><option value="All">{name}</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Verified">Verified</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Resolved">Resolved</option><option value="Rejected">Rejected</option><option value="Suspended">Suspended</option></select>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-surface-muted text-[10px] text-muted"><tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="border-t border-divider text-body transition hover:bg-surface-hover">{row.map((value, valueIndex) => <td key={`${value}-${valueIndex}`} className={`px-5 py-3 ${valueIndex === 0 ? "font-medium text-body-strong" : "text-[10px] text-muted"}`}>{valueIndex === row.length - 1 && config.columns[config.columns.length - 1] === "Actions" ? <button type="button" aria-label={`More actions for ${row[0]}`} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted transition hover:border-primary hover:bg-accent-light hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-3.5 w-3.5" /></button> : ["Active", "Approved", "Resolved", "Verified"].includes(value) ? <Badge tone="success">{value}</Badge> : ["Pending", "In Review"].includes(value) ? <Badge tone="warning">{value}</Badge> : ["Inactive", "Suspended", "Expired", "Revoked", "Rejected"].includes(value) ? <Badge tone="danger">{value}</Badge> : value}</td>)}</tr>)}</tbody></table></div><footer className="flex items-center justify-between border-t border-divider px-6 py-4 text-[10px] text-muted"><span>Showing 1 to {rows.length} of {config.rows.length} results</span><div className="flex gap-1"><button type="button" aria-label="Previous page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted-faint transition hover:border-primary hover:bg-accent-light hover:text-primary">&lt;</button><button type="button" aria-label="Next page" className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted-faint transition hover:border-primary hover:bg-accent-light hover:text-primary">&gt;</button></div></footer></section>
  </div>;
}

export type { AdminSection };