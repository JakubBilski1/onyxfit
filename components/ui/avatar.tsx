import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name ?? ""}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-onyx-card border border-onyx-line text-onyx-bone font-mono text-[10px] tracking-widest",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}
