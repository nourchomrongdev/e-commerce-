"use client";

import Link from "next/link";
import { useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";

export type AdminPolicyKey = "privacy" | "terms" | "refunds" | "cookies" | "acceptable-use";

type Policy = {
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  updated: string;
  sections: Array<{ title: string; body: string }>;
};

const policies: Record<AdminPolicyKey, Policy> = {
  privacy: {
    label: "Privacy Policy",
    title: "Privacy Policy",
    eyebrow: "Legal & Policies",
    description: "Control the privacy rules shown to marketplace users.",
    updated: "September 8, 2026",
    sections: [
      ["What we collect", "We collect information needed to create and operate accounts, process purchases, deliver files, provide support, and manage creator applications. This may include names, email addresses, account credentials, order details, and information submitted through forms."],
      ["How we use information", "We use account and order information to authenticate users, deliver purchased products, prevent abuse, respond to support requests, and meet legal obligations. Personal information is not sold."],
      ["Payments and service providers", "Payment details are handled by the payment provider used at checkout. The marketplace does not intentionally store complete payment card numbers."],
      ["Retention and user rights", "Information is retained only as long as needed for legal, accounting, security, and dispute-resolution requirements. Users may contact support to request access, correction, or deletion where applicable."],
    ].map(([title, body]) => ({ title, body })),
  },
  terms: {
    label: "Terms & Conditions",
    title: "Terms and Conditions",
    eyebrow: "Legal & Policies",
    description: "Manage the agreement that governs marketplace use.",
    updated: "September 8, 2026",
    sections: [
      ["Using the marketplace", "Users must use the marketplace lawfully, provide accurate account information, keep credentials secure, and avoid bypassing technical controls."],
      ["Products and creators", "Creators are responsible for the accuracy, legality, ownership, licensing, and support of their products."],
      ["Orders and access", "A purchase grants the access or licence described on the product page. It does not transfer intellectual-property ownership unless the applicable licence says so."],
      ["Prohibited activity", "Malware, infringing material, unlawful content, deceptive claims, and content without distribution permission are prohibited."],
    ].map(([title, body]) => ({ title, body })),
  },
  refunds: {
    label: "Refund Policy",
    title: "Refund Policy",
    eyebrow: "Legal & Policies",
    description: "Define how customer refund requests are reviewed and resolved.",
    updated: "September 8, 2026",
    sections: [
      ["Digital products", "Refund eligibility depends on the product licence, reason for the request, applicable consumer law, and whether the file has been accessed or downloaded."],
      ["When customers should contact support", "Customers should contact support as soon as possible if a file is corrupted, materially different from its description, duplicated, or unavailable after payment."],
      ["Review process", "The team may verify the order and investigate the issue. Approved refunds are returned through the original payment method where possible."],
      ["Creator responsibility", "Creators must provide accurate product information and respond to legitimate product-access or quality issues."],
    ].map(([title, body]) => ({ title, body })),
  },
  cookies: {
    label: "Cookies Policy",
    title: "Cookies Policy",
    eyebrow: "Legal & Policies",
    description: "Document browser storage, consent, and optional tracking rules.",
    updated: "September 8, 2026",
    sections: [
      ["Necessary storage", "Necessary browser storage may support sign-in state, security, preferences, and shopping features. These technologies are required for core functionality."],
      ["Optional cookies", "Advertising and third-party analytics scripts should remain disabled until consent is provided and this policy is updated."],
      ["Managing consent", "Users can accept or decline optional cookies through the cookie banner or clear stored consent in browser settings."],
      ["Operational impact", "Blocking necessary storage may prevent sign-in, checkout, or file delivery from working correctly."],
    ].map(([title, body]) => ({ title, body })),
  },
  "acceptable-use": {
    label: "Acceptable Use",
    title: "Acceptable Use Policy",
    eyebrow: "Legal & Policies",
    description: "Set the safety and content standards for users and creators.",
    updated: "September 8, 2026",
    sections: [
      ["Allowed use", "Use the marketplace to discover, sell, purchase, and manage lawful digital products and related services."],
      ["Restricted content", "Do not upload malware, stolen or infringing work, deceptive products, illegal content, or material that violates another person's rights."],
      ["Account responsibility", "Keep account credentials secure and report suspicious activity, unauthorized access, or policy violations to the marketplace team."],
      ["Enforcement", "The marketplace may remove content, limit access, suspend accounts, or refer matters to appropriate authorities when necessary."],
    ].map(([title, body]) => ({ title, body })),
  },
};

const policyLinks = Object.entries(policies) as Array<[AdminPolicyKey, Policy]>;
const blankPolicy: Policy = {
  label: "New Policy",
  title: "New Policy",
  eyebrow: "Legal & Policies",
  description: "Add a description for this policy.",
  updated: "Not published",
  sections: [{ title: "New section", body: "Add policy content here." }],
};

export default function AdminPolicyPage({ policyKey, create = false, editorPage = false }: { policyKey?: AdminPolicyKey; create?: boolean; editorPage?: boolean }) {
  const currentKey = policyKey ?? "privacy";
  const initialPolicy = create ? blankPolicy : policies[currentKey];
  const [policy, setPolicy] = useState(initialPolicy);
  const [editing, setEditing] = useState(create || editorPage);
  const [deleted, setDeleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateSection = (index: number, field: "title" | "body", value: string) => {
    setPolicy((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, [field]: value } : section),
    }));
  };

  const addSection = () => {
    setPolicy((current) => ({ ...current, sections: [...current.sections, { title: `Section ${current.sections.length + 1}`, body: "Write policy content here." }] }));
  };

  const removeSection = (index: number) => {
    setPolicy((current) => ({ ...current, sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index) }));
  };

  if (deleted) {
    return <div className="mx-auto max-w-[780px] py-12 text-center"><PublicIcon name="delete" className="mx-auto h-8 w-8 text-status-danger" /><h1 className="mt-4 text-xl font-bold text-heading">Policy deleted</h1><p className="mt-2 text-sm text-muted">This policy has been removed from the current admin view.</p><button type="button" onClick={() => { setPolicy(initialPolicy); setDeleted(false); }} className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">Restore policy</button></div>;
  }

  return (
    <div data-policy-editor-page={editorPage ? "true" : undefined} className="mx-auto max-w-[1180px]">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{policy.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">{policy.title}</h1>
          <p className="mt-1 text-sm text-muted">{policy.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] text-muted"><PublicIcon name="clock-9" className="h-3.5 w-3.5" /> Updated {policy.updated}</div>
          <div className="relative"><button type="button" onClick={() => setActionsOpen((open) => !open)} aria-label="Open policy actions" aria-expanded={actionsOpen} className="grid h-9 w-9 place-items-center rounded-lg border border-border-control bg-white text-body hover:border-primary hover:text-primary"><PublicIcon name="ellipsis-vertical" className="h-4 w-4" /></button>{actionsOpen && <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-xl"><Link href="/admin/policies/new" onClick={() => setActionsOpen(false)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-body no-underline hover:bg-accent-light"><PublicIcon name="add" className="h-3.5 w-3.5 text-primary" />Add policy</Link><Link href={`/admin/policies/${currentKey}/edit`} onClick={() => setActionsOpen(false)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-body no-underline hover:bg-accent-light"><PublicIcon name="edit" className="h-3.5 w-3.5 text-primary" />Edit policy</Link></div>}</div>
        </div>
      </header>

      <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_250px]">
        <article className="min-w-0">
          <div className="border-b border-border pb-5">
            <p className="text-xs leading-5 text-muted">This policy is displayed publicly and maintained by the marketplace administration team.</p>
          </div>
          <div className="divide-y divide-border">
            {policy.sections.map((section, index) => (
              <section key={section.title} className="py-6 first:pt-5">
                <div className="flex gap-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-light text-xs font-bold text-primary">{index + 1}</span>
                  <div>
                    <h2 className="text-base font-bold text-heading">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-body">{section.body}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </article>

        <aside className="h-fit border-l border-border pl-5">
          <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-heading">Legal pages</h2></div>
          <nav className="mt-3 divide-y divide-border">
            {policyLinks.map(([key, item]) => (
              <Link key={key} href={`/admin/policies/${key}`} className={`flex items-center gap-2 py-3 text-xs font-semibold no-underline ${key === policyKey ? "text-primary" : "text-body hover:text-primary"}`}>
                <PublicIcon name={key === currentKey && !create ? "check" : "right"} className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Publishing status</p>
            <p className="mt-2 text-xs font-semibold text-status-success">Published</p>
            <p className="mt-1 text-[10px] leading-4 text-muted">Visible on the public marketplace legal pages.</p>
          </div>
          {!create && <div className="mt-6 border-t border-status-danger/30 pt-5"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-status-danger">Danger zone</p><p className="mt-2 text-[10px] leading-4 text-muted">Deleting this policy removes it from the current admin view.</p><button type="button" onClick={() => setDeleteOpen(true)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-status-danger/40 px-3 py-2 text-xs font-semibold text-status-danger hover:bg-status-danger-surface"><PublicIcon name="delete" className="h-3.5 w-3.5" />Delete policy</button></div>}
        </aside>
      </div>
      {deleteOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-2xl"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-danger-surface text-status-danger"><PublicIcon name="delete" className="h-5 w-5" /></div><h2 className="mt-4 text-lg font-bold text-heading">Delete policy?</h2><p className="mt-2 text-sm leading-5 text-muted">This will remove “{policy.title}” from the current admin view.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDeleteOpen(false)} className="rounded-lg border border-border-control px-4 py-2 text-xs font-semibold text-body">Cancel</button><button type="button" onClick={() => { setDeleteOpen(false); setDeleted(true); }} className="rounded-lg bg-status-danger px-4 py-2 text-xs font-semibold text-white">Delete</button></div></div></div>}
      {editing && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4"><div role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-white shadow-2xl"><div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Legal document editor</p><h2 className="mt-1 text-xl font-bold text-heading">Edit policy</h2><p className="mt-1 text-xs text-muted">Write and organize the policy shown to marketplace users.</p></div><button type="button" onClick={() => setEditing(false)} aria-label="Close editor" className="grid h-8 w-8 place-items-center rounded-md text-xl text-muted hover:bg-accent-light">×</button></div><div className="flex max-h-[calc(92vh-150px)] min-h-0 flex-col overflow-y-auto lg:flex-row"><aside className="border-b border-border bg-surface-muted p-4 lg:w-56 lg:border-b-0 lg:border-r"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Document outline</p><div className="mt-3 space-y-1">{policy.sections.map((section, index) => <button key={index} type="button" onClick={() => document.getElementById(`policy-section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-body hover:bg-white hover:text-primary"><span className="text-[10px] font-bold text-primary">{index + 1}</span><span className="truncate">{section.title || "Untitled section"}</span></button>)}</div><button type="button" onClick={addSection} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-primary/40 px-2 py-2 text-[10px] font-bold text-primary hover:bg-white"><PublicIcon name="add" className="h-3 w-3" />Add section</button></aside><div className="min-w-0 flex-1 p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-center gap-1 border-b border-border pb-3"><button type="button" className="rounded px-2.5 py-1.5 text-xs font-bold text-body hover:bg-accent-light">B</button><button type="button" className="rounded px-2.5 py-1.5 text-xs italic text-body hover:bg-accent-light">I</button><button type="button" className="rounded px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-accent-light">H2</button><span className="mx-2 h-5 w-px bg-border" /><span className="text-[10px] text-muted">Plain text policy content</span></div><div className="space-y-5"><label className="block text-xs font-semibold text-body">Document title<input value={policy.title} onChange={(event) => setPolicy({ ...policy, title: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-border-control px-3 text-base font-semibold outline-none focus:border-primary" /></label><label className="block text-xs font-semibold text-body">Introduction<textarea value={policy.description} onChange={(event) => setPolicy({ ...policy, description: event.target.value })} className="mt-1.5 min-h-20 w-full rounded-lg border border-border-control px-3 py-2 text-sm leading-6 outline-none focus:border-primary" /></label>{policy.sections.map((section, index) => <div id={`policy-section-${index}`} key={index} className="border-t border-border pt-5"><div className="flex items-center justify-between gap-3"><label className="block flex-1 text-xs font-semibold text-body">Section {index + 1}<input value={section.title} onChange={(event) => updateSection(index, "title", event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border-control px-3 text-sm font-semibold outline-none focus:border-primary" /></label><button type="button" onClick={() => removeSection(index)} disabled={policy.sections.length === 1} aria-label={`Remove section ${index + 1}`} className="mt-5 grid h-8 w-8 place-items-center rounded-md text-status-danger hover:bg-status-danger-surface disabled:opacity-30"><PublicIcon name="delete" className="h-3.5 w-3.5" /></button></div><label className="mt-3 block text-xs font-semibold text-body">Content<textarea value={section.body} onChange={(event) => updateSection(index, "body", event.target.value)} className="mt-1.5 min-h-32 w-full rounded-lg border border-border-control px-3 py-2 text-sm leading-6 outline-none focus:border-primary" /></label></div>)}</div></div></div><div className="flex justify-end gap-2 border-t border-border bg-surface-muted px-5 py-4 sm:px-7"><button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border-control bg-white px-4 py-2 text-xs font-semibold text-body">Cancel</button><button type="button" onClick={() => { setEditing(false); setSaved(true); }} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm">Save changes</button></div></div></div>}
      {saved && <p className="fixed bottom-5 right-5 z-[110] rounded-lg bg-status-success px-4 py-3 text-xs font-semibold text-white shadow-lg">Policy saved successfully.</p>}
    </div>
  );
}
