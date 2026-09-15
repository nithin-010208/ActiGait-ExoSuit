import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "actigait_session";
const publicRoutes = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    if ((pathname === "/login" || pathname === "/signup") && request.cookies.get(SESSION_COOKIE)?.value) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!request.cookies.get(SESSION_COOKIE)?.value) {
      const nextTarget = pathname === "/dashboard" ? "/dashboard" : pathname;
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", nextTarget);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*"],
};
