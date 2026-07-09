import Image from "next/image";
import Link from "next/link";
import { User, LogIn } from "lucide-react";

export default function GatePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-20 w-20 overflow-hidden rounded-3xl shadow-cookie-card">
          <Image src="/icon-512.png" alt="레시피북" fill className="object-cover" priority />
        </div>
        <h1 className="font-heading text-2xl text-pink-point">송&apos;s 레시피북 🥨</h1>
        <p className="text-sm text-brown-text/70">누구로 들어갈까요?</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/home"
          className="btn-press flex w-full items-center justify-center gap-2 rounded-full bg-pink-soft py-3 font-heading text-base text-pink-deep shadow-cookie-btn"
        >
          <User className="h-4 w-4" />
          게스트로 입장
        </Link>
        <Link
          href="/login"
          className="btn-press flex w-full items-center justify-center gap-2 rounded-full bg-pink-point py-3 font-heading text-base text-cream shadow-cookie-btn"
        >
          <LogIn className="h-4 w-4" />
          송&apos;s 입장 (주인장)
        </Link>
      </div>
    </main>
  );
}
