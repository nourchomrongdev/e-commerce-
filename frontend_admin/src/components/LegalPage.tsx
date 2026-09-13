import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export default function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-background text-body">
      <Navbar active={null} />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="border-y border-[#e2e2ed] py-8 sm:py-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">{title}</h1>
          <p className="mt-2 text-xs text-muted">Last updated: {updated}</p>
          <div className="mt-10 space-y-0">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-[#e2e2ed] py-6 first:border-t-0 first:pt-0">
                <h2 className="text-base font-bold text-heading">{section.title}</h2>
                <div className="mt-3 space-y-2 text-sm leading-7 text-muted">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul className="list-disc space-y-1 pl-5">
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-5 border-l-2 border-primary bg-accent-light/60 p-4 text-xs leading-5 text-body">
            Questions about these policies can be sent to <a className="font-semibold text-primary underline" href="mailto:support@marketplace.com">support@marketplace.com</a>. The legal operator name, registered address, and jurisdiction must be confirmed by the business owner before launch.
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
