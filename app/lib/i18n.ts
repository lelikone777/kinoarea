import { normalizeSiteLanguage, type SiteLanguage } from "./language";

type UiDictionary = {
  navByHref: Record<string, string>;
  header: {
    openMenu: string;
    closeMenu: string;
    subtitle: string;
    mobileSubtitle: string;
    schedule: string;
    login: string;
  };
  footer: {
    subtitle: string;
    links: string[];
    copyright: string;
  };
  common: {
    loading: string;
    unknown: string;
    backToHome: string;
  };
  movies: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    anyYear: string;
    allGenres: string;
    sort: string;
    search: string;
    totalFound: string;
    totalAvailable: string;
    pages: string;
    pageInputAria: string;
    goto: string;
    notFoundByFilters: string;
    unavailable: string;
    yearUnknown: string;
    rating: string;
    noDescription: string;
    showMore: string;
  };
  actors: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    sort: string;
    search: string;
    totalFound: string;
    totalAvailable: string;
    pages: string;
    pageInputAria: string;
    goto: string;
    notFoundByFilters: string;
    unavailable: string;
    actorFallback: string;
    popularity: string;
    careerUpdating: string;
    showMore: string;
  };
  schedule: {
    title: string;
    subtitle: string;
    city: string;
    day: string;
    moviesCountSuffix: string;
    noSessions: string;
    cinemaFallback: string;
    fromPrice: string;
    demoNoteTitle: string;
    demoNoteBody: string;
    todayPrefix: string;
  };
  booking: {
    back: string;
    demoTag: string;
    standard: string;
    premium: string;
    maxSeats: string;
    screen: string;
    taken: string;
    selected: string;
    yourOrder: string;
    seats: string;
    count: string;
    total: string;
    notSelected: string;
    pay: string;
    processing: string;
    demoHint: string;
  };
  tickets: {
    cancelTag: string;
    cancelTitle: string;
    cancelDescription: string;
    backToSchedule: string;
    successTag: string;
    successTitle: string;
    successDescriptionPrefix: string;
    order: string;
    session: string;
    seats: string;
    total: string;
    reservationMissing: string;
    toSchedule: string;
  };
  movieDetails: {
    back: string;
    releaseDate: string;
    status: string;
    budget: string;
    revenue: string;
    language: string;
    voteCount: string;
    officialSite: string;
    trailer: string;
    cast: string;
    crew: string;
    similar: string;
    recommendations: string;
    noOverview: string;
    noCast: string;
    noCrew: string;
    unknownRole: string;
    unknownJob: string;
  };
  actorDetails: {
    back: string;
    actorFallback: string;
    popularity: string;
    birthDate: string;
    birthPlace: string;
    deathDate: string;
    knownFor: string;
    filmography: string;
    behindScenes: string;
    yearUnknown: string;
    rating: string;
    role: string;
    noKnownFor: string;
    noRoles: string;
    noCrew: string;
  };
  nowPlaying: {
    subtitle: string;
    title: string;
    description: string;
    fullList: string;
    details: string;
    noResults: string;
    selected: string;
  };
  trailers: {
    title: string;
    all: string;
    action: string;
    drama: string;
    watch: string;
    toSchedule: string;
    editorsPick: string;
    trailerSoon: string;
  };
};

