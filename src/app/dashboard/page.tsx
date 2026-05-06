import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatEUR,
  formatDate,
  INVOICE_STATUS_COLOR,
  INVOICE_STATUS_LABEL,
  invoiceDisplayStatus,
  QUOTE_STATUS_COLOR,
  QUOTE_STATUS_LABEL,
} from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [invoicesRes, quotesRes, clientsRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, number, status, issue_date, due_date, paid_at, total_ht, clients(name, company)"),
    supabase
      .from("quotes")
      .select("id, number, status, issue_date, total_ht, clients(name, company)")
      .order("issue_date", { ascending: false })
      .limit(5),
    supabase.from("clients").select("id", { count: "exact", head: true }),
  ]);

  const invoices = invoicesRes.data ?? [];
  const recentQuotes = quotesRes.data ?? [];
  const clientsCount = clientsRes.count ?? 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const today = new Date(now.toDateString());

  let revenueMonth = 0;
  let revenueYear = 0;
  let outstanding = 0;
  let outstandingCount = 0;
  let overdue = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    const total = Number(inv.total_ht);
    if (inv.status === "paid" && inv.paid_at) {
      const paid = new Date(inv.paid_at);
      if (paid >= startOfYear) revenueYear += total;
      if (paid >= startOfMonth) revenueMonth += total;
    } else if (inv.status === "sent") {
      outstanding += total;
      outstandingCount += 1;
      if (new Date(inv.due_date) < today) {
        overdue += total;
        overdueCount += 1;
      }
    }
  }

  const recentInvoices = invoices
    .slice()
    .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
    .slice(0, 5);

  // Last 6 months revenue
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    let total = 0;
    for (const inv of invoices) {
      if (inv.status === "paid" && inv.paid_at) {
        const paid = new Date(inv.paid_at);
        if (paid >= m && paid < next) total += Number(inv.total_ht);
      }
    }
    months.push({
      label: m.toLocaleDateString("fr-FR", { month: "short" }),
      total,
    });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  const isEmpty = invoices.length === 0 && recentQuotes.length === 0 && clientsCount === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-600">Aperçu de votre activité.</p>
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="CA encaissé (mois)" value={formatEUR(revenueMonth)} accent="emerald" />
            <StatCard label="CA encaissé (année)" value={formatEUR(revenueYear)} accent="slate" />
            <StatCard label="En attente" value={formatEUR(outstanding)} hint={`${outstandingCount} facture${outstandingCount > 1 ? "s" : ""}`} accent="blue" />
            <StatCard label="En retard" value={formatEUR(overdue)} hint={`${overdueCount} facture${overdueCount > 1 ? "s" : ""}`} accent="red" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">CA encaissé — 6 derniers mois</h3>
                <span className="text-xs text-slate-500">{formatEUR(months.reduce((s, m) => s + m.total, 0))}</span>
              </div>
              <div className="mt-6 flex items-end gap-3 h-40">
                {months.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end h-32">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                        style={{ height: `${Math.max(2, (m.total / maxMonth) * 100)}%` }}
                        title={formatEUR(m.total)}
                      />
                    </div>
                    <span className="text-xs text-slate-500 capitalize">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900">Raccourcis</h3>
              <div className="mt-4 space-y-2">
                <QuickLink href="/dashboard/invoices/new" label="Nouvelle facture" />
                <QuickLink href="/dashboard/quotes/new" label="Nouveau devis" />
                <QuickLink href="/dashboard/clients/new" label="Nouveau client" />
                <QuickLink href="/dashboard/settings" label="Paramètres entreprise" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Dernières factures</h3>
                <Link href="/dashboard/invoices" className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
                  Voir tout →
                </Link>
              </div>
              {recentInvoices.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-500">Aucune facture pour l&apos;instant.</p>
              ) : (
                <ul>
                  {recentInvoices.map((inv) => {
                    const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients;
                    const display = invoiceDisplayStatus(inv.status, inv.due_date);
                    return (
                      <li key={inv.id} className="border-b border-slate-100 last:border-0">
                        <Link href={`/dashboard/invoices/${inv.id}`} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-slate-50/50">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {inv.number} · {client?.company || client?.name || "—"}
                            </p>
                            <p className="text-xs text-slate-500">{formatDate(inv.issue_date)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_COLOR[display] ?? ""}`}>
                              {INVOICE_STATUS_LABEL[display] ?? display}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{formatEUR(Number(inv.total_ht))}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Derniers devis</h3>
                <Link href="/dashboard/quotes" className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
                  Voir tout →
                </Link>
              </div>
              {recentQuotes.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-slate-500">Aucun devis pour l&apos;instant.</p>
              ) : (
                <ul>
                  {recentQuotes.map((q) => {
                    const client = Array.isArray(q.clients) ? q.clients[0] : q.clients;
                    return (
                      <li key={q.id} className="border-b border-slate-100 last:border-0">
                        <Link href={`/dashboard/quotes/${q.id}`} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-slate-50/50">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {q.number} · {client?.company || client?.name || "—"}
                            </p>
                            <p className="text-xs text-slate-500">{formatDate(q.issue_date)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${QUOTE_STATUS_COLOR[q.status] ?? ""}`}>
                              {QUOTE_STATUS_LABEL[q.status] ?? q.status}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{formatEUR(Number(q.total_ht))}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent: "emerald" | "slate" | "blue" | "red";
}) {
  const accents: Record<typeof accent, string> = {
    emerald: "text-emerald-700",
    slate: "text-slate-900",
    blue: "text-blue-700",
    red: "text-red-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
    >
      {label}
      <span className="text-slate-400">→</span>
    </Link>
  );
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
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Démarrons par votre premier client</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Ajoutez un client pour pouvoir créer des devis et factures.
      </p>
      <Link
        href="/dashboard/clients/new"
        className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
      >
        Ajouter un client
      </Link>
    </div>
  );
}
