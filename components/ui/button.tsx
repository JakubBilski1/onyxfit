import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-medium tracking-tight text-[14px]",
    "transition-[background-color,color,border-color,box-shadow,transform,filter]",
    "duration-200 ease-out-expo",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
    "rounded-md",
  ].join(" "),
  {
    variants: {
      variant: {
        // Filled brand — the obvious primary action
        primary:
          "bg-primary text-primary-fg shadow-soft hover:shadow-glow-primary hover:brightness-[1.04]",
        // Soft surface — secondary action
        default:
          "bg-card-2 text-fg border border-line hover:border-line-strong hover:bg-card",
        // Ghost — tertiary, subtle
        ghost:
          "bg-transparent text-fg-2 hover:text-fg hover:bg-fg/[.05]",
        // Outline — clear borders
        outline:
          "border border-line-strong bg-transparent text-fg hover:border-primary hover:text-primary",
        // Danger
        danger:
          "bg-rose/10 text-rose border border-rose/30 hover:bg-rose hover:text-white",
        // Link
        link:
          "text-primary hover:underline underline-offset-4 px-0 active:scale-100 rounded-none",
        // Legacy aliases preserved for existing call sites
        signal:
          "bg-primary text-primary-fg shadow-soft hover:shadow-glow-primary hover:brightness-[1.04]",
      },
      size: {
        xs: "h-7 px-2.5 text-[12px] rounded-sm",
        sm: "h-9 px-3.5 text-[13px]",
        md: "h-11 px-5",
        lg: "h-[52px] px-7 text-[15px] rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
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
