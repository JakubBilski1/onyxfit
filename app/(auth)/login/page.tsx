"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  readRememberFromDocument,
  writeRememberPreference,
} from "@/lib/supabase/cookie-policy";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Restore last-used preference so the checkbox state matches what's on the
  // wire. Defaults to checked for first-time visitors.
  useEffect(() => {
    setRemember(readRememberFromDocument());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    // Persist the preference BEFORE constructing the supabase client, since
    // createBrowserClient bakes cookieOptions in at construction time.
    writeRememberPreference(remember);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    // Hard navigate so the middleware sees the freshly-set auth cookies on
    // the very next request — router.push + refresh occasionally races and
    // the user ends up still on /login.
    window.location.assign(next);
  }

  return (
    <div>
      <span className="onyx-label">Sign in · v0.1</span>
      <h1 className="onyx-display text-5xl text-onyx-bone mt-3">Welcome back.</h1>
      <p className="text-[13px] text-onyx-mute mt-3">Coach console and admin god-mode share the same door.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-onyx-amber bg-transparent border border-onyx-line"
          />
          <span className="text-[12px] text-onyx-mute">
            Remember me <span className="text-onyx-dim">— stay signed in for 7 days on this device</span>
          </span>
        </label>
        {error && <p className="text-[12px] text-onyx-red font-mono">{error}</p>}
        <Button type="submit" variant="signal" size="lg" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Continue →"}
        </Button>
      </form>

      <div className="mt-10 flex items-center justify-between">
        <Link href="/signup" className="onyx-label hover:text-onyx-amber">No account? Apply →</Link>
        <Link href="/" className="font-mono text-[10px] text-onyx-dim hover:text-onyx-bone">← landing</Link>
      </div>
    </div>
  );
}
