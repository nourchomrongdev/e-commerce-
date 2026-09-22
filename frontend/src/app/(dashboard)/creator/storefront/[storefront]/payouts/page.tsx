"use client";

import { useMemo, useState } from "react";
import PublicIcon from "@/components/icons/PublicIcon";
import {
  Badge,
  Button,
  InputText,
  MetricTile,
  Modal,
  Select,
  Table,
  TableHeader,
  TableRow,
} from "@/components/ui";

type PayoutStatus = "Completed" | "Processing" | "Pending" | "Failed";

type Payout = {
  id: string;
  amount: string;
  method: string;
  status: PayoutStatus;
  date: string;
};

const payouts: Payout[] = [
  {
    id: "P-2024-00124",
    amount: "$320.00",
    method: "Bank Transfer",
    status: "Completed",
    date: "May 12, 2024",
  },
  {
    id: "P-2024-00123",
    amount: "$185.50",
    method: "PayPal",
    status: "Processing",
    date: "May 10, 2024",
  },
  {
    id: "P-2024-00122",
    amount: "$420.00",
    method: "Bank Transfer",
    status: "Pending",
    date: "May 9, 2024",
  },
  {
    id: "P-2024-00121",
    amount: "$240.75",
    method: "PayPal",
    status: "Completed",
    date: "May 6, 2024",
  },
  {
    id: "P-2024-00120",
    amount: "$125.25",
    method: "Bank Transfer",
    status: "Failed",
    date: "May 3, 2024",
  },
];

const statusTone = {
  Completed: "success",
  Processing: "primary",
  Pending: "warning",
  Failed: "danger",
} as const;

const statusColors = {
  "All Payouts": "text-primary",
  Pending: "text-status-warning",
  Processing: "text-status-info",
  Completed: "text-status-success",
  Failed: "text-status-danger",
} as const;

const tabs: Array<"All Payouts" | PayoutStatus> = [
  "All Payouts",
  "Pending",
  "Processing",
  "Completed",
  "Failed",
];

function SummaryCard({
  label,
  value,
  detail,
  icon,
  tone = "orange",
}: {
  label: string;
  value: string;
  detail?: string;
  icon: string;
  tone?: "orange" | "green" | "blue" | "amber";
}) {
  const colors = {
    orange: "text-primary",
    green: "text-primary",
    blue: "text-primary",
    amber: "text-primary",
  };

  return <MetricTile
    label={label}
    value={value}
    change={detail}
    icon={<PublicIcon name={icon as "dollar"} className="h-5 w-5" />}
    iconClassName={colors[tone]}
  />;
}