const ru: UiDictionary = {
  navByHref: {
    "/": "Главная",
    "/movies": "Каталог",
    "/actors": "Актеры",
    "/people": "Люди",
    "/news": "Новости",
    "/schedule": "Расписание",
  },
  header: {
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    subtitle: "афиша и билеты",
    mobileSubtitle: "медиа, фильмы и подборки",
    schedule: "Расписание",
    login: "Войти",
  },
  footer: {
    subtitle: "афиша, премьеры, билеты",
    links: ["О сервисе", "Редакция", "Поддержка", "Реклама", "Вакансии"],
    copyright: "(c) 2025 КиноЭра. Все права защищены.",
  },
  common: {
    loading: "Загрузка...",
    unknown: "N/A",
    backToHome: "На главную",
  },
  movies: {
    title: "Каталог фильмов TMDB",
    subtitle: "Ищите и фильтруйте фильмы с помощью API The Movie Database.",
    searchPlaceholder: "Название фильма",
    anyYear: "Любой год",
    allGenres: "Все жанры",
    sort: "Сортировка",
    search: "Найти",
    totalFound: "Найдено всего",
    totalAvailable: "Доступно для просмотра",
    pages: "Страницы",
    pageInputAria: "Номер страницы",
    goto: "Перейти",
    notFoundByFilters: "По текущим фильтрам фильмы не найдены.",
    unavailable: "Сейчас фильмы недоступны.",
    yearUnknown: "Год неизвестен",
    rating: "рейтинг",
    noDescription: "Описание отсутствует.",
    showMore: "Показать ещё",
  },
  actors: {
    title: "Каталог актеров TMDB",
    subtitle: "Ищите актеров и открывайте их фильмографию.",
    searchPlaceholder: "Имя актера",
    sort: "Сортировка",
    search: "Найти",
    totalFound: "Найдено всего",
    totalAvailable: "Доступно для просмотра",
    pages: "Страницы",
    pageInputAria: "Номер страницы",
    goto: "Перейти",
    notFoundByFilters: "По текущему запросу актеры не найдены.",
    unavailable: "Сейчас актеры недоступны.",
    actorFallback: "Актер",
    popularity: "популярность",
    careerUpdating: "Карьера обновляется.",
    showMore: "Показать ещё",
  },
  schedule: {
    title: "Расписание сеансов (Demo)",
    subtitle: "Портфолио-модуль: выбор города, сеанса, мест и оплата через Stripe Test.",
    city: "Город",
    day: "День",
    moviesCountSuffix: "фильмов",
    noSessions: "Сеансов на выбранный день нет (demo).",
    cinemaFallback: "Кинотеатр",
    fromPrice: "от",
    demoNoteTitle: "Demo-заметка",
    demoNoteBody: "Данные расписания и залы сгенерированы для портфолио. Покупка будет через Stripe test mode.",
    todayPrefix: "Сегодня",
  },
  booking: {
    back: "Назад к расписанию",
    demoTag: "Demo-покупка • Stripe Test",
    standard: "Стандарт",
    premium: "Премиум",
    maxSeats: "Макс 8 мест",
    screen: "Экран",
    taken: "Занято",
    selected: "Выбрано",
    yourOrder: "Ваш заказ",
    seats: "Места",
    count: "Кол-во",
    total: "Итого",
    notSelected: "не выбраны",
    pay: "Перейти к оплате (Stripe)",
    processing: "Оформляем...",
    demoHint: "Это demo-покупка: после оплаты в Stripe test вы увидите страницу успеха.",
  },
  tickets: {
    cancelTag: "Оплата отменена (Demo)",
    cancelTitle: "Платеж отменен",
    cancelDescription: "Для демо-режима места могли остаться занятыми до перезапуска сервера.",
    backToSchedule: "Вернуться к расписанию",
    successTag: "Оплата завершена (Demo)",
    successTitle: "Билеты оформлены",
    successDescriptionPrefix: "Это портфолио-демо. Статус Stripe:",
    order: "Заказ",
    session: "Сеанс",
    seats: "Места",
    total: "Сумма",
    reservationMissing: "Не удалось найти бронь. Для демо это нормально, если сервер перезапускался.",
    toSchedule: "К расписанию",
  },
  movieDetails: {
    back: "Назад в каталог",
    releaseDate: "Дата релиза",
    status: "Статус",
    budget: "Бюджет",
    revenue: "Сборы",
    language: "Язык",
    voteCount: "Количество голосов",
    officialSite: "Официальный сайт",
    trailer: "Трейлер",
    cast: "Актеры",
    crew: "Съемочная группа",
    similar: "Похожие",
    recommendations: "Рекомендации",
    noOverview: "Описание отсутствует.",
    noCast: "Нет данных по актерам.",
    noCrew: "Нет данных по съемочной группе.",
    unknownRole: "Неизвестная роль",
    unknownJob: "Неизвестная должность",
  },
  actorDetails: {
    back: "Назад в каталог актеров",
    actorFallback: "Актер",
    popularity: "популярность",
    birthDate: "Дата рождения",
    birthPlace: "Место рождения",
    deathDate: "Дата смерти",
    knownFor: "Известен по",
    filmography: "Фильмография (актер)",
    behindScenes: "За кадром",
    yearUnknown: "Год неизвестен",
    rating: "рейтинг",
    role: "роль",
    noKnownFor: "Данные о работах пока недоступны.",
    noRoles: "Нет данных о ролях.",
    noCrew: "Нет данных по съемочной группе.",
  },
  nowPlaying: {
    subtitle: "Горячие сеансы сегодня",
    title: "Сейчас в прокате",
    description: "Смотрите свежие премьеры и выбирайте фильмы по релизу, рейтингу, популярности и жанру.",
    fullList: "Полный список",
    details: "Подробнее",
    noResults: "По выбранному фильтру фильмы пока не найдены.",
    selected: "Выбрано",
  },
  trailers: {
    title: "Трейлеры недели",
    all: "Все трейлеры",
    action: "Экшн",
    drama: "Драма",
    watch: "Смотреть",
    toSchedule: "В расписание",
    editorsPick: "Выбор редакции и лучшие моменты фильма",
    trailerSoon: "Трейлер скоро",
  },
};

