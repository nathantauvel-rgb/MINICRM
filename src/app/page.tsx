import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Trust />
        <Pain />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-emerald-50 via-white to-white" />
      <div className="absolute -top-24 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Conçu pour les micro-entrepreneurs français
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Vos clients, devis et factures.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Sans prise de tête.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            MiniCRM remplace votre Excel, vos Word de devis et vos relances
            oubliées. En 2 minutes, vous envoyez votre première facture
            conforme.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Démarrer gratuitement
            </Link>
            <a
              href="#how"
              className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Voir comment ça marche
            </a>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Sans carte bancaire · 14 jours d&apos;essai · Annulation en 1 clic
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <MockApp />
        </div>
      </div>
    </section>
  );
}

function MockApp() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-emerald-100/50 ring-1 ring-slate-900/5">
      <div className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-slate-400">app.minicrm.fr/dashboard</span>
      </div>
      <div className="grid grid-cols-12 min-h-[420px]">
        <div className="col-span-3 border-r border-slate-200 bg-slate-50 p-4 hidden sm:block">
          <div className="space-y-1 text-sm">
            {["Tableau de bord", "Clients", "Devis", "Factures", "Relances"].map((item, i) => (
              <div
                key={item}
                className={`rounded-md px-3 py-2 ${
                  i === 0 ? "bg-emerald-100 text-emerald-700 font-medium" : "text-slate-600"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 sm:col-span-9 p-6">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Chiffre d'affaires" value="4 320 €" trend="+12%" />
            <Stat label="Factures en attente" value="2 100 €" trend="3 clients" />
            <Stat label="Devis envoyés" value="7" trend="+2 cette sem." />
          </div>
          <div className="mt-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-medium">Dernières factures</span>
              <span className="text-xs text-emerald-600">Voir tout →</span>
            </div>
            {[
              { client: "Boulangerie Martin", amount: "850 €", status: "Payée", color: "emerald" },
              { client: "Café du Coin", amount: "1 200 €", status: "En attente", color: "amber" },
              { client: "Studio Léa", amount: "640 €", status: "En retard", color: "red" },
            ].map((row) => (
              <div key={row.client} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0">
                <span className="text-sm text-slate-700">{row.client}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{row.amount}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.color === "emerald"
                        ? "bg-emerald-50 text-emerald-700"
                        : row.color === "amber"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-emerald-600">{trend}</p>
    </div>
  );
}

function Trust() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/50 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-500">
          Conforme aux exigences légales françaises
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-600">
          <Badge text="Mentions légales factures" />
          <Badge text="Numérotation continue" />
          <Badge text="Archivage 10 ans" />
          <Badge text="RGPD" />
          <Badge text="URSSAF compatible" />
        </div>
      </div>
    </section>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
      {text}
    </span>
  );
}

function Pain() {
  const pains = [
    {
      emoji: "😩",
      title: "Excel qui devient un cauchemar",
      desc: "Une feuille par client, des formules cassées, et impossible de retrouver une facture envoyée il y a 3 mois.",
    },
    {
      emoji: "📅",
      title: "Relances oubliées = trésorerie à sec",
      desc: "Vous envoyez la facture, vous oubliez. Le client paie 60 jours plus tard. Ou jamais.",
    },
    {
      emoji: "💸",
      title: "Outils trop chers ou trop complexes",
      desc: "Hubspot c'est 50€/mois et 200 fonctions inutiles. Vous voulez juste facturer.",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Vous vous reconnaissez ?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            La gestion administrative ne doit pas vous voler votre vendredi soir.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pains.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="text-3xl">{p.emoji}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "👥",
      title: "Fiches clients claires",
      desc: "Toutes vos infos clients, l'historique de vos échanges et de vos factures, en un seul endroit.",
    },
    {
      icon: "📄",
      title: "Devis pro en 1 minute",
      desc: "Templates pré-remplis, génération PDF instantanée, envoi par email ou WhatsApp.",
    },
    {
      icon: "🧾",
      title: "Factures conformes",
      desc: "Mentions légales obligatoires, numérotation automatique, exonération TVA gérée.",
    },
    {
      icon: "🔔",
      title: "Relances automatiques",
      desc: "Le client paie en retard ? L'email part tout seul, dans votre ton, au bon moment.",
    },
    {
      icon: "📊",
      title: "Suivi de chiffre d'affaires",
      desc: "Sachez en temps réel combien vous avez facturé, encaissé, et qui vous doit quoi.",
    },
    {
      icon: "📱",
      title: "Mobile-first",
      desc: "Créez une facture depuis votre téléphone, entre deux rendez-vous, en moins de 2 min.",
    },
  ];

  return (
    <section id="features" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Fonctionnalités
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tout l&apos;essentiel. Rien de plus.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Pas de fonctionnalités gadget. Juste ce qu&apos;il faut pour gérer
            sereinement votre activité.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-xl">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Créez votre compte",
      desc: "30 secondes. Pas de carte bancaire. Vous êtes opérationnel immédiatement.",
    },
    {
      n: "02",
      title: "Ajoutez vos clients",
      desc: "Importez en masse depuis un fichier ou ajoutez-les un par un. À vous de voir.",
    },
    {
      n: "03",
      title: "Facturez en 1 clic",
      desc: "Choisissez un client, un montant, une description. Le PDF part par email automatiquement.",
    },
  ];

  return (
    <section id="how" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Comment ça marche
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Démarrez en moins de 5 minutes
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-5xl font-bold text-emerald-100">{s.n}</div>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const features = [
    "Clients illimités",
    "Devis et factures illimités",
    "Génération PDF",
    "Relances automatiques",
    "Conformité légale française",
    "Export comptable",
    "Support par email",
  ];

  return (
    <section id="pricing" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Tarifs
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Un seul prix. Tout inclus.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Pas de palier, pas de surprise. Vous payez si vous l&apos;utilisez.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <div className="relative rounded-2xl border-2 border-emerald-600 bg-white p-8 shadow-xl shadow-emerald-100">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
              Le plus populaire
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Solo</h3>
            <p className="mt-1 text-sm text-slate-600">Pour les micro-entrepreneurs et freelances.</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight text-slate-900">9</span>
              <span className="text-2xl font-semibold text-slate-900">€</span>
              <span className="text-sm text-slate-500">/mois</span>
            </div>
            <p className="text-xs text-slate-500">HT · Sans engagement</p>

            <Link
              href="/signup"
              className="mt-6 block w-full rounded-md bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Démarrer 14 jours gratuits
            </Link>

            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="mt-0.5 h-5 w-5 flex-none text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "C'est conforme à la législation française ?",
      a: "Oui. Toutes les mentions légales obligatoires sont automatiquement ajoutées : numéro SIRET, mention de la franchise en base de TVA si applicable, numérotation continue, conditions de paiement.",
    },
    {
      q: "Je peux exporter mes données ?",
      a: "Oui, à tout moment et gratuitement. Vos données vous appartiennent. Export CSV, PDF, ou récupération directe via API.",
    },
    {
      q: "Et si j'ai déjà un autre outil ?",
      a: "Vous pouvez importer vos clients depuis un fichier CSV en quelques clics. Pour les anciennes factures, on les importe pour vous gratuitement.",
    },
    {
      q: "Comment résilier ?",
      a: "Un bouton dans vos paramètres. Pas d'appel téléphonique, pas de mail à envoyer. Vos données restent accessibles 90 jours pour export.",
    },
    {
      q: "Vous prenez la TVA en charge ?",
      a: "Oui. Pour les micro-entrepreneurs en franchise, la mention légale est ajoutée automatiquement. Pour ceux assujettis, vous configurez votre taux et tout est calculé.",
    },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Questions fréquentes
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tout ce que vous voulez savoir
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {items.map((it) => (
            <details
              key={it.q}
              className="group rounded-lg border border-slate-200 bg-white p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between text-left text-base font-medium text-slate-900">
                {it.q}
                <svg
                  className="h-5 w-5 flex-none text-slate-400 transition group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-16 text-center shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,white,transparent_70%)] opacity-10" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Prêt à reprendre le contrôle de votre admin ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-50">
              14 jours gratuits. Sans carte bancaire. Vous repartez avec vos
              données quoi qu&apos;il arrive.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
              >
                Démarrer gratuitement
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-emerald-700/40 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-emerald-700/60 transition"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
