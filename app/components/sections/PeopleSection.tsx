import Image from "next/image";
import type { Person, PersonStat } from "../../data/content";

type PeopleSectionProps = {
  spotlight: Person[];
  board: PersonStat[];
};

export function PeopleSection({ spotlight, board }: PeopleSectionProps) {
  return (
    <section className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-xl shadow-emerald-500/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">Люди в фокусе</h2>
          <span className="text-sm text-slate-400">по росту популярности</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {spotlight.map((person) => (
            <div
              key={person.name}
              className="overflow-hidden rounded-2xl border border-white/5 bg-white/5"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 40vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  {person.delta ? (
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 font-semibold">
                      {person.delta}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
                    {person.role}
                  </span>
                </div>
                <p className="text-lg font-bold">{person.name}</p>
                <p className="text-sm text-slate-300">{person.knownFor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-xl shadow-indigo-500/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Доска лидеров</h3>
          <span className="text-xs text-slate-400">обновляется ежедневно</span>
        </div>
        <div className="mt-4 space-y-3">
          {board.map((person) => (
            <div
              key={person.name}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">{person.name}</p>
                <p className="text-xs text-slate-400">{person.role}</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                {person.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
