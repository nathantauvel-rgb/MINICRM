import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-600">
          Bienvenue ! Voici un aperçu de votre activité.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Chiffre d'affaires (mois)" value="0 €" hint="—" />
        <StatCard label="Factures en attente" value="0 €" hint="0 client" />
        <StatCard label="Devis en cours" value="0" hint="—" />
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Démarrons par votre premier client</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Ajoutez votre premier client pour pouvoir créer des devis et des
          factures.
        </p>
        <Link
          href="/dashboard/clients"
          className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
        >
          Ajouter un client
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
