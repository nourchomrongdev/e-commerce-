import LicenseManager from "@/components/dashboard/LicenseManager";

export default async function LicenseActivationsPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <LicenseManager view="activations" storefrontName={decodeURIComponent(storefront)} />;
}
