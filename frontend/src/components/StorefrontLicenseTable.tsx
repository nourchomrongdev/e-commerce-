import PublicIcon from "@/components/icons/PublicIcon";

type LicenseOffer = {
  name: string;
  description: string;
  duration: string;
  devices: string;
  price?: string;
};

const defaultLicenses: LicenseOffer[] = [
  { name: "Personal License", description: "For personal use only. Non-commercial.", duration: "Lifetime", devices: "1 device", price: "$18" },
  { name: "Commercial License", description: "For commercial use and client projects.", duration: "Lifetime", devices: "5 devices", price: "$42" },
  { name: "Extended License", description: "Extended usage for multiple clients and projects.", duration: "Lifetime", devices: "Unlimited", price: "$79" },
  { name: "Educational License", description: "For educational institutions and students.", duration: "1 year", devices: "1 device", price: "$12" },
  { name: "Enterprise License", description: "For large organizations with custom terms.", duration: "Lifetime", devices: "Unlimited", price: "$149" },
];

type StorefrontLicenseTableProps = {
  licenses?: LicenseOffer[];
  compact?: boolean;
};

export default function StorefrontLicenseTable({ licenses = defaultLicenses, compact = false }: StorefrontLicenseTableProps) {
  return (
    <section className="mt-8 border-t border-divider pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-heading">License options</h2>
          <p className="mt-1 text-[11px] leading-5 text-muted">Choose the license that matches how you plan to use this product.</p>
        </div>
        <PublicIcon name="shield-check" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[680px] text-left text-[11px]">
          <thead className="bg-surface-muted text-[10px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">License</th>
              {!compact && <th className="px-4 py-3 font-semibold">Description</th>}
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Max devices</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => (
              <tr key={license.name} className="border-t border-divider text-body hover:bg-surface-hover">
                <td className="px-4 py-3 font-semibold text-heading">{license.name}</td>
                {!compact && <td className="max-w-[280px] px-4 py-3 text-muted">{license.description}</td>}
                <td className="px-4 py-3 text-muted">{license.duration}</td>
                <td className="px-4 py-3 text-muted">{license.devices}</td>
                <td className="px-4 py-3 text-right font-bold text-primary">{license.price ?? "Contact us"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
