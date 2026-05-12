"use client";

import { useRef, useState } from "react";
import { signQuoteAction } from "./sign-actions";

type Props = {
  quoteId: string;
  token: string;
};

export default function SignaturePad({ quoteId, token }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    // Scale from CSS pixels to canvas internal pixels
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function initCtx() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = initCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setIsEmpty(false);
  }

  function endDraw() {
    setIsDrawing(false);
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }

  async function handleSign() {
    if (!name.trim()) {
      setErrorMsg("Veuillez saisir votre nom complet.");
      return;
    }
    if (isEmpty) {
      setErrorMsg("Veuillez signer dans le cadre ci-dessus.");
      return;
    }
    setErrorMsg(null);
    setStatus("loading");

    const signatureData = canvasRef.current!.toDataURL("image/png");

    try {
      await signQuoteAction({ quoteId, token, signerName: name.trim(), signatureData });
      setStatus("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Une erreur est survenue.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-emerald-900">Devis signé ✅</h2>
        <p className="mt-2 text-sm text-emerald-700">
          Merci <strong>{name}</strong>. Votre signature a bien été enregistrée et horodatée.
        </p>
        <p className="mt-1 text-xs text-emerald-600">
          Vous pouvez fermer cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
      <h2 className="text-base font-semibold text-slate-900">Signature électronique</h2>

      {/* Name field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Votre nom complet <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jean Dupont"
          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Canvas */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-700">
            Votre signature <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            Effacer
          </button>
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={560}
            height={160}
            className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 touch-none cursor-crosshair"
            style={{ height: "160px" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          {isEmpty && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              Signez ici avec votre souris ou votre doigt
            </p>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{errorMsg}</p>
      )}

      <button
        type="button"
        onClick={handleSign}
        disabled={status === "loading"}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
      >
        {status === "loading" ? "Enregistrement…" : "Signer le devis"}
      </button>

      <p className="text-center text-xs text-slate-400">
        En signant, vous acceptez les termes du devis. La signature est horodatée.
      </p>
    </div>
  );
}
