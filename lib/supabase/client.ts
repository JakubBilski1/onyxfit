"use client";

import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions, readRememberFromDocument } from "./cookie-policy";

export function getSupabaseBrowser() {
  const remember = readRememberFromDocument();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: authCookieOptions(remember),
    },
  );
}
