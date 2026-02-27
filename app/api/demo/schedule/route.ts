import { NextResponse } from "next/server";
import {
  DEMO_CINEMAS,
  DEMO_CITIES,
  DEMO_HALLS,
  DEMO_MOVIES,
  DEMO_SCREENINGS,
  type CityId,
} from "@/app/data/demoSchedule";

export type DemoScheduleResponse = {
  cities: typeof DEMO_CITIES;
  cinemas: typeof DEMO_CINEMAS;
  halls: typeof DEMO_HALLS;
  movies: typeof DEMO_MOVIES;
  screenings: typeof DEMO_SCREENINGS;
};

function isCityId(value: string): value is CityId {
  return value === "msk" || value === "spb" || value === "nsk";
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityIdParam = searchParams.get("cityId") ?? "msk";
  const day = searchParams.get("day"); // YYYY-MM-DD

  const cityId: CityId = isCityId(cityIdParam) ? cityIdParam : "msk";
  const base = DEMO_SCREENINGS.filter((s) => s.cityId === cityId);
  const screenings = day ? base.filter((s) => dayKey(s.startsAt) === day) : base;

  return NextResponse.json({
    cities: DEMO_CITIES,
    cinemas: DEMO_CINEMAS.filter((c) => c.cityId === cityId),
    halls: DEMO_HALLS,
    movies: DEMO_MOVIES,
    screenings,
  } satisfies DemoScheduleResponse);
}

