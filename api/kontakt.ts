// Vercel Serverless Function — Kontaktformular → E-Mail via Resend REST API
// Empfänger : michael_fleps@aol.com
// Absender  : onboarding@resend.dev  (kein Domain-DNS nötig)
// Reply-To  : E-Mail-Adresse aus dem Formular

const EMPFAENGER = "michael_fleps@aol.com";
const ABSENDER   = "Portfolio <onboarding@resend.dev>";
const RESEND_URL = "https://api.resend.com/emails";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}

function zeitstempel(): string {
  return new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function htmlEmail(
  name:      string,
  email:     string,
  telefon:   string | undefined,
  nachricht: string,
  zeit:      string,
): string {
  const telefonZeile = telefon
    ? `<tr>
         <td style="color:#94a3b8;padding:4px 20px 4px 0;white-space:nowrap;vertical-align:top;">Telefon</td>
         <td style="color:#e2e8f0;">${escapeHtml(telefon)}</td>
       </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0d0d18;">
  <div style="font-family:monospace;background:#09090f;color:#e2e8f0;padding:32px;
              border-radius:12px;max-width:560px;margin:24px auto;
              border:1px solid rgba(255,255,255,0.07);">
    <p style="color:#818cf8;font-size:11px;letter-spacing:0.12em;margin:0 0 24px;text-transform:uppercase;">
      Neue Kontaktanfrage &middot; michael-fleps.vercel.app
    </p>
    <table style="border-collapse:collapse;width:100%;font-size:13px;line-height:1.7;">
      <tr>
        <td style="color:#94a3b8;padding:4px 20px 4px 0;white-space:nowrap;vertical-align:top;">Name</td>
        <td style="color:#e2e8f0;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="color:#94a3b8;padding:4px 20px 4px 0;white-space:nowrap;vertical-align:top;">E-Mail</td>
        <td><a href="mailto:${escapeHtml(email)}" style="color:#22d3ee;text-decoration:none;">${escapeHtml(email)}</a></td>
      </tr>
      ${telefonZeile}
      <tr>
        <td style="color:#94a3b8;padding:4px 20px 4px 0;white-space:nowrap;vertical-align:top;">Zeitpunkt</td>
        <td style="color:#e2e8f0;">${escapeHtml(zeit)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:20px 0 8px;border-top:1px solid rgba(255,255,255,0.06);">
          <span style="color:#94a3b8;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Nachricht</span>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="color:#e2e8f0;white-space:pre-wrap;line-height:1.8;padding-bottom:24px;">${escapeHtml(nachricht)}</td>
      </tr>
    </table>
    <p style="margin:0;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);font-size:11px;color:#475569;">
      Antworten direkt an
      <a href="mailto:${escapeHtml(email)}" style="color:#818cf8;text-decoration:none;">${escapeHtml(email)}</a>
    </p>
  </div>
</body>
</html>`;
}

// Reine Node.js-Antwort — kein res.status().json() (Vercel-Helper nicht garantiert)
function jsonAntwort(res: any, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Access-Control-Allow-Origin",  "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== "POST") {
      return jsonAntwort(res, 405, { fehler: "Methode nicht erlaubt." });
    }

    // Body parsen — Vercel parsed JSON-Bodies automatisch; defensiv absichern
    let body: { name?: string; email?: string; telefon?: string; nachricht?: string } = {};
    if (typeof req.body === "string") {
      try { body = JSON.parse(req.body); } catch { /* ungültiger Body */ }
    } else if (req.body && typeof req.body === "object") {
      body = req.body as typeof body;
    }

    const { name, email, telefon, nachricht } = body;

    if (!name?.trim() || !email?.trim() || !nachricht?.trim()) {
      return jsonAntwort(res, 400, { fehler: "Pflichtfelder fehlen." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return jsonAntwort(res, 400, { fehler: "Ungültige E-Mail-Adresse." });
    }
    if (nachricht.trim().length < 10) {
      return jsonAntwort(res, 400, { fehler: "Nachricht ist zu kurz." });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[kontakt] RESEND_API_KEY fehlt — Vercel Project Settings prüfen.");
      return jsonAntwort(res, 500, { fehler: "E-Mail-Dienst nicht konfiguriert." });
    }

    const cleanName      = name.trim();
    const cleanEmail     = email.trim();
    const cleanTelefon   = telefon?.trim() || undefined;
    const cleanNachricht = nachricht.trim();
    const zeit           = zeitstempel();

    const resendAntwort = await fetch(RESEND_URL, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:     ABSENDER,
        to:       [EMPFAENGER],
        reply_to: cleanEmail,
        subject:  `Neue Kontaktanfrage von ${cleanName}`,
        html:     htmlEmail(cleanName, cleanEmail, cleanTelefon, cleanNachricht, zeit),
      }),
    });

    if (!resendAntwort.ok) {
      let details: unknown = "(kein Body)";
      try { details = await resendAntwort.json(); }
      catch { details = await resendAntwort.text().catch(() => "(kein Body)"); }
      console.error(`[kontakt] Resend abgelehnt — HTTP ${resendAntwort.status}`, JSON.stringify(details));
      return jsonAntwort(res, 502, { fehler: "E-Mail konnte nicht gesendet werden." });
    }

    const daten = await resendAntwort.json() as { id?: string };
    console.info(`[kontakt] ✓ Gesendet — Resend-ID: ${daten.id ?? "?"} → ${EMPFAENGER}`);
    return jsonAntwort(res, 200, { erfolg: true });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[kontakt] Fatal:`, msg);
    // Reine Node.js-Methoden für Fehlerantwort — niemals res.json() hier
    try {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ fehler: "Interner Serverfehler. Bitte versuche es erneut." }));
    } catch { /* Headers schon gesendet */ }
  }
}
