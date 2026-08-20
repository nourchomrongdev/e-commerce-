import PublicIcon from "@/components/icons/PublicIcon";

type ProductPaginationProps = {
  count: number;
  total: number;
  page?: number;
  pages?: number;
  onPageChange?: (page: number) => void;
};

export default function ProductPagination({ count, total, page = 1, pages = 3, onPageChange }: ProductPaginationProps) {
  return (
    <footer className="flex flex-col gap-3 border-t border-divider px-6 py-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>Showing {count} of {total} products</span>
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button type="button" aria-label="Previous page" onClick={() => onPageChange?.(page - 1)} disabled={page <= 1} className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted-faint disabled:cursor-not-allowed disabled:opacity-60 hover:border-primary hover:text-primary"><PublicIcon name="left" className="h-3 w-3" /></button>
        {Array.from({ length: pages }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} type="button" aria-current={pageNumber === page ? "page" : undefined} onClick={() => onPageChange?.(pageNumber)} className={`grid h-7 w-7 place-items-center rounded-md text-[10px] font-semibold ${pageNumber === page ? "bg-primary text-white" : "border border-border-control text-muted hover:border-primary hover:text-primary"}`}>{pageNumber}</button>)}
        <button type="button" aria-label="Next page" onClick={() => onPageChange?.(page + 1)} disabled={page >= pages} className="grid h-7 w-7 place-items-center rounded-md border border-border-control text-muted disabled:cursor-not-allowed disabled:opacity-60 hover:border-primary hover:text-primary"><PublicIcon name="right" className="h-3 w-3" /></button>
      </div>
    </footer>
  );
}
