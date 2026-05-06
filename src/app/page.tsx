import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Le CRM simple pour micro-entrepreneurs
        </h1>
        <p className="text-lg text-gray-600">
          Clients, devis et factures. Sans prise de tête.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Créer mon compte
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
