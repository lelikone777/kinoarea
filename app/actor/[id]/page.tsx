import { redirect } from "next/navigation";

type LegacyActorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyActorPage({ params }: LegacyActorPageProps) {
  const { id } = await params;
  redirect(`/actors/${id}`);
}
