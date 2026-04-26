import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "violet" | "emerald" | "sky";

export type QuickAction = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: Tone;
  primary?: boolean;
};

const toneStyles: Record<
  Tone,
  { iconBg: string; iconText: string; ring: string; bg: string; arrow: string }
> = {
  primary: {
    iconBg: "bg-primary/15",
    iconText: "text-primary",
    ring: "hover:border-primary/50",
    bg: "hover:bg-primary/[.04]",
    arrow: "group-hover:text-primary",
  },
  violet: {
    iconBg: "bg-violet/15",
    iconText: "text-violet",
    ring: "hover:border-violet/50",
    bg: "hover:bg-violet/[.04]",
    arrow: "group-hover:text-violet",
  },
  emerald: {
    iconBg: "bg-emerald/15",
    iconText: "text-emerald",
    ring: "hover:border-emerald/50",
    bg: "hover:bg-emerald/[.04]",
    arrow: "group-hover:text-emerald",
  },
  sky: {
    iconBg: "bg-sky/15",
    iconText: "text-sky",
    ring: "hover:border-sky/50",
    bg: "hover:bg-sky/[.04]",
    arrow: "group-hover:text-sky",
  },
};

export function QuickActions({ items }: { items: QuickAction[] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 onyx-stagger">
      {items.map((it) => {
        const Icon = it.icon;
        const tone = it.tone ?? "primary";
        const t = toneStyles[tone];
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "group relative onyx-card onyx-elevate p-6 flex flex-col gap-5",
              "transition-all duration-300 ease-out-expo",
              t.ring,
              t.bg,
              it.primary && "ring-1 ring-primary/20",
            )}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "inline-flex items-center justify-center h-12 w-12 rounded-xl",
                  "transition-transform duration-300 ease-back",
                  "group-hover:scale-110 group-hover:-rotate-6",
                  t.iconBg,
                  t.iconText,
                )}
              >
                <Icon size={20} strokeWidth={1.6} />
              </span>
              {it.primary && (
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30">
                  Suggested
                </span>
              )}
            </div>

            <div>
              <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3">
                {it.eyebrow}
              </span>
              <h3 className="text-[18px] font-semibold tracking-tight text-fg mt-1.5">
                {it.title}
              </h3>
              <p className="text-[13px] text-fg-2 leading-relaxed mt-2">
                {it.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-fg-3 mt-auto">
              <span className={cn("transition-colors", t.arrow)}>Open</span>
              <ArrowRight
                size={14}
                strokeWidth={2}
                className={cn(
                  "transition-all duration-300 ease-out-expo",
                  "group-hover:translate-x-1.5",
                  t.arrow,
                )}
              />
            </div>
          </Link>
        );
      })}
    </section>
  );
}
