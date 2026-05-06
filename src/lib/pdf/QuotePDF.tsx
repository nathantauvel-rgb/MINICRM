import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

type QuoteData = {
  number: string;
  issue_date: string;
  valid_until: string | null;
  notes: string | null;
  total_ht: number;
  client: {
    name: string;
    company: string | null;
    email: string | null;
    address: string | null;
    siret: string | null;
  };
  items: QuoteItem[];
  settings: {
    company_name: string | null;
    siret: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
    iban: string | null;
    vat_exempt: boolean;
    vat_number: string | null;
    payment_terms_days: number;
  } | null;
};

const formatEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#0f172a", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  brand: { fontSize: 18, fontWeight: 700, color: "#059669" },
  meta: { textAlign: "right" },
  metaTitle: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  metaNumber: { fontSize: 12, color: "#475569" },
  twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  block: { width: "48%" },
  label: { fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  text: { fontSize: 10, color: "#0f172a", marginBottom: 2 },
  bold: { fontWeight: 700 },
  table: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cellDesc: { flex: 4 },
  cellQty: { flex: 1, textAlign: "right" },
  cellPrice: { flex: 1.5, textAlign: "right" },
  cellTotal: { flex: 1.5, textAlign: "right" },
  th: { fontSize: 8, color: "#64748b", textTransform: "uppercase", fontWeight: 700 },
  totalsBox: { marginTop: 16, alignSelf: "flex-end", width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { fontSize: 10, color: "#475569" },
  totalValue: { fontSize: 10, fontWeight: 700 },
  totalGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#0f172a",
    marginTop: 4,
  },
  totalGrandLabel: { fontSize: 12, fontWeight: 700 },
  totalGrandValue: { fontSize: 14, fontWeight: 700, color: "#059669" },
  notes: { marginTop: 32, padding: 12, backgroundColor: "#f8fafc", borderRadius: 4 },
  notesTitle: { fontSize: 9, fontWeight: 700, color: "#475569", marginBottom: 4 },
  legal: { marginTop: 24, fontSize: 8, color: "#64748b" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
});

export function QuotePDF({ data }: { data: QuoteData }) {
  const { settings, client, items, number, issue_date, valid_until, notes, total_ht } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              {settings?.company_name || "Mon entreprise"}
            </Text>
            {settings?.address && <Text style={styles.text}>{settings.address}</Text>}
            {settings?.email && <Text style={styles.text}>{settings.email}</Text>}
            {settings?.phone && <Text style={styles.text}>{settings.phone}</Text>}
            {settings?.siret && <Text style={styles.text}>SIRET : {settings.siret}</Text>}
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaTitle}>DEVIS</Text>
            <Text style={styles.metaNumber}>{number}</Text>
            <Text style={[styles.text, { marginTop: 8 }]}>
              Émis le : {formatDate(issue_date)}
            </Text>
            {valid_until && (
              <Text style={styles.text}>Valide jusqu&apos;au : {formatDate(valid_until)}</Text>
            )}
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.block}>
            <Text style={styles.label}>Émetteur</Text>
            <Text style={[styles.text, styles.bold]}>{settings?.company_name || "—"}</Text>
            {settings?.address && <Text style={styles.text}>{settings.address}</Text>}
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>Client</Text>
            <Text style={[styles.text, styles.bold]}>
              {client.company || client.name}
            </Text>
            {client.company && <Text style={styles.text}>{client.name}</Text>}
            {client.address && <Text style={styles.text}>{client.address}</Text>}
            {client.email && <Text style={styles.text}>{client.email}</Text>}
            {client.siret && <Text style={styles.text}>SIRET : {client.siret}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cellDesc, styles.th]}>Description</Text>
            <Text style={[styles.cellQty, styles.th]}>Qté</Text>
            <Text style={[styles.cellPrice, styles.th]}>PU HT</Text>
            <Text style={[styles.cellTotal, styles.th]}>Total HT</Text>
          </View>
          {items.map((it, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cellDesc}>{it.description}</Text>
              <Text style={styles.cellQty}>{it.quantity}</Text>
              <Text style={styles.cellPrice}>{formatEUR(it.unit_price)}</Text>
              <Text style={styles.cellTotal}>{formatEUR(it.quantity * it.unit_price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>{formatEUR(total_ht)}</Text>
          </View>
          {settings?.vat_exempt && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA</Text>
              <Text style={styles.totalValue}>Non applicable</Text>
            </View>
          )}
          <View style={styles.totalGrand}>
            <Text style={styles.totalGrandLabel}>Total à payer</Text>
            <Text style={styles.totalGrandValue}>{formatEUR(total_ht)}</Text>
          </View>
        </View>

        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.text}>{notes}</Text>
          </View>
        )}

        <View style={styles.legal}>
          {settings?.vat_exempt && (
            <Text>TVA non applicable, art. 293 B du CGI.</Text>
          )}
          {!settings?.vat_exempt && settings?.vat_number && (
            <Text>N° TVA intracommunautaire : {settings.vat_number}</Text>
          )}
          {settings?.payment_terms_days && (
            <Text>
              Conditions de paiement : {settings.payment_terms_days} jours à
              compter de la date de facture.
            </Text>
          )}
          {settings?.iban && <Text>IBAN : {settings.iban}</Text>}
        </View>

        <Text style={styles.footer}>
          Devis {number} · {settings?.company_name || ""}
        </Text>
      </Page>
    </Document>
  );
}

export type { QuoteData };
