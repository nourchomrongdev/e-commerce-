import LicenseManager from "@/components/dashboard/LicenseManager";

export default async function LicenseRulesPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <LicenseManager view="rules" storefrontName={decodeURIComponent(storefront)} />;
}
