type ReminderInput = {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  issueDate: string;
  dueDate: string;
  daysLate: number;
  companyName: string;
  iban: string | null;
  reminderCount: number;
};

export function buildReminderEmail(input: ReminderInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { clientName, invoiceNumber, amount, issueDate, dueDate, daysLate, companyName, iban, reminderCount } = input;

  const isOverdue = daysLate > 0;
  const isFirstReminder = reminderCount === 0;

  const subject = isOverdue
    ? `Relance — Facture ${invoiceNumber} en retard de ${daysLate} jour${daysLate > 1 ? "s" : ""}`
    : isFirstReminder
      ? `Rappel — Facture ${invoiceNumber}`
      : `Nouvelle relance — Facture ${invoiceNumber}`;

  const intro = isOverdue
    ? `Sauf erreur de notre part, nous n'avons pas reçu le règlement de la facture <strong>${invoiceNumber}</strong>, échue depuis le ${dueDate} (${daysLate} jour${daysLate > 1 ? "s" : ""} de retard).`
    : `Nous nous permettons de vous rappeler que la facture <strong>${invoiceNumber}</strong> arrive à échéance le <strong>${dueDate}</strong>.`;

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;border-bottom:1px solid #e2e8f0;">
          <span style="display:inline-block;font-weight:700;color:#059669;font-size:16px;">${companyName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          <h1 style="margin:0 0 16px 0;font-size:20px;color:#0f172a;">Bonjour ${clientName},</h1>
          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">${intro}</p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;background:#f8fafc;border-radius:8px;padding:0;">
            <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;">Facture</td><td style="padding:12px 16px;font-size:13px;color:#0f172a;text-align:right;font-weight:600;">${invoiceNumber}</td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Émise le</td><td style="padding:12px 16px;font-size:13px;color:#0f172a;text-align:right;border-top:1px solid #e2e8f0;">${issueDate}</td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Échéance</td><td style="padding:12px 16px;font-size:13px;color:${isOverdue ? "#dc2626" : "#0f172a"};text-align:right;font-weight:${isOverdue ? "700" : "400"};border-top:1px solid #e2e8f0;">${dueDate}</td></tr>
            <tr><td style="padding:12px 16px;font-size:14px;color:#0f172a;font-weight:700;border-top:1px solid #e2e8f0;background:#ffffff;">Montant</td><td style="padding:12px 16px;font-size:16px;color:#059669;text-align:right;font-weight:700;border-top:1px solid #e2e8f0;background:#ffffff;">${amount}</td></tr>
          </table>

          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
            La facture est jointe à cet email au format PDF.
            ${iban ? `<br/>Pour régler par virement : <strong>${iban}</strong>` : ""}
          </p>

          <p style="margin:24px 0 0 0;font-size:14px;line-height:1.6;color:#334155;">
            Si le règlement a été effectué récemment, merci d'ignorer cet email.<br/>
            Pour toute question, n'hésitez pas à répondre directement à ce message.
          </p>

          <p style="margin:32px 0 0 0;font-size:14px;color:#0f172a;">
            Cordialement,<br/>
            <strong>${companyName}</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;text-align:center;font-size:11px;color:#94a3b8;">
          Email envoyé via MiniCRM
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Bonjour ${clientName},

${isOverdue
    ? `Sauf erreur de notre part, nous n'avons pas reçu le règlement de la facture ${invoiceNumber}, échue depuis le ${dueDate} (${daysLate} jour${daysLate > 1 ? "s" : ""} de retard).`
    : `Nous nous permettons de vous rappeler que la facture ${invoiceNumber} arrive à échéance le ${dueDate}.`}

Facture : ${invoiceNumber}
Émise le : ${issueDate}
Échéance : ${dueDate}
Montant : ${amount}

La facture est jointe à cet email au format PDF.${iban ? `\nPour régler par virement : ${iban}` : ""}

Si le règlement a été effectué récemment, merci d'ignorer cet email.

Cordialement,
${companyName}`;

  return { subject, html, text };
}
