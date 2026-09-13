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
      className={`absolute grid h-[74px] w-[74px] place-items-center rounded-xl p-2 text-center shadow-[0_10px_20px_rgba(15,23,42,.10)] ${className}`}
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
    <section className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(var(--color-accent-soft)_0.75px,transparent_0.75px),linear-gradient(105deg,#fffaf6,#fff0e4_72%,#ffd7b5)] bg-[size:8px_8px,auto]">
      <div className="relative min-h-[390px] px-7 py-10 sm:px-10 md:min-h-[420px] md:px-14 md:py-14">
        <div className="relative z-10 max-w-[550px]">
          <h1 className="text-[42px] font-extrabold leading-[1.02] tracking-[-2px] text-[#09234a] sm:text-[54px] lg:text-[60px]">
            Discover. Download.
            <br />
            <span className="text-primary">Create Without Limits.</span>
          </h1>
          <p className="mt-5 max-w-[440px] text-[13px] leading-5 text-[#52627b] sm:text-[15px]">
            Browse digital products for developers, designers, creators and businesses.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={routes.digitalProducts()}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[11px] font-semibold text-white no-underline shadow-sm transition hover:bg-primary-hover"
            >
            Explore Products&nbsp; 
            </Link>
            <Link
              href={routes.programs.creatorProgram()}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-[11px] font-semibold text-primary no-underline shadow-sm ring-1 ring-accent-soft transition hover:bg-orange-50"
            >
              <PublicIcon name="user" className="text-primary" />
              &nbsp;Become a Creator
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {benefits.map(([icon, title, text]) => (
              <div key={title} className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm text-primary shadow-sm">
                  {icon}
                </span>
                <span>
                  <b className="block text-[9px] text-slate-700">{title}</b>
                  <small className="block text-[8px] text-slate-400">
                    {text}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 hidden h-full w-[52%] min-[700px]:block"
        >
          <div className="absolute right-[18%] top-[10%] h-[245px] w-[205px] rotate-[7deg] rounded-[22px] border-[8px] border-[#132331] bg-[#132331] p-5 shadow-2xl">
            <div className="flex gap-1">
              <i className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <i className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <div className="mt-8 space-y-4">
              <i className="block h-1.5 w-28 rounded bg-secondary" />
              <i className="block h-1.5 w-32 rounded bg-slate-500" />
              <i className="block h-1.5 w-24 rounded bg-accent-soft" />
              <i className="block h-1.5 w-32 rounded bg-secondary" />
            </div>
          </div>
          <div className="absolute bottom-[2%] right-[20%] h-[160px] w-[175px] rotate-[8deg] rounded-lg bg-gradient-to-br from-secondary to-primary shadow-xl">
            <div className="absolute -top-12 left-14 h-16 w-20 rounded-t-[50%] border-x-[8px] border-t-[8px] border-[#80300b]" />
            <span className="absolute left-12 top-16 text-5xl text-white">
              <img src="/icons/cart.svg" alt="Cart" className="h-6 w-6" />
            </span>
          </div>
          <FloatingTile
            label="⌁"
            detail="UI Kit"
            className="left-[8%] top-[5%] -rotate-12 bg-secondary text-white"
          />
          <FloatingTile
            label="♬"
            detail="Music"
            className="right-[0%] top-[14%] rotate-12 bg-primary text-white"
          />
          <FloatingTile
            label="▱"
            detail="E-Book"
            className="left-[2%] top-[39%] rotate-6 bg-accent-soft text-white"
          />
          <FloatingTile
            label="▦"
            detail="Templates"
            className="left-[10%] bottom-[3%] -rotate-6 bg-secondary text-white"
          />
          <FloatingTile
            label="▧"
            detail="Stock Photos"
            className="right-[0%] bottom-[15%] rotate-6 bg-accent-light text-white"
          />
          <div className="absolute bottom-[0%] right-[26%] grid h-16 w-16 place-items-center rounded-full bg-white text-3xl text-primary shadow-lg">
            ⇩
          </div>
        </div>
      </div>
    </section>
  );
}
