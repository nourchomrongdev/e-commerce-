import CreatorActivityManager from "@/components/dashboard/creator/CreatorActivityManager";

export default async function RedownloadRequestsPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <CreatorActivityManager view="redownloads" storefrontName={decodeURIComponent(storefront)} />;
}
