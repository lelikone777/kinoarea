export type Movie = {
  title: string;
  genre: string;
  rating: number;
  tag?: string;
  badge?: string;
  image: string;
};

export type Trailer = {
  title: string;
  time: string;
  image: string;
  note?: string;
};

export type Person = {
  name: string;
  role: string;
  image: string;
  knownFor: string;
  delta?: string;
};

export type PersonStat = {
  name: string;
  role: string;
  delta: string;
};

export type News = {
  title: string;
  date: string;
  image: string;
  excerpt: string;
};

export type BoxOffice = {
  title: string;
  amount: string;
  change: string;
  place: string;
  image: string;
};

export const navLinks = [
  "Афиша",
  "Онлайн-кинотеатр",
  "Будущие релизы",
  "Новости",
  "Трейлеры",
  "Персоны",
];

export const nowFilters = [
  "Все фильмы",
  "Сегодня в кино",
  "По подписке",
  "IMAX",
  "4DX",
];

export const nowPlaying: Movie[] = [
  {
    title: "Джокер",
    genre: "триллер · 2ч 2м",
    rating: 9.1,
    tag: "IMAX",
    badge: "горячо",
    image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },
  {
    title: "Хищные птицы",
    genre: "боевик · 1ч 49м",
    rating: 8.0,
    tag: "4DX",
    badge: "премьера",
    image: "https://image.tmdb.org/t/p/w500/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg",
  },
  {
    title: "Ford против Ferrari",
    genre: "драма · 2ч 32м",
    rating: 8.6,
    tag: "PREMIUM",
    image: "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
  },
  {
    title: "Джентльмены",
    genre: "криминал · 1ч 53м",
    rating: 8.9,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
  },
  {
    title: "Чудо-женщина 1984",
    genre: "фэнтези · 2ч 31м",
    rating: 7.4,
    tag: "2D",
    image: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
  },
  {
    title: "1917",
    genre: "военный · 1ч 59м",
    rating: 8.5,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
  },
  {
    title: "Ёж Соник",
    genre: "семейный · 1ч 39м",
    rating: 7.8,
    tag: "4DX",
    image: "https://image.tmdb.org/t/p/w500/aQvJ5WPzZgYVDrxLX4R6cLJCEaQ.jpg",
  },
  {
    title: "Не время умирать",
    genre: "боевик · 2ч 43м",
    rating: 8.1,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg",
  },
];

export const trailerHero = {
  title: "Форсаж 9",
  description:
    "Доминик Торетто вновь собирает семью, чтобы остановить опасного противника и не дать прошлому разрушить их будущее.",
  image: "https://image.tmdb.org/t/p/w1280/bOFaAXmWWXC3Rbv4u4uM9ZSzRXP.jpg",
  duration: "2:32",
  tag: "Премьера недели",
  actors: [
    {
      name: "Вин Дизель",
      role: "Доминик Торетто",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80",
    },
    {
      name: "Мишель Родригес",
      role: "Летти Ортис",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80",
    },
  ],
};

