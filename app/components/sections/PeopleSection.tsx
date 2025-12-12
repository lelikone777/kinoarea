"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Person } from "../../data/content";

type PeopleSectionProps = {
  week: Person[];
  month: Person[];
  year: Person[];
};

const PERIODS = [
  { key: "year", label: "За год" },
  { key: "month", label: "За месяц" },
  { key: "week", label: "За неделю" },
] as const;

export function PeopleSection({ week, month, year }: PeopleSectionProps) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("week");

  const current = useMemo(() => {
    if (period === "year") return year;
    if (period === "month") return month;
    return week;
  }, [period, week, month, year]);

  const featured = current.slice(0, 2);
  const list = current.slice(2, 7);

  return (
    <section className="mt-14 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Популярные персоны</h2>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-full px-3 py-1 transition ${
                period === p.key ? "bg-white/10 text-white ring-1 ring-white/10" : "hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((person, idx) => (
            <div
              key={person.name}
              className="relative flex h-full min-h-[320px] overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 shadow-xl shadow-emerald-500/10"
            >
              <Image
                src={person.image}
                alt={person.name}
                fill
                sizes="(max-width: 1024px) 50vw, 40vw"
                className="absolute inset-0 h-full w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-slate-950 shadow">
                  {idx + 1}-е место
                </span>
                {person.delta ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
                    {person.delta}
                  </span>
                ) : null}
              </div>
              <div className="absolute left-4 right-4 bottom-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-300">{person.role}</p>
                <p className="text-xl font-bold text-white">{person.name}</p>
                <p className="text-sm text-slate-200">{person.knownFor}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/5 p-5 shadow-xl shadow-indigo-500/10">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
            <span>Топ списка</span>
            <span>обновляется ежедневно</span>
          </div>
          <div className="divide-y divide-white/5">
            {list.map((person, idx) => (
              <div
                key={person.name}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{person.name}</p>
                  <p className="text-xs text-slate-400">{person.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {person.delta ? (
                    <span className="text-xs font-semibold text-emerald-200">{person.delta}</span>
                  ) : null}
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200">
                    {idx + 3}-е место
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
