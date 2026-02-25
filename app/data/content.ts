export type Movie = {
  id?: number;
  title: string;
  genre: string;
  rating: number;
  tag?: string;
  badge?: string;
  year?: number;
  releaseDate?: string;
  popularity?: number;
  voteCount?: number;
  genreIds?: number[];
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
  { label: "Главная", href: "/" },
  { label: "Каталог TMDB", href: "/movies" },
  { label: "Премьеры", href: "#premieres" },
  { label: "Люди", href: "#people" },
  { label: "Новости", href: "#news" },
];

export const nowFilters = [
  "Все фильмы",
  "Премьеры 30 дней",
  "Рейтинг 7+",
  "Популярные",
  "Боевики",
];

export const nowPlaying: Movie[] = [
  {
    title: "Джокер",
    genre: "Триллер • 2ч 2м",
    rating: 9.1,
    tag: "IMAX",
    badge: "Хит",
    image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },
  {
    title: "Хищные птицы",
    genre: "Боевик • 1ч 49м",
    rating: 8.0,
    tag: "4DX",
    badge: "Премьера",
    image: "https://image.tmdb.org/t/p/w500/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg",
  },
  {
    title: "Ford против Ferrari",
    genre: "Биография • 2ч 32м",
    rating: 8.6,
    tag: "PREMIUM",
    image: "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
  },
  {
    title: "Джокер: версия режиссёра",
    genre: "Драма • 2ч 2м",
    rating: 8.9,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
  },
  {
    title: "Чудо‑женщина 1984",
    genre: "Фантастика • 2ч 31м",
    rating: 7.4,
    tag: "2D",
    image: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
  },
  {
    title: "1917",
    genre: "Военный • 1ч 59м",
    rating: 8.5,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
  },
  {
    title: "Бладшот",
    genre: "Фантастика • 1ч 49м",
    rating: 7.8,
    tag: "4DX",
    image: "https://image.tmdb.org/t/p/w500/aQvJ5WPzZgYVDrxLX4R6cLJCEaQ.jpg",
  },
  {
    title: "Человек‑паук: Через вселенные",
    genre: "Анимация • 1ч 43м",
    rating: 8.1,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg",
  },
];

export const trailerHero = {
  title: "Форсаж 9",
  description:
    "Доминик Торетто вновь собирает семью, чтобы бросить вызов старому врагу. Гонки, трюки и огромный бюджет — то, что мы любим в серии.",
  image: "https://image.tmdb.org/t/p/w1280/bOFaAXmWWXC3Rbv4u4uM9ZSzRXP.jpg",
  duration: "2:32",
  tag: "Трейлер недели",
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
    title: "Тихое место II",
    time: "02:10",
    note: "Премьера",
    image: "https://image.tmdb.org/t/p/w780/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
  },
  {
    title: "Дюна",
    time: "01:34",
    image: "https://image.tmdb.org/t/p/w780/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg",
  },
  {
    title: "Отряд самоубийц",
    time: "02:08",
    image: "https://image.tmdb.org/t/p/w780/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
  },
  {
    title: "Вечные",
    time: "03:11",
    note: "IMAX",
    image: "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  },
];

export const popularMovies: Movie[] = [
  {
    title: "Джуманджи: Новый уровень",
    genre: "Приключения • 2ч 3м",
    rating: 8.9,
    tag: "Семейное",
    year: 2019,
    image: "https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg",
  },
  {
    title: "Джокер",
    genre: "Триллер • 2ч 2м",
    rating: 9.1,
    tag: "IMAX",
    badge: "Хит",
    year: 2019,
    image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },
  {
    title: "Джокер: версия режиссёра",
    genre: "Драма • 2ч 2м",
    rating: 8.9,
    tag: "Премьера",
    year: 2024,
    image: "https://image.tmdb.org/t/p/w500/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
  },
  {
    title: "Ford против Ferrari",
    genre: "Биография • 2ч 32м",
    rating: 8.6,
    tag: "Спорт",
    year: 2019,
    image: "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
  },
  {
    title: "1917",
    genre: "Военный • 1ч 59м",
    rating: 8.5,
    tag: "IMAX",
    year: 2019,
    image: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
  },
  {
    title: "Чудо‑женщина 1984",
    genre: "Фантастика • 2ч 31м",
    rating: 7.4,
    tag: "Фэнтези",
    year: 2020,
    image: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
  },
];

export const peopleSpotlight: Person[] = [
  {
    name: "Алина Захарова",
    role: "Режиссёр",
    knownFor: "«Полярный свет» — хитовый сериал",
    delta: "+112 350",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&facepad=3&w=320&h=320&q=80",
  },
  {
    name: "Максим Иванов",
    role: "Актёр",
    knownFor: "«Форсаж 9» — роль второго плана",
    delta: "+75 930",
    image:
      "https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=facearea&facepad=3&w=320&h=320&q=80",
  },
];

export const peopleBoard: PersonStat[] = [
  { name: "Екатерина Смирнова", role: "Режиссёр", delta: "+112 350" },
  { name: "Дмитрий Орлов", role: "Актёр", delta: "+83 455" },
  { name: "София Кузнецова", role: "Актриса", delta: "+78 124" },
  { name: "Игорь Павлов", role: "Продюсер", delta: "+61 044" },
  { name: "Мария Волкова", role: "Актриса", delta: "+55 023" },
  { name: "Андрей Лебедев", role: "Сценарист", delta: "+49 011" },
  { name: "Олег Никитин", role: "Оператор", delta: "+42 680" },
  { name: "Наталья Романова", role: "Актриса", delta: "+39 520" },
];

export const newsArticles: News[] = [
  {
    title: "Каскадёры объединились. Как снимали финальный трюк в «Форсаже 9»",
    date: "07 января 2025",
    excerpt:
      "Группа постановщиков поделилась деталями финальной сцены — использовали реальные автомобили и минимум графики.",
    image:
      "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Новый фестиваль авторского кино пройдёт летом в Сочи",
    date: "05 января 2025",
    excerpt:
      "Организаторы обещают открытый питчинг, внеконкурсную программу и показы под открытым небом.",
    image:
      "https://images.unsplash.com/photo-1505682634904-d7c075c738d4?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Премия кинокритиков: кто лидирует в шорт-листе 2025",
    date: "01 января 2025",
    excerpt:
      "В списке претендентов — независимые драмы, научная фантастика и несколько отечественных премьер.",
    image:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=600&q=80",
  },
];

export const upcomingMovies: Movie[] = [
  {
    title: "Вечные",
    genre: "Фантастика • 2ч 35м",
    rating: 8.8,
    tag: "Премьера",
    image: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  },
  {
    title: "Топ Ган: Мэверик",
    genre: "Боевик • 2ч 11м",
    rating: 9.0,
    tag: "IMAX",
    image: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
  },
  {
    title: "Чёрная Вдова",
    genre: "Боевик • 2ч 6м",
    rating: 8.4,
    tag: "Премьера",
    image: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  },
  {
    title: "Отряд самоубийц",
    genre: "Боевик • 2ч 13м",
    rating: 7.9,
    tag: "DC",
    image: "https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg",
  },
];

export const boxOffice: BoxOffice[] = [
  {
    place: "1 место",
    title: "Джокер",
    amount: "$145 000 000",
    change: "+16%",
    image: "https://image.tmdb.org/t/p/w185/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg",
  },
  {
    place: "2 место",
    title: "Бладшот",
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
    title: "Чудо‑женщина 1984",
    amount: "$61 200 000",
    change: "+3%",
    image: "https://image.tmdb.org/t/p/w185/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
  },
];
