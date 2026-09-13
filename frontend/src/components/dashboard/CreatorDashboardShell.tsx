"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toast } from "@/components/ui";
import { routes } from "@/lib/routeController";
import CreatorDashboardHeader from "./CreatorDashboardHeader";
import CreatorDashboardSidebar from "./CreatorDashboardSidebar";
import StorefrontHeader from "./StorefrontHeader";

const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

const getStoredToastState = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const storedValue = window.sessionStorage.getItem(key);
  return storedValue === null ? fallback : storedValue === "true";
};

const clearStoredToastState = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("storefront-branding-toast");
  window.sessionStorage.removeItem("storefront-settings-toast");
  window.sessionStorage.removeItem("storefront-payment-toast");
};

export default function CreatorDashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storefrontOpen, setStorefrontOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [storefrontName, setStorefrontName] = useState<string | null>(null);
  const [showIncompleteBrandingToast, setShowIncompleteBrandingToast] = useState(() => getStoredToastState("storefront-branding-toast", true));
  const [showIncompleteSettingsToast, setShowIncompleteSettingsToast] = useState(() => getStoredToastState("storefront-settings-toast", true));
  const [showIncompletePaymentToast, setShowIncompletePaymentToast] = useState(() => getStoredToastState("storefront-payment-toast", true));
  const [incompleteTabs, setIncompleteTabs] = useState<{
    Branding?: boolean;
    Settings?: boolean;
    Payment?: boolean;
  }>({});

  const segments = pathname.split("/").filter(Boolean);
  const storefrontIndex = segments.indexOf("storefront");
  const storefrontNameSegment = storefrontIndex >= 0 ? segments[storefrontIndex + 1] ?? "" : "";
  const storefrontSection = storefrontIndex >= 0 ? segments[storefrontIndex + 2] ?? "overview" : "";
  const isStorefrontRoute =
    storefrontIndex >= 0 &&
    Boolean(storefrontNameSegment) &&
    storefrontNameSegment !== "new";
  const storefrontHeaderAllowed = ["overview", "branding", "setting", "payment", "summary"].includes(storefrontSection);
  const activeTab = pathname.endsWith("/branding")
    ? "Branding"
    : pathname.endsWith("/setting")
      ? "Settings"
      : pathname.endsWith("/payment")
        ? "Payment"
        : pathname.endsWith("/summary")
          ? "Summary"
          : "Overview";

  useEffect(() => {
    const handleBeforeUnload = () => clearStoredToastState();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!isStorefrontRoute) {
      setStorefrontName(null);
      setIncompleteTabs({});
      return;
    }

    const nextStorefrontName = decodeURIComponent(segments[storefrontIndex + 1] ?? "");
    setStorefrontName(nextStorefrontName);

    const token = window.localStorage.getItem("marketplace-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(nextStorefrontName)}/branding`, { headers })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.branding || {};
        }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(nextStorefrontName)}/settings`, { headers })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.settings || {};
        }),
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(nextStorefrontName)}/payment`, { headers })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.payment || {};
        }),
    ])
      .then(([branding, settings, payment]) => {
        setIncompleteTabs({
          Branding: !String(branding?.storeName ?? "").trim() || !String(branding?.description ?? "").trim(),
          Settings:
            !String(settings?.email ?? "").trim() ||
            !String(settings?.phone ?? "").trim() ||
            !String(settings?.country ?? "").trim() ||
            !String(settings?.timezone ?? "").trim() ||
            !String(settings?.language ?? "").trim(),
          Payment:
            !Array.isArray(payment?.methods) ||
            payment.methods.length === 0 ||
            !String(payment?.primaryMethod ?? "").trim(),
        });
      })
      .catch(() => {
        setIncompleteTabs({});
      });
  }, [isStorefrontRoute, pathname, storefrontIndex]);

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const redirectToLogin = () => {
      const next = encodeURIComponent(pathname || routes.creator.overview());
      window.localStorage.removeItem("marketplace-token");
      window.localStorage.removeItem("marketplace-user");
      window.localStorage.removeItem("current-user");
      router.replace(`${routes.auth.login()}?next=${next}`);
    };

    if (!token) {
      redirectToLogin();
      return;
    }

    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) throw new Error("Unauthorized");
      const result = await response.json();
      const user = result.user ?? {};
      const role = String(user.role || "").toLowerCase();
      const roles = Array.isArray(user.roles) ? user.roles.map((item: unknown) => String(item).toLowerCase()) : [];
      const isVerified = Boolean(user.isVerified);

      if (!(role === "creator" || roles.includes("creator")) || !isVerified) {
        router.replace(routes.programs.creatorProgramReview());
        return;
      }

      setAuthorized(true);
    }).catch(() => {
      redirectToLogin();
    });
  }, [pathname, router]);

  const toggleSidebar = () => {
    setStorefrontOpen(false);

    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarCollapsed((isCollapsed) => !isCollapsed);
      return;
    }

    setMenuOpen((isOpen) => !isOpen);
  };

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-[#111b40]">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#e9edf6] border-t-primary" aria-label="Checking access" />
          <span className="text-sm font-medium text-[#1f2d52]">Checking creator access…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-[#111b40]">
      {isStorefrontRoute && storefrontHeaderAllowed && (
        <div className="fixed right-5 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          {showIncompleteBrandingToast && incompleteTabs.Branding && (
            <Toast
              variant="warning"
              title="Incomplete branding data"
              message="Add a store name and short description to finish your storefront."
              onClose={() => {
                setShowIncompleteBrandingToast(false);
                window.sessionStorage.setItem("storefront-branding-toast", "false");
              }}
            />
          )}
          {showIncompleteSettingsToast && incompleteTabs.Settings && (
            <Toast
              variant="warning"
              title="Incomplete settings data"
              message="Add your store email, phone, country, timezone, and language before saving settings."
              onClose={() => {
                setShowIncompleteSettingsToast(false);
                window.sessionStorage.setItem("storefront-settings-toast", "false");
              }}
            />
          )}
          {showIncompletePaymentToast && incompleteTabs.Payment && (
            <Toast
              variant="warning"
              title="Incomplete payment data"
              message="Add at least one payment method and choose a primary method before saving."
              onClose={() => {
                setShowIncompletePaymentToast(false);
                window.sessionStorage.setItem("storefront-payment-toast", "false");
              }}
            />
          )}
        </div>
      )}
      <CreatorDashboardHeader onMenuOpen={toggleSidebar} storefrontOpen={storefrontOpen} onStorefrontToggle={setStorefrontOpen} sidebarOpen={menuOpen} />
      <div className="flex min-h-0 flex-1">
        <CreatorDashboardSidebar open={menuOpen} collapsed={sidebarCollapsed} onClose={() => setMenuOpen(false)} onToggle={toggleSidebar} />
        <section className="min-w-0 flex-1 p-5 sm:p-8">
          {isStorefrontRoute && storefrontHeaderAllowed && storefrontName ? (
            <div className="mb-5 w-full">
              <StorefrontHeader
                storefront={{
                  displayName: storefrontName,
                  type: "Digital Products",
                }}
                activeTab={activeTab}
                incompleteTabs={incompleteTabs}
              />
            </div>
          ) : null}
          {children}
        </section>
      </div>
    </main>
  );
}
