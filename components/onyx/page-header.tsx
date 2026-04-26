import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-end justify-between gap-8 pb-10 border-b border-onyx-line", className)}>
      <div>
        {eyebrow && (
          <div className="onyx-label mb-4 flex items-center gap-3">
            <span className="block h-px w-8 bg-onyx-amber" />
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="onyx-display text-[clamp(40px,5vw,76px)] text-onyx-bone">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-onyx-mute">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
