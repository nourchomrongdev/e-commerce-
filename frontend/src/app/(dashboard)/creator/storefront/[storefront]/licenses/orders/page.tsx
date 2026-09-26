import LicenseManager from "@/components/dashboard/LicenseManager";

export default async function LicenseOrdersPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <LicenseManager view="orders" storefrontName={decodeURIComponent(storefront)} />;
}
