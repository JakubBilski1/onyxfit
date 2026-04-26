import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] font-mono",
  {
    variants: {
      variant: {
        default: "border border-onyx-line text-onyx-mute",
        signal: "border border-onyx-amber/40 text-onyx-amber bg-onyx-amber/10",
        red: "border border-onyx-red/30 text-onyx-red bg-onyx-red/10",
        green: "border border-onyx-green/30 text-onyx-green bg-onyx-green/10",
        solid: "bg-onyx-bone text-onyx-ink",
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
