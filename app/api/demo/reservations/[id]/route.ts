import { NextResponse } from "next/server";
import {
  DEMO_CINEMAS,
  DEMO_HALLS,
  DEMO_MOVIES,
  DEMO_SCREENINGS,
  formatDateRu,
  formatTimeRu,
} from "@/app/data/demoSchedule";
import { getReservation } from "@/app/lib/demoStore";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const reservation = getReservation(id);
  if (!reservation) {
    return NextResponse.json({ error: "Бронь не найдена." }, { status: 404 });
  }

  const screening = DEMO_SCREENINGS.find((s) => s.id === reservation.screeningId);
  if (!screening) {
    return NextResponse.json({ error: "Сеанс не найден." }, { status: 404 });
  }

  const cinema = DEMO_CINEMAS.find((c) => c.id === screening.cinemaId);
  const hall = DEMO_HALLS.find((h) => h.id === screening.hallId);
  const movie = DEMO_MOVIES.find((m) => m.id === screening.movieId);
  if (!cinema || !hall || !movie) {
    return NextResponse.json({ error: "Демо-данные повреждены." }, { status: 500 });
  }

  return NextResponse.json({
    reservationId: id,
    totalRub: reservation.totalRub,
    seatIds: reservation.seatIds,
    createdAt: reservation.createdAt,
    screening: {
      id: screening.id,
      startsAt: screening.startsAt,
      dayLabel: formatDateRu(screening.startsAt),
      timeLabel: formatTimeRu(screening.startsAt),
      format: screening.format,
    },
    cinema,
    hall,
    movie,
  });
}
