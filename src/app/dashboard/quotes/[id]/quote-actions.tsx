"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useTransition } from "react";
import { deleteQuoteAction, updateQuoteStatusAction } from "../actions";
import { convertQuoteToInvoiceAction } from "../../invoices/actions";

const STATUSES: { value: "draft" | "sent" | "accepted" | "refused"; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyé" },
  { value: "accepted", label: "Accepté" },
  { value: "refused", label: "Refusé" },
];

type Props = {
  id: string;
  status: string;
  signingToken: string | null;
  signedAt: string | null;
  signerName: string | null;
};

export default function QuoteActions({ id, status, signingToken, signedAt, signerName }: Props) {
  const [pending, startTransition] = useTransition();
  const [statusOpen, setStatusOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setStatusOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function changeStatus(s: "draft" | "sent" | "accepted" | "refused") {
    setStatusOpen(false);
    startTransition(async () => {
      try {
        await updateQuoteStatusAction(id, s);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  function onDelete() {
    if (!confirm("Supprimer ce devis définitivement ?")) return;
    startTransition(async () => {
      try {
        await deleteQuoteAction(id);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  function onConvert() {
    if (!confirm("Créer une facture à partir de ce devis ?")) return;
    startTransition(async () => {
      try {
        await convertQuoteToInvoiceAction(id);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  async function copySigningLink() {
    if (!signingToken) return;
    // Build the URL client-side using window.location so it works on any domain
    const base = typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
    const url = `${base}/sign/${signingToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt("Copiez ce lien et envoyez-le à votre client :", url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`/dashboard/quotes/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 011.414-1.414L9 8.586V3a1 1 0 112 0v5.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 0110 12zM5 14a1 1 0 011 1v1h8v-1a1 1 0 112 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        PDF
      </a>

      {/* Signing link button */}
      {signedAt ? (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Signé{signerName ? ` par ${signerName}` : ""}
        </span>
      ) : signingToken ? (
        <button
          type="button"
          onClick={copySigningLink}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          title="Copier le lien de signature"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {copied ? "Lien copié ✓" : "Lien de signature"}
        </button>
      ) : null}

      <div className="relative" ref={ref}>
        <button
          onClick={() => setStatusOpen((v) => !v)}
          disabled={pending}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
        >
          Statut ▾
        </button>
        {statusOpen && (
          <div className="absolute right-0 mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => changeStatus(s.value)}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                  s.value === status ? "font-semibold text-emerald-700" : "text-slate-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onConvert}
        disabled={pending}
        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-60"
      >
        Convertir en facture
      </button>

      <Link
        href={`/dashboard/quotes/${id}/edit`}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
      >
        Modifier
      </Link>

      <button
        onClick={onDelete}
        disabled={pending}
        className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-60"
      >
        Supprimer
      </button>
    </div>
  );
}
