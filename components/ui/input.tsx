import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full bg-transparent border-b border-onyx-line text-onyx-bone placeholder:text-onyx-dim",
        "px-0 focus:outline-none focus:border-onyx-amber transition-colors",
        "text-[14px]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full bg-transparent border border-onyx-line text-onyx-bone placeholder:text-onyx-dim",
      "p-3 focus:outline-none focus:border-onyx-amber transition-colors text-[14px]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = ({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={cn("onyx-label block mb-2", className)}>
    {children}
  </label>
);
