import Stripe from "stripe";
import Link from "next/link";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { navLinks } from "../../data/content";
import { resolveReservationContext } from "../../lib/demoStore";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    return null;
  }
  return new Stripe(secretKey);
}

export default async function TicketsSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reservationId?: string; session_id?: string }>;
}) {
  const { reservationId = "", session_id } = await searchParams;
  const ctx = reservationId ? resolveReservationContext(reservationId) : null;

  let paymentStatus: string | null = null;
  const stripe = getStripe();
  if (stripe && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      paymentStatus = session.payment_status ?? null;
    } catch {
      paymentStatus = null;
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Header navLinks={navLinks} />

      <main className="relative z-10 mx-auto flex-1 max-w-3xl space-y-6 px-5 pb-24 pt-10">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Оплата завершена (Demo)</p>
          <h1 className="mt-2 text-3xl font-extrabold">Билеты оформлены</h1>
          <p className="mt-2 text-sm text-slate-300">
            Это портфолио-демо. Статус Stripe:{" "}
            <span className="font-semibold text-white">{paymentStatus ?? "unknown"}</span>
          </p>
        </div>

        {ctx ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            <p className="text-slate-400">Заказ</p>
            <p className="mt-2 text-lg font-bold text-white">{ctx.movie.title}</p>
            <p className="mt-1">
              {ctx.cinema.chain}: {ctx.cinema.name}
            </p>
            <p className="text-slate-300">{ctx.cinema.address}</p>
            <p className="mt-2">
              Сеанс:{" "}
              <span className="font-semibold text-white">
                {new Date(ctx.screening.startsAt).toLocaleString("ru-RU", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                • {ctx.screening.format}
              </span>
            </p>
            <p className="mt-2">
              Места: <span className="font-semibold text-white">{ctx.reservation.seatIds.join(", ")}</span>
            </p>
            <p className="mt-2">
              Сумма: <span className="font-extrabold text-white">{ctx.reservation.totalRub}₽</span>
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-300">
            Не удалось найти бронь. Для демо это нормально, если сервер перезапускался.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/schedule"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:opacity-90"
          >
            К расписанию
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
