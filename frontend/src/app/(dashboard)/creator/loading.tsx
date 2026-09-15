import LoadingMessage from "@/components/dashboard/LoadingMessage";

export default function CreatorLoading() {
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
      <LoadingMessage />
    </div>
  );
}