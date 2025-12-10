"use client";

import { useEffect, useState } from "react";
import { BellIcon, CalendarIcon, SearchIcon } from "../icons";
import { CloseIcon, MenuIcon } from "../icons";

type HeaderProps = {
  navLinks: string[];
};

export function Header({ navLinks }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const closeNav = () => setIsMobileNavOpen(false);
  const openNav = () => setIsMobileNavOpen(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeNav();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-100 transition hover:bg-white/10 lg:hidden"
              aria-label="Открыть меню"
              onClick={openNav}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg font-black text-slate-900 shadow-lg shadow-sky-500/30">
                KA
              </div>
              <div className="hidden sm:block">
                <p className="text-lg font-bold">КиноАреа</p>
                <p className="text-xs text-slate-400">афиша и билеты</p>
              </div>
            </div>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-slate-200 lg:flex">
            {navLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-full px-3 py-1 transition hover:bg-white/5 hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10">
              <SearchIcon className="h-5 w-5 text-slate-200" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10">
              <BellIcon className="h-5 w-5 text-slate-200" />
            </button>
            <button className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 sm:flex">
              <CalendarIcon className="h-4 w-4 text-sky-600" />
              Расписание
            </button>
            <button className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40">
              Войти
            </button>
          </div>
        </div>
      </header>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={closeNav}
          />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-sm font-black text-slate-900 shadow-lg shadow-sky-500/30">
                  KA
                </div>
                <p className="text-base font-bold text-white">Kinoarea</p>
              </div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Закрыть меню"
                onClick={closeNav}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center px-6 pb-8 pt-6">
              <div className="w-full max-w-sm rounded-3xl bg-slate-900/90 p-6 text-center shadow-2xl shadow-sky-500/20 ring-1 ring-white/10 backdrop-blur">
                <div className="mb-6 flex flex-col items-center gap-2">
                  <p className="text-lg font-bold text-white">Kinoarea</p>
                  <p className="text-xs text-slate-400">медиа, фильмы и подборки</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  {navLinks.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="w-full rounded-2xl px-4 py-3 text-base font-semibold text-slate-100 transition hover:bg-white/10"
                      onClick={closeNav}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
