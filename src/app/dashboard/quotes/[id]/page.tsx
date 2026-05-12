import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatEUR, formatDate, QUOTE_STATUS_LABEL, QUOTE_STATUS_COLOR } from "@/lib/format";
import QuoteActions from "./quote-actions";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!quote) notFound();

  const items = ((quote.quote_items as Array<{ id: string; description: string; quantity: number; unit_price: number; position: number }>) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  const client = quote.clients as { name: string; company: string | null; email: string | null } | null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/quotes" className="text-sm text-slate-600 hover:text-slate-900">
            ← Retour aux devis
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{quote.number}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${QUOTE_STATUS_COLOR[quote.status] ?? ""}`}>
              {QUOTE_STATUS_LABEL[quote.status] ?? quote.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Émis le {formatDate(quote.issue_date)}
            {quote.valid_until && <> · Valide jusqu&apos;au {formatDate(quote.valid_until)}</>}
          </p>
        </div>

        <QuoteActions
          id={id}
          status={quote.status}
          signingToken={quote.signing_token ?? null}
          signedAt={quote.signed_at ?? null}
          signerName={quote.signer_name ?? null}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Client</h3>
          <p className="mt-2 text-base font-medium text-slate-900">
            {client?.company || client?.name || "—"}
          </p>
          {client?.company && client?.name && (
            <p className="text-sm text-slate-600">{client.name}</p>
          )}
          {client?.email && <p className="mt-1 text-sm text-slate-600">{client.email}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatEUR(Number(quote.total_ht))}
          </p>
          <p className="text-xs text-slate-500">HT</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Qté</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">PU HT</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4 text-sm text-slate-700">{it.description}</td>
                <td className="px-5 py-4 text-right text-sm text-slate-700">{it.quantity}</td>
                <td className="px-5 py-4 text-right text-sm text-slate-700">{formatEUR(Number(it.unit_price))}</td>
                <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                  {formatEUR(Number(it.quantity) * Number(it.unit_price))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quote.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{quote.notes}</p>
        </div>
      )}
    </div>
  );
}
