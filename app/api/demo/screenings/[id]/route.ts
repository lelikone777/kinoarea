import { NextResponse } from "next/server";
import {
  DEMO_CINEMAS,
  DEMO_HALLS,
  DEMO_MOVIES,
  DEMO_SCREENINGS,
  buildHallSeats,
  type SeatType,
} from "@/app/data/demoSchedule";
import { createReservation, getTakenSeatIds } from "@/app/lib/demoStore";

type RouteContext = { params: Promise<{ id: string }> };

export type DemoScreeningDetailsResponse = {
  screening: (typeof DEMO_SCREENINGS)[number];
  cinema: (typeof DEMO_CINEMAS)[number];
  hall: (typeof DEMO_HALLS)[number];
  movie: (typeof DEMO_MOVIES)[number];
  seats: ReturnType<typeof buildHallSeats>;
  takenSeatIds: string[];
  pricesRub: Record<SeatType, number>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const screening = DEMO_SCREENINGS.find((s) => s.id === id);
  if (!screening) {
    return NextResponse.json({ error: "Сеанс не найден." }, { status: 404 });
  }

  const cinema = DEMO_CINEMAS.find((c) => c.id === screening.cinemaId);
  const hall = DEMO_HALLS.find((h) => h.id === screening.hallId);
  const movie = DEMO_MOVIES.find((m) => m.id === screening.movieId);

  if (!cinema || !hall || !movie) {
    return NextResponse.json({ error: "Демо-данные повреждены." }, { status: 500 });
  }

  const seats = buildHallSeats(hall);
  const takenSeatIds = getTakenSeatIds(screening.id);

  return NextResponse.json({
    screening,
    cinema,
    hall,
    movie,
    seats,
    takenSeatIds,
    pricesRub: screening.pricesRub,
  } satisfies DemoScreeningDetailsResponse);
}

export type DemoReserveRequest = {
  seatIds: string[];
};

export type DemoReserveResponse = {
  reservationId: string;
  totalRub: number;
  seatIds: string[];
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as DemoReserveRequest | null;
  const seatIds = Array.isArray(payload?.seatIds) ? payload!.seatIds.filter((s) => typeof s === "string") : [];
  const result = createReservation({ screeningId: id, seatIds });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: (result as { status?: number }).status ?? 400 });
  }

  return NextResponse.json({
    reservationId: result.reservation.reservationId,
    totalRub: result.reservation.totalRub,
    seatIds: result.reservation.seatIds,
  } satisfies DemoReserveResponse);
}
