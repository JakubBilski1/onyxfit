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
  const tone =
    kind === "red"
      ? "border-onyx-red/40 bg-onyx-red/5 text-onyx-red"
      : "border-onyx-green/40 bg-onyx-green/5 text-onyx-green";

  return (
    <article className={cn("border-l-2 pl-5 py-4 pr-4", kind === "red" ? "border-onyx-red" : "border-onyx-green")}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] px-2 py-0.5 border", tone)}>
          <Icon size={11} strokeWidth={1.6} />
          {kind === "red" ? "Red Flag" : "Green Flag"}
        </div>
        <span className="font-mono text-[10px] text-onyx-dim">{formatRelative(occurredAt)}</span>
      </div>
      <h3 className="text-[15px] text-onyx-bone leading-snug">{title}</h3>
      {detail && <p className="text-[13px] text-onyx-mute leading-relaxed mt-1">{detail}</p>}
      <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-onyx-dim">
        <span>{client}</span>
        <span>•</span>
        <span className="uppercase tracking-widest">{rule.replace(/_/g, " ")}</span>
      </div>
    </article>
  );
}
