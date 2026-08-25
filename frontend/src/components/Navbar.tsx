"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AppBrand, { APP_NAME } from "@/components/AppBrand";
import { apps, products } from "./ProductGrid";
import PublicIcon from "@/components/icons/PublicIcon";
import { publicNavigation, routes } from "@/lib/routeController";

type NavbarProps = { active?: "home" | "products" | "creator" };
const links = publicNavigation;
const categoryLinks = [
  "Apps",
  "Images & Photos",
  "Art & Graphics",
  "Templates",
  "E-Books",
  "Music & Audio",
  "Video Courses",
  "Fonts",
];
const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact-us" },
];
const moreLinks = [
  { label: "Top Deals", href: routes.digitalProducts() },
  { label: "Bestsellers", href: routes.digitalProducts() },
  { label: "New Releases", href: routes.digitalProducts() },
];
export default function Navbar({ active = "home" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<
    "categories" | "company" | "more" | null
  >(null);
  const [mobileMenus, setMobileMenus] = useState({
    categories: false,
    company: false,
    more: false,
  });
  const mobileMenu = null;
  const mobileInput = useRef<HTMLInputElement>(null);
  const items = active === "products" ? products : apps;
  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.type.toLowerCase().includes(term),
        )
      : items.slice(0, 4);
  }, [items, search]);
  const showSuggestions = focused && Boolean(search.trim());
  const toggleMobileMenu = (menu: "categories" | "company" | "more") => {
    setMobileMenus((current) => ({ ...current, [menu]: !current[menu] }));
  };
  const goToResults = () => {
    setFocused(Boolean(search.trim()));
    setMobileSearchOpen(false);
    document
      .getElementById("apps")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    if (mobileSearchOpen) mobileInput.current?.focus();
  }, [mobileSearchOpen]);
  useEffect(() => {
    const close = () => setFocused(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);
  const searchField = (mobile = false) => (
    <div
      className={`relative ${mobile ? "flex-1" : "hidden min-[1200px]:block"}`}
    >
      <div
        className={`flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-slate-400 shadow-sm ${focused ? "border-primary" : "border-slate-200"} ${mobile ? "w-full" : "w-64"}`}
      >
        <PublicIcon name="search" className="h-4 w-4 text-slate-400" />
        <input
          ref={mobile ? mobileInput : undefined}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(event) => {
            if (event.key === "Enter") goToResults();
            if (event.key === "Escape") {
              setFocused(false);
              event.currentTarget.blur();
            }
          }}
          className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          placeholder={
            active === "products"
              ? "Search digital products..."
              : "Search apps..."
          }
        />
        {search && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setSearch("")}
            className="text-sm text-slate-400"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={goToResults}
          className="rounded-md bg-primary px-3 py-1.5 text-[10px] font-semibold text-white"
        >
          Search
        </button>
      </div>
      <div
        className={`absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,.12)] transition ${showSuggestions ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
      >
        <div className="space-y-1">
          {results.length ? (
            results.map((item) => (
              <button
                key={item.name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSearch(item.name);
                  goToResults();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-accent-light"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-amber-600 text-[9px] font-bold text-white">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-xs text-slate-900">
                    {item.name}
                  </strong>
                  <small className="block truncate text-[10px] text-slate-500">
                    {item.type}
                  </small>
                </span>
                <span className="text-[9px] text-amber-500">
                  ★ {item.rating}
                </span>
              </button>
            ))
          ) : (
            <p className="px-2 py-3 text-center text-[10px] text-slate-500">
              No results for “{search}”
            </p>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="flex h-14 w-full items-center gap-5 px-4 sm:px-6 md:px-[7%]">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-xl text-slate-700 hover:bg-accent-light min-[1200px]:hidden"
          >
            ☰
          </button>
          <Link
            href="/"
            className="hidden items-center min-[1200px]:flex"
          >
            <AppBrand
              name={APP_NAME}
              className="text-sm"
              textClassName="text-sm"
              logoClassName="h-9 w-9 p-1"
            />
          </Link>
          <nav className="ml-auto hidden items-center gap-4 min-[1200px]:flex xl:gap-7">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative py-1 text-[11px] font-medium no-underline after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all ${link.page === active ? "text-primary after:w-full" : "text-slate-700 after:w-0 hover:text-primary hover:after:w-full"}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative ">
              <button
                type="button"
                onClick={() =>
                  setDesktopMenu(
                    desktopMenu === "categories" ? null : "categories",
                  )
                }
                className="flex items-center py-1 text-[11px] font-medium text-slate-700 hover:text-primary"
              >
                Categories <PublicIcon name="down" className={`ml-1 text-slate-400 transition-transform ${desktopMenu === "categories" ? "rotate-180" : ""}`} />
              </button>
              {desktopMenu === "categories" && (
                <div className="absolute left-0 top-8 grid w-72 grid-cols-2 gap-1 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                  {categoryLinks.map((category) => (
                    <Link
                      key={category}
                      href={routes.digitalProducts()}
                      onClick={() => setDesktopMenu(null)}
                      className="rounded-lg px-3 py-2 text-[11px] text-slate-600 no-underline hover:bg-accent-light hover:text-primary"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setDesktopMenu(desktopMenu === "company" ? null : "company")
                }
                className="flex items-center py-1 text-[11px] font-medium text-slate-700 hover:text-primary"
              >
                Company <PublicIcon name="down" className={`ml-1 text-slate-400 transition-transform ${desktopMenu === "company" ? "rotate-180" : ""}`} />
              </button>
              {desktopMenu === "company" && (
                <div className="absolute left-0 top-8 w-40 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                  {companyLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setDesktopMenu(null)}
                      className="block rounded-lg px-3 py-2 text-[11px] text-slate-600 no-underline hover:bg-accent-light hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setDesktopMenu(desktopMenu === "more" ? null : "more")
                }
                className="flex items-center py-1 text-[11px] font-medium text-slate-700 hover:text-primary"
              >
                More <PublicIcon name="down" className={`ml-1 text-slate-400 transition-transform ${desktopMenu === "more" ? "rotate-180" : ""}`} />
              </button>
              {desktopMenu === "more" && (
                <div className="absolute left-0 top-8 w-40 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setDesktopMenu(null)}
                      className="block rounded-lg px-3 py-2 text-[11px] text-slate-600 no-underline hover:bg-accent-light hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
          {searchField()}
          <div className="ml-auto flex items-center gap-1 min-[1200px]:ml-3">
            <button
              type="button"
              aria-label="Open search"
              onClick={() => setMobileSearchOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-700 hover:bg-accent-light min-[1200px]:hidden"
            >
              <PublicIcon name="search" className="h-4 w-4 text-slate-400" />
            </button>
            <button
              type="button"
              aria-label="Cart"
              className="relative grid h-8 w-8 place-items-center text-base text-slate-700"
            >
              <PublicIcon
                name="shopping-cart"
                className="h-4 w-4 text-slate-700"
              />
              <span className="absolute right-0 top-0 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-0.5 text-[7px] text-white">
                2
              </span>
            </button>
            <button
              type="button"
              className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-white shadow-[0_5px_12px_rgba(255,103,0,0.35)]"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>
      <div className="h-14" />
      {mobileSearchOpen && (
        <div className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-3 min-[1200px]:hidden">
          <button
            type="button"
            aria-label="Close search"
            onClick={() => {
              setMobileSearchOpen(false);
              setFocused(false);
            }}
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-700"
          >
            ‹
          </button>
          {searchField(true)}
        </div>
      )}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35"
        />
      )}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex h-dvh max-h-dvh w-[85%] max-w-sm flex-col overflow-y-auto overscroll-contain bg-[#fafaff] p-5 pb-10 shadow-2xl transition-transform duration-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [touch-action:pan-y] ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center no-underline"
          >
            <AppBrand
              name={APP_NAME}
              className="text-base"
              textClassName="text-base"
              logoClassName="h-9 w-9 p-1"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xl text-slate-600"
          >
            ×
          </button>
        </div>
        <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Navigation
        </p>
        <div className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-3 text-sm font-medium no-underline ${link.page === active ? "bg-accent-light text-primary" : "text-slate-700 hover:bg-accent-light hover:text-primary"}`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => toggleMobileMenu("categories")}
            className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-accent-light hover:text-primary [&>span]:hidden after:inline-block after:h-4 after:w-4 after:bg-current after:transition-transform after:[mask:url('/icons/down.svg')_center_/_contain_no-repeat] after:[-webkit-mask:url('/icons/down.svg')_center_/_contain_no-repeat] ${mobileMenus.categories ? "after:rotate-180" : ""}`}
          >
            Categories <span>{mobileMenu === "categories" ? "⌃" : "⌄"}</span>
          </button>
          {mobileMenus.categories && (
            <div className="ml-3 border-l border-accent-light pl-2">
              {categoryLinks.map((category) => (
                <Link
                  key={category}
                  href={routes.digitalProducts()}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-600 no-underline hover:bg-accent-light hover:text-primary"
                >
                  {category}
                </Link>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => toggleMobileMenu("company")}
            className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-accent-light hover:text-primary"
          >
            Company <PublicIcon name="down" className={`h-4 w-4 text-slate-400 transition-transform ${mobileMenus.company ? "rotate-180" : ""}`} />
          </button>
          {mobileMenus.company && (
            <div className="ml-3 border-l border-accent-light pl-2">
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-600 no-underline hover:bg-accent-light hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => toggleMobileMenu("more")}
            className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-accent-light hover:text-primary [&>span]:hidden after:inline-block after:h-4 after:w-4 after:bg-current after:transition-transform after:[mask:url('/icons/down.svg')_center_/_contain_no-repeat] after:[-webkit-mask:url('/icons/down.svg')_center_/_contain_no-repeat] ${mobileMenus.more ? "after:rotate-180" : ""}`}
          >
            More <span>{mobileMenu === "more" ? "⌃" : "⌄"}</span>
          </button>
          {mobileMenus.more && (
            <div className="ml-3 border-l border-accent-light pl-2">
              {moreLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-600 no-underline hover:bg-accent-light hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
