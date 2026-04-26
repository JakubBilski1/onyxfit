"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
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

  useEffect(() => {
    setRemember(readRememberFromDocument());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    writeRememberPreference(remember);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    window.location.assign(next);
  }

  return (
    <div>
      <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3">
        Sign in · v0.1
      </span>
      <h1 className="text-[36px] sm:text-[40px] font-semibold tracking-tight text-fg leading-[1.05] mt-3">
        Welcome <span className="text-gradient-brand">back</span>.
      </h1>
      <p className="text-[14px] text-fg-2 mt-3">
        Coach console and admin god-mode share the same door.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <span className="relative">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer sr-only"
            />
            <span className="block h-4 w-4 rounded-[4px] border border-line-strong bg-card transition-all duration-200 peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
            <svg
              className="absolute top-0 left-0 h-4 w-4 text-primary-fg p-0.5 opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: remember ? 1 : 0,
              }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-[12.5px] text-fg-2 group-hover:text-fg transition-colors">
            Remember me{" "}
            <span className="text-fg-3">— stay signed in for 7 days on this device</span>
          </span>
        </label>
        {error && (
          <p className="text-[12px] text-rose font-medium px-3 py-2 rounded-md bg-rose/10 border border-rose/30">
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={busy}
          className="w-full"
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/signup"
          className="text-[12.5px] font-medium text-fg-2 hover:text-primary transition-colors"
        >
          No account? Apply →
        </Link>
        <Link
          href="/"
          className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-fg-3 hover:text-fg transition-colors"
        >
          ← landing
        </Link>
      </div>
    </div>
  );
}
