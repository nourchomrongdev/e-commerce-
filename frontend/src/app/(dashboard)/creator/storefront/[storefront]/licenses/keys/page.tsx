import LicenseManager from "@/components/dashboard/LicenseManager";

export default async function LicenseKeysPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <LicenseManager view="keys" storefrontName={decodeURIComponent(storefront)} />;
}
