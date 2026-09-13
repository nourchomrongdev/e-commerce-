type LoadingMessageProps = {
  label?: string;
};

export default function LoadingMessage({ label = "Loading Data" }: LoadingMessageProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-sm text-[#66718e]" role="status" aria-live="polite">
      <span className="animate-pulse">{label}</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
      </span>
    </div>
  );
}
