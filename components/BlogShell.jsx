import Image from "next/image";
import Link from "next/link";

export default function BlogShell({ children }) {
  return (
    <div
      className="min-h-[100dvh] text-[var(--ink)] bg-[var(--paper)]"
      style={{
        "--ink": "#0B0D10",
        "--paper": "#EEF1F4",
        "--muted": "#5B6675",
        "--line": "rgba(11,13,16,0.12)",
        "--signal": "#1F6F8B",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <header className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_90%,white)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 min-w-0" aria-label="MHAROMO Systems home">
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={48}
              height={36}
              className="h-8 w-auto"
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span
                className="text-[13px] font-bold tracking-[0.08em] uppercase"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                MHAROMO
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[var(--muted)]">
                Systems
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <Link href="/services" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Services
            </Link>
            <Link href="/blogs" className="text-[var(--ink)]">
              Blog
            </Link>
            <Link href="/#contact" className="hidden sm:inline text-[var(--muted)] hover:text-[var(--ink)]">
              Contact
            </Link>
            <a
              href="https://wa.me/916009325630"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center bg-[var(--ink)] px-3 text-[var(--paper)] hover:bg-[var(--signal)] transition-colors"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-[var(--line)] bg-[#E8EDF2] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} MHAROMO Systems · Software &amp; web development · Nagaland
          </p>
          <div className="flex gap-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            <Link href="/blogs" className="hover:text-[var(--ink)]">
              Blog
            </Link>
            <Link href="/#projects" className="hover:text-[var(--ink)]">
              Projects
            </Link>
            <Link href="/" className="hover:text-[var(--ink)]">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
