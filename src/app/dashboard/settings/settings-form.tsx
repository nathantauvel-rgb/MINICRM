"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "./actions";

type Settings = {
  company_name: string | null;
  siret: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  iban: string | null;
  vat_exempt: boolean;
  vat_number: string | null;
  payment_terms_days: number;
};

export default function SettingsForm({ initial }: { initial: Settings | null }) {
  const [pending, startTransition] = useTransition();
  const [vatExempt, setVatExempt] = useState(initial?.vat_exempt ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateSettingsAction(formData);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Section title="Mon entreprise">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="company_name" label="Nom de l'entreprise" defaultValue={initial?.company_name ?? ""} placeholder="Jean Dupont SARL" />
          <Field name="siret" label="Numéro SIRET" defaultValue={initial?.siret ?? ""} placeholder="123 456 789 00012" />
        </div>
        <Field name="address" label="Adresse" defaultValue={initial?.address ?? ""} placeholder="12 rue de la Paix, 75001 Paris" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="email" label="Email pro" type="email" defaultValue={initial?.email ?? ""} placeholder="contact@exemple.fr" />
          <Field name="phone" label="Téléphone" defaultValue={initial?.phone ?? ""} placeholder="06 12 34 56 78" />
        </div>
      </Section>

      <Section title="TVA">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="vat_exempt"
            checked={vatExempt}
            onChange={(e) => setVatExempt(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900">
              Franchise en base de TVA (micro-entrepreneur)
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">
              La mention « TVA non applicable, art. 293 B du CGI » sera ajoutée à vos documents.
            </span>
          </span>
        </label>

        {!vatExempt && (
          <Field name="vat_number" label="Numéro TVA intracommunautaire" defaultValue={initial?.vat_number ?? ""} placeholder="FR12345678901" />
        )}
      </Section>

      <Section title="Paiement">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="iban" label="IBAN (apparaîtra sur les factures)" defaultValue={initial?.iban ?? ""} placeholder="FR76 1234 5678 9012 3456 7890 123" />
          <Field
            name="payment_terms_days"
            label="Délai de paiement (jours)"
            type="number"
            defaultValue={String(initial?.payment_terms_days ?? 30)}
          />
        </div>
      </Section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Paramètres enregistrés.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
}
