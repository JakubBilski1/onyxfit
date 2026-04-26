import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-[12px] uppercase tracking-[0.2em] font-medium",
    "transition-[background-color,color,border-color,box-shadow,transform]",
    "duration-200 ease-onyx-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onyx-amber/60 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-bg",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97] select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-onyx-bone text-onyx-ink hover:bg-onyx-amber hover:shadow-onyx-soft",
        ghost:
          "bg-transparent text-onyx-bone border border-onyx-line hover:border-onyx-line2 hover:bg-onyx-bone/[0.04]",
        signal:
          "bg-onyx-amber text-onyx-ink hover:brightness-110 hover:shadow-onyx-glow",
        outline:
          "border border-onyx-line2 bg-transparent text-onyx-bone hover:border-onyx-amber hover:text-onyx-amber",
        danger:
          "bg-onyx-red/10 text-onyx-red border border-onyx-red/30 hover:bg-onyx-red hover:text-white",
        link:
          "text-onyx-amber hover:underline underline-offset-4 px-0 tracking-normal active:scale-100",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-5",
        lg: "h-12 px-6 text-[13px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
