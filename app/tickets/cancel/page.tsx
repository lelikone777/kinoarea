"use client";

import { CalendarIcon } from "../../components/icons";
import { PageShell } from "../../components/layout/PageShell";
import { LinkButton } from "../../components/ui/Button";
import { PanelCard } from "../../components/ui/Cards";

export default function TicketsCancelPage() {
  return (
    <PageShell mainClassName="relative z-10 mx-auto flex-1 max-w-3xl space-y-6 px-5 pb-24 pt-10">
      <PanelCard>
        <p className="text-xs uppercase tracking-[0.14em] text-amber-200">Оплата отменена (Demo)</p>
        <h1 className="mt-2 text-3xl font-extrabold">Платеж отменен</h1>
        <p className="mt-2 text-sm text-slate-300">
          Для демо-режима места могли остаться занятыми до перезапуска сервера.
        </p>
      </PanelCard>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/schedule" variant="cta">
          <CalendarIcon className="h-4 w-4 text-sky-600" />
          Вернуться к расписанию
        </LinkButton>
        <LinkButton href="/" variant="secondary">
          На главную
        </LinkButton>
      </div>
    </PageShell>
  );
}

