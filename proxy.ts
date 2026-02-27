import { NextResponse, type NextRequest } from "next/server";
import {
  detectSiteLanguageFromAcceptLanguage,
  normalizeSiteLanguage,
  SITE_LANGUAGE_COOKIE,
} from "./app/lib/language";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const existingCookie = request.cookies.get(SITE_LANGUAGE_COOKIE)?.value;
  const response = NextResponse.next();

  if (existingCookie) {
    return response;
  }

  const detectedLanguage =
    detectSiteLanguageFromAcceptLanguage(request.headers.get("accept-language")) ?? normalizeSiteLanguage();

  response.cookies.set(SITE_LANGUAGE_COOKIE, detectedLanguage, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
