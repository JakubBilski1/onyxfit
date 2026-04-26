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
    <header
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10 pb-8 border-b border-line",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="block h-1 w-1 rounded-full bg-primary" />
            <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-tight text-fg leading-[1.05]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-fg-2">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </header>
  );
}
