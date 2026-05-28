// Cloudflare Pages Function — Kontaktformular → Resend
// Senior-hardened port from former Vercel Serverless (api/kontakt.ts).
//
// Web-Standard Request/Response, env-binding via context.
// Hardening: strict CORS allowlist, honeypot, body-size cap, length-limits,
// strict email regex, 8s Resend-timeout, crypto.randomUUID() trace-id.

interface Env {
    RESEND_API_KEY: string;
    ALLOWED_ORIGINS?: string;
}

interface KontaktBody {
    name?: string;
    email?: string;
    telefon?: string;
    nachricht?: string;
    website?: string;
}

const EMPFAENGER = "michael_fleps@aol.com";
const ABSENDER = "Portfolio <onboarding@resend.dev>";
const RESEND_URL = "https://api.resend.com/emails";
const RESEND_TIMEOUT_MS = 8_000;

const MAX_BODY_BYTES = 10_240;
const NAME_MIN = 1;
const NAME_MAX = 100;
const TEL_MAX = 40;
const EMAIL_MAX = 254;
const NACHRICHT_MIN = 10;
const NACHRICHT_MAX = 5_000;

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;

const DEFAULT_ALLOWED_ORIGINS = [
    "https://www.f3-data-solutions.com",
];

function pickAllowedOrigin(reqOrigin: string | null, env: Env): string {
    const fromEnv = (env.ALLOWED_ORIGINS ?? "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    const allow = fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_ORIGINS;

    if (reqOrigin && allow.includes(reqOrigin)) return reqOrigin;
    if (reqOrigin && allow.some(o => o === "*.pages.dev") && reqOrigin.endsWith(".pages.dev")) return reqOrigin;
    return allow[0];
}

function corsHeaders(reqOrigin: string | null, env: Env): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": pickAllowedOrigin(reqOrigin, env),
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    };
}

function jsonAntwort(
    status: number,
    payload: unknown,
    extraHeaders: Record<string, string> = {},
): Response {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            ...extraHeaders,
        },
    });
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function zeitstempel(): string {
    return new Date().toLocaleString("de-DE", {
        timeZone: "Europe/Berlin",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function htmlEmail(
    name: string,
    email: string,
    telefon: string | undefined,
    nachricht: string,
    zeit: string,
    traceId: string,
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
      Neue Kontaktanfrage &middot; www.f3-data-solutions.com
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
      &middot; Trace ${escapeHtml(traceId)}
    </p>
  </div>
</body>
</html>`;
}

async function readJsonWithLimit(request: Request, limit: number): Promise<KontaktBody> {
    const cl = request.headers.get("content-length");
    if (cl && Number(cl) > limit) {
        throw new Error("body_too_large");
    }
    const text = await request.text();
    if (text.length > limit) {
        throw new Error("body_too_large");
    }
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as KontaktBody;
        }
        throw new Error("not_object");
    } catch {
        throw new Error("invalid_json");
    }
}

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(request.headers.get("Origin"), env),
    });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    const reqOrigin = request.headers.get("Origin");
    const cors = corsHeaders(reqOrigin, env);
    const traceId = crypto.randomUUID();

    try {
        // 1) Body parsen + size-limit
        let body: KontaktBody;
        try {
            body = await readJsonWithLimit(request, MAX_BODY_BYTES);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "parse";
            const status = msg === "body_too_large" ? 413 : 400;
            return jsonAntwort(status, { fehler: "Ungültige Anfrage." }, cors);
        }

        // 2) Honeypot — gefüllt = bot, silent 200 (kein hint für Angreifer)
        if (typeof body.website === "string" && body.website.trim().length > 0) {
            console.info(`[kontakt] honeypot triggered trace=${traceId}`);
            return jsonAntwort(200, { erfolg: true }, cors);
        }

        // 3) Pflicht-Felder
        const name = (body.name ?? "").trim();
        const email = (body.email ?? "").trim();
        const nachricht = (body.nachricht ?? "").trim();
        const telefon = (body.telefon ?? "").trim() || undefined;

        if (!name || !email || !nachricht) {
            return jsonAntwort(400, { fehler: "Pflichtfelder fehlen." }, cors);
        }

        // 4) Längen-Limits
        if (name.length < NAME_MIN || name.length > NAME_MAX) {
            return jsonAntwort(400, { fehler: "Name hat ungültige Länge." }, cors);
        }
        if (email.length > EMAIL_MAX || !EMAIL_REGEX.test(email)) {
            return jsonAntwort(400, { fehler: "Ungültige E-Mail-Adresse." }, cors);
        }
        if (telefon && telefon.length > TEL_MAX) {
            return jsonAntwort(400, { fehler: "Telefon-Feld zu lang." }, cors);
        }
        if (nachricht.length < NACHRICHT_MIN || nachricht.length > NACHRICHT_MAX) {
            return jsonAntwort(400, { fehler: "Nachricht hat ungültige Länge." }, cors);
        }

        // 5) Resend
        const apiKey = env.RESEND_API_KEY;
        if (!apiKey) {
            console.error(`[kontakt] RESEND_API_KEY fehlt trace=${traceId}`);
            return jsonAntwort(500, { fehler: "E-Mail-Dienst nicht konfiguriert." }, cors);
        }

        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), RESEND_TIMEOUT_MS);
        let resendAntwort: Response;
        try {
            resendAntwort = await fetch(RESEND_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: ABSENDER,
                    to: [EMPFAENGER],
                    reply_to: email,
                    subject: `Neue Kontaktanfrage von ${name}`,
                    html: htmlEmail(name, email, telefon, nachricht, zeitstempel(), traceId),
                }),
                signal: ctrl.signal,
            });
        } catch (e) {
            const aborted = (e as Error)?.name === "AbortError";
            console.error(`[kontakt] resend ${aborted ? "timeout" : "network"} trace=${traceId}`);
            return jsonAntwort(504, { fehler: "E-Mail-Dienst nicht erreichbar." }, cors);
        } finally {
            clearTimeout(t);
        }

        if (!resendAntwort.ok) {
            let details: string;
            try { details = JSON.stringify(await resendAntwort.json()); }
            catch { details = await resendAntwort.text().catch(() => "(kein Body)"); }
            console.error(`[kontakt] resend rejected status=${resendAntwort.status} trace=${traceId} body=${details}`);
            return jsonAntwort(502, { fehler: "E-Mail konnte nicht gesendet werden." }, cors);
        }

        const daten = await resendAntwort.json().catch(() => ({})) as { id?: string };
        console.info(`[kontakt] sent trace=${traceId} resend_id=${daten.id ?? "?"}`);
        return jsonAntwort(200, { erfolg: true }, cors);

    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[kontakt] fatal trace=${traceId} err=${msg}`);
        return jsonAntwort(500, { fehler: "Interner Serverfehler." }, cors);
    }
};

// Catchall — alle anderen Methoden ablehnen
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
    return jsonAntwort(405, { fehler: "Methode nicht erlaubt." }, {
        ...corsHeaders(request.headers.get("Origin"), env),
        "Allow": "POST, OPTIONS",
    });
};
