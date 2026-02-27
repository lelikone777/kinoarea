# Kinoarea

Next.js app with TMDB-based movie data.

## Environment Variables

Create `.env.local` from `.env.local.example` and set at least one TMDB credential:

```bash
TMDB_ACCESS_TOKEN=your_tmdb_v4_access_token
# or
TMDB_API_KEY=your_tmdb_v3_api_key
```

`/movies`, `/movies/[id]`, `/movie/[id]`, and home sections use TMDB.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
