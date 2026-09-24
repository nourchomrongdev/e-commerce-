"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import PublicIcon from "@/components/icons/PublicIcon";

type ProfileUser = {
  id?: string | number;
  username?: string;
  email?: string;
  role?: string;
  roles?: Array<string | { name?: string; role?: string }>;
  fullName?: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  isVerified?: boolean;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

function displayName(user: ProfileUser) {
  return user.fullName || user.name || user.username?.replace(/_\d{6}$/, "").replace(/_/g, " ") || "Marketplace user";
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    if (!token) {
      setError("Sign in to view your profile.");
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error("We could not load your profile.");
        const data = await response.json();
        setUser(data.user ?? data);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "We could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const name = displayName(user ?? {});
  const roleNames = Array.from(new Set([
    ...(user?.roles ?? []).map((entry) => typeof entry === "string" ? entry : entry.name || entry.role || ""),
    user?.role || "buyer",
  ].map((entry) => entry.toLowerCase()).filter(Boolean)));
  const role = roleNames[0] ? roleNames[0].charAt(0).toUpperCase() + roleNames[0].slice(1) : "Buyer";
  const hasCreatorRole = roleNames.includes("creator");
  const hasAffiliateRole = roleNames.includes("affiliate");
  const roleLinks = hasCreatorRole
    ? [
        ["Creator Studio", "/creator", "store" as const],
        ["Manage storefront", "/creator/storefront", "product" as const],
        ["Products and files", "/creator/storefront/TestStore/products", "product" as const],
        ["Payouts", "/creator/payouts", "wallet" as const],
      ]
    : hasAffiliateRole
      ? [
          ["Affiliate Studio", "/affiliate", "dashboard" as const],
          ["Affiliate links", "/affiliate/links", "link" as const],
          ["Commission earnings", "/affiliate/earnings", "dollar" as const],
          ["Payout overview", "/affiliate/payout", "wallet" as const],
        ]
      : [
          ["Purchase history", "/buyer/purchases", "shopping-cart" as const],
          ["Downloads", "/buyer/downloads", "download" as const],
          ["Licenses", "/buyer/licenses", "key" as const],
          ["Reviews", "/buyer/reviews", "message-square-reply" as const],
        ];

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#142b4d]">
      <Navbar active={null} />
      <div className="mx-auto max-w-[1180px] px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Account</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-heading">My Profile</h1>
          <p className="mt-2 text-sm text-muted">Manage your identity, account details, and marketplace preferences.</p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-white p-8 text-sm text-muted shadow-sm">Loading your profile...</div>
        ) : error ? (
          <div className="rounded-xl border border-orange-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-heading">Profile unavailable</h2>
            <p className="mt-2 text-sm text-muted">{error}</p>
            <Link href="/login" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-xs font-bold text-white no-underline hover:bg-primary-hover">Sign in</Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <section className="space-y-5">
              <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center gap-4 border-b border-divider pb-6">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-amber-500 text-2xl font-bold text-white">{initials(name)}</div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-xl font-extrabold text-heading">{name}</h2>
                    <p className="mt-1 text-sm text-muted">{user?.email || "Email not available"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {roleNames.map((roleName) => <span key={roleName} className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold capitalize text-primary">{roleName}</span>)}
                    </div>
                  </div>
                  <button type="button" className="rounded-md border border-primary px-4 py-2 text-xs font-bold text-primary hover:bg-orange-50">Edit profile</button>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Info label="Full name" value={name} />
                  <Info label="Username" value={user?.username || "Not available"} />
                  <Info label="Email address" value={user?.email || "Not available"} />
                  <Info label="Phone number" value={user?.phone || "Not added"} />
                </div>
              </div>

              <section className="border-b border-divider py-5 sm:py-7">
                <h2 className="text-base font-bold text-heading">Account activity</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Stat icon="shopping-cart" label="Purchases" value="0" />
                  <Stat icon="download" label="Downloads" value="0" />
                  <Stat icon="heart-plus" label="Saved products" value="0" />
                </div>
              </section>
              <PaymentSettings />
            </section>

            <aside className="space-y-5">
              <section className="border-b border-divider py-5">
                <h2 className="text-base font-bold text-heading">Account information</h2>
                <div className="mt-4 space-y-4">
                  <Info label="Account roles" value={roleNames.map((roleName) => roleName.charAt(0).toUpperCase() + roleName.slice(1)).join(", ")} />
                  <Info label="Account status" value="Active" />
                  <Info label="Member since" value={formatDate(user?.createdAt)} />
                  <Info label="Email verification" value={user?.isVerified ? "Verified" : "Not verified"} />
                </div>
              </section>
              <section className="border-b border-divider py-5">
                <h2 className="text-base font-bold text-heading">Quick links</h2>
                <div className="mt-3 space-y-1">
                  <QuickLink href="/buyer/account" icon="settings" label="Account settings" />
                  {roleLinks.map(([label, href, icon]) => <QuickLink key={label} href={href} icon={icon} label={label} />)}
                  <QuickLink href="/marketplace" icon="product" label="Browse marketplace" />
                </div>
              </section>
              <section className="border-b border-divider py-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-heading">Advanced settings</h2>
                  <PublicIcon name="settings" className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-4 space-y-1">
                  <SettingLink label="Security and password" detail="Password, sessions, and two-step verification" />
                  <SettingLink label="Notifications" detail="Email and marketplace updates" />
                  <SettingLink label="Privacy" detail="Profile visibility and data preferences" />
                  <SettingLink label="Connected accounts" detail="Google and social sign-in connections" />
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
      <PublicFooter />
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-soft">{label}</p><p className="mt-1 break-words text-sm font-semibold text-heading">{value}</p></div>;
}

function Stat({ icon, label, value }: { icon: "shopping-cart" | "download" | "heart-plus"; label: string; value: string }) {
  return <div className="border-l border-divider px-4 py-2 first:border-l-0"><PublicIcon name={icon} className="h-4 w-4 text-primary" /><p className="mt-4 text-xl font-extrabold text-heading">{value}</p><p className="mt-1 text-[10px] text-muted">{label}</p></div>;
}

function PaymentSettings() {
  return <section className="border-b border-divider py-5 sm:py-7">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-heading">Payment method</h2>
        <p className="mt-1 text-[10px] text-muted">Your default card for marketplace purchases.</p>
      </div>
      <button type="button" className="rounded-md border border-primary px-3 py-1.5 text-[10px] font-bold text-primary hover:bg-orange-50">Add card</button>
    </div>
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-orange-50/40 px-3 py-2.5">
      <PublicIcon name="credit-card" className="h-5 w-5 text-primary" />
      <div className="min-w-0 flex-1"><p className="text-xs font-bold text-heading">Visa <span className="font-medium text-muted">•••• 4242</span></p><p className="mt-1 text-[9px] text-muted">Credit / debit card · Primary</p></div>
      <PublicIcon name="check" className="h-4 w-4 text-emerald-600" />
    </div>
    <p className="mt-3 text-[9px] text-muted">Card numbers are encrypted and never stored in your profile.</p>
  </section>;
}

type ProfileIcon = "settings" | "shopping-cart" | "product" | "store" | "download" | "key" | "message-square-reply" | "dashboard" | "link" | "dollar" | "wallet";

function QuickLink({ href, icon, label }: { href: string; icon: ProfileIcon; label: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-md px-2 py-2.5 text-xs font-semibold text-body no-underline hover:bg-accent-light hover:text-primary"><PublicIcon name={icon} className="h-4 w-4 text-primary" />{label}<PublicIcon name="right" className="ml-auto h-3.5 w-3.5 text-current" /></Link>;
}

function SettingLink({ label, detail }: { label: string; detail: string }) {
  return <button type="button" className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-accent-light"><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-body">{label}</span><span className="mt-0.5 block text-[9px] leading-4 text-muted">{detail}</span></span><PublicIcon name="right" className="h-3.5 w-3.5 shrink-0 text-primary" /></button>;
}
