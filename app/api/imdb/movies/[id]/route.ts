import { NextResponse } from "next/server";
import { getImdbMovieDetails } from "../../../../lib/imdb";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const movie = await getImdbMovieDetails(id);
    return NextResponse.json(movie);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch IMDb movie";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
