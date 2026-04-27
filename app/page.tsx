"use client";

import {
  AlertTriangle,
  Apple,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Crown,
  Dumbbell,
  Flame,
  Github,
  Hammer,
  Layers,
  Linkedin,
  Lock,
  Moon,
  Rocket,
  ScanLine,
  Sparkles,
  Sun,
  Target,
  Twitter,
  Users,
  Video,
  X,
} from "lucide-react";
import {
  ButtonHTMLAttributes,
  FormEvent,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { LaptopFrame } from "@/components/landing/laptop-frame";
import {
  MockAthlete,
  MockClients,
  MockForge,
  MockNutrition,
  MockTriage,
} from "@/components/landing/mocks";

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function useInView<T extends HTMLElement>(opts?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, ...opts },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [opts]);
  return { ref, inView };
}

function useCountUp(target: number, durationMs = 1400, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (typeof window !== "undefined") {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) {
        setVal(target);
        return;
      }
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, start]);
  return val;
}

/* -------------------------------------------------------------------------- */
/*                              UI Primitives                                 */
/* -------------------------------------------------------------------------- */

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[.97]";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-primary text-primary-fg shadow-[0_8px_28px_-8px_rgb(var(--c-primary)/0.55)] hover:shadow-[0_12px_36px_-6px_rgb(var(--c-primary)/0.7)] hover:brightness-105",
      ghost: "bg-transparent text-fg-2 hover:bg-card hover:text-fg",
      outline:
        "border border-line bg-transparent text-fg hover:border-primary/50 hover:text-fg",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-md border border-line bg-card/40 px-4 text-sm text-fg placeholder:text-fg-3",
        "transition-colors duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-line bg-card",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-primary",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      {children}
    </span>
  );
}

function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t =
      (document.documentElement.getAttribute("data-theme") as
        | "dark"
        | "light"
        | null) ?? "dark";
    setTheme(t);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("onyx-theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-md border border-line bg-card text-fg-2 transition-colors duration-200 hover:border-primary/40 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        dim,
      )}
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className={iconSize} />
        ) : (
          <Moon className={iconSize} />
        )
      ) : (
        <Sun className={cn(iconSize, "opacity-0")} />
      )}
    </button>
  );
}

function BrandLockup({
  className,
  showEyebrow = false,
}: {
  className?: string;
  showEyebrow?: boolean;
}) {
  return (
    <a href="#" className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet shadow-[0_8px_24px_-8px_rgb(var(--c-primary)/0.55)]">
        <Sparkles className="h-4 w-4 text-primary-fg" strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <div className="text-base font-semibold tracking-tight text-fg">
          Onyx Coach
        </div>
        {showEyebrow && (
          <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
            COACH CONSOLE
          </div>
        )}
      </div>
    </a>
  );
}

