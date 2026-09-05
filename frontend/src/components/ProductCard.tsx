export type Item = {
  name: string;
  type: string;
  icon: string;
  rating: string;
  price?: string;
};
const colors = [
  "from-accent-light to-secondary",
  "from-accent-soft to-primary",
  "from-secondary to-primary",
  "from-accent-light to-primary",
  "from-primary to-secondary",
  "from-accent-soft to-primary",
];
export default function ProductCard({
  item,
  product = false,
  index,
}: {
  item: Item;
  product?: boolean;
  index: number;
}) {
  return (
    <article
      className={`group relative flex min-w-0 gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${product ? "min-h-32" : "min-h-28"} md:block`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${colors[index]} text-xs font-bold text-white shadow-sm ${product ? "md:h-14 md:w-full md:rounded-lg" : ""}`}
      >
        {item.icon}
      </div>
      <div className="min-w-0 md:mt-2">
        <strong className="block truncate text-[11px] text-slate-900">
          {item.name}
        </strong>
        <span className="mt-0.5 block truncate text-[9px] text-slate-500">
          {item.type}
        </span>
        {product && (
          <b className="mt-1 block text-[11px] text-slate-900">{item.price}</b>
        )}
        <small className="mt-1 block text-[9px] text-slate-600">
          {item.rating} <span className="text-secondary">★</span>
        </small>
      </div>
      {product ? (
        <button className="absolute right-3 bottom-3 grid h-6 w-6 place-items-center rounded-lg bg-accent-light text-xs text-primary">
          ♧
        </button>
      ) : (
        <button className="absolute right-3 bottom-3 rounded-md border border-slate-200 px-3 py-1.5 text-[9px] font-medium text-primary hover:border-accent-soft hover:bg-accent-light md:right-3 md:left-3">
          Download
        </button>
      )}
    </article>
  );
}
