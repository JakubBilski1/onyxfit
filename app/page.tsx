"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  Flame,
  Hammer,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
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
        <a href="#dual" className="text-sm text-zinc-400 transition-colors hover:text-white">
          For Trainers & Athletes
        </a>
        <a href="#waitlist" className="text-sm text-zinc-400 transition-colors hover:text-white">
          Early Access
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
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              No spam. Just a single message when we open the doors.
            </p>
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
      <Features />
      <DualExperience />
      <CTASection />
      <Footer />
    </main>
  );
}
