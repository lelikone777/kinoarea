"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BellIcon, CalendarIcon, SearchIcon } from "../icons";
import { CloseIcon, MenuIcon } from "../icons";
import { Button } from "../ui/Button";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useUiDictionary } from "@/app/hooks/useUiDictionary";

type NavLink = {
  label: string;
  href: string;
};

type HeaderProps = {
  navLinks: NavLink[];
};

export function Header({ navLinks }: HeaderProps) {
  const { dictionary } = useUiDictionary();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const scrollPositionRef = useRef(0);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const closeNav = () => setIsMobileNavOpen(false);
  const openNav = () => setIsMobileNavOpen(true);
  const isLinkActive = (href: string) => {
    if (!href.startsWith("/")) {
      return false;
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeNav();
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      const target = event.target as Node;
      if (!profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (isMobileNavOpen) {
      scrollPositionRef.current = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollPositionRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    } else {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      if (scrollPositionRef.current) {
        window.scrollTo({ top: scrollPositionRef.current, behavior: "instant" as ScrollBehavior });
      }
    }
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const payload = (await response.json()) as {
          authenticated?: boolean;
          user?: { avatarUrl?: string | null; nickname?: string | null };
        };
        if (!ignore) {
          const authenticated = Boolean(payload.authenticated);
          setIsAuthenticated(authenticated);
          setAvatarUrl(authenticated ? (payload.user?.avatarUrl ?? null) : null);
          setNickname(authenticated ? (payload.user?.nickname ?? null) : null);
        }
      } catch {
        if (!ignore) {
          setIsAuthenticated(false);
          setAvatarUrl(null);
          setNickname(null);
        }
      }
    };
    void run();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-100 transition hover:bg-white/10 lg:hidden"
              aria-label={dictionary.header.openMenu}
              onClick={openNav}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Link href="/" className="flex cursor-pointer items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                <Image src="/logo-kinoera.png" alt="Логотип КиноЭра" fill sizes="48px" className="object-cover" priority />
              </div>
              <div className="hidden sm:block">
                <p className="text-lg font-bold">КиноЭра</p>
                <p className="text-xs text-slate-400">{dictionary.header.subtitle}</p>
              </div>
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-slate-200 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isLinkActive(item.href) ? "page" : undefined}
                className={`rounded-full px-3 py-1 transition ${
                  isLinkActive(item.href)
                    ? "bg-sky-400 text-slate-950"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                {dictionary.navByHref[item.href] ?? item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Button variant="icon">
              <SearchIcon className="h-5 w-5 text-slate-200" />
            </Button>
            <Button variant="icon">
              <BellIcon className="h-5 w-5 text-slate-200" />
            </Button>
            <LanguageSwitcher className="hidden sm:block" />
            <Button
              variant="cta"
              onClick={() => router.push("/schedule")}
              className="hidden sm:flex bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-300 text-slate-950 shadow-lg shadow-amber-300/30 ring-1 ring-white/30 hover:from-amber-200 hover:via-sky-200 hover:to-indigo-200"
            >
              <CalendarIcon className="h-4 w-4 text-slate-900" />
              {dictionary.header.schedule}
            </Button>
            {isAuthenticated ? (
              <div ref={profileMenuRef} className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 transition hover:border-white/35"
                  aria-label="Открыть меню профиля"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Аватар пользователя" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">{nickname?.charAt(0).toUpperCase() ?? "U"}</span>
                  )}
                </button>

                {isProfileMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push("/profile");
                      }}
                      className="block w-full px-4 py-2 text-left text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Настройки
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40"
                onClick={() => router.push("/auth/login")}
              >
                {dictionary.header.login}
              </button>
            )}
          </div>
        </div>
      </header>

      {isMobileNavOpen ? (
        <div
          className="fixed inset-0 z-40"
          onClick={closeNav}
          onMouseDown={closeNav}
          onTouchStart={closeNav}
        >
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" />
          <div
            className="relative z-10 flex min-h-full flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5">
              <Link href="/" className="flex cursor-pointer items-center gap-3" onClick={closeNav}>
                <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                  <Image src="/logo-kinoera.png" alt="Логотип КиноЭра" fill sizes="40px" className="object-cover" priority />
                </div>
                <p className="text-base font-bold text-white">КиноЭра</p>
              </Link>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label={dictionary.header.closeMenu}
                onClick={closeNav}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center px-6 pb-8 pt-6">
              <div className="w-full max-w-sm max-h-[calc(100vh-140px)] overflow-y-auto rounded-3xl bg-slate-900/90 p-6 text-center shadow-2xl shadow-sky-500/20 ring-1 ring-white/10 backdrop-blur">
                <div className="mb-6 flex flex-col items-center gap-2">
                  <p className="text-lg font-bold text-white">КиноЭра</p>
                  <p className="text-xs text-slate-400">{dictionary.header.mobileSubtitle}</p>
                </div>
                <div className="flex flex-col items-center gap-3 pb-4 pt-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      aria-current={isLinkActive(link.href) ? "page" : undefined}
                      className={`w-full rounded-2xl px-4 py-3 text-base font-semibold transition ${
                        isLinkActive(link.href)
                          ? "bg-sky-400 text-slate-950"
                          : "text-slate-100 hover:bg-white/10"
                      }`}
                      onClick={closeNav}
                    >
                      {dictionary.navByHref[link.href] ?? link.label}
                    </Link>
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
