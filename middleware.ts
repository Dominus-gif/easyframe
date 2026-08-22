import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/studio", "/api/billing"];

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

  const localBypass = process.env.ALLOW_LOCAL_MOCK_SESSION === "true";
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPath || localBypass) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/api/billing/:path*", "/Terms", "/Privacy"]
};
