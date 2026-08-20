"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "總覽" },
  { href: "/timeline", label: "時程規劃" },
  { href: "/team", label: "團隊面板" },
  { href: "/requirements", label: "需求訪談紀錄" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            R3
          </span>
          <span className="hidden sm:inline">AIITNTPU 子計畫三・專案中心</span>
          <span className="sm:hidden">AIITNTPU 子計畫三</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
