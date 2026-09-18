"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppBrand, { APP_NAME } from "@/components/AppBrand";
import PublicIcon from "@/components/icons/PublicIcon";
import { routes } from "@/lib/routeController";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";
type StorefrontOption = { name: string; products: number; href: string };

const formatDisplayText = (value: string | null | undefined, fallback: string) => {
  const cleaned = String(value ?? "").trim().replace(/_/g, " ").replace(/\s+/g, " ");
  return cleaned || fallback;
};

const formatRoleText = (value: string | null | undefined, fallback: string) => {
  const cleaned = String(value ?? "").trim().replace(/_/g, " ").replace(/\s+/g, " ");
  if (!cleaned) return fallback;
  return cleaned.split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
};

const resolveUserRole = (user: any, fallback: string) => {
  const candidates: string[] = [];

  const addCandidate = (value: unknown) => {
    if (!value) return;
    const text = String(value).replace(/_/g, " ").trim();
    if (text) candidates.push(text);
  };

  if (Array.isArray(user?.roles)) {
    user.roles.forEach((entry: unknown) => {
      if (typeof entry === "string") addCandidate(entry);
      else if (entry && typeof entry === "object") {
        addCandidate((entry as any)?.role?.RoleName ?? (entry as any)?.RoleName ?? (entry as any)?.name ?? (entry as any)?.role ?? (entry as any)?.roleName);
      }
    });
  }

  addCandidate(user?.role ?? user?.userRole ?? user?.primaryRole ?? user?.roleName);

  const normalized = candidates
    .map((value) => value.toLowerCase())
    .filter(Boolean);

  if (normalized.includes("creator")) return "Creator";
  if (normalized.includes("admin")) return "Admin";
  if (normalized.includes("reviewer")) return "Reviewer";
  if (normalized.includes("buyer")) return "Buyer";
  if (normalized.length > 0) return formatRoleText(normalized[0], fallback);
  return fallback;
};

