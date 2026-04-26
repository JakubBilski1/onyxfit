import { AlertTriangle, Sparkles } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";

export function FlagTile({
  kind,
  title,
  detail,
  client,
  occurredAt,
  rule,
}: {
  kind: "red" | "green";
  title: string;
  detail?: string | null;
  client: string;
  occurredAt: string;
  rule: string;
}) {
  const Icon = kind === "red" ? AlertTriangle : Sparkles;
  const accent = kind === "red"
    ? { bg: "bg-rose/10", text: "text-rose", border: "border-l-rose" }
    : { bg: "bg-emerald/10", text: "text-emerald", border: "border-l-emerald" };

  return (
    <article
      className={cn(
        "border-l-2 pl-5 pr-4 py-4 hover:bg-fg/[.02] transition-colors",
        accent.border,
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            accent.bg,
            accent.text,
          )}
        >
          <Icon size={11} strokeWidth={2} />
          {kind === "red" ? "Red flag" : "Green flag"}
        </div>
        <span className="text-[11px] text-fg-3">{formatRelative(occurredAt)}</span>
      </div>
      <h3 className="text-[15px] font-medium text-fg leading-snug">{title}</h3>
      {detail && (
        <p className="text-[13px] text-fg-2 leading-relaxed mt-1">{detail}</p>
      )}
      <div className="mt-3 flex items-center gap-2 text-[11.5px] text-fg-3">
        <span className="font-medium text-fg-2">{client}</span>
        <span>·</span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]">
          {rule.replace(/_/g, " ")}
        </span>
      </div>
    </article>
  );
}
