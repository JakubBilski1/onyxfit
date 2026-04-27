"use client";

import {
  Activity,
  Apple,
  Bell,
  ChevronRight,
  Filter,
  Hammer,
  Heart,
  Home,
  Moon,
  Play,
  Plus,
  Search,
  ScanLine,
  Sparkles,
  Sun,
  Triangle,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

/* ---------- Shared dashboard chrome ---------- */

const ATHLETES = [
  { name: "Marek Kowalski", short: "MK", grad: "from-sky to-violet" },
  { name: "Anna Nowak", short: "AN", grad: "from-rose to-primary" },
  { name: "Tomasz Bielski", short: "TB", grad: "from-primary to-rose" },
  { name: "Karolina Wiśniewska", short: "KW", grad: "from-emerald to-sky" },
  { name: "Jakub Zieliński", short: "JZ", grad: "from-violet to-sky" },
  { name: "Patrycja Mazur", short: "PM", grad: "from-rose to-violet" },
] as const;

function NavGroup({
  label,
  items,
}: {
  label: string;
  items: { icon: typeof Home; name: string; active?: boolean }[];
}) {
  return (
    <div className="px-3 py-2">
      <div className="px-2 pb-1.5 text-[9px] font-mono uppercase tracking-[0.18em] text-fg-3">
        {label}
      </div>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li
              key={it.name}
              className={[
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                it.active
                  ? "bg-primary text-primary-fg shadow-[0_4px_16px_rgb(var(--c-primary)/0.35)]"
                  : "text-fg-2 hover:text-fg",
              ].join(" ")}
            >
              <Icon className="h-3 w-3" />
              <span>{it.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MockSidebar({ active }: { active: string }) {
  const TODAY = [{ icon: Home, name: "Triage", active: active === "Triage" }];
  const ATHLETE_NAV = [
    { icon: Users, name: "Clients", active: active === "Clients" },
    { icon: ScanLine, name: "Form Studio", active: active === "Form Studio" },
  ];
  const PROG = [
    { icon: Hammer, name: "The Forge", active: active === "The Forge" },
    { icon: Apple, name: "Nutrition", active: active === "Nutrition" },
    { icon: Heart, name: "Recovery", active: active === "Recovery" },
  ];
  return (
    <aside className="w-[180px] border-r border-line bg-surface flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-violet flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-primary-fg" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-fg tracking-tight">
            Onyx
          </div>
          <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-fg-3">
            COACH CONSOLE
          </div>
        </div>
      </div>
      <NavGroup label="TODAY" items={TODAY} />
      <NavGroup label="ATHLETES" items={ATHLETE_NAV} />
      <NavGroup label="PROGRAMMING" items={PROG} />
      <div className="mt-auto px-3 py-3 border-t border-line flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-violet flex-shrink-0" />
        <div className="flex-1 leading-tight">
          <div className="text-[11px] font-medium text-fg">You</div>
          <div className="text-[9px] text-fg-3">Coach</div>
        </div>
        <ChevronRight className="h-3 w-3 text-fg-3" />
      </div>
    </aside>
  );
}

function MockTopbar() {
  return (
    <div className="h-10 border-b border-line flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
        </span>
        <span className="text-[10px] font-mono text-fg-3">Tuesday, 22 Apr</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 h-6 px-2 rounded-md bg-card border border-line text-[10px] font-mono text-fg-3">
          <Search className="h-3 w-3" />
          <span>Search</span>
          <span className="ml-2 px-1 rounded bg-bg border border-line">⌘K</span>
        </div>
        <div className="relative h-6 w-6 rounded-md bg-card border border-line flex items-center justify-center">
          <Bell className="h-3 w-3 text-fg-2" />
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-rose" />
        </div>
        <div className="h-6 w-6 rounded-md bg-card border border-line flex items-center justify-center">
          <Sun className="h-3 w-3 text-fg-2" />
        </div>
      </div>
    </div>
  );
}

function DashShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full bg-bg">
      <MockSidebar active={active} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MockTopbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function PageHead({
  eyebrow,
  title,
  emphasis,
  cta,
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
  cta?: string;
}) {
  return (
    <div className="px-5 py-4 border-b border-line flex items-center justify-between">
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-fg leading-none">
          {title}{" "}
          {emphasis && (
            <span className="font-display italic text-gradient-brand">
              {emphasis}
            </span>
          )}
          .
        </h2>
      </div>
      {cta && (
        <button className="text-[10px] font-medium px-2.5 py-1.5 rounded-md bg-primary text-primary-fg shadow-[0_4px_16px_rgb(var(--c-primary)/0.35)]">
          {cta}
        </button>
      )}
    </div>
  );
}

/* ---------- Mock 1: Triage ---------- */

export function MockTriage() {
  const KPIS = [
    { eyebrow: "ATHLETES", value: "38", hint: "active this week", bar: "bg-primary" },
    { eyebrow: "RED FLAGS", value: "02", hint: "need attention", bar: "bg-rose" },
    { eyebrow: "GREEN · 24h", value: "11", hint: "PRs + adherence", bar: "bg-emerald" },
    { eyebrow: "ACTIVITY · 24h", value: "247", hint: "events logged", bar: "bg-violet" },
  ];
  const FLAGS = [
    {
      kind: "RED" as const,
      title: "Missed 2 sessions in a row",
      who: "Anna Nowak",
      label: "ADHERENCE",
      time: "2h ago",
    },
    {
      kind: "RED" as const,
      title: "RPE drift > +1 across week",
      who: "Jakub Zieliński",
      label: "FATIGUE",
      time: "6h ago",
    },
    {
      kind: "GREEN" as const,
      title: "Squat PR · +12.5kg",
      who: "Tomasz Bielski",
      label: "PR",
      time: "1h ago",
    },
  ];
  const FEED = [
    { who: "Marek Kowalski", short: "MK", grad: "from-sky to-violet", badge: "WORKOUT", time: "12m" },
    { who: "Karolina Wiśniewska", short: "KW", grad: "from-emerald to-sky", badge: "MEAL", time: "28m" },
    { who: "Tomasz Bielski", short: "TB", grad: "from-primary to-rose", badge: "PR", time: "1h" },
    { who: "Patrycja Mazur", short: "PM", grad: "from-rose to-violet", badge: "WORKOUT", time: "2h" },
    { who: "Anna Nowak", short: "AN", grad: "from-rose to-primary", badge: "MISSED", time: "3h" },
  ];
  return (
    <DashShell active="Triage">
      <div className="p-4 h-full overflow-hidden">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {KPIS.map((k) => (
            <div
              key={k.eyebrow}
              className="relative rounded-md bg-card border border-line overflow-hidden"
            >
              <div className={`h-[3px] w-full ${k.bar}`} />
              <div className="p-3">
                <div className="text-[8px] font-mono uppercase tracking-[0.22em] text-fg-3">
                  {k.eyebrow}
                </div>
                <div className="mt-1 font-mono text-2xl tabular-nums text-fg leading-none">
                  {k.value}
                </div>
                <div className="mt-1 text-[9px] text-fg-3">{k.hint}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Body */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          {/* Flags 2/3 */}
          <div className="col-span-2 rounded-md bg-card border border-line">
            <div className="px-3 py-2 border-b border-line flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
                Flags requiring you
              </div>
              <div className="text-[9px] text-fg-3">3 active</div>
            </div>
            <div className="divide-y divide-line">
              {FLAGS.map((f, i) => (
                <div
                  key={i}
                  className={`px-3 py-2.5 border-l-2 ${f.kind === "RED" ? "border-l-rose" : "border-l-emerald"}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        f.kind === "RED"
                          ? "bg-rose/10 text-rose"
                          : "bg-emerald/10 text-emerald"
                      }`}
                    >
                      {f.kind}
                    </span>
                    <span className="text-[10px] font-mono text-fg-3 uppercase tracking-wider">
                      {f.label}
                    </span>
                    <span className="ml-auto text-[9px] font-mono text-fg-3">
                      {f.time}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] text-fg leading-tight">
                    {f.title}
                  </div>
                  <div className="text-[10px] text-fg-3">{f.who}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Feed 1/3 */}
          <div className="rounded-md bg-card border border-line">
            <div className="px-3 py-2 border-b border-line flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-fg-3">
                Daily feed
              </div>
              <div className="flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
                </span>
                <span className="text-[8px] font-mono text-emerald">LIVE</span>
              </div>
            </div>
            <div className="divide-y divide-line">
              {FEED.map((e, i) => (
                <div key={i} className="px-2.5 py-2 flex items-center gap-2">
                  <div
                    className={`h-5 w-5 rounded-full bg-gradient-to-br ${e.grad} flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-fg truncate">{e.who}</div>
                  </div>
                  <span className="text-[8px] font-mono text-fg-3 uppercase tracking-wider">
                    {e.badge}
                  </span>
                  <span className="text-[8px] font-mono text-fg-3">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------- Mock 2: Clients ---------- */

export function MockClients() {
  const ROWS = [
    { who: ATHLETES[0], status: "LIVE", started: "12 Mar", mrr: "€220" },
    { who: ATHLETES[1], status: "LIVE", started: "08 Feb", mrr: "€180" },
    { who: ATHLETES[2], status: "ONBOARDING", started: "20 Apr", mrr: "€260", hover: true },
    { who: ATHLETES[3], status: "LIVE", started: "02 Jan", mrr: "€220" },
    { who: ATHLETES[4], status: "LIVE", started: "18 Mar", mrr: "€180" },
    { who: ATHLETES[5], status: "MEDICAL Q", started: "21 Apr", mrr: "—" },
  ];

  const statusBadge = (s: string) => {
    if (s === "LIVE")
      return "bg-emerald/10 text-emerald border-emerald/30";
    if (s === "ONBOARDING")
      return "bg-primary/10 text-primary border-primary/30";
    return "bg-card-2 text-fg-2 border-line";
  };

  return (
    <DashShell active="Clients">
      <PageHead
        eyebrow="THE ROSTER"
        title="Your"
        emphasis="athletes"
        cta="+ Invite athlete"
      />
      <div className="p-4">
        <div className="rounded-md bg-card border border-line overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-line text-[8px] font-mono uppercase tracking-[0.22em] text-fg-3">
            <div className="col-span-5">Athlete</div>
            <div className="col-span-3">Onboarding</div>
            <div className="col-span-2">Started</div>
            <div className="col-span-2 text-right">Plan</div>
          </div>
          <div className="divide-y divide-line">
            {ROWS.map((r, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 gap-2 px-3 py-2 items-center ${r.hover ? "bg-fg/[.03]" : ""}`}
              >
                <div className="col-span-5 flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-md bg-gradient-to-br ${r.who.grad} flex-shrink-0`}
                  />
                  <div className="leading-tight min-w-0">
                    <div
                      className={`text-[12px] truncate ${r.hover ? "text-primary" : "text-fg"}`}
                    >
                      {r.who.name}
                    </div>
                    <div className="text-[10px] text-fg-3 truncate">
                      {r.who.short.toLowerCase()}@example.com
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <span
                    className={`inline-flex items-center text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusBadge(r.status)}`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="col-span-2 text-[10px] font-mono text-fg-2">
                  {r.started}
                </div>
                <div className="col-span-2 text-right text-[10px] font-mono text-fg">
                  {r.mrr}
                  <span className="text-fg-3"> /mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------- Mock 3: Forge (program builder) ---------- */

export function MockForge() {
  const EXES = [
    { name: "Back Squat", scheme: "5 × 3 @ RPE 8" },
    { name: "Tempo Front Squat", scheme: "4 × 5 @ 31X1" },
    { name: "Romanian Deadlift", scheme: "3 × 8 @ RPE 7" },
    { name: "Walking Lunge", scheme: "3 × 12 ea." },
  ];
  const LIBRARY = [
    { name: "Bench Press", group: "bg-rose", eq: "BARBELL" },
    { name: "Pull-up", group: "bg-violet", eq: "BODYWEIGHT" },
    { name: "Conv. Deadlift", group: "bg-primary", eq: "BARBELL" },
    { name: "Overhead Press", group: "bg-emerald", eq: "BARBELL" },
    { name: "Bulgarian Split", group: "bg-sky", eq: "DUMBBELL" },
    { name: "Hip Thrust", group: "bg-rose", eq: "BARBELL" },
  ];
  return (
    <DashShell active="The Forge">
      <PageHead
        eyebrow="THE FORGE"
        title="Where"
        emphasis="programs"
        cta="+ Save template"
      />
      <div className="p-4 grid grid-cols-5 gap-3">
        {/* Builder 60% */}
        <div className="col-span-3 space-y-2">
          <div className="rounded-md bg-card border border-line">
            <div className="onyx-forge-rail px-3 py-2 border-b border-line flex items-center justify-between">
              <div className="text-[11px] font-medium text-fg">
                Block A · Upper Strength
              </div>
              <div className="text-[9px] font-mono text-fg-3">WEEK 4 / 12</div>
            </div>
            <div className="divide-y divide-line">
              {EXES.map((e, i) => (
                <div key={i} className="px-3 py-2 flex items-center gap-2">
                  <div
                    aria-hidden
                    className="grid grid-cols-2 gap-[2px] flex-shrink-0"
                  >
                    {Array.from({ length: 8 }).map((_, k) => (
                      <span
                        key={k}
                        className="h-0.5 w-0.5 rounded-full bg-fg-3"
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-fg truncate">{e.name}</div>
                    <div className="text-[9px] font-mono text-fg-3 truncate">
                      {e.scheme}
                    </div>
                  </div>
                  <button className="text-[9px] font-mono text-fg-3 hover:text-primary">
                    Edit
                  </button>
                </div>
              ))}
              <div className="px-3 py-2 border border-dashed border-line m-2 rounded text-center text-[9px] font-mono text-fg-3">
                + Add exercise
              </div>
            </div>
          </div>
          <div className="rounded-md bg-card border border-line px-3 py-2 flex items-center justify-between">
            <div className="text-[11px] font-medium text-fg">
              Block B · Pull
            </div>
            <div className="text-[9px] font-mono text-fg-3">5 exercises</div>
          </div>
        </div>
        {/* Library 40% */}
        <div className="col-span-2">
          <div className="rounded-md bg-card border border-line">
            <div className="px-3 py-2 border-b border-line">
              <div className="flex items-center gap-1.5 h-6 px-2 rounded bg-bg border border-line text-[10px] font-mono text-fg-3">
                <Search className="h-2.5 w-2.5" />
                <span className="flex-1">Exercise library</span>
                <span className="px-1 rounded bg-card border border-line">
                  ⌘K
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {["Compound", "Push", "Lower"].map((c) => (
                  <span
                    key={c}
                    className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-line text-fg-3"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="divide-y divide-line">
              {LIBRARY.map((l, i) => (
                <div key={i} className="px-3 py-1.5 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${l.group}`}
                  />
                  <span className="text-[10px] text-fg flex-1 truncate">
                    {l.name}
                  </span>
                  <span className="text-[8px] font-mono text-fg-3">
                    {l.eq}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------- Mock 4: Nutrition ---------- */

export function MockNutrition() {
  const MACROS = [
    { kcal: "2,840", label: "kcal target" },
    { g: "220", suffix: "g", label: "protein" },
    { g: "320", suffix: "g", label: "carbs" },
    { g: "78", suffix: "g", label: "fat" },
  ];
  const FOODS = [
    { name: "Bison ribeye", brand: "Local farm", k: "240", p: "26", c: "0", f: "14" },
    { name: "Steel-cut oats", brand: "Bob's", k: "150", p: "5", c: "27", f: "3" },
    { name: "Greek yogurt 0%", brand: "Fage", k: "100", p: "18", c: "6", f: "0" },
  ];
  return (
    <DashShell active="Nutrition">
      <PageHead
        eyebrow="NUTRITION HUB"
        title="Macros, fuel,"
        emphasis="phases"
      />
      <div className="p-4 space-y-3">
        {/* Athlete picker */}
        <div className="flex items-center gap-2 overflow-hidden">
          {ATHLETES.slice(0, 4).map((a, i) => (
            <div
              key={a.name}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] flex-shrink-0 ${
                i === 2
                  ? "bg-primary/5 border-primary text-fg"
                  : "border-line text-fg-2"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-gradient-to-br ${a.grad}`}
              />
              <span className="truncate max-w-[80px]">{a.name}</span>
            </div>
          ))}
        </div>
        {/* Editor card */}
        <div className="rounded-md bg-card border border-line p-3">
          {/* Phase pills */}
          <div className="flex items-center gap-1.5">
            {[
              { name: "Cut", active: false },
              { name: "Maintain", active: true },
              { name: "Lean Bulk", active: false },
              { name: "Recomp", active: false },
            ].map((p) => (
              <span
                key={p.name}
                className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  p.active
                    ? "bg-primary text-primary-fg"
                    : "border border-line text-fg-3"
                }`}
              >
                {p.name}
              </span>
            ))}
          </div>
          {/* Macro numerals */}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {MACROS.map((m, i) => (
              <div key={i}>
                <div className="font-display italic text-3xl text-fg leading-none tracking-tight">
                  {m.kcal ?? m.g}
                  {m.suffix && (
                    <span className="text-base text-fg-2">{m.suffix}</span>
                  )}
                </div>
                <div className="mt-1 text-[8px] font-mono uppercase tracking-[0.22em] text-fg-3">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
          {/* Stacked bar */}
          <div className="mt-3 h-2 w-full rounded-full overflow-hidden flex">
            <div className="h-full bg-primary" style={{ width: "30%" }} />
            <div className="h-full bg-sky" style={{ width: "45%" }} />
            <div className="h-full bg-violet" style={{ width: "25%" }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[8px] font-mono text-fg-3">
            <span>P · 220g (30%)</span>
            <span>C · 320g (45%)</span>
            <span>F · 78g (25%)</span>
          </div>
          {/* Notes */}
          <div className="mt-3 rounded bg-bg border border-line p-2 text-[10px] text-fg-2 leading-relaxed">
            High-carb on training days. Keep fats low pre-workout. Hydrate
            aggressively — minimum 4L.
          </div>
        </div>
        {/* Custom foods */}
        <div className="rounded-md bg-card border border-line">
          <div className="px-3 py-2 border-b border-line text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
            Custom foods · meal-builder library
          </div>
          <div className="divide-y divide-line">
            {FOODS.map((f, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] items-center"
              >
                <div className="col-span-4 text-fg truncate">{f.name}</div>
                <div className="col-span-3 text-fg-3 font-mono truncate">
                  {f.brand}
                </div>
                <div className="col-span-1 text-right font-mono text-fg-2">
                  {f.k}
                </div>
                <div className="col-span-1 text-right font-mono text-primary">
                  {f.p}
                </div>
                <div className="col-span-1 text-right font-mono text-sky">
                  {f.c}
                </div>
                <div className="col-span-1 text-right font-mono text-violet">
                  {f.f}
                </div>
                <div className="col-span-1 text-right font-mono text-fg-3">
                  Apr
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------- Mock 5: Form Studio ---------- */

export function MockFormStudio() {
  const PINS = [
    { color: "bg-rose", at: 12, note: "Knees caving in" },
    { color: "bg-primary", at: 38, note: "Bar drift forward" },
    { color: "bg-emerald", at: 71, note: "Lockout strong" },
  ];
  return (
    <DashShell active="Form Studio">
      <PageHead eyebrow="FORM STUDIO" title="Frame-perfect" emphasis="feedback" />
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          {/* Video */}
          <div className="aspect-[16/9] rounded-md bg-gradient-to-br from-line-strong to-bg border border-line relative flex items-center justify-center">
            <button className="h-10 w-10 rounded-full bg-primary text-primary-fg flex items-center justify-center shadow-[0_4px_16px_rgb(var(--c-primary)/0.35)]">
              <Play className="h-4 w-4 ml-0.5" />
            </button>
            <span className="absolute bottom-2 left-2 text-[9px] font-mono text-fg bg-bg/60 px-1.5 py-0.5 rounded">
              0:42 / 1:24
            </span>
          </div>
          {/* Timeline */}
          <div className="relative h-1 rounded-full bg-line">
            <div className="absolute top-0 left-0 h-full w-[42%] rounded-full bg-primary" />
            {PINS.map((p, i) => (
              <div
                key={i}
                className={`absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ring-2 ring-bg ${p.color}`}
                style={{ left: `${p.at}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-fg-3">
            <span>0:00</span>
            <span>0:42</span>
            <span>1:24</span>
          </div>
          {/* Annotations list */}
          <div className="rounded-md bg-card border border-line">
            <div className="px-3 py-2 border-b border-line text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
              Annotations · 3
            </div>
            <div className="divide-y divide-line">
              {PINS.map((p, i) => (
                <div key={i} className="px-3 py-1.5 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${p.color}`} />
                  <span className="text-[10px] text-fg flex-1 truncate">
                    {p.note}
                  </span>
                  <span className="text-[9px] font-mono text-fg-3">
                    {p.at}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Coach feedback */}
        <div className="col-span-1 rounded-md bg-card border border-line p-3">
          <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
            Coach feedback
          </div>
          <p className="mt-2 text-[10px] text-fg-2 leading-relaxed">
            Bracing is solid off the floor. Watch knee tracking on rep 3 — the
            cue is &quot;feet wide, knees out.&quot; The bar drift forward at
            lockout is just a habit; we&apos;ll fix it next session with paused
            front squats.
          </p>
          <button className="mt-3 w-full text-[10px] font-medium px-2 py-1.5 rounded-md border border-line text-fg hover:bg-card-2">
            Re-record voiceover
          </button>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------- Mock 6: Athlete profile (workflow) ---------- */

export function MockAthlete() {
  const STATS = [
    { v: "92%", l: "adherence" },
    { v: "4", l: "PRs · block" },
    { v: "7.8", l: "avg RPE" },
    { v: "2h", l: "last session" },
  ];
  const SESSIONS = [
    { d: "Mon 21 Apr", n: "Upper · Heavy", rpe: "8.5" },
    { d: "Sat 19 Apr", n: "Lower · Volume", rpe: "7.5" },
    { d: "Thu 17 Apr", n: "Upper · Tempo", rpe: "8.0" },
    { d: "Tue 15 Apr", n: "Lower · Heavy", rpe: "9.0" },
    { d: "Sun 13 Apr", n: "Conditioning", rpe: "7.0" },
  ];
  return (
    <DashShell active="Clients">
      <div className="px-5 py-4 border-b border-line flex items-center gap-3">
        <div className="h-12 w-12 rounded-md bg-gradient-to-br from-sky to-violet flex-shrink-0" />
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight text-fg leading-none">
            Marek Kowalski
          </h2>
          <div className="mt-1 text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
            POWERLIFTING · SINCE MAR 2025
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="rounded-md bg-card border border-line p-2.5"
            >
              <div className="font-mono text-lg tabular-nums text-fg leading-none">
                {s.v}
              </div>
              <div className="mt-1 text-[8px] font-mono uppercase tracking-[0.22em] text-fg-3">
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-card border border-line">
            <div className="px-3 py-2 border-b border-line text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
              Recent sessions
            </div>
            <div className="divide-y divide-line">
              {SESSIONS.map((s, i) => (
                <div key={i} className="px-3 py-1.5 flex items-center gap-2">
                  <span className="text-[9px] font-mono text-fg-3 w-20 flex-shrink-0">
                    {s.d}
                  </span>
                  <span className="text-[10px] text-fg flex-1 truncate">
                    {s.n}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-primary/10 text-primary">
                    RPE {s.rpe}
                  </span>
                  <span className="text-emerald text-xs">✓</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md bg-card border border-line p-3">
            <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-fg-3">
              Biomarker map
            </div>
            <svg viewBox="0 0 200 80" className="mt-2 w-full h-20">
              <polyline
                points="10,60 50,50 90,55 130,30 170,20 195,15"
                fill="none"
                stroke="rgb(var(--c-primary))"
                strokeWidth="1.5"
              />
              {[
                [10, 60],
                [50, 50],
                [90, 55],
                [130, 30],
                [170, 20],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="rgb(var(--c-primary))"
                />
              ))}
            </svg>
            <div className="mt-1 flex justify-between text-[8px] font-mono text-fg-3">
              <span>Wk 1</span>
              <span>Wk 12</span>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
