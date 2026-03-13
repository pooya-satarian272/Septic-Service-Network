import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Redirect logged-in users away from auth pages
  if (token && (pathname === "/login" || pathname === "/register")) {
    const role = (token.role as string)?.toLowerCase() || "homeowner";
    return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = (token.role as string)?.toLowerCase() || "homeowner";

    // Redirect /dashboard to role-specific page
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    // Enforce role-based access
    if (pathname.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith("/dashboard/provider") && token.role !== "PROVIDER") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith("/dashboard/homeowner") && token.role !== "HOMEOWNER") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
