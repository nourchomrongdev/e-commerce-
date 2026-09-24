import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import StorefrontCartButton from "@/components/StorefrontCartButton";
import ProductBreadcrumbs from "@/components/ProductBreadcrumbs";

type Props = {
  params: Promise<{ storefrontName: string; productSlug: string }>;
};
type Product = {
  name: string;
  type: string;
  price: string;
  oldPrice: string;
  description: string;
  art: string;
  isFree?: boolean;
};
const catalog: Record<string, Product> = {
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

const previewImages: Record<string, string> = {
  business:
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=85",
  landing:
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=85",
  mobile:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85",
  cards:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85",
  book:
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=85",
  dashboard:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
  course:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85",
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
  const tones = ["landing", "mobile", "cards", "book", "dashboard", "course"];

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
          <section className="min-w-0 overflow-hidden border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-primary">
                    {product.type} / Digital product
                  </p>
                  <h1 className="mt-1 text-[30px] font-extrabold leading-tight tracking-tight text-heading sm:text-4xl">
                    {product.name}
                  </h1>
                  <Link
                    href={basePath}
                    className="mt-1 inline-flex text-xs font-semibold text-primary no-underline hover:text-primary-hover"
                  >
                    by {seller}
                  </Link>
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
              <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-divider py-4 text-[10px] text-muted">
                <span>Secure delivery</span>
                <span className="h-3 w-px bg-border" />
                <span>Instant access</span>
                <span className="h-3 w-px bg-border" />
                <span>Verified creator</span>
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
                  <Link
                    href={productPath}
                    className="flex h-11 w-full max-w-[220px] items-center justify-center rounded-md bg-primary px-5 text-xs font-bold text-white no-underline"
                  >
                    Free Download
                  </Link>
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
              <div className="mt-7 -mx-5 overflow-hidden sm:-mx-6">
                <div
                  className="product-art relative aspect-video min-h-0 w-full overflow-hidden rounded-none"
                >
                  <img
                    src={previewImages[product.art] ?? previewImages.cards}
                    alt={`${product.name} preview`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-6">
                  {tones.map((tone, index) => (
                    <div
                      key={tone}
                      className={`product-art aspect-video h-auto w-full overflow-hidden rounded border ${index === 0 ? "border-primary" : "border-border"}`}
                    >
                      <img
                        src={previewImages[tone] ?? previewImages.cards}
                        alt={`${tone} preview`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DetailContent product={product} productPath={productPath} />
          </section>
          <aside className="hidden space-y-5 lg:sticky lg:top-5 lg:block lg:self-start">
            <Rail
              title="Alternatives"
              storefrontPath={basePath}
              storefrontName={seller}
              items={[
                [
                  "Mobile App UI Kit",
                  "A complete UI kit for mobile products",
                  "mobile",
                ],
                [
                  "Dashboard UI Kit",
                  "Modern admin screens and components",
                  "dashboard",
                ],
                [
                  "Business Card Templates",
                  "Ready-to-edit professional designs",
                  "cards",
                ],
                [
                  "The Ultimate Design",
                  "A practical guide for creators",
                  "book",
                ],
              ]}
            />
            <Rail
              title="App stores"
              storefrontPath={basePath}
              storefrontName={seller}
              items={[
                [
                  "Creator Marketplace",
                  "Explore more digital products",
                  "landing",
                ],
                ["Free downloads", "Useful products at no cost", "mobile"],
                ["Top sellers", "Discover verified creators", "course"],
              ]}
            />
            <Rail
              title="Discover tools"
              storefrontPath={basePath}
              storefrontName={seller}
              items={[
                ["Templates", "Build faster with ready-made files", "cards"],
                ["eBooks", "Learn from practical guides", "book"],
                ["Creator support", "Help when you need it", "dashboard"],
              ]}
            />
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function DetailContent({
  product,
  productPath,
}: {
  product: Product;
  productPath: string;
}) {
  return (
    <>
      <Section title="About this product">
        <p>
          {product.description} This product is designed for practical daily
          use, with clean files, clear documentation and a workflow that helps
          you get started quickly.
        </p>
        <p>
          Download the latest version to get the newest improvements, creator
          updates and all included bonus resources.
        </p>
      </Section>
      <Section title="What's included">
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
      </Section>
      <Section title="Requirements and information">
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
      </Section>
      <Link
        href={`${productPath}/versions`}
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-hover"
      >
        View all product versions <span>→</span>
      </Link>
      <Section title="Rate this product">
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
      </Section>
    </>
  );
}
function Section({
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
function Rail({
  title,
  items,
  storefrontPath,
  storefrontName,
}: {
  title: string;
  items: [string, string, string][];
  storefrontPath: string;
  storefrontName: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <h2 className="border-l-2 border-primary pl-2 text-sm font-bold text-heading">
        {title}
      </h2>
      <div className="mt-4 space-y-3">
        {items.map(([name, detail, tone]) => (
          <Link
            href="#"
            key={name}
            className="block rounded p-1 no-underline hover:bg-accent-light"
          >
            <span
              className="product-art mx-auto block aspect-video w-[92%] overflow-hidden rounded"
            >
              <img
                src={previewImages[tone] ?? previewImages.cards}
                alt={`${name} preview`}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="mt-2 block min-w-0">
              <b className="block truncate text-[10px] text-heading">{name}</b>
              <Link
                href={storefrontPath}
                className="mt-1 block text-[8px] font-semibold text-primary no-underline hover:text-primary-hover"
              >
                by {storefrontName}
              </Link>
              <small className="mt-1 block text-[9px] leading-4 text-muted">
                {detail}
              </small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
