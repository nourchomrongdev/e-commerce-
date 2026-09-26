"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PublicIcon from "@/components/icons/PublicIcon";
import { Badge, InputText, Modal, Textarea, Toast } from "@/components/ui";

type LicenseView = "types" | "rules" | "keys" | "orders" | "revoked";
type LicenseRow = Record<string, string | number | null> & { id: number; appliesToIds?: number[]; licenseRuleCount?: number; licenseRules?: string };
type Props = { view: LicenseView; storefrontName: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const config = {
  types: ["License Types", "Create and manage different types of licenses for your digital products.", "Add License Type"],
  rules: ["License Rules", "Define rules and restrictions for how licenses can be used.", "Add Rule"],
  keys: ["License Keys", "Generate, view and manage license keys for your products.", ""],
  orders: ["License Orders", "Track license orders and their activations.", ""],
  revoked: ["Revoked Licenses", "View and manage revoked or deactivated licenses.", ""],
} as const;
const fields: Record<LicenseView, Array<[string, string]>> = {
  types: [["License Name", "name"], ["License Text", "description"], ["License Rules", "licenseRuleCount"], ["Duration", "duration"], ["Max Devices", "maxDevices"], ["Status", "status"]],
  rules: [["Rule Name", "name"], ["Applies To", "appliesTo"], ["Description", "description"], ["Status", "status"]],
  keys: [["License Key", "key"], ["Product", "product"], ["License Type", "licenseType"], ["Status", "status"], ["Activated By", "activatedBy"], ["Activated On", "activatedOn"]],
  orders: [["License Key", "key"], ["Product", "product"], ["Activated By", "activatedBy"], ["Device / Browser", "device"], ["Location (IP)", "location"], ["Activated On", "activatedOn"]],
  revoked: [["License Key", "key"], ["Product", "product"], ["License Type", "licenseType"], ["Revoked By", "activatedBy"], ["Reason", "reason"], ["Revoked On", "revokedOn"], ["Status", "status"]],
};
const formatLicenseTypeName = (value: string | number | null) => {
  const name = String(value ?? "-").trim();
  return /(?:^|\s)license$/i.test(name) ? name : `${name} License`;
};
const sentenceCase = (value: string | number | null) => {
  const text = String(value ?? "-").trim().toLowerCase();
  return text ? text[0].toUpperCase() + text.slice(1) : "-";
};

export default function LicenseManager({ view, storefrontName }: Props) {
  const router = useRouter();
  const [licenseSection, setLicenseSection] = useState<"types" | "rules">(view === "rules" ? "rules" : "types");
  const currentView = view === "types" ? licenseSection : view;
  const [rows, setRows] = useState<LicenseRow[]>([]);
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState<number | null>(null);
  const [editing, setEditing] = useState<LicenseRow | null>(null);
  const [details, setDetails] = useState<LicenseRow | null>(null);
  const [deleting, setDeleting] = useState<LicenseRow | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const endpoint = `${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses/${currentView}`;
  const token = () => window.localStorage.getItem("marketplace-token") || "";

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}?search=${encodeURIComponent(search)}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load licenses.");
      setRows(data.rows || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load licenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRows(); }, [currentView, storefrontName, search]);
  const visibleRows = useMemo(() => rows.filter((row) => `${Object.values(row).join(" ")} ${currentView === "types" ? formatLicenseTypeName(row.name) : ""}`.toLowerCase().includes(search.toLowerCase())), [rows, search, currentView]);
  const recordName = (row: LicenseRow | null) => row?.name && currentView === "types" ? formatLicenseTypeName(row.name) : String(row?.name || row?.key || "this license");
  const actionRow = rows.find((row) => row.id === menu) || null;

  const openDelete = (row: LicenseRow) => {
    setMenu(null);
    setConfirmation("");
    setDeleteError(null);
    setError(null);
    setDeleting(row);
  };
  const closeDelete = () => {
    setDeleting(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleting || confirmation.trim() !== recordName(deleting).trim()) return;
    try {
      const response = await fetch(`${endpoint}/${deleting.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to delete item.");
      closeDelete();
      setNotice("License deleted successfully.");
      await loadRows();
    } catch (deleteError) {
      setDeleteError(deleteError instanceof Error ? deleteError.message : "Unable to delete item.");
    }
  };

  const updateStatus = async (row: LicenseRow, active: boolean) => {
    const path = currentView === "keys" || currentView === "revoked" ? "keys" : "orders";
    const body = currentView === "keys" || currentView === "revoked" ? { status: active ? "active" : "revoked" } : { isActive: active };
    const response = await fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses/${path}/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Unable to update status.");
    setMenu(null);
    setNotice("License status updated.");
    await loadRows();
  };

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try { await action(); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Action failed."); }
  };

  const [title, description, action] = config[currentView];
  return <div className="mx-auto w-full max-w-[1400px]">
    {notice && <Toast variant="success" message={notice} onClose={() => setNotice(null)} />}
    {error && <Toast variant="error" message={error} onClose={() => setError(null)} />}
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{view === "types" ? "License Types" : title}</h1><p className="mt-1 text-sm text-muted">{view === "types" ? "Manage license types and rules for your digital products." : description}</p></div>{action && <button type="button" onClick={() => setEditing({ id: 0 })} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"><PublicIcon name="add" className="h-3.5 w-3.5" /> {action}</button>}</header>
    {view === "types" && <div role="tablist" aria-label="License management sections" className="mt-5 flex w-fit gap-1 border-b border-divider">
      {(["types", "rules"] as const).map((section) => <button key={section} type="button" role="tab" aria-selected={licenseSection === section} onClick={() => { setLicenseSection(section); setSearch(""); setRows([]); setLoading(true); setError(null); setMenu(null); setDetails(null); setEditing(null); setDeleting(null); }} className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${licenseSection === section ? "border-primary text-primary" : "border-transparent text-muted hover:text-heading"}`}>{section === "types" ? "License Types" : "License Rules"}</button>)}
    </div>}
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-divider px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-heading">{title}</h2>
          <label className="relative sm:w-64">
            <span className="sr-only">Search {title}</span>
            <PublicIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-muted-faint" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="h-9 w-full rounded-lg border border-border-control pl-9 pr-3 text-xs text-body outline-none placeholder:text-muted-faint focus:border-primary" />
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
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
        <button type="button" onClick={() => { setMenu(null); if (currentView === "types") router.push(`/creator/storefront/${encodeURIComponent(storefrontName)}/licenses/types/${actionRow.id}`); else setDetails(actionRow); }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="view" className="h-4 w-4 text-primary" />View details</button>
        {(currentView === "rules" || (currentView === "types" && Boolean(actionRow.storefrontId))) ? <>
          <button type="button" onClick={() => { setMenu(null); setEditing(actionRow); }} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="edit" className="h-4 w-4 text-primary" />Edit license</button>
          <button type="button" onClick={() => openDelete(actionRow)} className="flex items-center gap-3 rounded-lg border border-status-danger/20 px-4 py-3 text-left text-xs font-medium text-status-danger hover:bg-status-danger-surface"><PublicIcon name="delete" className="h-4 w-4" />Delete license</button>
        </> : <p className="rounded-lg bg-surface-muted p-3 text-xs leading-5 text-muted">This is a shared default license and cannot be edited from one storefront.</p>}
        {(currentView === "keys" || currentView === "revoked") && <button type="button" onClick={() => void run(() => updateStatus(actionRow, currentView === "revoked"))} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name={currentView === "revoked" ? "check" : "shield-minus"} className="h-4 w-4 text-primary" />{currentView === "revoked" ? "Restore license" : "Revoke license"}</button>}
        {currentView === "orders" && <button type="button" onClick={() => void run(() => updateStatus(actionRow, actionRow.status !== "Active"))} className="flex items-center gap-3 rounded-lg border border-border-control px-4 py-3 text-left text-xs font-medium text-body hover:border-primary hover:bg-accent-light"><PublicIcon name="shield-check" className="h-4 w-4 text-primary" />{actionRow.status === "Active" ? "Deactivate order" : "Activate order"}</button>}
      </div>}
    </Modal>
    <Modal open={Boolean(details)} title={`License details: ${recordName(details)}`} onClose={() => setDetails(null)}>
      {details && <div className="grid gap-3 text-xs">{fields[currentView].map(([label, key]) => <div key={key} className="flex items-start justify-between gap-6 border-b border-divider pb-3 last:border-0"><span className="text-muted">{label}</span><span className="max-w-[280px] text-right font-semibold text-heading">{key === "licenseRules" ? details.licenseRules || "No rules linked" : currentView === "types" && key === "name" ? formatLicenseTypeName(details[key] as string | number | null) : currentView === "rules" && (key === "name" || key === "description" || key === "appliesTo") ? sentenceCase(details[key] as string | number | null) : String(details[key] ?? "-")}</span></div>)}</div>}
    </Modal>
    {editing && <LicenseForm view={currentView as "types" | "rules"} row={editing} storefrontName={storefrontName} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice("Saved successfully."); void loadRows(); }} onError={setError} />}
    <Modal open={Boolean(deleting)} title="Confirm license deletion" onClose={closeDelete} footer={<><button type="button" onClick={closeDelete} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body">Cancel</button><button type="button" onClick={() => void confirmDelete()} disabled={confirmation.trim() !== recordName(deleting).trim()} className="rounded-lg bg-status-danger px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">Delete license</button></>}><p className="text-sm leading-6 text-muted">This permanently deletes <span className="font-semibold text-ink">{recordName(deleting)}</span>. Type the license name to continue.</p><label className="mt-4 block text-xs font-semibold text-ink">License Name<input autoFocus aria-invalid={Boolean(deleteError)} aria-describedby={deleteError ? "license-delete-error" : undefined} value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setDeleteError(null); }} placeholder={recordName(deleting)} className={`mt-2 h-10 w-full rounded-lg border px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-orange-100 ${deleteError ? "border-status-danger focus:border-status-danger" : "border-border-control focus:border-primary"}`} /></label>{deleteError && <p id="license-delete-error" role="alert" className="mt-2 text-xs text-status-danger">{deleteError}</p>}</Modal>
  </div>;
}

