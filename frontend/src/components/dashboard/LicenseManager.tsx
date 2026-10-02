"use client";

import jsQR from "jsqr";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";
import LicenseKeyRevealDialog from "@/components/dashboard/LicenseKeyRevealDialog";
import { Badge, InputText, Modal, Textarea, Toast } from "@/components/ui";

type LicenseView = "types" | "rules" | "keys" | "orders" | "revoked";
type LicenseRow = Record<string, string | number | null> & { id: number; uuid?: string; licenseId?: number; appliesToIds?: number[]; licenseRuleCount?: number; licenseRules?: string };
type Props = { view: LicenseView; storefrontName: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const config = {
  types: ["License Types", "Create and manage different types of licenses for your digital products.", "Add License Type"],
  rules: ["License Rules", "Define rules and restrictions for how licenses can be used.", "Add Rule"],
  keys: ["License Keys", "Generate, view and manage license keys for your products.", "Add License Key"],
  orders: ["License Orders", "Track license orders and their activations.", ""],
  revoked: ["Revoked Licenses", "View and manage revoked or deactivated licenses.", ""],
} as const;
const fields: Record<LicenseView, Array<[string, string]>> = {
  types: [["License Name", "name"], ["License Text", "description"], ["License Rules", "licenseRuleCount"], ["Duration", "duration"], ["Max Devices", "maxDevices"], ["Status", "status"]],
  rules: [["Rule Name", "name"], ["Applies To", "appliesTo"], ["Description", "description"], ["Status", "status"]],
  keys: [["Product", "product"], ["License Key", "key"], ["License Type", "licenseType"], ["Status", "status"], ["Activated On", "activatedOn"], ["Buyer Email", "buyerEmail"], ["Device / Browser", "device"], ["Location (IP)", "location"]],
  orders: [["License Key", "key"], ["Product", "product"], ["Activated By", "activatedBy"], ["Device / Browser", "device"], ["Location (IP)", "location"], ["Activated On", "activatedOn"]],
  revoked: [["Product", "product"], ["License Key", "key"], ["License Type", "licenseType"], ["Status", "status"], ["Revoked On", "revokedOn"], ["Revoked By", "activatedBy"], ["Reason", "reason"], ["Location (IP)", "location"]],
};
const formatLicenseTypeName = (value: string | number | null) => {
  const name = String(value ?? "-").trim();
  return /(?:^|\s)license$/i.test(name) ? name : `${name} License`;
};
const sentenceCase = (value: string | number | null) => {
  const text = String(value ?? "-").trim().toLowerCase();
  return text ? text[0].toUpperCase() + text.slice(1) : "-";
};
const maskLicenseKey = (value: string) => value.length > 8 ? `${value.slice(0, 4)}****${value.slice(-4)}` : "********";

const decodeQrFromImageSource = async (source: Blob | ImageBitmap | HTMLVideoElement | HTMLCanvasElement) => {
  const bitmap = source instanceof Blob ? await createImageBitmap(source) : source;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  const width = "videoWidth" in bitmap ? bitmap.videoWidth : bitmap.width;
  const height = "videoHeight" in bitmap ? bitmap.videoHeight : bitmap.height;
  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const code = jsQR(imageData.data, width, height);
  if (bitmap instanceof ImageBitmap) {
    bitmap.close();
  }
  return code?.data?.trim() || null;
};

export default function LicenseManager({ view, storefrontName }: Props) {
  const router = useRouter();
  const [licenseSection, setLicenseSection] = useState<"types" | "rules">(view === "rules" ? "rules" : "types");
  const currentView = view === "types" ? licenseSection : view;
  const [rows, setRows] = useState<LicenseRow[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");
  const [menu, setMenu] = useState<number | null>(null);
  const [editing, setEditing] = useState<LicenseRow | null>(null);
  const [details, setDetails] = useState<LicenseRow | null>(null);
  const [revealTarget, setRevealTarget] = useState<LicenseRow | null>(null);
  const [deleting, setDeleting] = useState<LicenseRow | null>(null);
  const [deleteProcessing, setDeleteProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<{ row: LicenseRow; action: "revoke" | "restore" } | null>(null);
  const [statusProcessing, setStatusProcessing] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const licenseEndpoint = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses`;
  const endpoint = `${licenseEndpoint}/${currentView === "orders" ? "activations" : currentView}`;
  const token = () => window.localStorage.getItem("marketplace-token") || "";

  const loadRows = async () => {
    setLoading(true);
    try {
      const targets = currentView === "keys" ? ["keys", "revoked"] : [currentView];
      const responses = await Promise.all(
        targets.map(async (viewName) => {
          const viewEndpoint = `${licenseEndpoint}/${viewName}?search=${encodeURIComponent(search)}`;
          const response = await fetch(viewEndpoint, { headers: { Authorization: `Bearer ${token()}` } });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to load licenses.");
          return Array.isArray(data.rows) ? data.rows : [];
        })
      );
      const merged = new Map<number, LicenseRow>();
      for (const rowsForView of responses) {
        for (const row of rowsForView) {
          const id = Number(row.id ?? row.LicenseId ?? 0);
          if (!id) continue;
          merged.set(id, row as LicenseRow);
        }
      }
      const sortedRows = [...merged.values()].sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0));
      setRows(sortedRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load licenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === "revoked") {
      setStatusFilter("revoked");
    } else if (currentView === "keys") {
      setStatusFilter((previous) => (previous === "revoked" ? "revoked" : "all"));
    }
  }, [currentView]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => { void loadRows(); }, [currentView, storefrontName, search]);
  const visibleRows = useMemo(() => {
    const filteredByStatus = currentView === "keys" || currentView === "revoked"
      ? rows.filter((row) => {
          const statusValue = String(row.status ?? "").toLowerCase();
          if (statusFilter === "all") return true;
          if (statusFilter === "active") return statusValue === "active";
          return statusValue === "revoked";
        })
      : rows.filter((row) => `${Object.values(row).join(" ")} ${currentView === "types" ? formatLicenseTypeName(row.name) : ""}`.toLowerCase().includes(search.toLowerCase()));

    return currentView === "keys" || currentView === "revoked" || currentView === "orders"
      ? filteredByStatus.filter((row) => {
          const searchable = [
            row.product,
            row.licenseType,
            row.status,
            row.activatedBy,
            row.reason,
            row.revokedOn,
            row.activatedOn,
          ].filter((value) => value !== null && value !== undefined && value !== "-");
          return searchable.some((value) => String(value).toLowerCase().includes(search.toLowerCase()));
        })
      : filteredByStatus;
  }, [rows, search, currentView, statusFilter]);
  const recordName = (row: LicenseRow | null) => row?.name && currentView === "types" ? formatLicenseTypeName(row.name) : currentView === "keys" || currentView === "revoked" ? `License key ${row?.id ?? ""}` : String(row?.name || "this license");
  const detailEntries = useMemo(() => {
    if (!details) return [] as Array<{ label: string; value: string }>;
    if (currentView === "keys" || currentView === "revoked") {
      return [
        { label: "License Key", value: String(details.key ?? "-") },
        { label: "Product", value: String(details.product ?? "-") },
        { label: "License Type", value: String(details.licenseType ?? "-") },
        { label: "Status", value: String(details.status ?? "-") },
        { label: "Buyer Email", value: String(details.buyerEmail ?? details.activatedBy ?? "-") },
        { label: "Activated By", value: String(details.activatedBy ?? "-") },
        { label: "Activated On", value: String(details.activatedOn ?? "-") },
        { label: "Device / Browser", value: String(details.device ?? "-") },
        { label: "Location (IP)", value: String(details.location ?? "-") },
        { label: "Revoked On", value: String(details.revokedOn ?? "-") },
        { label: "Reason", value: String(details.reason ?? "-") },
      ];
    }
    return fields[currentView].map(([label, key]) => ({ label, value: key === "key" ? maskLicenseKey(String(details[key] ?? "")) : String(details[key] ?? "-") }));
  }, [currentView, details]);
  const actionRow = rows.find((row) => row.id === menu) || null;

  const openDelete = (row: LicenseRow) => {
    setMenu(null);
    setConfirmation("");
    setDeleteError(null);
    setError(null);
    setDeleting(row);
  };
  const closeDelete = () => {
    if (deleteProcessing) return;
    setDeleting(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (deleteProcessing || !deleting || confirmation.trim() !== recordName(deleting).trim()) return;
    setDeleteProcessing(true);
    try {
      const deletePath = currentView === "orders" ? "orders" : currentView === "revoked" ? "keys" : currentView;
      const response = await fetch(`${licenseEndpoint}/${deletePath}/${deleting.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to delete item.");
      closeDelete();
      setNotice("License deleted successfully.");
      await loadRows();
    } catch (deleteError) {
      setDeleteError(deleteError instanceof Error ? deleteError.message : "Unable to delete item.");
    } finally {
      setDeleteProcessing(false);
    }
  };

  const updateStatus = async (row: LicenseRow, active: boolean, reason?: string) => {
    setStatusProcessing(true);
    const path = currentView === "keys" || currentView === "revoked" ? "keys" : "orders";
    const body = currentView === "keys" || currentView === "revoked"
      ? { status: active ? "active" : "revoked", ...(reason && reason.trim() ? { reason: reason.trim() } : {}) }
      : { isActive: active };
    try {
      const response = await fetch(`${licenseEndpoint}/${path}/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to update status.");
      setMenu(null);
      setStatusAction(null);
      setStatusReason("");
      setNotice("License status updated.");
      await loadRows();
    } finally {
      setStatusProcessing(false);
    }
  };

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try { await action(); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Action failed."); }
  };

  const productSuggestions = useMemo(() => {
    const products = [...rows]
      .map((row) => String(row.product ?? "").trim())
      .filter((product) => product.length > 0 && product !== "-");
    return [...new Set(products)].sort((left, right) => left.localeCompare(right));
  }, [rows]);

  const searchSuggestions = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    const source = query
      ? productSuggestions.filter((product) => product.toLowerCase().includes(query))
      : productSuggestions;

    return source.slice(0, 5).map((product) => (product.length > 40 ? `${product.slice(0, 40)}…` : product));
  }, [productSuggestions, searchInput]);

  const [title, description, action] = config[currentView];
  return <div className="mx-auto w-full max-w-[1400px]">
    {notice && <Toast variant="success" message={notice} onClose={() => setNotice(null)} />}
    {error && <Toast variant="error" message={error} onClose={() => setError(null)} />}
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{view === "types" ? "License Types" : title}</h1><p className="mt-1 text-sm text-muted">{view === "types" ? "Manage license types and rules for your digital products." : description}</p></div>{action && <button type="button" disabled={loading} onClick={() => setEditing({ id: 0 })} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"><PublicIcon name="add" className="h-3.5 w-3.5" /> {action}</button>}</header>
    {view === "types" && <div role="tablist" aria-label="License management sections" className="mt-5 flex w-fit gap-1 border-b border-divider">
      {(["types", "rules"] as const).map((section) => <button key={section} type="button" role="tab" disabled={loading} aria-selected={licenseSection === section} onClick={() => { setLicenseSection(section); setSearch(""); setRows([]); setLoading(true); setError(null); setMenu(null); setDetails(null); setEditing(null); setDeleting(null); }} className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${licenseSection === section ? "border-primary text-primary" : "border-transparent text-muted hover:text-heading"}`}>{section === "types" ? "License Types" : "License Rules"}</button>)}
    </div>}
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-divider px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-heading">{title}</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {(currentView === "keys" || currentView === "revoked") && (
              <label className="flex items-center gap-2 text-[10px] font-medium text-muted">
                <span>Status</span>
                <div className="relative">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "revoked")} disabled={loading} className={`h-9 appearance-none rounded-lg border bg-white px-2.5 pr-8 text-xs text-body outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${statusFilter !== "all" ? "border-primary bg-accent-light shadow-[0_0_0_1px_rgba(245,124,0,0.15)] focus:border-primary" : "border-border-control focus:border-primary"}`}>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary">
                    <PublicIcon name="chevron-down" className="h-3.5 w-3.5" />
                  </span>
                </div>
              </label>
            )}
            <div className="relative sm:w-64">
              <label className="relative block">
                <span className="sr-only">Search {title}</span>
                <PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" />
                <input
                  value={searchInput}
                  disabled={loading}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder={currentView === "keys" || currentView === "revoked" ? "Search products or licenses..." : `Search ${title.toLowerCase()}...`}
                  className="h-9 w-full rounded-lg border border-border-control pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary"
                />
              </label>
              {showSuggestions && searchInput.trim() && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border-control bg-white shadow-lg">
                  {searchSuggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => {
                      setSearchInput(suggestion);
                      setSearch(suggestion);
                      setShowSuggestions(false);
                    }} className="block w-full border-b border-divider px-3 py-2 text-left text-[11px] text-body last:border-b-0 hover:bg-surface-muted">
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={`overflow-x-auto ${currentView === "keys" || currentView === "revoked" ? "product-responsive-table" : ""}`}>
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-surface-muted text-[10px] text-muted">
            <tr>{fields[currentView].map(([label]) => <th key={label} className="px-5 py-3 font-medium">{label}</th>)}<th className="px-5 py-3 text-right font-medium">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={fields[currentView].length + 1} className="px-5 py-8 text-center text-xs text-muted">Loading licenses...</td></tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={fields[currentView].length + 1} className="px-5 py-12 text-center">
                  {currentView === "rules" && !search ? (
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-light text-primary"><PublicIcon name="settings" className="h-5 w-5" /></span>
                      <p className="mt-3 text-sm font-semibold text-heading">No license rules yet</p>
                      <p className="mt-1 text-xs leading-5 text-muted">Create a rule to describe how licenses apply to your products.</p>
                      <button type="button" onClick={() => setEditing({ id: 0 })} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover"><PublicIcon name="add" className="h-3.5 w-3.5" />Create License Rule</button>
                    </div>
                  ) : <span className="text-xs text-muted">No matching records found.</span>}
                </td>
              </tr>
            ) : visibleRows.map((row) => <LicenseRowView key={row.id} row={row} view={currentView} menu={menu} setMenu={setMenu} setEditing={setEditing} openDelete={openDelete} updateStatus={updateStatus} run={run} />)}
          </tbody>
        </table>
      </div>
      <div className="border-t border-divider px-5 py-4 text-[10px] text-muted">Showing {visibleRows.length} of {rows.length} records</div>
    </section>
    <Modal open={Boolean(actionRow)} title={`Actions: ${recordName(actionRow)}`} onClose={() => setMenu(null)}>
      {actionRow && <div className="grid gap-2">
        <button type="button" onClick={() => {
          setMenu(null);
          if (currentView === "types") {
            router.push(`/creator/storefront/${encodeURIComponent(storefrontName)}/licenses/types/${actionRow.id}`);
            return;
          }
          if (currentView === "keys") {
            if (!actionRow.uuid) { setError("License UUID is unavailable. Refresh and try again."); return; }
            router.push(`/creator/storefront/${encodeURIComponent(storefrontName)}/licenses/keys/${encodeURIComponent(actionRow.uuid)}`);
            return;
          }
          if (currentView === "revoked") {
            if (!actionRow.uuid) { setError("License UUID is unavailable. Refresh and try again."); return; }
            router.push(`/creator/storefront/${encodeURIComponent(storefrontName)}/licenses/revoked/${encodeURIComponent(actionRow.uuid)}`);
            return;
          }
          setDetails(actionRow);
        }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="view" className="h-4 w-4 text-primary" />View details</button>
        {(currentView === "rules" || (currentView === "types" && Boolean(actionRow.storefrontId))) && <button type="button" onClick={() => { setMenu(null); setEditing(actionRow); }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="edit" className="h-4 w-4 text-primary" />Edit license</button>}
        {(currentView === "rules" || currentView === "keys" || currentView === "revoked" || (currentView === "types" && Boolean(actionRow.storefrontId))) &&
          <button type="button" onClick={() => openDelete(actionRow)} className="flex items-center gap-3 rounded-lg border border-status-danger/20 px-4 py-3 text-left text-xs font-medium text-status-danger hover:bg-status-danger-surface"><PublicIcon name="delete" className="h-4 w-4" />Delete license</button>
        }
        {currentView === "types" && !actionRow.storefrontId && <p className="rounded-lg bg-surface-muted p-3 text-xs leading-5 text-muted">This is a shared default license and cannot be edited from one storefront.</p>}
        {currentView === "orders" && <button type="button" onClick={() => openDelete(actionRow)} className="flex items-center gap-3 rounded-lg border border-status-danger/20 px-4 py-3 text-left text-xs font-medium text-status-danger hover:bg-status-danger-surface"><PublicIcon name="delete" className="h-4 w-4" />Delete activation</button>}
        {(currentView === "keys" || currentView === "revoked") && <button type="button" onClick={() => {
          setMenu(null);
          setStatusAction({ row: actionRow, action: String(actionRow.status ?? "").toLowerCase() === "revoked" ? "restore" : "revoke" });
          setStatusReason("");
        }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name={String(actionRow.status ?? "").toLowerCase() === "revoked" ? "shield-check" : "shield-minus"} className="h-4 w-4 text-primary" />{String(actionRow.status ?? "").toLowerCase() === "revoked" ? "Restore license" : "Revoke license"}</button>}
        {currentView === "orders" && <button type="button" onClick={() => void run(() => updateStatus(actionRow, actionRow.status !== "Active"))} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="shield-check" className="h-4 w-4 text-primary" />{actionRow.status === "Active" ? "Deactivate order" : "Activate order"}</button>}
      </div>}
    </Modal>
    <Modal open={Boolean(details)} title={recordName(details) || "License details"} onClose={() => setDetails(null)} size="lg">
      {details && <div className="space-y-5 text-xs">
        <div className="rounded-2xl border border-divider bg-surface-muted/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">License</p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-heading">{String(details.product ?? "License")}</h3>
            </div>
            <div className="rounded-lg border border-primary/15 bg-accent-light px-3 py-1.5 text-[11px] font-semibold text-primary">{String(details.status ?? "Active")}</div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.8fr_0.9fr]">
          <div className="rounded-2xl border border-divider bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-divider pb-3">
              <span className="h-4 w-1.5 rounded-full bg-primary" />
              <h4 className="text-base font-bold text-heading">License information</h4>
            </div>
            <div className="mt-4 space-y-4">
              {detailEntries
                .filter(({ label }) => !["Status", "Buyer Email"].includes(label))
                .map(({ label, value }) => (
                  <div key={label} className="grid gap-1.5 border-b border-divider pb-3 last:border-b-0 last:pb-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</span>
                    <span className="break-all text-sm font-medium text-heading">{value}</span>
                  </div>
                ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-divider bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-divider pb-3">
              <span className="h-4 w-1.5 rounded-full bg-primary" />
              <h4 className="text-base font-bold text-heading">Status</h4>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Current status</div>
                <div className="mt-2 inline-flex rounded-md border border-primary/15 bg-accent-light px-2.5 py-1.5 text-xs font-semibold text-primary">{String(details.status ?? "Active")}</div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Buyer email</div>
                <div className="mt-2 text-sm font-medium text-heading">{String(details.buyerEmail ?? details.activatedBy ?? "-")}</div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Activated on</div>
                <div className="mt-2 text-sm font-medium text-heading">{String(details.activatedOn ?? "-")}</div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Location (IP)</div>
                <div className="mt-2 text-sm font-medium text-heading">{String(details.location ?? "-")}</div>
              </div>
            </div>
          </aside>
        </div>

        {(currentView === "keys" || currentView === "revoked" || currentView === "orders") && (
          <button type="button" onClick={() => setRevealTarget(details)} className="justify-self-start rounded-lg border border-border-control px-3 py-2 text-xs font-semibold text-body hover:border-primary hover:text-primary">
            Reveal full key
          </button>
        )}
      </div>}
    </Modal>
    {revealTarget && <LicenseKeyRevealDialog licenseId={revealTarget.licenseId ?? revealTarget.id} storefrontName={storefrontName} onClose={() => setRevealTarget(null)} />}
    {editing && (currentView === "keys" || currentView === "revoked" ? <LicenseKeyForm row={editing.id ? editing : null} storefrontName={storefrontName} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice("Saved successfully."); void loadRows(); }} onError={setError} /> : <LicenseForm view={currentView as "types" | "rules"} row={editing} storefrontName={storefrontName} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice("Saved successfully."); void loadRows(); }} onError={setError} />)}
    <Modal open={Boolean(statusAction)} title={statusAction?.action === "revoke" ? "Revoke license" : "Restore license"} onClose={() => { if (statusProcessing) return; setStatusAction(null); setStatusReason(""); }} footer={<><button type="button" disabled={statusProcessing} onClick={() => { setStatusAction(null); setStatusReason(""); }} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body disabled:opacity-60">Cancel</button><button type="button" disabled={statusProcessing || !statusReason.trim()} onClick={() => void run(() => updateStatus(statusAction!.row, statusAction!.action === "restore", statusReason))} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{statusProcessing ? "Processing..." : "Confirm"}</button></>}>
      <div className="grid gap-3 text-sm">
        <p className="leading-6 text-muted">{statusAction?.action === "revoke" ? "This license will be marked as revoked." : "This license will be restored to active status."}</p>
        <label className="grid gap-2 text-xs font-semibold text-ink">Reason
          <textarea value={statusReason} onChange={(event) => setStatusReason(event.target.value)} disabled={statusProcessing} rows={4} placeholder={statusAction?.action === "revoke" ? "Enter the reason for revoking this license" : "Enter the reason for restoring this license"} className="w-full rounded-lg border border-border-control bg-white px-3 py-2 text-sm font-normal text-body outline-none placeholder:text-muted-faint focus:border-primary disabled:cursor-not-allowed disabled:opacity-60" />
        </label>
      </div>
    </Modal>
    <Modal open={Boolean(deleting)} title="Confirm license deletion" onClose={closeDelete} footer={<><button type="button" disabled={deleteProcessing} onClick={closeDelete} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body disabled:opacity-60">Cancel</button><button type="button" onClick={() => void confirmDelete()} disabled={deleteProcessing || confirmation.trim() !== recordName(deleting).trim()} className="rounded-lg bg-status-danger px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{deleteProcessing ? "Deleting..." : "Delete license"}</button></>}><p className="text-sm leading-6 text-muted">This permanently deletes <span className="font-semibold text-ink">{recordName(deleting)}</span>. Type the license name to continue.</p><label className="mt-4 block text-xs font-semibold text-ink">License Name<input autoFocus disabled={deleteProcessing} aria-invalid={Boolean(deleteError)} aria-describedby={deleteError ? "license-delete-error" : undefined} value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setDeleteError(null); }} placeholder={recordName(deleting)} className={`mt-2 h-10 w-full rounded-lg border px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 ${deleteError ? "border-status-danger focus:border-status-danger" : "border-border-control focus:border-primary"}`} /></label>{deleteError && <p id="license-delete-error" role="alert" className="mt-2 text-xs text-status-danger">{deleteError}</p>}</Modal>
  </div>;
}

