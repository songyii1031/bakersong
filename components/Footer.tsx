export default function Footer() {
  return (
    <footer className="mt-10 rounded-t-[24px] bg-pink-soft px-6 py-8 text-center">
      <h2 className="font-heading text-lg text-pink-point">Songururu Recipe Book 🍞</h2>
      <p className="mt-2 text-xs leading-relaxed text-brown-text/70">
        홈베이킹을 좋아하는 Song이 만든 레시피북입니다.
        <br />
        직접 만든 레시피와 베이킹 기록을 공유합니다.
      </p>

      <div className="mt-5 flex flex-col gap-1 text-xs">
        <p className="font-heading text-brown-text">📧 Contact</p>
        <a
          href="mailto:songyii1031@naver.com"
          className="text-pink-deep underline underline-offset-2"
        >
          songyii1031@naver.com
        </a>
      </div>

      <div className="mt-4 flex flex-col gap-1 text-xs">
        <p className="font-heading text-brown-text">📷 Instagram</p>
        <a
          href="https://instagram.com/__songing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-deep underline underline-offset-2"
        >
          @__songing
        </a>
      </div>

      <p className="mt-5 text-xs text-brown-text/70">
        💬 문의 및 제안은 언제든 환영합니다.
      </p>

      <p className="mt-6 text-[11px] text-brown-text/40">
        © 2026 Songururu. All rights reserved.
      </p>
    </footer>
  );
}