function LicenseRowView({ row, view, menu, setMenu, setEditing, openDelete, updateStatus, run }: { row: LicenseRow; view: LicenseView; menu: number | null; setMenu: (id: number | null) => void; setEditing: (row: LicenseRow) => void; openDelete: (row: LicenseRow) => void; updateStatus: (row: LicenseRow, active: boolean) => Promise<void>; run: (action: () => Promise<void>) => Promise<void> }) {
  const canEdit = view === "rules" || (view === "types" && Boolean(row.storefrontId));
  return <tr className="border-t border-divider text-body transition hover:bg-surface-hover">{fields[view].map(([, key]) => <td key={key} className="max-w-[240px] px-5 py-3 text-[10px] text-body">{key === "status" && row[key] ? <Badge tone={row[key] === "Active" ? "success" : row[key] === "Revoked" ? "danger" : "warning"}>{String(row[key])}</Badge> : view === "types" && key === "name" ? formatLicenseTypeName(row[key]) : view === "rules" && (key === "name" || key === "description" || key === "appliesTo") ? sentenceCase(row[key]) : String(row[key] ?? "-")}</td>)}<td className="relative px-5 py-3 text-right"><button type="button" aria-label="More actions" onClick={() => setMenu(menu === row.id ? null : row.id)} className="grid h-7 w-7 place-items-center rounded-md border border-border-action text-muted hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-4 w-4" /></button>{menu === row.id && <div className="absolute right-5 top-10 z-10 w-36 rounded-lg border border-border bg-white p-1 text-left shadow-lg">{canEdit && <><button type="button" onClick={() => { setMenu(null); setEditing(row); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-[10px] text-body hover:bg-surface-control"><PublicIcon name="edit" className="h-3.5 w-3.5 text-primary" />Edit</button><button type="button" onClick={() => openDelete(row)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-[10px] text-status-danger hover:bg-status-danger-surface"><PublicIcon name="delete" className="h-3.5 w-3.5" />Delete</button></>}{(view === "keys" || view === "revoked") && <button type="button" onClick={() => void run(() => updateStatus(row, view === "revoked"))} className="block w-full rounded px-3 py-2 text-[10px] text-body hover:bg-surface-control">{view === "revoked" ? "Restore" : "Revoke"}</button>}{view === "orders" && <button type="button" onClick={() => void run(() => updateStatus(row, row.status !== "Active"))} className="block w-full rounded px-3 py-2 text-[10px] text-body hover:bg-surface-control">{row.status === "Active" ? "Deactivate" : "Activate"}</button>}</div>}</td></tr>;
}

function LicenseForm({ view, row, storefrontName, onClose, onSaved, onError }: { view: "types" | "rules"; row: LicenseRow; storefrontName: string; onClose: () => void; onSaved: () => void; onError: (message: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [licenseTypes, setLicenseTypes] = useState<LicenseRow[]>([]);
  const [typeSearch, setTypeSearch] = useState("");
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>(() => {
    return Array.isArray(row.appliesToIds) ? row.appliesToIds.map(Number) : [];
  });
  const isType = view === "types";
  const matchingTypes = licenseTypes.filter((type) => !selectedTypeIds.includes(type.id) && String(type.name || "").toLowerCase().includes(typeSearch.toLowerCase()));
  useEffect(() => {
    if (isType) return;
    void fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(storefrontName)}/licenses/types`, { headers: { Authorization: `Bearer ${window.localStorage.getItem("marketplace-token") || ""}` } })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load license types."); setLicenseTypes(data.rows || []); })
      .catch((loadError) => onError(loadError instanceof Error ? loadError.message : "Unable to load license types."));
  }, [isType, storefrontName]);
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
      onClose={onClose}
      size={isType ? "sm" : "md"}
      footer={<>
        <button type="button" onClick={onClose} className="rounded-lg border border-border-control px-4 py-2.5 text-xs font-semibold text-body">Cancel</button>
        <button disabled={saving} form="license-form" type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
      </>}
    >
      <form id="license-form" onSubmit={submit} className="grid gap-5">
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
      </form>
    </Modal>
  );
}

function Field({ label, name, defaultValue, type = "text", required = false, placeholder, maxLength, inputMode, pattern }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean; placeholder?: string; maxLength?: number; inputMode?: "numeric" | "text"; pattern?: string }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-body">{label}<InputText required={required} name={name} type={type} inputMode={inputMode} pattern={pattern} maxLength={maxLength} defaultValue={defaultValue} placeholder={placeholder} className="h-11 text-sm font-normal text-body" />{maxLength === 20 ? <span className="text-[10px] font-normal text-muted">Maximum 20 characters.</span> : maxLength === 4 ? <span className="text-[10px] font-normal text-muted">Enter a whole number from 1 to 9999.</span> : null}</label>;
}
