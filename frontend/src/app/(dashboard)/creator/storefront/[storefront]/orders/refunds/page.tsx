import CreatorActivityManager from "@/components/dashboard/creator/CreatorActivityManager";

export default async function RefundRequestsPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <CreatorActivityManager view="refunds" storefrontName={decodeURIComponent(storefront)} />;
}
