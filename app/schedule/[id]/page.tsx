"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { navLinks } from "../../data/content";

type Seat = { id: string; row: string; number: number; type: "standard" | "premium" };

type ScreeningDetails = {
  screening: { id: string; startsAt: string; format: string; pricesRub: { standard: number; premium: number } };
  cinema: { id: string; chain: string; name: string; address: string };
  hall: { id: string; name: string; rows: string[]; seatsPerRow: number; premiumRows: string[] };
  movie: { id: string; title: string; poster: string; ageRating: string; runtimeMin: number; genres: string[]; description: string };
  seats: Seat[];
  takenSeatIds: string[];
  pricesRub: { standard: number; premium: number };
  error?: string;
};

type ReserveResponse = { reservationId: string; totalRub: number; seatIds: string[]; error?: string };

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", { weekday: "short", day: "2-digit", month: "short" });
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${date} • ${time}`;
}

function seatSort(a: string, b: string) {
  const ar = a.slice(0, 1);
  const br = b.slice(0, 1);
  if (ar !== br) return ar.localeCompare(br);
  const an = Number(a.slice(1));
  const bn = Number(b.slice(1));
  return an - bn;
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [data, setData] = useState<ScreeningDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Record<string, true>>({});
  const selectedIds = useMemo(() => Object.keys(selected).sort(seatSort), [selected]);

  const taken = useMemo(() => new Set(data?.takenSeatIds ?? []), [data?.takenSeatIds]);
  const seatById = useMemo(() => new Map((data?.seats ?? []).map((s) => [s.id, s])), [data?.seats]);

  const totals = useMemo(() => {
    const prices = data?.pricesRub;
    if (!prices) return { count: 0, total: 0, standard: 0, premium: 0 };

    let total = 0;
    let standard = 0;
    let premium = 0;
    for (const id of selectedIds) {
      const seat = seatById.get(id);
      if (!seat) continue;
      total += prices[seat.type];
      if (seat.type === "premium") premium += 1;
      else standard += 1;
    }
    return { count: selectedIds.length, total, standard, premium };
  }, [data?.pricesRub, seatById, selectedIds]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const resolved = await params;
      if (!mounted) return;
      setScreeningId(resolved.id);
    };
    void init();
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!screeningId) return;
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/demo/screenings/${screeningId}`);
        const json = (await res.json()) as ScreeningDetails;
        if (!res.ok) throw new Error(json.error || "Не удалось загрузить сеанс.");
        if (mounted) setData(json);
      } catch (e) {
        if (mounted) {
          setData(null);
          setError(e instanceof Error ? e.message : "Не удалось загрузить сеанс.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [screeningId]);

  const toggleSeat = (seatId: string) => {
    if (taken.has(seatId)) return;
    setSelected((current) => {
      if (current[seatId]) {
        const next = { ...current };
        delete next[seatId];
        return next;
      }
      if (Object.keys(current).length >= 8) return current;
      return { ...current, [seatId]: true };
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);

  const reserveAndPay = async () => {
    if (!screeningId) return;
    setIsSubmitting(true);
    setReserveError(null);
    try {
      const reserveRes = await fetch(`/api/demo/screenings/${screeningId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatIds: selectedIds }),
      });
      const reserveJson = (await reserveRes.json()) as ReserveResponse;
      if (!reserveRes.ok) {
        throw new Error(reserveJson.error || "Не удалось забронировать места.");
      }

      const stripeRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reserveJson.reservationId }),
      });
      const stripeJson = (await stripeRes.json()) as { url?: string; error?: string };
      if (!stripeRes.ok || !stripeJson.url) {
        throw new Error(stripeJson.error || "Не удалось создать Stripe-сессию.");
      }

      window.location.href = stripeJson.url;
    } catch (e) {
      setReserveError(e instanceof Error ? e.message : "Ошибка оформления.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto flex-1 max-w-6xl space-y-6 px-5 pb-24 pt-10">
        <Link href="/schedule" className="inline-flex text-sm text-sky-300 hover:text-sky-200">
          Назад к расписанию
        </Link>

        {isLoading ? <p className="text-slate-300">Загрузка...</p> : null}
        {error ? (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : null}

        {data ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative aspect-[2/3] w-full max-w-[160px] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <Image src={data.movie.poster} alt={data.movie.title} fill className="object-cover" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Demo-покупка • Stripe Test</p>
                  <h1 className="text-2xl font-extrabold">{data.movie.title}</h1>
                  <p className="text-sm text-slate-300">
                    {formatDateTime(data.screening.startsAt)} • {data.screening.format}
                  </p>
                  <p className="text-sm text-slate-300">
                    {data.cinema.chain}: {data.cinema.name} • {data.cinema.address} • {data.hall.name}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                      Стандарт: {data.pricesRub.standard}₽
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
                      Премиум: {data.pricesRub.premium}₽
                    </span>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 font-semibold text-emerald-200">
                      Макс 8 мест
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-4 flex items-center justify-center">
                    <div className="w-full max-w-lg rounded-full bg-white/10 py-2 text-center text-xs font-semibold text-slate-200">
                      Экран
                    </div>
                  </div>

                  <div className="space-y-2">
                    {data.hall.rows.map((row) => (
                      <div key={row} className="flex items-center gap-2">
                        <div className="w-6 text-xs font-semibold text-slate-400">{row}</div>
                        <div
                          className="grid flex-1 gap-1"
                          style={{ gridTemplateColumns: `repeat(${data.hall.seatsPerRow}, minmax(0, 1fr))` }}
                        >
                          {Array.from({ length: data.hall.seatsPerRow }, (_, idx) => {
                            const seatId = `${row}${idx + 1}`;
                            const seat = seatById.get(seatId);
                            const isTaken = taken.has(seatId);
                            const isSelected = Boolean(selected[seatId]);
                            const isPremium = seat?.type === "premium";

                            const base =
                              "h-8 w-full rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-300/60";
                            const style = isTaken
                              ? "border-white/10 bg-white/5 text-slate-600 cursor-not-allowed"
                              : isSelected
                                ? "border-sky-300/60 bg-sky-400 text-slate-950"
                                : isPremium
                                  ? "border-amber-300/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
                                  : "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10";

                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isTaken}
                                onClick={() => toggleSeat(seatId)}
                                className={`${base} ${style}`}
                                aria-pressed={isSelected}
                                aria-label={`Место ${seatId}${isPremium ? ", премиум" : ""}${isTaken ? ", занято" : ""}`}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-white/15 bg-white/5" /> Стандарт
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-amber-300/30 bg-amber-400/10" /> Премиум
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-white/10 bg-white/5 opacity-40" /> Занято
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-sky-300/60 bg-sky-400" /> Выбрано
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
              <h2 className="text-xl font-bold">Ваш заказ</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>
                  Места:{" "}
                  <span className="font-semibold text-white">
                    {selectedIds.length ? selectedIds.join(", ") : "не выбраны"}
                  </span>
                </p>
                <p>
                  Кол-во: <span className="font-semibold text-white">{totals.count}</span>
                  {totals.premium ? (
                    <span className="text-slate-400"> (премиум: {totals.premium})</span>
                  ) : null}
                </p>
                <p>
                  Итого: <span className="font-extrabold text-white">{totals.total}₽</span>
                </p>
              </div>

              {reserveError ? (
                <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {reserveError}
                </div>
              ) : null}

              <button
                type="button"
                disabled={isSubmitting || selectedIds.length === 0}
                onClick={() => void reserveAndPay()}
                className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Оформляем..." : "Перейти к оплате (Stripe)"}
              </button>

              <p className="mt-3 text-xs text-slate-400">
                Это demo-покупка: после оплаты в Stripe test вы увидите страницу успеха.
              </p>
            </aside>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
