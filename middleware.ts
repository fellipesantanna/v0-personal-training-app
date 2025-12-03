import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // pega QUALQUER cookie do Supabase
  const supabaseCookie = Array.from(req.cookies.getAll())
    .find((c) => c.name.includes("auth-token"));

  const isLogged = !!supabaseCookie;

  const publicRoutes = ["/auth/login", "/auth/register"];
  const isPublic = publicRoutes.includes(url.pathname);

  if (!isLogged && !isPublic) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (isLogged && isPublic) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
