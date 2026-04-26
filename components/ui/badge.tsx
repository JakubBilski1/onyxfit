import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full leading-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-card-2 text-fg-2 border border-line",
        primary: "bg-primary/15 text-primary border border-primary/30",
        signal: "bg-primary/15 text-primary border border-primary/30",
        violet: "bg-violet/15 text-violet border border-violet/30",
        emerald: "bg-emerald/15 text-emerald border border-emerald/30",
        sky: "bg-sky/15 text-sky border border-sky/30",
        red: "bg-rose/15 text-rose border border-rose/30",
        green: "bg-emerald/15 text-emerald border border-emerald/30",
        solid: "bg-fg text-bg",
        muted: "bg-fg/5 text-fg-2 border border-line",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
