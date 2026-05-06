import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientForm from "../client-form";
import { updateClientAction } from "../actions";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!client) notFound();

  const action = updateClientAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/clients"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Retour aux clients
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {client.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Modifiez les informations de ce client.
        </p>
      </div>

      <ClientForm initial={client} action={action} submitLabel="Enregistrer" />
    </div>
  );
}
