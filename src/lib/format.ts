export function formatEUR(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export const QUOTE_STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  refused: "Refusé",
};

export const QUOTE_STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-50 text-blue-700",
  accepted: "bg-emerald-50 text-emerald-700",
  refused: "bg-red-50 text-red-700",
};

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  cancelled: "Annulée",
  overdue: "En retard",
};

export const INVOICE_STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
  overdue: "bg-red-50 text-red-700",
};

export function invoiceDisplayStatus(
  status: string,
  dueDate: string,
): string {
  if (status === "sent" && new Date(dueDate) < new Date()) {
    return "overdue";
  }
  return status;
}
