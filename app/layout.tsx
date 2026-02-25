import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "КиноАреа — афиша, трейлеры и билеты",
  description:
    "КиноАреа — свежие премьеры, расписание, подборки трейлеров и новости индустрии. Смотрите, выбирайте сеансы и собирайте подборки любимых фильмов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
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
