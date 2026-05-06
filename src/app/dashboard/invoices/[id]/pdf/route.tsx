import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { InvoicePDF, type InvoiceData } from "@/lib/pdf/InvoicePDF";

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
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, clients(*), invoice_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !invoice) return new Response("Not found", { status: 404 });

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .maybeSingle();

  const items = ((invoice.invoice_items as Array<{ description: string; quantity: number; unit_price: number; position: number }>) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      description: it.description,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));

  const client = invoice.clients as {
    name: string;
    company: string | null;
    email: string | null;
    address: string | null;
    siret: string | null;
  };

  const data: InvoiceData = {
    number: invoice.number,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    paid_at: invoice.paid_at,
    notes: invoice.notes,
    total_ht: Number(invoice.total_ht),
    client,
    items,
    settings: settings ?? null,
  };

  const buffer = await renderToBuffer(<InvoicePDF data={data} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
