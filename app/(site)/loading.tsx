import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container flex flex-col items-center gap-6 pb-24 pt-40 text-center">
      <Skeleton className="h-8 w-40 rounded-full" />
      <Skeleton className="h-14 w-full max-w-3xl" />
      <Skeleton className="h-14 w-2/3 max-w-2xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-12 w-44 rounded-full" />
        <Skeleton className="h-12 w-44 rounded-full" />
      </div>
    </div>
  );
}
