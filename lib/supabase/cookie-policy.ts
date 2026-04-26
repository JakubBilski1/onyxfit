import type { CookieOptions } from "@supabase/ssr";

/**
 * "Remember me" preference + helpers used by every Supabase client wrapper.
 *
 * The Supabase SSR adapter writes auth cookies with a 400-day Max-Age by
 * default. We override that:
 *
 *  - remember = true   → 7-day persistent cookies (renewed on every refresh,
 *                        so the user effectively stays signed in as long as
 *                        they open the app at least once a week).
 *  - remember = false  → session cookies (cleared when the browser closes).
 *
 * The preference itself lives in a tiny non-httpOnly cookie called
 * `auth-remember` so client/server/middleware can all read it cheaply.
 * Absent cookie ⇒ treat as remembered, so existing sessions don't suddenly
 * become ephemeral.
 */

export const REMEMBER_COOKIE = "auth-remember";
const WEEK_S = 60 * 60 * 24 * 7;
const YEAR_S = 60 * 60 * 24 * 365;

export function readRememberPreference(
  cookies: { name: string; value: string }[] | undefined | null,
): boolean {
  if (!cookies) return true;
  const v = cookies.find((c) => c.name === REMEMBER_COOKIE)?.value;
  return v !== "0";
}

export function readRememberFromDocument(): boolean {
  if (typeof document === "undefined") return true;
  const m = document.cookie.match(/(?:^|;\s*)auth-remember=([^;]+)/);
  if (m && m[1] === "0") return false;
  return true;
}

export function authCookieOptions(remember: boolean): CookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    // `maxAge: undefined` overrides the supabase 400-day default → session cookie.
    maxAge: remember ? WEEK_S : undefined,
  };
}

/**
 * Persist the remember preference in the browser before the user signs in.
 * The preference cookie itself is always long-lived so we know the choice on
 * the next visit.
 */
export function writeRememberPreference(remember: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `${REMEMBER_COOKIE}=${remember ? "1" : "0"}; Path=/; Max-Age=${YEAR_S}; SameSite=Lax`;
}
