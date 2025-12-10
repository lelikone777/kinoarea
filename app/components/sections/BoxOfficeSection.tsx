import Image from "next/image";
import { ArrowRightIcon } from "../icons";
import type { BoxOffice } from "../../data/content";

type BoxOfficeSectionProps = {
  entries: BoxOffice[];
};

export function BoxOfficeSection({ entries }: BoxOfficeSectionProps) {
  return (
    <section className="mt-14 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold">Кассовые сборы</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            за неделю
          </span>
        </div>
        <button className="group flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white">
          Полная статистика
          <ArrowRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <div
            key={entry.title}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="relative h-20 w-16 overflow-hidden rounded-xl">
              <Image
                src={entry.image}
                alt={entry.title}
                fill
                sizes="80px"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {entry.place}
                </span>
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
    </section>
  );
}
