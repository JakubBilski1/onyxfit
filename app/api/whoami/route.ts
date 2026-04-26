// Diagnostic endpoint — returns what the server sees about the current
// session. Visit https://onyx-coach.vercel.app/api/whoami while logged in
// (or not) and read the JSON to figure out where auth is breaking.
//
// TODO: remove once auth flow is confirmed stable.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieJar = cookies();
  const all = cookieJar.getAll();
  const supabase = getSupabaseServer();
  const { data: userData, error: userErr } = await supabase.auth.getUser();

  let profile: unknown = null;
  let profileErr: unknown = null;
  if (userData?.user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, verification_status, full_name, email")
      .eq("id", userData.user.id)
      .maybeSingle();
    profile = data;
    profileErr = error?.message ?? null;
  }

  return NextResponse.json({
    cookies_present: all.map((c) => ({
      name: c.name,
      value_preview: c.value.slice(0, 24) + (c.value.length > 24 ? "…" : ""),
      length: c.value.length,
    })),
    user: userData?.user
      ? {
          id: userData.user.id,
          email: userData.user.email,
        }
      : null,
    user_error: userErr?.message ?? null,
    profile,
    profile_error: profileErr,
  });
}
