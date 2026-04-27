"use client";

import { Lock } from "lucide-react";
import type { ReactNode } from "react";

export type LaptopVariant =
  | "hero"
  | "tilt-right"
  | "tilt-left"
  | "flat"
  | "floating";

const TILT: Record<LaptopVariant, string> = {
  hero: "perspective(2400px) rotateX(8deg) rotateY(-6deg)",
  "tilt-right": "perspective(2400px) rotateY(-6deg)",
  "tilt-left": "perspective(2400px) rotateY(6deg)",
  flat: "none",
  floating: "perspective(2400px) rotateY(-4deg)",
};

export function LaptopFrame({
  variant = "flat",
  url = "/",
  glow = false,
  className,
  children,
}: {
  variant?: LaptopVariant;
  url?: string;
  glow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        style={{ transform: TILT[variant], transformStyle: "preserve-3d" }}
        className="rounded-[20px] bg-card-2 border border-line p-2 shadow-lift transition-transform duration-500"
      >
        <div className="rounded-md overflow-hidden bg-bg">
          {/* Browser chrome */}
          <div className="h-9 flex items-center gap-2 px-4 bg-card border-b border-line">
            <span className="h-3 w-3 rounded-full bg-rose" aria-hidden />
            <span className="h-3 w-3 rounded-full bg-primary" aria-hidden />
            <span className="h-3 w-3 rounded-full bg-emerald" aria-hidden />
            <div className="ml-4 flex-1 max-w-md mx-auto h-6 rounded-full bg-bg/60 border border-line flex items-center px-3 text-[11px] font-mono text-fg-3 truncate">
              <Lock className="mr-2 h-3 w-3 flex-shrink-0" />
              <span className="truncate">app.onyxcoach.com{url}</span>
            </div>
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-violet" aria-hidden />
          </div>
          {/* Screen */}
          <div className="aspect-[16/10] bg-bg overflow-hidden">{children}</div>
        </div>
      </div>
      {/* Laptop base */}
      <div
        aria-hidden
        className="-mt-1 mx-auto h-2 w-[102%] -ml-[1%] rounded-b-[16px] bg-gradient-to-b from-line-strong to-bg"
      />
      {/* Floor shadow */}
      <div
        aria-hidden
        className="absolute inset-x-10 -bottom-8 h-10 bg-black/50 blur-3xl"
      />
      {glow && (
        <div
          aria-hidden
          className="absolute -inset-10 -z-10 bg-gradient-to-tr from-primary/25 via-transparent to-violet/25 blur-3xl"
        />
      )}
    </div>
  );
}
