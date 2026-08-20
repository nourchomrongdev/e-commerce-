type AppBrandProps = {
  name?: string;
  subtitle?: string;
  className?: string;
  textClassName?: string;
  logoClassName?: string;
  showTagline?: boolean;
};

export const APP_NAME = "MarketPlace";

export default function AppBrand({
  name = APP_NAME,
  subtitle = "Digital Products Marketplace",
  className = "",
  textClassName = "",
  logoClassName = "",
  showTagline = false,
}: AppBrandProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/icon.png"
        alt={`${name} logo`}
        className={`h-10 w-10 shrink-0 rounded-lg object-cover ${logoClassName}`}
      />

      <div className="min-w-0">
        <span
          className={`block truncate font-bold tracking-tight text-slate-900 ${textClassName}`}
        >
          {name}
        </span>

        {showTagline && subtitle ? (
          <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}
