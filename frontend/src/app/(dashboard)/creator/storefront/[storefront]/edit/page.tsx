import StorefrontForm from "@/components/dashboard/StorefrontForm";

export default async function EditStorefrontPage({
  params,
}: {
  params: Promise<{ storefront: string }>;
}) {
  const { storefront } = await params;
  return <StorefrontForm mode="edit" storefrontName={storefront} />;
}
