import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const routerHost = process.env.VERCEL_URL;
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.__VERCEL_DEV_RUNNING === "1" && routerHost && forwardedHost !== routerHost) {
    const target = request.nextUrl.clone();
    target.protocol = "http:";
    target.host = routerHost;
    return NextResponse.redirect(target);
  }

  // Shared-password gate for the public demo. The browser then sends the same Basic
  // credentials to /eve/v1/*, where agent/channels/eve.ts checks them again.
  const password = process.env.DEMO_PASSWORD;
  if (password && !hasDemoPassword(request.headers.get("authorization"), password)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="eve-data-analyst", charset="UTF-8"' },
    });
  }
  return NextResponse.next();
}

function hasDemoPassword(header: string | null, password: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  const decoded = new TextDecoder().decode(
    Uint8Array.from(atob(header.slice(6)), (char) => char.charCodeAt(0)),
  );
  return decoded === `demo:${password}`;
}
