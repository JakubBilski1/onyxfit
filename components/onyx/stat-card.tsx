import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  trend,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: { direction: "up" | "down" | "flat"; value: string };
  className?: string;
}) {
  const trendColor =
    trend?.direction === "up"
      ? "text-onyx-green"
      : trend?.direction === "down"
        ? "text-onyx-red"
        : "text-onyx-mute";
  const trendGlyph =
    trend?.direction === "up" ? "▲" : trend?.direction === "down" ? "▼" : "—";

  return (
    <div className={cn("onyx-card p-7 flex flex-col justify-between min-h-[180px]", className)}>
      <div className="flex items-center justify-between">
        <span className="onyx-label">{label}</span>
        {trend && (
          <span className={cn("font-mono text-[10px] tracking-widest", trendColor)}>
            {trendGlyph} {trend.value}
          </span>
        )}
      </div>
      <div className="onyx-kpi text-onyx-bone mt-4">{value}</div>
      {hint && <p className="mt-3 text-[12px] text-onyx-mute">{hint}</p>}
    </div>
  );
}
