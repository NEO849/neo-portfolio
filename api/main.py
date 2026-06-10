# ═══════════════════════════════════════════════════════════════════
# API: Haupt-Einstiegspunkt
# FastAPI-Anwendung mit CORS, Rate-Limiting und OSINT-Routen.
# Start: uvicorn main:app --host 0.0.0.0 --port 8000
# ═══════════════════════════════════════════════════════════════════

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from begrenzer import limiter
from routen.osint_routen import router as osint_router

# ─── App ─────────────────────────────────────────────────────────────
# /docs + /redoc nur wenn explizit erlaubt (OSINT_DOCS=1). Default AUS:
# eine passive OSINT-API muss ihr volles Schema nicht öffentlich preisgeben.
_DOCS_OEFFENTLICH = os.environ.get("OSINT_DOCS", "").lower() in ("1", "true", "yes")

app = FastAPI(
    title="Michael Fleps — OSINT-API",
    description=(
        "Öffentliche OSINT-Werkzeuge für passive Informationserhebung. "
        "Nur legale, öffentlich zugängliche Daten. "
        "Kein Login, kein aktiver Angriff, kein Scraping mit Umgehung von Schutzmechanismen."
    ),
    version="1.0.0",
    docs_url="/docs" if _DOCS_OEFFENTLICH else None,
    redoc_url="/redoc" if _DOCS_OEFFENTLICH else None,
    openapi_url="/openapi.json" if _DOCS_OEFFENTLICH else None,
)

# ─── Rate-Limit Middleware ────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ─── CORS ─────────────────────────────────────────────────────────────
# Erlaubte Origins: lokale Entwicklung + Cloudflare-Pages Production.
# (Vercel-Legacy 2026-06-10 entfernt — Frontend ist auf Cloudflare Pages
#  migriert; die spoofbare startswith-Prefix-Logik fällt damit weg.)
ERLAUBTE_ORIGINS = [
    "http://localhost:5173",                       # Vite Dev Server
    "http://localhost:3000",                       # Fallback
    "https://api.cyp-hr.com",                      # API-Domain selbst
    "https://www.f3-data-solutions.com",           # Cloudflare-Pages Production (Custom-Domain)
    "https://f3-data-solutions.com",               # Apex (301 → www, defensiv)
    "https://f3-portfolio.pages.dev",              # Cloudflare-Pages Production-Deployment
]

ERLAUBTE_ORIGIN_PRAEFIXE: list[str] = []

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
