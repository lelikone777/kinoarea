"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getApiErrorMessage } from "@/app/lib/auth/client-error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(getApiErrorMessage(payload, "Login failed"));
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">Login</h1>
        <p className="mt-1 text-sm text-slate-300">Sign in to your account</p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
          />

          {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          No account?{" "}
          <Link href="/auth/register" className="font-semibold text-sky-300 hover:text-sky-200">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
