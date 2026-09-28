import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

// Page routes we redirect to /login when signed out. API routes under
// /api/billing authenticate themselves and return their own nicer redirects
// (to /pricing), so they're intentionally not force-redirected here — but they
// stay in the matcher below so their session cookie is still refreshed.
const protectedPaths = ["/studio", "/account"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy capitalized legal URLs -> lowercase canonical. Exact-string match so this
  // fires at most once (the lowercase target is served by the route, not the matcher),
  // avoiding the case-insensitive redirect() loop that previously broke these pages.
  if (pathname === "/Terms" || pathname === "/Privacy") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const localBypass = process.env.ALLOW_LOCAL_MOCK_SESSION === "true";
  let response = NextResponse.next({ request });

  if (!supabaseConfigured) {
    return isProtected && !localBypass ? toLogin(request) : response;
  }

  // Refreshes an expiring session and writes the new cookies onto the response.
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (isProtected && !user && !localBypass) return toLogin(request);
  return response;
}

function toLogin(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/studio/:path*", "/api/billing/:path*", "/account/:path*", "/Terms", "/Privacy"]
};
