"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toast } from "@/components/ui";
import { routes } from "@/lib/routeController";
import { clearSessionData } from "@/lib/session";
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
  const [redirectingToLogin, setRedirectingToLogin] = useState(true);
  const [redirectMessage, setRedirectMessage] = useState("Please wait while we verify your creator access.");
  const [showIncompleteBrandingToast, setShowIncompleteBrandingToast] = useState(() => getStoredToastState("storefront-branding-toast", true));
  const [showIncompleteSettingsToast, setShowIncompleteSettingsToast] = useState(() => getStoredToastState("storefront-settings-toast", true));
  const [showIncompletePaymentToast, setShowIncompletePaymentToast] = useState(() => getStoredToastState("storefront-payment-toast", true));
  const [storefrontLogoUrl, setStorefrontLogoUrl] = useState<string | null>(null);
  const [incompleteTabs, setIncompleteTabs] = useState<{
    Branding?: boolean;
    Settings?: boolean;
    Payment?: boolean;
  }>({});
  const initialPathRef = useRef(pathname);
  const redirectTimerRef = useRef<number | null>(null);

  const segments = pathname.split("/").filter(Boolean);
  const storefrontIndex = segments.indexOf("storefront");
  const storefrontNameSegment = storefrontIndex >= 0 ? segments[storefrontIndex + 1] ?? "" : "";
  const storefrontSection = storefrontIndex >= 0 ? segments[storefrontIndex + 2] ?? "overview" : "";
  const isStorefrontRoute =
    storefrontIndex >= 0 &&
    Boolean(storefrontNameSegment) &&
    storefrontNameSegment !== "new";
  const storefrontName = isStorefrontRoute ? decodeURIComponent(storefrontNameSegment) : null;
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
    if (!authorized || !isStorefrontRoute || !storefrontName) return;

    const nextStorefrontName = storefrontName;

    const token = window.localStorage.getItem("marketplace-token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${apiUrl}/creator/storefronts/${encodeURIComponent(nextStorefrontName)}`, { headers })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) return {};
          return data.storefront || {};
        }),
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
      .then(([storefront, branding, settings, payment]) => {
        setStorefrontLogoUrl(storefront?.logoUrl || null);
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
        setStorefrontLogoUrl(null);
        setIncompleteTabs({});
      });
  }, [authorized, isStorefrontRoute, pathname, storefrontName]);

  useEffect(() => {
    const token = window.localStorage.getItem("marketplace-token");
    const primaryMessage = "Checking creator account...";
    const secondaryDelay = 1500;
    const redirectDelay = 3000;

    const redirectToLogin = async (message = "Please log in before continue.") => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }

      setAuthorized(false);
      setRedirectingToLogin(true);
      setRedirectMessage(primaryMessage);

      const next = encodeURIComponent(initialPathRef.current || routes.creator.overview());
      await clearSessionData();

      window.setTimeout(() => {
        setRedirectMessage(message);
      }, secondaryDelay);

      redirectTimerRef.current = window.setTimeout(() => {
        router.replace(`${routes.auth.login()}?next=${next}`);
      }, redirectDelay + secondaryDelay);
    };

    const redirectToCreatorProgram = (message = "No creator access. Redirecting to creator program...") => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }

      setAuthorized(false);
      setRedirectingToLogin(true);
      setRedirectMessage(primaryMessage);

      window.setTimeout(() => {
        setRedirectMessage(message);
      }, secondaryDelay);

      redirectTimerRef.current = window.setTimeout(() => {
        router.replace("http://localhost:3000/program/creatorprogram");
      }, redirectDelay + secondaryDelay);
    };

    if (!token) {
      redirectToLogin();
      return () => {
        if (redirectTimerRef.current !== null) {
          window.clearTimeout(redirectTimerRef.current);
        }
      };
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
        redirectToCreatorProgram("No creator access. Redirecting to creator program...");
        return;
      }

      setAuthorized(true);
      setRedirectingToLogin(false);
      setRedirectMessage(primaryMessage);
    }).catch(() => {
      redirectToLogin();
    });

    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, [router]);

  const toggleSidebar = () => {
    setStorefrontOpen(false);

    if (window.matchMedia("(min-width: 901px)").matches) {
      setSidebarCollapsed((isCollapsed) => !isCollapsed);
      return;
    }

    setMenuOpen((isOpen) => !isOpen);
  };

  if (redirectingToLogin) {
    return (
      <main className="fixed inset-0 z-[100] grid place-items-center bg-[#f5f5f7] px-4 py-8 text-[#1f2d52]">
        <div className="flex max-w-md items-center gap-4">
          <span
            className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2px] border-[#ee9b5a]"
            aria-label="Checking access"
          >
            <span className="absolute inset-[2px] animate-spin rounded-full border-[2px] border-transparent border-t-[#ee9b5a]" />
          </span>
          <div>
            <p className="text-[1.05rem] font-medium leading-snug text-[#1f2d52]">Checking creator account...</p>
            <p className="mt-1 text-sm leading-snug text-[#66718e]">{redirectMessage}</p>
          </div>
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
        <section className={`dashboard-shell min-w-0 flex-1 p-5 sm:p-8 ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
          {isStorefrontRoute && storefrontHeaderAllowed && storefrontName ? (
            <div className="mb-5 w-full">
              <StorefrontHeader
                storefront={{
                  displayName: storefrontName,
                  type: "Digital Products",
                  logoUrl: storefrontLogoUrl || undefined,
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
