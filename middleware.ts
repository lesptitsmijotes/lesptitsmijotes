import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✂️ — Commentez la ligne ci-dessous quand le site est prêt à être lancé
  if (!pathname.startsWith("/bientot") && !pathname.startsWith("/api/waitlist")) return NextResponse.redirect(new URL("/bientot", request.url))

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclure les assets statiques, images et favicon
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
}
