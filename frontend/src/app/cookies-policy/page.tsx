import LegalPage from "@/components/LegalPage";

export default function CookiesPolicyPage() {
  return <LegalPage eyebrow="Privacy" title="Cookies Policy" updated="September 8, 2026" sections={[
    { title: "Necessary cookies", paragraphs: ["Necessary browser storage may be used for sign-in state, security, preferences, and the operation of the shopping experience. These technologies are required for core features."] },
    { title: "Optional cookies", paragraphs: ["This application does not currently load advertising or third-party analytics scripts. If optional analytics are added later, they should remain disabled until consent is provided and this policy is updated."] },
    { title: "Managing consent", paragraphs: ["Use the cookie banner to accept or decline optional cookies. You can also clear the site's stored consent value in your browser settings. Blocking necessary storage may prevent sign-in or checkout from working."] },
    { title: "Contact", paragraphs: ["Questions about cookies can be sent to support@marketplace.com."] },
  ]} />;
}