const en: UiDictionary = {
  navByHref: {
    "/": "Home",
    "/movies": "Catalog",
    "/actors": "Actors",
    "/people": "People",
    "/news": "News",
    "/schedule": "Schedule",
  },
  header: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    subtitle: "showtimes and tickets",
    mobileSubtitle: "media, movies and picks",
    schedule: "Schedule",
    login: "Sign in",
  },
  footer: {
    subtitle: "showtimes, premieres, tickets",
    links: ["About", "Editorial", "Support", "Ads", "Careers"],
    copyright: "(c) 2025 KinoEra. All rights reserved.",
  },
  common: {
    loading: "Loading...",
    unknown: "N/A",
    backToHome: "Home",
  },
  movies: {
    title: "TMDB Movie Catalog",
    subtitle: "Search and filter movies using The Movie Database API.",
    searchPlaceholder: "Movie title",
    anyYear: "Any year",
    allGenres: "All genres",
    sort: "Sorting",
    search: "Search",
    totalFound: "Total found",
    totalAvailable: "Available to browse",
    pages: "Pages",
    pageInputAria: "Page number",
    goto: "Go",
    notFoundByFilters: "No movies found for current filters.",
    unavailable: "Movies are currently unavailable.",
    yearUnknown: "Year unknown",
    rating: "rating",
    noDescription: "No description available.",
    showMore: "Show more",
  },
  actors: {
    title: "TMDB Actor Catalog",
    subtitle: "Search actors and explore their filmography.",
    searchPlaceholder: "Actor name",
    sort: "Sorting",
    search: "Search",
    totalFound: "Total found",
    totalAvailable: "Available to browse",
    pages: "Pages",
    pageInputAria: "Page number",
    goto: "Go",
    notFoundByFilters: "No actors found for current query.",
    unavailable: "Actors are currently unavailable.",
    actorFallback: "Actor",
    popularity: "popularity",
    careerUpdating: "Career data is updating.",
    showMore: "Show more",
  },
  schedule: {
    title: "Showtime Schedule (Demo)",
    subtitle: "Portfolio module: city, screening, seats and Stripe Test checkout.",
    city: "City",
    day: "Day",
    moviesCountSuffix: "movies",
    noSessions: "No screenings for selected day (demo).",
    cinemaFallback: "Cinema",
    fromPrice: "from",
    demoNoteTitle: "Demo note",
    demoNoteBody: "Schedule and halls are generated for portfolio purposes. Checkout uses Stripe test mode.",
    todayPrefix: "Today",
  },
  booking: {
    back: "Back to schedule",
    demoTag: "Demo checkout • Stripe Test",
    standard: "Standard",
    premium: "Premium",
    maxSeats: "Max 8 seats",
    screen: "Screen",
    taken: "Taken",
    selected: "Selected",
    yourOrder: "Your order",
    seats: "Seats",
    count: "Count",
    total: "Total",
    notSelected: "not selected",
    pay: "Proceed to payment (Stripe)",
    processing: "Processing...",
    demoHint: "Demo checkout: after test payment in Stripe you will see the success page.",
  },
  tickets: {
    cancelTag: "Payment canceled (Demo)",
    cancelTitle: "Payment canceled",
    cancelDescription: "In demo mode seats may remain blocked until server restart.",
    backToSchedule: "Back to schedule",
    successTag: "Payment completed (Demo)",
    successTitle: "Tickets issued",
    successDescriptionPrefix: "Portfolio demo. Stripe status:",
    order: "Order",
    session: "Session",
    seats: "Seats",
    total: "Total",
    reservationMissing: "Reservation was not found. In demo mode this is normal after server restart.",
    toSchedule: "To schedule",
  },
  movieDetails: {
    back: "Back to catalog",
    releaseDate: "Release date",
    status: "Status",
    budget: "Budget",
    revenue: "Revenue",
    language: "Language",
    voteCount: "Vote count",
    officialSite: "Official site",
    trailer: "Trailer",
    cast: "Cast",
    crew: "Crew",
    similar: "Similar",
    recommendations: "Recommendations",
    noOverview: "No overview available.",
    noCast: "No cast data.",
    noCrew: "No crew data.",
    unknownRole: "Unknown role",
    unknownJob: "Unknown job",
  },
  actorDetails: {
    back: "Back to actors",
    actorFallback: "Actor",
    popularity: "popularity",
    birthDate: "Birth date",
    birthPlace: "Birth place",
    deathDate: "Death date",
    knownFor: "Known for",
    filmography: "Filmography (cast)",
    behindScenes: "Behind the scenes",
    yearUnknown: "Year unknown",
    rating: "rating",
    role: "role",
    noKnownFor: "Known-for data is unavailable.",
    noRoles: "No cast roles found.",
    noCrew: "No crew entries found.",
  },
  nowPlaying: {
    subtitle: "Hot sessions today",
    title: "Now playing",
    description: "Browse fresh premieres and pick movies by release, rating, popularity and genre.",
    fullList: "Full list",
    details: "Details",
    noResults: "No movies found for selected filter.",
    selected: "Selected",
  },
  trailers: {
    title: "Trailers of the week",
    all: "All trailers",
    action: "Action",
    drama: "Drama",
    watch: "Watch",
    toSchedule: "To schedule",
    editorsPick: "Editors' choice and best moments",
    trailerSoon: "Trailer soon",
  },
};

const dictionaries: Record<SiteLanguage, UiDictionary> = {
  "ru-RU": ru,
  "en-US": en,
};

export function getUiDictionary(language: SiteLanguage) {
  return dictionaries[normalizeSiteLanguage(language)];
}
