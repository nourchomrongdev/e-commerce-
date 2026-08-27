import Link from "next/link";
import PublicIcon from "./icons/PublicIcon";
import { routes } from "@/lib/routeController";

const benefits = [
  ["⚡", "Instant Download", "Get your files right away"],
  ["◆", "Secure & Safe", "DRM protected purchases"],
  ["✿", "Fair & Trusted", "Verified creators & reviews"],
];
function FloatingTile({
  label,
  detail,
  className,
}: {
  label: string;
  detail: string;
  className: string;
}) {
  return (
    <div
      className={`absolute grid h-[70px] w-[70px] place-items-center rounded-xl p-2 text-center shadow-lg ${className}`}
    >
      <span className="text-lg leading-none">{label}</span>
      <small className="text-[8px] font-semibold leading-none">{detail}</small>
    </div>
  );
}
export default function HeroSection({
  product: _product = false,
}: {
  product?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[radial-gradient(var(--color-accent-soft)_0.7px,transparent_0.7px),linear-gradient(105deg,var(--color-background),var(--color-accent-light)_58%,var(--color-accent-soft))] bg-[size:8px_8px,auto]">
      <div className="relative min-h-[285px] px-7 py-8 sm:px-10 md:min-h-[310px] md:px-12 md:py-11">
        <div className="relative z-10 max-w-[470px]">
          <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-[-1.7px] text-[#09234a] sm:text-[40px]">
            Discover. Download.
            <br />
            <span className="text-primary">Create Without Limits.</span>
          </h1>
          <p className="mt-3 max-w-[390px] text-[12px] leading-5 text-slate-500 sm:text-[13px]">
            Thousands of digital products for developers, designers, creators
            and businesses.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href={routes.digitalProducts()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[10px] font-semibold text-white no-underline shadow-sm"
            >
            Explore Products&nbsp; 
            </Link>
            <Link
              href={routes.creator.overview()}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[10px] font-semibold text-primary no-underline shadow-sm ring-1 ring-accent-soft"
            >
              <PublicIcon name="user" className="text-primary" />
              &nbsp;Become a Creator
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
            {benefits.map(([icon, title, text]) => (
              <div key={title} className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs text-primary shadow-sm">
                  {icon}
                </span>
                <span>
                  <b className="block text-[8px] text-slate-700">{title}</b>
                  <small className="block text-[7px] text-slate-400">
                    {text}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute right-1 top-0 hidden h-full w-[48%] min-[700px]:block"
        >
          <div className="absolute right-[20%] top-[12%] h-[195px] w-[160px] rotate-[7deg] rounded-2xl border-[7px] border-slate-800 bg-[#132331] p-4 shadow-2xl">
            <div className="flex gap-1">
              <i className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <i className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <div className="mt-5 space-y-3">
              <i className="block h-1 w-20 rounded bg-secondary" />
              <i className="block h-1 w-24 rounded bg-slate-500" />
              <i className="block h-1 w-16 rounded bg-accent-soft" />
              <i className="block h-1 w-24 rounded bg-secondary" />
            </div>
          </div>
          <div className="absolute bottom-[4%] right-[23%] h-[128px] w-[140px] rotate-[8deg] rounded-md bg-gradient-to-br from-secondary to-primary shadow-xl">
            <div className="absolute -top-10 left-11 h-14 w-16 rounded-t-[50%] border-x-[7px] border-t-[7px] border-[#80300b]" />
            <span className="absolute left-9 top-12 text-5xl text-white">
              <img src="/icons/cart.svg" alt="Cart" className="h-4 w-4" />
            </span>
          </div>
          <FloatingTile
            label="⌁"
            detail="UI Kit"
            className="left-[16%] top-[6%] -rotate-12 bg-secondary text-white"
          />
          <FloatingTile
            label="♬"
            detail="Music"
            className="right-[1%] top-[15%] rotate-12 bg-primary text-white"
          />
          <FloatingTile
            label="▱"
            detail="E-Book"
            className="left-[7%] top-[39%] rotate-6 bg-accent-soft text-white"
          />
          <FloatingTile
            label="▦"
            detail="Templates"
            className="left-[13%] bottom-[5%] -rotate-6 bg-secondary text-white"
          />
          <FloatingTile
            label="▧"
            detail="Stock Photos"
            className="right-[2%] bottom-[15%] rotate-6 bg-accent-light text-white"
          />
          <div className="absolute bottom-[2%] right-[27%] grid h-14 w-14 place-items-center rounded-full bg-white text-2xl text-primary shadow-lg">
            ⇩
          </div>
        </div>
      </div>
    </section>
  );
}
