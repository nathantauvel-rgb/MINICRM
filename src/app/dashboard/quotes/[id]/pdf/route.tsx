import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { QuotePDF, type QuoteData } from "@/lib/pdf/QuotePDF";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*, clients(*), quote_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !quote) {
    return new Response("Not found", { status: 404 });
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .maybeSingle();

  const items = ((quote.quote_items as Array<{ description: string; quantity: number; unit_price: number; position: number }>) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      description: it.description,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));

  const client = quote.clients as {
    name: string;
    company: string | null;
    email: string | null;
    address: string | null;
    siret: string | null;
  };

  const data: QuoteData = {
    number: quote.number,
    issue_date: quote.issue_date,
    valid_until: quote.valid_until,
    notes: quote.notes,
    total_ht: Number(quote.total_ht),
    client,
    items,
    settings: settings ?? null,
  };

  const buffer = await renderToBuffer(<QuotePDF data={data} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.number}.pdf"`,
    },
  });
}
