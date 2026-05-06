"use client";

import Link from "next/link";
import { useTransition, useState } from "react";

type Client = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  siret?: string | null;
  notes?: string | null;
};

type Props = {
  initial?: Client;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export default function ClientForm({ initial, action, submitLabel }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inattendue");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Section title="Identité">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="name" label="Nom du client" required defaultValue={initial?.name ?? ""} placeholder="Jean Dupont" />
          <Field name="company" label="Société" defaultValue={initial?.company ?? ""} placeholder="Dupont SARL" />
        </div>
      </Section>

      <Section title="Coordonnées">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="email" label="Email" type="email" defaultValue={initial?.email ?? ""} placeholder="jean@exemple.fr" />
          <Field name="phone" label="Téléphone" defaultValue={initial?.phone ?? ""} placeholder="06 12 34 56 78" />
        </div>
        <Field name="address" label="Adresse" defaultValue={initial?.address ?? ""} placeholder="12 rue de la Paix, 75001 Paris" />
      </Section>

      <Section title="Informations légales">
        <Field name="siret" label="SIRET (optionnel)" defaultValue={initial?.siret ?? ""} placeholder="123 456 789 00012" />
      </Section>

      <Section title="Notes">
        <textarea
          name="notes"
          rows={4}
          defaultValue={initial?.notes ?? ""}
          placeholder="Informations utiles sur ce client…"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </Section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : submitLabel}
        </button>
        <Link
          href="/dashboard/clients"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Annuler
        </Link>
      </div>
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
  required = false,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
}
