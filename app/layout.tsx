import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-main",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "КиноАреа — афиша, трейлеры и новости",
  description:
    "КиноАреа — подборка фильмов, трейлеров, рейтингов и новостей кино с актуальными подборками.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} bg-slate-950 text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
