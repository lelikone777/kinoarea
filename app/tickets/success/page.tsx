import Stripe from "stripe";
import { CalendarIcon } from "../../components/icons";
import { PageShell } from "../../components/layout/PageShell";
import { LinkButton } from "../../components/ui/Button";
import { PanelCard } from "../../components/ui/Cards";
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
    <PageShell mainClassName="relative z-10 mx-auto flex-1 max-w-3xl space-y-6 px-5 pb-24 pt-10">
      <PanelCard>
        <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Оплата завершена (Demo)</p>
        <h1 className="mt-2 text-3xl font-extrabold">Билеты оформлены</h1>
        <p className="mt-2 text-sm text-slate-300">
          Это портфолио-демо. Статус Stripe:{" "}
          <span className="font-semibold text-white">{paymentStatus ?? "unknown"}</span>
        </p>
      </PanelCard>

      {ctx ? (
        <PanelCard className="bg-white/5 text-sm text-slate-200">
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
        </PanelCard>
      ) : (
        <PanelCard className="text-slate-300">
          Не удалось найти бронь. Для демо это нормально, если сервер перезапускался.
        </PanelCard>
      )}

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/schedule" variant="cta">
          <CalendarIcon className="h-4 w-4 text-sky-600" />К расписанию
        </LinkButton>
        <LinkButton href="/" variant="secondary">
          На главную
        </LinkButton>
      </div>
    </PageShell>
  );
}

