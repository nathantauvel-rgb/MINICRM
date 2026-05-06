export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Bientôt disponible
        </span>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Cette section arrive très bientôt
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          On travaille dessus. En attendant, commencez par ajouter vos clients.
        </p>
      </div>
    </div>
  );
}
