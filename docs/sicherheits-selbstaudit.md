# Sicherheits-Selbst-Audit — FREE DATA Solutions Portfolio

> Karte 4.4 (Secure by Design) · Pflicht-Prüfliste vor „fertig".
> Stand: 2026-06-03 · Geprüft gegen **OWASP Top 10 (2021)**.
> Geltung: `www.f3-data-solutions.com` (Cloudflare Pages, React/Vite SPA + eine
> Pages-Function `functions/api/kontakt.ts`). Backend-OSINT-API liegt außerhalb
> dieses Repos und ist nicht Teil dieses Audits.

Kalibrierung (GRUNDREGEL-5): Ein ✅ heißt „Kontrolle vorhanden und belegt", kein
„unknackbar". Rest-Risiken sind unten offen benannt.

---

## OWASP-Top-10-Prüfliste

| # | Risiko | Status | Beleg / Begründung |
|---|--------|--------|--------------------|
| A01 | Broken Access Control | ✅ | Reine Marketing-SPA ohne Login/Session/Nutzerdaten. Einziger serverseitiger Endpunkt `/api/kontakt` ist zustandslos, nur `POST`/`OPTIONS` (alles andere → 405 mit `Allow`). Keine Objekt-IDs, keine Privilegienebenen. |
| A02 | Cryptographic Failures | ✅ | Ausschließlich TLS (Cloudflare-managed). `HSTS max-age=1y; includeSubDomains; preload`. `upgrade-insecure-requests` in der CSP. Keine Geheimnisse im Client-Bundle (Secrets nur als Pages-ENV, `.env*` ist gitignored). |
| A03 | Injection | ✅ | React escaped JSX-Output by default; **kein** `dangerouslySetInnerHTML` im aktiven Code. Function interpoliert keine Eingabe in Befehle/Queries — Nutzereingaben gehen nur als JSON-Felder an Resend. Eingabe-Validierung als Allowlist an der Grenze (`hilfsmittel/validierung.ts`, Längen-/Format-Limits in der Function). |
| A04 | Insecure Design | ✅ | MCVM-Schichtung mit einseitiger Abhängigkeit (`View→ViewModel→Dienste→Model`). Typisiertes Fehler-Management (`Apifehler`, `FehlerArt`) mit Retry/Backoff/Timeout. Honeypot-Feld (`website`) + Body-Size-Cap als Missbrauchs-Design. |
| A05 | Security Misconfiguration | ✅ | 9 Härtungs-Header live (`securityheaders.com A+`): strikte CSP, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, restriktive `Permissions-Policy`, COOP/CORP `same-origin`, `Server`-Header entfernt. `/api/*` → `no-store` + `noindex`. |
| A06 | Vulnerable & Outdated Components | ⚠️ | Schlanker Stack, Versionen im Lockfile fixiert (React 19, Vite, framer-motion, react-helmet-async). **Rest-Risiko:** kein automatisierter `npm audit`/Dependabot im CI — siehe Empfehlung unten. |
| A07 | Identification & Authentication Failures | ✅ | Nicht anwendbar — keine Authentifizierung, keine Sessions, keine Cookies (kein `localStorage` für Geheimnisse). |
| A08 | Software & Data Integrity Failures | ✅ | Build-Assets mit Hash-Dateinamen + `immutable`-Cache. Deploy nur über GitHub-Actions-Pipeline (Typecheck→Build→Wrangler) von `main`. Keine ungeprüften dynamischen Script-Quellen (`script-src 'self'`). |
| A09 | Security Logging & Monitoring Failures | ⚠️ | Function loggt mit `crypto.randomUUID()`-Trace-IDs (Audit-Korrelation, im E-Mail-Footer). **Rest-Risiko:** keine zentrale Alarmierung/Aggregation — für eine statische Portfolio-Seite akzeptiert. |
| A10 | Server-Side Request Forgery (SSRF) | ✅ | Function ruft genau eine fest verdrahtete URL (`api.resend.com`) — keine nutzergesteuerten Ziel-URLs. Kein serverseitiges Nachladen aus Eingaben. |

**Ergebnis:** 8 × ✅, 2 × ⚠️ (Rest-Risiken bewusst akzeptiert, keine offene Lücke).

---

## Function-Härtung im Detail (`functions/api/kontakt.ts`)

1. **Strikte CORS-Allowlist** — kein `*`, Ursprung gegen `ALLOWED_ORIGINS`-ENV geprüft.
2. **Honeypot** `website` — gefüllt ⇒ 200 ohne Resend-Call (Bot belogen, Quota geschützt).
3. **Body-Size-Cap** 10 KB — DoS-Schutz.
4. **Längen-Limits** — Name 1–100, E-Mail ≤254, Tel ≤40, Nachricht 10–5000.
5. **Strikte E-Mail-Regex** statt `.*@.*`.
6. **8 s Resend-Timeout** via `AbortController` — kein Function-Hang.
7. **Methoden-Whitelist** — nur `POST`/`OPTIONS`, sonst 405.
8. **Trace-IDs** via `crypto.randomUUID()` — keine sensiblen Details in Logs/Meldungen.

## Client-/Build-Hygiene

- **0× `any`** im gesamten `src/` (geprüft).
- **0 verschluckte Fehler ohne Absicht** — die wenigen leeren `catch` sind
  kommentiert (Non-JSON-Body, `navigator.share`-Fallback).
- **Secrets:** `.env*` gitignored; im Repo keine Schlüssel.
- **CSP-Rest-Relaxierung (bewusst):** `style-src 'unsafe-inline'` nur für Styles
  (für Google-Fonts/Framer-inline nötig); `script-src` bleibt strikt `'self'`,
  also kein Inline-/eval-JS — der für XSS gefährliche Vektor ist zu.

---

## Empfehlungen (offen, nicht blockierend)

- [ ] `npm audit --production` als CI-Schritt + Dependabot aktivieren (A06).
- [ ] Branch-Protection für `main` (Status-Checks müssen grün sein).
- [ ] DNSSEC für `f3-data-solutions.com` aktivieren.
- [ ] CSP weiter verschärfen, falls Google-Fonts lokal gehostet werden
      (dann `style-src 'unsafe-inline'` entfernbar).

---

## Belege reproduzieren

```bash
# A+ Header live
curl -sI https://www.f3-data-solutions.com/

# Function-CORS + Methoden-Whitelist
curl -X OPTIONS https://www.f3-data-solutions.com/api/kontakt \
  -H "Origin: https://www.f3-data-solutions.com" -I

# Lokal: kein any, Tests grün
cd /root/web-projekte/neo-portfolio
grep -rn ": any\|as any" src --include='*.ts' --include='*.tsx' | grep -v vite-env
npx tsc --noEmit && npx vitest run
```
