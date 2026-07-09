"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col px-5 pt-6">
      <h1 className="font-heading text-2xl text-brown-text">설정</h1>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="btn-press mt-8 flex items-center justify-center gap-2 rounded-full bg-pink-point py-3 font-heading text-base text-cream shadow-cookie-btn disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        {loading ? "로그아웃 중..." : "로그아웃"}
      </button>
    </main>
  );
}
