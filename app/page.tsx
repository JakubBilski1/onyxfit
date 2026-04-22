"use client";

import {
  AlertTriangle,
  ArrowRight,
  Award,
  BrainCircuit,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Crown,
  Dumbbell,
  Flame,
  Globe,
  Hammer,
  Layers,
  Palette,
  Rocket,
  Salad,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  Watch,
  X,
  Zap,
} from "lucide-react";
import {
  ButtonHTMLAttributes,
  FormEvent,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
} from "react";

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/*                              UI Primitives                                 */
/*      Minimal shadcn-style building blocks, all powered by Tailwind.        */
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
      "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-orange-600 text-white shadow-[0_0_0_1px_rgba(234,88,12,0.6)_inset,0_10px_40px_-10px_rgba(234,88,12,0.6)] hover:bg-orange-500 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.8)_inset,0_18px_50px_-10px_rgba(234,88,12,0.8)] active:translate-y-px",
      ghost:
        "bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-white",
      outline:
        "border border-zinc-800 bg-zinc-950/40 text-zinc-200 hover:border-orange-600/60 hover:text-white",
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
  }
);
Button.displayName = "Button";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-4 text-sm text-white placeholder:text-zinc-500",
        "transition-colors duration-200 focus:border-orange-600/60 focus:outline-none focus:ring-2 focus:ring-orange-600/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-orange-600/40 hover:bg-zinc-900 hover:shadow-[0_20px_60px_-20px_rgba(234,88,12,0.25)]",
        className
      )}
      {...props}
    />
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-600/30 bg-orange-600/10 px-3 py-1 text-xs font-medium tracking-wider text-orange-400 uppercase">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
      </span>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Content                                   */
/* -------------------------------------------------------------------------- */

const features = [
  {
    icon: Calendar,
    title: "Roster Command",
    description:
      "Manage every client, schedule every session, and never miss a detail. Your entire roster, organized like a war room.",
  },
  {
    icon: Dumbbell,
    title: "Program Architect",
    description:
      "Forge bulletproof programs in minutes. Track every rep, every set, every PR. Progressive overload, automated.",
  },
  {
    icon: Video,
    title: "Direct Line & Form Checks",
    description:
      "Real-time chat and async video review. Drop timestamped feedback on client lifts. Fix technique before it breaks them.",
  },
  {
    icon: CreditCard,
    title: "Automated Payments",
    description:
      "Recurring billing, invoices, and payouts — handled. Get paid on time, every time. No awkward reminders.",
  },
] as const;

const stats = [
  { icon: Clock, value: "12h", label: "Saved per week, per coach" },
  { icon: Layers, value: "7 apps", label: "Replaced by one workspace" },
  { icon: Zap, value: "< 5 min", label: "To build a full program" },
  { icon: Crown, value: "100", label: "Founding spots. Locked forever." },
] as const;

const problems = [
  {
    icon: AlertTriangle,
    title: "Spreadsheets that break under weight.",
    description:
      "A single typo, a broken formula, a lost tab — and a week of programming evaporates. Your craft deserves better than Google Sheets.",
  },
  {
    icon: AlertTriangle,
    title: "Six apps. Zero cohesion.",
    description:
      "Programming in one tool. Messaging in another. Payments in a third. Form checks buried in DMs. Your clients feel the seams — and so do you.",
  },
  {
    icon: AlertTriangle,
    title: "Time stolen from the work that matters.",
    description:
      "Admin, invoicing, rebooking, chasing payments. Every hour in a spreadsheet is an hour not spent coaching. That math doesn't compound in your favor.",
  },
] as const;

const steps = [
  {
    icon: Target,
    step: "01",
    title: "Onboard in minutes.",
    description:
      "Import your clients, build your exercise library, and drop in your first programs. We'll migrate your spreadsheets for you — no data left behind.",
  },
  {
    icon: Layers,
    step: "02",
    title: "Build once. Reuse forever.",
    description:
      "Design your signature methodology as reusable templates. Duplicate, adjust, assign. What used to take an afternoon now takes a coffee break.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Scale without breaking.",
    description:
      "Take on more clients without taking on more chaos. OnyxFit handles the admin, billing, and check-ins — you stay focused on the coaching.",
  },
] as const;

