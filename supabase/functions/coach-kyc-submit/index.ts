// Onyx Coach · Edge Function · coach-kyc-submit
//
// Called by app/(auth)/pending-verification/kyc-form.tsx after the client
// uploads their docs to Storage. The function:
//   1. Validates the JSON payload.
//   2. Verifies the caller is an authenticated coach.
//   3. Confirms each `storage_path` actually exists in the kyc-documents bucket
//      and lives under the caller's own folder.
//   4. Writes kyc_* fields into public.profiles AND flips
//      verification_status -> under_review + stamps kyc_submitted_at.
//
// Run locally:   supabase functions serve coach-kyc-submit --no-verify-jwt
// Deploy:        supabase functions deploy coach-kyc-submit
//
// deno-lint-ignore-file no-explicit-any

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type KycDocument = {
  kind: string;
  storage_path: string;
  uploaded_at?: string;
};

type Payload = {
  kyc_legal_name: string;
  kyc_tax_id: string;
  kyc_address?: Record<string, unknown> | null;
  kyc_documents: KycDocument[];
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function bad(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function validatePayload(input: any): Payload | string {
  if (!input || typeof input !== "object") return "invalid body";
  if (!isNonEmptyString(input.kyc_legal_name))
    return "kyc_legal_name required";
  if (!isNonEmptyString(input.kyc_tax_id)) return "kyc_tax_id required";
  if (!Array.isArray(input.kyc_documents) || input.kyc_documents.length === 0)
    return "at least one document required";

  for (const d of input.kyc_documents) {
    if (!d || typeof d !== "object") return "malformed document entry";
    if (!isNonEmptyString(d.kind)) return "document.kind required";
    if (!isNonEmptyString(d.storage_path))
      return "document.storage_path required";
  }

  return {
    kyc_legal_name: input.kyc_legal_name.trim(),
    kyc_tax_id: input.kyc_tax_id.trim(),
    kyc_address:
      input.kyc_address && typeof input.kyc_address === "object"
        ? input.kyc_address
        : null,
    kyc_documents: input.kyc_documents.map((d: any) => ({
      kind: d.kind,
      storage_path: d.storage_path,
      uploaded_at: d.uploaded_at ?? new Date().toISOString(),
    })),
  };
}

async function getAuthedUser(req: Request): Promise<
  | { client: SupabaseClient; userId: string }
  | { error: string; status: number }
> {
  const auth = req.headers.get("Authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) {
    return { error: "missing bearer token", status: 401 };
  }
  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return { error: "invalid token", status: 401 };
  return { client: userClient, userId: data.user.id };
}

async function verifyDocumentsExist(
  admin: SupabaseClient,
  userId: string,
  docs: KycDocument[],
): Promise<string | null> {
  for (const d of docs) {
    // every doc must live under "<userId>/..."
    const segments = d.storage_path.split("/");
    if (segments[0] !== userId) {
      return `document path ${d.storage_path} not in caller's folder`;
    }
    const folder = segments.slice(0, -1).join("/");
    const file = segments[segments.length - 1];
    const { data, error } = await admin.storage
      .from("kyc-documents")
      .list(folder, { search: file, limit: 1 });
    if (error) return `storage check failed: ${error.message}`;
    if (!data || data.length === 0) {
      return `document not found: ${d.storage_path}`;
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return bad("method not allowed", 405);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("invalid json");
  }

  const validated = validatePayload(body);
  if (typeof validated === "string") return bad(validated);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return bad(authed.error, authed.status);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Caller must be an existing coach in pending/rejected state.
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id, role, verification_status")
    .eq("id", authed.userId)
    .maybeSingle();
  if (profileErr) return bad(profileErr.message, 500);
  if (!profile) return bad("profile not found", 404);
  if (profile.role !== "coach") return bad("only coaches can submit KYC", 403);
  if (
    profile.verification_status !== "pending_verification" &&
    profile.verification_status !== "rejected"
  ) {
    return bad(
      `cannot submit KYC from status ${profile.verification_status}`,
      409,
    );
  }

  const missing = await verifyDocumentsExist(
    admin,
    authed.userId,
    validated.kyc_documents,
  );
  if (missing) return bad(missing, 400);

  const { error: upErr } = await admin
    .from("profiles")
    .update({
      kyc_legal_name: validated.kyc_legal_name,
      kyc_tax_id: validated.kyc_tax_id,
      kyc_address: validated.kyc_address,
      kyc_documents: validated.kyc_documents,
      kyc_submitted_at: new Date().toISOString(),
      kyc_rejection_reason: null,
      verification_status: "under_review",
    })
    .eq("id", authed.userId);
  if (upErr) return bad(upErr.message, 500);

  return json({
    ok: true,
    verification_status: "under_review",
    submitted_documents: validated.kyc_documents.length,
  });
});
