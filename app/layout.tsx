import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-main",
  subsets: ["latin", "cyrillic"],
});

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
      <body className={`${manrope.variable} bg-slate-950 text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
