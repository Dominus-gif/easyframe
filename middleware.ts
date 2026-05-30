import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/studio", "/pricing", "/api/billing"];

export async function middleware(request: NextRequest) {
  const localBypass = process.env.ALLOW_LOCAL_MOCK_SESSION === "true";
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

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
  matcher: ["/studio/:path*", "/pricing/:path*", "/api/billing/:path*"]
};
