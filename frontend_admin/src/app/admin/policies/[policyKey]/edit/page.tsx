import { notFound } from "next/navigation";
import AdminPolicyPage, { type AdminPolicyKey } from "@/components/dashboard/admin/AdminPolicyPage";

const policyKeys: AdminPolicyKey[] = ["privacy", "terms", "refunds", "cookies", "acceptable-use"];

export default async function EditAdminPolicyPage({ params }: { params: Promise<{ policyKey: string }> }) {
  const { policyKey } = await params;
  if (!policyKeys.includes(policyKey as AdminPolicyKey)) notFound();
  return <AdminPolicyPage policyKey={policyKey as AdminPolicyKey} editorPage />;
}
