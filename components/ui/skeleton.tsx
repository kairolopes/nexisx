import { cn } from "@/lib/utils";

/**
 * Bloco de carregamento com brilho (shimmer) sutil. Respeita prefers-reduced-motion
 * (a animação é desligada globalmente via globals.css).
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted/70",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-sweep_1.8s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        "dark:before:via-white/10",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
