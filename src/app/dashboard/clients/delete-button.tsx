"use client";

import { useTransition } from "react";
import { deleteClientAction } from "./actions";

export default function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(`Supprimer le client "${name}" ? Cette action est définitive.`)) return;
    startTransition(async () => {
      try {
        await deleteClientAction(id);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {pending ? "..." : "Supprimer"}
    </button>
  );
}
