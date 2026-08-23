import { redirect } from "next/navigation";

export default async function StorefrontDetailRedirect({
  params,
}: {
  params: Promise<{ storefront: string }>;
}) {
  const { storefront } = await params;
  redirect(`/creator/storefront/${encodeURIComponent(storefront)}/overview`);
}
