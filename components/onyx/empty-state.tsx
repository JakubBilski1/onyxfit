import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "onyx-card-flat flex flex-col items-center justify-center text-center px-8 py-14 onyx-forge-rail",
        className,
      )}
    >
      <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-5">
        {icon ?? <Sparkles size={20} strokeWidth={1.6} />}
      </span>
      <h3 className="text-[20px] font-semibold tracking-tight text-fg">
        {title}
      </h3>
      {description && (
        <p className="text-[13.5px] text-fg-2 mt-2 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
