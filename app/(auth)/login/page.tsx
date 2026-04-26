"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
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
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
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
