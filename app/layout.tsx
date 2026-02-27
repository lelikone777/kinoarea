import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { SiteLanguageProvider } from "./components/providers/SiteLanguageProvider";
import { getLanguageBase, resolveSiteLanguage, SITE_LANGUAGE_COOKIE } from "./lib/language";
import "./globals.css";

export const metadata: Metadata = {
  title: "КиноЭра — афиша, трейлеры и билеты",
  description:
    "КиноЭра — свежие премьеры, расписание, подборки трейлеров и новости индустрии. Смотрите, выбирайте сеансы и собирайте подборки любимых фильмов.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-kinoera.png", type: "image/png", sizes: "64x64" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/favicon-kinoera.png", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const language = resolveSiteLanguage({
    cookieLanguage: cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return (
    <html lang={getLanguageBase(language)}>
      <body
        suppressHydrationWarning
        style={{
          ["--font-main" as string]:
            '"Manrope", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
        }}
        className="bg-slate-950 text-slate-50"
      >
        <SiteLanguageProvider initialLanguage={language}>{children}</SiteLanguageProvider>
      </body>
    </html>
  );
}
