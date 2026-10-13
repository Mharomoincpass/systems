import { NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/studioAdminAuth";
import { appendStudioVisit } from "@/lib/studioAdminStore";
import { logStudioServer } from "@/lib/studioAdminLog";
import { visitMetaFromRequest } from "@/lib/studioRequestMeta";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = body.password;

    if (!verifyAdminPassword(password)) {
      logStudioServer("warn", "Admin login failed", {
        ip: visitMetaFromRequest(req).ip,
      });
      appendStudioVisit(
        visitMetaFromRequest(req, {
          path: "/admin/login",
          method: "POST",
          kind: "admin-denied",
        })
      );
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    logStudioServer("info", "Admin login success", {
      ip: visitMetaFromRequest(req).ip,
    });
    appendStudioVisit(
      visitMetaFromRequest(req, {
        path: "/admin",
        method: "POST",
        kind: "admin-login",
      })
    );

    const res = NextResponse.json({ ok: true });
    const cookie = adminSessionCookieOptions(token);
    res.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Login failed" },
      { status: 500 }
    );
  }
}
