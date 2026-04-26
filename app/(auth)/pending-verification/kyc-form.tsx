"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function KycForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const uploaded: Array<{ kind: string; storage_path: string; uploaded_at: string }> = [];
      if (files) {
        for (const f of Array.from(files)) {
          const path = `${user.id}/${Date.now()}-${f.name.replace(/[^a-z0-9.-]/gi, "_")}`;
          const { error: upErr } = await supabase.storage.from("kyc-documents").upload(path, f, { upsert: false });
          if (upErr) throw upErr;
          uploaded.push({ kind: "certificate", storage_path: path, uploaded_at: new Date().toISOString() });
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/coach-kyc-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          kyc_legal_name: legalName,
          kyc_tax_id: taxId,
          kyc_address: address ? { street: address } : null,
          kyc_documents: uploaded,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Submission failed");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label htmlFor="legal">Legal name</Label>
          <Input id="legal" required value={legalName} onChange={(e) => setLegalName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="tax">Tax ID / VAT</Label>
          <Input id="tax" required value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Business address</Label>
        <Textarea id="address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="files">Certificates · PDF or image</Label>
        <input
          id="files"
          type="file"
          multiple
          accept="application/pdf,image/*"
          onChange={(e) => setFiles(e.target.files)}
          required
          className="block w-full text-[12px] text-onyx-mute file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-onyx-bone file:text-onyx-ink file:font-mono file:text-[10px] file:tracking-widest file:uppercase file:cursor-pointer hover:file:bg-onyx-amber"
        />
      </div>
      {error && <p className="text-[12px] font-mono text-onyx-red">{error}</p>}
      <Button type="submit" variant="signal" size="lg" disabled={busy}>
        {busy ? "Submitting…" : "Submit for review →"}
      </Button>
    </form>
  );
}
