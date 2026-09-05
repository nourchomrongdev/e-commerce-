import CreatorActivityManager from "@/components/dashboard/creator/CreatorActivityManager";

export default async function DownloadActivityPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <CreatorActivityManager view="downloads" storefrontName={decodeURIComponent(storefront)} />;
}
