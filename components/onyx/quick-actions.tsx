import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export type QuickAction = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  primary?: boolean;
};

export function QuickActions({ items }: { items: QuickAction[] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={[
              "group relative onyx-card onyx-elevate p-6 flex flex-col gap-4",
              it.primary
                ? "border-onyx-amber/40 bg-onyx-amber/5 hover:bg-onyx-amber/10"
                : "",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span
                className={[
                  "inline-flex items-center justify-center h-10 w-10 border",
                  it.primary
                    ? "border-onyx-amber/50 text-onyx-amber bg-onyx-amber/10"
                    : "border-onyx-line text-onyx-bone bg-onyx-bone/5",
                  "transition-transform duration-200 group-hover:rotate-[-4deg] group-hover:scale-105",
                ].join(" ")}
              >
                <Icon size={16} strokeWidth={1.4} />
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.4}
                className="text-onyx-dim group-hover:text-onyx-amber group-hover:translate-x-1 transition-all duration-200"
              />
            </div>
            <div>
              <span className="onyx-label">{it.eyebrow}</span>
              <h3 className="text-[18px] text-onyx-bone leading-tight mt-2">
                {it.title}
              </h3>
              <p className="text-[12px] text-onyx-mute leading-relaxed mt-2">
                {it.description}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
