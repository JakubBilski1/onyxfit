import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "onyx-card flex flex-col items-center justify-center text-center px-10 py-20 onyx-forge-rail",
        className,
      )}
    >
      <span className="onyx-label">— No data —</span>
      <h3 className="onyx-display text-3xl text-onyx-bone mt-4">{title}</h3>
      {description && (
        <p className="text-[13px] text-onyx-mute mt-3 max-w-md leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
