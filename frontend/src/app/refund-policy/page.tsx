import LegalPage from "@/components/LegalPage";

export default function RefundPolicyPage() {
  return <LegalPage eyebrow="Purchases" title="Refund Policy" updated="September 8, 2026" sections={[
    { title: "Digital products", paragraphs: ["Because digital products may be delivered immediately, refund eligibility depends on the product licence, the reason for the request, applicable consumer law, and whether the file has been accessed or downloaded. This policy does not limit mandatory consumer rights."] },
    { title: "When to contact us", paragraphs: ["Contact support@marketplace.com as soon as possible if a file is corrupted, materially different from its description, duplicated, or unavailable after payment. Include the order reference and a short description of the issue."] },
    { title: "Review process", paragraphs: ["We may ask for information needed to verify the order and investigate the issue. Approved refunds are returned through the original payment method where possible; processing time depends on the payment provider."] },
    { title: "Creator responsibility", paragraphs: ["Creators must provide accurate product information and respond to legitimate product-access or quality issues. Repeated problems may result in product review or removal."] },
  ]} />;
}
