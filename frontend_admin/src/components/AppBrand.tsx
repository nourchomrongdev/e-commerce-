type AppBrandProps = {
  name?: string;
  subtitle?: string;
  className?: string;
  textClassName?: string;
  logoClassName?: string;
  showTagline?: boolean;
};

export const APP_NAME = "KhmerDigital";

export default function AppBrand({
  name = APP_NAME,
  subtitle = "Digital Products Marketplace",
  className = "",
  textClassName = "",
  logoClassName = "",
  showTagline = false,
}: AppBrandProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/icon.png"
        alt={`${name} logo`}
        className={`h-10 w-10 shrink-0 rounded-lg object-cover bg-white ${logoClassName}`}
      />

      <div className="min-w-0">
        <span
          className={`block truncate font-extrabold uppercase tracking-[0.08em] text-primary ${textClassName || "text-[20px] sm:text-[22px]"}`}
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
