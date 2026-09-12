import LegalPage from "@/components/LegalPage";

export default function PrivacyPolicyPage() {
  return <LegalPage eyebrow="Legal" title="Privacy Policy" updated="September 8, 2026" sections={[
    { title: "What we collect", paragraphs: ["We collect only information needed to create and operate an account, process purchases, deliver files, provide support, and manage creator applications. This may include your name, email address, account credentials, order details, and information you choose to provide in a form."] },
    { title: "How we use information", paragraphs: ["We use account and order information to authenticate users, deliver purchased products, prevent abuse, respond to support requests, and meet legal obligations. We do not sell personal information."] },
    { title: "Payments and service providers", paragraphs: ["Payment details are handled by the payment provider used at checkout. MarketPlace does not intentionally store complete payment card numbers. Service providers may process information only as needed to provide their service."] },
    { title: "Retention and your choices", paragraphs: ["We keep information only for as long as needed for the purposes above, including legal, accounting, security, and dispute-resolution requirements. Contact support to request access, correction, or deletion where applicable."] },
    { title: "Contact", paragraphs: ["Privacy questions can be sent to support@marketplace.com. The business owner must add the legal operator identity, address, and applicable supervisory authority before production launch."] },
  ]} />;
}