export const trailers: Trailer[] = [
  {
    title: "Довод",
    time: "02:10",
    note: "Новый трейлер",
    image: "https://image.tmdb.org/t/p/w780/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
  },
  {
    title: "Мулан",
    time: "01:34",
    image: "https://image.tmdb.org/t/p/w780/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg",
  },
  {
    title: "Чёрная вдова",
    time: "02:08",
    image: "https://image.tmdb.org/t/p/w780/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
  },
  {
    title: "Дюна",
    time: "03:11",
    note: "IMAX",
    image: "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  },
];

export const popularMovies: Movie[] = [
  {
    title: "История игрушек 4",
    genre: "приключения · 1ч 40м",
    rating: 8.9,
    tag: "семейное",
    image: "https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg",
  },
  {
    title: "Джокер",
    genre: "триллер · 2ч 2м",
    rating: 9.1,
    tag: "IMAX",
    badge: "хит",
    image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },
  {
    title: "Джентльмены",
    genre: "криминал · 1ч 53м",
    rating: 8.9,
    tag: "премьера",
    image: "https://image.tmdb.org/t/p/w500/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
  },
  {
    title: "Ford против Ferrari",
    genre: "драма · 2ч 32м",
    rating: 8.6,
    tag: "спорт",
    image: "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
  },
  {
    title: "1917",
    genre: "военный · 1ч 59м",
    rating: 8.5,
    tag: "основное",
    image: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
  },
  {
    title: "Чудо-женщина 1984",
    genre: "фэнтези · 2ч 31м",
    rating: 7.4,
    tag: "формат",
    image: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
  },
];

export const peopleSpotlight: Person[] = [
  {
    name: "Квентин Тарантино",
    role: "Режиссер",
    knownFor: "Джанго освобожденный",
    delta: "+112 350",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&facepad=3&w=320&h=320&q=80",
  },
  {
    name: "Джейсон Стейтем",
    role: "Актер",
    knownFor: "Форсаж: Хоббс и Шоу",
    delta: "+75 930",
    image:
      "https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=facearea&facepad=3&w=320&h=320&q=80",
  },
];

export const peopleBoard: PersonStat[] = [
  { name: "Кристофер Нолан", role: "Режиссер", delta: "+112 350" },
  { name: "Хоакин Феникс", role: "Актер", delta: "+83 455" },
  { name: "Роберт Дауни мл.", role: "Актер", delta: "+78 124" },
  { name: "Джеймс Ван", role: "Режиссер", delta: "+61 044" },
  { name: "Райан Рейнольдс", role: "Актер", delta: "+55 023" },
  { name: "Зои Салдана", role: "Актриса", delta: "+49 011" },
  { name: "Галь Гадот", role: "Актриса", delta: "+42 680" },
  { name: "Райан Гослинг", role: "Актер", delta: "+39 520" },
];

export const newsArticles: News[] = [
  {
    title: "Не время умирать. Перенос релиза фильма",
    date: "07 апреля 2025",
    excerpt:
      "Новый фильм о Джеймсе Бонде выйдет позже, чем ожидалось. Студия смещает график проката ради международных сборов.",
    image:
      "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Дисней объявил новые даты премьер",
    date: "05 апреля 2025",
    excerpt:
      "Сразу несколько блокбастеров получат свежие даты. В подборке — продолжения любимых франшиз и новые проекты.",
    image:
      "https://images.unsplash.com/photo-1505682634904-d7c075c738d4?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Релиз «Джентльменов» в стриминге",
    date: "01 апреля 2025",
    excerpt:
      "После успеха в кинотеатрах Гай Ричи готовит цифровой релиз — появится расширенная версия с бонус-сценами.",
    image:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=600&q=80",
  },
];

export const upcomingMovies: Movie[] = [
  {
    title: "Дюна",
    genre: "фантастика · 2ч 35м",
    rating: 8.8,
    tag: "ждём",
    image: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  },
  {
    title: "Топ Ган: Мэверик",
    genre: "боевик · 2ч 11м",
    rating: 9.0,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
  },
  {
    title: "Бэтмен",
    genre: "детектив · 2ч 56м",
    rating: 8.4,
    tag: "премьера",
    image: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  },
  {
    title: "Черная вдова",
    genre: "боевик · 2ч 13м",
    rating: 7.9,
    tag: "MARVEL",
    image: "https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
  },
];

export const boxOffice: BoxOffice[] = [
  {
    place: "1 место",
    title: "Джентльмены",
    amount: "$145 000 000",
    change: "+16%",
    image: "https://image.tmdb.org/t/p/w185/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
  },
  {
    place: "2 место",
    title: "Ёж Соник",
    amount: "$126 000 000",
    change: "+12%",
    image: "https://image.tmdb.org/t/p/w185/aQvJ5WPzZgYVDrxLX4R6cLJCEaQ.jpg",
  },
  {
    place: "3 место",
    title: "Хищные птицы",
    amount: "$89 000 000",
    change: "+8%",
    image: "https://image.tmdb.org/t/p/w185/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg",
  },
  {
    place: "4 место",
    title: "Ford против Ferrari",
    amount: "$72 500 000",
    change: "+5%",
    image: "https://image.tmdb.org/t/p/w185/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
  },
  {
    place: "5 место",
    title: "Чудо-женщина 1984",
    amount: "$61 200 000",
    change: "+3%",
    image: "https://image.tmdb.org/t/p/w185/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
  },
];
