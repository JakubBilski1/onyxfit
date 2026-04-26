"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "coach" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/pending-verification");
    router.refresh();
  }

  return (
    <div>
      <span className="onyx-label">Apply · Coach</span>
      <h1 className="onyx-display text-5xl text-onyx-bone mt-3">Join Onyx.</h1>
      <p className="text-[13px] text-onyx-mute mt-3">
        Coaches are admitted by review. Submit credentials after sign-up — verification typically takes 48h.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-[12px] text-onyx-red font-mono">{error}</p>}
        <Button type="submit" variant="signal" size="lg" disabled={busy} className="w-full">
          {busy ? "Creating…" : "Create account →"}
        </Button>
        <p className="text-[11px] font-mono text-onyx-dim leading-relaxed">
          By applying you agree to the platform terms · GDPR-compliant data handling · EU-hosted only.
        </p>
      </form>

      <div className="mt-10">
        <Link href="/login" className="onyx-label hover:text-onyx-amber">Already in? Sign in →</Link>
      </div>
    </div>
  );
}
