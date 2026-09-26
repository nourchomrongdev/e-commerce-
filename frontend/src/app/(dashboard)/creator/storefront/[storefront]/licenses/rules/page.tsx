import { redirect } from "next/navigation";

export default async function LicenseRulesPage({ params }: { params: Promise<{ storefront: string }> }) {
  const { storefront } = await params;
  redirect(`/creator/storefront/${encodeURIComponent(decodeURIComponent(storefront))}/licenses/types`);
}
