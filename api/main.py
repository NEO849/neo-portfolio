# ═══════════════════════════════════════════════════════════════════
# API: Haupt-Einstiegspunkt
# FastAPI-Anwendung mit CORS, Rate-Limiting und OSINT-Routen.
# Start: uvicorn main:app --host 0.0.0.0 --port 8000
# ═══════════════════════════════════════════════════════════════════

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from routen.osint_routen import router as osint_router

# ─── Rate-Limit-Key: echte Client-IP statt 127.0.0.1 ─────────────────
#
# Hinter unserem Cloudflare-Tunnel (oder einem optionalen nginx davor) sieht
# slowapi sonst nur 127.0.0.1 — ein einzelner Angreifer würde damit das globale
# Rate-Limit für ALLE Nutzer aufbrauchen.
#
# Senior-Elite-Trust-Model:
#   · cf-connecting-ip wird NUR vertraut wenn cf-ray vorhanden ist
#     (cf-ray wird von Cloudflare-Edge gesetzt, nicht durchgereicht)
#   · x-forwarded-for nur wenn die App hinter unserem eigenen Reverse-Proxy
#     läuft (REVERSE_PROXY_TRUSTED env), sonst spoofbar
#   · Fallback: get_remote_address() (Direkt-Verbindung)
#
# Spoofing-Schutz: cf-ray ist nicht ratbar (Zufalls-Token), und ein direkter
# Internet-Request müsste den exakt richtigen Format-Token kennen — vertretbares
# Trust-Model für eine OSINT-API mit 60 req/min Limit.

import os

_REVERSE_PROXY_TRUSTED = os.environ.get("REVERSE_PROXY_TRUSTED", "").lower() in ("1", "true", "yes")


def echte_client_ip(request: Request) -> str:
    # 1) Cloudflare-signed: cf-connecting-ip nur wenn cf-ray präsent
    if request.headers.get("cf-ray"):
        cf_ip = request.headers.get("cf-connecting-ip")
        if cf_ip:
            return cf_ip.split(",")[0].strip()

    # 2) Eigener Reverse-Proxy (nginx etc.): nur per explizitem Opt-In
    if _REVERSE_PROXY_TRUSTED:
        xff = request.headers.get("x-forwarded-for")
        if xff:
            # Format "client, proxy1, proxy2" — Client ist links
            return xff.split(",")[0].strip()

    # 3) Direkter Internet-Hit: nimm die echte Socket-IP
    return get_remote_address(request)


# ─── Rate-Limiter ────────────────────────────────────────────────────
limiter = Limiter(key_func=echte_client_ip, default_limits=["60/minute"])

