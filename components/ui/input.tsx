import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase = [
  "w-full text-[14px] text-fg placeholder:text-fg-3",
  "bg-card border border-line rounded-md",
  "px-3.5 py-2.5",
  "transition-[border-color,box-shadow,background] duration-200 ease-out-expo",
  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-card-2",
  "disabled:opacity-50",
].join(" ");

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-11", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[88px]", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldBase, "h-11 pr-8 cursor-pointer", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export const Label = ({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={cn("block text-[12.5px] font-medium text-fg-2 mb-1.5", className)}
  >
    {children}
  </label>
);
