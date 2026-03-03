"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon } from "../icons";
import type { BoxOffice } from "../../data/content";
import type { SiteLanguage } from "@/app/lib/language";

type BoxOfficeSectionProps = {
  entries: BoxOffice[];
  language: SiteLanguage;
};

type PeriodFilter = "weekend" | "month" | "year" | "all";

const PERIOD_OPTIONS: Array<{ value: PeriodFilter; label: string }> = [
  { value: "weekend", label: "За уикенд" },
  { value: "month", label: "За месяц" },
  { value: "year", label: "За год" },
  { value: "all", label: "Все время" },
];

export function BoxOfficeSection({ entries, language }: BoxOfficeSectionProps) {
  const [period, setPeriod] = useState<PeriodFilter>("weekend");
  const [items, setItems] = useState<BoxOffice[]>(entries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serializedFilters = useMemo(
    () => JSON.stringify({ period, language }),
    [period, language]
  );

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          period,
          sortBy: "revenue.desc",
          region: "RU",
          releaseType: "theatrical",
          language,
          limit: "6",
        });
        const response = await fetch(`/api/tmdb/box-office?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to load box office");
        const payload = (await response.json()) as { items?: BoxOffice[] };
        if (ignore) return;
        setItems(Array.isArray(payload.items) ? payload.items : []);
      } catch {
        if (ignore) return;
        setItems([]);
        setError("Не удалось загрузить данные TMDB.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [serializedFilters, period, language]);

  return (
    <section className="mt-14 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold">Кассовые сборы</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            {PERIOD_OPTIONS.find((option) => option.value === period)?.label}
          </span>
          <span className="rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
            TMDB API
          </span>
        </div>
        <Link
          href="/movies?sortBy=revenue.desc"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white"
        >
          Вся статистика
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                period === option.value ? "bg-sky-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {items.length === 0 && !loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            TMDB не вернул данных для выбранных фильтров. Измени период, регион или сортировку.
          </div>
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((entry, index) => (
            <div
              key={`${entry.id ?? entry.title}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className="relative h-20 w-16 overflow-hidden rounded-xl">
                <Image src={entry.image} alt={entry.title} fill sizes="80px" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.place}</span>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                    {entry.change}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">{entry.title}</p>
                <p className="text-sm text-slate-300">{entry.amount}</p>
              </div>
            </div>
          ))}
        </div>
        )}

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/40 text-sm text-white backdrop-blur-sm">
            Загружаем данные...
          </div>
        ) : null}
      </div>
    </section>
  );
}
