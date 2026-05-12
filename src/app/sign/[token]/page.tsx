import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatEUR, formatDate } from "@/lib/format";
import Logo from "@/components/Logo";
import SignaturePad from "./signature-pad";

export default async function SignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("signing_token", token)
    .maybeSingle();

  if (!quote) notFound();

  // Already signed
  if (quote.signed_at) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Devis déjà signé</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ce devis a été signé le{" "}
            <strong>{formatDate(quote.signed_at)}</strong>
            {quote.signer_name && (
              <>
                {" "}par <strong>{quote.signer_name}</strong>
              </>
            )}
            .
          </p>
        </div>
      </div>
    );
  }

  const items = (
    (
      quote.quote_items as Array<{
        id: string;
        description: string;
        quantity: number;
        unit_price: number;
        position: number;
      }>
    ) ?? []
  )
    .slice()
    .sort((a, b) => a.position - b.position);

  const client = quote.clients as {
    name: string;
    company: string | null;
    email: string | null;
  } | null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo href="/" />
          <span className="text-sm text-slate-500 font-medium">{quote.number}</span>
        </div>

        {/* Quote card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Devis {quote.number}</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Émis le {formatDate(quote.issue_date)}
                {quote.valid_until && (
                  <> · Valide jusqu&apos;au {formatDate(quote.valid_until)}</>
                )}
              </p>
              {client && (
                <p className="mt-0.5 text-sm text-slate-500">
                  Pour : <span className="font-medium text-slate-700">{client.company || client.name}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{formatEUR(Number(quote.total_ht))}</p>
              <p className="text-xs text-slate-400">Total HT</p>
            </div>
          </div>

          {/* Items table */}
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Qté
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{it.description}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{it.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatEUR(Number(it.quantity) * Number(it.unit_price))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={2} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Total HT
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">
                    {formatEUR(Number(quote.total_ht))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {quote.notes && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Signature */}
        <SignaturePad quoteId={quote.id} token={token} />

        <p className="text-center text-xs text-slate-400 pb-6">
          Propulsé par MiniCRM · Signature électronique sécurisée
        </p>
      </div>
    </div>
  );
}
