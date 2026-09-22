import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import { routes } from "@/lib/routeController";

export default function ContactUsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fb] text-[#142b4d]">
      <Navbar />
      <section className="border-b border-[#e5eaf3] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Contact KhmerDigital</p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-[1.05] tracking-[-0.03em] text-[#10264b] sm:text-6xl">Let&apos;s make your next step clearer.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#61738f] sm:text-lg">Whether you are looking for a product, managing an order, or building your creator storefront, our team is ready to help.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="mailto:support@marketplace.com" className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-xs font-bold text-white no-underline shadow-sm transition hover:bg-primary-hover">Email support</a><a href={routes.digitalProducts()} className="inline-flex items-center rounded-md border border-[#d9e1ed] bg-white px-5 py-3 text-xs font-bold text-[#18345d] no-underline transition hover:border-primary hover:text-primary">Browse products</a></div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-[#102b55] p-7 text-white shadow-[0_20px_60px_rgba(16,43,85,0.18)] sm:p-9"><div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[18px] border-[#ff8a35]/30" /><div className="absolute -bottom-20 -left-8 h-44 w-44 rounded-full bg-[#ff8a35]" /><div className="relative"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9cae4]">Start here</p><p className="mt-5 text-2xl font-extrabold leading-tight">support@marketplace.com</p><p className="mt-3 max-w-sm text-sm leading-6 text-[#d7e2f1]">Send us the product name, order details, or account email related to your question so we can point you in the right direction.</p><div className="mt-8 border-t border-white/15 pt-4 text-xs text-[#b9cae4]">KhmerDigital customer and creator support</div></div></div>
        </div>
      </section>
      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">How we can help</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#10264b]">Choose the path that fits.</h2></div><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="border-t-2 border-primary bg-white p-6 shadow-[0_8px_24px_rgba(20,43,77,0.05)]"><span className="text-xs font-black text-primary">01</span><h3 className="mt-8 text-lg font-extrabold text-[#10264b]">Buyer help</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">Questions about a product, payment, download, licence, or purchase history.</p></div><div className="border-t-2 border-[#8db7e7] bg-white p-6 shadow-[0_8px_24px_rgba(20,43,77,0.05)]"><span className="text-xs font-black text-[#4c79ad]">02</span><h3 className="mt-8 text-lg font-extrabold text-[#10264b]">Creator help</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">Guidance with storefronts, product files, versions, previews, or customer access.</p></div><div className="border-t-2 border-[#ffb06f] bg-white p-6 shadow-[0_8px_24px_rgba(20,43,77,0.05)]"><span className="text-xs font-black text-[#d87828]">03</span><h3 className="mt-8 text-lg font-extrabold text-[#10264b]">General questions</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">Partnerships, feedback, account questions, or anything else about KhmerDigital.</p></div></div></section>
      <section className="border-y border-[#e5eaf3] bg-white"><div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Before you write</p><h2 className="mt-2 text-2xl font-black tracking-tight text-[#10264b]">A little context helps.</h2></div><div className="grid gap-3 sm:grid-cols-2"><div className="border-l-2 border-primary bg-[#f8faff] p-5"><h3 className="font-extrabold text-[#10264b]">For an order</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">Include the product name and order or account email connected to your purchase.</p></div><div className="border-l-2 border-[#8db7e7] bg-[#f8faff] p-5"><h3 className="font-extrabold text-[#10264b]">For a product</h3><p className="mt-2 text-sm leading-6 text-[#61738f]">Include the storefront, version, file type, or screenshot that describes the issue.</p></div></div></div></section>
      <PublicFooter />
    </main>
  );
}
