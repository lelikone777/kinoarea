import Link from "next/link";
import { ArrowRightIcon } from "../../components/icons";
import { PageShell } from "../../components/layout/PageShell";

type SubscriptionSuccessPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function SubscriptionSuccessPage({ searchParams }: SubscriptionSuccessPageProps) {
  const params = await searchParams;
  const email = params.email ?? "";

  return (
    <PageShell mainClassName="relative z-10 mx-auto flex-1 max-w-4xl px-5 pb-24 pt-10">
      <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Подписка</p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Спасибо за подписку</h1>
        <p className="text-base text-slate-200">
          {email ? `Ваш e-mail: ${email}` : "Вы успешно подписались на рассылку."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
        >
          <ArrowRightIcon className="h-4 w-4 rotate-180 text-slate-300" />
          Вернуться на главную
        </Link>
      </section>
    </PageShell>
  );
}
