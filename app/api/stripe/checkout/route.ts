import { NextResponse } from "next/server";
import Stripe from "stripe";
import { resolveReservationContext } from "@/app/lib/demoStore";

export const runtime = "nodejs";

type CreateCheckoutRequest = {
  reservationId: string;
};

function getOrigin(request: Request) {
  const url = new URL(request.url);
  const headerOrigin = request.headers.get("origin");
  return headerOrigin || `${url.protocol}//${url.host}`;
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as CreateCheckoutRequest | null;
    const reservationId = payload?.reservationId?.trim() ?? "";
    if (!reservationId) {
      return NextResponse.json({ error: "reservationId is required." }, { status: 400 });
    }

    const ctx = resolveReservationContext(reservationId);
    if (!ctx) {
      return NextResponse.json({ error: "Бронь не найдена." }, { status: 404 });
    }

    const origin = getOrigin(request);
    const stripe = getStripe();

    const title = `${ctx.movie.title} • ${ctx.cinema.chain}: ${ctx.cinema.name}`;
    const seats = ctx.reservation.seatIds.join(", ");
    const startsAt = new Date(ctx.screening.startsAt).toLocaleString("ru-RU", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/tickets/success?reservationId=${encodeURIComponent(reservationId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tickets/cancel?reservationId=${encodeURIComponent(reservationId)}`,
      client_reference_id: reservationId,
      metadata: {
        reservationId,
        screeningId: ctx.screening.id,
        cinemaId: ctx.cinema.id,
        movieId: ctx.movie.id,
        seats,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "rub",
            unit_amount: Math.max(1, Math.round(ctx.reservation.totalRub * 100)),
            product_data: {
              name: title,
              description: `${startsAt} • ${ctx.screening.format} • Места: ${seats}`,
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
