"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ??
  "http://localhost:5000/api";

type Restriction = {
  status: "suspended" | "banned";
  message: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  startsAt?: string | null;
  suspendedUntil?: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatTimeRemaining(value: string, now: number) {
  const endTimestamp = new Date(value).getTime();
  if (Number.isNaN(endTimestamp)) return "End time unavailable";
  const remainingSeconds = Math.ceil((endTimestamp - now) / 1000);
  if (remainingSeconds <= 0) return "End time reached";

  let secondsLeft = remainingSeconds;
  const units: [string, number][] = [
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const parts = units.flatMap(([unit, secondsPerUnit]) => {
    const value = Math.floor(secondsLeft / secondsPerUnit);
    secondsLeft %= secondsPerUnit;
    return value > 0 ? [`${value} ${unit}${value === 1 ? "" : "s"}`] : [];
  });

  return parts.slice(0, 3).join(", ");
}

export default function AccountRestrictionMonitor() {
  const router = useRouter();
  const [restriction, setRestriction] = useState<Restriction | null>(null);
  const [clockNow, setClockNow] = useState<number | null>(null);

  useEffect(() => {
    let checking = false;

    async function checkAccount() {
      const token = window.localStorage.getItem("marketplace-token");
      if (!token || checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (response.status !== 403) return;

        const data = await response.json();
        if (data.code !== "ACCOUNT_SUSPENDED" && data.code !== "ACCOUNT_BANNED") return;
        window.localStorage.removeItem("marketplace-token");
        setClockNow(Date.now());
        setRestriction({
          status: data.code === "ACCOUNT_BANNED" ? "banned" : "suspended",
          message: data.message || "Your account access has been restricted.",
          name: data.name,
          username: data.username,
          email: data.email,
          startsAt: data.startsAt,
          suspendedUntil: data.suspendedUntil,
        });
      } catch (error) {
        console.error("Unable to check account status", error);
      } finally {
        checking = false;
      }
    }

    void checkAccount();
    const intervalId = window.setInterval(() => void checkAccount(), 60_000);
    window.addEventListener("focus", checkAccount);
    document.addEventListener("visibilitychange", checkAccount);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkAccount);
      document.removeEventListener("visibilitychange", checkAccount);
    };
  }, []);

  useEffect(() => {
    if (!restriction?.suspendedUntil) return;
    const intervalId = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [restriction?.suspendedUntil]);

  if (!restriction) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="account-restriction-title"
        className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="h-1 bg-primary" />
        <div className="p-5">
          <h1 id="account-restriction-title" className="text-xl font-bold text-heading">
            Account {restriction.status === "banned" ? "banned" : "disabled"}
          </h1>
          <dl className="mt-4 space-y-4 border-t border-slate-200 pt-4 text-sm">
            <div className="grid gap-2 rounded-lg bg-slate-50 px-3 py-2">
              {restriction.name && (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-muted">Name</dt>
                  <dd className="text-right font-medium text-body-strong">{restriction.name}</dd>
                </div>
              )}
              {restriction.username && (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-muted">Username</dt>
                  <dd className="text-right font-medium text-body-strong">@{restriction.username}</dd>
                </div>
              )}
              {restriction.email && (
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-muted">Email</dt>
                  <dd className="break-all text-right font-medium text-body-strong">{restriction.email}</dd>
                </div>
              )}
            </div>
            <div>
              <dt className="font-semibold text-body">Reason</dt>
              <dd className="mt-1 whitespace-pre-wrap leading-5 text-body-strong">{restriction.message}</dd>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="font-medium text-muted">Start time</dt>
                <dd className="mt-1 font-medium text-body-strong">
                  {restriction.startsAt
                    ? formatDateTime(restriction.startsAt)
                    : "Not specified"}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="font-medium text-muted">End time</dt>
                <dd className="mt-1 font-medium text-body-strong">
                  {restriction.suspendedUntil
                    ? formatDateTime(restriction.suspendedUntil)
                    : "Permanent"}
                </dd>
              </div>
            </div>
            {restriction.suspendedUntil && (
              <div className="rounded-lg bg-orange-50 px-3 py-2">
                <dt className="font-medium text-primary-hover">Time remaining</dt>
                <dd className="mt-0.5 font-bold text-heading" aria-live="off">
                  {clockNow === null
                    ? "Calculating..."
                    : formatTimeRemaining(restriction.suspendedUntil, clockNow)}
                </dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
