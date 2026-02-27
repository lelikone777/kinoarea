import { redirect } from "next/navigation";

type LegacyMoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyMoviePage({ params }: LegacyMoviePageProps) {
  const { id } = await params;
  redirect(`/movies/${id}`);
}
