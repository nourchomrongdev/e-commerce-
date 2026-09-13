import Link from "next/link";
import AppBrand, { APP_NAME } from "@/components/AppBrand";
import { routes } from "@/lib/routeController";

const exploreLinks = [
  ["Marketplace", routes.marketplace()],
  ["Creator Program", routes.programs.creatorProgram()],
  ["About Us", routes.about()],
  ["Contact Us", routes.contact()],
];

const legalLinks = [
  ["Privacy", routes.legal.privacy()],
  ["Terms", routes.legal.terms()],
  ["Refunds", routes.legal.refunds()],
  ["Cookies", routes.legal.cookies()],
];

export default function PublicFooter() {
  return (
    <footer className="mt-12 border-t border-[#dfe3ea] bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-9 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-[5%]">
        <div>
          <Link href={routes.home()} className="inline-flex no-underline">
            <AppBrand name={APP_NAME} textClassName="text-sm" logoClassName="h-8 w-8" />
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-5 text-muted">
            A simple place to discover digital products and grow as a creator.
          </p>
        </div>
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-heading">Explore</h2>
          <nav className="mt-3 grid gap-2" aria-label="Explore links">
            {exploreLinks.map(([label, href]) => (
              <Link key={label} href={href} className="w-fit text-xs text-muted no-underline hover:text-primary">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-heading">Helpful links</h2>
          <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal links">
            {legalLinks.map(([label, href]) => (
              <Link key={label} href={href} className="text-xs text-muted no-underline hover:text-primary">
                {label}
              </Link>
            ))}
          </nav>
          <a href="mailto:support@marketplace.com" className="mt-3 inline-block text-xs font-medium text-primary no-underline hover:underline">
            support@marketplace.com
          </a>
        </div>
      </div>
      <div className="border-t border-[#edf0f5] px-4 py-4 text-center text-[10px] text-muted sm:px-8 lg:px-[5%]">
        © 2026 {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