export default function CreatorPayoutsPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("All Payouts");
  const [period, setPeriod] = useState("This month");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("620.00");
  const [withdrawn, setWithdrawn] = useState(false);

  const visiblePayouts = useMemo(() => {
    if (activeTab === "All Payouts") return payouts;
    return payouts.filter((payout) => payout.status === activeTab);
  }, [activeTab]);

  const submitWithdrawal = () => {
    setWithdrawOpen(false);
    setWithdrawn(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">
            Payouts
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track your earnings and manage your payouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary">
            <PublicIcon name="settings" className="h-3.5 w-3.5" />
            Payout Settings
          </Button>
          <Button size="sm" variant="secondary">
            <PublicIcon name="down" className="h-3.5 w-3.5 rotate-180" />
            Export
          </Button>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Available Balance"
          value={withdrawn ? "$620.00" : "$1,240.50"}
          detail="↑ 12.4% vs. last month"
          icon="wallet"
          tone="orange"
        />
        <SummaryCard
          label="Pending Payout"
          value="$620.00"
          detail="Next payout in 3 days"
          icon="clock-9"
          tone="amber"
        />
        <SummaryCard
          label="Total Paid"
          value="$5,280.75"
          detail="Across 18 payouts"
          icon="payout"
          tone="green"
        />
        <SummaryCard
          label="Payout Methods"
          value="2"
          detail="Active methods"
          icon="credit-card"
          tone="blue"
        />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-divider px-5 pt-4 sm:px-6">
            <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <nav
                className="flex gap-5 overflow-x-auto"
                aria-label="Payout status filters"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative whitespace-nowrap pb-3 text-[10px] font-semibold ${activeTab === tab ? statusColors[tab] : "text-tab-muted hover:text-body"}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span
                        className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full ${tab === "Pending" ? "bg-status-warning" : tab === "Processing" ? "bg-status-info" : tab === "Completed" ? "bg-status-success" : tab === "Failed" ? "bg-status-danger" : "bg-primary"}`}
                      />
                    )}
                  </button>
                ))}
              </nav>
              <Select
                aria-label="Payout period"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="w-full py-2 text-xs sm:w-auto"
              >
                <option>This month</option>
                <option>Last month</option>
                <option>This year</option>
              </Select>
            </div>
          </div>

          <Table className="min-w-[650px]">
            <TableHeader>
              <tr>
                <th className="px-6 py-3 font-medium">Payout ID</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Method</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </TableHeader>
            <tbody>
              {visiblePayouts.map((payout) => (
                <TableRow
                  key={payout.id}
                  className="text-[#283554] transition hover:bg-[#fffaf6]"
                >
                  <td className="px-6 py-3 text-[10px] font-medium text-[#172141]">
                    {payout.id}
                  </td>
                  <td className="py-3 font-medium text-[#172141]">
                    {payout.amount}
                  </td>
                  <td className="py-3 text-[10px] text-muted">
                    {payout.method}
                  </td>
                  <td className="py-3">
                    <Badge tone={statusTone[payout.status]}>
                      {payout.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-[#66718e]">{payout.date}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      aria-label={`View ${payout.id}`}
                      className="inline-grid h-7 w-7 place-items-center rounded-md border border-[#e4e7ef] text-[#66718e] hover:border-primary hover:text-primary"
                    >
                      <PublicIcon name="view" className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </Table>
          {visiblePayouts.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-[#66718e]">
              No payouts in this category.
            </p>
          )}
          <footer className="flex items-center justify-between border-t border-[#edf0f5] px-6 py-4 text-[10px] text-[#66718e]">
            <span>
              Showing {visiblePayouts.length} of {payouts.length} payouts
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                className="grid h-7 w-7 place-items-center rounded-md border border-[#e5e8f0] text-[#9aa2b5]"
                disabled
              >
                <PublicIcon name="left" className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[10px] font-semibold text-white"
              >
                1
              </button>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-md border border-[#e5e8f0] text-[#66718e]"
              >
                2
              </button>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-md border border-[#e5e8f0] text-[#66718e]"
              >
                3
              </button>
              <button
                type="button"
                aria-label="Next page"
                className="grid h-7 w-7 place-items-center rounded-md border border-[#e5e8f0] text-[#66718e]"
              >
                <PublicIcon name="right" className="h-3 w-3" />
              </button>
            </div>
          </footer>
        </section>
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-heading">
                  Upcoming Payout
                </h2>
                <p className="mt-1 text-[10px] text-muted-soft">
                  Will be sent to your bank account
                </p>
              </div>
              <span className="text-[9px] text-muted-soft">May 19, 2024</span>
            </div>
            <p className="mt-5 text-2xl font-bold text-ink">$620.00</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full w-[72%] rounded-full bg-primary" />
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-muted">
              <span>
                Processing
                <br />
                May 13
              </span>
              <span>In Transit</span>
              <span>
                Paid
                <br />
                May 19
              </span>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-heading">Payout Methods</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-status-info">
                    <PublicIcon name="wallet" className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-body-strong">
                      ABA Bank **** 1234
                    </p>
                    <p className="text-[9px] text-muted-soft">Bank account</p>
                  </div>
                </div>
                <Badge tone="success">Primary</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-status-info">
                  <PublicIcon name="credit-card" className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-body-strong">
                    PayPal
                  </p>
                  <p className="text-[9px] text-muted-soft">
                    teststore@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={withdrawOpen}
        title="Withdraw funds"
        onClose={() => setWithdrawOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWithdrawOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={submitWithdrawal}>
              Request withdrawal
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#66718e]">
          Funds will be sent to your default payout method.
        </p>
        <label
          htmlFor="withdraw-amount"
          className="mt-5 block text-xs font-medium text-[#283554]"
        >
          Withdrawal amount
          <div className="relative">
            <InputText
              id="withdraw-amount"
              className="mt-2 pr-10"
              type="number"
              min="1"
              max="1240.5"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
            />
            <span className="absolute right-3 top-4 text-sm text-[#8a93a8]">
              USD
            </span>
          </div>
        </label>
        <p className="mt-2 text-[10px] text-[#8993aa]">
          Available balance: $1,240.50
        </p>
      </Modal>
    </div>
  );
}
