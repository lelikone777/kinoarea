# 🎬 Kinoarea

**Kinoarea** — веб-приложение о фильмах на **Next.js 16**.

Проект объединяет:
- главную страницу с секциями (сейчас в кино, трейлеры, популярные фильмы, люди, новости);
- каталог фильмов на базе IMDb-данных (через OMDb API);
- страницу детальной информации по фильму.

---

## 🚀 Технологии

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- Интеграции с внешними API:
  - **OMDb** (для IMDb-каталога)
  - **TMDB** (для динамических блоков на главной)

---

## 📁 Основные маршруты

- `/` — главная страница портала.
- `/movies` — каталог IMDb с фильтрами (поиск, год, тип: фильм/сериал).
- `/movies/[id]` — детальная страница фильма.
- `/api/imdb/search` — backend-эндпоинт поиска фильмов.
- `/api/imdb/movies/[id]` — backend-эндпоинт деталей фильма.
- `/api/popular-movies` — backend-эндпоинт популярных фильмов.

---

## ⚙️ Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Для IMDb-каталога (/movies и /movies/[id])
OMDB_API_KEY=your_omdb_api_key
# альтернативно (если уже используете public-переменные):
# NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key

# Для динамических данных с TMDB на главной
TMDB_ACCESS_TOKEN=your_tmdb_access_token
```

> Если `OMDB_API_KEY` (или `NEXT_PUBLIC_OMDB_API_KEY`) не задан, IMDb-маршруты и страницы каталога не смогут загрузить реальные данные.

Для удобства есть шаблон:

```bash
cp .env.example .env.local
```

---

## 🧑‍💻 Локальный запуск

```bash
npm install
npm run dev
```

Откройте: [http://localhost:3000](http://localhost:3000)

---

## ✅ Проверка перед деплоем

```bash
npm run lint
npm run build
```

---

## 📌 Примечание

Источником IMDb-данных в проекте выступает **OMDb API** (посредник с IMDb-метаданными).  
Для корректной работы на сервере нужно добавить переменные окружения в настройки среды деплоя (например, Vercel Project Settings → Environment Variables).
