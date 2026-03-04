"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/app/lib/auth/client-error";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/profile");
        const payload = await response.json();
        if (!response.ok) {
          setError(payload.error ?? "Failed to load profile");
          return;
        }
        setUser(payload.user);
        setNickname(payload.user.nickname);
        setAvatarUrl(payload.user.avatarUrl ?? "");
      } catch {
        setError("Failed to load profile");
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
        setMessage(payload.error ?? "Failed to save profile");
        return;
      }
      setUser(payload.user);
      setMessage("Profile updated");
      router.refresh();
    } catch {
      setMessage("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) {
      setMessage("Choose an image file first");
      return;
    }

    setMessage(null);
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(getApiErrorMessage(payload, "Failed to upload avatar"));
        return;
      }

      const nextUser = payload.user as UserProfile;
      setUser(nextUser);
      setAvatarUrl(nextUser.avatarUrl ?? "");
      setAvatarFile(null);
      setMessage("Avatar uploaded");
      router.refresh();
    } catch {
      setMessage("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
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
        setMessage(payload.error ?? "Failed to update password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setMessage("Password updated");
    } catch {
      setMessage("Failed to update password");
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
    return <p className="text-sm text-slate-300">Loading profile...</p>;
  }

  if (!user || error) {
    return <p className="text-sm font-semibold text-rose-300">{error ?? "Profile unavailable"}</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-300">Email: {user.email}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Profile settings</h2>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-slate-900/80">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No avatar</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                className="block text-xs text-slate-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
              />
              <button
                type="button"
                onClick={uploadAvatar}
                disabled={uploadingAvatar || !avatarFile}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:border-white/35 disabled:opacity-60"
              >
                {uploadingAvatar ? "Uploading..." : "Upload avatar"}
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="url"
            placeholder="Avatar URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-70"
          >
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">Change password</h2>
        <div className="mt-4 grid gap-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="password"
            placeholder="Repeat new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <button
            onClick={savePassword}
            disabled={savingPassword}
            className="rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-300 disabled:opacity-70"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </div>
      </div>

      {message ? <p className="text-sm font-semibold text-sky-300">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => router.push("/")}
          className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40"
        >
          На главную
        </button>
        <button
          onClick={logout}
          className="rounded-xl border border-rose-400/40 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
        >
          Выйти
        </button>
      </div>
    </section>
  );
}
