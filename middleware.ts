import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  isAccessProtectionEnabled,
} from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  if (!isAccessProtectionEnabled()) return NextResponse.next();
  if (request.nextUrl.pathname === "/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token && token === (await createSessionToken())) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
