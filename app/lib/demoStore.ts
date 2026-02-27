import {
  DEMO_CINEMAS,
  DEMO_HALLS,
  DEMO_MOVIES,
  DEMO_SCREENINGS,
  buildHallSeats,
  type SeatType,
} from "@/app/data/demoSchedule";

export type DemoReservation = {
  reservationId: string;
  screeningId: string;
  seatIds: string[];
  totalRub: number;
  createdAt: string;
};

type GlobalStore = {
  __demoTakenSeats?: Map<string, Set<string>>;
  __demoReservations?: Map<string, DemoReservation>;
};

const globalForDemo = globalThis as unknown as GlobalStore;
const takenSeatsByScreening: Map<string, Set<string>> =
  globalForDemo.__demoTakenSeats ?? (globalForDemo.__demoTakenSeats = new Map<string, Set<string>>());
const reservations: Map<string, DemoReservation> =
  globalForDemo.__demoReservations ?? (globalForDemo.__demoReservations = new Map<string, DemoReservation>());

function getOrSeedTakenSeats(screeningId: string) {
  const existing = takenSeatsByScreening.get(screeningId);
  if (existing) return existing;

  // Seed a few taken seats for realism.
  const seeded = new Set<string>(["E6", "E7", "F6", "F7", "B1", "B2"]);
  takenSeatsByScreening.set(screeningId, seeded);
  return seeded;
}

export function getTakenSeatIds(screeningId: string) {
  return Array.from(getOrSeedTakenSeats(screeningId));
}

export function createReservation(input: { screeningId: string; seatIds: string[] }) {
  const screening = DEMO_SCREENINGS.find((s) => s.id === input.screeningId);
  if (!screening) {
    return { ok: false as const, error: "Сеанс не найден." };
  }

  const hall = DEMO_HALLS.find((h) => h.id === screening.hallId);
  if (!hall) {
    return { ok: false as const, error: "Зал не найден." };
  }

  const seatIds = input.seatIds.filter((s) => typeof s === "string");
  if (!seatIds.length) {
    return { ok: false as const, error: "Выберите места." };
  }
  if (seatIds.length > 8) {
    return { ok: false as const, error: "Для демо максимум 8 мест за заказ." };
  }

  const allowedSeats = new Set(buildHallSeats(hall).map((s) => s.id));
  for (const seatId of seatIds) {
    if (!allowedSeats.has(seatId)) {
      return { ok: false as const, error: `Некорректное место: ${seatId}` };
    }
  }

  const taken = getOrSeedTakenSeats(screening.id);
  const conflicts = seatIds.filter((seatId) => taken.has(seatId));
  if (conflicts.length) {
    return { ok: false as const, error: `Места уже заняты: ${conflicts.join(", ")}`, status: 409 as const };
  }

  const premiumRows = new Set(hall.premiumRows);
  let totalRub = 0;
  for (const seatId of seatIds) {
    const row = seatId.slice(0, 1);
    const type: SeatType = premiumRows.has(row) ? "premium" : "standard";
    totalRub += screening.pricesRub[type];
  }

  seatIds.forEach((seatId) => taken.add(seatId));

  const reservationId = `r_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  const reservation: DemoReservation = {
    reservationId,
    screeningId: screening.id,
    seatIds: [...seatIds],
    totalRub,
    createdAt: new Date().toISOString(),
  };
  reservations.set(reservationId, reservation);

  return { ok: true as const, reservation };
}

export function getReservation(reservationId: string) {
  return reservations.get(reservationId) ?? null;
}

export function resolveReservationContext(reservationId: string) {
  const reservation = getReservation(reservationId);
  if (!reservation) return null;

  const screening = DEMO_SCREENINGS.find((s) => s.id === reservation.screeningId);
  if (!screening) return null;

  const cinema = DEMO_CINEMAS.find((c) => c.id === screening.cinemaId);
  const hall = DEMO_HALLS.find((h) => h.id === screening.hallId);
  const movie = DEMO_MOVIES.find((m) => m.id === screening.movieId);
  if (!cinema || !hall || !movie) return null;

  return { reservation, screening, cinema, hall, movie };
}

export function __resetDemoStoreForTests() {
  takenSeatsByScreening.clear();
  reservations.clear();
}
