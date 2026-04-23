# OnyxFit — Landing Page

> Forged in iron. Built for the elite trainer and their athletes.

A modern, conversion-focused landing page for **OnyxFit**, the trainer-client platform for personal trainers and their clients. Built with Next.js 14 App Router, Tailwind CSS, and Lucide icons.

OnyxFit focuses on the human relationship — communication, calendar, booking, trainer profiles, program & diet creation, and tracking. AI coaching and advanced self-directed tracking live in our companion product, **Anvil**, which plugs into OnyxFit out of the box.

## Stack

- [Next.js 14](https://nextjs.org) — App Router, React Server Components
- [Tailwind CSS](https://tailwindcss.com) — with full light/dark theming (class strategy)
- [Lucide React](https://lucide.dev) — icon set
- Inline, shadcn-style UI primitives (`Button`, `Card`, `Input`, `Badge`, `ThemeToggle`) — no runtime dependency

## Design language

- **Dark-first, light-ready.** `zinc-950` base / `zinc-900` cards in dark, white / `zinc-50` in light.
- **Forge accent.** Rust-orange (`orange-500` / `orange-600`) for CTAs and highlights.
- **Aura.** Elite, raw, professional — iron, forge, hard work. Not lifestyle. Not cute.

## Theme toggle

Sun/Moon toggle in the nav. Saves the user's choice to `localStorage` under `onyxfit-theme`. A blocking inline script in `<head>` hydrates the `dark` class before paint to prevent FOUC, falling back to `prefers-color-scheme` for first-time visitors.

## Sections

1. **Hero** — "In the Forge" early-access badge, H1 about the final link between trainer & athlete, email waitlist CTA, founding-spots counter.
2. **Stats bar** — 4 credibility metrics.
3. **Problem** — 3 pain-points framing "the old way".
4. **Features Grid** — Roster & Calendar, Program & Diet Builder, Direct Line & Form Checks, Bookings & Payments.
5. **How It Works** — 3 steps: Onboard → Build → Scale.
6. **Dual Experience** — Trainer's Command Center vs. Athlete's Arena, each with a live UI mock.
7. **Beyond the Basics** — 6 additional capabilities: marketplace, public coach profile, white-label app, progress biometrics, business analytics, template library.
8. **Integrations** — Stripe, Apple Health, Google Calendar, Whoop, Garmin, Oura, Strava, Zoom.
9. **Comparison table** — OnyxFit vs. Spreadsheets vs. Legacy apps.
10. **Anvil cross-promo** — companion AI product callout.
11. **Founding 100** — scarcity tier with perks and inline waitlist.
12. **FAQ** — 7-question accordion.
13. **Closing CTA** — Founding-member pitch with a second waitlist form.
14. **Footer** — Minimal brand + copyright.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

```
app/
  layout.tsx     # root layout, metadata, Inter font, theme-preload script
  page.tsx       # the entire landing page (single file, drop-in ready)
  globals.css    # Tailwind layers + grid-line CSS vars
tailwind.config.ts
next.config.mjs
```

The landing page is intentionally kept to a **single `page.tsx` file** so it can be inspected end-to-end and pasted straight into any other Next.js project.

## Wiring up the waitlist

The form in `app/page.tsx` currently calls a local `setSubmitted(true)`. Replace the body of `handleSubmit` with a POST to your email service (Resend, Loops, ConvertKit, Mailchimp, a custom API route, etc.).

## License

© OnyxFit. All rights reserved.
