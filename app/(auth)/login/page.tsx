"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않아요.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[18px] bg-pink-soft p-8 shadow-cookie-card">
        <h1 className="mb-1 text-center font-heading text-3xl text-pink-point">
          레시피북
        </h1>
        <p className="mb-8 text-center text-sm text-brown-text">
          오늘도 맛있는 하루 되세요 🍪
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border-[1.5px] border-pink-sub bg-cream px-5 py-3 text-base text-brown-text shadow-cookie-inset outline-none placeholder:text-brown-text/40 focus:border-pink-point"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border-[1.5px] border-pink-sub bg-cream px-5 py-3 text-base text-brown-text shadow-cookie-inset outline-none placeholder:text-brown-text/40 focus:border-pink-point"
          />

          {error && (
            <p className="text-center text-sm text-pink-deep">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-press mt-2 w-full rounded-full bg-pink-point py-3 font-heading text-lg text-cream shadow-cookie-btn disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
