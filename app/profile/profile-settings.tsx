"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string | null;
  createdAt: string;
};

export function ProfileSettings() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/profile");
        const payload = await response.json();
        if (!response.ok) {
          setError(payload.error ?? "Не удалось загрузить профиль");
          return;
        }
        setUser(payload.user);
        setNickname(payload.user.nickname);
        setAvatarUrl(payload.user.avatarUrl ?? "");
      } catch {
        setError("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const saveProfile = async () => {
    setMessage(null);
    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          avatarUrl: avatarUrl || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Не удалось сохранить профиль");
        return;
      }
      setUser(payload.user);
      setMessage("Профиль обновлен");
      router.refresh();
    } catch {
      setMessage("Не удалось сохранить профиль");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setMessage(null);
    setSavingPassword(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Не удалось сменить пароль");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setMessage("Пароль обновлен");
    } catch {
      setMessage("Не удалось сменить пароль");
    } finally {
      setSavingPassword(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <p className="text-sm text-slate-300">Загружаем профиль...</p>;
  }

  if (!user || error) {
    return <p className="text-sm font-semibold text-rose-300">{error ?? "Профиль недоступен"}</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold text-white">Личный кабинет</h1>
        <p className="mt-1 text-sm text-slate-300">Email: {user.email}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Профиль</h2>
        <div className="mt-4 grid gap-3">
          <input
            type="text"
            placeholder="Никнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="url"
            placeholder="URL аватара"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-70"
          >
            {savingProfile ? "Сохраняем..." : "Сохранить профиль"}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Сменить пароль</h2>
        <div className="mt-4 grid gap-3">
          <input
            type="password"
            placeholder="Текущий пароль"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="password"
            placeholder="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="password"
            placeholder="Повторите новый пароль"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <button
            onClick={savePassword}
            disabled={savingPassword}
            className="rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-300 disabled:opacity-70"
          >
            {savingPassword ? "Обновляем..." : "Обновить пароль"}
          </button>
        </div>
      </div>

      {message ? <p className="text-sm font-semibold text-sky-300">{message}</p> : null}

      <button
        onClick={logout}
        className="rounded-xl border border-rose-400/40 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
      >
        Выйти
      </button>
    </section>
  );
}