const secondaryFeatures = [
  {
    icon: Salad,
    title: "Nutrition Coaching",
    description:
      "Macro targets, meal plans, and a searchable food database. Log meals from the same app — no more MyFitnessPal screenshots.",
  },
  {
    icon: Camera,
    title: "Progress Photos & Biometrics",
    description:
      "Side-by-side photo comparisons, measurements, and body composition tracking. Show the transformation in numbers and in pixels.",
  },
  {
    icon: Watch,
    title: "Wearable Sync",
    description:
      "Apple Health, Whoop, Garmin, Oura. Readiness, HRV, and sleep feed straight into the coach's dashboard. Train smart, recover smarter.",
  },
  {
    icon: TrendingUp,
    title: "Business Analytics",
    description:
      "MRR, retention, churn, LTV — every lever of your coaching business, visualized. Know which clients are thriving and which need a call.",
  },
  {
    icon: Palette,
    title: "White-Label Branding",
    description:
      "Your logo. Your colors. Your domain. Clients see your brand — not ours. Premium coaches deserve a premium, owned experience.",
  },
  {
    icon: BrainCircuit,
    title: "AI Program Assist",
    description:
      "Describe the goal, equipment, and constraints. Get a starter program in seconds. You stay the architect — AI handles the grunt work.",
  },
] as const;

const integrations = [
  "Stripe",
  "Apple Health",
  "Google Calendar",
  "Whoop",
  "Garmin",
  "Strava",
  "Oura",
  "Zoom",
] as const;

const comparisonRows = [
  { feature: "All-in-one workspace", onyx: true, sheets: false, generic: "mid" },
  { feature: "Programming + tracking", onyx: true, sheets: "mid", generic: true },
  { feature: "Integrated payments & invoicing", onyx: true, sheets: false, generic: false },
  { feature: "Video form checks in-app", onyx: true, sheets: false, generic: "mid" },
  { feature: "White-label client experience", onyx: true, sheets: false, generic: false },
  { feature: "Business analytics", onyx: true, sheets: false, generic: false },
  { feature: "Scales with your roster", onyx: true, sheets: false, generic: "mid" },
] as const;

const foundingPerks = [
  "Founder pricing locked in — for life.",
  "Priority access to every new feature, before public release.",
  "Direct line to the founders. Shape the roadmap.",
  "Exclusive \"Founding 100\" badge on your coach profile.",
  "12 months of white-label branding included.",
  "Free migration from your current tools.",
] as const;

const faqs = [
  {
    q: "When does OnyxFit launch?",
    a: "We're in active development and opening a closed beta to the Founding 100 in the coming months. Join the waitlist — you'll be the first to know, and the first let in.",
  },
  {
    q: "How is OnyxFit different from Trainerize, TrueCoach, or Everfit?",
    a: "Most coaching platforms started a decade ago and have been adding features ever since. OnyxFit is built from scratch for the modern elite coach — faster, cleaner, with business analytics, AI assist, and white-labeling built in from day one, not bolted on.",
  },
  {
    q: "Can I migrate my existing clients and programs?",
    a: "Yes. Every Founding 100 member gets free white-glove migration. Send us your spreadsheets, your Trainerize export, or your Notion doc — we'll move it all in and hand you back a clean workspace.",
  },
  {
    q: "Does it work for solo trainers, or also for gyms and teams?",
    a: "Both. OnyxFit scales from a single independent coach to multi-coach studios with shared client rosters, team programs, and role-based permissions.",
  },
  {
    q: "Is my client data private and secure?",
    a: "Non-negotiable. All data is encrypted in transit and at rest. We're building toward HIPAA-grade practices for health data, never sell information, and let clients export or delete their data at any time.",
  },
  {
    q: "What will it cost?",
    a: "Public pricing will be announced at launch. Founding 100 members lock in founder pricing — permanently below public rates — for the lifetime of their subscription.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                               Page Sections                                */
/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <a href="#" className="flex items-center gap-2 text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_8px_24px_-8px_rgba(234,88,12,0.8)]">
          <Hammer className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold tracking-tight">OnyxFit</span>
      </a>
      <nav className="hidden items-center gap-8 md:flex">
        <a href="#features" className="text-sm text-zinc-400 transition-colors hover:text-white">
          Features
        </a>
        <a href="#how-it-works" className="text-sm text-zinc-400 transition-colors hover:text-white">
          How It Works
        </a>
        <a href="#founding" className="text-sm text-zinc-400 transition-colors hover:text-white">
          Founding 100
        </a>
        <a href="#faq" className="text-sm text-zinc-400 transition-colors hover:text-white">
          FAQ
        </a>
      </nav>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Join Waitlist
      </Button>
    </header>
  );
}

