"use client";

import Link from "next/link";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { navLinks } from "../../data/content";

export default function TicketsCancelPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto max-w-3xl space-y-6 px-5 pb-24 pt-10">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-amber-200">Оплата отменена (Demo)</p>
          <h1 className="mt-2 text-3xl font-extrabold">Платеж отменен</h1>
          <p className="mt-2 text-sm text-slate-300">
            Для демо-режима места могли остаться занятыми до перезапуска сервера.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
          >
            Вернуться к расписанию
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-white/15 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
          >
            На главную
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

