export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/90 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-sm font-black text-slate-900">
            KA
          </div>
          <div>
            <p className="text-base font-bold text-white">КиноЭра</p>
            <p className="text-xs text-slate-500">афиша, премьеры, билеты</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span>О сервисе</span>
          <span>Редакция</span>
          <span>Поддержка</span>
          <span>Реклама</span>
          <span>Вакансии</span>
        </div>
        <p className="text-xs text-slate-500">
          (c) 2025 КиноЭра. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
