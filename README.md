# Kinoarea

Kinoarea — Next.js приложение с главной страницей кино-портала и каталогом фильмов на базе IMDb-данных (через OMDb API).

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Создайте `.env.local` в корне проекта:

```bash
# Для раздела /movies и /movies/[id]
OMDB_API_KEY=your_omdb_key

# Для динамических блоков на главной (TMDB)
TMDB_ACCESS_TOKEN=your_tmdb_token
```

> Без `OMDB_API_KEY` маршруты `/api/imdb/*` и страницы каталога IMDb не смогут загрузить реальные данные.

## Основные маршруты

- `/` — главная страница (секции, подборки, трейлеры).
- `/movies` — каталог IMDb с фильтрами (поиск, год, тип: movie/series).
- `/movies/[id]` — детальная страница фильма.
- `/api/imdb/search` — API поиска по IMDb (через OMDb).
- `/api/imdb/movies/[id]` — API деталей фильма.

## Проверка

```bash
npm run lint
npm run build
```
