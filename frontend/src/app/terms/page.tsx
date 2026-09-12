import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  return <LegalPage eyebrow="Legal" title="Terms and Conditions" updated="September 8, 2026" sections={[
    { title: "Using MarketPlace", paragraphs: ["You may use MarketPlace only for lawful activity and must provide accurate account information. Keep your credentials secure and do not share access to paid downloads or attempt to bypass technical controls."] },
    { title: "Products and creators", paragraphs: ["Creators are responsible for the accuracy, legality, ownership, licensing, and support of their products. Product descriptions, availability, compatibility, and updates may vary by creator."] },
    { title: "Orders and access", paragraphs: ["A purchase grants the access or licence described on the product page. It does not transfer ownership of the creator's intellectual property unless the applicable licence expressly says so."] },
    { title: "Prohibited activity", paragraphs: ["Do not upload malware, infringing material, unlawful content, deceptive claims, or content you do not have permission to distribute. We may restrict access while investigating suspected abuse or legal violations."] },
    { title: "Changes and contact", paragraphs: ["We may update these terms as the service changes. Material changes should be communicated through the service or account email. Questions can be sent to support@marketplace.com."] },
  ]} />;
}
