import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatEUR,
  formatDate,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
  invoiceDisplayStatus,
} from "@/lib/format";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, status, issue_date, due_date, total_ht, clients(name, company)")
    .order("issue_date", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Factures</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vos factures émises, conformes à la législation française.
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Nouvelle facture
        </Link>
      </div>

      {!invoices || invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <Th>Numéro</Th>
                <Th>Client</Th>
                <Th>Émission</Th>
                <Th>Échéance</Th>
                <Th>Statut</Th>
                <Th className="text-right">Montant HT</Th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients;
                const display = invoiceDisplayStatus(inv.status, inv.due_date);
                return (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <Td>
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-700"
                      >
                        {inv.number}
                      </Link>
                    </Td>
                    <Td className="text-slate-700">{client?.company || client?.name || "—"}</Td>
                    <Td className="text-slate-600">{formatDate(inv.issue_date)}</Td>
                    <Td className="text-slate-600">{formatDate(inv.due_date)}</Td>
                    <Td>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_COLOR[display] ?? ""}`}>
                        {INVOICE_STATUS_LABEL[display] ?? display}
                      </span>
                    </Td>
                    <Td className="text-right font-medium">{formatEUR(Number(inv.total_ht))}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-4 text-sm ${className}`}>{children}</td>;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
        <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 9h8M8 13h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Aucune facture pour l&apos;instant</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Créez votre première facture ou convertissez un devis accepté.
      </p>
      <Link
        href="/dashboard/invoices/new"
        className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
      >
        Créer une facture
      </Link>
    </div>
  );
}
