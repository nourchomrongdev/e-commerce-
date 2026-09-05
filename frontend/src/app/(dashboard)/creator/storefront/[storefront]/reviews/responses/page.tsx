import CreatorActivityManager from "@/components/dashboard/creator/CreatorActivityManager";

export default async function MyResponsesPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  return <CreatorActivityManager view="responses" storefrontName={decodeURIComponent(storefront)} />;
}
