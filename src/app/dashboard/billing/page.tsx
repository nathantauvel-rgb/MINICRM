import { createClient } from "@/lib/supabase/server";
import { hasAccess } from "@/lib/stripe";
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
} from "./actions";

const STATUS_LABEL: Record<string, string> = {
  trialing: "Essai gratuit",
  active: "Actif",
  past_due: "Paiement en retard",
  canceled: "Annulé",
  incomplete: "Incomplet",
  unpaid: "Impayé",
  paused: "En pause",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("user_settings")
    .select(
      "subscription_status, current_period_end, trial_ends_at, stripe_customer_id",
    )
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const status = settings?.subscription_status ?? "trialing";
  const access = hasAccess(status, settings?.trial_ends_at);
  const trialDaysLeft = settings?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(settings.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Abonnement</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gérez votre abonnement et vos informations de paiement.
        </p>
      </div>

      {params.success === "1" && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Abonnement activé. Bienvenue à bord 🎉
        </div>
      )}
      {params.canceled === "1" && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Paiement annulé. Vous pouvez réessayer à tout moment.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Statut</h3>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex h-2 w-2 rounded-full ${
                  access ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium text-slate-900">
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>
            {status === "trialing" && (
              <p className="mt-3 text-sm text-slate-600">
                {trialDaysLeft > 0
                  ? `Il vous reste ${trialDaysLeft} jour${trialDaysLeft > 1 ? "s" : ""} d'essai gratuit.`
                  : "Votre essai gratuit a expiré."}
              </p>
            )}
            {status === "active" && settings?.current_period_end && (
              <p className="mt-3 text-sm text-slate-600">
                Prochain renouvellement le{" "}
                {new Date(settings.current_period_end).toLocaleDateString("fr-FR")}.
              </p>
            )}
            {status === "past_due" && (
              <p className="mt-3 text-sm text-red-700">
                Le dernier paiement a échoué. Mettez à jour votre carte pour
                continuer.
              </p>
            )}
          </div>
        </div>
      </div>

      {(status === "trialing" || status === "canceled" || status === "incomplete") && (
        <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-lg shadow-emerald-100">
          <h3 className="text-base font-semibold text-slate-900">Plan Solo</h3>
          <p className="mt-1 text-sm text-slate-600">Tout ce qu&apos;il vous faut pour gérer votre activité.</p>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-slate-900">9</span>
            <span className="text-2xl font-semibold text-slate-900">€</span>
            <span className="text-sm text-slate-500">/mois HT</span>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            <Feature>Clients, devis et factures illimités</Feature>
            <Feature>Génération PDF conforme</Feature>
            <Feature>Relances email automatiques</Feature>
            <Feature>Support par email</Feature>
            <Feature>Sans engagement, résiliation en 1 clic</Feature>
          </ul>

          <form action={createCheckoutSessionAction}>
            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              S&apos;abonner pour 9€/mois
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-slate-500">
            Paiement sécurisé via Stripe · Annulation à tout moment
          </p>
        </div>
      )}

      {settings?.stripe_customer_id && status !== "trialing" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900">Gérer mon abonnement</h3>
          <p className="mt-1 text-sm text-slate-600">
            Modifier votre carte, télécharger vos factures Stripe, ou résilier.
          </p>
          <form action={createPortalSessionAction}>
            <button
              type="submit"
              className="mt-4 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Ouvrir le portail Stripe →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg className="mt-0.5 h-4 w-4 flex-none text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </li>
  );
}
