import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Server Action POSTs include a `next-action` header. We must NOT call
  // supabase.auth.getUser() here — the action itself runs `requireActiveCoach`
  // which calls getUser too, and two parallel refreshes rotate the refresh
  // token at the same time. The second one always gets `invalid_refresh_token`,
  // wipes the session, and the action redirects the user to /login.
  // The action has its own auth check, so it's safe to forward unmodified.
  if (request.headers.get("next-action")) {
    return NextResponse.next({ request });
  }
  return await updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup", "/pending-verification"],
};