function WaitlistForm({ id, variant = "hero" }: { id?: string; variant?: "hero" | "footer" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    // Wire up to your backend / email service here.
    setSubmitted(true);
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-3 sm:flex-row",
        variant === "hero" ? "max-w-md" : "max-w-lg"
      )}
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
            Get Early Access
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Forge glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.15),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Badge>
            <Flame className="h-3 w-3" />
            In the Forge — Early Stages of Development
          </Badge>

          <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            The Final Link Between{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 bg-clip-text text-transparent">
                Trainer &amp; Athlete.
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-lg text-zinc-400 md:text-xl">
            OnyxFit is the only platform coaches and their athletes will ever need.
            Programming, progress, communication, and payments — unified under one
            elite, distraction-free workspace.
          </p>

          <div id="waitlist" className="mt-10 flex w-full flex-col items-center gap-4">
            <WaitlistForm variant="hero" />
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-500">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                No spam. One message when we open the doors.
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:inline-block" />
              <span className="flex items-center gap-2 text-orange-400/90">
                <Crown className="h-3.5 w-3.5" />
                0 / 100 founding spots claimed
              </span>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-zinc-600">
            <span>Built for coaches</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Forged for athletes</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Zero compromise</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            The Toolkit
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-balance text-zinc-400 md:text-lg">
            Stop stitching together five apps, a spreadsheet, and a group chat.
            OnyxFit replaces the chaos with a single, purpose-built workspace.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} interactive className="group p-6">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-orange-500 transition-colors duration-300 group-hover:border-orange-600/40 group-hover:text-orange-400">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
              {/* subtle hover sheen */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-600/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function DualExperience() {
  return (
    <section id="dual" className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.08),transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Two Sides. One Forge.
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            Built different for trainer and athlete.
          </h2>
          <p className="mt-4 text-balance text-zinc-400 md:text-lg">
            A commander needs a war room. A fighter needs a weapon. Both get exactly
            what they need — and nothing more.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* Trainer */}
          <Card className="relative p-8 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-600/10 ring-1 ring-orange-600/30">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
                For the Trainer
              </span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-white">
              The Command Center.
            </h3>
            <p className="mt-3 text-zinc-400">
              Every client, program, and payment in one powerful dashboard. Scale
              your roster without scaling your chaos.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-zinc-300">
              {[
                "Full roster view with progress at a glance",
                "Drag-and-drop program builder with exercise library",
                "Automated billing, retention alerts, and client analytics",
                "Video form reviews with timestamped annotations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Mock dashboard */}
            <div className="mt-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Active Clients</span>
                <span className="text-xs text-zinc-600">This week</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "M. Kowalski", progress: 82, pr: "+12.5kg" },
                  { name: "A. Nowak", progress: 64, pr: "+7.5kg" },
                  { name: "T. Sharp", progress: 91, pr: "+20kg" },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-3 rounded-md bg-zinc-900/80 px-3 py-2"
                  >
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{c.name}</span>
                        <span className="text-xs text-orange-500">{c.pr}</span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Athlete */}
          <Card className="relative p-8 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-800 ring-1 ring-zinc-700">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                For the Athlete
              </span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-white">
              The Athlete&apos;s Arena.
            </h3>
            <p className="mt-3 text-zinc-400">
              One screen. Today&apos;s session. Tap, log, crush. No dashboards, no
              noise — just the work that moves the needle.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-zinc-300">
              {[
                "Today's workout, front and center",
                "One-tap set logging and PR tracking",
                "Upload a lift, get coach feedback without breaking flow",
                "Zero dashboards. Zero distractions. Zero excuses.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Mock athlete view */}
            <div className="mt-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">
                    Today
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Push Day — Week 4
                  </div>
                </div>
                <div className="rounded-full bg-orange-600/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-orange-500">
                  Ready
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Bench Press", sets: "5 × 5", done: true },
                  { name: "Overhead Press", sets: "4 × 6", done: true },
                  { name: "Incline DB Press", sets: "3 × 8", done: false },
                ].map((e) => (
                  <div
                    key={e.name}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2.5",
                      e.done
                        ? "bg-orange-600/5 ring-1 ring-orange-600/20"
                        : "bg-zinc-900/80"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border",
                          e.done
                            ? "border-orange-600 bg-orange-600"
                            : "border-zinc-700"
                        )}
                      >
                        {e.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          e.done ? "text-zinc-400 line-through" : "text-white"
                        )}
                      >
                        {e.name}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">{e.sets}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="relative border-t border-zinc-900 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-orange-500">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                {value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            The Old Way
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            Your craft deserves better tools.
          </h2>
          <p className="mt-4 text-balance text-zinc-400 md:text-lg">
            Elite coaching is a high-leverage skill. It shouldn&apos;t be buried
            under spreadsheets, sticky notes, and a browser with 30 tabs open.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {problems.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="relative rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            How It Works
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            Three steps from chaos to command.
          </h2>
          <p className="mt-4 text-balance text-zinc-400 md:text-lg">
            No six-week onboarding. No consultants. Just three steps between you
            and a business that runs itself.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <div key={title} className="relative">
              <Card interactive className="relative h-full p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-600/30 bg-orange-600/10 text-orange-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="bg-gradient-to-br from-zinc-600 to-zinc-800 bg-clip-text text-4xl font-black text-transparent">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {description}
                </p>
              </Card>
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-full top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1/2 md:block">
                  <ArrowRight className="h-5 w-5 text-orange-600/60" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeyondBasics() {
  return (
    <section className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Beyond the Basics
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            The details that move the needle.
          </h2>
          <p className="mt-4 text-balance text-zinc-400 md:text-lg">
            Fundamentals win fights. But champions are made in the details.
            Here&apos;s what else is being forged.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-800/80 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative bg-zinc-950 p-8 transition-colors duration-300 hover:bg-zinc-900/60"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-orange-500 transition-all duration-300 group-hover:bg-orange-600/10 group-hover:text-orange-400">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  return (
    <section className="relative border-t border-zinc-900 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs uppercase tracking-widest text-zinc-400">
            <Globe className="h-3 w-3 text-orange-500" />
            Works with your stack
          </div>
          <h2 className="mt-6 text-balance text-2xl font-bold tracking-tight text-white md:text-3xl">
            Plays well with the tools your clients already live in.
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-14">
          {integrations.map((name) => (
            <div
              key={name}
              className="text-lg font-semibold tracking-tight text-zinc-500 transition-colors duration-200 hover:text-white md:text-xl"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const renderCell = (v: boolean | "mid") => {
    if (v === true) {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/10 ring-1 ring-orange-600/40">
          <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
        </div>
      );
    }
    if (v === "mid") {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
          <span className="text-xs text-zinc-500">~</span>
        </div>
      );
    }
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
        <X className="h-3.5 w-3.5 text-zinc-600" />
      </div>
    );
  };

  return (
    <section className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            The Honest Comparison
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            Why coaches are switching.
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-2 border-b border-zinc-800 bg-zinc-950/60 px-4 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 sm:px-6">
            <div>Capability</div>
            <div className="flex items-center justify-center gap-1.5 text-orange-500">
              <Hammer className="h-3.5 w-3.5" />
              OnyxFit
            </div>
            <div className="text-center">Spreadsheets</div>
            <div className="text-center">Legacy apps</div>
          </div>
          {comparisonRows.map((row, i) => (
            <div
              key={row.feature}
              className={cn(
                "grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-2 px-4 py-4 text-sm sm:px-6",
                i !== comparisonRows.length - 1 && "border-b border-zinc-800/60"
              )}
            >
              <div className="text-zinc-200">{row.feature}</div>
              <div className="flex justify-center">{renderCell(row.onyx)}</div>
              <div className="flex justify-center">{renderCell(row.sheets)}</div>
              <div className="flex justify-center">{renderCell(row.generic)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Founding() {
  return (
    <section id="founding" className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <Card className="relative overflow-hidden p-8 md:p-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-600/30 bg-orange-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400">
                <Crown className="h-3.5 w-3.5" />
                Founding 100
              </div>
              <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
                The first 100 coaches shape the forge.
              </h2>
              <p className="mt-4 text-balance text-zinc-400 md:text-lg">
                We&apos;re hand-picking the first hundred coaches to go live with
                OnyxFit. You get founder pricing for life, direct input on the
                roadmap, and perks we&apos;ll never offer again.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-500">
                  <span>Founding spots claimed</span>
                  <span className="font-semibold text-orange-400">0 / 100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
                    style={{ width: "0%" }}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Once the 100 are in, founder pricing is gone. For good.
                </p>
              </div>

              <div className="mt-8">
                <WaitlistForm />
              </div>
            </div>

            <div className="relative">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-500">
                <Award className="h-4 w-4" />
                What you get
              </div>
              <ul className="space-y-3">
                {foundingPerks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                    <span className="text-sm text-zinc-200">{perk}</span>
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

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800/80 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-orange-400"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-white md:text-lg">
          {q}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform duration-300",
            open && "rotate-180 text-orange-500"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  return (
    <section id="faq" className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Straight Answers
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            Questions, asked and answered.
          </h2>
        </div>

        <div className="mt-12 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-6 md:px-8">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative border-t border-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-orange-600/30 bg-orange-600/10">
          <Sparkles className="h-5 w-5 text-orange-500" />
        </div>
        <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
          Be first into the forge.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-zinc-400 md:text-lg">
          Early access is limited. Join the waitlist and we&apos;ll hand you the
          keys before anyone else — plus a founding-member rate for life.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <WaitlistForm variant="footer" />
          <p className="text-xs text-zinc-500">
            Launching soon. No credit card. No commitment.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-zinc-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
        <div className="flex items-center gap-2 text-zinc-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-orange-700">
            <Hammer className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-white">OnyxFit</span>
          <span className="text-xs text-zinc-600">· Forged in iron.</span>
        </div>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} OnyxFit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 font-sans text-white antialiased selection:bg-orange-600/30 selection:text-orange-100">
      <Nav />
      <Hero />
      <Stats />
      <Problem />
      <Features />
      <HowItWorks />
      <DualExperience />
      <BeyondBasics />
      <Integrations />
      <Comparison />
      <Founding />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
