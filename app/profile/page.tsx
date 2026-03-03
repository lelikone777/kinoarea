import { redirect } from "next/navigation";
import { getServerSession } from "../lib/auth/session";
import { ProfileSettings } from "./profile-settings";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <ProfileSettings />
    </main>
  );
}
