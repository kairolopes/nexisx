import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Notice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300",
        className
      )}
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
