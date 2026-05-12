"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, RESEND_FROM } from "@/lib/email/resend";
import { getAppUrl } from "@/lib/stripe";

export async function signQuoteAction({
  quoteId,
  token,
  signerName,
  signatureData,
}: {
  quoteId: string;
  token: string;
  signerName: string;
  signatureData: string;
}) {
  const supabase = createAdminClient();

  // Verify the quote exists and token matches
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, number, signing_token, signed_at, user_id")
    .eq("id", quoteId)
    .eq("signing_token", token)
    .maybeSingle();

  if (!quote) throw new Error("Devis introuvable.");
  if (quote.signed_at) throw new Error("Ce devis est déjà signé.");

  // Save the signature
  const { error } = await supabase
    .from("quotes")
    .update({
      signed_at: new Date().toISOString(),
      signature_data: signatureData,
      signer_name: signerName,
      status: "accepted",
    })
    .eq("id", quoteId);

  if (error) throw new Error(error.message);

  // Notify the user by email (best-effort)
  try {
    const { data: userData } = await supabase.auth.admin.getUserById(
      quote.user_id,
    );
    const userEmail = userData?.user?.email;
    if (userEmail) {
      const appUrl = getAppUrl();
      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await getResend().emails.send({
        from: RESEND_FROM,
        to: userEmail,
        subject: `✅ Devis ${quote.number} signé par ${signerName}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
            <h2 style="color:#059669">Devis signé ✅</h2>
            <p>Le devis <strong>${quote.number}</strong> vient d'être signé électroniquement.</p>
            <table style="margin:16px 0;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Signataire</td><td><strong>${signerName}</strong></td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#64748b">Date</td><td>${dateStr} à ${timeStr}</td></tr>
            </table>
            <a href="${appUrl}/dashboard/quotes/${quoteId}"
               style="display:inline-block;background:#059669;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px">
              Voir le devis signé →
            </a>
            <p style="margin-top:24px;font-size:12px;color:#94a3b8">
              MiniCRM · Signature électronique horodatée
            </p>
          </div>
        `,
      });
    }
  } catch {
    // Email failure must not break the signing flow
  }
}