function LicenseRowView({ row, view, menu, setMenu, setEditing, openDelete, updateStatus, run }: { row: LicenseRow; view: LicenseView; menu: number | null; setMenu: (id: number | null) => void; setEditing: (row: LicenseRow) => void; openDelete: (row: LicenseRow) => void; updateStatus: (row: LicenseRow, active: boolean) => Promise<void>; run: (action: () => Promise<void>) => Promise<void> }) {
  const canEdit = view === "rules" || (view === "types" && Boolean(row.storefrontId));
  return <tr className="border-t border-divider text-body transition hover:bg-surface-hover">
    {fields[view].map(([label, key]) => <td key={key} data-label={label} className="max-w-[240px] px-5 py-3 text-[10px] text-body">
      {key === "status" && row[key] ? <Badge tone={row[key] === "Active" ? "success" : row[key] === "Revoked" ? "danger" : "warning"}>{String(row[key])}</Badge> : key === "key" ? maskLicenseKey(String(row[key] ?? "")) : (view === "keys" || view === "revoked") && key === "product" ? <strong className="block truncate text-[11px] font-semibold text-heading">{String(row[key] ?? "-")}</strong> : view === "types" && key === "name" ? formatLicenseTypeName(row[key]) : view === "rules" && (key === "name" || key === "description" || key === "appliesTo") ? sentenceCase(row[key]) : String(row[key] ?? "-")}
    </td>)}
    <td className="relative px-5 py-3">
      <div className="flex w-full justify-end">
        <button type="button" aria-label="More actions" onClick={() => setMenu(menu === row.id ? null : row.id)} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-4 w-4" /></button>
      </div>
      {menu === row.id && <div className="absolute right-5 top-10 z-10 w-36 rounded-lg border border-border bg-white p-1 text-left shadow-lg">
        {canEdit && <button type="button" onClick={() => { setMenu(null); setEditing(row); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-[10px] text-body hover:bg-surface-control"><PublicIcon name="edit" className="h-3.5 w-3.5 text-primary" />Edit</button>}
        {(canEdit || view === "keys" || view === "revoked") && <button type="button" onClick={() => openDelete(row)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-[10px] text-status-danger hover:bg-status-danger-surface"><PublicIcon name="delete" className="h-3.5 w-3.5" />Delete</button>}
        {(view === "keys" || view === "revoked") && <button type="button" onClick={() => {
          setStatusAction({ row, action: String(row.status ?? "").toLowerCase() === "revoked" ? "restore" : "revoke" });
          setStatusReason("");
        }} className="block w-full rounded px-3 py-2 text-[10px] text-body hover:bg-surface-control">{String(row.status ?? "").toLowerCase() === "revoked" ? "Restore" : "Revoke"}</button>}
        {view === "orders" && <><button type="button" onClick={() => void run(() => updateStatus(row, row.status !== "Active"))} className="block w-full rounded px-3 py-2 text-[10px] text-body hover:bg-surface-control">{row.status === "Active" ? "Deactivate" : "Activate"}</button><button type="button" onClick={() => openDelete(row)} className="block w-full rounded px-3 py-2 text-left text-[10px] text-status-danger hover:bg-status-danger-surface">Delete activation</button></>}
      </div>}
    </td>
  </tr>;
}

function LicenseForm({ view, row, storefrontName, onClose, onSaved, onError }: { view: "types" | "rules"; row: LicenseRow; storefrontName: string; onClose: () => void; onSaved: () => void; onError: (message: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [licenseTypes, setLicenseTypes] = useState<LicenseRow[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typeSearch, setTypeSearch] = useState("");
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>(() => {
    return Array.isArray(row.appliesToIds) ? row.appliesToIds.map(Number) : [];
  });
  const isType = view === "types";
  const matchingTypes = licenseTypes.filter((type) => !selectedTypeIds.includes(type.id) && String(type.name || "").toLowerCase().includes(typeSearch.toLowerCase()));
  useEffect(() => {
    if (isType) {
      setLoadingTypes(false);
      return;
    }
    setLoadingTypes(true);
    void fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses/types`, { headers: { Authorization: `Bearer ${window.localStorage.getItem("marketplace-token") || ""}` } })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load license types."); setLicenseTypes(data.rows || []); })
      .catch((loadError) => onError(loadError instanceof Error ? loadError.message : "Unable to load license types."))
      .finally(() => setLoadingTypes(false));
  }, [isType, storefrontName]);
  const formBusy = saving || loadingTypes;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const description = String(form.get("description") || "").trim();
    const durationDays = String(form.get("durationDays") || "").trim();
    const maxActivations = String(form.get("maxActivations") || "").trim();
    if (name.length > 20) { setFormError("Name must be 20 characters or fewer."); return; }
    if (description.length > 50) { setFormError("Description must be 50 characters or fewer."); return; }
    if (isType && [durationDays, maxActivations].some((value) => value && (!/^\d{1,4}$/.test(value) || Number(value) < 1))) { setFormError("Duration and max devices must be whole numbers from 1 to 9999."); return; }
    setFormError(""); setSaving(true);
    const payload = isType ? { name, description, durationDays: durationDays || null, maxActivations: maxActivations || null } : { name, appliesTo: selectedTypeIds, description };
    const base = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses/${view}`;
    try { const response = await fetch(row.id ? `${base}/${row.id}` : base, { method: row.id ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${window.localStorage.getItem("marketplace-token") || ""}` }, body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to save."); onSaved(); } catch (saveError) { onError(saveError instanceof Error ? saveError.message : "Unable to save."); } finally { setSaving(false); }
  };
  return (
    <Modal
      open
      title={`${row.id ? "Edit" : "Add"} ${isType ? "License Type" : "License Rule"}`}
      onClose={() => { if (!formBusy) onClose(); }}
      size={isType ? "sm" : "md"}
      footer={<>
        <button type="button" disabled={formBusy} onClick={onClose} className="rounded-lg border border-border-control px-4 py-2.5 text-xs font-semibold text-body disabled:opacity-60">Cancel</button>
        <button disabled={formBusy} form="license-form" type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : loadingTypes ? "Loading..." : "Save"}</button>
      </>}
    >
      <form id="license-form" onSubmit={submit} className="grid gap-5">
        <fieldset disabled={formBusy} className="contents">
        <Field label={isType ? "License Name" : "Rule Name"} name="name" defaultValue={isType ? String(row.name || "") : sentenceCase(row.name || "")} required maxLength={20} />
        <label className="grid gap-1.5 text-xs font-semibold text-body">
          {isType ? "License Text" : "Description"}
          <Textarea name="description" required maxLength={50} defaultValue={isType ? String(row.description || "") : sentenceCase(row.description || "")} rows={4} placeholder={isType ? "Describe what this license allows." : "Describe when this rule applies and what it controls."} className="min-h-24 text-sm font-normal leading-5 text-body" />
          <span className="text-[10px] font-normal text-muted">Maximum 50 characters.</span>
        </label>
        {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
        {isType ? <>
            <Field label="Duration (days)" name="durationDays" type="text" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} defaultValue={String(row.durationDays || "")} />
            <Field label="Max devices" name="maxActivations" type="text" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} defaultValue={String(row.maxActivations || "")} />
          </> : <>
            <div className="grid gap-1.5 text-xs font-semibold text-body sm:col-span-2">
              <label htmlFor="license-type-search">Applies to</label>
              <div className="relative">
                <InputText id="license-type-search" value={typeSearch} onFocus={() => setShowTypeSuggestions(true)} onBlur={() => window.setTimeout(() => setShowTypeSuggestions(false), 120)} onKeyDown={(event) => { if (event.key === "Escape") setShowTypeSuggestions(false); if (event.key === "Enter" && showTypeSuggestions && matchingTypes[0]) { event.preventDefault(); setSelectedTypeIds((current) => [...current, matchingTypes[0].id]); setTypeSearch(""); } }} onChange={(event) => { setTypeSearch(event.target.value); setShowTypeSuggestions(true); }} placeholder="Search and select license types..." autoComplete="off" aria-expanded={showTypeSuggestions} aria-controls="license-type-suggestions" role="combobox" aria-autocomplete="list" className="h-11" />
                {selectedTypeIds.length > 0 && <button type="button" onClick={() => setSelectedTypeIds([])} className="mt-1 text-[11px] font-medium text-muted hover:text-primary">Clear selected</button>}
                {showTypeSuggestions && <div id="license-type-suggestions" role="listbox" aria-label="License type suggestions" className="absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-border-control bg-white p-1 shadow-lg">
                  {matchingTypes.map((type) => <button key={type.id} type="button" role="option" aria-selected="false" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSelectedTypeIds((current) => [...current, type.id]); setTypeSearch(""); }} className="block w-full rounded-md px-3 py-2 text-left text-sm font-normal text-body hover:bg-surface-muted">{sentenceCase(type.name)}</button>)}
                  {matchingTypes.length === 0 && <p className="px-3 py-2 text-xs font-normal text-muted">No matching license types.</p>}
                </div>}
              </div>
              <div className="flex flex-wrap gap-2">{selectedTypeIds.map((id) => { const type = licenseTypes.find((item) => item.id === id); return type ? <span key={id} className="inline-flex items-center gap-1 rounded-full border border-border-control bg-surface-muted px-2.5 py-1 text-xs font-normal text-body">{String(type.name)}<button type="button" aria-label={`Remove ${String(type.name)}`} onClick={() => setSelectedTypeIds((current) => current.filter((selectedId) => selectedId !== id))} className="ml-1 text-muted hover:text-status-danger">×</button></span> : null; })}</div>
            </div>
          </>}
        </div>
        </fieldset>
      </form>
    </Modal>
  );
}

type LicenseOrderOption = { orderItemId: number; productId: number; productName: string; remaining: number; orderNumber: string; buyerEmail: string };
type LicenseTypeOption = { id: number; name: string };
type LicenseProductOption = { id: number; name: string };
type BarcodeResult = { rawValue: string };
type BarcodeDetectorLike = { detect: (source: HTMLVideoElement | ImageBitmap) => Promise<BarcodeResult[]> };
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorLike;

function LicenseKeyForm({ row, storefrontName, onClose, onSaved, onError }: { row: LicenseRow | null; storefrontName: string; onClose: () => void; onSaved: () => void; onError: (message: string) => void }) {
  const [keyValue, setKeyValue] = useState("");
  const [orderItemId, setOrderItemId] = useState("");
  const [productId, setProductId] = useState(String(row?.productId || ""));
  const [productSearch, setProductSearch] = useState(String(row?.product || ""));
  const [debouncedProductSearch, setDebouncedProductSearch] = useState(String(row?.product || ""));
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [keyInputMode, setKeyInputMode] = useState<"manual" | "upload" | "scan">("manual");
  const [licenseTypeId, setLicenseTypeId] = useState(String(row?.licenseTypeId || ""));
  const [orderItems, setOrderItems] = useState<LicenseOrderOption[]>([]);
  const [products, setProducts] = useState<LicenseProductOption[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<LicenseTypeOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingInput, setProcessingInput] = useState(false);
  const [formError, setFormError] = useState("");
  const [scannerError, setScannerError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const base = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses`;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedProductSearch(productSearch), 300);
    return () => window.clearTimeout(timeoutId);
  }, [productSearch]);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${window.localStorage.getItem("marketplace-token") || ""}` };
    void fetch(`${base}/options`, { headers })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load license options.");
        setOrderItems(data.orderItems || []);
        setProducts(data.products || []);
        setLicenseTypes(data.licenseTypes || []);
      })
      .catch((optionError) => {
        const message = optionError instanceof Error ? optionError.message : "Unable to load license options.";
        setFormError(message);
        onError(message);
      })
      .finally(() => setLoadingOptions(false));
  }, [base, onError]);

  useEffect(() => {
    if (!row && !licenseTypeId && licenseTypes[0]) setLicenseTypeId(String(licenseTypes[0].id));
  }, [row, licenseTypeId, licenseTypes]);

  useEffect(() => {
    if (keyInputMode !== "scan") return;
    let scanTimer = 0;
    let scanning = false;
    let cancelled = false;
    const startScanner = async () => {
      const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStreamRef.current = stream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const detector = Detector ? new Detector({ formats: ["qr_code"] }) : null;
        scanTimer = window.setInterval(async () => {
          if (scanning || !videoRef.current) return;
          scanning = true;
          try {
            const codes = detector ? await detector.detect(videoRef.current) : [];
            const scannedKey = codes[0]?.rawValue?.trim() || (await decodeQrFromImageSource(videoRef.current))?.trim();
            if (scannedKey) {
              setKeyValue(scannedKey);
              setScannerError("");
              setKeyInputMode("manual");
            }
          } catch {
            setScannerError("Unable to read this QR code. Try another angle or use manual entry.");
          } finally {
            scanning = false;
          }
        }, 300);
      } catch {
        setScannerError("Camera access is unavailable. Allow camera access or use file upload/manual entry.");
      }
    };
    setScannerError("");
    void startScanner();
    return () => {
      cancelled = true;
      window.clearInterval(scanTimer);
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [keyInputMode]);

  const updateProductSearch = (value: string) => {
    setProductSearch(value);
    setProductId("");
    setShowProductSuggestions(true);
  };

  const chooseProduct = (product: LicenseProductOption) => {
    setProductSearch(product.name);
    setDebouncedProductSearch(product.name);
    setProductId(String(product.id));
    setShowProductSuggestions(false);
  };

  const importKeyFile = async (file: File | undefined) => {
    if (!file) return;
    setProcessingInput(true);
    setFormError("");
    setScannerError("");
    try {
      let parsedKey: string | null = null;

      if (file.type.startsWith("image/")) {
        const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
        if (Detector) {
          const image = await createImageBitmap(file);
          const codes = await new Detector({ formats: ["qr_code"] }).detect(image);
          image.close();
          parsedKey = codes[0]?.rawValue?.trim() || null;
        }

        if (!parsedKey) {
          parsedKey = await decodeQrFromImageSource(file);
        }

        if (!parsedKey) throw new Error("No QR code was found in this image.");
        setKeyValue(parsedKey);
      } else {
        const text = await file.text();
        const entries = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        const firstEntry = entries[0]?.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "");
        if (!firstEntry || entries.length > 1) throw new Error("Upload a file containing a single license key.");
        setKeyValue(firstEntry);
      }
      setKeyInputMode("manual");
    } catch (uploadError) {
      setFormError(uploadError instanceof Error ? uploadError.message : "Unable to read the license key file.");
    } finally {
      setProcessingInput(false);
    }
  };

  const matchingProducts = debouncedProductSearch.trim()
    ? products.filter((product) => product.name.toLowerCase().includes(debouncedProductSearch.trim().toLowerCase()))
    : [];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!productId) {
      setFormError("Search for and select a product.");
      return;
    }
    if (!licenseTypeId) {
      setFormError("Select a license type.");
      return;
    }
    if (!row && !keyValue.trim()) {
      setFormError("Enter or import a license key, or scan its QR code.");
      return;
    }
    if (keyValue.length > 255) {
      setFormError("License keys must be 255 characters or fewer.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(row ? `${base}/keys/${row.id}` : `${base}/keys`, {
        method: row ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${window.localStorage.getItem("marketplace-token") || ""}` },
        body: JSON.stringify({ key: keyValue.trim() || undefined, productId: Number(productId), orderItemId: orderItemId ? Number(orderItemId) : undefined, licenseTypeId: licenseTypeId ? Number(licenseTypeId) : null }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save license key.");
      onSaved();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Unable to save license key.");
    } finally {
      setSaving(false);
    }
  };

  return <Modal
    open
    title={row ? "Edit License Key" : "Add License Key"}
    onClose={() => { if (!saving && !loadingOptions && !processingInput) onClose(); }}
    size="md"
    footer={<>
      <button type="button" disabled={saving || loadingOptions || processingInput} onClick={onClose} className="rounded-lg border border-border-control px-4 py-2.5 text-xs font-semibold text-body disabled:opacity-60">Cancel</button>
      <button disabled={saving || loadingOptions || processingInput} form="license-key-form" type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : processingInput ? "Processing..." : row ? "Save Changes" : "Issue License Key"}</button>
    </>}
  >
    <form id="license-key-form" onSubmit={submit} className="grid gap-4">
      <fieldset disabled={saving || loadingOptions || processingInput} className="contents">
      <div className="grid gap-1.5 text-xs font-semibold text-body">
        <label htmlFor="license-product-search">Product</label>
        {row ? <input value={productSearch} readOnly className="h-11 w-full rounded-lg border border-border-control bg-surface-muted px-3 text-sm font-normal text-body" /> : <div className="relative">
          <input id="license-product-search" type="search" role="combobox" aria-expanded={showProductSuggestions} aria-controls="license-product-suggestions" aria-autocomplete="list" aria-required="true" value={productSearch} onFocus={() => setShowProductSuggestions(true)} onBlur={() => window.setTimeout(() => setShowProductSuggestions(false), 120)} onChange={(event) => updateProductSearch(event.target.value)} disabled={loadingOptions} placeholder="Search products..." className="h-11 w-full rounded-lg border border-border-control px-3 text-sm font-normal text-body outline-none focus:border-primary" />
          {showProductSuggestions && <div id="license-product-suggestions" role="listbox" aria-label="Product suggestions" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border-control bg-white p-1 shadow-lg">
            {productSearch.trim() !== debouncedProductSearch.trim() ? <p className="px-3 py-2 text-xs font-normal text-muted">Searching products...</p> : matchingProducts.map((product) => <button key={product.id} type="button" role="option" aria-selected={String(product.id) === productId} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseProduct(product)} className="block w-full rounded-md px-3 py-2 text-left text-xs font-normal text-body hover:bg-surface-muted">{product.name}</button>)}
            {productSearch.trim() === debouncedProductSearch.trim() && matchingProducts.length === 0 && <p className="px-3 py-2 text-xs font-normal text-muted">{productSearch.trim() ? "No matching products." : "Type to search products."}</p>}
          </div>}
        </div>}
      </div>
      {!row && <label className="grid gap-1.5 text-xs font-semibold text-body">Paid order (optional)
        <select value={orderItemId} onChange={(event) => setOrderItemId(event.target.value)} disabled={loadingOptions} className="h-11 w-full rounded-lg border border-border-control bg-white px-3 text-sm font-normal text-body outline-none focus:border-primary">
          <option value="">Standalone key</option>
          {orderItems.filter((item) => String(item.productId) === productId).map((item) => <option key={item.orderItemId} value={item.orderItemId}>#{item.orderNumber} · {item.buyerEmail} · {item.remaining} key(s) available</option>)}
        </select>
      </label>}
      <label className="grid gap-1.5 text-xs font-semibold text-body">License type
        <select value={licenseTypeId} onChange={(event) => setLicenseTypeId(event.target.value)} required disabled={loadingOptions} className="h-11 w-full rounded-lg border border-border-control bg-white px-3 text-sm font-normal text-body outline-none focus:border-primary">
          <option value="">Select a license type</option>
          {licenseTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select>
      </label>
      <div className="grid gap-2 text-xs font-semibold text-body">
        <span>License key</span>
        <div role="tablist" aria-label="License key input method" className="flex w-fit overflow-hidden rounded-lg border border-border-control">
          {(["manual", "upload", "scan"] as const).map((mode) => <button key={mode} type="button" role="tab" aria-selected={keyInputMode === mode} onClick={() => setKeyInputMode(mode)} className={`border-r border-border-control px-3 py-2 text-[11px] last:border-r-0 ${keyInputMode === mode ? "bg-accent-light font-semibold text-primary" : "bg-white font-medium text-muted hover:text-heading"}`}>{mode === "manual" ? "Manual" : mode === "upload" ? "Upload" : "Scan QR"}</button>)}
        </div>
        {keyInputMode === "manual" && <input value={keyValue} onChange={(event) => setKeyValue(event.target.value)} type="password" maxLength={255} autoComplete="new-password" placeholder={row ? "Leave blank to keep the current key" : "Enter a license key"} className="h-11 min-w-0 w-full rounded-lg border border-border-control px-3 text-sm font-normal text-body outline-none focus:border-primary" />}
        {keyInputMode === "upload" && <input type="file" accept=".txt,.key,.lic,.csv,image/*" onChange={(event) => void importKeyFile(event.target.files?.[0])} className="block w-full rounded-lg border border-border-control bg-white p-2 text-xs font-normal text-body file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-xs file:font-semibold file:text-body" />}
        {keyInputMode === "scan" && <div className="overflow-hidden rounded-lg border border-border-control bg-black"><video ref={videoRef} muted playsInline className="max-h-52 w-full object-cover" /><p className="bg-white px-3 py-2 text-[10px] font-normal text-muted">Point the camera at a license key QR code.</p></div>}
        <span className="text-[10px] font-normal text-muted">{row ? "Enter a replacement key to change it; keys are encrypted before storage." : "A license key is required and encrypted before storage. Upload a single text/license file or QR image, or scan with your camera."}</span>
        {scannerError && <p role="status" className="text-[10px] font-normal text-status-danger">{scannerError}</p>}
      </div>
      {formError && <p role="alert" className="rounded-lg border border-status-danger/20 bg-status-danger-surface px-3 py-2 text-xs text-status-danger">{formError}</p>}
      </fieldset>
    </form>
  </Modal>;
}

function Field({ label, name, defaultValue, type = "text", required = false, placeholder, maxLength, inputMode, pattern }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean; placeholder?: string; maxLength?: number; inputMode?: "numeric" | "text"; pattern?: string }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-body">{label}<InputText required={required} name={name} type={type} inputMode={inputMode} pattern={pattern} maxLength={maxLength} defaultValue={defaultValue} placeholder={placeholder} className="h-11 text-sm font-normal text-body" />{maxLength === 20 ? <span className="text-[10px] font-normal text-muted">Maximum 20 characters.</span> : maxLength === 4 ? <span className="text-[10px] font-normal text-muted">Enter a whole number from 1 to 9999.</span> : null}</label>;
}
