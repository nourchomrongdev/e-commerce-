import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import StorefrontCartButton from "@/components/StorefrontCartButton";
import ProductBreadcrumbs from "@/components/ProductBreadcrumbs";

type Props = {
  params: Promise<{ storefrontName: string; productSlug: string }>;
};

const catalog: Record<
  string,
  {
    name: string;
    type: string;
    price: string;
    oldPrice: string;
    description: string;
    art: string;
    isFree?: boolean;
  }
> = {
  "business-plan": {
    name: "Business Plan",
    type: "Template",
    price: "$18",
    oldPrice: "$29",
    description:
      "A polished business plan template for founders, teams and growing companies.",
    art: "business",
  },
  "the-ultimate-design": {
    name: "The Ultimate Design",
    type: "eBook",
    price: "$15",
    oldPrice: "$24",
    description:
      "A practical design guide for creators, product teams and anyone who wants to make better digital experiences.",
    art: "book",
  },
  "startup-landing-page": {
    name: "Startup Landing Page",
    type: "Template",
    price: "$24",
    oldPrice: "$39",
    description:
      "A modern and responsive landing page template for startups, apps and digital products.",
    art: "landing",
  },
  "modern-resume": {
    name: "Modern Resume",
    type: "Template",
    price: "$0",
    oldPrice: "$9",
    description:
      "A clean, professional resume template ready to customize and download.",
    art: "book",
    isFree: true,
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const product = catalog[productSlug] ?? catalog["business-plan"];
  return { title: product.name, description: product.description };
}

export default async function ProductDetailPage({ params }: Props) {
  const { storefrontName, productSlug } = await params;
  const product = catalog[productSlug] ?? {
    ...catalog["business-plan"],
    name: productSlug
      .split("-")
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(" "),
  };
  const seller = decodeURIComponent(storefrontName);
  const basePath = `/marketplace/${encodeURIComponent(storefrontName)}`;
  const productPath = `${basePath}/${productSlug}`;
  const isFree = product.isFree || productSlug.toLowerCase().includes("free");
  const screenshotTones = [
    "landing",
    "mobile",
    "cards",
    "book",
    "dashboard",
    "course",
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-[#142b4d]">
      <Navbar active="products" />
      <main className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="border-b border-[#e5ebf4] py-3">
          <ProductBreadcrumbs
            productName={seller}
            productPath={basePath}
            current={product.name}
          />
        </div>

        <div className="grid gap-8 border-b border-[#e5ebf4] py-8 lg:grid-cols-[minmax(0,1fr)_270px]">
          <section className="min-w-0 border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-300 to-[#a95119] text-3xl font-bold text-white shadow-lg">
                  {product.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-primary">
                    {product.type} / Digital product
                  </p>
                  <h1 className="mt-1 text-[30px] font-extrabold leading-tight tracking-tight text-heading sm:text-4xl">
                    {product.name}
                  </h1>
                  <p className="mt-1 text-xs text-muted">by {seller}</p>
                </div>
                <div className="w-full sm:w-auto sm:text-right">
                  <div className="text-sm text-amber-500">
                    ★★★★★{" "}
                    <span className="ml-1 text-xs font-semibold text-heading">
                      4.8
                    </span>
                  </div>
                  <small className="text-[10px] text-muted">
                    124 reviews · 245 downloads
                  </small>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-divider py-4 text-[10px]">
                <span className="text-muted">Secure delivery</span>
                <span className="h-3 w-px bg-border" />
                <span className="text-muted">Instant access</span>
                <span className="h-3 w-px bg-border" />
                <span className="text-muted">Verified creator</span>
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-muted">
                    {isFree ? "Free download" : "Current version · v3.2.7"}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold leading-none text-heading">
                    {isFree ? "Free" : product.price}{" "}
                    {!isFree && (
                      <>
                        <del className="ml-2 text-sm font-normal text-muted">
                          {product.oldPrice}
                        </del>
                        <span className="ml-2 rounded bg-orange-50 px-2 py-1 text-[9px] font-bold text-primary">
                          v3.2.7
                        </span>
                      </>
                    )}
                  </p>
                </div>
                {isFree ? (
                  <button
                    type="button"
                    className="flex h-11 w-full max-w-[220px] items-center justify-center rounded-md bg-primary px-5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-hover"
                  >
                    Free Download
                  </button>
                ) : (
                  <div className="flex w-full max-w-[220px] flex-col gap-2 [&>button]:mt-0">
                    <StorefrontCartButton
                      id={productSlug}
                      name={product.name}
                      type={product.type}
                      price={product.price}
                      href={productPath}
                    />
                    <StorefrontCartButton
                      id={productSlug}
                      name={product.name}
                      type={product.type}
                      price={product.price}
                      href={productPath}
                      label="Buy Now"
                      redirectTo="/cart/payment"
                      iconName="shopping-cart-plus"
                      className="!border !border-primary !bg-white !text-primary hover:!bg-accent-light"
                    />
                  </div>
                )}
              </div>
              <div className="mt-7 overflow-hidden">
                <div
                  className={`product-art ${product.art === "landing" ? "landing" : "cards"} relative grid min-h-[260px] place-items-center rounded-md p-6`}
                >
                  <div className="max-w-[68%] text-center text-[#102d55] sm:max-w-[48%]">
                    <span className="text-[8px] font-bold tracking-[.15em] text-primary">
                      TESTSTORE STUDIO
                    </span>
                    <h2 className="mt-5 text-2xl font-extrabold leading-none">
                      {product.name}
                    </h2>
                    <p className="mt-3 text-[9px] leading-4 text-slate-600">
                      {product.description}
                    </p>
                    <span className="mx-auto mt-6 block h-1.5 w-16 rounded bg-primary" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {screenshotTones.map((tone, index) => (
                    <div
                      key={tone}
                      className={`product-art ${tone} h-14 rounded border ${index === 0 ? "border-primary" : "border-border"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DarkSection title="About this product">
              <p>
                {product.description} This product is designed for practical
                daily use, with clean files, clear documentation and a workflow
                that helps you get started quickly.
              </p>
              <p>
                Download the latest version to get the newest improvements,
                creator updates and all included bonus resources.
              </p>
            </DarkSection>
            <DarkSection title="What's included">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Editable source files",
                  "Quick-start documentation",
                  "Bonus templates and checklists",
                  "Lifetime product updates",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded border border-border bg-white p-3 text-xs text-muted shadow-sm"
                  >
                    <span className="mr-2 text-primary">+</span>
                    {item}
                  </div>
                ))}
              </div>
            </DarkSection>
            <DarkSection title="Requirements and information">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Format", "PDF, ZIP"],
                  ["File size", "18.4 MB"],
                  ["License", "Single use"],
                  ["Updated", "Sep 18, 2026"],
                  ["Category", product.type],
                  ["Support", "Included"],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-divider pb-3">
                    <small className="block text-[9px] uppercase text-muted">
                      {label}
                    </small>
                    <b className="mt-1 block text-xs text-heading">{value}</b>
                  </div>
                ))}
              </div>
            </DarkSection>
            <Link
              href={`${productPath}/versions`}
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-hover"
            >
              View all product versions <span>→</span>
            </Link>
            <DarkSection title="Rate this product">
              <div className="flex flex-wrap items-center gap-5">
                <span className="text-5xl font-light text-heading">4.8</span>
                <div>
                  <div className="text-amber-500">★★★★★</div>
                  <small className="text-[9px] text-muted">
                    Based on 124 reviews
                  </small>
                </div>
                <button
                  type="button"
                  className="rounded border border-primary px-4 py-2 text-[10px] font-bold text-primary"
                >
                  Write a review
                </button>
              </div>
            </DarkSection>
            <DarkSection title="Users say">
              <div className="flex flex-wrap gap-2 text-[10px] text-muted">
                {[
                  "Easy to use and well organized",
                  "Helpful documentation",
                  "Great value for creators",
                  "Files are ready immediately",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border px-3 py-2"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </DarkSection>
            <DarkSection title="Comments">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "This product is made thoughtfully.",
                  "Very useful and visually appealing.",
                  "Good quality files and support.",
                  "Excellent product for beginners.",
                ].map((comment, index) => (
                  <article
                    key={comment}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <b className="text-xs text-heading">
                        {["Sokha P.", "Dara K.", "Maly S.", "Narin T."][index]}
                      </b>
                      <span className="text-[10px] text-amber-500">★★★★★</span>
                    </div>
                    <p className="mt-3 text-[10px] leading-5 text-muted">
                      {comment}
                    </p>
                    <small className="mt-3 block text-[9px] text-muted">
                      Verified buyer · 2 days ago
                    </small>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded border border-border py-2 text-[9px] uppercase tracking-[.12em] text-muted"
              >
                See more comments
              </button>
            </DarkSection>
          </section>

          <aside className="hidden space-y-5 lg:sticky lg:top-5 lg:block lg:self-start">
            <DarkRail title="Alternatives">
              <RailItem
                name="Mobile App UI Kit"
                detail="A complete UI kit for mobile products"
                tone="mobile"
              />
              <RailItem
                name="Dashboard UI Kit"
                detail="Modern admin screens and components"
                tone="dashboard"
              />
              <RailItem
                name="Business Card Templates"
                detail="Ready-to-edit professional designs"
                tone="cards"
              />
              <RailItem
                name="The Ultimate Design"
                detail="A practical guide for creators"
                tone="book"
              />
            </DarkRail>
            <DarkRail title="App stores">
              <RailItem
                name="Creator Marketplace"
                detail="Explore more digital products"
                tone="landing"
              />
              <RailItem
                name="Free downloads"
                detail="Useful products at no cost"
                tone="mobile"
              />
              <RailItem
                name="Top sellers"
                detail="Discover verified creators"
                tone="course"
              />
            </DarkRail>
            <DarkRail title="Discover tools">
              <RailItem
                name="Templates"
                detail="Build faster with ready-made files"
                tone="cards"
              />
              <RailItem
                name="eBooks"
                detail="Learn from practical guides"
                tone="book"
              />
              <RailItem
                name="Creator support"
                detail="Help when you need it"
                tone="dashboard"
              />
            </DarkRail>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function DarkSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-divider pt-6">
      <h2 className="text-base font-bold text-heading">{title}</h2>
      <div className="mt-3 space-y-3 text-[11px] leading-6 text-muted">
        {children}
      </div>
    </section>
  );
}
function DarkRail({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <h2 className="border-l-2 border-primary pl-2 text-sm font-bold text-heading">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}
function RailItem({
  name,
  detail,
  tone,
}: {
  name: string;
  detail: string;
  tone: string;
}) {
  return (
    <Link href="#" className="flex gap-3 rounded p-1 hover:bg-accent-light">
      <span
        className={`product-art ${tone} grid h-10 w-10 shrink-0 place-items-center rounded text-[9px] font-bold text-white`}
      >
        {name.charAt(0)}
      </span>
      <span className="min-w-0">
        <b className="block truncate text-[10px] text-heading">{name}</b>
        <small className="mt-1 block text-[9px] leading-4 text-muted">
          {detail}
        </small>
      </span>
    </Link>
  );
}
