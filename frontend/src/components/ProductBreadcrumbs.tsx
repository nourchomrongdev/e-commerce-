import Link from "next/link";

type ProductBreadcrumbsProps = {
  productName: string;
  productPath: string;
  current?: string;
};

export default function ProductBreadcrumbs({ productName, productPath, current }: ProductBreadcrumbsProps) {
  const itemClass = "text-[10px] font-medium leading-5 text-primary transition hover:text-primary-hover";
  const separatorClass = "text-[10px] font-medium text-storefront-blue";

  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
    <Link href="/marketplace" className={itemClass}>Marketplace</Link>
    <span className={separatorClass}>/</span>
    <Link href={productPath} className={itemClass}>{productName}</Link>
    {current && <><span className={separatorClass}>/</span><span aria-current="page" className="text-[10px] font-medium leading-5 text-muted">{current}</span></>}
  </nav>;
}
