export type CityId = "msk" | "spb" | "nsk";

export type DemoCity = {
  id: CityId;
  name: string;
};

export type DemoCinema = {
  id: string;
  cityId: CityId;
  name: string;
  chain: string;
  address: string;
};

export type DemoMovie = {
  id: string;
  title: string;
  ageRating: "0+" | "6+" | "12+" | "16+" | "18+";
  runtimeMin: number;
  genres: string[];
  poster: string; // local/public url
  description: string;
};

export type SeatType = "standard" | "premium";

export type DemoHall = {
  id: string;
  name: string;
  rows: string[]; // e.g. ["A","B",...]
  seatsPerRow: number;
  premiumRows: string[]; // rows that are premium
};

export type DemoScreening = {
  id: string;
  cityId: CityId;
  cinemaId: string;
  hallId: string;
  movieId: string;
  startsAt: string; // ISO
  format: "2D" | "3D" | "IMAX" | "4DX";
  pricesRub: Record<SeatType, number>;
};

export type DemoSeat = {
  row: string;
  number: number;
  type: SeatType;
  id: string; // `${row}${number}`
};

export const DEMO_CITIES: DemoCity[] = [
  { id: "msk", name: "Москва" },
  { id: "spb", name: "Санкт-Петербург" },
  { id: "nsk", name: "Новосибирск" },
];

export const DEMO_CINEMAS: DemoCinema[] = [
  {
    id: "msk-karo-1",
    cityId: "msk",
    chain: "КАРО",
    name: "КАРО 11 Октябрь",
    address: "ул. Новый Арбат, 24",
  },
  {
    id: "msk-cp-1",
    cityId: "msk",
    chain: "Синема Парк",
    name: "Синема Парк Метрополис",
    address: "Ленинградское ш., 16А, стр. 4",
  },
  {
    id: "spb-mirage-1",
    cityId: "spb",
    chain: "Мираж Синема",
    name: "Мираж Синема Озерки",
    address: "пр. Энгельса, 111",
  },
  {
    id: "spb-cp-1",
    cityId: "spb",
    chain: "Формула Кино",
    name: "Формула Кино Галерея",
    address: "Лиговский пр., 30А",
  },
  {
    id: "nsk-kinomaks-1",
    cityId: "nsk",
    chain: "Киномакс",
    name: "Киномакс Ройял Парк",
    address: "Красный пр., 101",
  },
  {
    id: "nsk-pobeda-1",
    cityId: "nsk",
    chain: "Победа",
    name: "Кинотеатр Победа",
    address: "ул. Ленина, 7",
  },
];

export const DEMO_MOVIES: DemoMovie[] = [
  {
    id: "m1",
    title: "Город теней",
    ageRating: "16+",
    runtimeMin: 118,
    genres: ["Триллер", "Драма"],
    poster: "/placeholders/poster.svg",
    description:
      "Детективная история о расследовании, которое начинается как обычное дело, а заканчивается выбором между правдой и безопасностью.",
  },
  {
    id: "m2",
    title: "Космос рядом",
    ageRating: "12+",
    runtimeMin: 104,
    genres: ["Фантастика", "Приключения"],
    poster: "/placeholders/poster.svg",
    description:
      "Команда энтузиастов запускает эксперимент, который неожиданно меняет их взгляд на привычный мир и границы возможного.",
  },
  {
    id: "m3",
    title: "Лето на двоих",
    ageRating: "6+",
    runtimeMin: 96,
    genres: ["Комедия", "Романтика"],
    poster: "/placeholders/poster.svg",
    description:
      "Легкая история про случайную встречу, которая превращает обычный отпуск в череду смешных и трогательных событий.",
  },
  {
    id: "m4",
    title: "Шум большого города",
    ageRating: "18+",
    runtimeMin: 132,
    genres: ["Криминал", "Драма"],
    poster: "/placeholders/poster.svg",
    description:
      "Ночь, которая запускает цепочку решений. У каждого есть причина остаться в игре, но не у каждого получится выйти.",
  },
];

export const DEMO_HALLS: DemoHall[] = [
  {
    id: "h1",
    name: "Зал 1",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    seatsPerRow: 12,
    premiumRows: ["E", "F", "G"],
  },
  {
    id: "h2",
    name: "IMAX",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
    seatsPerRow: 14,
    premiumRows: ["D", "E", "F"],
  },
];

function isoLocalTodayAt(hours: number, minutes: number) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return base.toISOString();
}

function plusDaysIso(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const BASE_DAY = isoLocalTodayAt(13, 0);

export const DEMO_SCREENINGS: DemoScreening[] = [
  {
    id: "s1",
    cityId: "msk",
    cinemaId: "msk-karo-1",
    hallId: "h1",
    movieId: "m1",
    startsAt: plusDaysIso(BASE_DAY, 0),
    format: "2D",
    pricesRub: { standard: 420, premium: 650 },
  },
  {
    id: "s2",
    cityId: "msk",
    cinemaId: "msk-cp-1",
    hallId: "h2",
    movieId: "m2",
    startsAt: plusDaysIso(isoLocalTodayAt(16, 20), 0),
    format: "IMAX",
    pricesRub: { standard: 590, premium: 890 },
  },
  {
    id: "s3",
    cityId: "msk",
    cinemaId: "msk-karo-1",
    hallId: "h1",
    movieId: "m3",
    startsAt: plusDaysIso(isoLocalTodayAt(19, 10), 0),
    format: "2D",
    pricesRub: { standard: 350, premium: 520 },
  },
  {
    id: "s4",
    cityId: "spb",
    cinemaId: "spb-mirage-1",
    hallId: "h1",
    movieId: "m1",
    startsAt: plusDaysIso(isoLocalTodayAt(14, 10), 0),
    format: "2D",
    pricesRub: { standard: 390, premium: 590 },
  },
  {
    id: "s5",
    cityId: "spb",
    cinemaId: "spb-cp-1",
    hallId: "h2",
    movieId: "m4",
    startsAt: plusDaysIso(isoLocalTodayAt(20, 30), 0),
    format: "IMAX",
    pricesRub: { standard: 620, premium: 940 },
  },
  {
    id: "s6",
    cityId: "nsk",
    cinemaId: "nsk-kinomaks-1",
    hallId: "h1",
    movieId: "m2",
    startsAt: plusDaysIso(isoLocalTodayAt(15, 40), 0),
    format: "3D",
    pricesRub: { standard: 360, premium: 540 },
  },
  {
    id: "s7",
    cityId: "nsk",
    cinemaId: "nsk-pobeda-1",
    hallId: "h1",
    movieId: "m3",
    startsAt: plusDaysIso(isoLocalTodayAt(18, 0), 0),
    format: "2D",
    pricesRub: { standard: 300, premium: 470 },
  },
  // Tomorrow
  {
    id: "s8",
    cityId: "msk",
    cinemaId: "msk-cp-1",
    hallId: "h1",
    movieId: "m4",
    startsAt: plusDaysIso(isoLocalTodayAt(21, 0), 1),
    format: "4DX",
    pricesRub: { standard: 690, premium: 990 },
  },
];

export function buildHallSeats(hall: DemoHall): DemoSeat[] {
  const seats: DemoSeat[] = [];
  for (const row of hall.rows) {
    const type: SeatType = hall.premiumRows.includes(row) ? "premium" : "standard";
    for (let number = 1; number <= hall.seatsPerRow; number += 1) {
      seats.push({ row, number, type, id: `${row}${number}` });
    }
  }
  return seats;
}

export function formatTimeRu(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateRu(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { weekday: "short", day: "2-digit", month: "short" });
}

