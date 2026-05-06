import { Resend } from "resend";

let _client: Resend | null = null;

export function getResend(): Resend {
  if (!_client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY est manquant. Configurez-le dans Vercel ou .env.local.",
      );
    }
    _client = new Resend(apiKey);
  }
  return _client;
}

// Sender — uses the default Resend testing domain unless RESEND_FROM is set.
// To send to real clients, verify your domain on resend.com and set RESEND_FROM.
export const RESEND_FROM =
  process.env.RESEND_FROM || "MiniCRM <onboarding@resend.dev>";
