import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteClientButton from "./delete-button";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, company, email, phone, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gérez votre carnet d&apos;adresses professionnel.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Nouveau client
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Erreur de chargement : {error.message}
        </div>
      )}

      {clients && clients.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <Th>Nom</Th>
                <Th>Société</Th>
                <Th>Email</Th>
                <Th>Téléphone</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {clients?.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <Td>
                    <Link
                      href={`/dashboard/clients/${c.id}`}
                      className="font-medium text-slate-900 hover:text-emerald-700"
                    >
                      {c.name}
                    </Link>
                  </Td>
                  <Td className="text-slate-600">{c.company || "—"}</Td>
                  <Td className="text-slate-600">{c.email || "—"}</Td>
                  <Td className="text-slate-600">{c.phone || "—"}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/clients/${c.id}`}
                        className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Modifier
                      </Link>
                      <DeleteClientButton id={c.id} name={c.name} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-4 text-sm ${className}`}>{children}</td>;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
        <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Aucun client pour l&apos;instant</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Ajoutez votre premier client pour pouvoir créer des devis et des factures.
      </p>
      <Link
        href="/dashboard/clients/new"
        className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
      >
        Ajouter mon premier client
      </Link>
    </div>
  );
}
