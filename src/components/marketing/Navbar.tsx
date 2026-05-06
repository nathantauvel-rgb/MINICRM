import Link from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
            Fonctionnalités
          </a>
          <a href="#how" className="text-sm text-slate-600 hover:text-slate-900">
            Comment ça marche
          </a>
          <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
            Tarifs
          </a>
          <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-md bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>
    </header>
  );
}
