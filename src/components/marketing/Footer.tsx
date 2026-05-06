import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-slate-600">
              Le CRM pensé pour les micro-entrepreneurs et freelances français.
              Simple, rapide, conforme.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Produit</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-slate-900">Fonctionnalités</a></li>
              <li><a href="#pricing" className="hover:text-slate-900">Tarifs</a></li>
              <li><a href="#faq" className="hover:text-slate-900">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Compte</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/login" className="hover:text-slate-900">Connexion</Link></li>
              <li><Link href="/signup" className="hover:text-slate-900">Inscription</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} MiniCRM. Fait en France.</p>
          <p>Hébergé sur Vercel · Données chiffrées</p>
        </div>
      </div>
    </footer>
  );
}
