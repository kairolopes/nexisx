import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/10 text-primary",
        secondary: "border-secondary/15 bg-secondary/10 text-secondary",
        accent: "border-accent/15 bg-accent/10 text-accent",
        outline: "border-border text-foreground",
        success: "border-emerald-600/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        warning: "border-amber-600/15 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        danger: "border-destructive/15 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
