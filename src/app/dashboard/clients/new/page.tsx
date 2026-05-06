import Link from "next/link";
import ClientForm from "../client-form";
import { createClientAction } from "../actions";

export default function NewClientPage() {
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
          Nouveau client
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Renseignez les informations de votre nouveau client.
        </p>
      </div>

      <ClientForm action={createClientAction} submitLabel="Créer le client" />
    </div>
  );
}
