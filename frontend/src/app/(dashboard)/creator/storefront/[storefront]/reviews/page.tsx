import CreatorActivityManager from "@/components/dashboard/creator/CreatorActivityManager";

export default async function CustomerReviewsPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <CreatorActivityManager view="reviews" storefrontName={decodeURIComponent(storefront)} />;
}
