import Link from "next/link";
import PublicIcon from "@/components/icons/PublicIcon";

const activityDetails: Record<string, {
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  module: string;
  result: string;
  url?: string;
  device?: string;
  browserVersion?: string;
  sessionStatus?: string;
  before?: string;
  after?: string;
}> = {
  "May 11, 2025 04:45 PM": {
    user: "Admin",
    action: "Login",
    details: "Admin logged in to the marketplace control panel.",
    ipAddress: "192.168.1.10",
    module: "Authentication",
    result: "Successful",
    url: "https://admin.khmerdigital.com/auth/sign-in",
  },
  "May 11, 2025 02:02 PM": {
    user: "Jane Cooper",
    action: "Updated Product",
    details: "Updated product Music UI Kit and saved the latest product information.",
    ipAddress: "192.168.1.21",
    module: "Products",
    result: "Completed",
    url: "https://marketplace.khmerdigital.com/products/music-ui-kit",
    device: "Windows 11",
    browserVersion: "Chrome 128.0",
    sessionStatus: "Active",
    before: "Product metadata was still in draft state with the previous pricing and preview text.",
    after: "Product listing was published with updated pricing, keywords, and preview content.",
  },
  "May 11, 2025 01:15 PM": {
    user: "Brooklyn Simmons",
    action: "Deleted Content",
    details: "Deleted the content record Template after administrator review.",
    ipAddress: "192.168.1.15",
    module: "Content",
    result: "Completed",
    url: "https://marketplace.khmerdigital.com/content/templates/template-portfolio",
    device: "macOS Sonoma",
    browserVersion: "Safari 17.5",
    sessionStatus: "Expired",
    before: "Template was available in the catalog and visible to storefront editors.",
    after: "Template was removed from the catalog and marked as archived for compliance review.",
  },
  "May 11, 2025 08:20 AM": {
    user: "Cody Fisher",
    action: "Suspended User",
    details: "Suspended the user account associated with cody@example.com.",
    ipAddress: "192.168.1.30",
    module: "User Management",
    result: "Completed",
    url: "https://admin.khmerdigital.com/users/cody-fisher",
    device: "Windows 10",
    browserVersion: "Edge 127.0",
    sessionStatus: "Inactive",
    before: "Account was active and able to create new product submissions.",
    after: "Account was suspended pending account review and compliance verification.",
  },
  "May 10, 2025 06:20 PM": {
    user: "Admin",
    action: "Changed Settings",
    details: "Updated marketplace payout settings.",
    ipAddress: "192.168.1.10",
    module: "Settings",
    result: "Completed",
    url: "https://admin.khmerdigital.com/settings/payouts",
    device: "Windows 11",
    browserVersion: "Chrome 128.0",
    sessionStatus: "Active",
    before: "Payout schedule was set to the previous monthly threshold and vendor terms.",
    after: "Payout schedule and payout thresholds were updated for the current marketplace cycle.",
  },
};

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  const timestamp = decodeURIComponent(activityId);
  const activity = activityDetails[timestamp] ?? {
    user: "Unknown user",
    action: "Activity event",
    details: "No additional details are available for this activity.",
    ipAddress: "Not available",
    module: "Marketplace",
    result: "Recorded",
  };
  const device = activity.device ?? "Windows 11";
  const browserVersion = activity.browserVersion ?? "Chrome 128.0";
  const sessionStatus = activity.sessionStatus ?? "Active";
  const before = activity.before ?? "Not available";
  const after = activity.after ?? "Recorded successfully";
  const url = activity.url ?? "https://marketplace.khmerdigital.com/unknown";

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Link href="/admin/activity" className="inline-flex items-center gap-1 text-xs font-medium text-muted no-underline transition hover:text-primary">
        <PublicIcon name="left" className="h-3.5 w-3.5" />
        Back to activity log
      </Link>
      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">Administration</p>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Activity Details</h1>
          <p className="mt-1 text-sm text-muted">Review the complete audit record for this marketplace event.</p>
        </div>
        <button type="button" className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover">
          <PublicIcon name="download" className="h-3.5 w-3.5" />
          Export Record
        </button>
      </header>

      <div className="mt-6 border-t border-divider pt-5 sm:pt-6">
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section className="border-b border-[#d6dfed] pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-status-success-surface text-status-success"><PublicIcon name="check" className="h-5 w-5" /></span>
                <div className="min-w-0"><h2 className="text-base font-bold text-heading">{activity.action} {activity.result}</h2><p className="mt-1 text-xs text-muted">{activity.details}</p></div>
              </div>
              <span className="inline-flex shrink-0 rounded-md bg-status-success-surface px-2.5 py-1.5 text-[10px] font-semibold text-status-success">{activity.result}</span>
            </div>
            <div className="mt-4 flex items-center justify-end gap-1 text-[10px] text-muted"><PublicIcon name="shield-check" className="h-3.5 w-3.5" />{activity.module}</div>
          </section>

          <dl className="grid gap-3 border-b border-[#d6dfed] py-5 sm:grid-cols-2 2xl:grid-cols-4">
            {[
              ["User", activity.user, "user"],
              ["Occurred", timestamp, "clock-9"],
              ["IP Address", activity.ipAddress, "store"],
              ["Module", activity.module, "product"],
            ].map(([label, value, icon]) => (
              <div key={label} className="min-w-0 border-l border-[#d6dfed] pl-4 first:border-l-0 first:pl-0">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-light text-primary"><PublicIcon name={icon as "user"} className="h-4 w-4" /></span>
                <dt className="mt-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</dt>
                <dd className="mt-1 break-words text-xs font-semibold text-body-strong">{value}</dd>
                {label === "User" && <dd className="mt-1 text-[10px] text-muted">Administrator</dd>}
                {label === "IP Address" && <dd className="mt-1 text-[10px] text-muted">Local network</dd>}
              </div>
            ))}
          </dl>

          <section className="border-b border-[#d6dfed] py-6">
            <div className="flex items-center gap-2 border-b border-[#d6dfed] pb-3"><PublicIcon name="file-search-corner" className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-heading">Audit Information</h2></div>
            <dl className="grid gap-4 pt-4 text-xs sm:grid-cols-2">
              <div><dt className="text-muted">Event ID</dt><dd className="mt-1 break-all font-semibold text-body-strong">ACT-{timestamp.replace(/[^0-9]/g, "").slice(0, 12) || "UNKNOWN"}</dd></div>
              <div><dt className="text-muted">Recorded by</dt><dd className="mt-1 font-semibold text-body-strong">Marketplace audit service</dd></div>
              <div><dt className="text-muted">Access level</dt><dd className="mt-1 font-semibold text-body-strong">Administrator</dd></div>
              <div><dt className="text-muted">Retention</dt><dd className="mt-1 font-semibold text-body-strong">Permanent audit record</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Resource URL</dt><dd className="mt-1 break-all font-semibold text-body-strong">{url}</dd></div>
            </dl>
          </section>

          <section className="border-b border-[#d6dfed] py-6"><div className="flex items-center gap-2 border-b border-[#d6dfed] pb-3"><PublicIcon name="verification" className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-heading">Changes</h2></div><div className="mt-4 grid gap-3 border-l-2 border-primary/40 pl-4 sm:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Before</p><p className="mt-2 text-xs font-medium leading-5 text-body-strong">{before}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">After</p><p className="mt-2 text-xs font-medium leading-5 text-status-success">{after}</p></div></div></section>

          <section className="border-b border-[#d6dfed] py-6"><div className="flex items-center gap-2 border-b border-[#d6dfed] pb-3"><PublicIcon name="settings" className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-heading">Device & Session</h2></div><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><div><dt className="text-muted">Device</dt><dd className="mt-1 font-semibold text-body-strong">{device}</dd></div><div><dt className="text-muted">Browser version</dt><dd className="mt-1 font-semibold text-body-strong">{browserVersion}</dd></div><div><dt className="text-muted">Session status</dt><dd className="mt-1 font-semibold text-status-success">{sessionStatus}</dd></div></dl></section>

        </div>

        <aside className="h-fit border-l border-[#cbd7e8] pl-5"><div className="flex items-center gap-2 border-b border-[#d6dfed] pb-3"><PublicIcon name="clock-9" className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-heading">Event Timeline</h2></div><div className="mt-4 space-y-0">{[["Event Created", timestamp, "check"], ["User Login", activity.user, "user"], ["Device & Browser", `${device} • ${browserVersion}`, "dashboard"], ["IP Address", activity.ipAddress, "store"], ["Session Status", sessionStatus, "shield-check"]].map(([label, value, icon], index) => <div key={label} className={`flex gap-3 border-b border-[#d6dfed] py-3 last:border-0 ${index === 0 ? "bg-status-success-surface px-2" : ""}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-status-success text-white" : "bg-surface-muted text-muted"}`}><PublicIcon name={icon as "check"} className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-[10px] font-semibold text-body-strong">{label}</p><p className="mt-1 break-words text-[10px] text-muted">{value}</p></div>{index === 0 && <span className="ml-auto text-[9px] font-semibold text-status-success">Now</span>}</div>)}</div><div className="mt-5 border-t border-[#d6dfed] pt-4"><p className="text-[10px] font-semibold text-body-strong">Activity Trail</p><div className="mt-3 space-y-3 text-[10px] text-muted"><p><span className="mr-2 text-status-success">●</span>Event recorded</p><p><span className="mr-2 text-status-success">●</span>Session validated</p><p><span className="mr-2 text-status-success">●</span>Access granted</p></div></div></aside>
      </div>
      </div>
    </div>
  );
}
