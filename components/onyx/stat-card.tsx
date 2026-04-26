import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "violet" | "emerald" | "rose" | "sky";

const toneStyles: Record<
  Tone,
  { ring: string; text: string; iconBg: string; bar: string }
> = {
  neutral: {
    ring: "border-line",
    text: "text-fg",
    iconBg: "bg-fg/[.06] text-fg-2",
    bar: "from-fg-3 to-fg-3",
  },
  primary: {
    ring: "border-primary/30",
    text: "text-primary",
    iconBg: "bg-primary/15 text-primary",
    bar: "from-primary to-primary/40",
  },
  violet: {
    ring: "border-violet/30",
    text: "text-violet",
    iconBg: "bg-violet/15 text-violet",
    bar: "from-violet to-violet/40",
  },
  emerald: {
    ring: "border-emerald/30",
    text: "text-emerald",
    iconBg: "bg-emerald/15 text-emerald",
    bar: "from-emerald to-emerald/40",
  },
  rose: {
    ring: "border-rose/30",
    text: "text-rose",
    iconBg: "bg-rose/15 text-rose",
    bar: "from-rose to-rose/40",
  },
  sky: {
    ring: "border-sky/30",
    text: "text-sky",
    iconBg: "bg-sky/15 text-sky",
    bar: "from-sky to-sky/40",
  },
};

export function StatCard({
  label,
  value,
  hint,
  trend,
  tone = "neutral",
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: { direction: "up" | "down" | "flat"; value: string };
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}) {
  const t = toneStyles[tone];
  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;
  const trendColor =
    trend?.direction === "up"
      ? "text-emerald"
      : trend?.direction === "down"
        ? "text-rose"
        : "text-fg-3";

  return (
    <div
      className={cn(
        "onyx-card onyx-elevate relative overflow-hidden p-6 flex flex-col gap-5 min-h-[170px]",
        className,
      )}
    >
      {/* top accent bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r opacity-80",
          t.bar,
        )}
      />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-fg-3">
          {label}
        </span>
        {icon ? (
          <span
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-md",
              t.iconBg,
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="text-[40px] md:text-[44px] font-semibold tracking-tight leading-none text-fg tabular-nums">
          {value}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-[12px] font-medium", trendColor)}>
            <TrendIcon size={13} strokeWidth={2} />
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {hint && <p className="text-[12.5px] text-fg-2 leading-relaxed">{hint}</p>}
    </div>
  );
}
