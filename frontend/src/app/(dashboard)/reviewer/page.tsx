import Link from "next/link";
import PublicIcon from "@/components/icons/PublicIcon";
import { Card, MetricTile } from "@/components/ui";

const metrics = [["Pending Reviews", "24", "+6 new", "product"], ["Flagged Content", "12", "+3 new", "warning"], ["DMCA Reports", "5", "+1 new", "shield-check"], ["Creator Applications", "8", "+2 new", "user"], ["Content Violations", "7", "+1 new", "shield-minus"]] as const;
const pendingReviews = [["Premium Template Pack", "Product Review", "2m ago"], ["UI Design Kit", "File Review", "15m ago"], ["Icon Set Collection", "Preview Assets", "32m ago"], ["WordPress Plugin", "Product Review", "45m ago"], ["Mobile App UI Kit", "File Review", "1h ago"]] as const;
const activity = [["Approved product", "Premium Template Pack", "2m ago", "check"], ["Rejected file", "icon-set.zip", "15m ago", "x"], ["Flagged content", "Inappropriate content", "32m ago", "warning"]] as const;

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#111b40]">{title}</h2>
        {action && (
          <button type="button" className="text-xs font-semibold text-primary hover:underline">
            {action}
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}

export default function ReviewerDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Content operations</p>
          <h1 className="text-2xl font-bold text-[#111b40] sm:text-3xl">
            Good evening, Reviewer <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 text-sm text-[#66718e]">Review and moderate content to keep the marketplace safe.</p>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-[#e0e3ed] bg-white px-4 py-2 text-sm font-medium text-[#27365d] no-underline hover:bg-accent-light"
        >
          Marketplace
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value, change, icon]) => (
          <MetricTile
            key={label}
            label={label}
            value={value}
            change={change}
            icon={<PublicIcon name={icon as any} className="h-5 w-5" />}
            iconClassName="text-primary"
          />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Pending Reviews" action="View all">
          <div className="space-y-1">
            {pendingReviews.map(([name, type, time]) => (
              <Link
                href="/reviewer/pending-products"
                key={name}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-3 no-underline hover:bg-[#fffaf6]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#27365d]">{name}</span>
                  <span className="mt-1 block text-[11px] text-[#8993aa]">{type}</span>
                </span>
                <span className="text-[11px] text-[#8993aa]">{time}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Review Statistics" action="This week">
          <div className="flex items-center gap-6">
            <div
              className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full"
              style={{ background: "conic-gradient(#5b6ef5 0 43%, #ff8b5c 43% 72%, #2ec4a3 72% 100%)" }}
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-[11px] font-bold text-[#111b40]">
                43%
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#5b6ef5]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] text-[#27365d]">
                    <span>Approved</span>
                    <span>43%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff8b5c]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] text-[#27365d]">
                    <span>Flagged</span>
                    <span>29%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2ec4a3]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] text-[#27365d]">
                    <span>Escalated</span>
                    <span>28%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Recent Activity" action="See all">
          <div className="space-y-3">
            {activity.map(([title, detail, time, icon]) => (
              <div key={title + detail} className="flex items-start gap-3 rounded-lg border border-[#edf0f5] bg-[#fafbfe] p-3">
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-[#fff5ee] text-primary">
                  <PublicIcon name={icon as any} className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#27365d]">{title}</p>
                  <p className="mt-1 truncate text-[11px] text-[#8993aa]">{detail}</p>
                </div>
                <span className="text-[11px] text-[#8993aa]">{time}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Moderation Queue" action="Open queue">
          <div className="space-y-2">
            {[["Uploads pending review", "8"], ["Escalations", "3"], ["DMCA notices", "2"]].map(([item, count]) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-[#edf0f5] bg-[#fafbfe] px-3 py-2.5">
                <span className="text-sm text-[#27365d]">{item}</span>
                <span className="rounded-full bg-[#eef2ff] px-2 py-1 text-[10px] font-semibold text-primary">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