function smoothScrollTo(id: string) {
  if (typeof window === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* -------------------------------------------------------------------------- */
/*                                Phone frame                                 */
/* -------------------------------------------------------------------------- */

function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[280px] rounded-[2.4rem] border-[10px] border-card-2 bg-card-2 p-0 shadow-glow-primary",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute -left-[12px] top-16 h-10 w-[3px] rounded-l bg-line-strong"
      />
      <div
        aria-hidden
        className="absolute -left-[12px] top-32 h-16 w-[3px] rounded-l bg-line-strong"
      />
      <div
        aria-hidden
        className="absolute -right-[12px] top-24 h-14 w-[3px] rounded-r bg-line-strong"
      />
      <div className="relative overflow-hidden rounded-[1.7rem] bg-bg">
        <div
          aria-hidden
          className="absolute left-1/2 top-1.5 z-10 flex h-5 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-card-2"
        >
          <div className="h-1 w-1 rounded-full bg-line-strong" />
        </div>
        <div className="flex items-center justify-between px-5 pb-1 pt-2 text-[10px] font-semibold tabular-nums text-fg">
          <span>9:41</span>
          <span className="flex items-center gap-1 text-fg-3">
            <span className="block h-1.5 w-1.5 rounded-full bg-fg-3" />
            <span className="block h-1.5 w-2 rounded-full bg-fg-3" />
            <span className="block h-1.5 w-2.5 rounded-full bg-fg-3" />
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-line px-4 pb-2 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-gradient-to-br from-primary to-violet">
              <Sparkles className="h-2.5 w-2.5 text-primary-fg" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-2">
              Onyx
            </span>
          </div>
          <div className="text-[10px] text-fg-3">●●●</div>
        </div>
        <div className="bg-bg px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Content                                   */
/* -------------------------------------------------------------------------- */

const integrations = [
  "Stripe",
  "Apple Health",
  "Google Calendar",
  "Whoop",
  "Garmin",
  "Strava",
  "Oura",
  "Zoom",
  "Polar",
  "Withings",
] as const;

const problems = [
  {
    icon: AlertTriangle,
    title: "Six apps. Zero cohesion.",
    description:
      "Programming in one tab, messaging in another, payments in a third, form checks buried in DMs. Your athletes feel the seams. So do you.",
  },
  {
    icon: AlertTriangle,
    title: "Hours stolen from the actual work.",
    description:
      "Invoicing, rebooking, chasing late payments, manually copying programs into Sheets. Every hour of admin is an hour you didn't coach.",
  },
  {
    icon: AlertTriangle,
    title: "No leverage. No system. No exit.",
    description:
      "Your methodology lives in your head and a folder of .docx files. The day you take a holiday, the business stops.",
  },
] as const;

const forgeFeatures = [
  {
    icon: Users,
    title: "Roster & Triage",
    description:
      "Every athlete in one feed. Red flags surface before they ask. Wins surface for the message back.",
  },
  {
    icon: Hammer,
    title: "The Forge",
    description:
      "Drag-drop program builder. 12-week blocks become reusable templates. Build once, deploy forever.",
  },
  {
    icon: Apple,
    title: "Nutrition Hub",
    description:
      "BMR/TDEE auto-dialed. Phase-aware macros. A library of foods your athletes actually eat.",
  },
  {
    icon: ScanLine,
    title: "Form Studio",
    description:
      "Frame-by-frame video review. Timestamped annotations. Voice memos sent in under 90 seconds.",
  },
] as const;

const steps = [
  {
    icon: Target,
    step: "01",
    title: "Onboard in minutes",
    description:
      "Send us your sheets, your Trainerize export, your Notion. We migrate every athlete and program — for free, in 48 hours.",
  },
  {
    icon: Layers,
    step: "02",
    title: "Build once, reuse forever",
    description:
      "Save your signature methodology as templates. Duplicate, tweak, deploy. What used to take an afternoon becomes a coffee break.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Scale without breaking",
    description:
      "Take on more athletes without taking on more chaos. The console handles admin, billing, and check-ins. You stay in the work.",
  },
] as const;

const comparisonRows: ReadonlyArray<{
  feature: string;
  onyx: boolean | "mid";
  sheets: boolean | "mid";
  generic: boolean | "mid";
}> = [
  { feature: "All-in-one console", onyx: true, sheets: false, generic: "mid" },
  { feature: "Drag-drop program + nutrition builder", onyx: true, sheets: "mid", generic: true },
  { feature: "Athlete booking & calendar", onyx: true, sheets: false, generic: "mid" },
  { feature: "Integrated payments + lifetime billing", onyx: true, sheets: false, generic: false },
  { feature: "Frame-accurate form checks in-app", onyx: true, sheets: false, generic: "mid" },
  { feature: "Public marketplace listing", onyx: true, sheets: false, generic: false },
  { feature: "White-label client experience", onyx: true, sheets: false, generic: false },
  { feature: "Free migration from current tools", onyx: true, sheets: false, generic: false },
] as const;

const foundingPerks = [
  "Founder pricing — locked for life.",
  "White-glove migration from sheets, Trainerize, Notion.",
  "12 months of white-label client app on us.",
  "Priority access to every new feature, before public release.",
  "Direct Slack channel with the founders.",
  "Exclusive \"Founding 100\" badge on your public coach profile.",
] as const;

const faqs = [
  {
    q: "When does Onyx Coach launch?",
    a: "Closed beta opens to the Founding 100 in the coming weeks. Public launch follows. Join the waitlist; you'll be first in.",
  },
  {
    q: "How is this different from Trainerize, TrueCoach, or Everfit?",
    a: "Those started a decade ago and bolted on features. Onyx Coach is built from scratch for the modern coach: programming, nutrition, recovery, form checks, payments, marketplace, public profile, white-label — all native, all from day one.",
  },
  {
    q: "Can I migrate my existing athletes and programs?",
    a: "Yes. Every Founding 100 member gets free white-glove migration. Send your sheets, Trainerize export, or Notion — we move it all in 48 hours and hand back a clean console.",
  },
  {
    q: "Does it work for solo coaches or also for studios?",
    a: "Both. Scales from a single coach to multi-coach studios with shared rosters, team programs, and role-based permissions.",
  },
  {
    q: "Where's the AI? Wearable sync? Auto meal-plans?",
    a: "Those live in the companion product, Anvil. Onyx Coach is the coach-athlete platform. Anvil is the AI engine for the athlete. They share one account and plug into each other. Use one, use both.",
  },
  {
    q: "Is my client data private and secure?",
    a: "Encrypted in transit and at rest. GDPR-compliant by default. We're building toward HIPAA-grade for health data. We never sell. Athletes export or delete their data on demand.",
  },
  {
    q: "What will it cost?",
    a: "Public pricing announced at launch. Founding 100 lock in founder pricing — permanently below public — for the lifetime of the subscription.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                               Page Sections                                */
/* -------------------------------------------------------------------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 bg-bg/75 backdrop-blur-xl border-b border-line transition-shadow",
        scrolled && "shadow-soft",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 lg:px-10">
        <BrandLockup />
        <nav className="hidden items-center gap-7 md:flex">
          {[
            ["Forge", "forge"],
            ["Roster", "feature-roster"],
            ["Nutrition", "feature-nutrition"],
            ["Pricing", "founding"],
            ["FAQ", "faq"],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => smoothScrollTo(id)}
              className="text-sm text-fg-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
            </span>
            In the forge
          </span>
          <ThemeToggle />
          <a
            href="/login"
            className="hidden md:inline-flex items-center text-sm text-fg-2 hover:text-fg transition-colors px-3 focus-visible:outline-none focus-visible:text-fg"
          >
            Coach login →
          </a>
          <Button size="sm" onClick={() => smoothScrollTo("waitlist")}>
            Claim a seat
          </Button>
        </div>
      </div>
    </header>
  );
}

function WaitlistForm({ id, className }: { id?: string; className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={cn("flex w-full flex-col gap-3 sm:flex-row max-w-md", className)}
    >
      <Input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <Button type="submit" size="lg" className="sm:h-12">
        {submitted ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            You&apos;re in
          </>
        ) : (
          <>
            Get a seat
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      {/* Aurora + grid + blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 onyx-aurora">
        <div className="absolute inset-0 bg-grid opacity-[0.6]" />
        <div className="absolute -top-32 left-1/4 w-[800px] h-[800px] rounded-full bg-primary/15 blur-[140px] motion-safe:animate-blob" />
        <div
          className="absolute -top-20 right-1/4 w-[600px] h-[600px] rounded-full bg-violet/15 blur-[120px] motion-safe:animate-blob"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex">
            <Pill>Founding 100 — closed beta opening soon</Pill>
          </div>

          <h1 className="mt-8 text-[clamp(56px,11vw,176px)] leading-[0.95] tracking-[-0.04em] font-semibold text-fg text-balance">
            <span className="block">The console elite coaches</span>
            <span className="block">
              <span className="font-display italic font-normal text-gradient-brand">
                deserve
              </span>
              <span className="text-fg">.</span>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-[640px] text-[clamp(17px,1.6vw,22px)] text-fg-2 leading-[1.55]">
            Programming, payments, form checks, nutrition, recovery — every tool
            a serious coach needs, fused into a single distraction-free console.
            Built by coaches, for coaches.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => smoothScrollTo("waitlist")}>
              Claim a founding seat
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => smoothScrollTo("showcase")}
            >
              See it in motion ↓
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-mono uppercase tracking-[0.22em] text-fg-3">
            <span>No credit card</span>
            <span aria-hidden>·</span>
            <span>Free migration from your sheets</span>
            <span aria-hidden>·</span>
            <span>Lifetime founder pricing</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroShowcase() {
  return (
    <section
      id="showcase"
      className="relative pb-32 md:pb-40 -mt-10 md:-mt-16"
    >
      <div className="relative mx-auto max-w-[1100px] px-6">
        {/* Glow halos */}
        <div
          aria-hidden
          className="absolute left-1/4 -top-10 h-[400px] w-[600px] rounded-full bg-primary/20 blur-[120px] motion-safe:animate-blob"
        />
        <div
          aria-hidden
          className="absolute right-1/4 -bottom-10 h-[400px] w-[600px] rounded-full bg-violet/20 blur-[120px] motion-safe:animate-blob"
          style={{ animationDelay: "-9s" }}
        />
        <LaptopFrame variant="hero" url="/dashboard" glow>
          <MockTriage />
        </LaptopFrame>

        {/* Annotation chips - lg+ only */}
        <div
          aria-hidden
          className="hidden lg:block absolute top-[10%] -left-6 rounded-md border border-line bg-card/90 backdrop-blur px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-2 shadow-lift"
        >
          <span className="text-primary">●</span> Live triage
        </div>
        <div
          aria-hidden
          className="hidden lg:block absolute top-[40%] -right-8 rounded-md border border-line bg-card/90 backdrop-blur px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-2 shadow-lift"
        >
          <span className="text-violet">●</span> Drag-drop forge
        </div>
        <div
          aria-hidden
          className="hidden lg:block absolute -bottom-4 left-[18%] rounded-md border border-line bg-card/90 backdrop-blur px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-2 shadow-lift"
        >
          <span className="text-emerald">●</span> All in one
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="relative border-t border-line py-16 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-fg-3 text-center">
          Works with your stack
        </div>
        <div className="mt-8 relative w-full overflow-hidden">
          <div
            className="flex w-max motion-safe:animate-[marquee_40s_linear_infinite] gap-12"
            style={{ animation: "marquee 40s linear infinite" }}
          >
            {[...integrations, ...integrations].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="font-semibold text-2xl text-fg-3 hover:text-fg transition-colors whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* keyframe via global style block */}
      <style jsx global>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  emphasis,
  emphasisAfter,
  sub,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  emphasis?: string;
  emphasisAfter?: ReactNode;
  sub?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl",
      )}
    >
      <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-fg-3">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-[clamp(40px,6vw,88px)] leading-[1.02] tracking-[-0.03em] font-semibold text-fg text-balance">
        {title}
        {emphasis && (
          <>
            {" "}
            <span className="font-display italic font-normal text-gradient-brand">
              {emphasis}
            </span>
            {emphasisAfter ?? "."}
          </>
        )}
      </h2>
      {sub && (
        <p className="mt-5 text-[clamp(16px,1.4vw,19px)] text-fg-2 leading-[1.55] max-w-2xl">
          {sub}
        </p>
      )}
    </div>
  );
}

