"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { formatEUR } from "@/lib/format";

export type ClientOption = { id: string; name: string; company: string | null };
type Item = { description: string; quantity: number; unit_price: number };

type Props = {
  clients: ClientOption[];
  initial?: {
    client_id: string;
    issue_date: string;
    due_date: string;
    notes: string | null;
    items: Item[];
  };
  defaultPaymentDays?: number;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function InvoiceForm({ clients, initial, defaultPaymentDays = 30, action, submitLabel }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>(
    initial?.items.length ? initial.items : [{ description: "", quantity: 1, unit_price: 0 }],
  );

  const total = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("items_json", JSON.stringify(items));
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">
          Vous devez d&apos;abord ajouter au moins un client.
        </p>
        <Link
          href="/dashboard/clients/new"
          className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
        >
          Ajouter un client
        </Link>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Section title="Informations générales">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5 md:col-span-3">
            <label htmlFor="client_id" className="text-sm font-medium text-slate-700">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              id="client_id"
              name="client_id"
              required
              defaultValue={initial?.client_id ?? ""}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Choisir un client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company ? `${c.company} (${c.name})` : c.name}
                </option>
              ))}
            </select>
          </div>

          <DateField name="issue_date" label="Date d'émission" required defaultValue={initial?.issue_date ?? today()} />
          <DateField name="due_date" label="Date d'échéance" required defaultValue={initial?.due_date ?? inDays(defaultPaymentDays)} />
        </div>
      </Section>

      <Section title="Lignes de la facture">
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="grid gap-3 md:grid-cols-12 items-start">
              <input
                type="text"
                placeholder="Description de la prestation"
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                className="md:col-span-6 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Qté"
                value={it.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Prix unitaire"
                value={it.unit_price}
                onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="md:col-span-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">{formatEUR(it.quantity * it.unit_price)}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-700 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Ajouter une ligne
        </button>

        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
          <div className="text-right">
            <p className="text-sm text-slate-500">Total HT</p>
            <p className="text-2xl font-bold text-slate-900">{formatEUR(total)}</p>
          </div>
        </div>
      </Section>

      <Section title="Notes (optionnel)">
        <textarea
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          placeholder="Conditions particulières, informations complémentaires…"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </Section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
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
          href="/dashboard/invoices"
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
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DateField({ name, label, required, defaultValue }: { name: string; label: string; required?: boolean; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
}
