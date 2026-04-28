"use client";

import { useRef, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  generateInviteCode,
  inviteClient,
  type InviteCodeResult,
  type InviteResult,
} from "./actions";

type Tab = "manual" | "code";

export function InviteClient({
  variant = "signal",
  label = "+ New client",
}: {
  variant?: "signal" | "ghost" | "default";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("code");

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="md"
        onClick={() => {
          setTab("code");
          setOpen(true);
        }}
      >
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Invite athlete">
        <div className="space-y-5">
          <div className="flex gap-1 p-1 rounded-md bg-fg/[.04] border border-line">
            <TabButton active={tab === "code"} onClick={() => setTab("code")}>
              Invite code
            </TabButton>
            <TabButton active={tab === "manual"} onClick={() => setTab("manual")}>
              Add manually
            </TabButton>
          </div>

          {tab === "code" ? (
            <CodePanel onClose={() => setOpen(false)} />
          ) : (
            <ManualPanel onClose={() => setOpen(false)} />
          )}
        </div>
      </Modal>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 px-3 py-2 rounded-md text-[12.5px] font-medium transition-colors",
        active
          ? "bg-card text-fg shadow-soft"
          : "text-fg-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function CodePanel({ onClose }: { onClose: () => void }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<InviteCodeResult | null>(null);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    setCopied(false);
    start(async () => {
      const r = await generateInviteCode(email);
      setResult(r);
    });
  }

  async function copy() {
    if (!result?.ok) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — silently no-op
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-fg-2 leading-relaxed">
        Generate a one-time code your athlete enters in the Onyx mobile app at
        signup. Valid for 7 days, single use.
      </p>

      <div>
        <Label htmlFor="ic-email">Pre-fill email (optional)</Label>
        <Input
          id="ic-email"
          type="email"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
        />
      </div>

      {result?.ok ? (
        <div className="rounded-lg border border-primary/30 bg-primary/[.06] p-4 space-y-3">
          <div className="onyx-label">Your code</div>
          <div className="flex items-center justify-between gap-3">
            <code className="text-[22px] font-mono tracking-[0.2em] text-fg select-all">
              {result.code}
            </code>
            <Button type="button" variant="ghost" size="sm" onClick={copy}>
              {copied ? "Copied ✓" : "Copy"}
            </Button>
          </div>
          <div className="text-[11px] font-mono text-fg-3">
            Expires {new Date(result.expiresAt).toLocaleString()}
          </div>
        </div>
      ) : null}

      {result && !result.ok && (
        <p className="text-[12px] font-mono text-rose">{result.error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="signal"
          size="md"
          onClick={generate}
          disabled={pending}
        >
          {pending
            ? "Generating…"
            : result?.ok
              ? "Generate another"
              : "Generate code →"}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function ManualPanel({ onClose }: { onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState<InviteResult | null, FormData>(
    async (prev, fd) => {
      const r = await inviteClient(prev, fd);
      if (r.ok) {
        formRef.current?.reset();
        // Hard-nav so middleware sees the refreshed Supabase session cookies.
        window.location.assign(`/dashboard/clients/${r.clientId}`);
      }
      return r;
    },
    null,
  );

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <Label htmlFor="invite-name">Full name *</Label>
        <Input
          id="invite-name"
          name="full_name"
          required
          maxLength={120}
          placeholder="Jane Doe"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            maxLength={200}
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <Label htmlFor="invite-phone">Phone</Label>
          <Input
            id="invite-phone"
            name="phone"
            type="tel"
            maxLength={40}
            placeholder="+48 600 000 000"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="invite-goals">Goals</Label>
        <Textarea
          id="invite-goals"
          name="goals"
          rows={3}
          maxLength={1000}
          placeholder="What are they here for?"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invite-rate">Monthly rate (cents)</Label>
          <Input
            id="invite-rate"
            name="monthly_rate_cents"
            type="number"
            min={0}
            step={1}
            placeholder="29900"
          />
        </div>
        <div>
          <Label htmlFor="invite-currency">Currency</Label>
          <Input
            id="invite-currency"
            name="currency"
            maxLength={3}
            defaultValue="EUR"
          />
        </div>
      </div>

      {state && !state.ok && (
        <p className="text-[12px] font-mono text-rose">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Submit />
        <Button type="button" variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="signal" size="md" disabled={pending}>
      {pending ? "Adding…" : "Add athlete →"}
    </Button>
  );
}
