import LicenseManager from "@/components/dashboard/LicenseManager";

export default async function LicenseTypesPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <LicenseManager view="types" storefrontName={decodeURIComponent(storefront)} />;
}
