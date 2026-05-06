import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuoteForm from "../../quote-form";
import { updateQuoteAction } from "../../actions";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [quoteRes, clientsRes] = await Promise.all([
    supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clients").select("id, name, company").order("name"),
  ]);

  if (!quoteRes.data) notFound();

  const quote = quoteRes.data;
  const items = ((quote.quote_items as Array<{ description: string; quantity: number; unit_price: number; position: number }>) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      description: it.description,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));

  const action = updateQuoteAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/dashboard/quotes/${id}`} className="text-sm text-slate-600 hover:text-slate-900">
          ← Retour au devis
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Modifier {quote.number}</h1>
      </div>

      <QuoteForm
        clients={clientsRes.data ?? []}
        initial={{
          client_id: quote.client_id,
          issue_date: quote.issue_date,
          valid_until: quote.valid_until,
          notes: quote.notes,
          items,
        }}
        action={action}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