# ─── App ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Michael Fleps — OSINT-API",
    description=(
        "Öffentliche OSINT-Werkzeuge für passive Informationserhebung. "
        "Nur legale, öffentlich zugängliche Daten. "
        "Kein Login, kein aktiver Angriff, kein Scraping mit Umgehung von Schutzmechanismen."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── Rate-Limit Middleware ────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ─── CORS ─────────────────────────────────────────────────────────────
# Erlaubte Origins: lokale Entwicklung + Vercel-Deployments
ERLAUBTE_ORIGINS = [
    "http://localhost:5173",                       # Vite Dev Server
    "http://localhost:3000",                       # Fallback
    "https://michael-fleps.duckdns.org",           # API-Domain selbst (für /docs)
    "https://www.f3-data-solutions.com",           # Cloudflare-Pages Production (Custom-Domain)
    "https://f3-data-solutions.com",               # Apex (301 → www, defensiv)
    "https://f3-portfolio.pages.dev",              # Cloudflare-Pages Production-Deployment
    "https://michael-fleps.vercel.app",            # Vercel Legacy (Migration CF-Pages)
    "https://neo-portfolio.vercel.app",            # Vercel Legacy
    "https://neo-portfolio-neo849.vercel.app",     # Vercel Legacy
]

# Preview-Deployments dynamisch erlauben (Wildcard-Subdomains).
# Prefix-Match (startswith): Vercel-Preview-URLs.
ERLAUBTE_ORIGIN_PRAEFIXE = [
    "https://neo-portfolio-",   # Vercel Preview Deployments (alt)
    "https://michael-fleps-",   # Vercel Preview Deployments (neu)
]

# Suffix-Match (endswith): projekt-gebundene Cloudflare-Pages-Previews
# (z.B. https://<deploy-hash>.f3-portfolio.pages.dev). Bewusst NICHT
# ".pages.dev" allein — das würde jede fremde Pages-Site erlauben.
ERLAUBTE_ORIGIN_SUFFIXE = [
    ".f3-portfolio.pages.dev",
]

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response


class FlexibleCORSMiddleware(BaseHTTPMiddleware):
    """CORS-Middleware die auch Vercel-Preview-URLs (Wildcard-Prefix) erlaubt."""

    async def dispatch(self, request: StarletteRequest, call_next):
        origin = request.headers.get("origin", "")

        # Origin prüfen: exakte Liste, Prefix-Match oder Suffix-Match
        erlaubt = (
            origin in ERLAUBTE_ORIGINS
            or any(origin.startswith(p) for p in ERLAUBTE_ORIGIN_PRAEFIXE)
            or any(origin.endswith(s) for s in ERLAUBTE_ORIGIN_SUFFIXE)
        )

        if request.method == "OPTIONS" and erlaubt:
            # Preflight-Antwort
            return Response(
                status_code=204,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Accept",
                    "Access-Control-Max-Age": "600",
                    "Vary": "Origin",
                },
            )

        antwort = await call_next(request)

        if erlaubt:
            antwort.headers["Access-Control-Allow-Origin"] = origin
            antwort.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            antwort.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept"
            antwort.headers["Vary"] = "Origin"

        return antwort


app.add_middleware(FlexibleCORSMiddleware)


# ─── Security-Header-Middleware ───────────────────────────────────────
# Wird immer angewendet, unabhängig vom Reverse-Proxy. Senior-Elite-Default,
# damit Cloudflare-Tunnel (kein nginx davor) und nginx-Setup gleich gehärtet sind.
class SicherheitsHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        antwort = await call_next(request)
        antwort.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains",
        )
        antwort.headers.setdefault("X-Content-Type-Options", "nosniff")
        antwort.headers.setdefault("X-Frame-Options", "DENY")
        antwort.headers.setdefault(
            "Referrer-Policy", "strict-origin-when-cross-origin"
        )
        antwort.headers.setdefault(
            "Permissions-Policy", "geolocation=(), microphone=(), camera=()"
        )
        # API liefert nur JSON — strikte CSP gegen MIME-Confusion-Angriffe
        antwort.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'none'; frame-ancestors 'none'",
        )
        # Server-Identität verstecken (kein FastAPI/uvicorn-Banner)
        antwort.headers["Server"] = "OSINT-API"
        return antwort


app.add_middleware(SicherheitsHeaderMiddleware)

# ─── Routen ──────────────────────────────────────────────────────────
app.include_router(osint_router, prefix="/api/v1")


# ─── Root-Endpunkt ────────────────────────────────────────────────────
@app.get("/", tags=["Status"])
async def wurzel():
    return {
        "api": "Michael Fleps OSINT-API",
        "version": "1.0.0",
        "dokumentation": "/docs",
        "endpunkte": {
            "domain":       "POST /api/v1/osint/domain",
            "email":        "POST /api/v1/osint/email",
            "benutzername": "POST /api/v1/osint/benutzername",
            "gesundheit":   "GET  /api/v1/osint/gesundheit",
        },
        "hinweis": "Nur passive, legale OSINT-Analyse öffentlich verfügbarer Daten.",
    }


@app.get("/gesundheit", tags=["Status"])
async def gesundheit():
    """Liveness-Check für systemd / Monitoring."""
    return {"status": "ok"}
