import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-display text-xl font-bold tracking-tight", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary text-white shadow-lg shadow-accent/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 19V5l14 14V5" />
        </svg>
      </span>
      <span>
        Nexis<span className="text-gradient">X</span>
      </span>
    </span>
  );
}
