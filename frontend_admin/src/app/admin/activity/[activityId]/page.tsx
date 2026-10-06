import Link from "next/link";

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
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/activity" className="text-xs font-medium text-primary no-underline hover:underline">Activity log</Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-[28px]">Activity Details</h1>
          <p className="mt-1 text-sm text-muted">Review the complete audit record for this marketplace event.</p>
        </div>
        <button type="button" className="inline-flex w-fit items-center bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary-hover">
          Export Record
        </button>
      </header>

      <article className="mt-6 bg-white p-5 shadow-sm sm:p-6">
        <div className="min-w-0">
          <section className="grid gap-6 border-b border-[#d6dfed] pb-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div><h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">{activity.action}</h2><p className="mt-4 text-sm leading-6 text-body">{activity.details}</p></div>
            <div className="border-t border-[#cbd7e8] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Status</h2>
              <p className="mt-4 inline-flex rounded-md bg-status-success-surface px-3 py-2 text-xs font-semibold text-status-success">{activity.result}</p>
              <p className="mt-4 text-[10px] text-muted">{activity.module}</p>
            </div>
          </section>

          <section className="border-b border-[#d6dfed] py-6">
            <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Activity details</h2>
            <dl className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["User", activity.user],
              ["Occurred", timestamp],
              ["IP Address", activity.ipAddress],
              ["Module", activity.module],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 border-l border-[#d6dfed] pl-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</dt>
                <dd className="mt-1 break-words text-xs font-semibold text-body-strong">{value}</dd>
                {label === "User" && <dd className="mt-1 text-[10px] text-muted">Administrator</dd>}
                {label === "IP Address" && <dd className="mt-1 text-[10px] text-muted">Local network</dd>}
              </div>
            ))}
            </dl>
          </section>

          <section className="border-b border-[#d6dfed] py-6">
            <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Audit Information</h2>
            <dl className="grid gap-4 pt-4 text-xs sm:grid-cols-2">
              <div><dt className="text-muted">Event ID</dt><dd className="mt-1 break-all font-semibold text-body-strong">ACT-{timestamp.replace(/[^0-9]/g, "").slice(0, 12) || "UNKNOWN"}</dd></div>
              <div><dt className="text-muted">Recorded by</dt><dd className="mt-1 font-semibold text-body-strong">Marketplace audit service</dd></div>
              <div><dt className="text-muted">Access level</dt><dd className="mt-1 font-semibold text-body-strong">Administrator</dd></div>
              <div><dt className="text-muted">Retention</dt><dd className="mt-1 font-semibold text-body-strong">Permanent audit record</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Resource URL</dt><dd className="mt-1 break-all font-semibold text-body-strong">{url}</dd></div>
            </dl>
          </section>

          <section className="border-b border-[#d6dfed] py-6"><h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Changes</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Before</p><p className="mt-2 text-xs font-medium leading-5 text-body-strong">{before}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">After</p><p className="mt-2 text-xs font-medium leading-5 text-status-success">{after}</p></div></div></section>

          <section className="border-b border-[#d6dfed] py-6"><h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Device &amp; Session</h2><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><div><dt className="text-muted">Device</dt><dd className="mt-1 font-semibold text-body-strong">{device}</dd></div><div><dt className="text-muted">Browser version</dt><dd className="mt-1 font-semibold text-body-strong">{browserVersion}</dd></div><div><dt className="text-muted">Session status</dt><dd className="mt-1 font-semibold text-status-success">{sessionStatus}</dd></div></dl></section>

          <section className="mt-6 border-t border-[#cbd7e8] pt-6">
            <h2 className="border-l-2 border-primary pl-3 text-sm font-bold text-heading">Event timeline</h2>
            <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <div><dt className="text-muted">Event created</dt><dd className="mt-1 font-semibold text-body-strong">{timestamp}</dd></div>
              <div><dt className="text-muted">User</dt><dd className="mt-1 font-semibold text-body-strong">{activity.user}</dd></div>
              <div><dt className="text-muted">Device &amp; browser</dt><dd className="mt-1 font-semibold text-body-strong">{device} · {browserVersion}</dd></div>
              <div><dt className="text-muted">IP address</dt><dd className="mt-1 font-semibold text-body-strong">{activity.ipAddress}</dd></div>
              <div><dt className="text-muted">Session status</dt><dd className="mt-1 font-semibold text-status-success">{sessionStatus}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-divider pt-4 text-[10px] text-muted">
              <span>Event recorded</span><span>Session validated</span><span>Access granted</span>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
