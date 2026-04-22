# OnyxFit — Landing Page

> Forged in iron. Built for the elite trainer and their athletes.

A modern, conversion-focused landing page for **OnyxFit**, an all-in-one platform for personal trainers and their clients. Built with Next.js 14 App Router, Tailwind CSS, and Lucide icons.

## Stack

- [Next.js 14](https://nextjs.org) — App Router, React Server Components
- [Tailwind CSS](https://tailwindcss.com) — dark-mode-first design system
- [Lucide React](https://lucide.dev) — icon set
- Inline, shadcn-style UI primitives (`Button`, `Card`, `Input`, `Badge`) — no runtime dependency

## Design language

- **Strict dark mode.** `zinc-950` base, `zinc-900` cards, white text.
- **Forge accent.** Rust-orange (`orange-500` / `orange-600`) for CTAs and highlights.
- **Aura.** Elite, raw, professional — iron, forge, hard work. Not lifestyle. Not cute.

## Sections

1. **Hero** — "In the Forge" early-access badge, H1 about the final link between trainer & athlete, email waitlist CTA.
2. **Features Grid** — Roster Command, Program Architect, Direct Line & Form Checks, Automated Payments.
3. **Dual Experience** — The Trainer's Command Center vs. The Athlete's Arena, each with a live-feeling UI mock.
4. **Closing CTA** — Founding-member pitch with a second waitlist form.
5. **Footer** — Minimal brand + copyright.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

```
app/
  layout.tsx     # root layout, metadata, Inter font
  page.tsx       # the entire landing page (single file, drop-in ready)
  globals.css    # Tailwind layers + base tweaks
tailwind.config.ts
next.config.mjs
```

The landing page is intentionally kept to a **single `page.tsx` file** so it can be inspected end-to-end and pasted straight into any other Next.js project.

## Wiring up the waitlist

The form in `app/page.tsx` currently calls a local `setSubmitted(true)`. Replace the body of `handleSubmit` with a POST to your email service (Resend, Loops, ConvertKit, Mailchimp, a custom API route, etc.).

## License

© OnyxFit. All rights reserved.
