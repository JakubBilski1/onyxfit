"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { writeRememberPreference } from "@/lib/supabase/cookie-policy";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    writeRememberPreference(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "coach" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    window.location.assign("/pending-verification");
  }

  return (
    <div>
      <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-fg-3">
        Apply · Coach
      </span>
      <h1 className="text-[36px] sm:text-[40px] font-semibold tracking-tight text-fg leading-[1.05] mt-3">
        Join <span className="text-gradient-brand">Onyx</span>.
      </h1>
      <p className="text-[14px] text-fg-2 mt-3">
        Coaches are admitted by review. Submit credentials after sign-up —
        verification typically takes 48h.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Anna Kowalska"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
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
              Creating…
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={16} />
            </>
          )}
        </Button>
        <p className="text-[11px] text-fg-3 leading-relaxed">
          By applying you agree to the platform terms · GDPR-compliant data
          handling · EU-hosted only.
        </p>
      </form>

      <div className="mt-8">
        <Link
          href="/login"
          className="text-[12.5px] font-medium text-fg-2 hover:text-primary transition-colors"
        >
          Already in? Sign in →
        </Link>
      </div>
    </div>
  );
}
