# Kinoarea

Next.js app with TMDB-based movie data.

## Environment Variables

Create `.env.local` from `.env.example`.

Required for DB/auth/ratings:

```bash
DATABASE_URL=postgres://... # pooled runtime URL
DIRECT_URL=postgres://...   # direct URL for Prisma migrations
AUTH_SECRET=your_long_random_secret
```

Set at least one TMDB credential:

```bash
TMDB_ACCESS_TOKEN=your_tmdb_v4_access_token
# or
TMDB_API_KEY=your_tmdb_v3_api_key
```

`/movies`, `/movies/[id]`, `/movie/[id]`, and home sections use TMDB.

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production (Vercel + Postgres)

1. Set `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET` in Vercel Project Settings -> Environment Variables.
2. Keep Prisma migrations in `prisma/migrations` under version control.
3. Deploy normally. Build script runs:

```bash
prisma generate && prisma migrate deploy && next build
```

This ensures schema is applied in production before the app starts.
