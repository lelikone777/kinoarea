import type { Metadata } from "next";
import type { ReactNode } from "react";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        suppressHydrationWarning
        style={{
          ["--font-main" as string]:
            '"Manrope", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
        }}
        className="bg-slate-950 text-slate-50"
      >
        {children}
      </body>
    </html>
  );
}
