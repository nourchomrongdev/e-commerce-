import LicenseManager from "@/components/dashboard/LicenseManager";

export default async function RevokedLicensesPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <LicenseManager view="revoked" storefrontName={decodeURIComponent(storefront)} />;
}
