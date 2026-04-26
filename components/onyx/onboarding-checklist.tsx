import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe,
  Hammer,
  Tag,
  UserCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistStep = {
  key: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  done: boolean;
};

/**
 * Build the 5-step setup checklist from the live state of the coach's
 * profile + roster. Each step's `done` is derived purely from the DB,
 * so the user can't fake-complete one — they must actually finish the
 * action. Returns null when 5/5 (caller should hide the section).
 */
export function buildCoachChecklist(input: {
  cp: {
    slug?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    specializations?: unknown;
    monthly_rate_cents?: number | null;
    is_public?: boolean | null;
  } | null;
  programCount: number;
  clientCount: number;
}): ChecklistStep[] {
  const cp = input.cp ?? {};
  const specs = Array.isArray((cp as any).specializations)
    ? ((cp as any).specializations as unknown[])
    : [];

  return [
    {
      key: "identity",
      icon: UserCircle,
      title: "Add your photo, handle and bio",
      description:
        "Athletes browse coaches by face and a 2-sentence pitch. Take 90 seconds.",
      href: "/dashboard/profile",
      cta: "Open storefront",
      done: Boolean(cp.avatar_url && cp.bio && cp.slug),
    },
    {
      key: "positioning",
      icon: Tag,
      title: "Set specializations and your monthly rate",
      description:
        "Tag what you actually coach (powerlifting, fat-loss, post-partum…) and price it.",
      href: "/dashboard/profile",
      cta: "Edit positioning",
      done: specs.length >= 1 && cp.monthly_rate_cents != null,
    },
    {
      key: "program",
      icon: Hammer,
      title: "Build your first program template",
      description:
        "A starter template you can hand to every new athlete with one click.",
      href: "/dashboard/forge",
      cta: "Open Forge",
      done: input.programCount >= 1,
    },
    {
      key: "client",
      icon: UserPlus,
      title: "Invite your first athlete",
      description:
        "Send the onboarding link — medical, injury history and consent are baked in.",
      href: "/dashboard/clients",
      cta: "Invite athlete",
      done: input.clientCount >= 1,
    },
    {
      key: "publish",
      icon: Globe,
      title: "Publish your public storefront",
      description:
        "Flip the visibility switch so prospects can find you at /c/your-handle.",
      href: "/dashboard/profile",
      cta: "Publish",
      done: Boolean(cp.is_public),
    },
  ];
}

export function OnboardingChecklist({ steps }: { steps: ChecklistStep[] }) {
  const total = steps.length;
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / total) * 100);

  if (done === total) return null;

  return (
    <section className="onyx-aurora relative rounded-2xl border border-line bg-card overflow-hidden p-7 md:p-10 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
        <div>
          <span className="inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3 mb-3">
            <span className="block h-1 w-1 rounded-full bg-primary" />
            Setup checklist
          </span>
          <h2 className="text-[28px] md:text-[32px] font-semibold tracking-tight text-fg leading-[1.05] max-w-2xl">
            {done === 0 ? (
              <>
                Welcome — let&apos;s get your console{" "}
                <span className="text-gradient-brand">ready</span>.
              </>
            ) : (
              <>
                You&apos;re{" "}
                <span className="text-gradient-brand">
                  {total - done} step{total - done === 1 ? "" : "s"}
                </span>{" "}
                from a complete setup.
              </>
            )}
          </h2>
          <p className="text-[14px] text-fg-2 mt-2 max-w-xl leading-relaxed">
            Each task unlocks a real part of the platform — finish them in any order.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[44px] font-semibold tracking-tight tabular-nums text-fg leading-none">
            {done}
            <span className="text-fg-3">/{total}</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3 mt-1.5">
            {pct}% complete
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-card-2 rounded-full overflow-hidden mb-7 border border-line">
        <div
          className="h-full bg-gradient-to-r from-primary to-violet transition-[width] duration-700 ease-out-expo"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>

      {/* Steps */}
      <ul className="space-y-2.5">
        {steps.map((s, i) => (
          <ChecklistRow key={s.key} step={s} index={i + 1} />
        ))}
      </ul>
    </section>
  );
}

function ChecklistRow({
  step,
  index,
}: {
  step: ChecklistStep;
  index: number;
}) {
  const Icon = step.icon;
  return (
    <li>
      <Link
        href={step.href}
        className={cn(
          "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ease-out-expo",
          step.done
            ? "border-emerald/30 bg-emerald/[.05] hover:bg-emerald/[.08]"
            : "border-line bg-card-2/40 hover:border-primary/50 hover:bg-primary/[.04] hover:shadow-soft hover:translate-x-0.5",
        )}
      >
        {/* Numbered status pill */}
        <span
          className={cn(
            "shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-full text-[12px] font-semibold transition-all duration-200",
            step.done
              ? "bg-emerald text-white shadow-soft"
              : "bg-card border border-line-strong text-fg-2 group-hover:border-primary group-hover:text-primary",
          )}
        >
          {step.done ? (
            <Check size={16} strokeWidth={3} className="animate-scale-in" />
          ) : (
            index
          )}
        </span>

        {/* Themed icon */}
        <span
          className={cn(
            "hidden sm:inline-flex shrink-0 items-center justify-center h-10 w-10 rounded-lg transition-colors",
            step.done
              ? "bg-emerald/15 text-emerald"
              : "bg-fg/[.05] text-fg-2 group-hover:bg-primary/15 group-hover:text-primary",
          )}
        >
          <Icon size={18} strokeWidth={1.6} />
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-[14.5px] font-medium transition-colors",
              step.done
                ? "text-fg-2 line-through decoration-fg-3 decoration-1"
                : "text-fg",
            )}
          >
            {step.title}
          </div>
          <div className="text-[12.5px] text-fg-3 mt-0.5 leading-relaxed">
            {step.description}
          </div>
        </div>

        {/* CTA — only when undone */}
        {!step.done && (
          <span className="hidden md:inline-flex items-center gap-1.5 shrink-0 text-[12.5px] font-medium text-fg-2 group-hover:text-primary transition-colors">
            {step.cta}
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        )}
        {step.done && (
          <span className="hidden md:inline-flex items-center gap-1.5 shrink-0 text-[11px] font-mono uppercase tracking-[0.22em] text-emerald">
            Done
          </span>
        )}
      </Link>
    </li>
  );
}