function Problem() {
  return (
    <section className="relative py-28 md:py-40 border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionHead
          eyebrow="THE OLD WAY"
          title="Spreadsheets break under serious"
          emphasis="weight"
          sub="Elite coaching is a high-leverage skill. Your tools should respect that."
          align="center"
        />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {problems.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-card border border-line rounded-xl p-8 border-l-2 border-l-rose/60"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-md bg-rose/10 text-rose">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-[22px] font-semibold tracking-tight text-fg leading-tight">
                {title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-fg-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Forge() {
  return (
    <section id="forge" className="relative py-28 md:py-40 border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionHead
          eyebrow="THE TOOLKIT"
          title="Everything a serious coach"
          emphasis="uses"
          emphasisAfter={<span>. Nothing they don&apos;t.</span>}
          sub="Eight tools, one console, one login. The seams disappear."
          align="center"
        />
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-xl overflow-hidden border border-line">
          {forgeFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-bg p-8 hover:bg-card transition-colors duration-300"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-fg">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-semibold tracking-tight text-fg">
                {title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-fg-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({
  id,
  eyebrow,
  title,
  emphasis,
  emphasisAfter,
  body,
  bullets,
  laptop,
  mediaSide,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  emphasis: string;
  emphasisAfter?: ReactNode;
  body: string;
  bullets: string[];
  laptop: ReactNode;
  mediaSide: "left" | "right";
}) {
  const text = (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-fg-3">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-[clamp(36px,5vw,72px)] leading-[1.05] tracking-[-0.03em] font-semibold text-fg text-balance">
        {title}{" "}
        <span className="font-display italic font-normal text-gradient-brand">
          {emphasis}
        </span>
        {emphasisAfter ?? "."}
      </h2>
      <p className="mt-5 text-[17px] leading-[1.6] text-fg-2 max-w-xl">
        {body}
      </p>
      <ul className="mt-7 space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[15px] text-fg">
            <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <section id={id} className="relative py-28 border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          {mediaSide === "right" ? (
            <>
              <div>{text}</div>
              <div className="relative">{laptop}</div>
            </>
          ) : (
            <>
              <div className="relative order-2 lg:order-1">{laptop}</div>
              <div className="order-1 lg:order-2">{text}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureRoster() {
  return (
    <FeatureBlock
      id="feature-roster"
      eyebrow="01 · ATHLETES"
      title="The whole roster,"
      emphasis="at a glance"
      body="Avatars, onboarding state, plan tier, last session, red flags — surfaced before they need to ask. Click any row to drop into the athlete's full timeline."
      bullets={[
        "Onboarding pipeline: medical Q → injury history → consent → live.",
        "Plan tier and MRR contribution per athlete.",
        "Live activity feed — workouts, meals, PRs, missed sessions.",
        "Red/green flag triage with one-click resolution.",
      ]}
      laptop={
        <LaptopFrame variant="tilt-right" url="/c/clients" glow>
          <MockClients />
        </LaptopFrame>
      }
      mediaSide="right"
    />
  );
}

function FeatureProgramming() {
  return (
    <FeatureBlock
      id="feature-forge"
      eyebrow="02 · PROGRAMMING"
      title="Where programs are"
      emphasis="hammered into shape"
      body="Drag exercises onto blocks. Reorder rows between weeks. Save the pattern as a 12-week template, then instantiate it per athlete in seconds."
      bullets={[
        "Drag-drop exercise library (4,200+ moves + your custom ones).",
        "Block-level periodization with auto-progression schemes.",
        "Templates that scale: build once, assign 50 times.",
        "Athlete preview before publishing — see exactly what they'll see.",
      ]}
      laptop={
        <LaptopFrame variant="tilt-left" url="/c/forge" glow>
          <MockForge />
        </LaptopFrame>
      }
      mediaSide="left"
    />
  );
}

function FeatureNutrition() {
  return (
    <FeatureBlock
      id="feature-nutrition"
      eyebrow="03 · NUTRITION"
      title="Macros,"
      emphasis="phases"
      emphasisAfter=", fuel."
      body="Pick an athlete, dial the engine — phase, mode, target kcal — and the protocol persists. Mifflin-St Jeor handles the math; you handle the strategy."
      bullets={[
        "Auto-calculated BMR/TDEE from athlete biometrics.",
        "Phase tagging: cut, recomp, lean bulk, maintenance.",
        "Macro split with grams + kcal + percent breakdown.",
        "Custom food library — save what your athletes eat.",
      ]}
      laptop={
        <LaptopFrame variant="tilt-right" url="/c/nutrition" glow>
          <MockNutrition />
        </LaptopFrame>
      }
      mediaSide="right"
    />
  );
}

function StatTile({
  label,
  value,
  caption,
  bar,
  numeric,
}: {
  label: string;
  value: string;
  caption: string;
  bar: string;
  numeric?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const animated = useCountUp(numeric ?? 0, 1400, !!numeric && inView);
  const renderValue = numeric != null ? animated.toString() : value;
  return (
    <div ref={ref} className="relative">
      <div className={cn("h-[3px] w-12 rounded-full mb-4", bar)} />
      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-fg-3">
        {label}
      </div>
      <div className="mt-2 font-display italic text-[clamp(56px,9vw,120px)] leading-none tracking-[-0.04em] text-fg">
        {numeric != null ? renderValue : value}
      </div>
      <div className="mt-3 text-[14px] text-fg-2 leading-snug max-w-[220px]">
        {caption}
      </div>
    </div>
  );
}

function Stats() {
  return (
    <section className="relative border-t border-b border-line py-20 bg-surface">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatTile
            label="HOURS / WEEK"
            value="12h"
            caption="Saved per week, per coach."
            bar="bg-primary"
            numeric={12}
          />
          <StatTile
            label="APPS REPLACED"
            value="7 → 1"
            caption="Apps replaced by one console."
            bar="bg-violet"
          />
          <StatTile
            label="DEPLOY TIME"
            value="< 5 min"
            caption="To ship a full 12-week program."
            bar="bg-emerald"
          />
          <StatTile
            label="FOUNDING SEATS"
            value="100"
            caption="Founding seats. Locked for life."
            bar="bg-primary"
            numeric={100}
          />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative py-28 md:py-40 border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionHead
          eyebrow="FROM CHAOS TO CONSOLE"
          title="Three steps. Then you stop fighting your"
          emphasis="tools"
          align="center"
        />
        <div className="mt-16 grid gap-6 md:grid-cols-3 relative">
          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <div key={title} className="relative">
              <div className="bg-card border border-line rounded-xl p-8 h-full relative overflow-hidden">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="absolute right-5 top-3 text-[64px] font-display italic text-fg-3/40 leading-none">
                  {step}
                </span>
                <h3 className="text-[20px] font-semibold tracking-tight text-fg">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-2">
                  {description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-full top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1/2 md:block">
                  <ArrowRight className="h-5 w-5 text-primary/60" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="relative overflow-hidden py-32 border-t border-line">
      <div className="pointer-events-none absolute inset-0 -z-10 onyx-aurora">
        <div className="absolute -top-32 left-1/3 w-[700px] h-[700px] rounded-full bg-violet/15 blur-[140px] motion-safe:animate-blob" />
        <div
          className="absolute -bottom-20 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] motion-safe:animate-blob"
          style={{ animationDelay: "-7s" }}
        />
      </div>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <SectionHead
          eyebrow="TWO SIDES. ONE FORGE."
          title="Built different for the coach. Built different for the"
          emphasis="athlete"
          align="center"
        />
        <div className="relative mt-16 mx-auto max-w-[1200px] h-auto md:h-[680px]">
          <div className="relative md:absolute inset-0 flex items-center justify-center">
            <LaptopFrame
              variant="floating"
              url="/c/clients/marek"
              glow
              className="w-full max-w-[820px]"
            >
              <MockAthlete />
            </LaptopFrame>
          </div>
          <div className="mt-10 md:mt-0 md:absolute md:right-[8%] md:bottom-[4%]">
            <div className="md:rotate-[6deg]">
              <PhoneFrame>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.22em] font-mono text-fg-3">
                      Today
                    </div>
                    <div className="text-sm font-semibold text-fg">
                      Push Day · Week 4
                    </div>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.22em] text-primary">
                    Ready
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Bench Press", sets: "5 × 5", done: true },
                    { name: "Overhead Press", sets: "4 × 6", done: true },
                    { name: "Incline DB Press", sets: "3 × 8", done: false },
                    { name: "Cable Fly", sets: "3 × 12", done: false },
                  ].map((e) => (
                    <div
                      key={e.name}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2.5 py-2",
                        e.done
                          ? "bg-primary/5 ring-1 ring-primary/20"
                          : "bg-card",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border",
                            e.done
                              ? "border-primary bg-primary"
                              : "border-line",
                          )}
                        >
                          {e.done && (
                            <CheckCircle2 className="h-2.5 w-2.5 text-primary-fg" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[11px] font-medium",
                            e.done ? "text-fg-3 line-through" : "text-fg",
                          )}
                        >
                          {e.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-fg-3">{e.sets}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <Flame className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-fg">
                      New PR · Bench +2.5kg
                    </div>
                    <div className="text-[9px] text-fg-3">Logged 2 sec ago</div>
                  </div>
                </div>
                <div className="-mx-4 mt-4 flex items-center justify-around border-t border-line px-4 pb-1 pt-3">
                  {[
                    { icon: Dumbbell, label: "Train", active: true },
                    { icon: CalendarCheck, label: "Plan", active: false },
                    { icon: Video, label: "Chat", active: false },
                    { icon: Users, label: "Coach", active: false },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <t.icon
                        className={cn(
                          "h-3.5 w-3.5",
                          t.active ? "text-primary" : "text-fg-3",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[8px] font-medium",
                          t.active ? "text-primary" : "text-fg-3",
                        )}
                      >
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>
              </PhoneFrame>
            </div>
          </div>
          {/* Floating chips */}
          <div className="hidden md:block absolute top-[8%] left-[6%] rounded-md border border-line bg-card/90 backdrop-blur px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-2 shadow-lift">
            For the coach · command center
          </div>
          <div className="hidden md:block absolute bottom-[8%] left-[12%] rounded-md border border-line bg-card/90 backdrop-blur px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-fg-2 shadow-lift">
            For the athlete · weapon
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const renderCell = (v: boolean | "mid") => {
    if (v === true) {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/40">
          <CheckCircle2 className="h-4 w-4 text-primary" />
        </div>
      );
    }
    if (v === "mid") {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card-2 ring-1 ring-line">
          <span className="text-xs text-fg-2">~</span>
        </div>
      );
    }
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg ring-1 ring-line">
        <X className="h-3.5 w-3.5 text-fg-3" />
      </div>
    );
  };

  return (
    <section className="relative py-28 md:py-40 border-t border-line">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <SectionHead
          eyebrow="THE HONEST COMPARISON"
          title="Why coaches are"
          emphasis="switching"
          align="center"
        />
        <div className="mt-12 overflow-hidden rounded-xl border border-line bg-card">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-2 border-b border-line bg-surface px-4 py-4 text-[11px] font-mono uppercase tracking-[0.22em] text-fg-3 sm:px-6">
            <div>Capability</div>
            <div className="flex items-center justify-center gap-1.5 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Onyx Coach
            </div>
            <div className="text-center">Spreadsheets</div>
            <div className="text-center">Legacy apps</div>
          </div>
          {comparisonRows.map((row, i) => (
            <div
              key={row.feature}
              className={cn(
                "grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-2 px-4 py-4 text-sm sm:px-6",
                i !== comparisonRows.length - 1 && "border-b border-line",
              )}
            >
              <div className="text-fg">{row.feature}</div>
              <div className="flex justify-center">{renderCell(row.onyx)}</div>
              <div className="flex justify-center">
                {renderCell(row.sheets)}
              </div>
              <div className="flex justify-center">
                {renderCell(row.generic)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FoundingHundred() {
  return (
    <section
      id="founding"
      className="relative py-28 md:py-40 border-t border-line"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <Card className="relative overflow-hidden p-8 md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div id="waitlist">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-primary">
                <Crown className="h-3.5 w-3.5" />
                Founding 100 — invitation only
              </div>
              <h2 className="mt-6 text-[clamp(36px,5vw,72px)] leading-[1.05] tracking-[-0.03em] font-semibold text-fg text-balance">
                The first hundred coaches{" "}
                <span className="font-display italic font-normal text-gradient-brand">
                  shape the forge
                </span>
                .
              </h2>
              <p className="mt-5 text-[17px] text-fg-2 leading-[1.55]">
                We&apos;re hand-picking the first 100 coaches. Founder pricing
                locked for life, white-glove migration, direct line to the
                founders, and perks we&apos;ll never offer again. Once 100 seats
                are gone, the door closes.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.22em] text-fg-3">
                  <span>Founding seats claimed</span>
                  <span className="text-primary">0 / 100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-card-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                    style={{ width: "0%" }}
                  />
                </div>
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-fg-3">
                  Once 100 are in, founder pricing is gone. For good.
                </p>
              </div>

              <div className="mt-8">
                <WaitlistForm />
              </div>
            </div>

            <div className="relative">
              <div className="mb-4 text-[11px] font-mono uppercase tracking-[0.22em] text-primary">
                What you get
              </div>
              <ul className="space-y-2.5">
                {foundingPerks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 rounded-lg border border-line bg-bg/40 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-[14px] text-fg leading-snug">
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="relative py-32 bg-surface border-y border-line">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="font-display italic text-primary/30 text-[200px] leading-none mb-[-40px] select-none">
          &ldquo;
        </div>
        <blockquote className="font-display italic text-[clamp(28px,3.5vw,52px)] leading-[1.15] text-fg text-balance">
          My five-tool spaghetti became one console. I took on twelve new
          clients in the same admin time. The maths only goes one way.
        </blockquote>
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-violet" />
          <div className="text-left leading-tight">
            <div className="text-[16px] font-semibold text-fg">Marek K.</div>
            <div className="text-[12px] font-mono uppercase tracking-[0.22em] text-fg-3 mt-1">
              Strength coach, Warsaw · 38 athletes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary"
        aria-expanded={open}
      >
        <span className="text-[17px] md:text-[18px] font-semibold tracking-tight text-fg">
          {q}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-fg-3 transition-all duration-300",
            open && "rotate-180 text-primary",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl text-[15px] leading-relaxed text-fg-2">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  return (
    <section id="faq" className="relative py-28 md:py-40 border-t border-line">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHead
          eyebrow="STRAIGHT ANSWERS"
          title="Questions, asked and"
          emphasis="answered"
          align="center"
        />
        <div className="mt-12 rounded-xl border border-line bg-card px-6 md:px-8">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-40 text-center border-t border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto h-[600px] w-[1000px] rounded-full bg-primary/15 blur-[160px]"
      />
      <div className="relative mx-auto max-w-4xl px-6">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-glow-primary">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="mt-8 text-[clamp(56px,9vw,144px)] leading-[0.95] tracking-[-0.04em] font-semibold text-fg text-balance">
          Be first{" "}
          <span className="font-display italic font-normal text-gradient-brand">
            into the forge
          </span>
          .
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-[17px] md:text-[19px] text-fg-2 leading-[1.55]">
          Early access is limited. Join the waitlist and we&apos;ll hand you the
          keys before anyone else — plus a founding rate locked for life.
        </p>
        <div className="mt-10 flex justify-center">
          <WaitlistForm />
        </div>
        <p className="mt-6 text-[11px] font-mono uppercase tracking-[0.22em] text-fg-3">
          Launching soon · No credit card · No commitment
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line py-12 bg-surface">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <BrandLockup showEyebrow />
            <p className="mt-4 text-[13px] text-fg-3 max-w-[260px]">
              Forged in iron. The console elite coaches deserve.
            </p>
          </div>
          {[
            {
              h: "Product",
              items: ["Forge", "Roster", "Nutrition", "Form Studio"],
            },
            {
              h: "Company",
              items: ["About", "Manifesto", "Contact"],
            },
            {
              h: "Legal",
              items: ["Privacy", "Terms", "Security"],
            },
          ].map((col) => (
            <div key={col.h}>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
                {col.h}
              </div>
              <ul className="mt-4 space-y-2">
                {col.items.map((it) => (
                  <li key={it}>
                    <a
                      href="#"
                      className="text-[14px] text-fg-2 hover:text-fg transition-colors"
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-line flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[12px] text-fg-3">
            © {new Date().getFullYear()} Onyx Coach. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: Twitter, label: "Twitter" },
              { Icon: Github, label: "GitHub" },
              { Icon: Linkedin, label: "LinkedIn" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-card text-fg-2 hover:text-fg hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function Page() {
  return (
    <main className="min-h-screen bg-bg text-fg font-sans antialiased selection:bg-primary/30 selection:text-fg">
      <Nav />
      <Hero />
      <HeroShowcase />
      <LogoStrip />
      <Problem />
      <Forge />
      <FeatureRoster />
      <FeatureProgramming />
      <FeatureNutrition />
      <Stats />
      <HowItWorks />
      <Workflow />
      <Comparison />
      <FoundingHundred />
      <Quote />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