export default function CreatorDashboardHeader({
  onMenuOpen,
  workspace = "creator",
  storefrontOpen = false,
  onStorefrontToggle = () => undefined,
  sidebarOpen = false,
}: {
  onMenuOpen: () => void;
  workspace?: "creator" | "reviewer" | "admin";
  storefrontOpen?: boolean;
  onStorefrontToggle?: (next: boolean) => void;
  sidebarOpen?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [storefrontOptions, setStorefrontOptions] = useState<StorefrontOption[]>([]);
  const [isBurgerMenuVisible, setIsBurgerMenuVisible] = useState(false);
  const [accountName, setAccountName] = useState("User");
  const [accountRole, setAccountRole] = useState("Creator");

  useEffect(() => {
    const updateBurgerVisibility = () => setIsBurgerMenuVisible(window.innerWidth < 1024);
    updateBurgerVisibility();

    window.addEventListener("resize", updateBurgerVisibility);
    return () => window.removeEventListener("resize", updateBurgerVisibility);
  }, []);

  const shouldShowStorefrontSelector = !isBurgerMenuVisible;
  const [selectedStorefront, setSelectedStorefront] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("creator-selected-storefront") ?? "";
  });

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const storedUser = window.localStorage.getItem("current-user") || window.localStorage.getItem("marketplace-user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const nextName = formatDisplayText(parsedUser?.username || parsedUser?.name || parsedUser?.fullName, "User");
        const nextRole = resolveUserRole(parsedUser, "Creator");
        setAccountName(nextName);
        setAccountRole(nextRole);
      } catch {
        // ignore invalid stored user data
      }
    }

    if (!token) return;

    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load user profile");
        const result = await response.json();
        const user = result.user ?? {};
        const nextName = formatDisplayText(user.username || user.name || user.fullName, "User");
        const nextRole = resolveUserRole(user, "Creator");
        setAccountName(nextName);
        setAccountRole(nextRole);
        if (user.username || user.name || user.fullName) {
          window.localStorage.setItem("current-user", JSON.stringify(user));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!accountOpen && !storefrontOpen && !notifications) return;

    const closeMenus = () => {
      setAccountOpen(false);
      onStorefrontToggle(false);
      setNotifications(false);
    };

    window.addEventListener("scroll", closeMenus, { passive: true });
    return () => window.removeEventListener("scroll", closeMenus);
  }, [accountOpen, storefrontOpen, notifications, onStorefrontToggle]);

  useEffect(() => {
    const match = pathname.match(/^\/creator\/storefront\/([^/]+)(?:\/|$)/);
    const currentStorefront = match && !["overview", "branding", "setting", "payment", "summary", "products", "orders", "verification", "new"].includes(match[1])
      ? decodeURIComponent(match[1])
      : null;

    if (currentStorefront) {
      setSelectedStorefront(currentStorefront);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("creator-selected-storefront", selectedStorefront);
    }
  }, [selectedStorefront]);

  const isAllStoresOverview = pathname === routes.creator.overview();
  const isAffiliateContext = pathname === "/affiliate" || pathname.startsWith("/affiliate/") || pathname === "/creator/affiliate" || pathname.startsWith("/creator/affiliate/");
  const isReviewerContext = workspace === "reviewer";
  const isAdminContext = workspace === "admin";
  const activeStorefrontName = isAllStoresOverview || !selectedStorefront ? "All Stores Overview" : selectedStorefront;

  useEffect(() => {
    if (isAffiliateContext || isReviewerContext || isAdminContext) return;

    const token = window.localStorage.getItem("marketplace-token");
    if (!token) return;

    fetch(`${apiUrl}/creator/storefronts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load storefronts");
        return response.json();
      })
      .then((data: { storefronts?: { displayName: string; products: number }[] }) => {
        if (!data.storefronts) return;
        setStorefrontOptions(data.storefronts.map(({ displayName, products }) => ({
          name: displayName,
          products,
          href: routes.creator.storefrontOverview(displayName),
        })));
        if (data.storefronts.length === 0) {
          setSelectedStorefront("");
          window.localStorage.removeItem("creator-selected-storefront");
        }
      })
      .catch(() => undefined);
  }, [isAffiliateContext, isReviewerContext, isAdminContext]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eaebf5] bg-[#fbfbff]/95 px-3 backdrop-blur sm:px-6">
      <div className="flex h-20 w-full items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            onStorefrontToggle(false);
            onMenuOpen();
          }}
          aria-label="Toggle dashboard navigation"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl text-[#111b40] hover:bg-accent-light min-[901px]:hidden"
        >
          ☰
        </button>

        <Link
          href="/"
          className="flex min-w-0 items-center text-[#111b40] no-underline max-[900px]:hidden"
        >
          <AppBrand
            name={APP_NAME}
            className="min-w-0"
            textClassName="truncate text-[20px] font-black tracking-[0.06em] sm:text-[22px]"
            logoClassName="h-10 w-10 sm:h-11 sm:w-11"
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {!isAffiliateContext && !isReviewerContext && !isAdminContext && shouldShowStorefrontSelector && <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => onStorefrontToggle(!storefrontOpen)}
              className="inline-flex max-w-[220px] items-center justify-center gap-2 rounded-lg bg-[#f4f7ff] px-2 py-2 text-primary shadow-sm transition hover:bg-[#edf3ff] sm:max-w-none sm:px-3.5"
            >
              <PublicIcon
                name="store"
                className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6"
              />

              <span className="flex min-w-0 flex-col items-start leading-tight text-left">
                <span className="truncate text-[11px] font-medium sm:text-[13px]">
                  {isAffiliateContext ? "Affiliate Dashboard" : "My Storefront"}
                </span>
                <span className="max-w-[90px] truncate text-[9px] text-gray-500 sm:max-w-[120px] sm:text-[11px]">
                  {isAffiliateContext ? "Affiliate Overview" : activeStorefrontName}
                </span>
              </span>

              <PublicIcon
                name="down"
                className={`h-4 w-4 shrink-0 transition-transform ${
                  storefrontOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {storefrontOpen && !isAffiliateContext && (
              <div className="absolute right-0 z-50 mt-2 w-[min(86vw,18rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:w-72">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-[11px] font-medium tracking-[0.08em] text-gray-500">
                    YOUR STOREFRONTS
                  </p>
                </div>

                <Link
                  href={routes.creator.overview()}
                  onClick={() => {
                    setSelectedStorefront("All Stores Overview");
                    window.localStorage.removeItem("creator-selected-storefront");
                    onStorefrontToggle(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 transition ${isAllStoresOverview ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <PublicIcon name="home" className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      All Stores Overview
                    </p>
                    <p className="text-xs text-gray-500">Overview dashboard</p>
                  </div>

                  {isAllStoresOverview && <span className="text-base font-bold text-primary">✓</span>}
                </Link>

                {storefrontOptions.map(({ name, products, href }) => {
                  const isSelected = !isAllStoresOverview && selectedStorefront === name;

                  return (
                    <Link
                      key={name}
                      href={href}
                      onClick={() => {
                        setSelectedStorefront(name);
                        onStorefrontToggle(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 transition ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${name === "TestStore" ? "bg-blue-100 text-primary" : "bg-purple-100 text-purple-600"}`}>
                        <PublicIcon name="store" className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {name}
                        </p>
                        <p className="text-xs text-gray-500">{products} products</p>
                      </div>

                      {isSelected && <span className="text-base font-bold text-primary">✓</span>}
                    </Link>
                  );
                })}

                <div className="border-t border-gray-100" />

                <Link
                  href={routes.creator.storefronts()}
                  onClick={() => onStorefrontToggle(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <PublicIcon name="settings" className="h-5 w-5 text-gray-500" />
                  Manage Storefronts
                </Link>

                <Link
                  href={routes.creator.storefrontNew()}
                  onClick={() => onStorefrontToggle(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary transition hover:bg-blue-50"
                >
                  <span className="text-lg leading-none">+</span>
                  Create New Storefront
                </Link>
              </div>
            )}
          </div>}

          <button
            type="button"
            onClick={() => setNotifications((isOpen) => !isOpen)}
            aria-expanded={notifications}
            aria-label="Notifications"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg text-primary hover:bg-accent-light"
          >
            <PublicIcon name="notification" className="text-primary" />
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-semibold text-white">
              3
            </span>
          </button>

          {notifications && (
            <div className="absolute right-16 top-12 z-20 w-60 rounded-xl border border-[#e7e9f2] bg-white p-4 text-xs shadow-xl">
              <strong>Notifications</strong>
              <p className="mt-2 text-[#66718e]">
                3 new orders are ready to review.
              </p>
            </div>
          )}

          <div className="hidden h-10 w-px bg-[#ededf3] sm:block" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((isOpen) => !isOpen)}
              aria-expanded={accountOpen}
              aria-label="Open account menu"
              className="flex items-center gap-2 rounded-lg p-1 text-left transition hover:bg-accent-light"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-[#633719] text-sm font-semibold text-white">
                {formatDisplayText(accountName, "U").charAt(0).toUpperCase() || (isAdminContext ? "A" : isReviewerContext ? "R" : "N")}
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold text-[#111b40]">{accountName}</span>
                <span className="block text-[11px] text-[#69738f]">{accountRole}</span>
              </span>
              <PublicIcon name="down" className={`hidden h-4 w-4 text-[#69738f] transition-transform sm:block ${accountOpen ? "rotate-180" : ""}`} />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#e7e9f2] bg-white py-2 shadow-xl">
                {!isReviewerContext && !isAdminContext && (
                  <>
                    <p className="border-b border-gray-100 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Switch workspace
                    </p>
                    <Link href="/creator/overview" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                      <PublicIcon name="store" className="h-5 w-5 text-primary" />
                      Creator Studio
                    </Link>
                    <Link href="/affiliate" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                      <PublicIcon name="dashboard" className="h-5 w-5 text-primary" />
                      Affiliate Studio
                    </Link>
                    <div className="border-t border-gray-100" />
                  </>
                )}
                <Link href="/affiliate/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                  <PublicIcon name="user" className="h-5 w-5 text-gray-500" />
                  Profile Settings
                </Link>
                <Link href="/creator/help" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                  <PublicIcon name="help" className="h-5 w-5 text-gray-500" />
                  Help Center
                </Link>
                <div className="border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    window.localStorage.removeItem("marketplace-token");
                    window.localStorage.removeItem("marketplace-user");
                    window.localStorage.removeItem("current-user");
                    window.localStorage.removeItem("creator-selected-storefront");
                    setAccountOpen(false);
                    router.replace(routes.auth.login());
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-status-danger transition hover:bg-red-50"
                >
                  <PublicIcon name="arrow-left" className="h-5 w-5" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
