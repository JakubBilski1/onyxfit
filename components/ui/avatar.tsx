import { cn, initials } from "@/lib/utils";

const GRADIENTS = [
  "from-primary to-violet",
  "from-violet to-sky",
  "from-emerald to-sky",
  "from-rose to-primary",
  "from-sky to-violet",
];

function pickGradient(seed?: string | null) {
  if (!seed) return GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

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
        className={cn(
          "rounded-full object-cover ring-1 ring-line",
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }
  const gradient = pickGradient(name);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-br text-primary-fg font-semibold tracking-tight",
        gradient,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {initials(name)}
    </span>
  );
}
